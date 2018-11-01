from rest_framework import viewsets
from rest_framework.response import Response
from notifications.tasks import alert
from django.conf import settings
from .notifications_serializer import MessageCreateSerializer, ChatCreateSerializer, ChatUpdateSerializer, \
    ChatGetSerializer, MessageGetSerializer, MessageUpdateSerializer, ChatCheckSerializer, MessageIsDeleteSerializer, \
    ChatIsDeleteSerializer, MessageNotificationSerializer
from api.v1.permissions import MessagePermission, ChatPermission
from notifications.models import Chat, Message, MessageIsDelete, ChatIsDelete
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from django.db.models import Count
from notifications.utils import send_ws_group_message, send_ws_message
from accounts.utils import get_patients_cache
from accounts.models import Doctor


class MessagePaginator(PageNumberPagination):
    page_size = 10


class MessageViewSet(viewsets.ModelViewSet):
    """
    ## Create New Message

    URL: `/api/v1/message/`

    Method: `POST`

    Required Fields:

    * `doctor_receivers` (list) with int doctor id
    * `message`(str)


    Optional Fields:

    * `patient` (int)
    * `urgency` (int) 1 - 'Immediate', 2 - '30 minutes', 3 - '1hr', 4 - '2hr', 5 - 'FYI - No Alert'. Default 5
    ---

    ## Update Not Allowed

    ## Delete (disable) Message

    URL: `/api/v1/message/:id`

    Method: `DELETE`
    ---

    """
    permission_classes = (MessagePermission,)
    queryset = Message.objects.all()
    pagination_class = MessagePaginator
    ordering = '-created_at'

    def get_queryset(self):
        return Message.objects.exclude(messageisdelete__doctor=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return MessageCreateSerializer
        elif self.action == 'partial_update':
            return MessageUpdateSerializer
        else:
            return MessageGetSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        participants = serializer.validated_data['chat'].participants.exclude(remote_id=request.user.remote_id)
        ChatIsDelete.objects.filter(doctor__in=participants, chat=serializer.validated_data['chat']).delete()
        return super(MessageViewSet, self).create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
        for doc in serializer.validated_data['chat'].participants.exclude(remote_id=self.request.user.remote_id):
            if serializer.data['urgency'] == 1:
                alert.apply_async(kwargs={'doctor': doc.pk,
                                          'message_id': serializer.instance.id})
            elif serializer.data['urgency'] == 2:
                alert.apply_async(kwargs={'doctor': doc.pk,
                                          'message_id': serializer.instance.id},
                                  countdown=settings.THIRTY_MINUTES)
            elif serializer.data['urgency'] == 3:
                alert.apply_async(kwargs={'doctor': doc.pk,
                                          'message_id': serializer.instance.id},
                                  countdown=settings.ONE_HOUR)
            elif serializer.data['urgency'] == 4:
                alert.apply_async(kwargs={'doctor': doc.pk,
                                          'message_id': serializer.instance.id},
                                  countdown=settings.TWO_HOUR)
        for doc_id in serializer.instance.chat.recipient_id_list:
            send_ws_message(1, MessageNotificationSerializer(instance=serializer.instance, context={
                'user': Doctor.objects.get(id=doc_id)}).data,
                                  doc_id)

    def destroy(self, request, *args, **kwargs):
        serializer = MessageIsDeleteSerializer(data={'message': self.get_object().id, 'doctor': request.user.remote_id})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response('message was deleted', status=status.HTTP_200_OK)

    def perform_update(self, serializer):
        serializer.save(is_edit=True)
        send_ws_group_message(2, MessageGetSerializer(instance=serializer.instance,
                                                      context={'request': self.request}).data,
                              serializer.instance.chat.recipient_id_list)

    def list(self, request, *args, **kwargs):
        check_serializer = ChatCheckSerializer(data=request.query_params)
        check_serializer.is_valid(raise_exception=True)
        self.queryset = self.queryset.filter(chat=check_serializer.validated_data['chat'])
        return super(MessageViewSet, self).list(request, *args, **kwargs)

    def get_paginated_response(self, data):
        return Response({
            'page': self.request.query_params.get('page', 1),
            'results': data,
            'num_pages': self.paginator.page.paginator.num_pages
        })

    def filter_queryset(self, queryset):
        if self.action == 'retrieve':
            return queryset
        check_serializer = ChatCheckSerializer(data=self.request.query_params)
        if check_serializer.is_valid(raise_exception=True):
            self.queryset.filter(chat=check_serializer.validated_data['chat'])
            for message in self.queryset.filter(chat=check_serializer.validated_data['chat']):
                if message.sender != self.request.user:
                    message.is_read = True
                    message.save()
        return self.queryset.filter(chat=check_serializer.validated_data['chat'])


class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    permission_classes = (ChatPermission,)

    def get_queryset(self):
        queryset = Chat.objects.filter(participants__remote_id=self.request.user.remote_id).exclude(
            chatisdelete__doctor=self.request.user)
        search_text = self.request.query_params.get('search_text')
        if search_text:
            queryset = queryset.filter(message__text__icontains=search_text).distinct()
        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return ChatCreateSerializer
        elif self.action == 'partial_update':
            return ChatUpdateSerializer
        else:
            return ChatGetSerializer

    def create(self, request, *args, **kwargs):
        if 'participants' in request.data:
            request.data['participants'].append(request.user.remote_id)
            request.data['participants'] = list(set(request.data['participants']))
        request.data['creator'] = request.user.remote_id
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        check_to_exists = Chat.objects.filter(
            participants__in=serializer.validated_data.get('participants')).distinct().annotate(
            par_len=Count('participants')) \
            .filter(par_len=len(serializer.validated_data.get('participants'))).filter(
            patient=serializer.validated_data.get('patient')).filter(title=serializer.validated_data.get('title', ''))
        if check_to_exists:
            ChatIsDelete.objects.filter(doctor=request.user, chat=check_to_exists.first()).delete()
            return Response(self.get_serializer(check_to_exists.first()).data)
        return super(ChatViewSet, self).create(request, *args, **kwargs)

    def perform_create(self, serializer):
        patient_data = get_patients_cache(hospital=serializer.validated_data.get('patient').hospital).get(
            'patients', {}).get(
            serializer.validated_data.get('patient').remote_id) if 'patient' in serializer.validated_data else None
        saved_data = {
            'creator': self.request.user,
            'patient_name': patient_data.get('first_name', '') + ' ' + patient_data.get('last_name',
                                                                                        '') if 'patient' in serializer.validated_data else None
        }
        serializer.save(**saved_data)
        send_ws_group_message(4, ChatGetSerializer(instance=serializer.instance).data,
                              serializer.instance.recipient_id_list)

    def update(self, request, *args, **kwargs):
        obj = self.get_object()
        serializer_class = self.get_serializer_class()
        serializer = serializer_class(data=request.data,
                                      context={'patient': obj.patient, 'title': obj.title,
                                               'participants': obj.participants.all()})
        serializer.is_valid(raise_exception=True)
        return super(ChatViewSet, self).update(request, *args, **kwargs)

    def perform_update(self, serializer):
        patient_data = get_patients_cache(hospital=serializer.validated_data.get('patient').hospital).get(
            'patients', {}).get(serializer.validated_data.get('patient').remote_id)
        saved_data = {
            'patient_name': patient_data.get('first_name', '') + ' ' + patient_data.get('last_name',
                                                                                        '') if 'patient' in serializer.validated_data else None
        }
        if serializer.validated_data.get('patient') and self.get_object().title:
            saved_data['title'] = None
        serializer.save(**saved_data)
        send_ws_group_message(5, ChatGetSerializer(instance=serializer.instance).data,
                              serializer.instance.recipient_id_list)

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        unread_messages = obj.message_set.filter(is_read=False).exclude(sender=request.user)
        [message.set_is_read() for message in unread_messages]
        return super(ChatViewSet, self).retrieve(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        doctor = request.user
        messages = self.get_object().message_set.exclude(messageisdelete__doctor=self.request.user)
        MessageIsDelete.objects.bulk_create([MessageIsDelete(message=message, doctor=doctor) for message in messages])
        serializer = ChatIsDeleteSerializer(data={'chat': self.get_object().id, 'doctor': request.user.remote_id})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response('chat was deleted', status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        return super(ChatViewSet, self).list(request, *args, **kwargs)

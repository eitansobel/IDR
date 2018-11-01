from rest_framework import serializers

from accounts.models import Doctor, Patient
from notifications.models import Chat, Message, MessageIsDelete, ChatIsDelete
from django.db.models import Count
from notifications.utils import get_display_data_chat, get_display_data_message, get_display_data_wc_message


class MessageGetSerializer(serializers.ModelSerializer):
    sender = serializers.SlugRelatedField(queryset=Doctor.objects.all(), slug_field='remote_id')
    display_data = serializers.SerializerMethodField()
    chat = serializers.PrimaryKeyRelatedField(queryset=Chat.objects.all(), required=True)
    created_at = serializers.DateTimeField(format='iso-8601', read_only=True)

    class Meta:
        model = Message
        fields = (
            'text', 'attachment', 'urgency', 'sender', 'is_read', 'is_edit', 'created_at', 'id', 'display_data', 'chat')

    def get_display_data(self, message):
        request = self.context.get('request')
        if request:
            return get_display_data_message(request=request, message=message)
        return {"full_name": "", "full_photo": ""}


class MessageNotificationSerializer(MessageGetSerializer):
    chat_history = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = (
            'text', 'attachment', 'urgency', 'sender', 'is_read', 'is_edit', 'created_at', 'id', 'display_data',
            'chat', 'chat_history')

    def get_chat_history(self, message):
        doctor = self.context.get('user')
        return message.chat.get_unread_messages(doctor=doctor) if doctor else None

    def get_display_data(self, message):
        user = self.context.get('user')
        return get_display_data_wc_message(user=user, message=message) if user else {"full_name": "", "full_photo": ""}


class MessageCreateSerializer(MessageGetSerializer):
    sender = serializers.SlugRelatedField(slug_field='remote_id', read_only=True)

    def validate(self, attrs):
        if not attrs.get('text') and not attrs.get('attachment'):
            raise serializers.ValidationError('text or attachment must be in the message')
        if self.context.get('request').user not in attrs['chat'].participants.all():
            raise serializers.ValidationError("you don't have permissions to create new message in this chat")
        return super(MessageCreateSerializer, self).validate(attrs)


class MessageUpdateSerializer(serializers.ModelSerializer):
    text = serializers.CharField(required=True)

    class Meta:
        model = Message
        fields = ('text', 'id')

    def validate(self, attrs):
        if not attrs.get('text'):
            raise serializers.ValidationError('text must be in the message')
        return attrs


class ChatUpdateSerializer(serializers.ModelSerializer):
    patient = serializers.SlugRelatedField(queryset=Patient.objects.all(), slug_field='remote_id', required=False)

    class Meta:
        model = Chat
        fields = ('title', 'patient')

    def validate(self, attrs):
        patient = self.context.get('patient')
        participants = self.context.get('participants')
        if patient:
            raise serializers.ValidationError('You cannot change chat with exists patient')
        if participants:
            chats_with_the_same_participants = Chat.objects.filter(participants__in=participants, ).distinct().annotate(
                par_len=Count('participants')).filter(par_len=len(participants))
            if attrs.get('title'):
                chats_with_the_same_participants = chats_with_the_same_participants.filter(title=attrs.get('title'))
            if attrs.get('patient'):
                chats_with_the_same_participants = chats_with_the_same_participants.filter(patient=attrs.get('patient'))
            if chats_with_the_same_participants:
                raise serializers.ValidationError('This chat already exist')
        return attrs


class ChatGetSerializer(serializers.ModelSerializer):
    participants = serializers.SlugRelatedField(many=True, queryset=Doctor.objects.all(), slug_field='remote_id')
    history = serializers.SerializerMethodField()
    display_data = serializers.SerializerMethodField()
    patient = serializers.SlugRelatedField(slug_field='remote_id', queryset=Patient.objects.all())
    patient_name = serializers.CharField(read_only=True)

    def get_history(self, chat):
        return chat.get_unread_messages(doctor=self.context.get('request').user) if self.context.get(
            'request') else None

    def get_display_data(self, chat):
        request = self.context.get('request')
        if request:
            return get_display_data_chat(request, chat)
        return {"full_name": "", "full_photo": ""}

    class Meta:
        model = Chat
        fields = ('participants', 'patient', 'title', 'id', 'history', 'display_data', 'patient_name')


class ChatCreateSerializer(ChatGetSerializer):
    patient = serializers.SlugRelatedField(queryset=Patient.objects.all(), allow_null=True, required=False,
                                           slug_field='remote_id')

    def validate(self, attrs):
        if len(attrs['participants']) != 2:
            raise serializers.ValidationError('Please add just one doctor to chat')
        if attrs.get('title') and attrs.get('patient'):
            raise serializers.ValidationError('Fill in both fields (title, patient) is declined')
        return super(ChatCreateSerializer, self).validate(attrs)


class ChatCheckSerializer(serializers.Serializer):
    page = serializers.IntegerField(required=True)
    chat = serializers.PrimaryKeyRelatedField(queryset=Chat.objects.all(), required=True)

    class Meta:
        fields = ('chat', 'page')


class MessageIsDeleteSerializer(serializers.ModelSerializer):
    doctor = serializers.SlugRelatedField(queryset=Doctor.objects.all(), slug_field='remote_id')
    message = serializers.PrimaryKeyRelatedField(queryset=Message.objects.all())

    class Meta:
        model = MessageIsDelete
        fields = ('message', 'doctor')

    def validate(self, attrs):
        try:
            MessageIsDelete.objects.get(message=attrs.get('message'), doctor=attrs.get('doctor'))
        except MessageIsDelete.DoesNotExist:
            return super(MessageIsDeleteSerializer, self).validate(attrs)
        else:
            raise serializers.ValidationError('the message is already deleted')


class ChatIsDeleteSerializer(serializers.ModelSerializer):
    doctor = serializers.SlugRelatedField(queryset=Doctor.objects.all(), slug_field='remote_id')
    chat = serializers.PrimaryKeyRelatedField(queryset=Chat.objects.all())

    class Meta:
        model = ChatIsDelete
        fields = ('chat', 'doctor')

    def validate(self, attrs):
        try:
            ChatIsDelete.objects.get(chat=attrs.get('chat'), doctor=attrs.get('doctor'))
        except ChatIsDelete.DoesNotExist:
            return super(ChatIsDeleteSerializer, self).validate(attrs)
        else:
            raise serializers.ValidationError('the message is already deleted')

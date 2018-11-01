from django.utils.translation import ugettext_lazy as _
from rest_framework import serializers, permissions
from rest_framework.validators import UniqueTogetherValidator, UniqueValidator

from home.models import DoctorHomeColumn, DoctorHomeCell, DoctorHomeCellField
from accounts.models import Patient, Doctor
from notifications.models import Chat
from api.v1.utils import FilterIsDeletedListSerializer


class DoctorHomeColumnSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    is_hidden = serializers.SerializerMethodField()
    order = serializers.SerializerMethodField()
    authors_in_group = serializers.SerializerMethodField()

    class Meta:
        model = DoctorHomeColumn
        fields = ('id', 'title', 'author', 'update_interval', 'group_id', 'is_hidden', 'order', 'authors_in_group')
        read_only_fields = ('id', 'author', 'group_id')

    def get_author(self, obj):
        return {"full_name": self.context.get(
            "doctor_data_from_cache", {}).get(obj.author.remote_id, {}).get('full_name', ''),
                "job": obj.author.title,
                "id": obj.author.remote_id}

    def get_is_hidden(self, obj):
        return obj in self.context.get('request').user.hidden_doctor_home_column_list.all()

    def get_order(self, obj):
        return self.context.get("doctor_column_orders", {}).get(obj.id)

    def get_authors_in_group(self, obj):
        return self.context.get("column_group_map", {}).get(obj.group_id, [obj.author.remote_id])


class DoctorHomeColumnUpdateSerializer(DoctorHomeColumnSerializer):
    title = serializers.CharField(required=False)

    class Meta:
        model = DoctorHomeColumn
        fields = ('id', 'title', 'author', 'update_interval', 'group_id', 'is_hidden', 'order', 'authors_in_group')
        read_only_fields = ('id', 'author', 'group_id')


class DoctorHomeCellFieldSerializer(serializers.ModelSerializer):
    author = serializers.SlugRelatedField(slug_field='remote_id', read_only=True)

    class Meta:
        model = DoctorHomeCellField
        list_serializer_class = FilterIsDeletedListSerializer
        fields = ('id', 'title', 'author', 'value', 'cell', 'is_deleted')
        read_only_fields = ('id', 'author', 'cell')


class NotSafeDoctorHomeCellFieldSerializer(DoctorHomeCellFieldSerializer):
    id = serializers.IntegerField(required=False, allow_null=True)
    author = serializers.SlugRelatedField(slug_field='remote_id', queryset=Doctor.objects.filter(is_active=True),
                                          required=False, allow_null=True)

    class Meta:
        model = DoctorHomeCellField
        list_serializer_class = FilterIsDeletedListSerializer
        fields = ('id', 'title', 'author', 'value', 'cell', 'is_deleted')
        read_only_fields = ('cell',)


class DoctorHomeCellSerializer(serializers.ModelSerializer):
    fields = DoctorHomeCellFieldSerializer(many=True)
    author = serializers.SlugRelatedField(slug_field='remote_id', read_only=True)
    patient = serializers.SlugRelatedField(slug_field='remote_id', queryset=Patient.objects.all())

    class Meta:
        model = DoctorHomeCell
        fields = ('id', 'title', 'author', 'patient', 'is_private', 'column_group_id', 'update_interval', 'last_update',
                  'fields')
        read_only_fields = ('id', 'author', 'last_update')

    def validate(self, attrs):
        # TODO revrite on personal validation "validate_column_group_id" and make universal serializer
        if not DoctorHomeColumn.objects.filter(
                is_deleted=False,
                author__hospital=self.context.get('request').user.hospital,
                group_id=attrs.get('column_group_id')
        ).exists():
            raise serializers.ValidationError('Column group does not exist')

        filter = {
            "is_deleted": False,
            "author__hospital": self.context.get('request').user.hospital,
            "patient": attrs.get('patient'),
            "column_group_id": attrs.get('column_group_id')
        }
        if DoctorHomeCell.objects.filter(**filter).exists():
            raise serializers.ValidationError('This relation already exists')
        return attrs

    def create(self, validated_data):
        fields = validated_data.pop('fields', [])
        serializer = DoctorHomeCellFieldSerializer(data=fields, many=True)
        serializer.is_valid(raise_exception=True)
        user = self.context.get('request').user
        cell = DoctorHomeCell.objects.create(**validated_data)
        DoctorHomeCellField.objects.bulk_create(
            [DoctorHomeCellField(**x, author=user, cell=cell) for x in serializer.data])
        return cell


class UpdateDoctorHomeCellSerializer(serializers.ModelSerializer):
    fields = NotSafeDoctorHomeCellFieldSerializer(many=True)
    author = serializers.SlugRelatedField(slug_field='remote_id', read_only=True)
    patient = serializers.SlugRelatedField(slug_field='remote_id', read_only=True)

    class Meta:
        model = DoctorHomeCell
        fields = ('id', 'title', 'author', 'patient', 'is_private', 'column_group_id', 'update_interval', 'last_update',
                  'fields')
        read_only_fields = ('id', 'author', 'patient', 'column_group_id', 'last_update')

    def update(self, instance, validated_data):
        fields = validated_data.pop('fields', [])
        serializer = DoctorHomeCellFieldSerializer(data=fields, many=True)
        serializer.is_valid(raise_exception=True)
        user = self.context.get('request').user
        for field in fields:
            author = field.get("author")
            field_id = field.get('id')
            if not author or author == user or (user.edit_data_cell_permission or user.is_admin and
                    author.hospital == user.hospital):
                data_to_update = {
                    'value': field.get('value'),
                    'is_deleted': field.get('is_deleted')
                }
                if not author or not field_id:
                    data_to_update['author'] = user
                    data_to_update['title'] = field.get('title')
                    data_to_update['cell'] = instance
                DoctorHomeCellField.objects.update_or_create(id=field_id, defaults=data_to_update)
        return super(UpdateDoctorHomeCellSerializer, self).update(instance, validated_data)


class NestedDoctorHomeCellSerializer(DoctorHomeCellSerializer):
    chat = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DoctorHomeCell
        fields = ('id', 'title', 'author', 'patient', 'is_private', 'column_group_id', 'update_interval',
                  'last_update', 'fields', 'chat')
        read_only_fields = ('id', 'author', 'last_update')

    def get_chat(self, doctor_home_cell):
        if self.context.get('user') and self.context.get('column_author'):
            chat = Chat.objects.filter(participants__in=[self.context.get('user')],
                                       patient=doctor_home_cell.patient).filter(
                participants__in=[self.context.get('column_author')]).exclude(
                chatisdelete__doctor=self.context.get('user')).first()
            if chat:
                data = chat.get_unread_messages(doctor=self.context.get('user'))
                data['id'] = chat.id
                return data
        return None


class NestedDoctorHomeColumnSerializer(DoctorHomeColumnSerializer):
    cells = serializers.SerializerMethodField()

    class Meta:
        model = DoctorHomeColumn
        fields = ('id', 'title', 'author', 'update_interval', 'group_id', 'is_hidden', 'cells', 'order',
                  'authors_in_group')
        read_only_fields = ('id', 'author', 'group_id')
        depth = 3

    def get_cells(self, column):
        return NestedDoctorHomeCellSerializer(
            self.context.get('clinic_column_cells_queryset').filter(column_group_id=column.group_id), many=True,
            context={'user': self.context.get('request').user, 'column_author': column.author}).data


class DoctorHomeColumnOrderSerializer(serializers.Serializer):
    order = serializers.IntegerField(required=True)
    column_id = serializers.IntegerField(required=True)
    doctor = serializers.SerializerMethodField()

    def get_doctor(self, obj):
        return self.context.get('user')

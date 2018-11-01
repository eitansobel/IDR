from rest_framework import serializers
from django.db.models import Q


class FilterIsDeletedListSerializer(serializers.ListSerializer):

    def to_representation(self, data):
        user = self.context.get('user')
        if not isinstance(data, list):
            data = data.filter(is_deleted=False)
            if not self.context.get('show_locked_fields'):
                data = data.exclude(Q(cell__is_private=True) & ~Q(cell__author=user))
        return super(FilterIsDeletedListSerializer, self).to_representation(data)
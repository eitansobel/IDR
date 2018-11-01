from django.contrib import admin

from notifications.models import NotificationTemplate, Chat, Message


class ChatAdmin(admin.ModelAdmin):
    class Meta:
        model = Chat


class MessageAdmin(admin.ModelAdmin):
    class Meta:
        model = Message


admin.site.register(Message, MessageAdmin)
admin.site.register(Chat, ChatAdmin)
admin.site.register(NotificationTemplate)

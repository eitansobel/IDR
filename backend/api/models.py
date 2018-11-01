from django.db import models

from accounts.models import Doctor


class Token(models.Model):
    key = models.CharField(max_length=40, primary_key=True)
    user = models.ForeignKey(Doctor, related_name='auth_token', blank=True, null=True,
                             on_delete=models.SET_NULL,)
    created = models.DateTimeField(auto_now_add=True)
    expires = models.DateTimeField()

    def __str__(self):
        return self.key

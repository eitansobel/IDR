from __future__ import absolute_import, unicode_literals
from celery import shared_task

from accounts.utils import refresh_doctors_cache
from accounts.models import Hospital

@shared_task
def async_refresh_doctors_cache(hospital_id):
    refresh_doctors_cache(Hospital.objects.get(pk=hospital_id))
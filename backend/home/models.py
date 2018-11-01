from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.utils.translation import ugettext_lazy as _
from accounts.models import Doctor, Patient

CELL_UPDATE_CHOICES = (
    (1, _('15min')),
    (2, _('30min')),
    (3, _('45min')),
    (4, _('1hr')),
    (5, _('2hrs')),
    (6, _('3hrs')),
    (7, _('4hrs')),
    (8, _('5hrs')),
    (9, _('6hrs')),
    (10, _('7hrs')),
    (11, _('8hrs')),
    (12, _('9hrs')),
    (13, _('10hrs')),
    (14, _('11hrs')),
    (15, _('12hrs')),
    (16, _('Daily')),
    (17, _('PRN')),
    (18, _('Never Alert'))
)


class SoftDeleteObject(models.Model):
    author = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    title = models.CharField(_('title'), max_length=50)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        abstract = True

    def __str__(self):
        return self.title


class DoctorHomeColumn(SoftDeleteObject):
    update_interval = models.PositiveIntegerField(choices=CELL_UPDATE_CHOICES, default=18)
    group_id = models.PositiveIntegerField()

    class Meta:
        ordering = ['group_id', 'id']

    def save(self, *args, **kwargs):
        if not self.id and not self.generate_new_group_number:
            self.group = self.generate_new_group_number()
        super(DoctorHomeColumn, self).save(*args, **kwargs)

    @staticmethod
    def generate_new_group_number():
        last_group = DoctorHomeColumn.objects.order_by('id').last()
        return last_group.id + 1 if last_group else 1



class DoctorHomeColumnOrder(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    column = models.ForeignKey(DoctorHomeColumn, on_delete=models.CASCADE)
    order = models.PositiveIntegerField()

    class Meta:
        unique_together = ('doctor', 'column')


class DoctorHomeCell(SoftDeleteObject):
    update_interval = models.PositiveIntegerField(choices=CELL_UPDATE_CHOICES, null=True, blank=True)
    column_group_id = models.PositiveIntegerField()
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    is_private = models.BooleanField(default=False)
    last_update = models.DateTimeField(auto_now=True)


class DoctorHomeCellField(SoftDeleteObject):
    value = models.TextField(_('value'), max_length=5000)
    cell = models.ForeignKey(DoctorHomeCell, on_delete=models.CASCADE, related_name='fields')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at', 'id']


@receiver(pre_save, sender=DoctorHomeColumn)
def create_group(sender, instance, *args, **kwargs):
    if instance.group_id is None:
        instance.group_id = instance.generate_new_group_number()

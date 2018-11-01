from django.contrib import admin

from home.models import DoctorHomeColumn, DoctorHomeCell, DoctorHomeCellField


admin.site.register(DoctorHomeColumn)
admin.site.register(DoctorHomeCell)
admin.site.register(DoctorHomeCellField)

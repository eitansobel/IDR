from django.db.models import Q
from rest_framework.response import Response
from rest_framework import viewsets, status
from api.decorators import viewset_permissions
from rest_framework.decorators import action

from home.models import DoctorHomeColumn, DoctorHomeCell, DoctorHomeColumnOrder
from api.v1.permissions import DoctorPermission, ManageHomeDataPermission, EditHomeCellPermission, ExportPermission, \
    LockPermission, CreateColumnPermission, HospitalAdminPermission
from api.v1.home_serializer import DoctorHomeColumnSerializer, NestedDoctorHomeColumnSerializer, \
    UpdateDoctorHomeCellSerializer, DoctorHomeCellSerializer, DoctorHomeColumnOrderSerializer, \
    DoctorHomeColumnUpdateSerializer
from accounts.models import Patient, Doctor
from notifications.utils import send_ws_clinic_message
from accounts.utils import get_doctors_cache


class DoctorHomeColumnViewSet(viewsets.ModelViewSet):
    """
        ## Get Single Column

        URL: /api/v1/homecolumn/:id/

        Method: `GET`

        ---
        ## Get All Columns

        URL: /api/v1/homecolumn/

        Method: `GET`

        ---
        ## Get All Columns With Nested Records For Home Page

        URL: /api/v1/homecolumn/?nested=1

        Method: `GET`

        ---
        ## Create New Column

        URL: `/api/v1/homecolumn/`

        Method: `POST`

        Required Fields:

        * `title` (str)

        Optional Fields:

        * `is_hidden` (bool). Hide/Show current column.

        * `update_interval` (int)  1 - 15min, 2 - 30min, 3 - 45min, 4 - 1hr, 5 - 2hrs, 6 - 3hrs, 7 - 4hrs, 8 - 5hrs,
        9 - 6hrs, 10 - 7hrs, 11 - 8hrs, 12 - 9hrs, 13 - 10hrs, 14 - 11hrs, 15 - 12hrs, 16 - Daily, 17 - PRN,
        18 - Never Alert. By default 18.

        ---
        ## Copy Column

        URL: `/api/v1/homecolumn/:id/copy_column/`

        Method: `POST`

        ---
        ## Update Column

        URL: `/api/v1/homecolumn/:id/`

        Method: `PATCH`

        Optional Fields:

        * `title` (str)

        * `is_hidden` (bool). Hide/Show current column.

        * `update_interval` (int)  1 - 15min, 2 - 30min, 3 - 45min, 4 - 1hr, 5 - 2hrs, 6 - 3hrs, 7 - 4hrs, 8 - 5hrs,
        9 - 6hrs, 10 - 7hrs, 11 - 8hrs, 12 - 9hrs, 13 - 10hrs, 14 - 11hrs, 15 - 12hrs, 16 - Daily, 17 - PRN,
        18 - Never Alert. By default 18.

        ---
        ## Set Columns Ordering

        URL: `/api/v1/homecolumn/set_order/`

        Method: `POST`

        Required Fields:

        * `order_list` (List) [{"column": :id, "order": number}, ...]
        Example of order exchanging between two columns: [{"column": 1, "order: 2}, {"column": 2, "order: 1}]

        ---
        ## Toggle Column

        URL: `/api/v1/homecolumn/:id/toggle_column/`

        Method: `POST`

        Required Fields:

        * `is_hidden` (bool). Hide/Show current column.

        ---
        ## Delete (disable) Column

        URL: `/api/v1/homecolumn/:id/`

        Method: `DELETE`

        ---
    """

    model = DoctorHomeColumn
    queryset = DoctorHomeColumn.objects.filter(is_deleted=False)
    permission_classes = (DoctorPermission,)
    search_fields = ('title', 'author__birthday')

    def get_serializer_class(self):
        if self.request and self.request.query_params.get('nested'):
            return NestedDoctorHomeColumnSerializer
        return DoctorHomeColumnSerializer if self.action != 'partial_update' else DoctorHomeColumnUpdateSerializer

    def get_serializer_context(self):
        context = super(DoctorHomeColumnViewSet, self).get_serializer_context()
        if self.request:
            context.update({
                "doctor_data_from_cache": get_doctors_cache(self.request.user.hospital).get('doctors', {})
            })
            doctor_ordering = DoctorHomeColumnOrder.objects.filter(
                doctor=self.request.user).values('column_id', 'order')
            context.update({
                "doctor_column_orders": {c.get('column_id'): c.get('order') for c in doctor_ordering}
            })
            column_group_values = self._get_doctor_column_queryset().values('author__remote_id', 'group_id')
            column_group_map = {}

            def make_map(record):
                group_id = record.get('group_id')
                if not column_group_map.get(group_id):
                    column_group_map[group_id] = []
                column_group_map[group_id].append(record.get('author__remote_id'))

            [make_map(record) for record in column_group_values]
            context.update({
                "column_group_map": column_group_map
            })

            if self.request.query_params.get('nested'):
                my_patients = Patient.objects.filter(
                    doctorpatient__in=self.request.user.my_patients_list_participants.all(), doctorpatient__show=True
                ).distinct()
                not_hidden_group_id_list = DoctorHomeColumn.objects.filter(
                    Q(author__hospital=self.request.user.hospital) & Q(is_deleted=False)).exclude(
                    id__in=self.request.user.hidden_doctor_home_column_list.all()).distinct(
                    'group_id').values_list('group_id', flat=True)
                clinic_column_cells = DoctorHomeCell.objects.filter(
                    patient__hospital=self.request.user.hospital,
                    column_group_id__in=not_hidden_group_id_list,
                    patient__in=my_patients
                )
                context.update({
                    "clinic_column_cells_queryset": clinic_column_cells
                })
        return context

    def get_queryset(self):
        queryset = self._get_doctor_column_queryset()
        if self.request.query_params.get('nested'):
            queryset = queryset.exclude(id__in=self.request.user.hidden_doctor_home_column_list.all())
        return queryset

    def _get_doctor_column_queryset(self):
        my_patients = Patient.objects.filter(
            doctorpatient__in=self.request.user.my_patients_list_participants.all(), doctorpatient__show=True
        ).distinct()
        group_id_list = DoctorHomeCell.objects.filter(patient__in=my_patients).values_list(
            'column_group_id', flat=True).distinct()

        queryset = self.model.objects.filter(
            Q(author__hospital=self.request.user.hospital) &
            (Q(group_id__in=group_id_list) | Q(author=self.request.user)) & Q(is_deleted=False)
        )
        return queryset

    def filter_queryset(self, queryset):
        search_key = self.request.query_params.get('search')
        if not search_key:
            return super(DoctorHomeColumnViewSet, self).filter_queryset(queryset)

        # search by cached doctor first/last name
        hospital = self.request.user.hospital
        doctors = get_doctors_cache(hospital).get('doctors', {})
        id_list = [row.id for row in queryset if
                   search_key in doctors.get(row.author.remote_id).get('full_name')]
        queryset = queryset.filter(id__in=id_list).union(super(DoctorHomeColumnViewSet, self).filter_queryset(queryset))
        return queryset

    @viewset_permissions(CreateColumnPermission)
    def create(self, request, *args, **kwargs):
        return super(DoctorHomeColumnViewSet, self).create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
        if self.request.data.get('is_hidden'):
            self.__toggle_column(serializer.instance)
        send_ws_clinic_message(7, serializer.data, self.request.user.hospital.id, self.request.user.remote_id)

    @viewset_permissions(ManageHomeDataPermission)
    def update(self, request, partial=True, *args, **kwargs):
        return super(DoctorHomeColumnViewSet, self).update(request, *args, **kwargs)

    def perform_update(self, serializer):
        serializer.save()
        if "is_hidden" in self.request.data:
            self.__toggle_column()
        send_ws_clinic_message(9, serializer.data, self.request.user.hospital.id, self.request.user.remote_id)

    @viewset_permissions(LockPermission)
    def destroy(self, request, *args, **kwargs):
        obj = self.get_object()
        obj.is_deleted = True
        obj.save()
        if not DoctorHomeColumn.objects.filter(group_id=obj.group_id, is_deleted=False).exists():
            DoctorHomeCell.objects.filter(column_group_id=obj.group_id).update(is_deleted=True)
        send_ws_clinic_message(10, obj.id, self.request.user.hospital.id, self.request.user.remote_id)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @viewset_permissions(ExportPermission)
    @action(detail=True, methods=['post'])
    def copy_column(self, request, pk):
        obj = self.get_object()
        if self.model.objects.filter(author=self.request.user, is_deleted=False, group_id=obj.group_id).exists():
            return Response({"column": ["This column already was copied"]}, status=status.HTTP_400_BAD_REQUEST)
        parent_orders = DoctorHomeColumnOrder.objects.filter(
            column=obj).values('doctor_id', 'order')
        obj.id = None
        obj.author = self.request.user
        obj.save()
        DoctorHomeColumnOrder.objects.bulk_create([DoctorHomeColumnOrder(column=obj, **x) for x in parent_orders])
        new_data = self.get_serializer(instance=obj).data
        send_ws_clinic_message(8, new_data, self.request.user.hospital.id, self.request.user.remote_id)
        return Response(new_data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def toggle_column(self, request, pk, *args, **kwargs):
        if "is_hidden" in self.request.data:
            self.__toggle_column()
            return super(DoctorHomeColumnViewSet, self).retrieve(request, *args, **kwargs)
        return Response({"is_hidden": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

    def __toggle_column(self, new_instance=None):
        obj = new_instance or self.get_object()
        user = self.request.user
        is_hidden = self.request.data.get('is_hidden')
        if is_hidden:
            user.hidden_doctor_home_column_list.add(obj)
        else:
            user.hidden_doctor_home_column_list.remove(obj)

    @action(detail=False, methods=['post'])
    def set_order(self, request, pk=None, *args, **kwargs):
        if self.request.data.get('order_list'):
            serializer = DoctorHomeColumnOrderSerializer(data=self.request.data.get('order_list'), many=True,
                                                         context={'user': self.request.user})
            serializer.is_valid(raise_exception=True)
            DoctorHomeColumnOrder.objects.filter(doctor=self.request.user).delete()
            DoctorHomeColumnOrder.objects.bulk_create([DoctorHomeColumnOrder(**x) for x in serializer.data])
            return super(DoctorHomeColumnViewSet, self).list(request, *args, **kwargs)
        return Response({"order_list": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)


class DoctorHomeCellViewSet(viewsets.ModelViewSet):
    """
        ## Get Single Column Cell

        URL: /api/v1/homecell/:id/

        Method: `GET`

        ---
        ## Get All Columns Cells

        URL: /api/v1/homecell/

        Method: `GET`

        ---
        ## Create New Column Cell

        URL: `/api/v1/homecell/`

        Method: `POST`

        Required Fields:

        * `title` (str)

        * `patient` (int) Patient remote_id

        * `column_group_id` (int) Id of column group. Each column has a group_id field

        Optional Fields:

        * `update_interval` (int)  1 - 15min, 2 - 30min, 3 - 45min, 4 - 1hr, 5 - 2hrs, 6 - 3hrs, 7 - 4hrs, 8 - 5hrs,
        9 - 6hrs, 10 - 7hrs, 11 - 8hrs, 12 - 9hrs, 13 - 10hrs, 14 - 11hrs, 15 - 12hrs, 16 - Daily, 17 - PRN,
        18 - Never Alert

        * `is_private` (bool) Hide cell data from other users. Only owner or admin can change the field

        ---
        ## Update Column Cell

        URL: `/api/v1/homecell/:id/`

        Method: `PATCH`

        Optional Fields:

        * `title` (str)

        * `update_interval` (int)  1 - 15min, 2 - 30min, 3 - 45min, 4 - 1hr, 5 - 2hrs, 6 - 3hrs, 7 - 4hrs, 8 - 5hrs,
        9 - 6hrs, 10 - 7hrs, 11 - 8hrs, 12 - 9hrs, 13 - 10hrs, 14 - 11hrs, 15 - 12hrs, 16 - Daily, 17 - PRN,
        18 - Never Alert

        * `is_private` (str)

        ---
        ## Delete (disable) Column Cell

        URL: `/api/v1/homecell/:id/`

        Method: `DELETE`

        ---
    """

    model = DoctorHomeCell
    queryset = DoctorHomeCell.objects.filter(is_deleted=False)
    permission_classes = (DoctorPermission,)

    def get_serializer_class(self):
        if self.request and self.request.method == "PATCH":
            return UpdateDoctorHomeCellSerializer
        return DoctorHomeCellSerializer

    def get_queryset(self):
        my_patients = Patient.objects.filter(
            doctorpatient__in=self.request.user.my_patients_list_participants.all(), doctorpatient__show=True
        ).distinct()
        group_id_list = DoctorHomeCell.objects.filter(patient__in=my_patients).values_list(
            'column_group_id', flat=True).distinct()

        not_hidden_group_id_list = DoctorHomeColumn.objects.filter(
            Q(author__hospital=self.request.user.hospital) & Q(is_deleted=False) &
            (Q(group_id__in=group_id_list) | Q(author=self.request.user))).exclude(
            id__in=self.request.user.hidden_doctor_home_column_list.all()).distinct(
            'group_id').values_list('group_id', flat=True)
        return self.model.objects.filter(
            patient__hospital=self.request.user.hospital,
            column_group_id__in=not_hidden_group_id_list,
            patient__in=my_patients
        )

    @viewset_permissions(CreateColumnPermission)
    def create(self, request, *args, **kwargs):
        return super(DoctorHomeCellViewSet, self).create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
        group_id = serializer.instance.column_group_id
        columns = DoctorHomeColumn.objects.filter(group_id=group_id, is_deleted=False).select_related('author')
        context = {
            "doctor_data_from_cache": get_doctors_cache(self.request.user.hospital).get('doctors', {}),
            "request": self.request,
            "column_group_map": {group_id: [x.author.remote_id for x in columns]}
        }
        columns_serializer = DoctorHomeColumnSerializer(instance=columns, many=True, context=context)
        data = {'cell': serializer.data, 'new_columns': columns_serializer.data}
        send_ws_clinic_message(11, data, self.request.user.hospital.id, self.request.user.remote_id)

    @viewset_permissions(EditHomeCellPermission)
    def update(self, request, partial=True, *args, **kwargs):
        return super(DoctorHomeCellViewSet, self).update(request, *args, **kwargs)

    def perform_update(self, serializer):
        serializer.save()
        send_ws_clinic_message(12, serializer.data,
                               self.request.user.hospital.id, self.request.user.remote_id)

    @viewset_permissions(LockPermission)
    def destroy(self, request, *args, **kwargs):
        obj = self.get_object()
        obj.update(is_deleted=True)
        send_ws_clinic_message(13, obj.id, self.request.user.hospital.id, self.request.user.remote_id)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @viewset_permissions(LockPermission)
    @action(detail=True, methods=['post'])
    def lock_cell(self, request, pk):
        if "is_private" in self.request.data:
            obj = self.get_object()
            obj.is_private = bool(self.request.data.get("is_private"))
            obj.save()
            data = DoctorHomeCellSerializer(instance=obj).data
            send_ws_clinic_message(12, data, self.request.user.hospital.id, self.request.user.remote_id)
            return Response(data, status=status.HTTP_200_OK)
        return Response({"is_private": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_context(self):
        context = super(DoctorHomeCellViewSet, self).get_serializer_context()
        if self.request and self.request.user.is_admin and self.action == 'retrieve':
            context.update({'show_locked_fields': True})
        return context
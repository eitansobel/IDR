from django.urls import path, include
from rest_framework import routers
from rest_framework.documentation import include_docs_urls

from api.v1.authenticate_resources import DoctorObtainAuthToken, LogOutAPIView
from api.v1.accounts_resources import DoctorViewSet, PatientViewSet, AlertMethodViewSet, HospitalStructureViewSet, \
    CountryViewSet, StuffListViewSet, PatientListViewSet, DoctorPatientViewSet
from api.v1.resources import ForgotPasswordAPIView, ResetPasswordAPIView
from api.v1.notifications_resources import ChatViewSet, MessageViewSet
from api.v1.home_resources import DoctorHomeColumnViewSet, DoctorHomeCellViewSet

router = routers.DefaultRouter()
router.register(r'doctor', DoctorViewSet)
router.register(r'alertmethod', AlertMethodViewSet)
router.register(r'hospitalstructure', HospitalStructureViewSet)
router.register(r'chat', ChatViewSet)
router.register(r'message', MessageViewSet)
router.register(r'patient', PatientViewSet)
router.register(r'stufflist', StuffListViewSet)
router.register(r'patientlist', PatientListViewSet)
router.register(r'doctorpatient', DoctorPatientViewSet)
router.register(r'country', CountryViewSet, base_name='country_list')
router.register(r'homecolumn', DoctorHomeColumnViewSet)
router.register(r'homecell', DoctorHomeCellViewSet)


urlpatterns = [
    path(r'', include(router.urls)),
    path(r'authenticate/forgot_password/', ForgotPasswordAPIView.as_view(), name='authenticate-forgot-password'),
    path(r'authenticate/reset_password/', ResetPasswordAPIView.as_view(), name='authenticate-reset-password'),
    path(r'authenticate/doctor/', DoctorObtainAuthToken.as_view(), name='authenticate-doctor'),
    path(r'authenticate/logout/', LogOutAPIView.as_view(), name='authenticate-logout'),
    path(r'docs/', include_docs_urls(title='API documentation', authentication_classes=[], permission_classes=[]))
]

# urlpatterns += [path(r'silk/', include('silk.urls', namespace='silk'))]

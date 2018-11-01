from twilio.rest import Client
from django.core.mail import send_mail
from django.conf import settings
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.template.loader import render_to_string
from django.template import Context, Template
import requests
from notifications.consumers import ws_msg_type
from accounts.utils import get_doctors_cache, update_cached_doctor_data


def send_sms(to, body):
    """

    :param to: string phone number "******" format (without country code)
    :param body: string
    :return:
    """
    account_sid = settings.TWILIO_ACCOUNT_SID
    auth_token = settings.TWILIO_AUTH_TOKEN
    client = Client(account_sid, auth_token)

    client.api.account.messages.create(
        to=settings.PHONE_COUNTRY_PREFIX + to,
        body=body,
        from_=settings.TWILIO_PHONE_NUMBER
    )


def send_email(to):
    """
    :param to: list of recipient emails ['bla@bla.bla', 'other_bla@bla.bla']
    :return:
    """
    email_header = render_to_string('registration/user_notification_registration_confirm.txt')
    email_data = {'site_name': 'IDR'}
    email_text = render_to_string('registration/user_notification_registration_confirm.html', email_data)
    send_mail(email_header, email_text, settings.FROM_EMAIL, to)


def voice_call(to):
    """

    :param to: string phone number "******" format (without country code)
    :return:
    """

    account_sid = settings.TWILIO_ACCOUNT_SID
    auth_token = settings.TWILIO_AUTH_TOKEN
    client = Client(account_sid, auth_token)
    client.calls.create(
        url="https://handler.twilio.com/twiml/EHa00075c24a0c736aa2358066f675919d",
        from_=settings.TWILIO_PHONE_NUMBER,
        to=settings.PHONE_COUNTRY_PREFIX + to
    )


def send_ws_group_message(action, data, doctor_recipients):
    channel_layer = get_channel_layer()
    for doctor_id in doctor_recipients:
        doctor_group = "user_group_{}".format(doctor_id)
        async_to_sync(channel_layer.group_send)(doctor_group, {
            "type": "notify.update",
            "update": data,
            "action": ws_msg_type[action]
        }, )


def send_ws_message(action, data, receiver):
    channel_layer = get_channel_layer()
    doctor_group = "user_group_{}".format(receiver)
    async_to_sync(channel_layer.group_send)(doctor_group, {
        "type": "notify.update",
        "update": data,
        "action": ws_msg_type[action]
    }, )


def send_ws_clinic_message(action, data, hospital_id, doctor_remote_id):
    channel_layer = get_channel_layer()
    hospital_group = "hospital_group_{}".format(hospital_id)
    async_to_sync(channel_layer.group_send)(hospital_group, {
        "type": "notify.update",
        "update": data,
        "action": ws_msg_type[action],
        "doctor_remote_id": doctor_remote_id
    }, )


def get_email_message(template, context):
    subject_message = template.subject_message
    if subject_message:
        subject_message = Template(subject_message).render(Context(context))

    html_message = template.html_message
    if html_message:
        html_message = Template(html_message).render(Context(context))
    return subject_message, html_message


def get_doctors(request):
    credentials = {
        "username": request.user.doctor.hospital.clinic_remote_admin_username,
        "password": request.user.doctor.hospital.clinic_remote_admin_password
    }
    response = requests.post(settings.IDR_AUTH_URL, data=credentials)
    if response.status_code != 200:
        return {"connection": "error"}
    token = response.json().get('token')
    response = requests.get(settings.IDR_AUTH_DOCTOR_URL, headers={'Authorization': 'Token ' + token})
    return response.json()


def get_display_data(user):
    hospital_cache = get_doctors_cache(user.hospital)
    if not hospital_cache.get('doctors').get(user.remote_id):
        update_cached_doctor_data(doctor_remote_id=user.remote_id, hospital=user.hospital)
        hospital_cache = get_doctors_cache(user.hospital)
    return hospital_cache.get('doctors', {"full_name": "", "full_photo": ""}).get(user.remote_id)


def get_display_data_chat(request, chat):
    user = chat.participants.exclude(remote_id=request.user.remote_id).first()
    return get_display_data(user=user) if user else None


def get_display_data_message(request, message):
    if message.sender == request.user:
        user = request.user
    else:
        user = message.chat.participants.exclude(remote_id=request.user.remote_id).first()
    return get_display_data(user=user)


def get_display_data_wc_message(user, message):
    if message.sender != user:
        user = message.chat.participants.exclude(remote_id=user.remote_id).first()
    return get_display_data(user)

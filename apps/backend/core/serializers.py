from rest_framework import serializers


class ContactSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    message = serializers.CharField(max_length=3000)


class EventInquirySerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=40, allow_blank=True, required=False, default="")
    event_type = serializers.CharField(max_length=120, allow_blank=True, required=False, default="")
    guests = serializers.CharField(max_length=40, allow_blank=True, required=False, default="")
    date = serializers.CharField(max_length=40, allow_blank=True, required=False, default="")
    message = serializers.CharField(max_length=3000)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(style={"input_type": "password"})


class AdminSessionSerializer(serializers.Serializer):
    authenticated = serializers.BooleanField()
    username = serializers.CharField(required=False)
    is_staff = serializers.BooleanField(required=False)


class StatusResponseSerializer(serializers.Serializer):
    status = serializers.CharField()


class DetailResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()

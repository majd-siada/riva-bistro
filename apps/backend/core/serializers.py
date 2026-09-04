from rest_framework import serializers

from core.models import ContactMessage, EventInquiry, GalleryItem, NewsItem


class ContactSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=40, allow_blank=True, required=False, default="")
    subject = serializers.CharField(max_length=120, allow_blank=True, required=False, default="")
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
    email_sent = serializers.BooleanField(required=False)


class DetailResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()


class NewsItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsItem
        fields = ["id", "title", "slug", "body", "published_at"]


class GalleryItemSerializer(serializers.ModelSerializer):
    src = serializers.SerializerMethodField()

    class Meta:
        model = GalleryItem
        fields = ["id", "title", "alt", "src", "sort_order"]

    def get_src(self, obj: GalleryItem) -> str:
        if obj.image:
            return obj.image.url
        return obj.image_url or ""


class AdminContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "subject",
            "message",
            "email_sent",
            "created_at",
        ]
        read_only_fields = fields


class AdminEventInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventInquiry
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "event_type",
            "guests",
            "date",
            "message",
            "email_sent",
            "created_at",
        ]
        read_only_fields = fields


class AdminNewsItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsItem
        fields = [
            "id",
            "title",
            "slug",
            "body",
            "is_published",
            "published_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AdminGalleryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryItem
        fields = [
            "id",
            "title",
            "alt",
            "image_url",
            "sort_order",
            "is_published",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

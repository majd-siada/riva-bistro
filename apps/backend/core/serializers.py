from rest_framework import serializers

from core.images import ALLOWED_IMAGE_EXTENSIONS, MAX_IMAGE_BYTES, sniff_image_kind
from core.models import (
    ContactMessage,
    EventInquiry,
    GalleryItem,
    NewsItem,
    Offer,
    RestaurantProfile,
    SiteContent,
)


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
    slug = serializers.SlugField(required=False, allow_blank=True, max_length=220)

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

    def create(self, validated_data):
        if not validated_data.get("slug"):
            validated_data.pop("slug", None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if validated_data.get("slug") == "":
            validated_data.pop("slug")
        return super().update(instance, validated_data)


class AdminGalleryItemSerializer(serializers.ModelSerializer):
    image = serializers.FileField(required=False, allow_null=True)
    src = serializers.SerializerMethodField()

    class Meta:
        model = GalleryItem
        fields = [
            "id",
            "title",
            "alt",
            "image",
            "image_url",
            "src",
            "sort_order",
            "is_published",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "src"]

    def get_src(self, obj: GalleryItem) -> str:
        if obj.image:
            return obj.image.url
        return obj.image_url or ""

    def validate(self, attrs):
        attrs = super().validate(attrs)
        # On create, require a file or an external URL so public /galleri has a src.
        if self.instance is None:
            uploaded = attrs.get("image")
            url = (attrs.get("image_url") or "").strip()
            if not uploaded and not url:
                raise serializers.ValidationError(
                    {"image": "Ladda upp en bild eller ange en bild-URL."}
                )
        return attrs

    def validate_image(self, uploaded):
        if uploaded is None:
            return uploaded
        name = (getattr(uploaded, "name", "") or "").lower()
        if not any(name.endswith(ext) for ext in ALLOWED_IMAGE_EXTENSIONS):
            raise serializers.ValidationError(
                "Bilden måste vara JPG, PNG eller WebP."
            )
        size = getattr(uploaded, "size", None)
        if size is not None and size > MAX_IMAGE_BYTES:
            raise serializers.ValidationError("Bilden är för stor (max 5 MB).")
        if sniff_image_kind(uploaded) is None:
            raise serializers.ValidationError(
                "Filen är inte en giltig JPG, PNG eller WebP."
            )
        return uploaded


def _validate_uploaded_image(uploaded):
    if uploaded is None:
        return uploaded
    name = (getattr(uploaded, "name", "") or "").lower()
    if not any(name.endswith(ext) for ext in ALLOWED_IMAGE_EXTENSIONS):
        raise serializers.ValidationError("Bilden måste vara JPG, PNG eller WebP.")
    size = getattr(uploaded, "size", None)
    if size is not None and size > MAX_IMAGE_BYTES:
        raise serializers.ValidationError("Bilden är för stor (max 5 MB).")
    if sniff_image_kind(uploaded) is None:
        raise serializers.ValidationError(
            "Filen är inte en giltig JPG, PNG eller WebP."
        )
    return uploaded


class RestaurantProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantProfile
        fields = [
            "name",
            "tagline",
            "street",
            "postal_code",
            "city",
            "country",
            "area",
            "phone",
            "phone_e164",
            "email",
            "map_url",
            "social_instagram",
            "social_facebook",
            "social_verified",
            "kitchen_hours",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]


class SiteContentSerializer(serializers.ModelSerializer):
    hero_image = serializers.FileField(required=False, allow_null=True)
    about_image = serializers.FileField(required=False, allow_null=True)
    hero_src = serializers.SerializerMethodField()
    about_src = serializers.SerializerMethodField()

    class Meta:
        model = SiteContent
        fields = [
            "hero_title",
            "hero_body",
            "hero_image",
            "hero_image_url",
            "hero_src",
            "primary_cta_label",
            "primary_cta_href",
            "secondary_cta_label",
            "secondary_cta_href",
            "about_title",
            "about_body",
            "about_image",
            "about_image_url",
            "about_src",
            "updated_at",
        ]
        read_only_fields = ["updated_at", "hero_src", "about_src"]

    def get_hero_src(self, obj: SiteContent) -> str:
        if obj.hero_image:
            return obj.hero_image.url
        return obj.hero_image_url or ""

    def get_about_src(self, obj: SiteContent) -> str:
        if obj.about_image:
            return obj.about_image.url
        return obj.about_image_url or ""

    def validate_hero_image(self, uploaded):
        return _validate_uploaded_image(uploaded)

    def validate_about_image(self, uploaded):
        return _validate_uploaded_image(uploaded)


class OfferSerializer(serializers.ModelSerializer):
    image = serializers.FileField(required=False, allow_null=True)
    src = serializers.SerializerMethodField()

    class Meta:
        model = Offer
        fields = [
            "id",
            "title",
            "description",
            "image",
            "image_url",
            "src",
            "price_label",
            "starts_at",
            "ends_at",
            "is_active",
            "sort_order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "src", "created_at", "updated_at"]

    def get_src(self, obj: Offer) -> str:
        if obj.image:
            return obj.image.url
        return obj.image_url or ""

    def validate_image(self, uploaded):
        return _validate_uploaded_image(uploaded)

    def validate(self, attrs):
        starts = attrs.get("starts_at", getattr(self.instance, "starts_at", None))
        ends = attrs.get("ends_at", getattr(self.instance, "ends_at", None))
        if starts and ends and ends < starts:
            raise serializers.ValidationError(
                {"ends_at": "Slutdatum måste vara efter startdatum."}
            )
        return attrs


class PublicOfferSerializer(serializers.ModelSerializer):
    src = serializers.SerializerMethodField()

    class Meta:
        model = Offer
        fields = [
            "id",
            "title",
            "description",
            "src",
            "price_label",
            "starts_at",
            "ends_at",
            "sort_order",
        ]

    def get_src(self, obj: Offer) -> str:
        if obj.image:
            return obj.image.url
        return obj.image_url or ""

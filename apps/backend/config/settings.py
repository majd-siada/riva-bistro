"""Django settings for Riva Bistro."""

from __future__ import annotations

import os
import sys
from pathlib import Path
from urllib.parse import urlparse

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: str = "") -> list[str]:
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


# DEBUG is opt-in. Local Docker/.env.example sets DJANGO_DEBUG=true.
DEBUG = env_bool("DJANGO_DEBUG", default=False)
_secret = os.getenv("DJANGO_SECRET_KEY", "")
_running_tests = "pytest" in sys.modules or any("pytest" in a for a in sys.argv)
if _secret:
    SECRET_KEY = _secret
elif DEBUG or _running_tests:
    SECRET_KEY = "insecure-dev-only-change-me-before-production"
else:
    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY must be set when DJANGO_DEBUG is false."
    )
_LOCAL_HOST_DEFAULT = "localhost,127.0.0.1,backend"
_CORS_DEFAULT = (
    "http://localhost:3000,http://127.0.0.1:3000,"
    "http://localhost:3001,http://127.0.0.1:3001"
)


def _is_localhost_only(hosts: list[str]) -> bool:
    if not hosts:
        return True
    local_markers = ("localhost", "127.0.0.1", "backend", "0.0.0.0", "::1")
    return all(
        any(marker in host.lower() for marker in local_markers) for host in hosts
    )


if DEBUG or _running_tests:
    ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", _LOCAL_HOST_DEFAULT)
else:
    ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "")
    if not ALLOWED_HOSTS or _is_localhost_only(ALLOWED_HOSTS):
        raise ImproperlyConfigured(
            "DJANGO_ALLOWED_HOSTS must list the public API host(s) when "
            "DJANGO_DEBUG is false (e.g. api.rivabistro.se)."
        )

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "corsheaders",
    "rest_framework",
    "drf_spectacular",
    # Local
    "core",
    "catalog",
    "reservations",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"


def _database_from_url(url: str) -> dict:
    parsed = urlparse(url)
    return {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": parsed.path.lstrip("/") or "riva_bistro",
        "USER": parsed.username or "riva",
        "PASSWORD": parsed.password or "",
        "HOST": parsed.hostname or "localhost",
        "PORT": str(parsed.port or 5432),
    }


DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    DATABASES = {"default": _database_from_url(DATABASE_URL)}
elif DEBUG or _running_tests:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("POSTGRES_DB", "riva_bistro"),
            "USER": os.getenv("POSTGRES_USER", "riva"),
            "PASSWORD": os.getenv("POSTGRES_PASSWORD", "riva_dev_password"),
            "HOST": os.getenv("POSTGRES_HOST", "localhost"),
            "PORT": os.getenv("POSTGRES_PORT", "5432"),
        }
    }
else:
    raise ImproperlyConfigured(
        "DATABASE_URL must be set when DJANGO_DEBUG is false."
    )

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "sv-se"
TIME_ZONE = "Europe/Stockholm"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATIC_ROOT.mkdir(parents=True, exist_ok=True)
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

MEDIA_URL = os.getenv("MEDIA_URL", "/media/")
MEDIA_ROOT = Path(os.getenv("MEDIA_ROOT", str(BASE_DIR / "media")))
# Serve uploaded files from this process when DEBUG is false (small VPS).
# Set MEDIA_SERVE=false if nginx/CDN serves MEDIA_ROOT instead.
MEDIA_SERVE = env_bool("MEDIA_SERVE", default=True)

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

if DEBUG or _running_tests:
    CORS_ALLOWED_ORIGINS = env_list("DJANGO_CORS_ALLOWED_ORIGINS", _CORS_DEFAULT)
    CSRF_TRUSTED_ORIGINS = env_list("DJANGO_CSRF_TRUSTED_ORIGINS", _CORS_DEFAULT)
else:
    CORS_ALLOWED_ORIGINS = env_list("DJANGO_CORS_ALLOWED_ORIGINS", "")
    CSRF_TRUSTED_ORIGINS = env_list("DJANGO_CSRF_TRUSTED_ORIGINS", "")
    if not CORS_ALLOWED_ORIGINS or _is_localhost_only(CORS_ALLOWED_ORIGINS):
        raise ImproperlyConfigured(
            "DJANGO_CORS_ALLOWED_ORIGINS must list the public frontend origin(s) "
            "when DJANGO_DEBUG is false."
        )
    if not CSRF_TRUSTED_ORIGINS or _is_localhost_only(CSRF_TRUSTED_ORIGINS):
        raise ImproperlyConfigured(
            "DJANGO_CSRF_TRUSTED_ORIGINS must list trusted HTTPS origins when "
            "DJANGO_DEBUG is false."
        )

# Staff admin UI calls the API cross-origin with the session cookie.
CORS_ALLOW_CREDENTIALS = True

if DEBUG:
    # Local dev often runs Next on alternate ports (e.g. 3001 when 3000 is busy).
    CORS_ALLOWED_ORIGIN_REGEXES = [
        r"^http://localhost:\d+$",
        r"^http://127\.0\.0\.1:\d+$",
    ]
    for port in range(3000, 3010):
        CSRF_TRUSTED_ORIGINS.extend(
            [
                f"http://localhost:{port}",
                f"http://127.0.0.1:{port}",
            ]
        )

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",
    ],
    # Global anon throttle complements scoped write throttles on booking/auth/inquiries.
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "reservations": "30/hour",
        "inquiries": "12/hour",
        "auth": "20/hour",
        "anon": "120/min",
    },
    "EXCEPTION_HANDLER": "rest_framework.views.exception_handler",
}

# Structured logging (never log secrets / Telegram bot tokens).
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s %(levelname)s [%(name)s] %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": os.getenv("DJANGO_LOG_LEVEL", "INFO"),
    },
    "loggers": {
        "django.request": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
        # Notification loggers propagate to root so pytest caplog and operators
        # both see them. Never log bot tokens / API secrets in those modules.
    },
}

# Optional Sentry — no-op unless SENTRY_DSN is set and sentry-sdk is installed.
_sentry_dsn = os.getenv("SENTRY_DSN", "").strip()
if _sentry_dsn:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.django import DjangoIntegration

        sentry_sdk.init(
            dsn=_sentry_dsn,
            integrations=[DjangoIntegration()],
            traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0")),
            send_default_pii=False,
            environment=os.getenv("SENTRY_ENVIRONMENT", "production" if not DEBUG else "development"),
        )
    except ImportError:
        pass

SESSION_ENGINE = "django.contrib.sessions.backends.db"
SESSION_COOKIE_HTTPONLY = True
# Admin SPA reads csrftoken via document.cookie (must remain readable by JS).
CSRF_COOKIE_HTTPONLY = False
_cookie_samesite = os.getenv("DJANGO_COOKIE_SAMESITE", "Lax").strip()
if _cookie_samesite.lower() == "none":
    SESSION_COOKIE_SAMESITE = "None"
    CSRF_COOKIE_SAMESITE = "None"
else:
    SESSION_COOKIE_SAMESITE = "Lax"
    CSRF_COOKIE_SAMESITE = "Lax"
_cookie_domain = os.getenv("DJANGO_COOKIE_DOMAIN", "").strip()
if _cookie_domain:
    SESSION_COOKIE_DOMAIN = _cookie_domain
    CSRF_COOKIE_DOMAIN = _cookie_domain

# --- Email -------------------------------------------------------------------
# Environment-configurable. In development we default to the console backend so
# nothing is faked (Django prints the message and reports a real success). In
# production, set EMAIL_BACKEND to SMTP and provide the credentials via secrets.
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend"
    if DEBUG
    else "django.core.mail.backends.smtp.EmailBackend",
)
EMAIL_HOST = os.getenv("EMAIL_HOST", "")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", default=True)
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "Riva Bistro <no-reply@rivabistro.se>")
# Where contact + private-event inquiries are delivered. No hardcoded address:
# real delivery stays off until this is configured.
RESTAURANT_NOTIFICATION_EMAIL = os.getenv("RESTAURANT_NOTIFICATION_EMAIL", "")

# --- Staff reservation notifications (Telegram + optional Hostinger Mail API) ---
# Never hardcode tokens. Leave blank to disable that channel.
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "").strip()
# Hostinger Mail API (pip: hostinger_mail_api). Bearer token + mailbox resource id
# from Hostinger. Staff alerts fall back to Django EMAIL_* if these are unset.
HOSTINGER_MAIL_API_TOKEN = os.getenv("HOSTINGER_MAIL_API_TOKEN", "").strip()
HOSTINGER_MAIL_MAILBOX_RESOURCE_ID = os.getenv(
    "HOSTINGER_MAIL_MAILBOX_RESOURCE_ID", ""
).strip()

SPECTACULAR_SETTINGS = {
    "TITLE": "Riva Bistro API",
    "DESCRIPTION": "OpenAPI contract for Riva Bistro — menu and reservations.",
    "VERSION": "0.1.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX": r"/api/v1",
    "SERVE_PERMISSIONS": ["rest_framework.permissions.IsAdminUser"],
    "SERVE_AUTHENTICATION": ["rest_framework.authentication.SessionAuthentication"],
}

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"
    # TLS terminates at Nginx; do not enable SECURE_SSL_REDIRECT (proxy loops).
    SECURE_HSTS_SECONDS = int(os.getenv("DJANGO_SECURE_HSTS_SECONDS", "31536000"))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_REFERRER_POLICY = "same-origin"
    # Cross-site admin (rivabistro.se → api.rivabistro.se) needs SameSite=None.
    if SESSION_COOKIE_SAMESITE == "None":
        SESSION_COOKIE_SECURE = True
        CSRF_COOKIE_SECURE = True

# Cross-Origin-Opener-Policy for clickjacking-adjacent hardening (Django 4.2+).
SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin"

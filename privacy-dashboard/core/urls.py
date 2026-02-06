from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from scanner.views import WebsiteViewSet, ReportViewSet, LoginAPI, RegisterAPI
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse

router = routers.DefaultRouter()
router.register(r'websites', WebsiteViewSet, basename="websites")
router.register(r'reports', ReportViewSet, basename="reports")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/csrf/', ensure_csrf_cookie(lambda request: HttpResponse('OK')), name='csrf'),
    path("api/login/", LoginAPI.as_view(), name="api-login"),
    path('api/register/', RegisterAPI.as_view(), name='api-register'),
]

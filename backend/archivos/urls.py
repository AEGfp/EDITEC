from django.urls import path, include
from rest_framework import routers
from archivos import views
from django.conf.urls.static import static
from editec import settings

router = routers.DefaultRouter()
router.register(r"archivos", views.ArchivosViewSet, "archivos")

urlpatterns = [
    path("", include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

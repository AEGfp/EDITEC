from django.urls import path, include, re_path
from rest_framework import routers
from api import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = routers.DefaultRouter()
router.register(r"permisos", views.PermisoView, "permisos")

urlpatterns = [
    path("", include(router.urls)),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    re_path("login/", views.login, name="login"),
    re_path("register/", views.register, name="register"),
    re_path("logout/", views.logout, name="logout"),
]

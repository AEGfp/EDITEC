from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ParametrosCobrosView,
    SaldoCuotasView,
    generar_cuotas,
)
from api import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'parametros', ParametrosCobrosView)
router.register(r'cuotas', SaldoCuotasView, basename='cuotas')

urlpatterns = [
    path('', include(router.urls)),
    path('generar-cuotas/', generar_cuotas, name='generar-cuotas'),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("register/", views.register, name="register"),
    path("logout/", views.logout, name="logout"),
]


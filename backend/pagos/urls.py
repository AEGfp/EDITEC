from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProveedorView,
    TipoComprobanteView,
    CondicionView,
    ComprobanteProveedorView,
    SaldoProveedoresView,
    generar_reporte_pdf,
)
from api import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'proveedores', ProveedorView)
router.register(r'tipo-comprobantes', TipoComprobanteView)
router.register(r'condiciones', CondicionView)
router.register(r'comprobantes', ComprobanteProveedorView)
router.register(r'saldos', SaldoProveedoresView)

urlpatterns = [
    path('', include(router.urls)),
    path('reporte-pdf/', generar_reporte_pdf, name='reporte_pdf'),  # ✅ Así está bien
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("register/", views.register, name="register"),
    path("logout/", views.logout, name="logout"),
]

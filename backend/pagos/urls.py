from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProveedorView,
    TipoComprobanteView,
    CondicionView,
    ComprobanteProveedorView,
    SaldoProveedoresView,
    ComprobantesConSaldoAPIView,
    CajaPagosView,
    cuotas_disponibles,
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
router.register(r'caja-pagos', CajaPagosView)

urlpatterns = [
    path('', include(router.urls)),
    path('reporte-pdf/', generar_reporte_pdf, name='reporte_pdf'), 
    path('comprobantes-pendientes/', ComprobantesConSaldoAPIView.as_view()),
    path('cuotas-disponibles/', cuotas_disponibles), 
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("register/", views.register, name="register"),
    path("logout/", views.logout, name="logout"),
]

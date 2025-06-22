from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ParametrosCobrosView,
    SaldoCuotasView,
    generar_cuotas,
    CuotasPorInfanteView,
    #registrar_cobro_cuota,
    generar_pdf_resumen_cobros,
    resumen_cobros_json,
    generar_pdf_resumen_todos,
    generar_reporte_cuotas_pdf,
    CobroCuotaInfanteView,
)
from api import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
#router.register(r'parametros', ParametrosCobrosView)
#router.register(r'cuotas', SaldoCuotasView, basename='cuotas')
router.register(r'cuotas-por-infante/(?P<id_infante>\d+)', CuotasPorInfanteView, basename='cuotas-por-infante')
router.register(r'parametros', ParametrosCobrosView, basename='parametros-cobros')
router.register(r'cuotas', SaldoCuotasView, basename='saldo-cuotas')
router.register(r'cobros', CobroCuotaInfanteView, basename='cobro-cuota-infante')

#print([url.pattern for url in router.urls])

urlpatterns = [
    path('', include(router.urls)),
    path('generar-cuotas/', generar_cuotas, name='generar_cuotas'),
    #path('cuotas/registrar-cobro/', registrar_cobro_cuota, name='registrar_cobro_cuota'),
    path('cuotas/resumen-cobros/<int:id_infante>/', generar_pdf_resumen_cobros, name='resumen_cobros_pdf'),
    path("cuotas/resumen-json/<int:id_infante>/", resumen_cobros_json, name="resumen_cobros_json"),
    path("cuotas/resumen-pdf-todos/", generar_pdf_resumen_todos, name="resumen_pdf_todos"),
    path('reporte-cuotas/', generar_reporte_cuotas_pdf, name='reporte-cuotas'), #!
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("register/", views.register, name="register"),
    path("logout/", views.logout, name="logout"),
]


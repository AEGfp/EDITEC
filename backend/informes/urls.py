from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TipoInformeView, IndicadorView, InformeView, InformeIndicadorView, generar_reporte_informe



router = DefaultRouter()
router.register(r'tipo-informe', TipoInformeView)
router.register(r'indicadores', IndicadorView)
router.register(r'informes', InformeView)
router.register(r'informe-indicadores', InformeIndicadorView)

urlpatterns = [
    path('', include(router.urls)),
    path("reporte-informe/", generar_reporte_informe, name="reporte-informe"),

]



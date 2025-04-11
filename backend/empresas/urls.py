from django.urls import path
from . import views

urlpatterns = [
    path('', views.ListarEmpresas.as_view(), name='listar-empresas'),
    path('<int:pk>/', views.DetallesEmpresas.as_view(), name='detalles-empresas'),
]
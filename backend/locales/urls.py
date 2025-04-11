from django.urls import path
from . import views

urlpatterns = [
    path('', views.ListarLocales.as_view(), name='listar-locales'),
    path('<int:pk>/', views.DetallesLocales.as_view(), name='detalles-locales'),
]
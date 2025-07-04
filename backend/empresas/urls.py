from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmpresasView
from api import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView



router = DefaultRouter()
router.register(r'empresas', EmpresasView, basename= 'Empresa')

urlpatterns = [
    path('', include(router.urls)),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("register/", views.register, name="register"),
    path("logout/", views.logout, name="logout"),
]



from django.urls import path, include
from rest_framework import routers
from api import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = routers.DefaultRouter()
router.register(r"permisos", views.PermisoView, "permisos")
router.register(r"personas", views.PersonaView, "personas")

urlpatterns = [
    path("", include(router.urls)),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("register/", views.register, name="register"),
    path("logout/", views.logout, name="logout"),
    path("funcionarios/", views.FuncionariosView.as_view(), name="funcionarios"),
    path("usuarios/<int:pk>/", views.UsuarioDetailView.as_view(), name="usuario-detail"),
   path("reset-password/", views.SolicitarResetContrasena.as_view(), name="reset-password"),
   path("reset-password/<uidb64>/<token>/",views.ResetPasswordView.as_view(),name="reset-password-confirm"),

]

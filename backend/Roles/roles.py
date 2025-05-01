from rest_framework import permissions


class EsDirector(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.groups.filter(name="director").exists()
        )


class EsProfesor(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.groups.filter(name="profesor").exists()
        )


class EsAdministrador(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.groups.filter(name="administrador").exists()
        )


class EsTutor(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.groups.filter(name="tutor").exists()
        )


class ControlarRoles(permissions.BasePermission):
    def has_permission(self, request, view):
        roles_permitidos = getattr(view, "roles_permitidos", [])
        return (
            request.user.is_authenticated
            and request.user.groups.filter(name__in=roles_permitidos).exists()
        )

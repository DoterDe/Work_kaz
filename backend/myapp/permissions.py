from django.conf import settings
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class IsContentManager(BasePermission):
    """
    Access for one dedicated person who manages content templates.
    By default this is username from settings.CONTENT_MANAGER_USERNAME.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        manager_username = getattr(settings, "CONTENT_MANAGER_USERNAME", "admin")
        return user.username == manager_username

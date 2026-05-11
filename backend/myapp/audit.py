from __future__ import annotations

from typing import Any

from .models import AuditLog


def get_client_ip(request) -> str | None:
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def log_audit_event(
    request,
    *,
    action: str,
    entity_type: str,
    entity_id: Any = "",
    payload: dict | None = None,
) -> None:
    user = getattr(request, "user", None)
    actor = user if user and user.is_authenticated else None
    user_agent = (request.META.get("HTTP_USER_AGENT") or "")[:255]

    AuditLog.objects.create(
        actor=actor,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id or ""),
        payload=payload or {},
        ip_address=get_client_ip(request),
        user_agent=user_agent,
    )

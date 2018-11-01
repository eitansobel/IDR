from functools import wraps


def viewset_permissions(permissions, permission_denied=None):
    """
        A decorator that wraps viewset API methods, overriding the permission_classes.
    """
    if not isinstance(permissions, (list, tuple)):
        permissions = permissions,

    def wrapper(func):
        @wraps(func)
        def wrapped(self, request, *args, **kwargs):
            for permission in permissions:
                if not permission().has_permission(request, self):
                    (permission_denied or self.permission_denied)(request)

            # Override get_permissions in viewset, so that get_object and stuff inside the view will
            # do the right thing.
            old_get_permissions = self.get_permissions
            self.get_permissions = lambda: [permission() for permission in permissions]
            try:
                return func(self, request, *args, **kwargs)

            finally:
                self.get_permissions = old_get_permissions

        return wrapped

    return wrapper
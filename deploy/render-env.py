"""Serialize GitHub secrets as literal Docker Compose dotenv values."""

import os


def quote(value):
    # Compose single-quoted values preserve $, #, spaces, and embedded newlines.
    return "'" + value.replace("'", "\\'") + "'"


for name in ("APP_DOMAIN", "DB_PASSWORD", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"):
    print(f"{name}={quote(os.environ[name])}")

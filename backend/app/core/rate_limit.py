"""
Rate limiting configuration for MergeMatch API.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

# Shared rate limiter instance
limiter = Limiter(key_func=get_remote_address)

# Rate limit constants
RATE_LIMIT_DEFAULT = "60/minute"
RATE_LIMIT_AUTH = "10/minute"
RATE_LIMIT_MERGE = "30/minute"
RATE_LIMIT_SCAN = "10/minute"
RATE_LIMIT_WEBHOOK = "100/minute"

# Rate limiting strategy (Phase 1 documentation)

Reservation and auth endpoints will apply rate limiting in later phases.

Planned approach:

1. **Edge / reverse proxy** (production): request quotas per IP for public APIs.
2. **Application-level throttling** via DRF throttle classes for:
   - reservation creation
   - authentication attempts
   - media uploads
3. **Stricter limits** on anonymous booking endpoints than authenticated admin APIs.

Exact numeric limits will be tuned with production traffic. Document changes in this file when implemented.

# ADR 0001: Hexagonal architecture per module

**Status:** Accepted

**Context:** We want the project to remain maintainable as it grows and to be able to swap
infrastructure (DB, HTTP framework) without rewriting the domain.

**Decision:** Each feature is a module with `domain/application/infrastructure` layers.
Domain has zero external dependencies. Adapters depend inward; nothing in `domain/` imports
from `infrastructure/`.

**Consequences:**

- More files per feature; small upfront cost.
- Easy unit testing of domain and use cases with in-memory port implementations.
- Swapping Prisma or Fastify is a localized change.

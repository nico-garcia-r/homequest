# Module: achievement

Hexagonal layout:

- `domain/` — entities, value objects, errors, port interfaces. No external deps.
- `application/` — use cases that orchestrate ports. No HTTP/Prisma here.
- `infrastructure/` — adapters (Prisma repos, Fastify routes, external services).

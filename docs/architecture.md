# Architecture

## Hexagonal per module

Each module under `apps/api/src/modules/<name>` has three layers:

- **domain/** — pure TypeScript. Entities, value objects, errors, and _port interfaces_
  the module needs from the outside world. No imports from Prisma, Fastify, etc.
- **application/** — use cases. Each use case is a class injected with ports via tsyringe,
  exposes an `execute(input): Promise<Result<Output, DomainError>>`.
- **infrastructure/** — adapters that implement the ports (e.g. PrismaUserRepository) and
  HTTP controllers/routes that translate Fastify requests into use-case calls.

The composition root (`shared/infrastructure/di/container.ts`) is the only place that wires
concrete adapters to ports. Swapping SQLite for Postgres = change one registration.

## Result type

Expected business errors are returned via `Result<T, DomainError>` (see `shared/domain/Result.ts`).
Throwing is reserved for _unexpected_ infrastructure failures.

## Points ledger

Balance is never stored as a mutable field. Every grant or spend creates a `PointLedgerEntry` row;
the balance is `SUM(amount) WHERE userId = ?`. This gives auditability for free.

# ADR 0002: Points as an append-only ledger

**Status:** Accepted

**Context:** Users earn and spend points. We need an audit trail and to avoid race
conditions on a mutable balance counter.

**Decision:** Store every change as a row in `PointLedgerEntry` (positive for earn, negative
for spend). Compute balance via aggregation. Index on `(userId, createdAt)`.

**Consequences:**

- Reads need a SUM, but indexed and small per-user.
- Trivial audit and history.
- No "lost update" bugs.

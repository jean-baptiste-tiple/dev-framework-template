---
name: database
description: Use when creating or modifying database migrations, schemas, tables, indexes, transactions, or soft deletes.
---

Consult [.tiple/conventions/database-patterns.md](.tiple/conventions/database-patterns.md) for the full patterns. Load it before writing migrations.

Key invariants:
- Jamais de modification manuelle en base — toujours via migration versionnée
- Migrations idempotentes (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`)
- RLS activée dans la MÊME migration que la création de table

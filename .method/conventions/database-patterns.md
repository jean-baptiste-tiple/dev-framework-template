# Database Patterns

> Tag : `database`
> Lire ce fichier pour toute story créant/modifiant des tables, migrations, ou requêtes.

## Naming Conventions

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Tables | `snake_case`, pluriel | `order_items`, `user_profiles` |
| Colonnes | `snake_case` | `created_at`, `user_id` |
| Primary key | `id` (UUID) | `id uuid DEFAULT gen_random_uuid()` |
| Foreign key | `[table_singulier]_id` | `user_id`, `order_id` |
| Index | `idx_[table]_[colonnes]` | `idx_orders_user_id` |
| RLS Policy | `[table]_[operation]_[qui]` | `orders_select_own` |
| Enum type | `snake_case` | `order_status`, `user_role` |
| Fonction | `snake_case`, verbe | `get_user_orders`, `calculate_total` |

## Migrations

### Naming
```
supabase/migrations/YYYYMMDDHHMMSS_description.sql
```
Exemples :
- `20240115120000_create_users_table.sql`
- `20240115130000_add_avatar_to_profiles.sql`
- `20240116100000_create_orders_with_rls.sql`

### Commande
```bash
pnpm db:migrate create_orders_table
```

### Structure d'une migration
```sql
-- Migration : create_orders_table
-- Description : Table des commandes avec RLS

-- 1. Table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status order_status NOT NULL DEFAULT 'pending',
  total_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Index
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- 3. RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY orders_select_own ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY orders_insert_own ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- USING filtre les lignes visibles, WITH CHECK valide la ligne APRÈS écriture.
-- Sans WITH CHECK, un utilisateur peut réassigner user_id et donner sa ligne à un tiers.
CREATE POLICY orders_update_own ON orders
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Trigger updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);
```

### Règles
- **Jamais de modification manuelle** en base — toujours via migration
- **Une migration n'est jamais rejouée.** La CLI Supabase applique chaque fichier exactement une fois (`supabase_migrations.schema_migrations`) : `IF NOT EXISTS` n'apporte rien et fait passer une migration en silence sur une table préexistante de forme différente, ce qui crée une dérive de schéma invisible entre staging et prod. Une migration qui ne peut pas s'appliquer doit échouer bruyamment.
- **Objets non idempotents par nature** (`CREATE POLICY`, `CREATE TRIGGER` : il n'existe pas de `IF NOT EXISTS` pour eux) → les précéder d'un `DROP ... IF EXISTS` explicite
- **RLS activée et policies créées dans la même migration** que la table
- **Toute policy `FOR UPDATE` déclare `WITH CHECK`** en plus de `USING`
- **Migration destructive = rollback fourni.** Toute migration contenant `DROP`, `ALTER ... TYPE`, `SET NOT NULL` ou `RENAME` est accompagnée d'un `supabase/migrations/rollback/<timestamp>.sql`, et découpée en expand/contract sur deux déploiements.
- **Vérifiable :** une migration seule dans un diff est un défaut — elle est accompagnée soit d'une entrée dans `supabase/seed.sql`, soit d'un test qui lit ou écrit la nouvelle table.

## Types & Enums

```sql
-- Créer un enum AVANT la table qui l'utilise
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');

-- Ajouter une valeur à un enum existant
ALTER TYPE order_status ADD VALUE 'refunded';
-- Note : on ne peut PAS supprimer une valeur d'enum en PostgreSQL
```

**Côté TypeScript :**
```typescript
// Dériver les types depuis le schema Zod
const orderStatusSchema = z.enum(["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"])
type OrderStatus = z.infer<typeof orderStatusSchema>
```

## Transactions

```typescript
// Supabase ne supporte pas les transactions directement via le SDK
// Utiliser une fonction PostgreSQL pour les opérations atomiques
const { data, error } = await supabase.rpc("transfer_funds", {
  from_account: fromId,
  to_account: toId,
  amount: 1000,
})
```

```sql
-- SECURITY DEFINER s'exécute avec les droits du propriétaire : RLS est contournée par
-- construction. Une fonction SECURITY DEFINER est une API publique — elle doit valider
-- l'appelant elle-même, sinon n'importe quel compte connecté peut agir sur les données
-- d'un tiers en appelant simplement supabase.rpc().
CREATE OR REPLACE FUNCTION public.transfer_funds(
  from_account uuid, to_account uuid, amount integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''   -- sans ça, un search_path hostile détourne les noms de tables
AS $$
BEGIN
  IF amount <= 0 THEN
    RAISE EXCEPTION 'Montant invalide';
  END IF;

  -- Validation de l'appelant : RLS ne s'applique pas ici, ce guard la remplace
  IF NOT EXISTS (
    SELECT 1 FROM public.accounts
    WHERE id = from_account AND user_id = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'Compte source non autorisé';
  END IF;

  -- Ordre verrouillé par id : deux transferts croisés simultanés ne peuvent pas se deadlock
  PERFORM 1 FROM public.accounts
   WHERE id IN (from_account, to_account) ORDER BY id FOR UPDATE;

  UPDATE public.accounts SET balance = balance - amount WHERE id = from_account;
  UPDATE public.accounts SET balance = balance + amount WHERE id = to_account;

  IF (SELECT balance FROM public.accounts WHERE id = from_account) < 0 THEN
    RAISE EXCEPTION 'Solde insuffisant';   -- rollback implicite de toute la fonction
  END IF;
END;
$$;

-- EXECUTE est accordé à `public` par défaut, donc à `anon`. Toujours révoquer puis
-- accorder explicitement.
REVOKE EXECUTE ON FUNCTION public.transfer_funds(uuid, uuid, integer) FROM public;
GRANT  EXECUTE ON FUNCTION public.transfer_funds(uuid, uuid, integer) TO authenticated;
```

### Règles `SECURITY DEFINER`

Toute fonction `SECURITY DEFINER` :
- déclare `SET search_path = ''` et qualifie ses tables en `public.<table>` (le linter Supabase le signale : `function_search_path_mutable`)
- valide `auth.uid()` contre chaque paramètre qui désigne une ressource — c'est le seul contrôle d'accès, RLS étant contournée
- est suivie d'un `REVOKE EXECUTE ... FROM public` puis d'un `GRANT` au rôle voulu

**Vérifiable :** dans un diff, tout `SECURITY DEFINER` sans les trois éléments ci-dessus est un défaut HAUTE.

## Soft Deletes

```sql
-- Pattern : colonne deleted_at + RLS qui exclut
ALTER TABLE items ADD COLUMN deleted_at timestamptz;

-- RLS : ne jamais montrer les supprimés
CREATE POLICY items_select_active ON items
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
```

```typescript
// Server Action : soft delete
export async function deleteItem(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("items")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
  // ...
}
```

## Indexes

**Vérifiable sur un diff — un index est créé dans la même migration pour :**
- toute colonne `*_id` référençant une autre table (PostgreSQL n'indexe **pas** les foreign keys)
- toute colonne utilisée dans un `.eq()`, `.in()`, `.order()` ou `.ilike()` d'une requête du diff
- toute colonne servant de curseur de pagination (index composé `(colonne, id)`)

**Ne pas indexer :** une colonne booléenne seule, une colonne jamais filtrée, une table de
référence figée de moins de 1 000 lignes. Un index inutile ralentit toutes les écritures.

```sql
-- Index simple
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Index composé (ordre = important)
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Index partiel (plus petit, plus rapide)
CREATE INDEX idx_orders_pending ON orders(created_at) WHERE status = 'pending';

-- Index full-text
CREATE INDEX idx_items_search ON items USING gin(to_tsvector('french', name || ' ' || description));
```

## N+1 Queries

```typescript
// MAUVAIS — N+1 : 1 requête + N requêtes dans la boucle
const { data: orders } = await supabase.from("orders").select("*")
for (const order of orders) {
  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", order.id)
}

// BON — 1 requête avec jointure
const { data: orders } = await supabase
  .from("orders")
  .select("*, order_items(*)")
```

## Seeds (développement)

```sql
-- supabase/seed.sql — données de développement
-- Exécuté avec : supabase db reset

INSERT INTO profiles (id, email, full_name, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@dev.local', 'Admin Dev', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'user@dev.local', 'User Dev', 'user');
```

**Règles :**
- UUIDs déterministes pour les seeds (facilite les tests)
- Jamais de données réelles dans les seeds
- Seeds documentés dans `supabase/seed.sql`

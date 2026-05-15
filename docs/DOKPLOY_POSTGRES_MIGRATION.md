# Dokploy PostgreSQL Migration

## Current reality

AppFit does not talk to PostgreSQL directly from the browser.

The current frontend depends on Supabase for:

- Auth (`supabase.auth.*`)
- PostgREST table access (`supabase.from(...)`)
- RPC functions (`supabase.rpc(...)`)
- Storage (`supabase.storage.from("avatars")`)

Because of that, copying schema/data from Supabase into Dokploy PostgreSQL is only a database migration, not a full backend migration.

If you point this frontend at a raw `postgresql://...` connection string, it will not work:

- Vite exposes only public browser variables
- browsers must not receive database credentials
- `@supabase/supabase-js` expects the Supabase HTTP API, not a raw PostgreSQL socket

## What can be migrated now

The repo already includes SQL files for most application tables and RPC logic:

- `supabase_setup.sql`
- `supabase_profile_setup.sql`
- `supabase_user_roles_admin.sql`
- `supabase_notifications.sql`
- `supabase_training_logbook.sql`
- `supabase_nutrition*.sql`
- `supabase_water_intake.sql`
- `supabase_sleep.sql`
- `supabase_advanced_metrics.sql`
- `supabase_dashboard_operational_snapshot_rpc.sql`
- `supabase_activity_snapshot_rpc.sql`

These files are suitable as the starting point for a Dokploy PostgreSQL replica, but they are not enough by themselves to replace Supabase because some of them assume:

- `auth.users`
- `auth.uid()`
- Supabase RLS behavior
- Supabase Storage metadata/policies

## Required inputs to perform the real copy

To replicate the live Supabase database into Dokploy PostgreSQL, you need one of these:

1. Direct PostgreSQL connection credentials for the source Supabase database.
2. A privileged Supabase access path that can export schema/data safely.

Public frontend variables are not sufficient.

## Recommended migration path

### Option A: Keep Supabase as API/Auth, use Dokploy PostgreSQL as replica

Use this when the immediate goal is backup, analytics, or preparing a later cutover.

1. Export schema/data from Supabase with privileged database access.
2. Restore into Dokploy PostgreSQL.
3. Re-apply repo SQL files selectively where the live schema is behind.
4. Keep the frontend unchanged, still using Supabase URL and publishable key.

This is the only safe near-term path without building a backend.

### Option B: Replace Supabase with your own backend

Use this only if the goal is to stop depending on Supabase.

You must add a server layer that provides:

- authentication/session handling
- REST or RPC endpoints for all service calls
- file storage for avatars
- equivalents for current RPC functions
- authorization replacing current RLS assumptions

Only after that can the frontend stop using `VITE_SUPABASE_*`.

## Minimum production checklist for a full cutover

Before switching away from Supabase, verify replacements for:

- `src/context/AuthContext.tsx`
- `src/pages/AuthCallback.tsx`
- `src/pages/ResetPassword.tsx`
- all `src/services/*.ts` modules that call `supabase.from(...)`
- all `src/services/*.ts` modules that call `supabase.rpc(...)`
- avatar upload flow in `src/context/AuthContext.tsx`

## Suggested operational commands

With valid privileged source credentials, the flow would be conceptually:

1. dump source schema/data
2. restore into Dokploy PostgreSQL
3. apply app SQL deltas that are still missing
4. validate tables, functions, and counts

Do not run the frontend against the raw PostgreSQL URL directly.

# Role-Based Access Control for Project Finish Line

Give admins fine-grained control over what team members can see and do, while keeping security enforced at the database level (not just the UI).

## 1. Role model

Extend the `app_role` enum from `admin` → 5 roles:

| Role | Read | Write operational (shipments, containers, tracking, borders, PODs, fleet, incidents) | Read financial (costs, claims, customers) | Write financial | Manage users/roles |
|---|---|---|---|---|---|
| **admin** | all | yes | yes | yes | yes |
| **manager** | all | yes | yes | yes | no |
| **dispatcher** | operational | yes | no | no | no |
| **viewer** | operational | no | no | no | no |
| **driver** | (record only — no login) | — | — | — | — |

`driver` stays in the enum for future use but is not assignable to a login account right now.

## 2. Database changes (one migration)

- `ALTER TYPE app_role ADD VALUE` for `manager`, `dispatcher`, `viewer` (driver kept).
- **Drop and rewrite RLS policies** on all 11 data tables using `public.has_role()`:
  - Operational tables (shipments, containers, tracking_events, border_crossings, pods, fleet_units, incidents): SELECT for any of the 4 logged-in roles; INSERT/UPDATE/DELETE for admin + manager + dispatcher.
  - Financial tables (costs, claims, customers, drivers): SELECT + write restricted to admin + manager.
  - `user_roles`: SELECT for self + admin; INSERT/UPDATE/DELETE admin only.
- **New `role_audit_log` table**: who, target user, old_role, new_role, action (granted/revoked), timestamp. RLS: admin-only SELECT; INSERT via trigger.
- **Trigger** on `user_roles` that auto-writes to `role_audit_log` on insert/delete, capturing `auth.uid()` as the actor.
- GRANT statements for every new/altered table per Lovable Cloud rules.

## 3. Server functions (`src/lib/admin.functions.ts`)

All protected with `requireSupabaseAuth` + an admin check:

- `listTeamMembers()` → joins `auth.users` (via admin client) + `user_roles` → returns email, created_at, roles[].
- `createTeamMember({ email, password, role })` → uses `supabaseAdmin.auth.admin.createUser({ email_confirm: true })`, then inserts into `user_roles`.
- `updateMemberRole({ userId, role })` → replaces role in `user_roles` (trigger logs it).
- `removeTeamMember({ userId })` → `supabaseAdmin.auth.admin.deleteUser(userId)`.
- `listRoleAuditLog({ limit, cursor })` → reads `role_audit_log` joined with user emails.

Each function early-returns 403 if caller is not admin.

## 4. Admin UI (rebuild `src/routes/_authenticated/admin.tsx`)

Three tabs:

1. **Team members** — table of users (email, role badge, created date), "Add member" dialog (email + temp password + role dropdown), inline role dropdown to change role, delete button with confirm.
2. **Role permissions** — read-only matrix showing what each role can do (the table from section 1) so admins know what they're granting.
3. **Audit log** — paginated list of role changes: "Admin X granted manager to Y on <date>".

## 5. Frontend role gates (UX layer)

- New `useUserRole()` hook → fetches current user's roles once, caches in TanStack Query.
- `<RoleGate roles={["admin","manager"]}>` wrapper component to hide buttons/sections.
- Sidebar nav: hide Costs/Claims/Customers/Drivers links for dispatcher/viewer; hide Admin link for non-admins.
- Disable "New" / "Delete" buttons on list pages for `viewer`.

Security still enforced by RLS — UI hiding is convenience only.

## 6. Out of scope (call out, don't build)

- Email-based invite flow (admin creates accounts directly per your choice).
- 2FA for admins (can add later via Supabase Auth settings).
- Per-row ownership for dispatchers (all dispatchers see all operational rows; row-level scoping can come later if you need branch/region separation).

---

## Technical notes

- Migration must add enum values in a **separate transaction** before they're used in policies — Postgres requires this. Two-step: (1) add enum values, (2) (in a follow-up migration after the first is approved) rewrite policies.
- `supabaseAdmin` is loaded inside handlers via `await import()` per Lovable Cloud rules.
- Existing pages already use `has_role(auth.uid(), 'admin')` for writes — the migration relaxes those to include `manager`/`dispatcher` where appropriate, so current admin workflows keep working.
- The audit log trigger uses `SECURITY DEFINER` with `search_path = public` and captures `auth.uid()` via `current_setting('request.jwt.claims', true)::jsonb->>'sub'` fallback for service-role contexts.

Approve and I'll execute migration → server functions → admin UI → role gates, in that order.
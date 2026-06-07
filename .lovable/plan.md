## Goal

Turn the app from an in-memory page switcher into a real, persistent product:
1. **Functional backend** — Lovable Cloud with persistent data + auth.
2. **Real routing** — each of the 18 sections becomes its own URL.

---

## Part 1 — Real routing

Convert `AppShell` from a `useState<PageId>` switcher into a layout route with child routes. Each "page" becomes a file in `src/routes/`.

```
src/routes/
  __root.tsx                  (unchanged)
  index.tsx                   -> redirect to /dashboard
  _app.tsx                    (new layout: sidebar + header + <Outlet/>)
  _app.dashboard.tsx
  _app.shipments.tsx
  _app.containers.tsx
  _app.fleet.tsx
  _app.drivers.tsx
  _app.tracking.tsx
  _app.gps.tsx
  _app.incidents.tsx
  _app.borders.tsx
  _app.pods.tsx
  _app.documents.tsx
  _app.costs.tsx
  _app.claims.tsx
  _app.customers.tsx
  _app.analytics.tsx
  _app.reports.tsx
  _app.settings.tsx
  _app.admin.tsx
```

- Sidebar items become `<Link to="/shipments">` etc. with `activeProps` for highlight.
- Header title comes from the matched route's `head()` / a small static map.
- Page content gets deep links, refresh-safe URLs, and per-page SEO meta.

## Part 2 — Functional backend (Lovable Cloud)

Enable Cloud, then add:

**Auth**
- Email/password login at `/auth` (managed by Cloud).
- Wrap the app layout in `_authenticated/` so the whole product requires login. Redirect to `/auth` when signed out.

**Database tables** (Postgres, RLS on, per-user scoped via `owner_id = auth.uid()`):
- `shipments`, `fleet_units`, `incidents`, `containers`, `drivers`, `tracking_events`, `border_crossings`, `pods`, `costs`, `claims`, `customers`

Each table gets the standard `GRANT … TO authenticated`, RLS policies for select/insert/update/delete scoped to the signed-in user, and `service_role` access.

**Data layer**
- Replace `useStore` (in-memory) with TanStack Query hooks calling `createServerFn` functions (`requireSupabaseAuth` middleware) — one file per resource under `src/lib/*.functions.ts`.
- Mutations invalidate the matching query keys so the UI updates instantly.

**Seed**
- Add a one-click "Load demo data" button in Settings that inserts ~20 shipments, 8 fleet units, 5 incidents for the current user so the dashboard isn't empty.

---

## Technical notes

- Sidebar/header live in `_app.tsx`; each child route just returns its page component.
- Existing page components keep their props shape — the route wrapper supplies data from `useQuery` instead of `useStore`.
- `ssr: false` stays on routes that use browser-only chart libs.
- Badge counts (delayed shipments, open incidents, pending PODs) computed in `_app.tsx` from the same queries.

## Scope I'm NOT doing in this pass

- Role-based admin gating (just a placeholder page).
- File uploads for POD/invoice/customs docs (Cloud Storage).
- Realtime subscriptions.
- Cross-user collaboration (everything is owner-scoped).

These can come next once the routing + persistence foundation is in.

---

Approve and I'll ship it in one go: enable Cloud → create tables → add auth → convert routes → wire data.

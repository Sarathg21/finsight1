# Admin RBAC integration review — 15 Oct 2026

## Changes made in this pass
- Added independent `ProtectedRoute` wrappers to each `/admin` child route. `admin` routes use the existing shared `USER_MANAGEMENT` mapping; `master-data` uses the existing `MASTER_DATA` mapping. No role-name bypass was added.
- Improved shared Axios error messages for 400, 403, 409, 422 and server 5xx responses. A backend 403 message that explicitly identifies a read-only/write-disabled integration environment is preserved and is not mislabeled as missing `can_admin`. Existing 401 session-expiry flow is retained.

## Existing checks observed in the supplied ZIP
- `RolesDashboard.jsx` checks `canAdmin('USER_MANAGEMENT')` before role status changes and gates role controls.
- `UsersDashboard.jsx` checks the current user's explicit `USER_MANAGEMENT` permission and checks admin before edit/status handlers.
- `UserAccessManagement.jsx` uses `canAdmin('USER_MANAGEMENT')` before saving scopes. This module mapping is NOT confirmed by the manager spec and requires backend/Sarath confirmation.
- `MasterDataDashboard.jsx` checks explicit `MASTER_DATA.can_view` and `canAdmin('MASTER_DATA')` for write handlers.

## Still pending / cannot be claimed complete
- Confirm exact module/action mapping for role permission changes, user-role assignment, user status changes and access scopes. The specification explicitly says not to assume `USER_MANAGEMENT` governs all Admin functions.
- Confirm and test role-permission PUT UI/handler path; the active `RolesDashboard.jsx` inspected here exposes role create/update/status code, but a verified permission-grid save path was not found in this page's active code.
- Confirm all create/edit/assign/status/upload/export handlers and server-side authorization on each endpoint. Frontend gates do not replace backend authorization.
- Confirm scope stable IDs, parent-child validation and readback behavior.
- Run A01–A18 with recorded mocked vs actual results.
- Test persisted writes only on an approved writable non-production environment. Do not write to port 8011 or production port 8000.
- Build was attempted but could not run in this Linux sandbox because the supplied `node_modules` lacks `@rollup/rollup-linux-x64-gnu` (Rollup optional dependency). This is an environment/dependency issue; build is not marked passing.

## Required follow-up
Get confirmed backend module/action codes, endpoint schemas and writable test environment approval, then finish action-level gates and acceptance tests.

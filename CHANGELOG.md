# FinSight Project Change Log

## Phase 1 Frontend API & RBAC Stabilization

### 1. API Client Strategy & Proxy Fallback
* **Standard:** All current and future API clients must use the common src/utils/apiBase.js configuration (piCall / piCallWithAuth). 
* **Reasoning:** Prevents "Mixed Content" errors in Vercel production by routing requests through local endpoints (e.g., /api/*) when on HTTPS. Vercel then proxies these to the EC2 backend via pi/proxy.js and ercel.json. Do not hardcode external IPs into individual UI modules (e.g., plApi.js, sApi.js).

### 2. Centralized Frontend Authorization Standard
* **Page Access:** module_permissions dictates whether a user can access a module/page. This is strictly enforced at the routing level by ProtectedRoute.jsx via canAccess(pageKey, 'VIEW'). This blocks direct URL navigation.
* **Data Access:** ccess_scopes strictly dictates data filtering (Legal Group, Entity, Division, Sub-Division). ProtectedRoute does **not** use ccess_scopes for page blocking.
* **Module Exports:** Component export functionality strictly checks canAccess(pageKey, 'EXPORT').

### 3. Backend Period Representation Standard
* **Standard:** Endpoints must expose the user-facing period as period_name (e.g., Jun-26) while preserving the underlying point-in-time sequential identifier as period (e.g., 2026-06) for queries and chronological sorting.

### 4. Common FinSight Hierarchy Filters
* **Standard:** API query parameters across all Phase 1 modules must uniformly accept legal_group, legal_entity, parent_division, and subdivision (both by ID arrays and direct Name mapping) to standardize the contract between the React frontend and FastAPI backend.

---
**Status:** Adopted for Sales Revenue, P&L, and Balance Sheet. 
**Next Steps:** Replicate this pattern strictly across Receivables, Payables, Inventory, and Working Capital.

### 5. Multi-Select & Filter Alignment
* **Standard:** Multi-select frontend dropdowns map directly to repeated query parameters (e.g., `legal_entity_id=1&legal_entity_id=2`) exactly matching FastAPI `Query(default=[])` bindings.
* **Reasoning:** Enforces strict HTTP query standards and unifies backend parameter extraction.

### 6. Point-in-Time Statement Integrity (Balance Sheet)
* **Standard:** Balance Sheet endpoints and UI strictly respect period-end snapshots. No YTD accumulation or summation of balances is permitted.

### 7. Server-Side Export Authorization
* **Standard:** All exports are generated server-side securely via `/{report_name}/export` and inherit standard RBAC (`can_export`). No client-side JSON-to-CSV generation.

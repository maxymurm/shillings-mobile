# Memory — Shillings Mobile
> Always read this file first. Update after every phase.
> **⚠️ See `AUTONOMOUS_EXECUTION_PROMPT.md` for full execution plan.**

---

## 🔁 PARALLEL PARITY RULE — MANDATORY (Effective 2026-03-16)

**Every change in this project MUST have a corresponding change in the backend/web project in the same session.**
- Features, bug fixes, terminology changes, docs → apply to both projects
- GitHub issues scoped for one project → create equivalent issues for the other
- Autonomous prompts MUST include tasks for both projects
- Commits must be paired: one in `shillings-mobile/main`, one in `shillings/develop`
- Exception: platform-specific features (biometrics, native camera on mobile; Filament admin, file import on web) are exempt but must be noted

**Backend + Web project:** `c:\Users\maxmm\Herd\shillings` | `develop` branch | https://github.com/maxymurm/shillings

---

---

## Project Identity
- **Repo:** https://github.com/maxymurm/shillings-mobile
- **Local:** `c:\Users\maxmm\shillings-mobile`
- **Backend:** `c:\Users\maxmm\Herd\shillings` (Laravel API — READ ONLY)
- **Branch:** `main`
- **Developer:** Maxwell Murunga (@maxymurm)
- **App ID:** `io.shillings.app`

## Tech Stack
- Ionic 8 + Capacitor 6
- Vue 3 + TypeScript (Composition API)
- Pinia (state management)
- Dexie.js (IndexedDB offline)
- Axios + Laravel Sanctum (auth)
- Vitest + Cypress (testing)

## Phases Status

| Phase | Description | Status | Issues |
|-------|-------------|--------|--------|
| 1 | Project Setup & Infrastructure | ✅ Complete | #1–#8 |
| 2 | Authentication & User Management | ✅ Complete | #9–#14, #105 |
| 3 | Navigation Shell & Dashboard | ✅ Complete | #16–#21 |
| 4 | Accounts Management | ✅ Complete | #22–#27 |
| 5 | Transactions — View & List | ✅ Complete | #28–#33 |
| 6 | Transactions — Create & Edit | ✅ Complete | #34–#41 |
| 7 | Offline Storage & Sync | ✅ Complete | #42–#49 |
| 8 | Contacts & Documents | ✅ Complete | #50–#57 |
| 9 | Reports & Charts | ✅ Complete | #58–#64 |
| 10 | Scheduled Transactions & Budgets | ✅ Complete | #65–#70 |
| 11 | Native Features (Camera, Biometrics) | ✅ Complete | #71–#78 |
| 12 | Push Notifications | ✅ Complete | #79–#84 |
| 13 | Testing & QA | ✅ Complete | #85–#92 |
| 14 | iOS App Store Submission | ✅ Complete | #93–#98 |
| 15 | Android Play Store Submission | ✅ Complete | #99–#104 |

**ALL 15 PHASES COMPLETE — 70 tests passing — 104 issues closed**

## Critical Code Patterns

### Money/Fractions (ALWAYS)
```typescript
// Backend stores: amount_num (int), amount_denom (int, always 100)
// Display: amount_num / amount_denom = decimal
const displayAmount = split.amount_num / split.amount_denom; // e.g. 5000/100 = 50.00
// NEVER send floats. ALWAYS convert: parseFloat(input) * 100 = amount_num
const amount_num = Math.round(parseFloat(userInput) * 100);
const amount_denom = 100;
```

### API Auth Pattern
```typescript
// Token stored in Capacitor Preferences (NOT localStorage)
const { value: token } = await Preferences.get({ key: 'auth_token' });
```

### Offline-First Pattern
```typescript
try {
  const response = await api.get('/accounts');
  await db.accounts.bulkPut(response.data.data); // cache
  return response.data.data;
} catch {
  return await db.accounts.toArray(); // fallback to cache
}
```

## Backend API Key Endpoints
```
POST /api/auth/login           → token
POST /api/auth/logout          
GET  /api/user                 → user profile
GET  /api/accounts             → paginated, ?company_id=X
GET  /api/transactions         → paginated
POST /api/transactions         → create
GET  /api/sync/status          
POST /api/sync/batch           → upload offline queue
GET  /api/sync/changes         → ?since=timestamp
POST /api/push-subscriptions   → register push token
GET  /api/reports/summary      → net worth, income, expenses
```

---
*Last Updated: 2026-03-16 — Parallel Parity Rule established. Org switcher (OrgSwitcher.vue), dashboard integration, and enhanced Account Register (landing view + drill-down) implemented. All 15 phases complete.*

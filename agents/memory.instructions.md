# Memory — Shillings Mobile
> Always read this file first. Update after every phase.
> **⚠️ See `AUTONOMOUS_EXECUTION_PROMPT.md` for full execution plan.**

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
| 1 | Project Setup & Infrastructure | 🔲 Not Started | #1–#8 |
| 2 | Authentication & User Management | 🔲 Not Started | #9–#15 |
| 3 | Navigation Shell & Dashboard | 🔲 Not Started | #16–#21 |
| 4 | Accounts Management | 🔲 Not Started | #22–#27 |
| 5 | Transactions — View & List | 🔲 Not Started | #28–#33 |
| 6 | Transactions — Create & Edit | 🔲 Not Started | #34–#41 |
| 7 | Offline Storage & Sync | 🔲 Not Started | #42–#49 |
| 8 | Contacts & Documents | 🔲 Not Started | #50–#57 |
| 9 | Reports & Charts | 🔲 Not Started | #58–#64 |
| 10 | Scheduled Transactions & Budgets | 🔲 Not Started | #65–#70 |
| 11 | Native Features (Camera, Biometrics) | 🔲 Not Started | #71–#78 |
| 12 | Push Notifications | 🔲 Not Started | #79–#84 |
| 13 | Testing & QA | 🔲 Not Started | #85–#92 |
| 14 | iOS App Store Submission | 🔲 Not Started | #93–#98 |
| 15 | Android Play Store Submission | 🔲 Not Started | #99–#104 |

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
*Last Updated: Phase 0 (scaffold created, pre-implementation)*

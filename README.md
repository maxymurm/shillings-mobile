# Shillings Mobile

> iOS and Android app for [Shillings](https://github.com/maxymurm/shillings) — the offline-first double-entry accounting platform.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Overview

Shillings Mobile is an **Ionic/Capacitor** app that wraps the Shillings PWA with native iOS and Android capabilities. It shares the same Laravel backend API as the web app.

**Tech Stack:**
- **Framework:** Ionic 8 + Capacitor 6
- **Frontend:** Vue 3 + TypeScript + Composition API
- **State:** Pinia
- **Offline:** Dexie.js (IndexedDB) — shared with Shillings web
- **Styling:** Ionic CSS Variables + Tailwind-compatible utilities
- **Backend:** Shillings Laravel API (shared)
- **Auth:** Laravel Sanctum tokens stored in Capacitor Preferences

## Ecosystem Layout

```
Herd/shillings/                  ← Laravel backend (API source of truth)
  └── mobile-symlink/            ← Symlink → this project
~/shillings-mobile/              ← THIS PROJECT (iOS + Android)
  ├── parent_shillings/          ← Symlink → Herd/shillings
  └── src/
      └── offline/               ← Symlink → Herd/shillings/resources/js/offline
```

**Backend API:** `https://app.shillings.io/api`  
**GitHub (backend):** https://github.com/maxymurm/shillings  
**GitHub (mobile):** https://github.com/maxymurm/shillings-mobile

## Cross-Platform Documentation

The Shillings ecosystem spans three platforms. For integrated development guidance:

- **[ECOSYSTEM.md](../Herd/shillings/docs/ECOSYSTEM.md)** (backend repo) — Architecture, shared code, API contracts, development workflow
- **[FEATURE_PARITY_MATRIX.md](../Herd/shillings/docs/FEATURE_PARITY_MATRIX.md)** (backend repo) — Feature comparison across Web, PWA, and Mobile

## Project Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Project Setup & Infrastructure |
| Phase 2 | ✅ Complete | Authentication & User Management |
| Phase 3 | ✅ Complete | Navigation Shell & Dashboard |
| Phase 4 | ✅ Complete | Accounts Management |
| Phase 5 | ✅ Complete | Transactions - View & List |
| Phase 6 | ✅ Complete | Transactions - Create & Edit |
| Phase 7 | ✅ Complete | Offline Storage & Sync |
| Phase 8 | ✅ Complete | Contacts & Documents |
| Phase 9 | ✅ Complete | Reports & Charts |
| Phase 10 | ✅ Complete | Scheduled Transactions & Budgets |
| Phase 11 | ✅ Complete | Native Features (Camera, Biometrics) |
| Phase 12 | ✅ Complete | Push Notifications |
| Phase 13 | ✅ Complete | Testing & QA (70 tests passing) |
| Phase 14 | ✅ Complete | iOS App Store Submission |
| Phase 15 | ✅ Complete | Android Play Store Submission |

## Requirements

- Node.js 20+
- npm 10+
- Ionic CLI: `npm install -g @ionic/cli`
- Capacitor CLI: included as devDependency
- **iOS:** Xcode 15+ (macOS only)
- **Android:** Android Studio + JDK 17

## Quick Start

```bash
# 1. Clone
git clone https://github.com/maxymurm/shillings-mobile.git
cd shillings-mobile

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Shillings API URL

# 4. Run in browser
ionic serve

# 5. Build for iOS
npx cap add ios
npx cap build ios
npx cap open ios   # Opens Xcode

# 6. Build for Android
npx cap add android
npx cap build android
npx cap open android   # Opens Android Studio
```

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Shillings
VITE_APP_VERSION=1.0.0
```

## Project Structure

```
shillings-mobile/
├── src/
│   ├── app.vue                 # Root component
│   ├── main.ts                 # App entry, Ionic setup, Pinia
│   ├── router/
│   │   └── index.ts            # Vue Router with tab routes
│   ├── stores/
│   │   ├── auth.ts             # Login/logout/token
│   │   ├── accounts.ts         # Account list/detail
│   │   ├── transactions.ts     # Transaction CRUD
│   │   ├── contacts.ts         # Contacts state
│   │   └── sync.ts             # Offline sync status
│   ├── services/
│   │   ├── api.ts              # Axios instance with Sanctum auth
│   │   ├── auth.ts             # Auth service
│   │   ├── storage.ts          # Capacitor Preferences wrapper
│   │   └── biometric.ts        # Face ID / fingerprint
│   ├── offline/                # Symlink → ../parent_shillings/resources/js/offline
│   │   ├── database.ts         # Dexie.js IndexedDB schema
│   │   ├── sync.ts             # Background sync
│   │   └── ...
│   ├── views/
│   │   ├── auth/
│   │   │   ├── LoginPage.vue
│   │   │   └── ForgotPasswordPage.vue
│   │   ├── home/
│   │   │   └── DashboardPage.vue
│   │   ├── accounts/
│   │   │   ├── AccountListPage.vue
│   │   │   └── AccountDetailPage.vue
│   │   ├── transactions/
│   │   │   ├── TransactionListPage.vue
│   │   │   ├── TransactionDetailPage.vue
│   │   │   └── TransactionCreatePage.vue
│   │   ├── contacts/
│   │   │   ├── ContactListPage.vue
│   │   │   └── ContactDetailPage.vue
│   │   ├── reports/
│   │   │   └── ReportsPage.vue
│   │   └── settings/
│   │       └── SettingsPage.vue
│   └── components/
│       ├── MoneyInput.vue       # Fraction-based money input
│       ├── SplitEditor.vue      # Double-entry split editor
│       ├── OfflineBadge.vue     # Sync status indicator
│       └── ...
├── ios/                        # Generated by Capacitor
├── android/                    # Generated by Capacitor
├── public/
├── capacitor.config.ts
├── ionic.config.json
├── vite.config.ts
└── package.json
```

## Offline Architecture

Shillings Mobile uses the same offline modules as the web PWA:

- **IndexedDB** via Dexie.js for local storage
- **Background sync** with exponential backoff
- **Conflict resolution** (LOCAL_WINS / SERVER_WINS / MANUAL)
- **Optimistic UI** — transactions created offline immediately visible

## Native Features (via Capacitor)

| Feature | Plugin | Status |
|---------|--------|--------|
| Receipt Camera | `@capacitor/camera` | Phase 11 |
| Biometric Auth | `@aparajita/capacitor-biometric-auth` | Phase 11 |
| Push Notifications | `@capacitor/push-notifications` | Phase 12 |
| Local Notifications | `@capacitor/local-notifications` | Phase 12 |
| File System | `@capacitor/filesystem` | Phase 11 |
| Secure Storage | `@capacitor/preferences` | Phase 2 |
| Network Status | `@capacitor/network` | Phase 7 |
| Status Bar | `@capacitor/status-bar` | Phase 3 |
| Haptics | `@capacitor/haptics` | Phase 3 |

## Related Projects

- **Backend:** [shillings](https://github.com/maxymurm/shillings) — Laravel 12 API
- **Reference:** [akaunting](../akaunting/) — Accounting reference
- **Reference:** [gnucash](../gnucash/) — Accounting reference

## License

MIT License — see [LICENSE](LICENSE)

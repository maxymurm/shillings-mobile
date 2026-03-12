# Autonomous Execution Prompt — Shillings Mobile (Ionic/Capacitor)

**Version:** 1.0  
**Date:** March 12, 2026  
**Mode:** YOLO / Full Autonomous — Bypass ALL manual prompts  
**Project:** Shillings Mobile (Ionic/Vue/Capacitor) on branch `main`

---

## HOW TO START — COPY THIS INTO OPUS

```
Read this file completely, then execute it autonomously from start to finish:
/Users/maxmm/shillings-mobile/agents/AUTONOMOUS_EXECUTION_PROMPT.md

Then also read:
1. agents/memory.instructions.md (if exists)
2. README.md
3. parent_shillings/.github/copilot-instructions.md

Start from the lowest-numbered open Phase. YOLO mode — no user input required.
Commit and push after every phase. Close GitHub issues as you complete them.
Update README.md, agents/memory.instructions.md, and related docs after every phase.
Tell me what you accomplished and what remains when you finish or get blocked.
Go.
```

---

## AGENT PERMISSIONS — FULL YOLO MODE

- ✅ Create, modify, delete any files in this project
- ✅ Commit and push to Git with logical conventional commit messages
- ✅ Create, close, update GitHub issues and project boards
- ✅ Run npm/ionic/npx commands
- ✅ Make ALL architectural decisions independently
- ✅ Bypass ALL prompts — prefill values automatically
- ❌ Do NOT stop for user confirmation
- ❌ Do NOT modify parent_shillings/ (read-only reference)

---

## ECOSYSTEM LAYOUT

```
c:\Users\maxmm\Herd\shillings\           ← Laravel backend (API source of truth, READ-ONLY from here)
c:\Users\maxmm\shillings-mobile\         ← THIS PROJECT (iOS + Android)
c:\Users\maxmm\OneDrive\المستندات\Clients\akaunting\  ← Accounting reference
c:\Users\maxmm\OneDrive\المستندات\Clients\gnucash\    ← Accounting reference
```

**Symlinks from shillings-mobile root:**
```
parent_shillings/  → c:\Users\maxmm\Herd\shillings
src/offline/       → c:\Users\maxmm\Herd\shillings\resources\js\offline
```

**Remotes:**
- Mobile: `https://github.com/maxymurm/shillings-mobile` (branch: `main`)
- Backend: `https://github.com/maxymurm/shillings` (branch: `develop`)

**Project Board:** https://github.com/users/maxymurm/projects/9 (Shillings Mobile Dev Board)

---

## PROJECT STATUS (March 12, 2026)

### Architecture Decision
- **Framework:** Ionic 8 + Capacitor 6
- **Language:** Vue 3 + TypeScript (Composition API)
- **State:** Pinia
- **Offline:** Dexie.js (shared with Shillings web PWA)
- **Auth:** Laravel Sanctum tokens via Capacitor Preferences
- **Styling:** Ionic CSS Variables + Tailwind-compatible

### Backend API (parent_shillings/)
The full API is already built. Key endpoints:
```
POST /api/auth/login           → Returns Sanctum token
GET  /api/accounts             → Account list (paginated)
GET  /api/transactions         → Transaction list
POST /api/transactions         → Create transaction
GET  /api/sync/status          → Sync status
POST /api/sync/batch           → Upload offline changes
GET  /api/sync/changes         → Download changes since timestamp
POST /api/push-subscriptions   → Register push notification
```

See `parent_shillings/routes/api.php` for full route list.
See `parent_shillings/docs/api/API_DOCUMENTATION.md` for full API docs.

### Money/Precision Rules (CRITICAL)
Shillings uses fraction-based money. Backend stores:
- `amount_num` (integer numerator)
- `amount_denom` (integer denominator, always 100)
- Display: `amount_num / amount_denom` = decimal amount

**NEVER send floating-point amounts directly. Always use fractions.**

---

## COMMIT CONVENTIONS

```
feat: description (fixes #NNN)     ← new feature
fix: description (fixes #NNN)      ← bug fix  
refactor: description              ← structural change
docs: description                  ← documentation only
test: description                  ← tests only
chore: description                 ← build, deps, config
```

---

## BUILD VERIFICATION

Run after EVERY change:

```bash
# Browser dev server (always works, no native required)
npm run dev

# TypeScript type check
npm run build -- --noEmit 2>&1 | tail -10

# After cap sync (needed before iOS/Android)
npx cap sync

# iOS (macOS only, after adding iOS platform)
npx cap build ios 2>&1 | tail -5

# Android
npx cap build android 2>&1 | tail -5
```

---

## RESUME PROTOCOL

If execution stops for ANY reason:

```bash
cd c:\Users\maxmm\shillings-mobile

# 1. Check git state
git log --oneline -5
git status

# 2. Check open issues
gh issue list --state open -L 30 --json number,title

# 3. Find current phase — lowest open issue number = current step

# 4. Read memory
Get-Content agents/memory.instructions.md

# 5. Verify build
npm run build -- --noEmit 2>&1 | tail -5

# 6. Resume from lowest-numbered open issue
```

---

## PBXPROJ / GRADLE SAFETY

For iOS `project.pbxproj`:
1. NEVER use broad regex across entire file
2. ALWAYS run `npx cap build ios` immediately after any pbxproj change
3. ALWAYS restore with `git checkout -- ios/App/App.xcodeproj/project.pbxproj` if build fails

For Android `build.gradle`:
1. Always run `npx cap build android` after changes
2. Restore with `git checkout -- android/` if build fails

---

# PHASE EXECUTION PLAN

---

## Phase 1 — Project Setup & Infrastructure
**Issues:** #1–#8  
**Goal:** Working Ionic project with Capacitor, CI/CD, and base structure

### Step 1.1 — Issue #1: Initialize Ionic/Vue Project

```bash
cd c:\Users\maxmm\shillings-mobile

# Install Ionic CLI
npm install -g @ionic/cli

# Initialize project in current directory (package.json already exists)
npm install

# Verify Ionic + Vue is in node_modules
npx ionic --version
```

**Expected:** Ionic CLI responds with version number.

Create these files exactly:

**`src/main.ts`:**
```typescript
import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';

// Ionic core CSS
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/display.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/padding.css';
import 'ionicons/icons';

// Theme
import './theme/variables.css';

const app = createApp(App)
  .use(IonicVue)
  .use(createPinia())
  .use(router);

router.isReady().then(() => app.mount('#app'));
```

**`src/App.vue`:**
```vue
<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
</script>
```

**`index.html`:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Shillings</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

**`vite.config.ts`:**
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**`tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "preserve",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

**`src/theme/variables.css`:**
```css
:root {
  --ion-color-primary: #10b981;
  --ion-color-primary-rgb: 16,185,129;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-contrast-rgb: 255,255,255;
  --ion-color-primary-shade: #0ea371;
  --ion-color-primary-tint: #28c08e;
  --ion-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  --ion-background-color: #ffffff;
  --ion-background-color-rgb: 255,255,255;
  --ion-text-color: #1f2937;
  --ion-text-color-rgb: 31,41,55;
}

@media (prefers-color-scheme: dark) {
  body {
    --ion-background-color: #0f172a;
    --ion-background-color-rgb: 15,23,42;
    --ion-text-color: #f1f5f9;
    --ion-text-color-rgb: 241,245,249;
  }
}
```

Commit: `chore: initialize Ionic Vue project with Capacitor config (fixes #1)`
Close issue #1.

---

### Step 1.2 — Issue #2: Base Router

Create `src/router/index.ts`:
```typescript
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/tabs/dashboard' },
  {
    path: '/login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/tabs',
    component: () => import('@/views/TabsLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/tabs/dashboard' },
      { path: 'dashboard', component: () => import('@/views/home/DashboardPage.vue') },
      { path: 'accounts', component: () => import('@/views/accounts/AccountListPage.vue') },
      { path: 'accounts/:id', component: () => import('@/views/accounts/AccountDetailPage.vue') },
      { path: 'transactions', component: () => import('@/views/transactions/TransactionListPage.vue') },
      { path: 'transactions/create', component: () => import('@/views/transactions/TransactionCreatePage.vue') },
      { path: 'transactions/:id', component: () => import('@/views/transactions/TransactionDetailPage.vue') },
      { path: 'contacts', component: () => import('@/views/contacts/ContactListPage.vue') },
      { path: 'reports', component: () => import('@/views/reports/ReportsPage.vue') },
      { path: 'settings', component: () => import('@/views/settings/SettingsPage.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) return '/login';
  if (to.meta.requiresGuest && authStore.isAuthenticated) return '/tabs/dashboard';
});

export default router;
```

Commit: `feat: add Vue Router with auth guards and tab routes (fixes #2)`

---

### Step 1.3 — Issue #3: API Service Layer

Create `src/services/api.ts`:
```typescript
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const { value: token } = await Preferences.get({ key: 'auth_token' });
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await Preferences.remove({ key: 'auth_token' });
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

Commit: `feat: add Axios API service with Sanctum token injection (fixes #3)`

---

### Step 1.4 — Issues #4–#8: CI/CD, GitHub Actions, Capacitor Platforms

**Issue #4:** Create `.github/workflows/build.yml`:
```yaml
name: Build & Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm install
      - run: npm run build
      - run: npm test -- --run
```

**Issue #5:** Create Capacitor platforms
```bash
npx cap add ios
npx cap add android
npx cap sync
```

**Issues #6–#8:** App icons, splash screens, lint config.

After all setup issues complete:
Commit: `chore: add CI/CD, Capacitor platforms, app icons, lint config (fixes #4 #5 #6 #7 #8)`
Close issues #4–#8.

---

## Phase 2 — Authentication & User Management
**Issues:** #9–#15  
**Goal:** Login, logout, token storage, biometric auth

### Step 2.1 — Issue #9: Auth Pinia Store

Create `src/stores/auth.ts`:
```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Preferences } from '@capacitor/preferences';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<any>(null);

  const isAuthenticated = computed(() => !!token.value);

  async function init() {
    const { value } = await Preferences.get({ key: 'auth_token' });
    if (value) {
      token.value = value;
      await fetchUser();
    }
  }

  async function login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    token.value = response.data.token;
    user.value = response.data.user;
    await Preferences.set({ key: 'auth_token', value: token.value! });
    await Preferences.set({ key: 'user', value: JSON.stringify(user.value) });
  }

  async function logout() {
    await api.post('/auth/logout').catch(() => {});
    token.value = null;
    user.value = null;
    await Preferences.remove({ key: 'auth_token' });
    await Preferences.remove({ key: 'user' });
  }

  async function fetchUser() {
    const response = await api.get('/user');
    user.value = response.data;
  }

  return { token, user, isAuthenticated, init, login, logout, fetchUser };
});
```

---

### Step 2.2 — Issue #10: LoginPage.vue

Create `src/views/auth/LoginPage.vue`:
```vue
<template>
  <ion-page>
    <ion-content class="ion-padding" :fullscreen="true">
      <div class="login-container">
        <div class="logo-section">
          <ion-icon :icon="libraryOutline" class="logo-icon" />
          <h1>Shillings</h1>
          <p>Double-entry accounting</p>
        </div>

        <form @submit.prevent="handleLogin">
          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input v-model="email" type="email" required autocomplete="email" />
          </ion-item>

          <ion-item>
            <ion-label position="floating">Password</ion-label>
            <ion-input v-model="password" type="password" required autocomplete="current-password" />
          </ion-item>

          <ion-button expand="block" type="submit" :disabled="loading" class="ion-margin-top">
            <ion-spinner v-if="loading" name="crescent" />
            <span v-else>Sign In</span>
          </ion-button>

          <ion-button v-if="biometricAvailable" expand="block" fill="outline" @click="loginWithBiometric">
            <ion-icon slot="start" :icon="fingerprintOutline" />
            Use Face ID / Fingerprint
          </ion-button>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSpinner, toastController } from '@ionic/vue';
import { libraryOutline, fingerprintOutline } from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const loading = ref(false);
const biometricAvailable = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    await authStore.login(email.value, password.value);
    router.replace('/tabs/dashboard');
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.response?.data?.message || 'Login failed',
      duration: 3000,
      color: 'danger',
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
}

async function loginWithBiometric() {
  // Implemented in Phase 11
}
</script>
```

---

### Step 2.3 — Issues #11–#15: Logout, Profile, Company Selector, Token Refresh, Biometric Stub

Implement in order:
- `#11:` Settings page with logout button
- `#12:` Fetch and store user profile after login
- `#13:` Company context (selected company stored in Preferences, passed in API headers)
- `#14:` Token auto-refresh interceptor
- `#15:` Biometric auth stub (returns false, implemented properly in Phase 11)

Commit: `feat: authentication — login, logout, profile, company context (fixes #9 #10 #11 #12 #13 #14 #15)`
Close issues #9–#15.

---

## Phase 3 — Navigation Shell & Dashboard
**Issues:** #16–#21  
**Goal:** Working 5-tab app shell with dashboard summary cards

### Step 3.1 — Issue #16: TabsLayout

Create `src/views/TabsLayout.vue`:
```vue
<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dashboard" href="/tabs/dashboard">
          <ion-icon :icon="homeOutline" />
          <ion-label>Home</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="accounts" href="/tabs/accounts">
          <ion-icon :icon="walletOutline" />
          <ion-label>Accounts</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="transactions">
          <ion-icon :icon="addCircle" class="fab-icon" @click="openCreateTransaction" />
        </ion-tab-button>
        <ion-tab-button tab="contacts" href="/tabs/contacts">
          <ion-icon :icon="peopleOutline" />
          <ion-label>Contacts</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="settings" href="/tabs/settings">
          <ion-icon :icon="ellipsisHorizontalOutline" />
          <ion-label>More</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>
```

### Step 3.2 — Issue #17: DashboardPage Summary Cards

DashboardPage.vue shows:
- Net Worth card (total assets - liabilities)
- Income this month
- Expenses this month
- Quick action: "New Transaction" FAB
- Recent transactions list (last 5)
- Offline/sync status badge
- All data fetched from `/api/reports/summary` if online, or Dexie if offline

### Steps 3.3–3.6 — Issues #18–#21

- `#18:` OfflineBadge component (shows sync status, pending count)
- `#19:` Dark mode support via Capacitor OS dark mode detection
- `#20:` StatusBar and SafeArea padding for notch devices
- `#21:` Pull-to-refresh on all list pages

Commit: `feat: navigation shell, dashboard, offline badge (fixes #16 #17 #18 #19 #20 #21)`
Close issues #16–#21.

---

## Phase 4 — Accounts Management
**Issues:** #22–#27  
**Goal:** View, create, and edit the chart of accounts

### Step 4.1 — Issue #22: Accounts Store

Create `src/stores/accounts.ts`:
```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import { db } from '@/offline/database';

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([]);
  const loading = ref(false);

  async function fetchAccounts() {
    loading.value = true;
    try {
      const response = await api.get('/accounts');
      accounts.value = response.data.data;
      // Cache in IndexedDB for offline
      await db.accounts.bulkPut(accounts.value);
    } catch {
      // Offline: load from cache
      accounts.value = await db.accounts.toArray();
    } finally {
      loading.value = false;
    }
  }

  return { accounts, loading, fetchAccounts };
});
```

### Step 4.2 — Issues #23–#27: Account Views

- `#23:` AccountListPage — grouped by type (Asset/Liability/Equity/Income/Expense), searchable
- `#24:` AccountDetailPage — balance, recent splits, parent/child hierarchy
- `#25:` AccountCreatePage — form with type selector, parent selector
- `#26:` Account balance calculations using `amount_num / amount_denom`
- `#27:` Account hierarchy tree display (nested sub-accounts like GnuCash)

Commit: `feat: accounts management — list, detail, hierarchy, balances (fixes #22 #23 #24 #25 #26 #27)`

---

## Phase 5 — Transaction List & Detail
**Issues:** #28–#33  
**Goal:** Browse transactions with filtering and search

### Key Implementation Notes:
- Transactions have SPLITS (not simple debit/credit columns)
- Each split has `amount_num`, `amount_denom`, `action` (DEBIT/CREDIT), `account_id`
- Transaction is balanced when SUM(debits) = SUM(credits)
- Display amount = `split.amount_num / split.amount_denom`

Steps:
- `#28:` Transactions store with pagination and filtering
- `#29:` TransactionListPage with infinite scroll, filter by account/date
- `#30:` TransactionDetailPage showing all splits with accounts
- `#31:` Split amount display component (shows formatted currency)
- `#32:` Filter sheet (date range, account, min/max amount, posted/draft)
- `#33:` Transaction search (description, reference, notes)

Commit: `feat: transaction list and detail views (fixes #28 #29 #30 #31 #32 #33)`

---

## Phase 6 — Transaction Create & Edit
**Issues:** #34–#41  
**Goal:** Full double-entry transaction creation with split editor

### Critical: Double-Entry UI

The transaction form must support:
1. Multiple splits (minimum 2)
2. Real-time balance check: debits must = credits
3. Fraction input → stored as `amount_num` (cents × amount)
4. Account picker with search
5. Offline creation (queued if no network)

### Step 6.1 — Issue #34: MoneyInput Component

Create `src/components/MoneyInput.vue`:
- Accepts decimal input (e.g., "50.00")
- Converts to fraction: `{ amount_num: 5000, amount_denom: 100 }`
- Shows currency code
- Validation: must be positive number

### Step 6.2 — Issue #35: SplitEditor Component

Create `src/components/SplitEditor.vue`:
- Dynamic list of splits (add/remove)
- Each split: AccountPicker + DEBIT/CREDIT toggle + MoneyInput
- Running balance display: "Unbalanced by $X.XX" (red) / "Balanced ✓" (green)
- Minimum 2 splits enforced

### Steps 6.3–6.8 — Issues #36–#41

- `#36:` TransactionCreatePage full form (date, description, splits)
- `#37:` AccountPicker modal with search and recent accounts
- `#38:` TransactionEditPage (reuse create form, pre-populate)
- `#39:` Transaction delete with confirmation dialog
- `#40:` POST to `/api/sync/batch` if offline, `/api/transactions` if online
- `#41:` Swipe-to-delete on transaction list items

Commit: `feat: transaction create/edit with double-entry SplitEditor (fixes #34 #35 #36 #37 #38 #39 #40 #41)`

---

## Phase 7 — Offline Storage & Sync
**Issues:** #42–#49  
**Goal:** Full offline-first operation with conflict resolution

### Overview

Shillings Mobile shares offline logic with the web PWA. The offline modules live in:
`parent_shillings/resources/js/offline/`

Port them to TypeScript for this project:

| Web PWA Module | Mobile TypeScript Port |
|---|---|
| `database.js` | `src/offline/database.ts` |
| `store.js` | `src/offline/store.ts` |
| `transactions.js` | `src/offline/transactions.ts` |
| `sync.js` | `src/offline/sync.ts` |
| `conflicts.js` | `src/offline/conflicts.ts` |

### Step 7.1 — Issue #42: Port database.ts (Dexie schema)

Copy and convert `parent_shillings/resources/js/offline/database.js` to TypeScript:
- Add proper TS interfaces for all Dexie table schemas
- Add Capacitor-specific table: `deviceInfo` for push token storage

### Step 7.2 — Issues #43–#49

- `#43:` Port sync.ts with Capacitor Network plugin for connectivity detection
- `#44:` Port conflicts.ts — same 3 strategies (LOCAL_WINS/SERVER_WINS/MANUAL)
- `#45:` Sync status Pinia store with reactive pending count
- `#46:` SyncStore — full sync on app foreground (Capacitor App plugin)
- `#47:` Conflict resolution modal — show diff, let user choose
- `#48:` Offline indicator persistent bottom bar  
- `#49:` Local notification when sync completes (`@capacitor/local-notifications`)

Commit: `feat: offline storage and sync engine ported to TypeScript (fixes #42 #43 #44 #45 #46 #47 #48 #49)`

---

## Phase 8 — Contacts & Documents
**Issues:** #50–#57  
**Goal:** Contacts list, detail, and document summary

### Steps

- `#50:` Contacts store with offline caching
- `#51:` ContactListPage — list by type (customer/vendor/employee), search
- `#52:` ContactDetailPage — info tabs: transactions, documents, balance
- `#53:` ContactCreatePage — form with type selector, address fields
- `#54:` Documents list (invoices/bills/quotes) with status chips
- `#55:` Document detail view (read-only) with line items
- `#56:` Document status badges (Draft/Sent/Paid/Overdue)
- `#57:` Quick invoice create (simple form, creates invoice + posts to API)

Commit: `feat: contacts and documents (fixes #50 #51 #52 #53 #54 #55 #56 #57)`

---

## Phase 9 — Reports & Charts
**Issues:** #58–#64  
**Goal:** Financial reports with charts

### Implementation Notes
- Use Ionic Charts (vue-chartjs or apexcharts-vue3)
- All reports call existing API endpoints in `parent_shillings`
- Cache report data in Dexie for offline viewing

### Steps

- `#58:` ReportsPage with report type selector
- `#59:` Balance Sheet chart (pie: assets vs liabilities vs equity)
- `#60:` Income Statement chart (bar: income vs expenses by month)
- `#61:` Cash Flow chart (line chart over time)
- `#62:` Account register — transaction history per account
- `#63:` Trial Balance table view
- `#64:` Export report as PDF (Capacitor Filesystem + Share sheet)

Commit: `feat: reports and charts with offline caching (fixes #58 #59 #60 #61 #62 #63 #64)`

---

## Phase 10 — Scheduled Transactions & Budgets
**Issues:** #65–#70  
**Goal:** View and manage recurring transactions and budgets

### Steps

- `#65:` Scheduled transactions list view
- `#66:` Budget overview — actual vs budgeted by category
- `#67:` Budget variance chart (bar chart, green/red)
- `#68:` Quick-create scheduled transaction form
- `#69:` Budget create form
- `#70:` Upcoming transactions notification (due in next 7 days)

Commit: `feat: scheduled transactions and budgets (fixes #65 #66 #67 #68 #69 #70)`

---

## Phase 11 — Native Features (Camera, Biometrics)
**Issues:** #71–#78  
**Goal:** Native iOS/Android capabilities

### Step 11.1 — Issue #71: Receipt Camera Capture

```typescript
// src/services/camera.ts
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export async function captureReceipt(): Promise<string | null> {
  const photo = await Camera.getPhoto({
    quality: 80,
    resultType: CameraResultType.Base64,
    source: CameraSource.Camera,
    width: 1200,
    height: 1600,
    promptLabelHeader: 'Receipt Photo',
  });
  return photo.base64String ?? null;
}
```

Attach receipt to transaction via `POST /api/receipts` endpoint.

### Step 11.2 — Issue #72: ReceiptGallery Component

- Grid of captured receipts per transaction
- Tap to view full size (with zoom)
- Swipe to delete

### Steps 11.3–11.8 — Issues #73–#78

- `#73:` Biometric auth via `@aparajita/capacitor-biometric-auth`
- `#74:` Face ID / Fingerprint login flow (after initial password login)
- `#75:` File system backup (export Dexie data as JSON to Capacitor Filesystem)
- `#76:` Share transaction as PDF via Capacitor Share plugin
- `#77:` Haptic feedback on form submit, swipe actions
- `#78:` Status bar color match (emerald green header = status bar)

Commit: `feat: native camera, biometrics, haptics, share, file system (fixes #71 #72 #73 #74 #75 #76 #77 #78)`

---

## Phase 12 — Push Notifications
**Issues:** #79–#84  
**Goal:** Native push notification delivery

### Step 12.1 — Issue #79: Register Push Token

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

export async function registerPushNotifications() {
  let permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }
  if (permStatus.receive !== 'granted') return;
  await PushNotifications.register();
  PushNotifications.addListener('registration', async (token) => {
    await api.post('/push-subscriptions', {
      endpoint: token.value,
      keys: { p256dh: '', auth: '' },
    });
  });
}
```

### Steps 12.2–12.6 — Issues #80–#84

- `#80:` Handle push notification tap → navigate to relevant screen
- `#81:` Local notifications for scheduled transaction reminders
- `#82:` Sync completed notification ("3 transactions synced")
- `#83:` Low balance alert notification
- `#84:` Notification preferences screen in Settings

Commit: `feat: push and local notifications (fixes #79 #80 #81 #82 #83 #84)`

---

## Phase 13 — Testing & QA
**Issues:** #85–#92  
**Goal:** Unit tests, integration tests, and device testing checklist

### Steps

- `#85:` Vitest unit tests for MoneyInput fraction conversion
- `#86:` Vitest unit tests for SplitEditor balance validation
- `#87:` Vitest unit tests for auth store (mock API)
- `#88:` Vitest unit tests for offline sync queue
- `#89:` Vue Test Utils component tests for key pages
- `#90:` Physical device testing on iOS (iPhone 15)
- `#91:` Physical device testing on Android (Pixel 7)
- `#92:` Create `docs/TESTING_CHECKLIST.md` with 50-item checklist

Commit: `test: unit tests and QA checklist (fixes #85 #86 #87 #88 #89 #90 #91 #92)`

---

## Phase 14 — iOS App Store Submission
**Issues:** #93–#98  
**Goal:** Ship to App Store

### Prerequisites

Before starting Phase 14:
- Apple Developer Account ($99/year)
- App ID registered: `io.shillings.app`
- Certificates: Development + Distribution
- Provisioning profiles created

### Steps

- `#93:` App icons — all required sizes in `ios/App/App/Assets.xcassets`
  - Required: 1024×1024 (App Store), 180×180 (iPhone 3×), 120×120 (iPhone 2×)
- `#94:` Launch screen assets (Splash screen in Xcode)
- `#95:` Screenshots for App Store Connect:
  - 6.7" (iPhone 15 Pro Max) — REQUIRED: Dashboard, Accounts, New Transaction, Reports, Offline mode
  - 6.1" (iPhone 15) — RECOMMENDED
- `#96:` App Store metadata:
  ```
  Category: Finance > Accounting
  Age Rating: 4+
  Description: (see docs/APP_STORE_DESCRIPTION.md)
  Keywords: accounting, bookkeeping, double entry, offline, invoicing
  Privacy Policy URL: https://shillings.io/privacy
  Support URL: https://github.com/maxymurm/shillings/issues
  ```
- `#97:` TestFlight internal build → test → external 100 users
- `#98:` Submit for App Store Review

Commit: `docs: App Store submission (fixes #93 #94 #95 #96 #97 #98)`

---

## Phase 15 — Android Play Store Submission
**Issues:** #99–#104  
**Goal:** Ship to Google Play

### Steps

- `#99:` App icons — `android/app/src/main/res/` all density sizes
- `#100:` Generate signed APK/AAB:
  ```bash
  cd android
  ./gradlew bundleRelease
  ```
- `#101:` Play Store screenshots (phone + tablet):
  - Feature graphic: 1024×500 banner
  - Screenshots: 1080×1920 minimum
- `#102:` Play Store listing metadata:
  ```
  Category: Finance
  Content Rating: Everyone
  Description: (see docs/PLAY_STORE_DESCRIPTION.md)
  ```
- `#103:` Internal testing track → closed testing → open testing
- `#104:` Submit for Play Store review

Commit: `docs: Play Store submission (fixes #99 #100 #101 #102 #103 #104)`

---

## BUILD VERIFICATION — ALL PHASES

After every phase, verify:

```bash
# 1. TypeScript compiles cleanly
npm run build 2>&1 | tail -5

# 2. Tests pass
npm test -- --run 2>&1 | tail -10

# 3. Check git is clean
git status

# 4. Push to remote
git push origin main

# 5. Verify GitHub issues closed
gh issue list --state open -L 30 --json number,title
```

---

## FILE MAP

| Concern | File |
|---------|------|
| App entry | `src/main.ts` |
| Root component | `src/App.vue` |
| Router | `src/router/index.ts` |
| Auth store | `src/stores/auth.ts` |
| Accounts store | `src/stores/accounts.ts` |
| Transactions store | `src/stores/transactions.ts` |
| Contacts store | `src/stores/contacts.ts` |
| Sync store | `src/stores/sync.ts` |
| API service | `src/services/api.ts` |
| Auth service | `src/services/auth.ts` |
| Camera service | `src/services/camera.ts` |
| Biometric service | `src/services/biometric.ts` |
| Money input | `src/components/MoneyInput.vue` |
| Split editor | `src/components/SplitEditor.vue` |
| Offline badge | `src/components/OfflineBadge.vue` |
| DB schema | `src/offline/database.ts` |
| Sync engine | `src/offline/sync.ts` |
| Conflict resolver | `src/offline/conflicts.ts` |
| Login | `src/views/auth/LoginPage.vue` |
| Tab layout | `src/views/TabsLayout.vue` |
| Dashboard | `src/views/home/DashboardPage.vue` |
| Account list | `src/views/accounts/AccountListPage.vue` |
| Account detail | `src/views/accounts/AccountDetailPage.vue` |
| Txn list | `src/views/transactions/TransactionListPage.vue` |
| Txn create | `src/views/transactions/TransactionCreatePage.vue` |
| Txn detail | `src/views/transactions/TransactionDetailPage.vue` |
| Contact list | `src/views/contacts/ContactListPage.vue` |
| Reports | `src/views/reports/ReportsPage.vue` |
| Settings | `src/views/settings/SettingsPage.vue` |
| Capacitor config | `capacitor.config.ts` |
| iOS native | `ios/App/` |
| Android native | `android/app/` |
| CI/CD | `.github/workflows/build.yml` |
| Memory | `agents/memory.instructions.md` |
| This file | `agents/AUTONOMOUS_EXECUTION_PROMPT.md` |

---

## STATUS SUMMARY

| Metric | Value |
|--------|-------|
| Branch | `main` |
| Build | ❌ Not initialized yet |
| Phases complete | 0 of 15 |
| Next phase | **Phase 1: Project Setup** |
| Open issues | 104 |
| Closed issues | 0 |

---

## FINAL INSTRUCTIONS

1. Start from Phase 1, Step 1.1 (Issue #1)
2. Complete each step in order — phases have dependencies
3. Commit after every phase using conventional commits
4. Close GitHub issues as you complete each step
5. Update `agents/memory.instructions.md` after each phase with current status
6. Update `README.md` Phase Status table as each phase completes
7. When ALL phases complete, report:
   - ✅ What was built
   - 🔲 What remains (App Store review approval, physical device testing)
   - 📱 Next command to test on device

**Go. Start with Phase 1.**

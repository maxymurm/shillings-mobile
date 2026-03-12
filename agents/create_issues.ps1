#!/usr/bin/env pwsh
# Creates all GitHub issues for shillings-mobile
# Run from c:\Users\maxmm\shillings-mobile

$repo = "maxymurm/shillings-mobile"

$milestoneMap = @{
  1  = "Phase 1: Project Setup & Infrastructure"
  2  = "Phase 2: Authentication & User Management"
  3  = "Phase 3: Navigation Shell & Dashboard"
  4  = "Phase 4: Accounts Management"
  5  = "Phase 5: Transactions - View & List"
  6  = "Phase 6: Transactions - Create & Edit"
  7  = "Phase 7: Offline Storage & Sync"
  8  = "Phase 8: Contacts & Documents"
  9  = "Phase 9: Reports & Charts"
  10 = "Phase 10: Scheduled Transactions & Budgets"
  11 = "Phase 11: Native Features (Camera, Biometrics)"
  12 = "Phase 12: Push Notifications"
  13 = "Phase 13: Testing & QA"
  14 = "Phase 14: iOS App Store Submission"
  15 = "Phase 15: Android Play Store Submission"
}

function New-Issue($title, $body, $milestoneNum) {
  $milestoneTitle = $milestoneMap[$milestoneNum]
  $result = gh issue create --repo $repo --title $title --body $body --milestone $milestoneTitle 2>&1
  if ($LASTEXITCODE -eq 0) {
    $num = ($result | Select-String '/issues/(\d+)').Matches.Groups[1].Value
    Write-Host "OK #$num $title"
  } else {
    Write-Host "FAIL: $title"
    Write-Host $result
  }
}

# Phase 1
New-Issue "Initialize Ionic/Vue project with TypeScript" "Set up src/main.ts, App.vue, index.html, vite.config.ts, tsconfig.json, theme/variables.css. See AUTONOMOUS_EXECUTION_PROMPT.md Phase 1." 1
New-Issue "Add Vue Router with auth guards and tab routes" "src/router/index.ts with requiresAuth and requiresGuest guards. Routes for login, 5 tabs, all nested pages." 1
New-Issue "Add Axios API service with Sanctum token injection" "src/services/api.ts. Read token from Capacitor Preferences. Bearer auth header. Redirect to /login on 401." 1
New-Issue "Add GitHub Actions CI/CD workflow" "Create .github/workflows/build.yml. npm install, build, test on every push and PR using Node 20." 1
New-Issue "Add Capacitor iOS and Android platforms" "Run npx cap add ios, npx cap add android, npx cap sync." 1
New-Issue "Configure app icons and splash screens" "All required icon sizes. Splash screen uses green #10b981. 2000ms auto-hide." 1
New-Issue "Configure ESLint and Prettier" ".eslintrc.cjs with Vue 3 and TypeScript rules. .prettierrc. lint script in package.json." 1
New-Issue "Create vitest configuration" "vitest.config.ts. First test: src/tests/money.spec.ts for fraction conversion helper." 1

# Phase 2
New-Issue "Create Pinia auth store" "src/stores/auth.ts with init, login, logout, fetchUser. Token in Capacitor Preferences. isAuthenticated computed." 2
New-Issue "Create LoginPage.vue" "Email/password form, loading spinner, error toast. authStore.login on submit. Navigate to /tabs/dashboard on success." 2
New-Issue "Implement logout from Settings page" "Add logout button to Settings stub. authStore.logout then redirect to /login." 2
New-Issue "Fetch and cache user profile after login" "After login call GET /api/user. Store in auth store and Preferences. Display name in header." 2
New-Issue "Add company context to API requests" "Fetch user companies after login. Store selected company ID. Pass X-Company-ID header on all requests." 2
New-Issue "Add token auto-refresh interceptor" "On 401 attempt refresh via POST /api/auth/refresh. If fails, logout." 2
New-Issue "Add biometric auth stub" "src/services/biometric.ts returning isAvailable() false. Will be implemented in Phase 11." 2

# Phase 3
New-Issue "Create TabsLayout.vue with bottom navigation" "5 tabs: Home, Accounts, FAB center, Contacts, More. FAB opens TransactionCreatePage." 3
New-Issue "Create DashboardPage with summary cards" "Net Worth, Income, Expenses cards. Last 5 transactions. Fetch from GET /api/reports/summary. Cache in Dexie." 3
New-Issue "Create OfflineBadge component" "Shows connectivity and pending sync count. Listens to Capacitor Network plugin." 3
New-Issue "Add dark mode support" "Detect system dark mode via matchMedia. Apply .dark class to html element." 3
New-Issue "Configure StatusBar for notch devices" "Set StatusBar style and color. Add ion-safe-area padding on all pages." 3
New-Issue "Add pull-to-refresh to all list pages" "IonRefresher on Dashboard, AccountList, TransactionList. Trigger refetch on pull." 3

# Phase 4
New-Issue "Create Pinia accounts store" "src/stores/accounts.ts with fetchAccounts. API first, fall back to Dexie. Cache results." 4
New-Issue "Create AccountListPage" "Group by type: Asset/Liability/Equity/Income/Expense. Show balance. IonSearchbar." 4
New-Issue "Create AccountDetailPage" "Account info, balance, parent link, child accounts, recent splits." 4
New-Issue "Create AccountCreatePage" "Form: name, type selector, parent picker, currency. POST to /api/accounts." 4
New-Issue "Implement balance calculation from fractions" "src/utils/money.ts: toDecimal(num, denom), fromDecimal(value), formatCurrency. NEVER use floats." 4
New-Issue "Implement account hierarchy tree" "Sub-accounts nested under parents with indent. Expand/collapse chevron." 4

# Phase 5
New-Issue "Create Pinia transactions store" "src/stores/transactions.ts with pagination and filters. Cache to Dexie." 5
New-Issue "Create TransactionListPage" "Infinite scroll. Date, description, amount, status chip. IonSearchbar." 5
New-Issue "Create TransactionDetailPage" "All splits with account name and amount. Debit/credit indicators. Edit and delete buttons." 5
New-Issue "Create SplitAmountDisplay component" "Props: amount_num, amount_denom, currency_code, action. Red for CREDIT, green for DEBIT." 5
New-Issue "Create TransactionFilterSheet" "IonModal: date range, account picker, min/max amount, posted/draft toggle." 5
New-Issue "Add transaction search" "IonSearchbar hitting GET /api/transactions?search=X. Debounce 300ms." 5

# Phase 6
New-Issue "Create MoneyInput component" "Props: modelValue with amount_num/amount_denom, currencyCode. Decimal to fraction conversion. Positive validation." 6
New-Issue "Create SplitEditor component" "Dynamic split list. Each: AccountPicker + DEBIT/CREDIT toggle + MoneyInput. Balance display. Min 2 splits." 6
New-Issue "Create TransactionCreatePage" "Full form: date, description, notes, reference, SplitEditor. Submit disabled until balanced." 6
New-Issue "Create AccountPicker modal" "IonModal. Searchable account list. Type chip. Recent accounts. Emits selection." 6
New-Issue "Create TransactionEditPage" "Reuse create form pre-populated from existing transaction. PATCH to /api/transactions/:id." 6
New-Issue "Add transaction delete with confirmation" "IonAlert confirmation on TransactionDetailPage. DELETE /api/transactions/:id." 6
New-Issue "Add offline transaction queuing" "Store in Dexie as pending_create when offline. SyncEngine posts when online." 6
New-Issue "Add swipe-to-delete on transaction list" "IonItemSliding with delete option. Haptic feedback. Confirmation before delete." 6

# Phase 7
New-Issue "Port database.ts from PWA offline module" "Convert parent_shillings/resources/js/offline/database.js to TypeScript. Typed interfaces for all tables." 7
New-Issue "Port sync.ts with Capacitor Network detection" "Convert sync.js to TypeScript. Capacitor Network plugin instead of ServiceWorker. Exponential backoff." 7
New-Issue "Port conflicts.ts with 3 resolution strategies" "Convert conflicts.js to TypeScript. Keep LOCAL_WINS, SERVER_WINS, MANUAL_RESOLVE strategies." 7
New-Issue "Create Pinia sync store" "src/stores/sync.ts. Reactive pendingCount, lastSyncAt, isSyncing. startSync and resolveConflict actions." 7
New-Issue "Add foreground sync trigger" "Capacitor App plugin. startSync on appStateChange to foreground. Refresh data on resume." 7
New-Issue "Create ConflictResolutionModal" "Local vs server diff side-by-side. Keep Mine / Keep Server / Cancel buttons." 7
New-Issue "Create persistent offline indicator bar" "Fixed bar above tab bar when offline. Shows pending count. Disappears when online." 7
New-Issue "Add sync completion local notification" "Local notification after background sync completes with transaction count." 7

# Phase 8
New-Issue "Create Pinia contacts store" "src/stores/contacts.ts. Fetch from /api/contacts. Cache in Dexie. Filter by type." 8
New-Issue "Create ContactListPage" "Segmented by type. IonSearchbar. Name, type chip, email." 8
New-Issue "Create ContactDetailPage" "Tabs: Info, Transactions, Documents, Balance. Transactions filtered by contact." 8
New-Issue "Create ContactCreatePage" "Form: name, type, email, phone, address. POST to /api/contacts." 8
New-Issue "Create DocumentListPage" "Invoices, bills, quotes. Status chips: Draft/Sent/Paid/Overdue." 8
New-Issue "Create DocumentDetailPage" "Read-only: header, line items, totals, status. Mark Paid and Download PDF actions." 8
New-Issue "Add document status badges component" "src/components/StatusBadge.vue. Draft=gray, Sent=blue, Paid=green, Overdue=red." 8
New-Issue "Add quick invoice create from contact" "FAB on ContactDetailPage opens invoice form with contact pre-filled." 8

# Phase 9
New-Issue "Create ReportsPage with type selector" "IonSegment: Balance Sheet, Income Statement, Cash Flow, Trial Balance, Account Register. Date range picker." 9
New-Issue "Implement Balance Sheet chart" "Pie chart from /api/reports/balance-sheet. Assets vs liabilities vs equity. Table below." 9
New-Issue "Implement Income Statement chart" "Bar chart from /api/reports/income-statement. Income vs expenses by month." 9
New-Issue "Implement Cash Flow chart" "Line chart from /api/reports/cash-flow over time." 9
New-Issue "Implement account register view" "Splits list per account with running balance from /api/accounts/:id/splits." 9
New-Issue "Implement Trial Balance table" "Debit/credit columns from /api/reports/trial-balance. Verify totals match." 9
New-Issue "Add PDF export for reports" "html2pdf.js to PDF. Save via Capacitor Filesystem. Share via Share sheet." 9

# Phase 10
New-Issue "Create scheduled transactions list" "Recurring transactions with next date, frequency, amount from /api/scheduled-transactions." 10
New-Issue "Create budget overview page" "Categories with actual vs budgeted amounts and progress bars from /api/budgets." 10
New-Issue "Create budget variance chart" "Bar chart: budgeted vs actual. Red over, green under." 10
New-Issue "Create scheduled transaction form" "Frequency, dates, transaction template. POST to /api/scheduled-transactions." 10
New-Issue "Create budget create and edit form" "Period, account, amount, rollover toggle. POST to /api/budgets." 10
New-Issue "Upcoming transactions notification" "Local notification badge for transactions due in next 7 days on app launch." 10

# Phase 11
New-Issue "Implement receipt camera capture" "src/services/camera.ts with Capacitor Camera. Quality 80, max 1200px. Return base64." 11
New-Issue "Create ReceiptGallery component" "Grid thumbnails per transaction. Tap for full-size with zoom. Swipe to delete." 11
New-Issue "Implement biometric authentication service" "src/services/biometric.ts using @aparajita/capacitor-biometric-auth. Check availability and authenticate." 11
New-Issue "Add biometric login flow" "Require biometric re-auth after 5+ min in background. Enable/disable in Settings." 11
New-Issue "Implement file system backup" "Export Dexie as JSON to Capacitor Filesystem. Share via Share sheet. Restore in Settings." 11
New-Issue "Add share transaction as PDF" "Generate and share PDF from TransactionDetailPage via Capacitor Share." 11
New-Issue "Add haptic feedback throughout app" "Form submit (medium), validation error (heavy), swipe (light), tab switch (selection)." 11
New-Issue "Match StatusBar color to page header" "Set StatusBar background to match toolbar on each page via ionViewWillEnter." 11

# Phase 12
New-Issue "Register push notification token" "src/services/push.ts. Request permissions, register, POST token to /api/push-subscriptions." 12
New-Issue "Handle push notification tap navigation" "Parse notification data on tap. Navigate to relevant page." 12
New-Issue "Add local notifications for scheduled transactions" "Schedule for transactions due in next 24h on app launch." 12
New-Issue "Add sync completion notification" "Local notification after background sync with count." 12
New-Issue "Add low balance alert notification" "Check balances against user thresholds on sync. Notify if below threshold." 12
New-Issue "Create notification preferences screen" "Settings toggles: sync, scheduled reminders, low balance, threshold input." 12

# Phase 13
New-Issue "Unit tests for money fraction conversion" "Test toDecimal, fromDecimal, formatCurrency, edge cases (zero, negative)." 13
New-Issue "Unit tests for SplitEditor balance validation" "Test isBalanced, unbalanced error message, 2 split minimum." 13
New-Issue "Unit tests for auth store" "Mock API. Login sets Preferences, logout clears, init restores, 401 clears." 13
New-Issue "Unit tests for offline sync queue" "Offline transaction to Dexie. Sync posts pending. Conflict strategies output." 13
New-Issue "Vue Test Utils component tests" "LoginPage, AccountListPage, TransactionListPage with mock data." 13
New-Issue "Physical device testing on iOS" "iPhone 15: login, transactions, offline, push, camera, biometric, share PDF." 13
New-Issue "Physical device testing on Android" "Same scenarios plus back button, status bar, notification channels." 13
New-Issue "Create TESTING_CHECKLIST.md" "docs/TESTING_CHECKLIST.md with 50-item checklist." 13

# Phase 14
New-Issue "Add all required iOS app icon sizes" "1024, 180, 120, 87, 80, 60, 58, 40, 29 px variants in Assets.xcassets." 14
New-Issue "Configure iOS launch screen" "Green background with logo in LaunchScreen.storyboard. Test all iPhone sizes." 14
New-Issue "Create App Store screenshots" "6.7 inch and 6.1 inch: Dashboard, Accounts, New Transaction, Reports, Offline." 14
New-Issue "Write App Store metadata" "docs/APP_STORE_DESCRIPTION.md: short desc, full desc, keywords, privacy URL." 14
New-Issue "TestFlight internal build and testing" "Archive, upload to App Store Connect, test internally, fix issues." 14
New-Issue "Submit to App Store review" "Complete listing. Free pricing. Submit for review. Track status." 14

# Phase 15
New-Issue "Add all required Android app icon sizes" "mipmap-mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi plus adaptive icons." 15
New-Issue "Generate signed Android AAB" "Create keystore (do not commit). Configure build.gradle. Run bundleRelease." 15
New-Issue "Create Play Store screenshots" "1080x2400 phone: 5 scenarios. 1024x500 feature graphic banner." 15
New-Issue "Write Play Store metadata" "docs/PLAY_STORE_DESCRIPTION.md: short desc, full desc, data safety form." 15
New-Issue "Submit to internal testing track" "Upload AAB to Play Console. Test on Android API levels 27 and up." 15
New-Issue "Submit for Play Store review" "Complete listing, content rating, data safety. Monitor crash reports." 15

Write-Host ""
Write-Host "All issues created!"

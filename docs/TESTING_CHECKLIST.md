# Shillings Mobile — Testing Checklist

**Version:** 1.0  
**Last Updated:** March 12, 2026  
**Platform:** Ionic 8 + Capacitor 6 + Vue 3

---

## 1. Authentication (5 items)

- [ ] 1.1 Login with valid email/password → navigates to Dashboard
- [ ] 1.2 Login with wrong credentials → shows error message
- [ ] 1.3 Session persists across app restarts (Preferences token)
- [ ] 1.4 Logout clears token and navigates to Login
- [ ] 1.5 Biometric login (Face ID / Fingerprint) unlocks app

## 2. Dashboard (4 items)

- [ ] 2.1 Dashboard loads with account summary cards
- [ ] 2.2 Recent transactions list displays correctly
- [ ] 2.3 Quick action buttons navigate to correct pages
- [ ] 2.4 Pull-to-refresh reloads dashboard data

## 3. Accounts (5 items)

- [ ] 3.1 Account list shows all company accounts
- [ ] 3.2 Account detail shows balance and transaction history
- [ ] 3.3 Create new account with valid data
- [ ] 3.4 Account type filtering works
- [ ] 3.5 Search accounts by name

## 4. Transactions (6 items)

- [ ] 4.1 Transaction list with infinite scroll
- [ ] 4.2 Transaction detail shows all splits
- [ ] 4.3 Create transaction with 2 balanced splits
- [ ] 4.4 Create transaction with 3+ splits (multi-split)
- [ ] 4.5 Edit existing transaction
- [ ] 4.6 SplitEditor shows balanced/unbalanced indicator

## 5. Money Input (4 items)

- [ ] 5.1 Typing "50.00" sends amount_num=5000, amount_denom=100
- [ ] 5.2 Fraction display shows correct decimal value
- [ ] 5.3 Negative amounts handled correctly
- [ ] 5.4 Currency code displayed next to amount

## 6. Contacts (4 items)

- [ ] 6.1 Contact list with search and type filter
- [ ] 6.2 Contact detail shows info / transactions / documents tabs
- [ ] 6.3 Create new contact (customer / vendor / employee)
- [ ] 6.4 Infinite scroll pagination works

## 7. Documents (4 items)

- [ ] 7.1 Document list with type/status chips
- [ ] 7.2 Document detail shows line items table
- [ ] 7.3 Create invoice with contact picker and line items
- [ ] 7.4 Invoice totals compute correctly (fractions)

## 8. Reports (5 items)

- [ ] 8.1 Reports hub shows all report types
- [ ] 8.2 Balance Sheet pie chart renders
- [ ] 8.3 Income Statement bar chart renders
- [ ] 8.4 Cash Flow line chart renders
- [ ] 8.5 Trial Balance table shows data

## 9. Scheduled Transactions (3 items)

- [ ] 9.1 Scheduled transactions list shows upcoming
- [ ] 9.2 Create scheduled transaction with frequency
- [ ] 9.3 Due date display is correct

## 10. Budgets (3 items)

- [ ] 10.1 Budget overview with variance bar chart
- [ ] 10.2 Create budget with account and period
- [ ] 10.3 Over-budget items highlighted in red

## 11. Offline & Sync (6 items)

- [ ] 11.1 App works in airplane mode (cached data)
- [ ] 11.2 Creating transaction offline queues in IndexedDB
- [ ] 11.3 SyncBar shows pending count
- [ ] 11.4 Auto-sync triggers when reconnecting
- [ ] 11.5 Conflict resolution modal appears on conflicts
- [ ] 11.6 Manual sync button triggers full sync

## 12. Native Features (5 items)

- [ ] 12.1 Camera captures receipt photo
- [ ] 12.2 Photo gallery picker works
- [ ] 12.3 ReceiptGallery displays thumbnails
- [ ] 12.4 Haptic feedback on button taps
- [ ] 12.5 File backup exports JSON to Documents

## 13. Notifications (5 items)

- [ ] 13.1 Push notification registration succeeds
- [ ] 13.2 Tapping notification navigates to correct screen
- [ ] 13.3 Local reminder fires for scheduled transactions
- [ ] 13.4 Sync complete notification shows count
- [ ] 13.5 Notification preferences toggle on/off

## 14. Settings (3 items)

- [ ] 14.1 User info displayed correctly
- [ ] 14.2 Company switching works
- [ ] 14.3 Version number shown

## 15. Performance (3 items)

- [ ] 15.1 App loads in under 3 seconds
- [ ] 15.2 Scrolling through 100+ transactions is smooth
- [ ] 15.3 Chart rendering doesn't freeze UI

---

**Total: 65 items**

### Device Testing Matrix

| Device | OS Version | Status |
|--------|-----------|--------|
| iPhone 15 Pro Max | iOS 18 | 🔲 |
| iPhone 14 | iOS 17 | 🔲 |
| iPad Air | iPadOS 18 | 🔲 |
| Pixel 7 | Android 14 | 🔲 |
| Samsung S24 | Android 14 | 🔲 |
| Pixel Tablet | Android 14 | 🔲 |

### How to Run Automated Tests

```bash
# Unit tests
npx vitest --run

# TypeScript check
npx vue-tsc --noEmit

# Build verification
npm run build
```

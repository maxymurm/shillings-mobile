# Shillings — iOS App Store Submission Guide

**App ID:** `io.shillings.app`  
**App Name:** Shillings  
**Version:** 1.0.0

---

## Prerequisites

1. **Apple Developer Account** ($99/year) — https://developer.apple.com
2. **App ID** registered: `io.shillings.app`
3. **Certificates:** Development + Distribution (created in Apple Developer portal)
4. **Provisioning Profiles:** Development + App Store Distribution
5. **macOS** with Xcode 15+ installed

---

## Step 1: Build the Web App

```bash
# From project root
npm run build
```

Verify `dist/` directory is generated with the production build.

---

## Step 2: Add iOS Platform

```bash
npx cap add ios
npx cap sync ios
```

---

## Step 3: App Icons

### Required Sizes (in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`)

| Size | Scale | Use |
|------|-------|-----|
| 1024×1024 | 1x | App Store |
| 180×180 | 3x | iPhone App Icon |
| 120×120 | 2x | iPhone App Icon |
| 167×167 | 2x | iPad Pro |
| 152×152 | 2x | iPad |
| 76×76 | 1x | iPad |
| 40×40 | 2x | Spotlight |
| 60×60 | 3x | iPhone Spotlight |
| 58×58 | 2x | Settings |
| 87×87 | 3x | Settings |
| 29×29 | 1x | Settings |
| 20×20 | 1x | Notifications |

**Source:** Start with a 1024×1024 PNG icon and use a tool like https://appicon.co to generate all sizes.

---

## Step 4: Launch Screen

Configure in Xcode:
1. Open `ios/App/App.xcworkspace` in Xcode
2. Select the App target → General → App Icons and Launch Screen
3. Configure launch screen with Shillings branding:
   - Background color: `#10b981` (Shillings green)
   - Logo centered on screen

---

## Step 5: Screenshots

### Required devices:
- **6.7" (iPhone 15 Pro Max)** — REQUIRED
- **6.1" (iPhone 15)** — RECOMMENDED

### Recommended screenshots (5-10):
1. **Login** — Biometric authentication prompt
2. **Dashboard** — Account summary with charts
3. **Accounts** — Chart of accounts list
4. **New Transaction** — Split editor with balance indicator
5. **Reports** — Balance Sheet chart
6. **Offline Mode** — SyncBar showing offline capability
7. **Contacts** — Contact list with type filters
8. **Invoice** — Invoice creation with line items

### Capture method:
```bash
# Build and run on simulator
npx cap open ios
# In Xcode: Product → Destination → iPhone 15 Pro Max
# Use Cmd+S to capture screenshots from Simulator
```

---

## Step 6: App Store Connect Metadata

```
Category:         Finance > Accounting
Subcategory:      Business
Age Rating:       4+
Description:      (see docs/APP_STORE_DESCRIPTION.md)
Keywords:         accounting, bookkeeping, double entry, offline, invoicing, budgeting, finance, small business, ledger, receipt
Privacy Policy:   https://shillings.io/privacy
Support URL:      https://github.com/maxymurm/shillings/issues
Marketing URL:    https://shillings.io
```

---

## Step 7: TestFlight

1. In Xcode: Product → Archive
2. Upload to App Store Connect via Xcode Organizer
3. In App Store Connect → TestFlight:
   - Internal testing: Deploy to team
   - External testing: Add up to 100 beta testers
4. Wait for TestFlight review (usually <24 hours)
5. Distribute to testers

---

## Step 8: Submit for Review

1. Complete all App Store Connect metadata
2. Select the build from TestFlight
3. Answer export compliance questions
4. Submit for review
5. Typical review time: 24-48 hours

---

## Capacitor Config Reference

```typescript
// capacitor.config.ts
{
  appId: 'io.shillings.app',
  appName: 'Shillings',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#10b981',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}
```

---

## Info.plist Keys

Add to `ios/App/App/Info.plist`:

```xml
<!-- Camera access for receipt capture -->
<key>NSCameraUsageDescription</key>
<string>Shillings needs camera access to capture receipt photos</string>

<!-- Photo library for receipt gallery -->
<key>NSPhotoLibraryUsageDescription</key>
<string>Shillings needs photo library access to attach receipt images</string>

<!-- Face ID -->
<key>NSFaceIDUsageDescription</key>
<string>Use Face ID to unlock Shillings</string>
```

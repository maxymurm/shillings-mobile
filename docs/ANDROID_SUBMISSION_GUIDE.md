# Shillings — Android Play Store Submission Guide

**Package Name:** `io.shillings.app`  
**App Name:** Shillings  
**Version:** 1.0.0

---

## Prerequisites

1. **Google Play Developer Account** ($25 one-time) — https://play.google.com/console
2. **Android Studio** installed (for signing)
3. **Java 17+** (for Gradle builds)

---

## Step 1: Build the Web App

```bash
npm run build
```

Verify `dist/` directory is generated.

---

## Step 2: Add Android Platform

```bash
npx cap add android
npx cap sync android
```

---

## Step 3: App Icons

### Required density sizes in `android/app/src/main/res/`:

| Directory | Size | DPI |
|-----------|------|-----|
| `mipmap-mdpi/` | 48×48 | 160 |
| `mipmap-hdpi/` | 72×72 | 240 |
| `mipmap-xhdpi/` | 96×96 | 320 |
| `mipmap-xxhdpi/` | 144×144 | 480 |
| `mipmap-xxxhdpi/` | 192×192 | 640 |

**Adaptive icon layers:**
- `ic_launcher_foreground.xml` — 108dp foreground layer
- `ic_launcher_background.xml` — background color/gradient
- `ic_launcher_round.xml` — round icon variant

**Tools:** Use Android Studio's Image Asset Studio (right-click `res` → New → Image Asset) or https://romannurik.github.io/AndroidAssetStudio/

---

## Step 4: Generate Signed AAB

### Create signing keystore (one-time):

```bash
keytool -genkey -v -keystore shillings-release.keystore \
  -alias shillings -keyalg RSA -keysize 2048 -validity 10000
```

### Configure signing in `android/app/build.gradle`:

```groovy
android {
    signingConfigs {
        release {
            storeFile file('shillings-release.keystore')
            storePassword System.getenv('KEYSTORE_PASSWORD')
            keyAlias 'shillings'
            keyPassword System.getenv('KEY_PASSWORD')
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Build release AAB:

```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Step 5: Play Store Screenshots

### Required:
- **Phone screenshots:** 1080×1920 minimum (2-8 screenshots)
- **Feature graphic:** 1024×500 banner image

### Recommended screenshots:
1. Login / Biometric unlock
2. Dashboard with account summaries
3. Chart of Accounts
4. Transaction creation with split editor
5. Reports with charts
6. Offline mode / Sync
7. Invoice creation
8. Budget overview

### Capture method:
```bash
npx cap open android
# In Android Studio: Tools → Device Manager → Run on emulator
# Use screenshot button in emulator toolbar
```

---

## Step 6: Play Store Listing

```
App Name:           Shillings
Short Description:  Professional double-entry accounting for your business, works offline.
Full Description:   (see docs/PLAY_STORE_DESCRIPTION.md)
Category:           Finance
Content Rating:     Everyone
Contact Email:      support@shillings.io
Privacy Policy:     https://shillings.io/privacy
```

---

## Step 7: Testing Tracks

### Internal testing (recommended first):
1. Upload AAB to Play Console → Internal testing
2. Add team members as testers
3. Generate opt-in link
4. Test on real devices

### Closed testing:
1. Create closed testing track
2. Add up to 100 external testers
3. Collect feedback

### Open testing:
1. Promote from closed testing
2. Available to anyone with the link

---

## Step 8: Production Release

1. Complete all Play Store listing metadata
2. Complete Data Safety section:
   - Data collected: email, name (account info)
   - Data shared: none
   - Encryption: yes (HTTPS)
3. Set target API level (minimum 24 / Android 7.0)
4. Upload screenshots and graphics
5. Submit for review
6. Typical review time: 1-7 days

---

## AndroidManifest.xml Permissions

Already configured by Capacitor plugins:

```xml
<!-- Internet access -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Camera for receipt capture -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Push notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Biometric -->
<uses-permission android:name="android.permission.USE_BIOMETRIC" />

<!-- Network state for offline detection -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

---

## Data Safety Declaration

| Question | Answer |
|----------|--------|
| Does your app collect data? | Yes |
| Data types collected | Email, Name, Financial data |
| Is data encrypted in transit? | Yes (HTTPS) |
| Can users request data deletion? | Yes |
| Is data shared with third parties? | No |

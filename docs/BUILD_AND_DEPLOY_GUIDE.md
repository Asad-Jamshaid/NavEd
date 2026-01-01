# Build and Deploy Guide

Complete guide to building and deploying NavEd to Android and iOS.

---

## Prerequisites

### For Android:
- ✅ Node.js 18+ installed
- ✅ Android Studio installed
- ✅ Android SDK configured
- ✅ Java JDK installed

### For iOS (Mac only):
- ✅ Node.js 18+ installed
- ✅ Xcode installed
- ✅ CocoaPods installed
- ✅ Apple Developer account (for App Store)

---

## Step 1: Install Dependencies

```bash
# Install all dependencies
npm install

# Install Expo CLI globally (if not already installed)
npm install -g expo-cli eas-cli
```

---

## Step 2: Configure App

### Update app.json

Edit `app.json` with your app details:

```json
{
  "expo": {
    "name": "NavEd",
    "slug": "naved",
    "version": "1.0.0",
    "sdkVersion": "54.0.0",
    "ios": {
      "bundleIdentifier": "com.youruniversity.naved",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.youruniversity.naved",
      "versionCode": 1
    }
  }
}
```

**Important:** Replace `com.youruniversity.naved` with your actual package name!

---

## Step 3: Build for Android

### Option A: Using EAS Build (Recommended - Cloud Build)

1. **Login to Expo:**
   ```bash
   eas login
   ```

2. **Configure EAS:**
   ```bash
   eas build:configure
   ```
   - Select Android
   - Choose "production" profile

3. **Build APK:**
   ```bash
   eas build --platform android --profile preview
   ```
   - This creates a downloadable APK
   - Takes 10-20 minutes
   - You'll get a download link

4. **Build AAB (for Play Store):**
   ```bash
   eas build --platform android --profile production
   ```

### Option B: Local Build

1. **Generate Android project:**
   ```bash
   npx expo prebuild --platform android
   ```

2. **Build APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

3. **Find APK:**
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

### Option C: Development Build (For Testing)

```bash
# Start development server
npm start

# Run on Android device/emulator
npm run android
```

---

## Step 4: Build for iOS (Mac Only)

### Option A: Using EAS Build

1. **Configure EAS:**
   ```bash
   eas build:configure
   ```
   - Select iOS
   - Choose "production" profile

2. **Build IPA:**
   ```bash
   eas build --platform ios --profile production
   ```

### Option B: Local Build

1. **Generate iOS project:**
   ```bash
   npx expo prebuild --platform ios
   ```

2. **Install CocoaPods:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Open in Xcode:**
   ```bash
   open ios/YourApp.xcworkspace
   ```

4. **Build in Xcode:**
   - Select your device/simulator
   - Product > Archive
   - Follow App Store submission process

---

## Step 5: Test on Device

### Android APK Installation

1. **Enable Unknown Sources:**
   - Settings > Security > Unknown Sources (enable)

2. **Transfer APK to phone:**
   - Email it to yourself
   - Or use USB/ADB: `adb install app-release.apk`

3. **Install:**
   - Open the APK file
   - Tap "Install"
   - Open the app

### iOS Installation

1. **For Development:**
   - Connect iPhone via USB
   - Select device in Xcode
   - Click "Run"

2. **For TestFlight:**
   - Upload build to App Store Connect
   - Add testers
   - They install via TestFlight app

---

## Step 6: Deploy PDF Extraction API (Optional)

If you want PDF support in Study Assistant:

### Deploy to Vercel (FREE)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd api
   vercel
   ```

4. **Get your URL:**
   - Vercel will give you a URL like: `https://naved-abc123.vercel.app`

5. **Add to app:**
   - Create `.env` file in project root:
     ```env
     EXPO_PUBLIC_PDF_API_URL=https://your-deployment.vercel.app
     ```

6. **Rebuild app:**
   ```bash
   npm start -- --clear
   ```

See `api/README.md` for detailed instructions.

---

## Step 7: Submit to Stores

### Google Play Store

1. **Create Developer Account:**
   - Go to [Google Play Console](https://play.google.com/console)
   - Pay $25 one-time fee

2. **Create App:**
   - Click "Create app"
   - Fill in details
   - Upload AAB file

3. **Complete Store Listing:**
   - App name, description
   - Screenshots
   - Privacy policy URL

4. **Submit for Review:**
   - Review takes 1-3 days

### Apple App Store

1. **Create Developer Account:**
   - Go to [Apple Developer](https://developer.apple.com)
   - Pay $99/year

2. **Create App in App Store Connect:**
   - Add new app
   - Fill in details

3. **Upload Build:**
   - Use Xcode or EAS Submit
   ```bash
   eas submit --platform ios
   ```

4. **Complete Store Listing:**
   - Screenshots
   - Description
   - Privacy policy

5. **Submit for Review:**
   - Review takes 1-7 days

---

## Troubleshooting

### Build Fails

**"Gradle build failed":**
- Check Android SDK is installed
- Verify Java JDK version (17+)
- Clean build: `cd android && ./gradlew clean`

**"CocoaPods error":**
- Update CocoaPods: `sudo gem install cocoapods`
- Clean: `cd ios && pod deintegrate && pod install`

**"EAS build timeout":**
- Check internet connection
- Try again (sometimes servers are busy)

### App Crashes on Device

1. **Check logs:**
   ```bash
   # Android
   adb logcat

   # iOS
   # Check Xcode console
   ```

2. **Common issues:**
   - Missing permissions (check app.json)
   - API keys not set
   - Campus data not configured

### App Doesn't Install

**Android:**
- Enable "Install from Unknown Sources"
- Check APK is not corrupted
- Try different device

**iOS:**
- Check device is registered in Apple Developer
- Verify provisioning profile
- Check device UDID is added

---

## Production Checklist

Before submitting to stores:

- [ ] App name and package name are correct
- [ ] Version number is set
- [ ] App icon is added (`assets/icon.png`)
- [ ] Splash screen is configured
- [ ] Campus data is configured
- [ ] API keys are optional (app works without them)
- [ ] Privacy policy URL is set
- [ ] Terms of service URL is set (if required)
- [ ] All features tested on device
- [ ] No console errors
- [ ] App works offline (where applicable)

---

## Quick Commands Reference

```bash
# Development
npm start                    # Start dev server
npm run android              # Run on Android
npm run ios                  # Run on iOS

# Building
eas build --platform android # Build Android (cloud)
eas build --platform ios    # Build iOS (cloud)
eas build --platform all    # Build both

# Submitting
eas submit --platform android # Submit to Play Store
eas submit --platform ios     # Submit to App Store

# Testing
npm test                     # Run tests
npm run lint                 # Check code
```

---

## Need Help?

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [React Native Docs](https://reactnative.dev)

---

## Cost Summary

**Free:**
- ✅ Development and testing
- ✅ EAS Build (limited free builds)
- ✅ Vercel deployment (PDF API)

**Paid (One-time/Annual):**
- Google Play: $25 one-time
- Apple App Store: $99/year

**Optional:**
- EAS Build: Free tier available, paid for more builds
- Vercel: Free tier is generous


# How to Test NavEd on Your Android Phone

## Method 1: Expo Go (Fastest - 5 minutes)

### Step 1: Install Expo Go
1. Open **Google Play Store** on your Android phone
2. Search for "**Expo Go**"
3. Install the app (it's free)

### Step 2: Start the Development Server
On your computer, run:
```bash
npm start
```

### Step 3: Connect Your Phone
1. Wait for the QR code to appear in your terminal
2. Open **Expo Go** app on your phone
3. Tap "**Scan QR Code**"
4. Point your camera at the QR code on your computer screen
5. Wait for the app to load (first time takes 1-2 minutes)

### Step 4: Test the App
The NavEd app will now run on your phone! You can test all features:
- Campus Navigation
- Parking Guidance
- Study Assistant
- Settings and Accessibility

**Note:** Your phone and computer must be on the same WiFi network.

---

## Method 2: Build APK (For Standalone Installation)

### Fix Required First:
The current build is failing due to package compatibility issues. Here's how to fix it:

#### Step 1: Remove Incompatible Packages
```bash
npm uninstall react-native-worklets react-native-worklets-core
```

#### Step 2: Update React to Compatible Version
```bash
npm install react@18.2.0 react-native@0.74.5
```

#### Step 3: Clean and Rebuild
```bash
# Clean caches
rm -rf node_modules
npm install

# Try building again
eas build --platform android --profile preview
```

### Alternative: Manual Build Guide

If EAS Build continues to fail, you can build locally:

#### Step 1: Install Android Studio
1. Download from https://developer.android.com/studio
2. Install Android SDK and build tools

#### Step 2: Generate Android Project
```bash
npx expo prebuild --platform android
```

#### Step 3: Build APK
```bash
cd android
./gradlew assembleRelease
```

#### Step 4: Find APK
The APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## Recommended Approach for Now

**Use Expo Go** for immediate testing. It provides:
- ✅ Instant testing (no build required)
- ✅ Live reload (see changes immediately)
- ✅ Full feature access
- ✅ Easy debugging

Build the standalone APK later after fixing the compatibility issues.

---

## Troubleshooting

### Expo Go Shows Error
- Make sure your computer and phone are on the same WiFi
- Restart the development server: `npm start -- --clear`

### QR Code Won't Scan
- Manually enter the connection URL shown in terminal
- Or tap "Enter URL manually" in Expo Go

### App Crashes on Phone
- Check the terminal for error messages
- Try: `npm start -- --clear`

---

For questions, check: https://docs.expo.dev/get-started/expo-go/

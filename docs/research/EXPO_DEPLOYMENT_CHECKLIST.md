# Expo Deployment Checklist & Guide

## Complete App Store & Play Store Submission

**Last Updated:** November 2025
**Expo SDK:** 51+
**EAS CLI:** Latest

---

## Pre-Deployment Checklist

### Configuration Files

- [ ] `app.json` fully configured
- [ ] `eas.json` created and configured
- [ ] Environment variables set
- [ ] API keys secured (not in code)

### App Assets

- [ ] App icon (1024x1024 PNG)
- [ ] Splash screen (1284x2778 PNG)
- [ ] Adaptive icon for Android
- [ ] Notification icon (96x96 white PNG)

### App Information

- [ ] App name finalized
- [ ] Bundle identifier set (com.yourcompany.appname)
- [ ] Version number set
- [ ] Build number set

### Permissions

- [ ] All permissions declared in app.json
- [ ] Permission descriptions written
- [ ] Only necessary permissions requested

### Testing

- [ ] All tests passing
- [ ] App tested on physical devices
- [ ] Accessibility tested
- [ ] Performance tested

---

## app.json Complete Configuration

```json
{
  "expo": {
    "name": "NavEd",
    "slug": "naved",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",

    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1E88E5"
    },

    "assetBundlePatterns": ["**/*"],

    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.naved",
      "buildNumber": "1",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "NavEd needs your location to show your position on the campus map and provide navigation directions.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "NavEd uses your location in the background to provide continuous navigation guidance.",
        "NSCameraUsageDescription": "NavEd uses the camera to capture photos of your parking spot for easy retrieval.",
        "NSMicrophoneUsageDescription": "NavEd uses the microphone for voice commands and study assistant features.",
        "NSPhotoLibraryUsageDescription": "NavEd accesses your photos to select images for parking spot identification.",
        "UIBackgroundModes": ["location"]
      },
      "config": {
        "usesNonExemptEncryption": false
      }
    },

    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1E88E5"
      },
      "package": "com.yourcompany.naved",
      "versionCode": 1,
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECORD_AUDIO",
        "VIBRATE",
        "RECEIVE_BOOT_COMPLETED"
      ],
      "blockedPermissions": [
        "android.permission.READ_CONTACTS",
        "android.permission.WRITE_CONTACTS"
      ]
    },

    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "NavEd needs your location to provide campus navigation and directions."
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "NavEd uses the camera to capture parking spot photos."
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#1E88E5",
          "sounds": []
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": "NavEd uses the microphone for voice commands."
        }
      ],
      "expo-font",
      "expo-document-picker"
    ],

    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    },

    "owner": "your-expo-username",
    "runtimeVersion": {
      "policy": "sdkVersion"
    },
    "updates": {
      "url": "https://u.expo.dev/your-project-id"
    }
  }
}
```

---

## eas.json Configuration

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABC123DEF"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## Step-by-Step Deployment

### Phase 1: Preparation

```bash
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Configure EAS for your project
eas build:configure

# 4. Link to Expo project (if not already)
eas init
```

### Phase 2: iOS Deployment

#### Step 1: Apple Developer Setup

```
1. Go to https://developer.apple.com
2. Enroll in Apple Developer Program ($99/year)
3. Wait for approval (24-48 hours)
4. Accept agreements in App Store Connect
```

#### Step 2: Build iOS App

```bash
# Build for production
eas build --platform ios --profile production

# This will:
# - Prompt for Apple credentials
# - Create signing certificates automatically
# - Upload to EAS build servers
# - Provide download link when complete
```

#### Step 3: Create App Store Listing

```
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - Platform: iOS
   - Name: NavEd - Campus Navigation
   - Primary Language: English (U.S.)
   - Bundle ID: com.yourcompany.naved
   - SKU: NAVED-001
4. Click "Create"
```

#### Step 4: App Store Screenshots

Required sizes:
```
6.7" Display: 1290 x 2796 (iPhone 14 Pro Max)
6.5" Display: 1284 x 2778 (iPhone 13 Pro Max)
5.5" Display: 1242 x 2208 (iPhone 8 Plus)
12.9" iPad: 2048 x 2732 (iPad Pro)

Minimum 3 screenshots per size
Recommended: 5-8 per size
```

#### Step 5: Submit iOS App

```bash
# Submit to App Store Connect
eas submit --platform ios --latest

# Or specify a build
eas submit --platform ios --id BUILD_ID
```

#### Step 6: TestFlight & App Review

```
1. In App Store Connect, go to TestFlight
2. Add internal testers (automatic)
3. Set up external testing group
4. Submit for App Review
5. Wait 24-48 hours for review
```

### Phase 3: Android Deployment

#### Step 1: Google Play Developer Setup

```
1. Go to https://play.google.com/console
2. Pay $25 registration fee (one-time)
3. Complete identity verification
4. Wait for approval (up to 48 hours)
```

#### Step 2: Create Service Account

```
1. Go to Google Cloud Console
2. Create new project (or select existing)
3. Enable Google Play Android Developer API
4. Create Service Account
5. Download JSON key file
6. In Play Console, grant access to service account
```

#### Step 3: Build Android App

```bash
# Build for production (AAB format)
eas build --platform android --profile production

# Wait for build to complete
# Download the .aab file
```

#### Step 4: Create Play Store Listing

```
1. In Play Console, click "Create app"
2. Fill in:
   - App name: NavEd - Campus Navigation
   - Default language: English (US)
   - App or game: App
   - Free or paid: Free
3. Accept policies and create
```

#### Step 5: Store Listing Content

```
Short description (80 chars):
Navigate your campus easily with interactive maps and smart parking guidance.

Full description (4000 chars):
[Include all features, accessibility highlights, etc.]

Feature graphic: 1024 x 500 PNG
App icon: 512 x 512 PNG (32-bit, no alpha)
Screenshots: Minimum 2, maximum 8
Phone screenshots: 16:9 or 9:16 ratio
```

#### Step 6: First Manual Upload

```
IMPORTANT: First upload must be manual!

1. In Play Console, go to Production → Create new release
2. Upload your .aab file manually
3. Complete release notes
4. Save and review
```

#### Step 7: Subsequent Submissions

```bash
# After first manual upload, use EAS Submit
eas submit --platform android --latest

# Specify track
eas submit --platform android --latest --track internal
```

---

## Post-Deployment

### Enable OTA Updates

```bash
# Publish an update
eas update --branch production --message "Bug fixes and improvements"

# Check update status
eas update:list
```

### Monitor Analytics

```typescript
// With Firebase Analytics
import analytics from '@react-native-firebase/analytics';

// Log custom events
await analytics().logEvent('navigation_started', {
  from_building: 'Library',
  to_building: 'Engineering',
});

// Log screen views
await analytics().logScreenView({
  screen_name: 'CampusMap',
  screen_class: 'CampusMapScreen',
});
```

### Handle Crash Reports

```typescript
// With Sentry
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000,
});

// Capture errors manually
try {
  // risky operation
} catch (error) {
  Sentry.captureException(error);
}
```

---

## Common Submission Issues

### iOS Rejection Reasons

| Issue | Solution |
|-------|----------|
| Crash on launch | Test on physical device, check permissions |
| Missing privacy policy | Add URL in app.json and App Store Connect |
| Incomplete metadata | Fill all required fields |
| Guideline 4.3 - Spam | Ensure unique value proposition |
| Login required | Provide demo account for review |

### Android Rejection Reasons

| Issue | Solution |
|-------|----------|
| Permission justification | Add detailed permission descriptions |
| Data safety form | Complete in Play Console |
| Target API level | Ensure targetSdkVersion meets requirements |
| Content rating | Complete questionnaire |
| App access | Provide test credentials |

---

## Privacy & Compliance

### Privacy Policy Requirements

Must include:
- What data you collect
- How data is used
- Data sharing practices
- User rights
- Contact information

### App Privacy (iOS)

In App Store Connect:
```
1. Go to App Privacy
2. Answer questions about data collection:
   - Location data
   - User content
   - Identifiers
   - Usage data
3. Specify data usage purposes
```

### Data Safety (Android)

In Play Console:
```
1. Go to Data safety
2. Answer about:
   - Data collection
   - Data sharing
   - Security practices
3. Submit for review
```

---

## Environment Variables

### Setting Up Secrets

```bash
# Set secret for builds
eas secret:create --name GEMINI_API_KEY --value "your-key" --scope project

# List secrets
eas secret:list

# Use in app
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
```

### app.config.js for Dynamic Config

```javascript
// app.config.js
export default ({ config }) => {
  return {
    ...config,
    extra: {
      geminiApiKey: process.env.GEMINI_API_KEY,
      groqApiKey: process.env.GROQ_API_KEY,
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
  };
};
```

---

## Useful Commands Reference

```bash
# EAS Build Commands
eas build --platform ios              # Build iOS
eas build --platform android          # Build Android
eas build --platform all              # Build both
eas build:list                        # List builds
eas build:cancel                      # Cancel build

# EAS Submit Commands
eas submit --platform ios             # Submit iOS
eas submit --platform android         # Submit Android
eas submit --latest                   # Submit latest build

# EAS Update Commands
eas update --branch production        # Publish OTA update
eas update:list                       # List updates
eas update:delete                     # Delete update

# EAS Credentials Commands
eas credentials                       # Manage credentials
eas credentials --platform ios        # iOS credentials
eas credentials --platform android    # Android credentials

# Project Commands
eas init                              # Initialize EAS
eas build:configure                   # Configure builds
eas whoami                            # Check login status
```

---

## Sources

- [Expo Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Publishing Expo React Native App Guide](https://pagepro.co/blog/publishing-expo-react-native-app-to-ios-and-android/)

---

**Document Version:** 1.0
**Last Updated:** November 2025

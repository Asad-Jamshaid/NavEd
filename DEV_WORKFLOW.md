# Fast Development Workflow Guide

## Option 1: Development Build (FASTEST - Recommended)

### One-Time Setup:
1. Build a development build once:
   ```bash
   eas build --profile development --platform android
   ```

2. Download and install the APK on your device

### Daily Development:
1. Start the dev server:
   ```bash
   expo start --dev-client
   ```

2. Scan the QR code with your development build app (NOT Expo Go)

3. **Changes are pushed instantly** - no rebuild needed!

**Benefits:**
- ✅ Instant updates (hot reload)
- ✅ No APK rebuilds needed
- ✅ Full native module support
- ✅ Fast iteration cycle

---

## Option 2: EAS Update (For Preview/Production Builds)

If you're using the `preview` profile, you can push OTA updates:

### One-Time Setup:
1. Build your preview APK:
   ```bash
   eas build --profile preview --platform android
   ```

2. Install it on your device

### Push Updates Without Rebuilding:
1. Make your code changes

2. Publish an update:
   ```bash
   eas update --branch preview --message "Fixed navigation bug"
   ```

3. The app will automatically download the update on next launch (or you can force it)

**Benefits:**
- ✅ No APK rebuild needed
- ✅ Works with preview/production builds
- ✅ Users get updates automatically

**Note:** Requires `updates.enabled: true` in app.json (already configured)

---

## Quick Comparison:

| Method | Speed | Use Case |
|--------|-------|----------|
| **Development Build** | ⚡⚡⚡ Instant | Active development |
| **EAS Update** | ⚡⚡ Fast (OTA) | Preview/Production testing |
| **Full Rebuild** | ⚡ Slow | Native code changes only |

---

## When to Rebuild:

Only rebuild the APK when you:
- Add/remove native dependencies
- Change native code (Java/Kotlin/Swift/Objective-C)
- Change app.json native config (permissions, plugins, etc.)
- Change build configuration

For JavaScript/TypeScript changes: **Use dev client or EAS Update!**


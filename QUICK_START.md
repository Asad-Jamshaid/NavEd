# NavEd Quick Start Guide

Get your NavEd app up and running in 5 steps!

---

## ✅ Step 1: Install Dependencies

```bash
npm install
```

---

## ✅ Step 2: Configure Campus Data

**This is the most important step!**

1. Open `src/data/campusData.ts`
2. Replace sample buildings with your university's buildings
3. Get coordinates using Google Maps (right-click on building → copy coordinates)
4. Update `src/utils/constants.ts` with your campus center coordinates

**Quick Method:**
- Open Google Maps
- Find your campus center
- Right-click → Copy coordinates
- Paste into `CAMPUS_CONFIG.center`

See `docs/CAMPUS_DATA_SETUP_GUIDE.md` for detailed instructions.

---

## ✅ Step 3: Add API Key (Optional)

For Study Assistant features:

1. Get a FREE Gemini API key: https://makersuite.google.com/app/apikey
2. Open NavEd app → Study tab → Settings icon
3. Tap "Configure API Key" → Choose "Gemini"
4. Paste your key → Save

**Note:** App works without API key, but Study Assistant features won't work.

See `docs/API_KEYS_SETUP_GUIDE.md` for all options.

---

## ✅ Step 4: Deploy PDF API (Optional)

If you want PDF document support:

1. Install Vercel CLI: `npm install -g vercel`
2. Deploy: `cd api && vercel`
3. Copy the URL you get
4. Create `.env` file: `EXPO_PUBLIC_PDF_API_URL=your-url-here`
5. Restart app: `npm start -- --clear`

See `api/README.md` for details.

---

## ✅ Step 5: Run the App

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios
```

Or scan the QR code with Expo Go app on your phone!

---

## 🎉 You're Done!

Your NavEd app is now running! 

### Next Steps:

- **Test all features** on your device
- **Add more buildings** to campus data
- **Build APK** when ready (see `docs/BUILD_AND_DEPLOY_GUIDE.md`)
- **Submit to stores** (optional)

---

## Need Help?

- **Campus Data:** See `docs/CAMPUS_DATA_SETUP_GUIDE.md`
- **API Keys:** See `docs/API_KEYS_SETUP_GUIDE.md`
- **Building:** See `docs/BUILD_AND_DEPLOY_GUIDE.md`
- **PDF API:** See `api/README.md`

---

## Common Issues

**"Buildings don't show on map":**
- Check campus center coordinates are correct
- Verify building coordinates are near campus center

**"Study Assistant doesn't work":**
- Add API key in Settings
- Check internet connection

**"App crashes":**
- Check all dependencies installed: `npm install`
- Clear cache: `npm start -- --clear`

---

## What's Working

✅ All screens revamped with modern design
✅ Dark mode, font scaling, high contrast
✅ Campus navigation (needs your data)
✅ Parking guidance (needs your data)
✅ Study Assistant (needs API key)
✅ Settings and accessibility features
✅ All TypeScript errors fixed
✅ Ready for production builds

---

**Happy navigating! 🗺️**


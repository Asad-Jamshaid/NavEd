# API Keys Setup Guide

NavEd uses FREE AI APIs for the Study Assistant features. Here's how to get and configure them.

## Overview

The Study Assistant supports three AI providers:
1. **Google Gemini** (Recommended - 60 requests/minute FREE)
2. **Groq** (Very generous free tier)
3. **HuggingFace** (Free inference API)

You only need ONE API key to use the Study Assistant. Gemini is recommended for best results.

---

## Option 1: Google Gemini (Recommended)

### Step 1: Get Your API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy your API key (starts with `AIza...`)

### Step 2: Add to App

1. Open the NavEd app
2. Go to **Study** tab
3. Tap the **Settings icon** (⚙️) in the top right
4. Select **"Configure API Key"**
5. Choose **"Gemini"**
6. Paste your API key
7. Tap **"Save"**

### Free Tier Limits:
- ✅ 60 requests per minute
- ✅ 1,500 requests per day
- ✅ Perfect for personal use

---

## Option 2: Groq

### Step 1: Get Your API Key

1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign up for a free account
3. Navigate to **API Keys**
4. Click **"Create API Key"**
5. Copy your API key

### Step 2: Add to App

Same steps as Gemini, but choose **"Groq"** instead.

### Free Tier Limits:
- ✅ Very generous rate limits
- ✅ Fast inference
- ✅ Multiple model options

---

## Option 3: HuggingFace

### Step 1: Get Your API Key

1. Go to [HuggingFace Settings](https://huggingface.co/settings/tokens)
2. Sign in or create account
3. Click **"New token"**
4. Name it (e.g., "NavEd")
5. Select **"Read"** permission
6. Copy your token (starts with `hf_...`)

### Step 2: Add to App

Same steps as Gemini, but choose **"HuggingFace"** instead.

### Free Tier Limits:
- ✅ Free inference API
- ✅ Multiple models available
- ⚠️ Rate limits vary by model

---

## Using Multiple Providers

You can add keys for all three providers and switch between them:

1. Add all three API keys in Settings
2. The app will use the one you select
3. You can switch providers anytime

---

## Security Notes

- ✅ API keys are stored **locally** on your device
- ✅ Keys are **encrypted** in AsyncStorage
- ✅ Keys are **never** sent to our servers
- ✅ You can clear keys anytime in Settings

---

## Troubleshooting

### "Invalid API Key" Error

1. **Check the key is correct:**
   - Gemini keys start with `AIza...`
   - Groq keys are long alphanumeric strings
   - HuggingFace tokens start with `hf_...`

2. **Verify you copied the entire key:**
   - No extra spaces
   - No line breaks
   - Complete key from start to end

3. **Check API key is active:**
   - Gemini: Check [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Groq: Check [Groq Console](https://console.groq.com/keys)
   - HuggingFace: Check [HuggingFace Settings](https://huggingface.co/settings/tokens)

### "Rate Limit Exceeded" Error

- You've hit the free tier limit
- Wait a few minutes and try again
- Or switch to a different provider

### "API Key Not Set" Error

1. Go to Study > Settings
2. Tap "Configure API Key"
3. Add your API key
4. Make sure to tap "Save"

---

## Testing Your API Key

After adding your key:

1. Go to **Study** tab
2. Upload a document (or use sample text)
3. Ask a question in the chat
4. If you get a response, your key is working! ✅

---

## Cost Information

All three providers offer **FREE tiers** that are perfect for personal use:

- **Gemini**: Free forever (with rate limits)
- **Groq**: Free tier with generous limits
- **HuggingFace**: Free inference API

You will **never** be charged unless you explicitly upgrade to a paid plan.

---

## Need Help?

- Check the app's **About** section in Settings
- Review error messages for specific issues
- Verify your internet connection
- Try a different provider if one doesn't work


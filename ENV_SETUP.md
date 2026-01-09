# Environment Variables Setup Guide

## Overview
All secrets and API keys are now stored in environment variables. **Never commit your `.env` file to Git!**

## Required Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Supabase Configuration (Required for cloud features)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# For Expo/React Native, also add EXPO_PUBLIC_ prefix:
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI/LLM API Keys (Required for Study Assistant features)
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key (optional)
HUGGINGFACE_API_KEY=your_huggingface_api_key (optional)

# For Expo/React Native, also add EXPO_PUBLIC_ prefix:
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key (optional)
EXPO_PUBLIC_HUGGINGFACE_API_KEY=your_huggingface_api_key (optional)
```

## Setup Instructions

### 1. Create `.env` File

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your actual keys
# NEVER commit this file!
```

### 2. Get Your API Keys

#### Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy `Project URL` → `SUPABASE_URL`
5. Copy `anon public` key → `SUPABASE_ANON_KEY`

#### Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click "Get API Key"
3. Create a new API key
4. Copy the key → `GEMINI_API_KEY`

#### Groq API Key (Optional)
1. Go to [Groq Console](https://console.groq.com)
2. Create an account
3. Go to API Keys
4. Create a new key → `GROQ_API_KEY`

#### HuggingFace API Key (Optional)
1. Go to [HuggingFace](https://huggingface.co/settings/tokens)
2. Create a new token
3. Copy the token → `HUGGINGFACE_API_KEY`

### 3. Verify Setup

#### Test Supabase Connection
```bash
# Windows PowerShell
$env:SUPABASE_URL="your-url"; $env:SUPABASE_ANON_KEY="your-key"; node backend/scripts/test-supabase-direct.js

# Linux/Mac
SUPABASE_URL="your-url" SUPABASE_ANON_KEY="your-key" node backend/scripts/test-supabase-direct.js
```

#### Test Gemini API Key
```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your-key"; node backend/scripts/test-api-key.js

# Linux/Mac
GEMINI_API_KEY="your-key" node backend/scripts/test-api-key.js
```

## Security Best Practices

✅ **DO:**
- Keep `.env` file in `.gitignore` (already configured)
- Use `.env.example` as a template (no real keys)
- Rotate keys if they're ever exposed
- Use different keys for development and production

❌ **DON'T:**
- Commit `.env` file to Git
- Share `.env` file in chat/email
- Hardcode keys in source code
- Use production keys in development

## Files That Use Environment Variables

- `frontend/shared/services/databaseService.ts` - Supabase connection
- `frontend/features/study/services/studyAssistantService.ts` - LLM API keys
- `frontend/shared/utils/constants.ts` - Supabase config (reads from env)
- `backend/scripts/test-api-key.js` - Gemini API testing
- `backend/scripts/test-supabase-direct.js` - Supabase connection testing
- `backend/scripts/test-supabase-connection.js` - Supabase connection testing

## Troubleshooting

### "Environment variables not available"
- Make sure `.env` file exists in project root
- For Expo: Restart the development server after creating `.env`
- For Node.js scripts: Set environment variables before running

### "Supabase not configured"
- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in `.env`
- Verify the keys are correct in Supabase dashboard
- App will work in local-only mode without Supabase

### "API key not working"
- Verify the key is correct (no extra spaces)
- Check API key hasn't expired or been revoked
- For Gemini: Check quota limits in Google Cloud Console
- Users can also add keys manually in app Settings

## Production Deployment

For production builds (EAS, Vercel, etc.):

1. **EAS Build**: Add environment variables in `eas.json` or EAS dashboard
2. **Vercel**: Add environment variables in project settings
3. **GitHub Actions**: Use GitHub Secrets (Settings → Secrets)

Never hardcode production keys in source code!


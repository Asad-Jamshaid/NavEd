# NavEd Backend Structure

This document describes the backend architecture and separation from the frontend.

## 📁 Backend Directory Structure

```
backend/
├── api/                          # Serverless API Functions
│   ├── extract-pdf.ts           # PDF text extraction endpoint (Vercel)
│   ├── package.json             # API-specific dependencies
│   ├── README.md                # API documentation
│   └── types.d.ts               # TypeScript types
│
├── database/                     # Database Files
│   ├── migrations/              # Database migration scripts
│   │   └── 001_initial_schema.sql
│   ├── seed_parking_complete.sql
│   ├── seed_parking_history.sql
│   ├── seed_parking_simple.sql
│   └── seed_parking_with_policies.sql
│
├── scripts/                      # Utility Scripts
│   ├── test-api-key.js          # Test Gemini API key
│   ├── test-supabase-connection.js  # Test Supabase connection
│   └── test-supabase-direct.js      # Direct Supabase test
│
├── config/                       # Backend Configuration
│   └── vercel.json              # Vercel deployment config (backup)
│
├── package.json                  # Backend dependencies
└── README.md                     # Backend documentation
```

## 🔄 Frontend vs Backend Separation

### Frontend (`frontend/`)
- **Location**: `frontend/`
- **Purpose**: React Native mobile application
- **Contains**:
  - React components and screens
  - Client-side services
  - UI logic
  - Mobile-specific code
  - Client-side state management

### Backend (`backend/`)
- **Location**: `backend/`
- **Purpose**: Server-side services and APIs
- **Contains**:
  - Serverless API functions
  - Database migrations and seeds
  - Backend utility scripts
  - Server configuration

## 🚀 API Endpoints

### PDF Text Extraction
- **Endpoint**: `POST /api/extract-pdf`
- **File**: `backend/api/extract-pdf.ts`
- **Platform**: Vercel Serverless Function
- **Purpose**: Extract text from PDF files (not available in React Native)
- **Status**: Available but currently using Gemini AI directly in frontend

## 🗄️ Database

### Migrations
Located in `backend/database/migrations/`:
- `001_initial_schema.sql` - Initial database schema

### Seed Files
Located in `backend/database/`:
- `seed_parking_simple.sql` - Simple parking data
- `seed_parking_history.sql` - Parking history data
- `seed_parking_complete.sql` - Complete parking dataset
- `seed_parking_with_policies.sql` - Parking data with policies

## 📦 Backend Dependencies

Backend has its own `package.json` with:
- `@vercel/node` - Vercel serverless runtime
- `pdf-parse` - PDF text extraction
- `@supabase/supabase-js` - Supabase client (for scripts)

## 🧪 Testing Backend

```bash
cd backend

# Test API key
npm run test:api

# Test Supabase connection
npm run test:supabase

# Test Supabase direct connection
npm run test:supabase-direct
```

## 🚢 Deployment

### Vercel Deployment

The backend API is deployed as Vercel serverless functions.

**Configuration**: `vercel.json` (at project root)

**Deploy**:
```bash
# From project root
vercel --prod

# Or from backend directory
cd backend
npm run deploy
```

## 🔗 Frontend Integration

### Current Implementation

The frontend (in `frontend/`) currently uses:
- **PDF Extraction**: Gemini AI directly (client-side)
- **Database**: Supabase client-side SDK

### Future Integration

The backend API (`/api/extract-pdf`) can be used as an alternative to Gemini for PDF extraction:

```typescript
// Example: Use backend API instead of Gemini
// From frontend/features/study/services/studyAssistantService.ts
const response = await fetch('https://your-app.vercel.app/api/extract-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pdf: base64PdfData })
});
```

## 📝 Environment Variables

Backend requires (set in Vercel dashboard):
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `GEMINI_API_KEY` - Google Gemini API key (optional, for PDF extraction)

## 🔒 Security Notes

- API endpoints include CORS headers
- Supabase handles authentication and authorization
- API keys should be stored securely (never commit to git)
- Use environment variables for sensitive data

## 📚 Related Documentation

- Frontend Structure: See `STRUCTURE.md`
- API Documentation: See `backend/api/README.md`
- Database Setup: See `docs/CAMPUS_DATA_SETUP_GUIDE.md`


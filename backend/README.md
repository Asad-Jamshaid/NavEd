# NavEd Backend

Backend services and API for NavEd mobile application.

## 📁 Structure

```
backend/
├── api/                    # Serverless API functions
│   ├── extract-pdf.ts     # PDF text extraction endpoint
│   ├── package.json        # API-specific dependencies
│   └── README.md          # API documentation
│
├── database/              # Database files
│   ├── migrations/        # Database migration scripts
│   └── seed_*.sql        # Database seed files
│
├── scripts/               # Utility scripts
│   ├── test-api-key.js    # Test Gemini API key
│   ├── test-supabase-connection.js  # Test Supabase connection
│   └── test-supabase-direct.js      # Direct Supabase test
│
├── config/                # Backend configuration
│   └── vercel.json        # Vercel deployment configuration
│
└── package.json          # Backend dependencies
```

## 🚀 API Endpoints

### PDF Text Extraction
- **Endpoint**: `POST /api/extract-pdf`
- **Description**: Extracts text from PDF files
- **Location**: `backend/api/extract-pdf.ts`
- **Deployment**: Vercel serverless function

## 🗄️ Database

Database migrations and seed files are located in `backend/database/`.

### Migrations
- `001_initial_schema.sql` - Initial database schema

### Seeds
- `seed_parking_simple.sql` - Simple parking data
- `seed_parking_history.sql` - Parking history data
- `seed_parking_complete.sql` - Complete parking dataset
- `seed_parking_with_policies.sql` - Parking data with policies

## 📦 Installation

```bash
cd backend
npm install
```

## 🧪 Testing

```bash
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

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
npm run deploy
```

Or from the project root:
```bash
vercel --prod
```

### Configuration

Vercel configuration is in `backend/config/vercel.json`.

## 🔗 Frontend Integration

The mobile app (in `src/`) calls these backend endpoints:

- PDF Extraction: Used by Study Assistant feature
- Database: Supabase connection (handled client-side with optional backend sync)

## 📝 Environment Variables

Required environment variables (set in Vercel dashboard or `.env`):

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `GEMINI_API_KEY` - Google Gemini API key (for PDF extraction)

## 🔒 Security

- API endpoints include CORS headers
- Supabase handles authentication and authorization
- API keys should be stored securely (never commit to git)


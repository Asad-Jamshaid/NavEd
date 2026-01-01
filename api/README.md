# NavEd PDF Extraction API

This directory contains a Vercel serverless function for extracting text from PDF files.

## Why This Is Needed

React Native (Expo) cannot process PDF files directly because PDF parsing libraries require Node.js file system access, which is not available in the mobile environment. This serverless function provides a FREE backend solution for PDF text extraction.

## Deployment Instructions

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy to Vercel (FREE)

```bash
# From the root of your project
vercel

# Follow the prompts:
# - Login to your Vercel account (or create one - it's free)
# - Link to existing project or create new one
# - Accept default settings
```

### 3. Get Your Deployment URL

After deployment, Vercel will give you a URL like:
```
https://naved-abc123.vercel.app
```

### 4. Configure the Mobile App

Add your Vercel URL to the app's environment variables:

Create a file called `.env` in the root of your project:

```env
EXPO_PUBLIC_PDF_API_URL=https://your-actual-deployment-url.vercel.app
```

**Important:** Replace `your-actual-deployment-url` with your real Vercel URL!

### 5. Rebuild Your App

After setting the environment variable, rebuild your app:

```bash
npm start
```

Clear cache if needed:
```bash
npm start -- --clear
```

## How It Works

1. User selects a PDF file in the mobile app
2. App reads the PDF as base64
3. App sends base64 data to Vercel function
4. Vercel function uses `pdf-parse` to extract text
5. Extracted text is returned to the app
6. App uses the text for RAG/chatbot features

## API Endpoint

### POST /api/extract-pdf

**Request:**
```json
{
  "pdfData": "base64_encoded_pdf_content",
  "filename": "document.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "text": "extracted text content...",
  "metadata": {
    "filename": "document.pdf",
    "pages": 10,
    "info": { ... },
    "textLength": 5432
  }
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Limits

- **File Size:** Maximum 10MB per PDF
- **Vercel Free Tier:**
  - 100GB bandwidth per month
  - 100 hours execution time per month
  - More than enough for student use!

## Testing the API

You can test the deployed API with curl:

```bash
# First, convert a test PDF to base64
# On Mac/Linux:
base64 -i test.pdf -o test.txt

# On Windows:
certutil -encode test.pdf test.txt

# Then test the API:
curl -X POST https://your-app.vercel.app/api/extract-pdf \
  -H "Content-Type: application/json" \
  -d '{"pdfData": "BASE64_CONTENT_HERE", "filename": "test.pdf"}'
```

## Troubleshooting

### "Failed to deploy"
- Make sure you're logged into Vercel: `vercel login`
- Check that `api/package.json` exists
- Try deploying with `vercel --prod`

### "PDF extraction failed"
- Check that the PDF is under 10MB
- Ensure the base64 encoding is correct
- Check Vercel function logs: `vercel logs`

### "API URL not configured"
- Make sure `.env` file exists in project root
- Check that the URL doesn't contain `your-app` placeholder
- Restart the Expo dev server after changing `.env`

## Cost

**FREE!** Vercel's free tier includes:
- Unlimited projects
- 100GB bandwidth/month
- 100 hours serverless execution/month
- No credit card required

This is more than sufficient for personal/student use.

## Alternative Solutions

If you don't want to deploy to Vercel, see `docs/research/PDF_EXTRACTION_SOLUTIONS.md` for other options:
1. Third-party PDF APIs (OCR.space, etc.)
2. Expo development build with native PDF library
3. User uploads .txt files instead

## Security

- The API accepts requests from any origin (CORS enabled)
- No authentication required (suitable for student apps)
- For production, consider adding:
  - API key authentication
  - Rate limiting
  - Request validation

## Support

For issues or questions, check:
- Vercel Documentation: https://vercel.com/docs
- NavEd Documentation: `docs/research/PDF_EXTRACTION_SOLUTIONS.md`

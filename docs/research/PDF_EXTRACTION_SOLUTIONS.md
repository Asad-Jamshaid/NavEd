# PDF Text Extraction Solutions for React Native Expo

## Complete Implementation Guide

**Last Updated:** November 2025
**Challenge:** pdf-parse requires Node.js fs module, unavailable in React Native

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [Solution 1: Backend API (Recommended)](#2-solution-1-backend-api-recommended)
3. [Solution 2: Development Build](#3-solution-2-development-build)
4. [Solution 3: Third-Party Services](#4-solution-3-third-party-services)
5. [Implementation Code](#5-implementation-code)

---

## 1. The Problem

### Why pdf-parse Doesn't Work

```javascript
// This FAILS in React Native
import pdf from 'pdf-parse';

const extractText = async (pdfPath) => {
  const dataBuffer = fs.readFileSync(pdfPath); // ERROR: fs not available!
  const data = await pdf(dataBuffer);
  return data.text;
};
```

**Error:** `Unable to resolve module 'fs'`

### Root Cause

- React Native runs in a JavaScript environment without Node.js modules
- Libraries like `pdf-parse`, `pdfjs-dist` depend on Node.js `fs` module
- Expo managed workflow restricts native module access

---

## 2. Solution 1: Backend API (Recommended)

### Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  React Native   │────>│  Backend API    │
│  Expo App       │<────│  (Vercel/AWS)   │
└─────────────────┘     └─────────────────┘
     Upload PDF              Parse PDF
     Receive Text            Return Text
```

### Step 1: Create Vercel Backend

```bash
# Create new project
mkdir naved-pdf-parser
cd naved-pdf-parser
npm init -y

# Install dependencies
npm install pdf-parse

# Create vercel.json
```

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    { "src": "api/**/*.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" }
  ]
}
```

### Step 2: Create PDF Parser Endpoint

**api/parse-pdf.js:**
```javascript
const pdf = require('pdf-parse');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pdfBase64 } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ error: 'No PDF data provided' });
    }

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    // Validate PDF magic bytes
    const pdfHeader = pdfBuffer.slice(0, 5).toString();
    if (pdfHeader !== '%PDF-') {
      return res.status(400).json({ error: 'Invalid PDF file' });
    }

    // Parse PDF
    const data = await pdf(pdfBuffer, {
      max: 0, // No page limit
    });

    return res.status(200).json({
      text: data.text,
      numPages: data.numpages,
      info: data.info,
      metadata: data.metadata,
    });

  } catch (error) {
    console.error('PDF parsing error:', error);
    return res.status(500).json({
      error: 'Failed to parse PDF',
      message: error.message,
    });
  }
};
```

### Step 3: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Note your deployment URL
# Example: https://naved-pdf-parser.vercel.app
```

### Step 4: React Native Integration

```typescript
// src/services/pdfService.ts

import * as FileSystem from 'expo-file-system';

const PDF_PARSER_URL = 'https://YOUR-VERCEL-URL.vercel.app/api/parse-pdf';

interface PDFParseResult {
  text: string;
  numPages: number;
  info: {
    Title?: string;
    Author?: string;
    CreationDate?: string;
  };
}

/**
 * Extract text from a PDF file
 * @param uri - Local file URI from document picker
 * @returns Extracted text and metadata
 */
export const extractTextFromPDF = async (uri: string): Promise<PDFParseResult> => {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Send to backend
    const response = await fetch(PDF_PARSER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pdfBase64: base64 }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'PDF parsing failed');
    }

    const result = await response.json();
    return result;

  } catch (error: any) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
};

/**
 * Extract text with progress callback
 */
export const extractTextFromPDFWithProgress = async (
  uri: string,
  onProgress?: (stage: string) => void
): Promise<PDFParseResult> => {
  try {
    onProgress?.('Reading file...');

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    onProgress?.('Uploading to parser...');

    const response = await fetch(PDF_PARSER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pdfBase64: base64 }),
    });

    onProgress?.('Extracting text...');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'PDF parsing failed');
    }

    onProgress?.('Complete!');
    return await response.json();

  } catch (error: any) {
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
};
```

### Usage in App

```typescript
// In StudyAssistantScreen.tsx

import { extractTextFromPDF } from '@services/pdfService';
import * as DocumentPicker from 'expo-document-picker';

const handleUploadDocument = async () => {
  try {
    setIsLoading(true);
    setLoadingMessage('Selecting file...');

    // Pick document
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const file = result.assets[0];
    setLoadingMessage('Extracting text from PDF...');

    // Extract text
    const pdfData = await extractTextFromPDF(file.uri);

    // Create document record
    const document = {
      id: `doc-${Date.now()}`,
      name: file.name,
      uri: file.uri,
      type: 'pdf' as const,
      size: file.size || 0,
      content: pdfData.text,
      numPages: pdfData.numPages,
      createdAt: new Date().toISOString(),
    };

    await addDocument(document);

    Alert.alert(
      'Success',
      `Extracted ${pdfData.numPages} pages of text from ${file.name}`
    );

  } catch (error: any) {
    Alert.alert('Error', error.message);
  } finally {
    setIsLoading(false);
  }
};
```

---

## 3. Solution 2: Development Build

### When to Use

- Need offline PDF parsing
- Can't use external backend
- Have access to native development tools

### Setup

```bash
# Create development build
npx expo prebuild

# Install native PDF library
npm install react-native-pdf-lib

# Rebuild
npx expo run:ios
# or
npx expo run:android
```

### Implementation with react-native-pdf-lib

```typescript
// Note: Requires development build, not Expo Go

import RNPDFLib from 'react-native-pdf-lib';

const extractWithNativeLib = async (uri: string): Promise<string> => {
  try {
    // This library is for PDF creation, not extraction
    // For extraction, use react-native-pdf-text-extractor
    // (requires native linking)

    const text = await RNPDFLib.getDocumentText(uri);
    return text;
  } catch (error) {
    throw new Error('Native PDF extraction failed');
  }
};
```

### Alternative: pdfjs-dist with Web Worker

```typescript
// For Expo web build only

import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const extractTextWeb = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n\n';
  }

  return fullText;
};
```

---

## 4. Solution 3: Third-Party Services

### Option A: Adobe PDF Services (Free Tier)

```typescript
// 500 free API calls/month

const ADOBE_CLIENT_ID = 'your-client-id';
const ADOBE_CLIENT_SECRET = 'your-client-secret';

const extractWithAdobe = async (pdfBase64: string): Promise<string> => {
  // 1. Get access token
  const tokenResponse = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `client_id=${ADOBE_CLIENT_ID}&client_secret=${ADOBE_CLIENT_SECRET}&grant_type=client_credentials&scope=openid,AdobeID,DCAPI`,
  });

  const { access_token } = await tokenResponse.json();

  // 2. Upload and extract
  // ... (Adobe's full flow requires multiple API calls)

  return extractedText;
};
```

### Option B: Google Cloud Document AI (Free Tier)

```typescript
// 1,000 pages/month free

const GOOGLE_API_KEY = 'your-api-key';

const extractWithGoogleDocAI = async (pdfBase64: string): Promise<string> => {
  const response = await fetch(
    `https://documentai.googleapis.com/v1/projects/YOUR_PROJECT/locations/us/processors/YOUR_PROCESSOR:process?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rawDocument: {
          content: pdfBase64,
          mimeType: 'application/pdf',
        },
      }),
    }
  );

  const result = await response.json();
  return result.document.text;
};
```

### Option C: OCR.space (Free Tier)

```typescript
// 25,000 requests/month free

const OCR_SPACE_API_KEY = 'your-api-key';

const extractWithOCRSpace = async (pdfBase64: string): Promise<string> => {
  const formData = new FormData();
  formData.append('base64Image', `data:application/pdf;base64,${pdfBase64}`);
  formData.append('apikey', OCR_SPACE_API_KEY);
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');
  formData.append('filetype', 'PDF');

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (result.IsErroredOnProcessing) {
    throw new Error(result.ErrorMessage[0]);
  }

  return result.ParsedResults
    .map((r: any) => r.ParsedText)
    .join('\n');
};
```

---

## 5. Implementation Code

### Complete PDF Service with Multiple Backends

```typescript
// src/services/pdfExtractionService.ts

import * as FileSystem from 'expo-file-system';

type ExtractionMethod = 'vercel' | 'ocr-space' | 'google-docai';

interface ExtractionResult {
  text: string;
  pages?: number;
  method: ExtractionMethod;
  success: boolean;
  error?: string;
}

// Configuration
const CONFIG = {
  VERCEL_URL: 'https://your-app.vercel.app/api/parse-pdf',
  OCR_SPACE_KEY: '', // Set via settings
  GOOGLE_KEY: '',    // Set via settings
};

/**
 * Set API keys at runtime
 */
export const setExtractionConfig = (config: Partial<typeof CONFIG>) => {
  Object.assign(CONFIG, config);
};

/**
 * Extract text using Vercel backend (primary)
 */
const extractWithVercel = async (base64: string): Promise<ExtractionResult> => {
  try {
    const response = await fetch(CONFIG.VERCEL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfBase64: base64 }),
    });

    if (!response.ok) throw new Error('Vercel extraction failed');

    const data = await response.json();
    return {
      text: data.text,
      pages: data.numPages,
      method: 'vercel',
      success: true,
    };
  } catch (error: any) {
    return {
      text: '',
      method: 'vercel',
      success: false,
      error: error.message,
    };
  }
};

/**
 * Extract text using OCR.space (fallback)
 */
const extractWithOCRSpace = async (base64: string): Promise<ExtractionResult> => {
  if (!CONFIG.OCR_SPACE_KEY) {
    return {
      text: '',
      method: 'ocr-space',
      success: false,
      error: 'OCR.space API key not configured',
    };
  }

  try {
    const formData = new FormData();
    formData.append('base64Image', `data:application/pdf;base64,${base64}`);
    formData.append('apikey', CONFIG.OCR_SPACE_KEY);
    formData.append('language', 'eng');
    formData.append('filetype', 'PDF');
    formData.append('OCREngine', '2');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.IsErroredOnProcessing) {
      throw new Error(result.ErrorMessage?.[0] || 'OCR failed');
    }

    const text = result.ParsedResults
      ?.map((r: any) => r.ParsedText)
      .join('\n') || '';

    return {
      text,
      method: 'ocr-space',
      success: true,
    };
  } catch (error: any) {
    return {
      text: '',
      method: 'ocr-space',
      success: false,
      error: error.message,
    };
  }
};

/**
 * Main extraction function with fallback
 */
export const extractPDFText = async (
  uri: string,
  preferredMethod?: ExtractionMethod
): Promise<ExtractionResult> => {
  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Validate file size (max 10MB)
  const sizeInMB = (base64.length * 0.75) / (1024 * 1024);
  if (sizeInMB > 10) {
    return {
      text: '',
      method: preferredMethod || 'vercel',
      success: false,
      error: 'File too large. Maximum size is 10MB.',
    };
  }

  // Try preferred method first
  if (preferredMethod) {
    switch (preferredMethod) {
      case 'vercel':
        return extractWithVercel(base64);
      case 'ocr-space':
        return extractWithOCRSpace(base64);
      default:
        break;
    }
  }

  // Default: Try Vercel, then fallback to OCR.space
  let result = await extractWithVercel(base64);

  if (!result.success && CONFIG.OCR_SPACE_KEY) {
    console.log('Vercel failed, trying OCR.space...');
    result = await extractWithOCRSpace(base64);
  }

  return result;
};

/**
 * Extract text from multiple PDFs
 */
export const extractMultiplePDFs = async (
  uris: string[],
  onProgress?: (current: number, total: number) => void
): Promise<ExtractionResult[]> => {
  const results: ExtractionResult[] = [];

  for (let i = 0; i < uris.length; i++) {
    onProgress?.(i + 1, uris.length);
    const result = await extractPDFText(uris[i]);
    results.push(result);
  }

  return results;
};
```

### React Component for PDF Upload

```typescript
// src/components/PDFUploader.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { extractPDFText } from '@services/pdfExtractionService';
import AccessibleButton from './AccessibleButton';

interface Props {
  onTextExtracted: (text: string, fileName: string) => void;
  maxSizeMB?: number;
}

const PDFUploader: React.FC<Props> = ({
  onTextExtracted,
  maxSizeMB = 10,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handlePickDocument = async () => {
    try {
      setIsLoading(true);
      setStatus('Selecting file...');

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsLoading(false);
        setStatus('');
        return;
      }

      const file = result.assets[0];

      // Check file size
      const sizeMB = (file.size || 0) / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        Alert.alert(
          'File Too Large',
          `Maximum file size is ${maxSizeMB}MB. Your file is ${sizeMB.toFixed(1)}MB.`
        );
        setIsLoading(false);
        setStatus('');
        return;
      }

      setStatus('Extracting text from PDF...');

      const extractionResult = await extractPDFText(file.uri);

      if (!extractionResult.success) {
        Alert.alert('Extraction Failed', extractionResult.error || 'Unknown error');
        setIsLoading(false);
        setStatus('');
        return;
      }

      if (!extractionResult.text.trim()) {
        Alert.alert(
          'No Text Found',
          'The PDF appears to be empty or contains only images. Try a different file.'
        );
        setIsLoading(false);
        setStatus('');
        return;
      }

      onTextExtracted(extractionResult.text, file.name);
      setStatus('');

      Alert.alert(
        'Success!',
        `Extracted ${extractionResult.text.length.toLocaleString()} characters` +
        (extractionResult.pages ? ` from ${extractionResult.pages} pages` : '')
      );

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AccessibleButton
        title={isLoading ? 'Processing...' : 'Upload PDF'}
        onPress={handlePickDocument}
        disabled={isLoading}
        icon="upload-file"
        accessibilityLabel="Upload a PDF document"
        accessibilityHint="Opens file picker to select a PDF for text extraction"
      />

      {isLoading && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color="#1E88E5" />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      )}

      <Text style={styles.helpText}>
        Supported: PDF files up to {maxSizeMB}MB
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statusText: {
    marginLeft: 8,
    color: '#666',
  },
  helpText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
});

export default PDFUploader;
```

---

## Comparison of Solutions

| Solution | Cost | Offline | Speed | Setup |
|----------|------|---------|-------|-------|
| Vercel Backend | Free | No | Fast | Easy |
| Development Build | Free | Yes | Fast | Hard |
| OCR.space | Free tier | No | Medium | Easy |
| Adobe PDF Services | Free tier | No | Fast | Medium |
| Google Document AI | Free tier | No | Fast | Medium |

---

## Recommendations

1. **For Expo Managed Workflow:** Use Vercel backend (Solution 1)
2. **For Production Apps:** Use Vercel + OCR.space fallback
3. **For Offline Support:** Use Development Build (Solution 2)
4. **For Enterprise:** Consider Adobe or Google services

---

## Sources

- [PDF Extraction in Expo Without Native Dependencies](https://medium.com/@wenxuanlee/pdf-extraction-in-expo-without-native-dependencies-2d655ba74629)
- [How to Read PDF Files Using React Native Expo](https://ninza7.medium.com/how-to-read-pdf-files-using-react-native-expo-app-fa298aca2536)
- [Stack Overflow: PDF Text Extraction in React Native](https://stackoverflow.com/questions/65403814/how-extract-text-from-pdf-file-in-react-native)
- [OCR.space API Documentation](https://ocr.space/OCRAPI)

---

**Document Version:** 1.0
**Last Updated:** November 2025

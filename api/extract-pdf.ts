// ==========================================
// Vercel Serverless Function for PDF Text Extraction
// Deploy this to Vercel for FREE PDF parsing
// ==========================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import pdf from 'pdf-parse';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get PDF from request body (base64 encoded)
    const { pdfData, filename } = req.body;

    if (!pdfData) {
      return res.status(400).json({ error: 'No PDF data provided' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(pdfData, 'base64');

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (buffer.length > maxSize) {
      return res.status(400).json({
        error: 'File too large. Maximum size is 10MB.',
        maxSize
      });
    }

    // Extract text from PDF
    const data = await pdf(buffer);

    // Return extracted text
    return res.status(200).json({
      success: true,
      text: data.text,
      metadata: {
        filename: filename || 'unknown.pdf',
        pages: data.numpages,
        info: data.info,
        textLength: data.text.length,
      },
    });
  } catch (error: any) {
    console.error('PDF extraction error:', error);

    return res.status(500).json({
      error: 'Failed to extract text from PDF',
      message: error.message,
    });
  }
}

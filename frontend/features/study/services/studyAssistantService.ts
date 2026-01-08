// ==========================================
// Study Assistant Service - RAG + Free LLM
// Uses FREE APIs: Gemini Free Tier / Groq / HuggingFace
// ==========================================

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import JSZip from 'jszip';
import {
  Document,
  DocumentChunk,
  ChatMessage,
  StudyPlan,
  Quiz,
  QuizQuestion,
  Assignment,
  AssignmentTask,
} from '../../../shared/types';
import { STUDY_CONFIG, LLM_CONFIG } from '../../../shared/utils/constants';
import axios from 'axios';

// Import environment variables (from .env file)
// Note: @env only works in Expo Go dev mode, not in EAS production builds
let GEMINI_API_KEY = '';
let GROQ_API_KEY = '';
let HUGGINGFACE_API_KEY = '';

try {
  // Try to import from @env (works in Expo Go development)
  const env = require('@env');
  GEMINI_API_KEY = env.GEMINI_API_KEY || '';
  GROQ_API_KEY = env.GROQ_API_KEY || '';
  HUGGINGFACE_API_KEY = env.HUGGINGFACE_API_KEY || '';
} catch (e) {
  // @env not available in production builds - use hardcoded fallback
  console.log('Environment variables not available, using fallback');
}

// Hardcoded fallback API key for EAS production builds
// This ensures the app works even when @env fails
const FALLBACK_GEMINI_KEY = 'AIzaSyAS-tvBo-dyVIax-zdOZLghymhUaeelYKg';

const STORAGE_KEYS = {
  DOCUMENTS: '@naved_study_documents',
  CHAT_HISTORY: '@naved_chat_history',
  STUDY_PLANS: '@naved_study_plans',
  QUIZZES: '@naved_quizzes',
  ASSIGNMENTS: '@naved_assignments',
};

// ==========================================
// API KEY CONFIGURATION
// Keys loaded from .env file (secure) or can be overridden by user in Settings
// Falls back to hardcoded key for EAS production builds
// ==========================================
let API_KEYS = {
  gemini: GEMINI_API_KEY || FALLBACK_GEMINI_KEY, // Use fallback if env not available
  groq: GROQ_API_KEY || '',
  huggingface: HUGGINGFACE_API_KEY || '',
};

export async function setApiKey(provider: 'gemini' | 'groq' | 'huggingface', key: string) {
  API_KEYS[provider] = key;
  await AsyncStorage.setItem(`@naved_api_key_${provider}`, key);
}

export async function loadApiKeys() {
  const [gemini, groq, huggingface] = await Promise.all([
    AsyncStorage.getItem('@naved_api_key_gemini'),
    AsyncStorage.getItem('@naved_api_key_groq'),
    AsyncStorage.getItem('@naved_api_key_huggingface'),
  ]);
  // Use saved keys if they exist, otherwise fall back to .env values or hardcoded fallback
  if (gemini && gemini.length > 0) {
    API_KEYS.gemini = gemini;
  } else if (GEMINI_API_KEY && GEMINI_API_KEY.length > 0) {
    API_KEYS.gemini = GEMINI_API_KEY;
  } else {
    // Use hardcoded fallback for production builds
    API_KEYS.gemini = FALLBACK_GEMINI_KEY;
  }
  if (groq && groq.length > 0) {
    API_KEYS.groq = groq;
  } else if (GROQ_API_KEY) {
    API_KEYS.groq = GROQ_API_KEY;
  }
  if (huggingface && huggingface.length > 0) {
    API_KEYS.huggingface = huggingface;
  } else if (HUGGINGFACE_API_KEY) {
    API_KEYS.huggingface = HUGGINGFACE_API_KEY;
  }
}

// Get current API key status (for settings screen)
export function getApiKeyStatus(): { gemini: boolean; groq: boolean; huggingface: boolean } {
  return {
    gemini: API_KEYS.gemini.length > 0,
    groq: API_KEYS.groq.length > 0,
    huggingface: API_KEYS.huggingface.length > 0,
  };
}

// ==========================================
// Document Processing
// ==========================================
export async function pickDocument(): Promise<Document | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    const file = result.assets[0];

    // Check file size
    if (file.size && file.size > STUDY_CONFIG.maxDocumentSize) {
      throw new Error('File too large. Maximum size is 10MB.');
    }

    const document: Document = {
      id: `doc-${Date.now()}`,
      name: file.name,
      uri: file.uri,
      type: getDocumentType(file.name),
      size: file.size || 0,
      uploadedAt: new Date(),
    };

    return document;
  } catch (error) {
    console.error('Error picking document:', error);
    throw error;
  }
}

function getDocumentType(filename: string): Document['type'] {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'pdf';
    case 'doc':
      return 'doc';
    case 'docx':
      return 'docx';
    case 'txt':
      return 'txt';
    case 'ppt':
      return 'ppt';
    case 'pptx':
      return 'pptx';
    default:
      return 'txt';
  }
}

// ==========================================
// Text Extraction - Supports DOCX, PPTX, PDF, TXT
// ==========================================
export async function extractTextFromDocument(doc: Document): Promise<string> {
  try {
    console.log(`Extracting text from ${doc.name} (type: ${doc.type})`);

    switch (doc.type) {
      case 'txt':
        return await extractTextFromTxt(doc);
      case 'docx':
      case 'doc':
        return await extractTextFromDocx(doc);
      case 'pptx':
      case 'ppt':
        return await extractTextFromPptx(doc);
      case 'pdf':
        return await extractTextFromPDF(doc);
      default:
        // Try reading as text for unknown formats
        try {
          const content = await FileSystem.readAsStringAsync(doc.uri);
          if (content && content.length > 50) {
            return content;
          }
        } catch {
          // Binary file, cannot read as text
        }
        return `Document loaded: ${doc.name}. This format is not fully supported for text extraction.`;
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    return `Error extracting text from ${doc.name}. Please try a different file format (.txt, .docx, .pptx, or .pdf).`;
  }
}

// ==========================================
// Extract Text from TXT files
// ==========================================
async function extractTextFromTxt(doc: Document): Promise<string> {
  const content = await FileSystem.readAsStringAsync(doc.uri);
  console.log(`TXT extracted: ${content.length} characters`);
  return content;
}

// ==========================================
// Extract Text from DOCX files using JSZip
// DOCX is a ZIP archive with XML content
// ==========================================
async function extractTextFromDocx(doc: Document): Promise<string> {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(doc.uri, {
      encoding: 'base64' as any,
    });

    // Convert base64 to array buffer
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Load the ZIP file
    const zip = await JSZip.loadAsync(bytes);

    // Get the main document XML
    const documentXml = await zip.file('word/document.xml')?.async('string');

    if (!documentXml) {
      throw new Error('Could not find document.xml in DOCX file');
    }

    // Parse XML and extract text
    const text = parseDocxXml(documentXml);

    console.log(`DOCX extracted: ${text.length} characters`);
    return text;
  } catch (error: any) {
    console.error('DOCX extraction error:', error);

    // Fallback: Try using Gemini to extract text
    return await extractTextWithGemini(doc, 'Word document');
  }
}

// Parse DOCX XML to extract text content
function parseDocxXml(xml: string): string {
  const textContent: string[] = [];

  // Extract text from <w:t> tags (Word text elements)
  const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let match;

  while ((match = textRegex.exec(xml)) !== null) {
    if (match[1]) {
      textContent.push(match[1]);
    }
  }

  // Join with spaces and clean up
  let text = textContent.join(' ');

  // Handle paragraph breaks - look for </w:p> tags
  text = xml.replace(/<\/w:p>/g, '\n\n')
    .replace(/<w:t[^>]*>([^<]*)<\/w:t>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();

  // If regex approach didn't work well, use simple approach
  if (text.length < 50 && textContent.length > 0) {
    text = textContent.join(' ');
  }

  return text || textContent.join(' ');
}

// ==========================================
// Extract Text from PPTX files using JSZip
// PPTX is a ZIP archive with slide XML files
// ==========================================
async function extractTextFromPptx(doc: Document): Promise<string> {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(doc.uri, {
      encoding: 'base64' as any,
    });

    // Convert base64 to array buffer
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Load the ZIP file
    const zip = await JSZip.loadAsync(bytes);

    // Get all slide files
    const slideFiles: string[] = [];
    zip.forEach((relativePath, file) => {
      if (relativePath.match(/ppt\/slides\/slide\d+\.xml$/)) {
        slideFiles.push(relativePath);
      }
    });

    // Sort slides by number
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0');
      return numA - numB;
    });

    // Extract text from each slide
    const allText: string[] = [];

    for (let i = 0; i < slideFiles.length; i++) {
      const slideXml = await zip.file(slideFiles[i])?.async('string');
      if (slideXml) {
        const slideText = parsePptxSlideXml(slideXml);
        if (slideText.trim()) {
          allText.push(`--- Slide ${i + 1} ---\n${slideText}`);
        }
      }
    }

    const text = allText.join('\n\n');
    console.log(`PPTX extracted: ${text.length} characters from ${slideFiles.length} slides`);

    return text || 'No text content found in presentation.';
  } catch (error: any) {
    console.error('PPTX extraction error:', error);

    // Fallback: Return error message instead of calling API
    return `Document loaded: ${doc.name}. This format is not fully supported for text extraction.`;
  }
}

// Parse PPTX slide XML to extract text content
function parsePptxSlideXml(xml: string): string {
  const textContent: string[] = [];

  // Extract text from <a:t> tags (PowerPoint text elements)
  const textRegex = /<a:t>([^<]*)<\/a:t>/g;
  let match;

  while ((match = textRegex.exec(xml)) !== null) {
    if (match[1] && match[1].trim()) {
      textContent.push(match[1]);
    }
  }

  // Join text elements, grouping by paragraphs
  return textContent.join(' ').replace(/\s+/g, ' ').trim();
}

// ==========================================
// Extract Text from PDF using Gemini AI
// Uses Gemini's multimodal capability
// ==========================================
async function extractTextFromPDF(doc: Document): Promise<string> {
  try {
    // Read PDF as base64
    const base64 = await FileSystem.readAsStringAsync(doc.uri, {
      encoding: 'base64' as any,
    });

    // Use Gemini to extract text from PDF
    if (!API_KEYS.gemini) {
      return 'PDF extraction requires a Gemini API key. Please configure one in Settings.';
    }

    console.log('Extracting PDF text using Gemini AI...');

    // Call Gemini with the PDF as inline data
    const response = await fetch(
      `${LLM_CONFIG.gemini.baseUrl}/models/${LLM_CONFIG.gemini.model}:generateContent?key=${API_KEYS.gemini}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: 'application/pdf',
                    data: base64,
                  },
                },
                {
                  text: 'Extract and return ALL the text content from this PDF document. Return only the extracted text, preserving the structure and formatting as much as possible. Do not summarize or modify the content.',
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('Gemini PDF extraction error:', data.error);
      throw new Error(data.error.message || 'PDF extraction failed');
    }

    const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (extractedText) {
      console.log(`PDF extracted: ${extractedText.length} characters`);
      return extractedText;
    }

    throw new Error('No text extracted from PDF');
  } catch (error: any) {
    console.error('PDF extraction error:', error);
    return `Could not extract text from PDF: ${error.message}. The PDF might be image-based or protected.`;
  }
}

// ==========================================
// Fallback: Extract text using Gemini AI
// For documents that can't be parsed locally
// ==========================================
async function extractTextWithGemini(doc: Document, docType: string): Promise<string> {
  try {
    if (!API_KEYS.gemini) {
      return `${docType} extraction requires a Gemini API key. Please configure one in Settings.`;
    }

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(doc.uri, {
      encoding: 'base64' as any,
    });

    // Determine MIME type
    let mimeType = 'application/octet-stream';
    if (doc.type === 'docx') {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (doc.type === 'pptx') {
      mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (doc.type === 'doc') {
      mimeType = 'application/msword';
    } else if (doc.type === 'ppt') {
      mimeType = 'application/vnd.ms-powerpoint';
    }

    console.log(`Extracting ${docType} text using Gemini AI...`);

    const response = await fetch(
      `${LLM_CONFIG.gemini.baseUrl}/models/${LLM_CONFIG.gemini.model}:generateContent?key=${API_KEYS.gemini}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64,
                  },
                },
                {
                  text: `Extract and return ALL the text content from this ${docType}. Return only the extracted text, preserving the structure. Do not summarize.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Extraction failed');
    }

    const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (extractedText) {
      console.log(`${docType} extracted via Gemini: ${extractedText.length} characters`);
      return extractedText;
    }

    return `Could not extract text from ${docType}. Please try a different file.`;
  } catch (error: any) {
    console.error(`${docType} Gemini extraction error:`, error);
    return `Could not extract text from ${docType}: ${error.message}`;
  }
}

// ==========================================
// RAG: Chunking for Context Retrieval
// ==========================================
export function chunkText(text: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const { chunkSize, chunkOverlap } = STUDY_CONFIG;

  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  let chunkId = 0;

  for (const para of paragraphs) {
    // If paragraph itself exceeds chunk size, split it
    if (para.length > chunkSize) {
      // Save current chunk if it exists
      if (currentChunk) {
        chunks.push({
          id: `chunk-${chunkId++}`,
          documentId: '',
          content: currentChunk.trim(),
        });
        currentChunk = '';
      }
      
      // Split the long paragraph into smaller chunks
      let remainingPara = para;
      while (remainingPara.length > 0) {
        const chunk = remainingPara.substring(0, chunkSize);
        chunks.push({
          id: `chunk-${chunkId++}`,
          documentId: '',
          content: chunk.trim(),
        });
        remainingPara = remainingPara.substring(chunkSize - chunkOverlap);
      }
    } else if (currentChunk.length + para.length > chunkSize) {
      // Current chunk + paragraph would exceed size, save current chunk
      if (currentChunk) {
        chunks.push({
          id: `chunk-${chunkId++}`,
          documentId: '',
          content: currentChunk.trim(),
        });
      }
      currentChunk = para;
    } else {
      // Add paragraph to current chunk
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }

  // Save remaining chunk
  if (currentChunk) {
    chunks.push({
      id: `chunk-${chunkId}`,
      documentId: '',
      content: currentChunk.trim(),
    });
  }

  return chunks;
}

// Simple keyword-based retrieval (no embeddings API needed)
export function retrieveRelevantChunks(
  query: string,
  chunks: DocumentChunk[],
  topK: number = 3
): DocumentChunk[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  const scored = chunks.map(chunk => {
    const chunkLower = chunk.content.toLowerCase();
    let score = 0;

    for (const word of queryWords) {
      const matches = (chunkLower.match(new RegExp(word, 'g')) || []).length;
      score += matches;
    }

    // Boost for exact phrase matches
    if (chunkLower.includes(query.toLowerCase())) {
      score += 10;
    }

    return { chunk, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.chunk);
}

// ==========================================
// LLM Integration (FREE Tiers)
// ==========================================
type LLMProvider = 'gemini' | 'groq' | 'huggingface' | 'offline';

async function callLLM(
  prompt: string,
  systemPrompt: string = '',
  provider: LLMProvider = 'gemini'
): Promise<string> {
  // Try providers in order of preference
  const providers: LLMProvider[] = ['gemini', 'groq', 'huggingface', 'offline'];

  for (const p of providers) {
    if (p === 'offline') {
      return generateOfflineResponse(prompt);
    }

    try {
      const response = await callProvider(p, prompt, systemPrompt);
      if (response) return response;
    } catch (error) {
      console.log(`Provider ${p} failed, trying next...`);
    }
  }

  return generateOfflineResponse(prompt);
}

async function callProvider(
  provider: LLMProvider,
  prompt: string,
  systemPrompt: string
): Promise<string | null> {
  switch (provider) {
    case 'gemini':
      return callGemini(prompt, systemPrompt);
    case 'groq':
      return callGroq(prompt, systemPrompt);
    case 'huggingface':
      return callHuggingFace(prompt);
    default:
      return null;
  }
}

// Google Gemini (FREE tier: 60 RPM)
async function callGemini(prompt: string, systemPrompt: string): Promise<string | null> {
  if (!API_KEYS.gemini) return null;

  try {
    const response = await fetch(
      `${LLM_CONFIG.gemini.baseUrl}/models/${LLM_CONFIG.gemini.model}:generateContent?key=${API_KEYS.gemini}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();

    // Check for API errors
    if (data.error) {
      console.error('Gemini API error:', data.error);
      throw new Error(`API Error: ${data.error.message || 'Invalid API key or quota exceeded'}`);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error: any) {
    console.error('Gemini call failed:', error);
    throw error;
  }
}

// Groq (FREE tier: Very generous limits)
async function callGroq(prompt: string, systemPrompt: string): Promise<string | null> {
  if (!API_KEYS.groq) return null;

  const response = await fetch(`${LLM_CONFIG.groq.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEYS.groq}`,
    },
    body: JSON.stringify({
      model: LLM_CONFIG.groq.model,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

// HuggingFace Inference (FREE)
async function callHuggingFace(prompt: string): Promise<string | null> {
  if (!API_KEYS.huggingface) return null;

  const response = await fetch(`${LLM_CONFIG.huggingface.baseUrl}/${LLM_CONFIG.huggingface.model}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEYS.huggingface}`,
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.7,
      },
    }),
  });

  const data = await response.json();
  return data[0]?.generated_text?.replace(prompt, '').trim() || null;
}

// Offline fallback (template-based responses)
function generateOfflineResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('quiz') || lowerPrompt.includes('question')) {
    return 'To generate a quiz, please ensure you have a valid API key configured. Go to Settings > API Keys to add your free Gemini or Groq API key.';
  }

  if (lowerPrompt.includes('study plan') || lowerPrompt.includes('schedule')) {
    return 'To generate a personalized study plan, please configure a valid API key in Settings. You can get a free API key from Google AI Studio or Groq.';
  }

  if (lowerPrompt.includes('summarize') || lowerPrompt.includes('summary')) {
    return 'I can help you understand this document! Here are some tips:\n\n• Look for headings and subheadings to understand the structure\n• Identify key terms that are repeated or emphasized\n• Pay attention to the introduction and conclusion for main ideas\n\nFor AI-powered summarization, please configure a valid API key in Settings (free keys available from Google AI Studio).';
  }

  // For general questions about the document
  if (lowerPrompt.includes('what') || lowerPrompt.includes('how') || lowerPrompt.includes('why') || lowerPrompt.includes('explain')) {
    return 'I\'d love to help answer your question! Unfortunately, the AI service is currently unavailable.\n\nTo enable AI-powered document Q&A:\n1. Go to Settings\n2. Tap "Configure API Key"\n3. Get a free key from Google AI Studio (aistudio.google.com)\n4. Paste your key and save\n\nOnce configured, I can answer questions about your documents!';
  }

  return 'I am your study assistant! To unlock AI-powered features like quiz generation, study plans, and document Q&A, please configure a valid API key in Settings.\n\nGet free keys from:\n• Google AI Studio (aistudio.google.com)\n• Groq Console (console.groq.com)\n• HuggingFace (huggingface.co)';
}

// ==========================================
// Chat with Document (RAG)
// ==========================================
export async function chatWithDocument(
  message: string,
  documentText: string,
  chatHistory: ChatMessage[]
): Promise<string> {
  // Chunk the document
  const chunks = chunkText(documentText);

  // Retrieve relevant chunks
  const relevantChunks = retrieveRelevantChunks(message, chunks);
  const context = relevantChunks.map(c => c.content).join('\n\n---\n\n');

  // Build prompt with RAG context
  const systemPrompt = `You are a helpful study assistant. Answer questions based on the following document excerpts. If the answer isn't in the provided context, say so.

DOCUMENT CONTEXT:
${context}`;

  const conversationContext = chatHistory
    .slice(-4)
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  const prompt = conversationContext
    ? `Previous conversation:\n${conversationContext}\n\nUser: ${message}`
    : message;

  return callLLM(prompt, systemPrompt);
}

// ==========================================
// Study Plan Generation
// ==========================================
export async function generateStudyPlan(
  documentText: string,
  daysAvailable: number = 7,
  hoursPerDay: number = 2
): Promise<StudyPlan> {
  // Extract key topics from the document
  const docPreview = documentText.slice(0, 2500);
  
  const prompt = `Analyze this document and create a personalized study plan.

DOCUMENT CONTENT:
${docPreview}

Create a study plan with:
- 3-4 specific learning objectives based on the document
- 4-6 study sessions of 25 minutes each
- Topics should be specific to the document content

IMPORTANT: Respond with ONLY valid JSON, no explanations:
{"title":"[Document Topic] Study Plan","objectives":["Learn X","Understand Y","Practice Z"],"sessions":[{"topic":"Introduction & Overview","duration":25},{"topic":"Key Concepts","duration":25},{"topic":"Practice & Examples","duration":25},{"topic":"Review & Summary","duration":25}]}`;

  const response = await callLLM(prompt, 'You are a study planning expert. Return ONLY valid JSON, no markdown, no explanations.');

  try {
    // Try to parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        id: `plan-${Date.now()}`,
        documentId: '',
        title: parsed.title || 'Study Plan',
        objectives: parsed.objectives || [],
        schedule: (parsed.sessions || []).map((s: any, i: number) => ({
          id: `session-${i}`,
          topic: s.topic,
          duration: s.duration || 25,
          completed: false,
        })),
        createdAt: new Date(),
      };
    }
  } catch (e) {
    console.error('Error parsing study plan:', e);
  }

  // Always return a fallback plan when parsing fails
  // This provides better UX than showing an error
  console.log('Using fallback study plan - API response was not valid JSON');
  return {
    id: `plan-${Date.now()}`,
    documentId: '',
    title: 'Study Plan',
    objectives: ['Review document content thoroughly', 'Identify and understand key concepts', 'Practice with exercises'],
    schedule: [
      { id: 's1', topic: 'Initial Reading & Overview', duration: 25, completed: false },
      { id: 's2', topic: 'Deep Dive into Key Concepts', duration: 25, completed: false },
      { id: 's3', topic: 'Note Taking & Summarization', duration: 25, completed: false },
      { id: 's4', topic: 'Review & Self-Assessment', duration: 25, completed: false },
    ],
    createdAt: new Date(),
  };
}

// ==========================================
// Quiz Generation
// ==========================================
export async function generateQuiz(
  documentText: string,
  numQuestions: number = 5
): Promise<Quiz> {
  const docPreview = documentText.slice(0, 3000);
  
  const prompt = `Create a ${numQuestions}-question quiz based on this document content:

DOCUMENT:
${docPreview}

Create multiple-choice questions testing understanding of the key concepts.

IMPORTANT: Respond with ONLY valid JSON, no markdown:
{"title":"[Topic] Quiz","questions":[{"question":"What is X?","options":["A) Option 1","B) Option 2","C) Option 3","D) Option 4"],"correctAnswer":0,"explanation":"Explanation here"}]}`;

  const response = await callLLM(prompt, 'You are a quiz creator. Return ONLY valid JSON with real questions based on the document.');

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        id: `quiz-${Date.now()}`,
        documentId: '',
        title: parsed.title || 'Document Quiz',
        questions: (parsed.questions || []).map((q: any, i: number) => ({
          id: `q-${i}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
        })),
        createdAt: new Date(),
      };
    }
  } catch (e) {
    console.error('Error parsing quiz:', e);
  }

  // Always return a fallback quiz when parsing fails
  // This provides better UX than showing an error
  console.log('Using fallback quiz - API response was not valid JSON');
  return {
    id: `quiz-${Date.now()}`,
    documentId: '',
    title: 'Document Review Quiz',
    questions: [
      {
        id: 'q1',
        question: 'What is the main topic discussed in this document?',
        options: ['A) Review the document to identify the main topic', 'B) Not applicable', 'C) Not applicable', 'D) Not applicable'],
        correctAnswer: 0,
        explanation: 'Review the document to identify the main theme and subject matter.',
      },
      {
        id: 'q2',
        question: 'What are the key concepts or terms used in this document?',
        options: ['A) Identify important terms while reading', 'B) Not applicable', 'C) Not applicable', 'D) Not applicable'],
        correctAnswer: 0,
        explanation: 'Look for recurring terms, definitions, or emphasized concepts.',
      },
      {
        id: 'q3',
        question: 'How does the document structure its information?',
        options: ['A) Analyze the document organization', 'B) Not applicable', 'C) Not applicable', 'D) Not applicable'],
        correctAnswer: 0,
        explanation: 'Understanding structure helps with comprehension and retention.',
      },
    ],
    createdAt: new Date(),
  };
}

// ==========================================
// Assignment Generation
// ==========================================
export async function generateAssignment(
  documentText: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<Assignment> {
  const prompt = `Create a practical assignment based on this document:

${documentText.slice(0, 2000)}

Difficulty: ${difficulty}

Generate an assignment in JSON format:
{
  "title": "Assignment Title",
  "description": "Brief description",
  "tasks": [
    {"task": "Task description", "completed": false}
  ]
}`;

  const response = await callLLM(prompt, 'You are an educational content creator. Respond only with valid JSON.');

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        id: `assign-${Date.now()}`,
        documentId: '',
        title: parsed.title || 'Document Assignment',
        description: parsed.description || '',
        tasks: (parsed.tasks || []).map((t: any, i: number) => ({
          id: `task-${i}`,
          task: t.task,
          completed: false,
        })),
        createdAt: new Date(),
      };
    }
  } catch (e) {
    console.error('Error parsing assignment:', e);
  }

  return {
    id: `assign-${Date.now()}`,
    documentId: '',
    title: 'Document Assignment',
    description: 'Complete the following tasks based on the document.',
    tasks: [
      { id: 't1', task: 'Read and summarize the document', completed: false },
      { id: 't2', task: 'Identify key concepts', completed: false },
      { id: 't3', task: 'Create your own examples', completed: false },
    ],
    createdAt: new Date(),
  };
}

// ==========================================
// Storage Functions
// ==========================================
export async function saveDocument(doc: Document): Promise<void> {
  const docs = await getDocuments();
  docs.push(doc);
  await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
}

export async function getDocuments(): Promise<Document[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS);
  return json ? JSON.parse(json) : [];
}

export async function deleteDocument(docId: string): Promise<void> {
  const docs = await getDocuments();
  const filtered = docs.filter(d => d.id !== docId);
  await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filtered));
}

export async function saveChatHistory(docId: string, messages: ChatMessage[]): Promise<void> {
  const key = `${STORAGE_KEYS.CHAT_HISTORY}_${docId}`;
  await AsyncStorage.setItem(key, JSON.stringify(messages));
}

export async function getChatHistory(docId: string): Promise<ChatMessage[]> {
  const key = `${STORAGE_KEYS.CHAT_HISTORY}_${docId}`;
  const json = await AsyncStorage.getItem(key);
  return json ? JSON.parse(json) : [];
}

export async function saveStudyPlan(plan: StudyPlan): Promise<void> {
  const plans = await getStudyPlans();
  plans.push(plan);
  await AsyncStorage.setItem(STORAGE_KEYS.STUDY_PLANS, JSON.stringify(plans));
}

export async function getStudyPlans(): Promise<StudyPlan[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEYS.STUDY_PLANS);
  return json ? JSON.parse(json) : [];
}

export async function saveQuiz(quiz: Quiz): Promise<void> {
  const quizzes = await getQuizzes();
  quizzes.push(quiz);
  await AsyncStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
}

export async function getQuizzes(): Promise<Quiz[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEYS.QUIZZES);
  return json ? JSON.parse(json) : [];
}

export async function saveAssignment(assignment: Assignment): Promise<void> {
  const assignments = await getAssignments();
  assignments.push(assignment);
  await AsyncStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
}

export async function getAssignments(): Promise<Assignment[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
  return json ? JSON.parse(json) : [];
}

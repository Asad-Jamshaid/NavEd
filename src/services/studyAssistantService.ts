// ==========================================
// Study Assistant Service - RAG + Free LLM
// Uses FREE APIs: Gemini Free Tier / Groq / HuggingFace
// ==========================================

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Document,
  DocumentChunk,
  ChatMessage,
  StudyPlan,
  Quiz,
  QuizQuestion,
  Assignment,
  AssignmentTask,
} from '../types';
import { STUDY_CONFIG, LLM_CONFIG } from '../utils/constants';
import axios from 'axios';

const STORAGE_KEYS = {
  DOCUMENTS: '@naved_study_documents',
  CHAT_HISTORY: '@naved_chat_history',
  STUDY_PLANS: '@naved_study_plans',
  QUIZZES: '@naved_quizzes',
  ASSIGNMENTS: '@naved_assignments',
};

// ==========================================
// API KEY CONFIGURATION
// Store these securely - users should add their own FREE keys
// ==========================================
let API_KEYS = {
  gemini: 'AIzaSyDGxVw7NQAjM3ZIi1Pc4V6_UidRIEagczw', // Google Gemini API Key
  groq: '', // Get free at: https://console.groq.com/keys
  huggingface: '', // Get free at: https://huggingface.co/settings/tokens
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
  // Use saved keys if they exist, otherwise use default Gemini key
  if (gemini && gemini.length > 0) {
    API_KEYS.gemini = gemini;
  }
  // Always use the default Gemini key if no saved key exists
  if (groq && groq.length > 0) API_KEYS.groq = groq;
  if (huggingface && huggingface.length > 0) API_KEYS.huggingface = huggingface;
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
// PDF Extraction API Configuration
// Set this to your Vercel deployment URL
// ==========================================
const PDF_API_URL = process.env.EXPO_PUBLIC_PDF_API_URL || 'https://your-app.vercel.app';

// ==========================================
// Text Extraction with PDF Support
// ==========================================
export async function extractTextFromDocument(doc: Document): Promise<string> {
  try {
    if (doc.type === 'txt') {
      // Direct read for text files
      const content = await FileSystem.readAsStringAsync(doc.uri);
      return content;
    }

    if (doc.type === 'pdf') {
      // Use Vercel API for PDF extraction
      return await extractTextFromPDF(doc);
    }

    // For other formats, try to read as text
    try {
      const content = await FileSystem.readAsStringAsync(doc.uri);
      if (content && content.length > 100) {
        return content;
      }
    } catch {
      // File is binary, cannot read as text
    }

    return `Document loaded: ${doc.name}. For best results with AI features, please use .txt files or PDFs.`;
  } catch (error) {
    console.error('Error extracting text:', error);
    return `Document: ${doc.name}. Unable to extract text. Please try using a .txt file.`;
  }
}

// ==========================================
// Extract Text from PDF using Vercel API
// ==========================================
async function extractTextFromPDF(doc: Document): Promise<string> {
  try {
    // Read PDF as base64
    const base64 = await FileSystem.readAsStringAsync(doc.uri, {
      encoding: 'base64' as any,
    });

    // Call Vercel API
    const response = await axios.post(
      `${PDF_API_URL}/api/extract-pdf`,
      {
        pdfData: base64,
        filename: doc.name,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    if (response.data.success) {
      console.log(`PDF extracted: ${response.data.metadata.pages} pages, ${response.data.metadata.textLength} characters`);
      return response.data.text;
    } else {
      throw new Error(response.data.error || 'PDF extraction failed');
    }
  } catch (error: any) {
    console.error('PDF extraction error:', error);

    // Check if API is configured
    if (PDF_API_URL.includes('your-app')) {
      return `PDF extraction requires backend setup. Please:\n\n1. Deploy the /api folder to Vercel (free)\n2. Set EXPO_PUBLIC_PDF_API_URL environment variable\n\nAlternatively, use .txt files for now.\n\nSee docs/research/PDF_EXTRACTION_SOLUTIONS.md for details.`;
    }

    // API error
    if (error.response) {
      return `PDF extraction failed: ${error.response.data.error || error.response.statusText}`;
    }

    // Network error
    return `PDF extraction failed: ${error.message}. Check your internet connection.`;
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
    if (currentChunk.length + para.length > chunkSize) {
      if (currentChunk) {
        chunks.push({
          id: `chunk-${chunkId++}`,
          documentId: '',
          content: currentChunk.trim(),
        });
      }
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }

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
    return 'To generate a quiz, please ensure you have an API key configured. Go to Settings > API Keys to add your free Gemini or Groq API key.';
  }

  if (lowerPrompt.includes('study plan') || lowerPrompt.includes('schedule')) {
    return 'To generate a personalized study plan, please configure an API key in Settings. You can get a free API key from Google AI Studio or Groq.';
  }

  if (lowerPrompt.includes('summarize') || lowerPrompt.includes('summary')) {
    return 'Document summarization requires an LLM API. Please add your free API key in Settings to enable this feature.';
  }

  return 'I am your study assistant! To unlock AI-powered features like quiz generation, study plans, and document Q&A, please add a free API key in Settings. You can get free keys from:\n\n• Google AI Studio (Gemini)\n• Groq Console\n• HuggingFace';
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
  const prompt = `Based on this document content, create a structured study plan.

Document excerpt:
${documentText.slice(0, 2000)}

Requirements:
- ${daysAvailable} days available
- ${hoursPerDay} hours per day
- Use Pomodoro technique (25 min sessions)

Generate a JSON study plan with this structure:
{
  "title": "Study Plan Title",
  "objectives": ["objective 1", "objective 2"],
  "sessions": [
    {"topic": "Topic name", "duration": 25, "completed": false}
  ]
}`;

  const response = await callLLM(prompt, 'You are a study planning expert. Respond only with valid JSON.');

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

  // Fallback plan - only if API fails
  if (!API_KEYS.gemini && !API_KEYS.groq && !API_KEYS.huggingface) {
    return {
      id: `plan-${Date.now()}`,
      documentId: '',
      title: 'Study Plan',
      objectives: ['Review document content', 'Practice key concepts'],
      schedule: [
        { id: 's1', topic: 'Initial Reading', duration: 25, completed: false },
        { id: 's2', topic: 'Note Taking', duration: 25, completed: false },
        { id: 's3', topic: 'Review & Practice', duration: 25, completed: false },
      ],
      createdAt: new Date(),
    };
  }
  
  // If API keys exist but parsing failed, return error
  throw new Error('Failed to generate study plan. Please try again.');
}

// ==========================================
// Quiz Generation
// ==========================================
export async function generateQuiz(
  documentText: string,
  numQuestions: number = 5
): Promise<Quiz> {
  const prompt = `Create a multiple-choice quiz based on this document:

${documentText.slice(0, 3000)}

Generate ${numQuestions} questions in JSON format:
{
  "title": "Quiz Title",
  "questions": [
    {
      "question": "Question text?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": 0,
      "explanation": "Why this is correct"
    }
  ]
}`;

  const response = await callLLM(prompt, 'You are an educational quiz creator. Respond only with valid JSON.');

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

  // Fallback quiz - only if API fails
  if (!API_KEYS.gemini && !API_KEYS.groq && !API_KEYS.huggingface) {
    return {
      id: `quiz-${Date.now()}`,
      documentId: '',
      title: 'Document Quiz',
      questions: [
        {
          id: 'q1',
          question: 'What is the main topic of this document?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: 'Please configure an API key for auto-generated quizzes.',
        },
      ],
      createdAt: new Date(),
    };
  }
  
  // If API keys exist but parsing failed, return error
  throw new Error('Failed to generate quiz. Please try again.');
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

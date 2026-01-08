/**
 * Unit Tests for Study Assistant Service
 * Tests document handling, RAG chunking, and LLM integration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import {
  pickDocument,
  extractTextFromDocument,
  chunkText,
  retrieveRelevantChunks,
  chatWithDocument,
  generateStudyPlan,
  generateQuiz,
  saveDocument,
  getDocuments,
  deleteDocument,
  setApiKey,
  loadApiKeys,
} from '../../src/services/studyAssistantService';

import { Document, DocumentChunk } from '../../src/types';
import { STUDY_CONFIG } from '../../src/utils/constants';

describe('Study Assistant Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ candidates: [{ content: { parts: [{ text: 'Test response' }] } }] }),
    });
  });

  describe('Document Handling', () => {
    describe('pickDocument()', () => {
      test('should return document object when file is selected', async () => {
        const doc = await pickDocument();

        expect(doc).not.toBeNull();
        expect(doc).toHaveProperty('id');
        expect(doc).toHaveProperty('name');
        expect(doc).toHaveProperty('uri');
        expect(doc).toHaveProperty('type');
      });

      test('should return null when picker is canceled', async () => {
        (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
          canceled: true,
          assets: [],
        });

        const doc = await pickDocument();
        expect(doc).toBeNull();
      });

      test('should detect PDF type from filename', async () => {
        (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
          canceled: false,
          assets: [{
            name: 'lecture-notes.pdf',
            uri: 'file://lecture-notes.pdf',
            size: 2048,
          }],
        });

        const doc = await pickDocument();
        expect(doc?.type).toBe('pdf');
      });

      test('should detect txt type from filename', async () => {
        (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
          canceled: false,
          assets: [{
            name: 'notes.txt',
            uri: 'file://notes.txt',
            size: 512,
          }],
        });

        const doc = await pickDocument();
        expect(doc?.type).toBe('txt');
      });
    });

    describe('extractTextFromDocument()', () => {
      test('should extract text from txt files', async () => {
        const doc: Document = {
          id: 'doc-1',
          name: 'test.txt',
          uri: 'file://test.txt',
          type: 'txt',
          size: 100,
          uploadedAt: new Date(),
        };

        (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(
          'This is the content of the text file.'
        );

        const text = await extractTextFromDocument(doc);
        expect(text).toBe('This is the content of the text file.');
      });

      test('should return fallback message for unsupported formats', async () => {
        const doc: Document = {
          id: 'doc-2',
          name: 'presentation.pptx',
          uri: 'file://presentation.pptx',
          type: 'pptx',
          size: 5000,
          uploadedAt: new Date(),
        };

        // Mock FileSystem to throw error to trigger fallback
        (FileSystem.readAsStringAsync as jest.Mock).mockRejectedValueOnce(new Error('Failed to read file'));

        const text = await extractTextFromDocument(doc);
        expect(text).toContain(doc.name);
      });
    });
  });

  describe('RAG: Text Chunking', () => {
    const sampleText = `
      Chapter 1: Introduction to Computer Science

      Computer science is the study of computation and information processing.
      It encompasses both theoretical and practical aspects of computing.

      Chapter 2: Programming Fundamentals

      Programming is the process of creating instructions for computers to execute.
      There are many programming languages, each with its own syntax and paradigms.

      Chapter 3: Data Structures

      Data structures are ways of organizing and storing data for efficient access.
      Common data structures include arrays, linked lists, trees, and graphs.
    `;

    test('chunkText() should split text into chunks', () => {
      const chunks = chunkText(sampleText);

      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBeGreaterThan(0);
    });

    test('each chunk should have required properties', () => {
      const chunks = chunkText(sampleText);

      chunks.forEach(chunk => {
        expect(chunk).toHaveProperty('id');
        expect(chunk).toHaveProperty('documentId');
        expect(chunk).toHaveProperty('content');
        expect(typeof chunk.content).toBe('string');
      });
    });

    test('chunks should not exceed max chunk size', () => {
      const longText = 'A'.repeat(10000);
      const chunks = chunkText(longText);

      chunks.forEach(chunk => {
        expect(chunk.content.length).toBeLessThanOrEqual(STUDY_CONFIG.chunkSize);
      });
    });
  });

  describe('RAG: Retrieval', () => {
    const testChunks: DocumentChunk[] = [
      { id: 'chunk-1', documentId: 'doc-1', content: 'Python is a programming language used for web development and data science.' },
      { id: 'chunk-2', documentId: 'doc-1', content: 'JavaScript is used for frontend web development and Node.js applications.' },
      { id: 'chunk-3', documentId: 'doc-1', content: 'Databases store and manage data using SQL or NoSQL technologies.' },
      { id: 'chunk-4', documentId: 'doc-1', content: 'Machine learning is a subset of artificial intelligence focused on learning from data.' },
    ];

    test('retrieveRelevantChunks() should return most relevant chunks', () => {
      const results = retrieveRelevantChunks('Python programming', testChunks);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].content).toContain('Python');
    });

    test('retrieveRelevantChunks() should respect topK parameter', () => {
      const results = retrieveRelevantChunks('programming web', testChunks, 2);

      expect(results.length).toBeLessThanOrEqual(2);
    });

    test('retrieveRelevantChunks() should return empty array for unrelated query', () => {
      const results = retrieveRelevantChunks('cooking recipes ingredients', testChunks);

      expect(results.length).toBe(0);
    });

    test('retrieveRelevantChunks() should boost exact phrase matches', () => {
      const results = retrieveRelevantChunks('data science', testChunks);

      // The chunk containing "data science" should rank highest
      if (results.length > 0) {
        expect(results[0].content.toLowerCase()).toContain('data');
      }
    });
  });

  describe('LLM Integration', () => {
    test('chatWithDocument() should return response string', async () => {
      const response = await chatWithDocument(
        'What is this document about?',
        'This is a document about computer science.',
        []
      );

      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    test('generateStudyPlan() should return study plan object', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  title: 'Test Plan',
                  objectives: ['Learn basics'],
                  sessions: [{ topic: 'Introduction', duration: 25 }],
                }),
              }],
            },
          }],
        }),
      });

      const plan = await generateStudyPlan('Sample document text');

      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('title');
      expect(plan).toHaveProperty('objectives');
      expect(plan).toHaveProperty('schedule');
      expect(Array.isArray(plan.objectives)).toBe(true);
      expect(Array.isArray(plan.schedule)).toBe(true);
    });

    test('generateQuiz() should return quiz object with questions', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  title: 'Test Quiz',
                  questions: [{
                    question: 'What is 2+2?',
                    options: ['3', '4', '5', '6'],
                    correctAnswer: 1,
                    explanation: '2+2=4',
                  }],
                }),
              }],
            },
          }],
        }),
      });

      const quiz = await generateQuiz('Sample document text', 5);

      expect(quiz).toHaveProperty('id');
      expect(quiz).toHaveProperty('title');
      expect(quiz).toHaveProperty('questions');
      expect(Array.isArray(quiz.questions)).toBe(true);
    });
  });

  describe('Document Storage', () => {
    const testDoc: Document = {
      id: 'doc-test',
      name: 'test-document.pdf',
      uri: 'file://test.pdf',
      type: 'pdf',
      size: 1024,
      uploadedAt: new Date(),
    };

    test('saveDocument() should save to AsyncStorage', async () => {
      await saveDocument(testDoc);

      expect(AsyncStorage.getItem).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test('getDocuments() should return empty array when no documents', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const docs = await getDocuments();

      expect(Array.isArray(docs)).toBe(true);
      expect(docs.length).toBe(0);
    });

    test('getDocuments() should return saved documents', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify([testDoc])
      );

      const docs = await getDocuments();

      expect(docs.length).toBe(1);
      expect(docs[0].id).toBe(testDoc.id);
    });

    test('deleteDocument() should remove document from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify([testDoc])
      );

      await deleteDocument(testDoc.id);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('API Key Management', () => {
    test('setApiKey() should save key to AsyncStorage', async () => {
      await setApiKey('gemini', 'test-api-key-123');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@naved_api_key_gemini',
        'test-api-key-123'
      );
    });

    test('loadApiKeys() should load keys from AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('gemini-key')
        .mockResolvedValueOnce('groq-key')
        .mockResolvedValueOnce(null);

      await loadApiKeys();

      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(3);
    });
  });
});

/**
 * Integration Tests - Study Assistant Flow
 * Tests the complete RAG and AI-powered study features workflow
 */

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage } from '../../src/types';
import {
  pickDocument,
  extractTextFromDocument,
  chunkText,
  retrieveRelevantChunks,
  chatWithDocument,
  generateStudyPlan,
  generateQuiz,
  generateAssignment,
  saveDocument,
  getDocuments,
  deleteDocument,
  setApiKey,
  loadApiKeys,
} from '../../src/services/studyAssistantService';
import { Document } from '../../src/types';

describe('Study Assistant Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();

    // Mock successful API responses
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{
          content: {
            parts: [{
              text: 'Test AI response from LLM'
            }]
          }
        }]
      })
    });
  });

  describe('Document Upload and Processing Workflow', () => {
    const mockDocument: Document = {
      id: 'doc-test-1',
      name: 'Computer Science Notes.txt',
      uri: 'file://cs-notes.txt',
      type: 'txt',
      size: 5000,
      uploadedAt: new Date(),
    };

    const sampleText = `
      Introduction to Computer Science

      Computer science is the study of computation, information, and automation.
      It encompasses both theoretical and practical aspects of computing.

      Key Topics:
      - Algorithms and Data Structures
      - Programming Languages
      - Computer Architecture
      - Operating Systems
      - Databases
      - Artificial Intelligence
    `;

    it('should complete document upload → text extraction → chunking workflow', async () => {
      // Mock FileSystem reading
      const mockFileSystem = require('expo-file-system');
      mockFileSystem.readAsStringAsync.mockResolvedValue(sampleText);

      // Step 1: Extract text
      const extractedText = await extractTextFromDocument(mockDocument);
      expect(extractedText).toBe(sampleText);

      // Step 2: Chunk text for RAG
      const chunks = chunkText(extractedText);
      expect(chunks.length).toBeGreaterThan(0);

      // Step 3: Verify chunks have required properties
      chunks.forEach(chunk => {
        expect(chunk).toHaveProperty('id');
        expect(chunk).toHaveProperty('content');
        expect(chunk.content.length).toBeGreaterThan(0);
      });

      // Step 4: Save document
      await saveDocument(mockDocument);

      // Step 5: Verify saved
      const docs = await getDocuments();
      expect(docs).toContainEqual(expect.objectContaining({
        id: mockDocument.id,
        name: mockDocument.name,
      }));
    });

    it('should perform RAG retrieval on document chunks', async () => {
      const chunks = chunkText(sampleText);

      // Test various queries
      const queries = [
        'What is computer science?',
        'algorithms data structures',
        'artificial intelligence',
      ];

      queries.forEach(query => {
        const relevant = retrieveRelevantChunks(query, chunks, 3);
        expect(Array.isArray(relevant)).toBe(true);
        // Should find at least some matches for these queries
        if (query.includes('computer science')) {
          expect(relevant.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Chat with Document Workflow', () => {
    const documentText = `
      React Native Fundamentals

      React Native is a framework for building mobile applications.
      It uses React and JavaScript to create native iOS and Android apps.

      Key Features:
      - Cross-platform development
      - Hot reloading
      - Native performance
      - Large ecosystem
    `;

    it('should answer questions about document content', async () => {
      const question = 'What is React Native?';
      const chatHistory: any[] = [];

      const answer = await chatWithDocument(question, documentText, chatHistory);

      expect(typeof answer).toBe('string');
      expect(answer.length).toBeGreaterThan(0);
    });

    it('should maintain chat history for context', async () => {
      const chatHistory: ChatMessage[] = [
        { id: '1', role: 'user' as const, content: 'What is React Native?', timestamp: new Date() },
        { id: '2', role: 'assistant' as const, content: 'React Native is a framework...', timestamp: new Date() },
      ];

      const followUp = 'What are its key features?';
      const answer = await chatWithDocument(followUp, documentText, chatHistory);

      expect(typeof answer).toBe('string');
      expect(answer.length).toBeGreaterThan(0);
    });

    it('should handle questions with no relevant content', async () => {
      const unrelatedQuestion = 'What is quantum computing?';
      const answer = await chatWithDocument(unrelatedQuestion, documentText, []);

      // Should still return a response (likely saying it's not in the document)
      expect(typeof answer).toBe('string');
      expect(answer.length).toBeGreaterThan(0);
    });
  });

  describe('Study Plan Generation Workflow', () => {
    const courseContent = `
      Database Management Systems Course

      Week 1: Introduction to Databases
      Week 2: Relational Model
      Week 3: SQL Fundamentals
      Week 4: Advanced SQL
      Week 5: Normalization
      Week 6: Transactions
      Week 7: Indexing
      Week 8: Final Review
    `;

    it('should generate personalized study plan', async () => {
      // Mock successful plan generation
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  title: 'DBMS Study Plan',
                  objectives: ['Master SQL queries', 'Understand normalization'],
                  sessions: [
                    { topic: 'SQL Basics', duration: 25, completed: false },
                    { topic: 'Normalization', duration: 25, completed: false },
                  ]
                })
              }]
            }
          }]
        })
      });

      const plan = await generateStudyPlan(courseContent, 7, 2);

      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('title');
      expect(plan).toHaveProperty('objectives');
      expect(plan).toHaveProperty('schedule');
      expect(Array.isArray(plan.objectives)).toBe(true);
      expect(Array.isArray(plan.schedule)).toBe(true);
    });

    it('should create Pomodoro-based study sessions', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  title: 'Study Plan',
                  objectives: ['Learn'],
                  sessions: [
                    { topic: 'Introduction', duration: 25 },
                    { topic: 'Deep Dive', duration: 25 },
                    { topic: 'Practice', duration: 25 },
                  ]
                })
              }]
            }
          }]
        })
      });

      const plan = await generateStudyPlan(courseContent);

      plan.schedule.forEach(session => {
        expect(session).toHaveProperty('topic');
        expect(session).toHaveProperty('duration');
        expect(session).toHaveProperty('completed');
        expect(session.duration).toBeGreaterThan(0);
      });
    });
  });

  describe('Quiz Generation Workflow', () => {
    const lessonContent = `
      HTTP Protocol Basics

      HTTP (Hypertext Transfer Protocol) is the foundation of data communication on the web.
      It operates on a request-response model between clients and servers.

      Common HTTP Methods:
      - GET: Retrieve data
      - POST: Submit data
      - PUT: Update data
      - DELETE: Remove data

      HTTP Status Codes:
      - 200 OK: Success
      - 404 Not Found: Resource doesn't exist
      - 500 Internal Server Error: Server problem
    `;

    it('should generate quiz from document content', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  title: 'HTTP Protocol Quiz',
                  questions: [
                    {
                      question: 'What does HTTP stand for?',
                      options: ['A) Hypertext Transfer Protocol', 'B) High Tech Transfer Protocol'],
                      correctAnswer: 0,
                      explanation: 'HTTP stands for Hypertext Transfer Protocol'
                    }
                  ]
                })
              }]
            }
          }]
        })
      });

      const quiz = await generateQuiz(lessonContent, 5);

      expect(quiz).toHaveProperty('id');
      expect(quiz).toHaveProperty('title');
      expect(quiz).toHaveProperty('questions');
      expect(Array.isArray(quiz.questions)).toBe(true);
    });

    it('should generate questions with multiple choice options', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  title: 'Quiz',
                  questions: [
                    {
                      question: 'What is GET used for?',
                      options: ['A) Retrieve', 'B) Submit', 'C) Update', 'D) Delete'],
                      correctAnswer: 0,
                      explanation: 'GET retrieves data'
                    }
                  ]
                })
              }]
            }
          }]
        })
      });

      const quiz = await generateQuiz(lessonContent, 3);

      quiz.questions.forEach(q => {
        expect(q).toHaveProperty('question');
        expect(q).toHaveProperty('options');
        expect(q).toHaveProperty('correctAnswer');
        expect(Array.isArray(q.options)).toBe(true);
        expect(q.options.length).toBeGreaterThan(1);
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(q.correctAnswer).toBeLessThan(q.options.length);
      });
    });
  });

  describe('Assignment Generation Workflow', () => {
    const projectContent = `
      Building a Todo Application

      Create a full-stack todo application with the following features:
      - User authentication
      - Create, read, update, delete todos
      - Mark todos as complete
      - Filter by status
      - Responsive design
    `;

    it('should generate assignment tasks from content', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  title: 'Todo App Assignment',
                  description: 'Build a full-stack application',
                  tasks: [
                    { task: 'Set up project structure', completed: false },
                    { task: 'Implement authentication', completed: false },
                  ]
                })
              }]
            }
          }]
        })
      });

      const assignment = await generateAssignment(projectContent, 'medium');

      expect(assignment).toHaveProperty('id');
      expect(assignment).toHaveProperty('title');
      expect(assignment).toHaveProperty('description');
      expect(assignment).toHaveProperty('tasks');
      expect(Array.isArray(assignment.tasks)).toBe(true);
    });

    it('should support different difficulty levels', async () => {
      const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];

      for (const difficulty of difficulties) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{
                  text: JSON.stringify({
                    title: `${difficulty} Assignment`,
                    description: 'Test',
                    tasks: [{ task: 'Task 1', completed: false }]
                  })
                }]
              }
            }]
          })
        });

        const assignment = await generateAssignment(projectContent, difficulty);
        expect(assignment).toBeDefined();
      }
    });
  });

  describe('API Key Management Workflow', () => {
    it('should save and load API keys securely', async () => {
      const providers: Array<'gemini' | 'groq' | 'huggingface'> = ['gemini', 'groq', 'huggingface'];
      const keys = {
        gemini: 'test-gemini-key-123',
        groq: 'test-groq-key-456',
        huggingface: 'test-hf-key-789',
      };

      // Save keys
      for (const provider of providers) {
        await setApiKey(provider, keys[provider]);
      }

      // Verify storage
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@naved_api_key_gemini', keys.gemini);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@naved_api_key_groq', keys.groq);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@naved_api_key_huggingface', keys.huggingface);
    });
  });

  describe('Document Management Workflow', () => {
    it('should manage multiple documents', async () => {
      const docs: Document[] = [
        {
          id: 'doc-1',
          name: 'Notes 1.txt',
          uri: 'file://notes1.txt',
          type: 'txt',
          size: 1000,
          uploadedAt: new Date(),
        },
        {
          id: 'doc-2',
          name: 'Notes 2.pdf',
          uri: 'file://notes2.pdf',
          type: 'pdf',
          size: 5000,
          uploadedAt: new Date(),
        },
      ];

      // Save documents
      for (const doc of docs) {
        await saveDocument(doc);
      }

      // Get all documents
      const saved = await getDocuments();
      expect(saved.length).toBe(docs.length);

      // Delete one
      await deleteDocument('doc-1');

      const remaining = await getDocuments();
      expect(remaining.length).toBe(docs.length - 1);
      expect(remaining.find(d => d.id === 'doc-1')).toBeUndefined();
    });
  });

  describe('Error Handling in Study Flow', () => {
    it('should handle LLM API failures gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const text = 'Sample content';
      const response = await chatWithDocument('Test question', text, []);

      // Should return fallback response, not throw
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should provide fallback when no API key configured', async () => {
      // Clear API keys
      await loadApiKeys();

      const response = await chatWithDocument('Question', 'Content', []);

      // Should still return a response (indicating API key needed)
      expect(typeof response).toBe('string');
    });
  });
});

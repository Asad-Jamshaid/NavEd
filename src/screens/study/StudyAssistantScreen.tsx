// ==========================================
// Study Assistant Screen - Modern Minimal Design
// RAG-based LLM Chatbot with Gemini API
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import AccessibleButton from '../../components/common/AccessibleButton';
import Card, { SimpleCard } from '../../components/common/Card';
import { NoDocumentsEmpty } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../contexts/AppContext';
import { Document, ChatMessage, StudyPlan, Quiz } from '../../types';
import {
  pickDocument,
  extractTextFromDocument,
  chatWithDocument,
  generateStudyPlan,
  generateQuiz,
  saveDocument,
  getDocuments,
  deleteDocument,
  saveChatHistory,
  getChatHistory,
  setApiKey,
  loadApiKeys,
} from '../../services/studyAssistantService';
import { speak, triggerHaptic } from '../../services/accessibilityService';

export default function StudyAssistantScreen() {
  const { theme } = useTheme();
  const { state } = useApp();
  const scrollViewRef = useRef<ScrollView>(null);

  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [documentText, setDocumentText] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [showDocuments, setShowDocuments] = useState(true);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'groq' | 'huggingface'>('gemini');
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentStudyPlan, setCurrentStudyPlan] = useState<StudyPlan | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const accessibilityMode = state.user?.preferences.accessibilityMode;

  // Load documents and API keys on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoadingDocs(true);
      await loadApiKeys();
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // Upload document
  const handleUploadDocument = async () => {
    try {
      const doc = await pickDocument();
      if (doc) {
        await saveDocument(doc);
        setDocuments(prev => [...prev, doc]);
        setActiveDocument(doc);

        // Extract text
        setIsLoading(true);
        const text = await extractTextFromDocument(doc);
        setDocumentText(text);
        setIsLoading(false);

        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `I've loaded "${doc.name}". You can now:\n\n• Ask questions about the document\n• Generate a study plan\n• Create quizzes\n• Get assignment help\n\nWhat would you like to do?`,
          timestamp: new Date(),
          documentId: doc.id,
        };
        setChatMessages([welcomeMessage]);

        triggerHaptic('success');
        if (accessibilityMode) {
          speak(`Document ${doc.name} uploaded successfully`);
        }
      }
    } catch (error: any) {
      console.error('Error uploading document:', error);
      Alert.alert('Upload Error', error.message || 'Failed to upload document. Please try again.');
    }
  };

  // Select document
  const handleSelectDocument = async (doc: Document) => {
    setActiveDocument(doc);
    setShowDocuments(false);
    setIsLoading(true);

    try {
      const text = await extractTextFromDocument(doc);
      setDocumentText(text);

      // Load chat history
      const history = await getChatHistory(doc.id);
      if (history.length > 0) {
        setChatMessages(history);
      } else {
        setChatMessages([{
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `Ready to help with "${doc.name}". Ask me anything!`,
          timestamp: new Date(),
          documentId: doc.id,
        }]);
      }
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setIsLoading(false);
    }

    triggerHaptic('light');
  };

  // Delete document
  const handleDeleteDocument = async (docId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDocument(docId);
            setDocuments(prev => prev.filter(d => d.id !== docId));
            if (activeDocument?.id === docId) {
              setActiveDocument(null);
              setChatMessages([]);
              setDocumentText('');
            }
            triggerHaptic('medium');
          },
        },
      ]
    );
  };

  // Send chat message
  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeDocument) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
      documentId: activeDocument.id,
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatWithDocument(
        currentInput,
        documentText,
        chatMessages
      );

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        documentId: activeDocument.id,
      };

      const updatedMessages = [...chatMessages, userMessage, assistantMessage];
      setChatMessages(updatedMessages);
      await saveChatHistory(activeDocument.id, updatedMessages);

      if (accessibilityMode) {
        speak(response.slice(0, 200)); // Read first 200 chars
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage = error?.message?.includes('API Error')
        ? 'Document summarization requires an LLM API. Please add your free API key in Settings to enable this feature.'
        : 'Sorry, I encountered an error. Please make sure you have a valid API key configured in Settings.';

      setChatMessages(prev => [...prev, {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Generate study plan
  const handleGenerateStudyPlan = async () => {
    if (!activeDocument || !documentText) return;

    setIsLoading(true);
    try {
      const plan = await generateStudyPlan(documentText);
      plan.documentId = activeDocument.id;
      setCurrentStudyPlan(plan);
      setShowPlanModal(true);
      triggerHaptic('success');
    } catch (error: any) {
      console.error('Study plan error:', error);
      const errorMessage = error?.message?.includes('API Error')
        ? 'Failed to generate study plan. Please add your free API key in Settings to enable this feature.'
        : 'Failed to generate study plan. Please make sure you have a valid API key configured in Settings.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate quiz
  const handleGenerateQuiz = async () => {
    if (!activeDocument || !documentText) return;

    setIsLoading(true);
    try {
      const quiz = await generateQuiz(documentText, 5);
      quiz.documentId = activeDocument.id;
      setCurrentQuiz(quiz);
      setQuizAnswers({});
      setShowQuizModal(true);
      triggerHaptic('success');
    } catch (error: any) {
      console.error('Quiz error:', error);
      const errorMessage = error?.message?.includes('API Error')
        ? 'Failed to generate quiz. Please add your free API key in Settings to enable this feature.'
        : 'Failed to generate quiz. Please make sure you have a valid API key configured in Settings.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Save API key
  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) return;

    await setApiKey(selectedProvider, apiKeyInput.trim());
    setApiKeyInput('');
    setShowApiKeyModal(false);
    triggerHaptic('success');
    Alert.alert('Success', `${selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)} API key saved!`);
  };

  // Check quiz answer
  const selectQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
    triggerHaptic('light');
  };

  // Calculate quiz score
  const getQuizScore = () => {
    if (!currentQuiz) return 0;
    let correct = 0;
    currentQuiz.questions.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) correct++;
    });
    return correct;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Document List View */}
      {showDocuments && (
        <View style={styles.documentsView}>
          <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
              Study Assistant
            </Text>
            <TouchableOpacity
              onPress={() => setShowApiKeyModal(true)}
              style={styles.settingsButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="API Settings"
            >
              <MaterialIcons name="settings" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.documentsList} showsVerticalScrollIndicator={false}>
            {/* Upload Card */}
            <Card
              onPress={handleUploadDocument}
              variant="elevated"
              style={StyleSheet.flatten([styles.uploadCard, { borderColor: theme.colors.primary, borderStyle: 'dashed' }])}
              accessibilityLabel="Upload document"
              accessibilityHint="Tap to upload a PDF, Word, or text document"
            >
              <View style={styles.uploadContent}>
                <View style={[styles.uploadIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
                  <MaterialIcons name="cloud-upload" size={48} color={theme.colors.primary} />
                </View>
                <Text style={[styles.uploadTitle, { color: theme.colors.textPrimary }]}>
                  Upload Document
                </Text>
                <Text style={[styles.uploadSubtitle, { color: theme.colors.textSecondary }]}>
                  PDF, Word, or Text files up to 10MB
                </Text>
              </View>
            </Card>

            {/* Loading State */}
            {isLoadingDocs && (
              <>
                <CardSkeleton />
                <CardSkeleton />
              </>
            )}

            {/* Empty State */}
            {!isLoadingDocs && documents.length === 0 && (
              <NoDocumentsEmpty onUpload={handleUploadDocument} />
            )}

            {/* Documents */}
            {!isLoadingDocs && documents.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                  Your Documents
                </Text>
                {documents.map(doc => (
                  <Card
                    key={doc.id}
                    icon="description"
                    iconColor={theme.colors.primary}
                    title={doc.name}
                    subtitle={`${(doc.size / 1024).toFixed(1)} KB • ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                    onPress={() => handleSelectDocument(doc)}
                    variant="elevated"
                    style={styles.documentCard}
                    headerRight={
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteDocument(doc.id)}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Delete document"
                      >
                        <MaterialIcons name="delete-outline" size={20} color={theme.colors.error} />
                      </TouchableOpacity>
                    }
                    accessibilityLabel={doc.name}
                    accessibilityHint="Tap to open document for study"
                  >
                    <View />
                  </Card>
                ))}
              </>
            )}

            {/* Free API Info */}
            <SimpleCard variant="flat" style={StyleSheet.flatten([styles.infoCard, { backgroundColor: `${theme.colors.info}10` }])}>
              <View style={styles.infoContent}>
                <View style={[styles.infoIcon, { backgroundColor: `${theme.colors.info}15` }]}>
                  <MaterialIcons name="info-outline" size={24} color={theme.colors.info} />
                </View>
                <View style={styles.infoText}>
                  <Text style={[styles.infoTitle, { color: theme.colors.textPrimary }]}>
                    Free AI Features
                  </Text>
                  <Text style={[styles.infoDesc, { color: theme.colors.textSecondary }]}>
                    Get a FREE API key from:{'\n'}
                    • Google AI Studio (Gemini){'\n'}
                    • Groq Console{'\n'}
                    • HuggingFace{'\n'}
                    Then add it in settings to unlock all features!
                  </Text>
                </View>
              </View>
            </SimpleCard>
          </ScrollView>
        </View>
      )}

      {/* Chat View */}
      {!showDocuments && activeDocument && (
        <View style={styles.chatView}>
          {/* Chat Header */}
          <View style={[styles.chatHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity
              onPress={() => setShowDocuments(true)}
              style={styles.backButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Back to documents"
            >
              <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Text style={[styles.chatDocName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {activeDocument.name}
              </Text>
            </View>
          </View>

          {/* Quick Actions - Fixed positioning to not cover chat */}
          <View style={[styles.quickActions, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsContent}
            >
              <AccessibleButton
                title="Study Plan"
                icon="event-note"
                size="small"
                variant="outline"
                onPress={handleGenerateStudyPlan}
                disabled={isLoading}
              />
              <AccessibleButton
                title="Quiz Me"
                icon="quiz"
                size="small"
                variant="outline"
                onPress={handleGenerateQuiz}
                disabled={isLoading}
              />
              <AccessibleButton
                title="Summarize"
                icon="summarize"
                size="small"
                variant="outline"
                onPress={() => {
                  setInputText('Summarize this document in bullet points');
                  setTimeout(() => handleSendMessage(), 100);
                }}
                disabled={isLoading}
              />
            </ScrollView>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {chatMessages.map(message => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.role === 'user' 
                    ? [styles.userMessage, { backgroundColor: theme.colors.primary }]
                    : [styles.assistantMessage, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: message.role === 'user' ? theme.colors.textInverse : theme.colors.textPrimary },
                  ]}
                >
                  {message.content}
                </Text>
                <Text style={[styles.messageTime, { color: theme.colors.textTertiary }]}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}

            {isLoading && (
              <View style={[styles.messageBubble, styles.assistantMessage, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={[styles.thinkingText, { color: theme.colors.textSecondary }]}>Thinking...</Text>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.textPrimary,
                  borderRadius: theme.borderRadius.lg,
                },
              ]}
              placeholder="Ask about your document..."
              placeholderTextColor={theme.colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              accessible={true}
              accessibilityLabel="Message input"
              accessibilityHint="Type your question about the document"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim() ? theme.colors.primary : theme.colors.border,
                  borderRadius: theme.borderRadius.full,
                },
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <MaterialIcons
                name="send"
                size={20}
                color={inputText.trim() ? theme.colors.textInverse : theme.colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* API Key Modal */}
      <Modal
        visible={showApiKeyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowApiKeyModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setShowApiKeyModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            style={{ width: '100%' }}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Configure AI API Key
              </Text>
              <TouchableOpacity onPress={() => setShowApiKeyModal(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
              Add a FREE API key to unlock AI features
            </Text>

            {/* Provider Selection */}
            <View style={styles.providerButtons}>
              {(['gemini', 'groq', 'huggingface'] as const).map(provider => (
                <TouchableOpacity
                  key={provider}
                  style={[
                    styles.providerButton,
                    {
                      backgroundColor: selectedProvider === provider ? theme.colors.primary : 'transparent',
                      borderColor: selectedProvider === provider ? theme.colors.primary : theme.colors.border,
                      borderRadius: theme.borderRadius.md,
                    },
                  ]}
                  onPress={() => {
                    setSelectedProvider(provider);
                    triggerHaptic('light');
                  }}
                >
                  <Text
                    style={[
                      styles.providerText,
                      {
                        color: selectedProvider === provider ? theme.colors.textInverse : theme.colors.textSecondary,
                        fontWeight: selectedProvider === provider ? '600' : '400',
                      },
                    ]}
                  >
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[
                styles.apiInput,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
              placeholder={`Enter ${selectedProvider} API key`}
              placeholderTextColor={theme.colors.textTertiary}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={[styles.apiHint, { color: theme.colors.textTertiary }]}>
              Get free key:{'\n'}
              {selectedProvider === 'gemini' && '• makersuite.google.com/app/apikey'}
              {selectedProvider === 'groq' && '• console.groq.com/keys'}
              {selectedProvider === 'huggingface' && '• huggingface.co/settings/tokens'}
            </Text>

            <View style={styles.modalActions}>
              <AccessibleButton
                title="Cancel"
                variant="ghost"
                onPress={() => {
                  setShowApiKeyModal(false);
                  setApiKeyInput('');
                }}
                style={{ flex: 1 }}
              />
              <AccessibleButton
                title="Save Key"
                icon="save"
                onPress={handleSaveApiKey}
                style={{ flex: 1 }}
              />
            </View>
          </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      {/* Quiz Modal */}
      <Modal
        visible={showQuizModal}
        animationType="slide"
        onRequestClose={() => setShowQuizModal(false)}
      >
        <View style={[styles.quizContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.quizHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.quizTitle, { color: theme.colors.textPrimary }]}>
              {currentQuiz?.title || 'Quiz'}
            </Text>
            <TouchableOpacity onPress={() => setShowQuizModal(false)}>
              <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.quizContent} showsVerticalScrollIndicator={false}>
            {currentQuiz?.questions.map((question, qIndex) => (
              <View key={question.id} style={[styles.questionCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg }]}>
                <Text style={[styles.questionNumber, { color: theme.colors.primary }]}>
                  Question {qIndex + 1}
                </Text>
                <Text style={[styles.questionText, { color: theme.colors.textPrimary }]}>
                  {question.question}
                </Text>

                {question.options.map((option, oIndex) => {
                  const isSelected = quizAnswers[question.id] === oIndex;
                  const isCorrect = oIndex === question.correctAnswer;
                  const showResult = quizAnswers[question.id] !== undefined;

                  return (
                    <TouchableOpacity
                      key={oIndex}
                      style={[
                        styles.optionButton,
                        {
                          borderColor: showResult && isCorrect
                            ? theme.colors.success
                            : showResult && isSelected && !isCorrect
                            ? theme.colors.error
                            : isSelected
                            ? theme.colors.primary
                            : theme.colors.border,
                          backgroundColor: showResult && isCorrect
                            ? `${theme.colors.success}15`
                            : showResult && isSelected && !isCorrect
                            ? `${theme.colors.error}15`
                            : isSelected
                            ? `${theme.colors.primary}15`
                            : 'transparent',
                          borderRadius: theme.borderRadius.md,
                        },
                      ]}
                      onPress={() => selectQuizAnswer(question.id, oIndex)}
                      disabled={showResult}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color: theme.colors.textPrimary,
                            fontWeight: isSelected ? '600' : '400',
                          },
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {quizAnswers[question.id] !== undefined && (
                  <View style={[styles.explanationBox, { backgroundColor: `${theme.colors.warning}15`, borderRadius: theme.borderRadius.md }]}>
                    <Text style={[styles.explanationText, { color: theme.colors.textSecondary }]}>
                      {question.explanation}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            {Object.keys(quizAnswers).length === currentQuiz?.questions.length && (
              <View style={[styles.scoreCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg }]}>
                <Text style={[styles.scoreTitle, { color: theme.colors.primary }]}>Quiz Complete!</Text>
                <Text style={[styles.scoreText, { color: theme.colors.secondary }]}>
                  Score: {getQuizScore()} / {currentQuiz?.questions.length}
                </Text>
                <AccessibleButton
                  title="Close"
                  onPress={() => setShowQuizModal(false)}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Study Plan Modal */}
      <Modal
        visible={showPlanModal}
        animationType="slide"
        onRequestClose={() => setShowPlanModal(false)}
      >
        <View style={[styles.planContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.planHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.planTitle, { color: theme.colors.textPrimary }]}>
              {currentStudyPlan?.title || 'Study Plan'}
            </Text>
            <TouchableOpacity onPress={() => setShowPlanModal(false)}>
              <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.planContent} showsVerticalScrollIndicator={false}>
            {/* Objectives */}
            <Text style={[styles.planSectionTitle, { color: theme.colors.textPrimary }]}>
              Learning Objectives
            </Text>
            {currentStudyPlan?.objectives.map((obj, index) => (
              <View key={index} style={styles.objectiveItem}>
                <MaterialIcons name="check-circle" size={20} color={theme.colors.secondary} />
                <Text style={[styles.objectiveText, { color: theme.colors.textPrimary }]}>
                  {obj}
                </Text>
              </View>
            ))}

            {/* Sessions */}
            <Text style={[styles.planSectionTitle, { color: theme.colors.textPrimary }]}>
              Study Sessions
            </Text>
            {currentStudyPlan?.schedule.map((session, index) => (
              <Card key={session.id} variant="elevated" style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <Text style={[styles.sessionNumber, { color: theme.colors.primary }]}>
                    Session {index + 1}
                  </Text>
                  <Text style={[styles.sessionDuration, { color: theme.colors.textSecondary }]}>
                    {session.duration} min
                  </Text>
                </View>
                <Text style={[styles.sessionTopic, { color: theme.colors.textPrimary }]}>
                  {session.topic}
                </Text>
              </Card>
            ))}

            <AccessibleButton
              title="Start Studying"
              icon="play-arrow"
              onPress={() => {
                setShowPlanModal(false);
                if (accessibilityMode) {
                  speak('Starting study session. Good luck!');
                }
              }}
              style={styles.startButton}
            />
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Documents View
  documentsView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  settingsButton: {
    padding: 8,
  },
  documentsList: {
    flex: 1,
    padding: 16,
  },
  uploadCard: {
    marginBottom: 16,
    borderWidth: 2,
  },
  uploadContent: {
    alignItems: 'center',
    padding: 24,
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  documentCard: {
    marginBottom: 12,
  },
  deleteButton: {
    padding: 8,
  },
  infoCard: {
    marginTop: 24,
    padding: 16,
  },
  infoContent: {
    flexDirection: 'row',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Chat View
  chatView: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatDocName: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    maxHeight: 60,
  },
  quickActionsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  thinkingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  providerButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  providerButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  providerText: {
    fontSize: 14,
  },
  apiInput: {
    borderWidth: 1,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  apiHint: {
    fontSize: 12,
    marginBottom: 20,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  // Quiz Modal
  quizContainer: {
    flex: 1,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  quizContent: {
    padding: 16,
  },
  questionCard: {
    padding: 16,
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  optionButton: {
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
  },
  explanationBox: {
    padding: 12,
    marginTop: 12,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  scoreCard: {
    padding: 24,
    alignItems: 'center',
    marginTop: 24,
  },
  scoreTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
  },
  // Study Plan Modal
  planContainer: {
    flex: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  planContent: {
    padding: 16,
  },
  planSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  objectiveText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  sessionCard: {
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionDuration: {
    fontSize: 14,
  },
  sessionTopic: {
    fontSize: 16,
  },
  startButton: {
    marginTop: 24,
    marginBottom: 40,
  },
});

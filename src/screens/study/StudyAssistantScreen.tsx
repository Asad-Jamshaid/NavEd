// ==========================================
// Study Assistant Screen - RAG-based LLM Chatbot
// Uses FREE APIs: Gemini, Groq, HuggingFace
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
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import AccessibleButton from '../../components/common/AccessibleButton';
import Card from '../../components/common/Card';
import { COLORS, SPACING, BORDER_RADIUS, ACCESSIBILITY_CONFIG } from '../../utils/constants';
import { Document, ChatMessage, StudyPlan, Quiz, Assignment } from '../../types';
import {
  pickDocument,
  extractTextFromDocument,
  chatWithDocument,
  generateStudyPlan,
  generateQuiz,
  generateAssignment,
  saveDocument,
  getDocuments,
  deleteDocument,
  saveChatHistory,
  getChatHistory,
  setApiKey,
  loadApiKeys,
} from '../../services/studyAssistantService';
import { speak, triggerHaptic } from '../../services/accessibilityService';
import { useApp } from '../../contexts/AppContext';

export default function StudyAssistantScreen() {
  const { state } = useApp();
  const scrollViewRef = useRef<ScrollView>(null);

  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [documentText, setDocumentText] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
  const highContrast = state.user?.preferences.highContrast;

  // Load documents and API keys on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await loadApiKeys();
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading data:', error);
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
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Upload Error', 'Failed to upload document. Please try again.');
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
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatWithDocument(
        userMessage.content,
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
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API key in settings.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
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
    } catch (error) {
      console.error('Study plan error:', error);
      Alert.alert('Error', 'Failed to generate study plan. Please check your API key.');
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
    } catch (error) {
      console.error('Quiz error:', error);
      Alert.alert('Error', 'Failed to generate quiz. Please check your API key.');
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
      style={[styles.container, highContrast && styles.containerHighContrast]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Document List View */}
      {showDocuments && (
        <View style={styles.documentsView}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, highContrast && styles.textHighContrast]}>
              Study Assistant
            </Text>
            <TouchableOpacity
              onPress={() => setShowApiKeyModal(true)}
              style={styles.settingsButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="API Settings"
            >
              <MaterialIcons name="settings" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.documentsList}>
            {/* Upload Card */}
            <Card
              onPress={handleUploadDocument}
              style={styles.uploadCard}
              highContrast={highContrast}
              accessibilityLabel="Upload document"
              accessibilityHint="Tap to upload a PDF, Word, or text document"
            >
              <View style={styles.uploadContent}>
                <MaterialIcons name="cloud-upload" size={48} color={COLORS.primary} />
                <Text style={[styles.uploadTitle, highContrast && styles.textHighContrast]}>
                  Upload Document
                </Text>
                <Text style={styles.uploadSubtitle}>
                  PDF, Word, or Text files up to 10MB
                </Text>
              </View>
            </Card>

            {/* Documents */}
            {documents.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, highContrast && styles.textHighContrast]}>
                  Your Documents
                </Text>
                {documents.map(doc => (
                  <Card
                    key={doc.id}
                    icon="description"
                    iconColor={COLORS.primary}
                    title={doc.name}
                    subtitle={`${(doc.size / 1024).toFixed(1)} KB • ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                    onPress={() => handleSelectDocument(doc)}
                    style={styles.documentCard}
                    highContrast={highContrast}
                    accessibilityLabel={doc.name}
                    accessibilityHint="Tap to open document for study"
                  >
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteDocument(doc.id)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Delete document"
                    >
                      <MaterialIcons name="delete-outline" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </Card>
                ))}
              </>
            )}

            {/* Free API Info */}
            <Card style={styles.infoCard} highContrast={highContrast}>
              <View style={styles.infoContent}>
                <MaterialIcons name="info-outline" size={24} color={COLORS.info} />
                <View style={styles.infoText}>
                  <Text style={[styles.infoTitle, highContrast && styles.textHighContrast]}>
                    Free AI Features
                  </Text>
                  <Text style={styles.infoDesc}>
                    Get a FREE API key from:{'\n'}
                    • Google AI Studio (Gemini){'\n'}
                    • Groq Console{'\n'}
                    • HuggingFace{'\n'}
                    Then add it in settings to unlock all features!
                  </Text>
                </View>
              </View>
            </Card>
          </ScrollView>
        </View>
      )}

      {/* Chat View */}
      {!showDocuments && activeDocument && (
        <View style={styles.chatView}>
          {/* Chat Header */}
          <View style={[styles.chatHeader, highContrast && styles.chatHeaderHighContrast]}>
            <TouchableOpacity
              onPress={() => setShowDocuments(true)}
              style={styles.backButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Back to documents"
            >
              <MaterialIcons name="arrow-back" size={24} color={highContrast ? '#FFFFFF' : COLORS.black} />
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Text style={[styles.chatDocName, highContrast && styles.textHighContrast]} numberOfLines={1}>
                {activeDocument.name}
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickActions}
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
                handleSendMessage();
              }}
              disabled={isLoading}
            />
          </ScrollView>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            {chatMessages.map(message => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userMessage : styles.assistantMessage,
                  highContrast && (message.role === 'user' ? styles.userMessageHighContrast : styles.assistantMessageHighContrast),
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === 'user' && styles.userMessageText,
                    highContrast && styles.textHighContrast,
                  ]}
                >
                  {message.content}
                </Text>
                <Text style={styles.messageTime}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}

            {isLoading && (
              <View style={[styles.messageBubble, styles.assistantMessage]}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.thinkingText}>Thinking...</Text>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={[styles.inputContainer, highContrast && styles.inputContainerHighContrast]}>
            <TextInput
              style={[styles.textInput, highContrast && styles.textInputHighContrast]}
              placeholder="Ask about your document..."
              placeholderTextColor={COLORS.gray}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              accessible={true}
              accessibilityLabel="Message input"
              accessibilityHint="Type your question about the document"
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <MaterialIcons
                name="send"
                size={24}
                color={inputText.trim() ? COLORS.white : COLORS.gray}
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
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, highContrast && styles.modalContentHighContrast]}>
            <Text style={[styles.modalTitle, highContrast && styles.textHighContrast]}>
              Configure AI API Key
            </Text>
            <Text style={styles.modalSubtitle}>
              Add a FREE API key to unlock AI features
            </Text>

            {/* Provider Selection */}
            <View style={styles.providerButtons}>
              {(['gemini', 'groq', 'huggingface'] as const).map(provider => (
                <TouchableOpacity
                  key={provider}
                  style={[
                    styles.providerButton,
                    selectedProvider === provider && styles.providerButtonActive,
                  ]}
                  onPress={() => setSelectedProvider(provider)}
                >
                  <Text style={[
                    styles.providerText,
                    selectedProvider === provider && styles.providerTextActive,
                  ]}>
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.apiInput, highContrast && styles.inputHighContrast]}
              placeholder={`Enter ${selectedProvider} API key`}
              placeholderTextColor={COLORS.gray}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.apiHint}>
              Get free key:{'\n'}
              {selectedProvider === 'gemini' && '• makersuite.google.com/app/apikey'}
              {selectedProvider === 'groq' && '• console.groq.com/keys'}
              {selectedProvider === 'huggingface' && '• huggingface.co/settings/tokens'}
            </Text>

            <View style={styles.modalActions}>
              <AccessibleButton
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setShowApiKeyModal(false);
                  setApiKeyInput('');
                }}
                style={styles.modalButton}
              />
              <AccessibleButton
                title="Save Key"
                icon="save"
                onPress={handleSaveApiKey}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Quiz Modal */}
      <Modal
        visible={showQuizModal}
        animationType="slide"
        onRequestClose={() => setShowQuizModal(false)}
      >
        <View style={[styles.quizContainer, highContrast && styles.containerHighContrast]}>
          <View style={styles.quizHeader}>
            <Text style={[styles.quizTitle, highContrast && styles.textHighContrast]}>
              {currentQuiz?.title || 'Quiz'}
            </Text>
            <TouchableOpacity onPress={() => setShowQuizModal(false)}>
              <MaterialIcons name="close" size={24} color={highContrast ? '#FFFFFF' : COLORS.black} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.quizContent}>
            {currentQuiz?.questions.map((question, qIndex) => (
              <View key={question.id} style={styles.questionCard}>
                <Text style={[styles.questionNumber, highContrast && styles.textHighContrast]}>
                  Question {qIndex + 1}
                </Text>
                <Text style={[styles.questionText, highContrast && styles.textHighContrast]}>
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
                        isSelected && styles.optionSelected,
                        showResult && isCorrect && styles.optionCorrect,
                        showResult && isSelected && !isCorrect && styles.optionWrong,
                      ]}
                      onPress={() => selectQuizAnswer(question.id, oIndex)}
                      disabled={showResult}
                    >
                      <Text style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {quizAnswers[question.id] !== undefined && (
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationText}>
                      {question.explanation}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            {Object.keys(quizAnswers).length === currentQuiz?.questions.length && (
              <View style={styles.scoreCard}>
                <Text style={styles.scoreTitle}>Quiz Complete!</Text>
                <Text style={styles.scoreText}>
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
        <View style={[styles.planContainer, highContrast && styles.containerHighContrast]}>
          <View style={styles.planHeader}>
            <Text style={[styles.planTitle, highContrast && styles.textHighContrast]}>
              {currentStudyPlan?.title || 'Study Plan'}
            </Text>
            <TouchableOpacity onPress={() => setShowPlanModal(false)}>
              <MaterialIcons name="close" size={24} color={highContrast ? '#FFFFFF' : COLORS.black} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.planContent}>
            {/* Objectives */}
            <Text style={[styles.planSectionTitle, highContrast && styles.textHighContrast]}>
              Learning Objectives
            </Text>
            {currentStudyPlan?.objectives.map((obj, index) => (
              <View key={index} style={styles.objectiveItem}>
                <MaterialIcons name="check-circle" size={20} color={COLORS.secondary} />
                <Text style={[styles.objectiveText, highContrast && styles.textHighContrast]}>
                  {obj}
                </Text>
              </View>
            ))}

            {/* Sessions */}
            <Text style={[styles.planSectionTitle, highContrast && styles.textHighContrast]}>
              Study Sessions
            </Text>
            {currentStudyPlan?.schedule.map((session, index) => (
              <Card key={session.id} style={styles.sessionCard} highContrast={highContrast}>
                <View style={styles.sessionHeader}>
                  <Text style={[styles.sessionNumber, highContrast && styles.textHighContrast]}>
                    Session {index + 1}
                  </Text>
                  <Text style={styles.sessionDuration}>
                    {session.duration} min
                  </Text>
                </View>
                <Text style={[styles.sessionTopic, highContrast && styles.textHighContrast]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerHighContrast: {
    backgroundColor: '#000000',
  },
  textHighContrast: {
    color: '#FFFFFF',
  },

  // Documents View
  documentsView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.black,
  },
  settingsButton: {
    padding: SPACING.sm,
  },
  documentsList: {
    flex: 1,
    padding: SPACING.md,
  },
  uploadCard: {
    marginBottom: SPACING.md,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: '#E3F2FD',
  },
  uploadContent: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  documentCard: {
    marginBottom: SPACING.sm,
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: SPACING.sm,
  },
  infoCard: {
    marginTop: SPACING.lg,
    backgroundColor: '#E3F2FD',
  },
  infoContent: {
    flexDirection: 'row',
  },
  infoText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  infoDesc: {
    fontSize: 14,
    color: COLORS.grayDark,
    marginTop: SPACING.xs,
    lineHeight: 20,
  },

  // Chat View
  chatView: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  chatHeaderHighContrast: {
    backgroundColor: '#1A1A1A',
    borderBottomColor: '#FFFFFF',
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatDocName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  quickActions: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  quickActionsContent: {
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.md,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  userMessageHighContrast: {
    backgroundColor: '#FFFF00',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  assistantMessageHighContrast: {
    backgroundColor: '#1A1A1A',
    borderColor: '#FFFFFF',
  },
  messageText: {
    fontSize: 16,
    color: COLORS.black,
    lineHeight: 22,
  },
  userMessageText: {
    color: COLORS.white,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: SPACING.xs,
    alignSelf: 'flex-end',
  },
  thinkingText: {
    marginLeft: SPACING.sm,
    color: COLORS.gray,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  inputContainerHighContrast: {
    backgroundColor: '#1A1A1A',
    borderTopColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    minHeight: ACCESSIBILITY_CONFIG.preferredTouchTarget,
    maxHeight: 100,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  textInputHighContrast: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  sendButton: {
    width: ACCESSIBILITY_CONFIG.preferredTouchTarget,
    height: ACCESSIBILITY_CONFIG.preferredTouchTarget,
    borderRadius: ACCESSIBILITY_CONFIG.preferredTouchTarget / 2,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.grayLight,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalContentHighContrast: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: SPACING.lg,
  },
  providerButtons: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  providerButton: {
    flex: 1,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    alignItems: 'center',
  },
  providerButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  providerText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  providerTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  apiInput: {
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 16,
    marginBottom: SPACING.sm,
  },
  inputHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
    color: '#FFFFFF',
  },
  apiHint: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  modalButton: {
    flex: 1,
  },

  // Quiz Modal
  quizContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
    paddingTop: Platform.OS === 'ios' ? 60 : SPACING.md,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
  },
  quizContent: {
    padding: SPACING.md,
  },
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  questionText: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  optionButton: {
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E3F2FD',
  },
  optionCorrect: {
    borderColor: COLORS.success,
    backgroundColor: '#E8F5E9',
  },
  optionWrong: {
    borderColor: COLORS.error,
    backgroundColor: '#FFEBEE',
  },
  optionText: {
    fontSize: 14,
    color: COLORS.black,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  explanationBox: {
    backgroundColor: '#FFF3E0',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  explanationText: {
    fontSize: 14,
    color: COLORS.accentDark,
  },
  scoreCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  scoreTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SPACING.lg,
  },

  // Study Plan Modal
  planContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
    paddingTop: Platform.OS === 'ios' ? 60 : SPACING.md,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
  },
  planContent: {
    padding: SPACING.md,
  },
  planSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  objectiveText: {
    fontSize: 14,
    color: COLORS.black,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  sessionCard: {
    marginBottom: SPACING.sm,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  sessionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sessionDuration: {
    fontSize: 14,
    color: COLORS.gray,
  },
  sessionTopic: {
    fontSize: 16,
    color: COLORS.black,
  },
  startButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
});

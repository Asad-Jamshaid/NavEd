// ==========================================
// NavEd Constants - Budget Friendly Configuration
// ==========================================

// App Colors (Accessible color palette)
export const COLORS = {
  // Primary Colors
  primary: '#1E3A5F',
  primaryLight: '#2E5A8F',
  primaryDark: '#0E2A4F',

  // Secondary Colors
  secondary: '#4CAF50',
  secondaryLight: '#6FCF73',
  secondaryDark: '#2E7D32',

  // Accent Colors
  accent: '#FF9800',
  accentLight: '#FFB74D',
  accentDark: '#F57C00',

  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#757575',
  grayLight: '#E0E0E0',
  grayDark: '#424242',
  background: '#F5F5F5',

  // Semantic Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Accessibility High Contrast
  highContrastBg: '#000000',
  highContrastText: '#FFFFFF',
  highContrastAccent: '#FFFF00',

  // Parking Status Colors
  parkingAvailable: '#4CAF50',
  parkingModerate: '#FF9800',
  parkingFull: '#F44336',

  // Dark Mode Colors
  darkBg: '#121212',
  darkSurface: '#1E1E1E',
  darkText: '#FFFFFF',
};

// Font Sizes (Accessibility-friendly)
export const FONT_SIZES = {
  small: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    title: 26,
  },
  medium: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 26,
    title: 32,
  },
  large: {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 22,
    xl: 26,
    xxl: 32,
    title: 38,
  },
  xlarge: {
    xs: 16,
    sm: 18,
    md: 22,
    lg: 26,
    xl: 32,
    xxl: 38,
    title: 44,
  },
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
};

// ==========================================
// FREE API CONFIGURATIONS
// ==========================================

// OpenStreetMap - Completely FREE
export const OSM_CONFIG = {
  tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors',
  routingApiUrl: 'https://router.project-osrm.org/route/v1',
  geocodingApiUrl: 'https://nominatim.openstreetmap.org',
};

// Free LLM APIs (with generous free tiers)
export const LLM_CONFIG = {
  // Google Gemini - FREE tier: 60 requests/minute
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-1.5-flash', // Free tier model
    // API key should be stored securely - this is just for reference
  },
  // HuggingFace - FREE inference API
  huggingface: {
    baseUrl: 'https://api-inference.huggingface.co/models',
    model: 'mistralai/Mistral-7B-Instruct-v0.2',
  },
  // Groq - FREE tier: Very fast, generous limits
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.1-8b-instant', // Free tier
  },
};

// Supabase - FREE tier configuration
// 500MB database, 1GB file storage, 2GB bandwidth
export const SUPABASE_CONFIG = {
  // These should be replaced with actual values from Supabase dashboard
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY',
};

// ==========================================
// CAMPUS DATA (Your University)
// Replace with your actual campus coordinates
// ==========================================
export const CAMPUS_CONFIG = {
  // Default center (Update with your university coordinates)
  center: {
    latitude: 31.5204,  // Example: Lahore, Pakistan
    longitude: 74.3587,
  },
  defaultZoom: 16,
  minZoom: 14,
  maxZoom: 20,
};

// ==========================================
// PARKING PREDICTION CONFIG
// ==========================================
export const PARKING_CONFIG = {
  // Alert thresholds
  alertThreshold: 80, // Alert when 80% full
  criticalThreshold: 95, // Critical when 95% full

  // Peak hours detection
  peakHoursBuffer: 30, // minutes before peak to send alert

  // Update intervals (in minutes)
  manualUpdatePromptInterval: 30,
  predictionRefreshInterval: 15,
};

// ==========================================
// STUDY ASSISTANT CONFIG
// ==========================================
export const STUDY_CONFIG = {
  // Document processing
  maxDocumentSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx'],
  chunkSize: 500, // characters per chunk for RAG
  chunkOverlap: 50, // overlap between chunks

  // Quiz generation
  defaultQuizQuestions: 10,
  maxQuizQuestions: 25,

  // Study plan defaults
  defaultSessionDuration: 25, // Pomodoro technique
  breakDuration: 5,
};

// ==========================================
// ACCESSIBILITY CONFIG
// ==========================================
export const ACCESSIBILITY_CONFIG = {
  // Voice guidance
  defaultSpeechRate: 0.9,
  minSpeechRate: 0.5,
  maxSpeechRate: 1.5,

  // Haptic feedback
  lightImpact: 'light',
  mediumImpact: 'medium',
  heavyImpact: 'heavy',

  // Touch target sizes (minimum 44x44 for accessibility)
  minTouchTarget: 44,
  preferredTouchTarget: 48,

  // Animation reduced motion
  reducedMotionDuration: 0,
  normalMotionDuration: 300,
};

// Building Categories for filtering
export const BUILDING_CATEGORIES = [
  { id: 'all', name: 'All Buildings', icon: 'apps' },
  { id: 'academic', name: 'Academic', icon: 'school' },
  { id: 'administrative', name: 'Administrative', icon: 'business' },
  { id: 'library', name: 'Library', icon: 'library' },
  { id: 'cafeteria', name: 'Cafeteria', icon: 'restaurant' },
  { id: 'sports', name: 'Sports', icon: 'fitness-center' },
  { id: 'hostel', name: 'Hostel', icon: 'hotel' },
  { id: 'medical', name: 'Medical', icon: 'local-hospital' },
  { id: 'parking', name: 'Parking', icon: 'local-parking' },
];

// Navigation maneuver icons
export const MANEUVER_ICONS = {
  straight: 'arrow-upward',
  left: 'turn-left',
  right: 'turn-right',
  slight_left: 'turn-slight-left',
  slight_right: 'turn-slight-right',
  u_turn: 'u-turn-left',
  arrive: 'place',
};

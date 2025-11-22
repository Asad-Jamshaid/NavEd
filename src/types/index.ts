// ==========================================
// NavEd Type Definitions
// ==========================================

// Navigation Module Types
export interface Building {
  id: string;
  name: string;
  shortName: string;
  latitude: number;
  longitude: number;
  floors: number;
  description: string;
  category: BuildingCategory;
  facilities: string[];
  accessibilityFeatures: AccessibilityFeature[];
  imageUrl?: string;
  videoRouteUrl?: string;
}

export type BuildingCategory =
  | 'academic'
  | 'administrative'
  | 'library'
  | 'cafeteria'
  | 'sports'
  | 'hostel'
  | 'medical'
  | 'parking'
  | 'other';

export interface Room {
  id: string;
  buildingId: string;
  floor: number;
  roomNumber: string;
  name: string;
  type: RoomType;
  capacity?: number;
  facilities: string[];
  accessibilityFeatures: AccessibilityFeature[];
}

export type RoomType =
  | 'classroom'
  | 'lab'
  | 'office'
  | 'auditorium'
  | 'washroom'
  | 'cafeteria'
  | 'library'
  | 'other';

export type AccessibilityFeature =
  | 'wheelchair_ramp'
  | 'elevator'
  | 'braille_signage'
  | 'audio_guidance'
  | 'wide_doors'
  | 'accessible_washroom'
  | 'tactile_paving';

export interface NavigationRoute {
  id: string;
  fromLocation: Coordinate;
  toLocation: Coordinate;
  distance: number; // in meters
  duration: number; // in seconds
  steps: NavigationStep[];
  isAccessible: boolean;
  videoUrl?: string;
}

export interface NavigationStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: 'straight' | 'left' | 'right' | 'slight_left' | 'slight_right' | 'u_turn' | 'arrive';
  coordinate: Coordinate;
  isIndoor: boolean;
  floor?: number;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

// Parking Module Types
export interface ParkingLot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  totalSpots: number;
  availableSpots: number;
  type: ParkingType;
  isAccessible: boolean;
  operatingHours: OperatingHours;
  lastUpdated: Date;
  peakHours: PeakHour[];
}

export type ParkingType = 'car' | 'motorcycle' | 'bicycle' | 'mixed';

export interface OperatingHours {
  open: string; // HH:MM format
  close: string;
  days: number[]; // 0-6, Sunday = 0
}

export interface PeakHour {
  dayOfWeek: number;
  startHour: number;
  endHour: number;
  averageOccupancy: number; // 0-100 percentage
}

export interface ParkedVehicle {
  id: string;
  parkingLotId: string;
  spotNumber?: string;
  parkedAt: Date;
  photoUri?: string;
  notes?: string;
  latitude: number;
  longitude: number;
}

export interface ParkingPrediction {
  parkingLotId: string;
  predictedOccupancy: number;
  confidence: number;
  timestamp: Date;
  recommendation: string;
}

// Study Assistant Types
export interface Document {
  id: string;
  name: string;
  uri: string;
  type: DocumentType;
  size: number;
  uploadedAt: Date;
  processedAt?: Date;
  chunks?: DocumentChunk[];
}

export type DocumentType = 'pdf' | 'doc' | 'docx' | 'txt' | 'ppt' | 'pptx';

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  pageNumber?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  documentId?: string;
  sources?: DocumentChunk[];
}

export interface StudyPlan {
  id: string;
  documentId: string;
  title: string;
  objectives: string[];
  schedule: StudySession[];
  createdAt: Date;
}

export interface StudySession {
  id: string;
  topic: string;
  duration: number; // minutes
  completed: boolean;
  notes?: string;
}

export interface Quiz {
  id: string;
  documentId: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: Date;
  score?: number;
  completedAt?: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  userAnswer?: number;
}

export interface Assignment {
  id: string;
  documentId: string;
  title: string;
  description: string;
  tasks: AssignmentTask[];
  dueDate?: Date;
  createdAt: Date;
}

export interface AssignmentTask {
  id: string;
  task: string;
  completed: boolean;
  notes?: string;
}

// User & Settings Types
export interface User {
  id: string;
  email?: string;
  name?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  accessibilityMode: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  voiceGuidance: boolean;
  hapticFeedback: boolean;
  preferredLanguage: string;
  darkMode: boolean;
}

// Notification Types
export interface ParkingAlert {
  id: string;
  parkingLotId: string;
  message: string;
  threshold: number;
  enabled: boolean;
}

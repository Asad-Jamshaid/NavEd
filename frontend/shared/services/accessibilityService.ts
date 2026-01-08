// ==========================================
// Accessibility Service
// Making NavEd usable for everyone
// ==========================================

import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo, Platform } from 'react-native';
import { ACCESSIBILITY_CONFIG } from '../utils/constants';
import { UserPreferences } from '../types';

const STORAGE_KEY = '@naved_accessibility_settings';

// ==========================================
// Voice Guidance (Text-to-Speech)
// Uses built-in device TTS - FREE
// ==========================================
let speechRate = ACCESSIBILITY_CONFIG.defaultSpeechRate;
let voiceEnabled = false;

export async function initializeAccessibility(): Promise<void> {
  try {
    const settings = await getAccessibilitySettings();
    voiceEnabled = settings.voiceGuidance;
    speechRate = settings.speechRate || ACCESSIBILITY_CONFIG.defaultSpeechRate;
  } catch (error) {
    console.error('Error initializing accessibility:', error);
  }
}

export async function speak(
  text: string,
  options?: {
    language?: string;
    pitch?: number;
    rate?: number;
    onDone?: () => void;
  }
): Promise<void> {
  if (!voiceEnabled) return;

  try {
    // Stop any ongoing speech
    await Speech.stop();

    await Speech.speak(text, {
      language: options?.language || 'en-US',
      pitch: options?.pitch || 1.0,
      rate: options?.rate || speechRate,
      onDone: options?.onDone,
      onError: (error) => console.error('Speech error:', error),
    });
  } catch (error) {
    console.error('Error speaking:', error);
  }
}

export async function stopSpeaking(): Promise<void> {
  try {
    await Speech.stop();
  } catch (error) {
    console.error('Error stopping speech:', error);
  }
}

export async function isSpeaking(): Promise<boolean> {
  try {
    return await Speech.isSpeakingAsync();
  } catch (error) {
    return false;
  }
}

export function setVoiceEnabled(enabled: boolean): void {
  voiceEnabled = enabled;
  if (!enabled) {
    stopSpeaking();
  }
}

export function setSpeechRate(rate: number): void {
  speechRate = Math.max(
    ACCESSIBILITY_CONFIG.minSpeechRate,
    Math.min(ACCESSIBILITY_CONFIG.maxSpeechRate, rate)
  );
}

// ==========================================
// Navigation Announcements
// ==========================================
export async function announceNavigation(instruction: string): Promise<void> {
  await speak(instruction);
  await triggerHaptic('medium');
}

export async function announceArrival(destination: string): Promise<void> {
  await speak(`You have arrived at ${destination}`);
  await triggerHaptic('heavy');
}

export async function announceDistance(distance: number, unit: string = 'meters'): Promise<void> {
  const roundedDistance = Math.round(distance);
  await speak(`${roundedDistance} ${unit} remaining`);
}

export async function announceTurn(direction: string): Promise<void> {
  await speak(`Turn ${direction}`);
  await triggerHaptic('medium');
}

// ==========================================
// Haptic Feedback
// ==========================================
let hapticEnabled = true;

export function setHapticEnabled(enabled: boolean): void {
  hapticEnabled = enabled;
}

export async function triggerHaptic(
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
): Promise<void> {
  if (!hapticEnabled) return;

  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch (error) {
    console.error('Error triggering haptic:', error);
  }
}

// Selection haptic for buttons
export async function selectionHaptic(): Promise<void> {
  if (!hapticEnabled) return;
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.error('Error with selection haptic:', error);
  }
}

// ==========================================
// Screen Reader Support
// ==========================================
export async function isScreenReaderEnabled(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    return false;
  }
}

export function announceForAccessibility(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

// Generate accessible labels for navigation steps
export function getAccessibleNavigationLabel(step: {
  instruction: string;
  distance: number;
  maneuver: string;
}): string {
  const distanceText = step.distance < 100
    ? `${Math.round(step.distance)} meters`
    : `${(step.distance / 1000).toFixed(1)} kilometers`;

  return `${step.instruction}. Distance: ${distanceText}`;
}

// Generate accessible labels for parking
export function getAccessibleParkingLabel(lot: {
  name: string;
  availableSpots: number;
  totalSpots: number;
  isAccessible: boolean;
}): string {
  const occupancy = Math.round(((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100);
  const accessibleNote = lot.isAccessible ? 'Wheelchair accessible. ' : '';
  return `${lot.name}. ${accessibleNote}${lot.availableSpots} spots available out of ${lot.totalSpots}. ${occupancy} percent full.`;
}

// ==========================================
// High Contrast Mode
// ==========================================
export function getContrastColors(highContrast: boolean) {
  if (highContrast) {
    return {
      background: '#000000',
      text: '#FFFFFF',
      primary: '#FFFF00',
      secondary: '#00FFFF',
      border: '#FFFFFF',
      card: '#1A1A1A',
      success: '#00FF00',
      error: '#FF0000',
      warning: '#FFFF00',
    };
  }
  return null; // Use default theme colors
}

// ==========================================
// Font Size Scaling
// ==========================================
export function getFontScale(preference: 'small' | 'medium' | 'large' | 'xlarge'): number {
  switch (preference) {
    case 'small':
      return 0.85;
    case 'medium':
      return 1.0;
    case 'large':
      return 1.25;
    case 'xlarge':
      return 1.5;
    default:
      return 1.0;
  }
}

export function scaleFontSize(baseSize: number, scale: number): number {
  return Math.round(baseSize * scale);
}

// ==========================================
// Reduced Motion
// ==========================================
export async function prefersReducedMotion(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch (error) {
    return false;
  }
}

export function getAnimationDuration(reducedMotion: boolean): number {
  return reducedMotion
    ? ACCESSIBILITY_CONFIG.reducedMotionDuration
    : ACCESSIBILITY_CONFIG.normalMotionDuration;
}

// ==========================================
// Accessibility Settings Storage
// ==========================================
interface AccessibilitySettings {
  voiceGuidance: boolean;
  speechRate: number;
  hapticFeedback: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
}

const defaultSettings: AccessibilitySettings = {
  voiceGuidance: false,
  speechRate: ACCESSIBILITY_CONFIG.defaultSpeechRate,
  hapticFeedback: true,
  highContrast: false,
  fontSize: 'medium',
  reducedMotion: false,
  screenReaderOptimized: false,
};

export async function getAccessibilitySettings(): Promise<AccessibilitySettings> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? { ...defaultSettings, ...JSON.parse(json) } : defaultSettings;
  } catch (error) {
    console.error('Error loading accessibility settings:', error);
    return defaultSettings;
  }
}

export async function saveAccessibilitySettings(
  settings: Partial<AccessibilitySettings>
): Promise<void> {
  try {
    const current = await getAccessibilitySettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Apply settings immediately
    if (settings.voiceGuidance !== undefined) {
      setVoiceEnabled(settings.voiceGuidance);
    }
    if (settings.speechRate !== undefined) {
      setSpeechRate(settings.speechRate);
    }
    if (settings.hapticFeedback !== undefined) {
      setHapticEnabled(settings.hapticFeedback);
    }
  } catch (error) {
    console.error('Error saving accessibility settings:', error);
  }
}

// ==========================================
// Accessibility Helpers for Components
// ==========================================
export function getAccessibilityProps(props: {
  label: string;
  hint?: string;
  role?: 'button' | 'link' | 'header' | 'image' | 'text' | 'search' | 'alert';
  state?: {
    selected?: boolean;
    disabled?: boolean;
    checked?: boolean;
    expanded?: boolean;
  };
}) {
  return {
    accessible: true,
    accessibilityLabel: props.label,
    accessibilityHint: props.hint,
    accessibilityRole: props.role,
    accessibilityState: props.state,
  };
}

// Touch target sizing for accessibility
export function getMinTouchTarget() {
  return {
    minWidth: ACCESSIBILITY_CONFIG.minTouchTarget,
    minHeight: ACCESSIBILITY_CONFIG.minTouchTarget,
  };
}

export function getPreferredTouchTarget() {
  return {
    minWidth: ACCESSIBILITY_CONFIG.preferredTouchTarget,
    minHeight: ACCESSIBILITY_CONFIG.preferredTouchTarget,
  };
}

// ==========================================
// Quick Accessibility Actions
// ==========================================
export async function readCurrentScreen(screenDescription: string): Promise<void> {
  if (voiceEnabled) {
    await speak(screenDescription);
  }
}

export async function confirmAction(action: string): Promise<void> {
  await speak(`${action} completed`);
  await triggerHaptic('success');
}

export async function alertError(error: string): Promise<void> {
  await speak(`Error: ${error}`);
  await triggerHaptic('error');
}

export async function alertWarning(warning: string): Promise<void> {
  await speak(`Warning: ${warning}`);
  await triggerHaptic('warning');
}

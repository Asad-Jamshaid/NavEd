// ==========================================
// Parking Service - Crowdsourced & Predictive
// NO IoT devices - Community-driven updates
// ==========================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { ParkingLot, ParkingPrediction, ParkedVehicle, PeakHour } from '../../../shared/types';
import { PARKING_LOTS, getParkingStatus } from '../../../shared/data/campusData';
import { PARKING_CONFIG } from '../../../shared/utils/constants';
import {
  reportParkingAvailability as reportParkingToDb,
  getRecentParkingUpdates,
  getParkingHistory as getParkingHistoryFromDb,
  saveParkedVehicleToDb,
  getParkedVehicleFromDb,
  clearParkedVehicleFromDb,
} from './parkingDatabaseService';

const STORAGE_KEYS = {
  PARKING_UPDATES: '@naved_parking_updates',
  PARKING_HISTORY: '@naved_parking_history',
  USER_VEHICLE: '@naved_user_vehicle',
  PARKING_ALERTS: '@naved_parking_alerts_config',
};

// ==========================================
// Crowdsourced Parking Updates
// Users can report parking availability
// ==========================================
interface ParkingUpdate {
  parkingLotId: string;
  availableSpots: number;
  reportedBy: string;
  timestamp: Date;
  confidence: number; // Based on user reputation
}

// Get current parking data with crowdsourced updates
// Enhanced to try database first, fallback to AsyncStorage
export async function getParkingLots(): Promise<ParkingLot[]> {
  try {
    // Try to get updates from database first
    let updates: ParkingUpdate[] = [];
    
    try {
      const dbUpdates = await getRecentParkingUpdates(undefined, 30);
      updates = dbUpdates.map(u => ({
        parkingLotId: u.parkingLotId,
        availableSpots: u.availableSpots,
        reportedBy: u.reportedBy,
        timestamp: u.timestamp,
        confidence: u.confidence,
      }));
    } catch (dbError) {
      // Fallback to AsyncStorage (existing behavior)
      console.log('Database unavailable, using AsyncStorage fallback');
      const updatesJson = await AsyncStorage.getItem(STORAGE_KEYS.PARKING_UPDATES);
      updates = updatesJson ? JSON.parse(updatesJson) : [];
    }

    // Merge with base data
    return PARKING_LOTS.map(lot => {
      // Find recent updates for this lot (within last 30 minutes)
      const recentUpdates = updates.filter(
        u =>
          u.parkingLotId === lot.id &&
          new Date(u.timestamp).getTime() > Date.now() - 30 * 60 * 1000
      );

      if (recentUpdates.length > 0) {
        // Calculate weighted average based on confidence
        const totalWeight = recentUpdates.reduce((sum, u) => sum + u.confidence, 0);
        const weightedAvg = recentUpdates.reduce(
          (sum, u) => sum + u.availableSpots * u.confidence,
          0
        ) / totalWeight;

        return {
          ...lot,
          availableSpots: Math.round(weightedAvg),
          lastUpdated: new Date(recentUpdates[0].timestamp),
        };
      }

      return lot;
    });
  } catch (error) {
    console.error('Error getting parking lots:', error);
    return PARKING_LOTS;
  }
}

// Submit a parking update (crowdsourced)
// Enhanced to try database first, fallback to AsyncStorage
export async function reportParkingAvailability(
  parkingLotId: string,
  availableSpots: number,
  userId: string = 'anonymous'
): Promise<boolean> {
  try {
    // Try database first
    const dbSuccess = await reportParkingToDb(parkingLotId, availableSpots, userId === 'anonymous' ? undefined : userId);
    
    if (dbSuccess) {
      // Also save to AsyncStorage as backup
      try {
        const updatesJson = await AsyncStorage.getItem(STORAGE_KEYS.PARKING_UPDATES);
        const updates: ParkingUpdate[] = updatesJson ? JSON.parse(updatesJson) : [];

        const newUpdate: ParkingUpdate = {
          parkingLotId,
          availableSpots,
          reportedBy: userId,
          timestamp: new Date(),
          confidence: 0.8,
        };

        const updatedList = [newUpdate, ...updates].slice(0, 100);
        await AsyncStorage.setItem(STORAGE_KEYS.PARKING_UPDATES, JSON.stringify(updatedList));
        await saveParkingHistory(parkingLotId, availableSpots);
      } catch (storageError) {
        console.log('Error syncing to AsyncStorage:', storageError);
      }
      
      return true;
    }
    
    // Fallback to AsyncStorage (existing behavior)
    const updatesJson = await AsyncStorage.getItem(STORAGE_KEYS.PARKING_UPDATES);
    const updates: ParkingUpdate[] = updatesJson ? JSON.parse(updatesJson) : [];

    const newUpdate: ParkingUpdate = {
      parkingLotId,
      availableSpots,
      reportedBy: userId,
      timestamp: new Date(),
      confidence: 0.8, // Default confidence, can be adjusted based on user history
    };

    // Keep only last 100 updates
    const updatedList = [newUpdate, ...updates].slice(0, 100);
    await AsyncStorage.setItem(STORAGE_KEYS.PARKING_UPDATES, JSON.stringify(updatedList));

    // Also save to history for prediction model - use availableSpots directly (not decreasing)
    await saveParkingHistory(parkingLotId, availableSpots);

    return true;
  } catch (error) {
    console.error('Error reporting parking:', error);
    return false;
  }
}

// ==========================================
// Parking Prediction (Data Science)
// Uses historical patterns - NO external API costs
// ==========================================
interface HistoricalDataPoint {
  parkingLotId: string;
  dayOfWeek: number;
  hour: number;
  occupancy: number; // percentage
  timestamp: Date;
}

// Save historical data for prediction
async function saveParkingHistory(parkingLotId: string, availableSpots: number) {
  try {
    const lot = PARKING_LOTS.find(l => l.id === parkingLotId);
    if (!lot) return;

    const now = new Date();
    const occupancy = ((lot.totalSpots - availableSpots) / lot.totalSpots) * 100;

    const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.PARKING_HISTORY);
    const history: HistoricalDataPoint[] = historyJson ? JSON.parse(historyJson) : [];

    const newPoint: HistoricalDataPoint = {
      parkingLotId,
      dayOfWeek: now.getDay(),
      hour: now.getHours(),
      occupancy,
      timestamp: now,
    };

    // Keep last 1000 data points
    const updatedHistory = [newPoint, ...history].slice(0, 1000);
    await AsyncStorage.setItem(STORAGE_KEYS.PARKING_HISTORY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving parking history:', error);
  }
}

// Predict parking availability
// Enhanced to try database first, fallback to AsyncStorage
export async function predictParkingAvailability(
  parkingLotId: string,
  targetTime?: Date
): Promise<ParkingPrediction> {
  const lot = PARKING_LOTS.find(l => l.id === parkingLotId);
  if (!lot) {
    throw new Error('Parking lot not found');
  }

  const now = targetTime || new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();

  try {
    // Try to get historical data from database first
    let history: HistoricalDataPoint[] = [];
    
    try {
      const dbHistory = await getParkingHistoryFromDb(parkingLotId, dayOfWeek, hour);
      history = dbHistory.map(h => ({
        parkingLotId: h.parkingLotId,
        dayOfWeek: h.dayOfWeek,
        hour: h.hour,
        occupancy: h.occupancy,
        timestamp: h.timestamp,
      }));
    } catch (dbError) {
      // Fallback to AsyncStorage (existing behavior)
      console.log('Database unavailable for history, using AsyncStorage fallback');
      const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.PARKING_HISTORY);
      history = historyJson ? JSON.parse(historyJson) : [];
    }

    // Filter relevant data points (same lot, same day, similar time)
    const relevantPoints = history.filter(
      p =>
        p.parkingLotId === parkingLotId &&
        p.dayOfWeek === dayOfWeek &&
        Math.abs(p.hour - hour) <= 1
    );

    let predictedOccupancy: number;
    let confidence: number;

    if (relevantPoints.length >= 5) {
      // We have enough data - use average
      predictedOccupancy = relevantPoints.reduce((sum, p) => sum + p.occupancy, 0) / relevantPoints.length;
      confidence = Math.min(0.9, 0.5 + relevantPoints.length * 0.05);
    } else {
      // Use pre-defined peak hours as fallback
      const peakHour = lot.peakHours.find(
        p => p.dayOfWeek === dayOfWeek && hour >= p.startHour && hour <= p.endHour
      );

      if (peakHour) {
        predictedOccupancy = peakHour.averageOccupancy;
        confidence = 0.7;
      } else {
        // Default estimation
        predictedOccupancy = ((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100;
        confidence = 0.4;
      }
    }

    // Generate recommendation
    const recommendation = generateRecommendation(predictedOccupancy, lot.name);

    return {
      parkingLotId,
      predictedOccupancy: Math.round(predictedOccupancy),
      confidence,
      timestamp: now,
      recommendation,
    };
  } catch (error) {
    console.error('Error predicting parking:', error);
    // Fallback prediction
    return {
      parkingLotId,
      predictedOccupancy: 50,
      confidence: 0.3,
      timestamp: now,
      recommendation: 'Unable to predict accurately. Check real-time updates.',
    };
  }
}

function generateRecommendation(occupancy: number, lotName: string): string {
  if (occupancy >= 95) {
    return `${lotName} is expected to be full. Consider alternative parking.`;
  } else if (occupancy >= 80) {
    return `${lotName} is filling up. Arrive early to secure a spot.`;
  } else if (occupancy >= 60) {
    return `${lotName} has moderate availability. Good time to park.`;
  } else {
    return `${lotName} has plenty of available spots.`;
  }
}

// ==========================================
// Peak Hour Alerts (Push Notifications)
// FREE with Expo Push Notifications
// ==========================================
export async function setupParkingAlerts() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }

    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      }),
    });

    // Start monitoring parking status (check every 5 minutes)
    monitorParkingStatus();
  } catch (error) {
    console.log('Error setting up parking alerts:', error);
  }
}

// Monitor parking status and send notifications when lots are filling up
export async function monitorParkingStatus() {
  const lots = await getParkingLots();

  for (const lot of lots) {
    const occupancy = ((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100;

    // Check if parking lot is getting full (>80% occupancy)
    if (occupancy > 80 && occupancy < 95) {
      // Send notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Parking Alert',
          body: `${lot.name} is filling up! Only ${lot.availableSpots} spots remaining (${Math.round(100 - occupancy)}% available).`,
          data: { lotId: lot.id, occupancy },
        },
        trigger: null, // Send immediately
      });
    } else if (occupancy >= 95) {
      // Nearly full
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚗 Parking Almost Full',
          body: `${lot.name} is almost full! Only ${lot.availableSpots} spots left. Consider alternative parking.`,
          data: { lotId: lot.id, occupancy, urgent: true },
        },
        trigger: null,
      });
    }
  }
}

export async function schedulePeakHourAlert(
  parkingLotId: string,
  enabled: boolean = true
) {
  const lot = PARKING_LOTS.find(l => l.id === parkingLotId);
  if (!lot) return;

  // Cancel existing notifications for this lot
  await Notifications.cancelScheduledNotificationAsync(parkingLotId);

  if (!enabled) return;

  // Schedule alerts for peak hours
  for (const peakHour of lot.peakHours) {
    const alertHour = peakHour.startHour;
    const alertMinute = 0 - PARKING_CONFIG.peakHoursBuffer; // 30 mins before

    // Calculate next occurrence
    const now = new Date();
    const alertDate = new Date();
    alertDate.setHours(alertHour, alertMinute < 0 ? 60 + alertMinute : alertMinute, 0, 0);

    // Adjust for day of week
    const daysUntil = (peakHour.dayOfWeek - now.getDay() + 7) % 7;
    alertDate.setDate(alertDate.getDate() + daysUntil);

    if (alertDate <= now) {
      alertDate.setDate(alertDate.getDate() + 7);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🅿️ Parking Alert',
        body: `${lot.name} is approaching peak hours. Expected ${peakHour.averageOccupancy}% occupancy soon.`,
        data: { parkingLotId, type: 'peak_hour_alert' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: alertDate,
      },      identifier: `${parkingLotId}-peak-${peakHour.dayOfWeek}-${peakHour.startHour}`,
    });
  }
}

// Send immediate alert when parking is filling up
export async function sendFillingUpAlert(parkingLotId: string) {
  const lot = PARKING_LOTS.find(l => l.id === parkingLotId);
  if (!lot) return;

  const occupancy = ((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100;

  if (occupancy >= PARKING_CONFIG.alertThreshold) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Parking Filling Up!',
        body: `${lot.name} is now ${Math.round(occupancy)}% full. Only ${lot.availableSpots} spots remaining.`,
        data: { parkingLotId, type: 'filling_up_alert' },
      },
      trigger: null, // Immediate
    });
  }
}

// ==========================================
// Vehicle Locator
// Save and retrieve parked vehicle location
// Enhanced to try database first, fallback to AsyncStorage
// ==========================================
export async function saveVehicleLocation(vehicle: ParkedVehicle, userId?: string): Promise<void> {
  try {
    // Try database first if userId provided
    if (userId) {
      try {
        const dbSuccess = await saveParkedVehicleToDb(vehicle, userId);
        if (dbSuccess) {
          // Also save to AsyncStorage as backup
          try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_VEHICLE, JSON.stringify(vehicle));
          } catch (storageError) {
            console.log('Error syncing vehicle to AsyncStorage:', storageError);
          }
          return;
        }
      } catch (dbError) {
        console.log('Database unavailable, using AsyncStorage fallback');
      }
    }
    
    // Fallback to AsyncStorage (existing behavior)
    await AsyncStorage.setItem(STORAGE_KEYS.USER_VEHICLE, JSON.stringify(vehicle));
  } catch (error) {
    console.error('Error saving vehicle location:', error);
  }
}

export async function getVehicleLocation(userId?: string): Promise<ParkedVehicle | null> {
  try {
    // Try database first if userId provided
    if (userId) {
      try {
        const dbVehicle = await getParkedVehicleFromDb(userId);
        if (dbVehicle) {
          // Normalize date types - ensure parkedAt is a Date object
          if (dbVehicle.parkedAt && typeof dbVehicle.parkedAt === 'string') {
            dbVehicle.parkedAt = new Date(dbVehicle.parkedAt);
          }
          // Also sync to AsyncStorage as backup
          try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_VEHICLE, JSON.stringify(dbVehicle));
          } catch (storageError) {
            console.log('Error syncing vehicle to AsyncStorage:', storageError);
          }
          return dbVehicle;
        }
      } catch (dbError) {
        console.log('Database unavailable, using AsyncStorage fallback');
      }
    }
    
    // Fallback to AsyncStorage (existing behavior)
    const vehicleJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_VEHICLE);
    if (!vehicleJson) return null;
    
    const vehicle = JSON.parse(vehicleJson);
    // Ensure dates are Date objects
    if (vehicle.parkedAt) {
      vehicle.parkedAt = new Date(vehicle.parkedAt);
    }
    return vehicle;
  } catch (error) {
    console.error('Error getting vehicle location:', error);
    return null;
  }
}

export async function clearVehicleLocation(userId?: string): Promise<void> {
  try {
    // Try database first if userId provided
    if (userId) {
      try {
        await clearParkedVehicleFromDb(userId);
      } catch (dbError) {
        console.log('Database unavailable, using AsyncStorage fallback');
      }
    }
    
    // Always clear AsyncStorage too (existing behavior)
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_VEHICLE);
  } catch (error) {
    console.error('Error clearing vehicle location:', error);
  }
}

// ==========================================
// Quick Actions
// ==========================================
export function findNearestAvailableParking(
  currentLocation: { latitude: number; longitude: number },
  lots: ParkingLot[]
): ParkingLot | null {
  const availableLots = lots.filter(l => l.availableSpots > 0);

  if (availableLots.length === 0) return null;

  // Sort by distance
  const sortedLots = availableLots.sort((a, b) => {
    const distA = calculateSimpleDistance(currentLocation, { latitude: a.latitude, longitude: a.longitude });
    const distB = calculateSimpleDistance(currentLocation, { latitude: b.latitude, longitude: b.longitude });
    return distA - distB;
  });

  return sortedLots[0];
}

function calculateSimpleDistance(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number {
  const latDiff = to.latitude - from.latitude;
  const lngDiff = to.longitude - from.longitude;
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
}

// Get parking lot by status
export function filterParkingByStatus(
  lots: ParkingLot[],
  status: 'available' | 'moderate' | 'full' | 'all'
): ParkingLot[] {
  if (status === 'all') return lots;
  return lots.filter(l => getParkingStatus(l) === status);
}

// Get accessible parking lots
export function getAccessibleParkingLots(lots: ParkingLot[]): ParkingLot[] {
  return lots.filter(l => l.isAccessible);
}

// ==========================================
// Enhanced Parking Alert Service
// Real-time monitoring and predictive alerts
// ==========================================

import * as Notifications from 'expo-notifications';
import { ParkingLot } from '../../../shared/types';
import { PARKING_CONFIG } from '../../../shared/utils/constants';
import { getParkingLots } from './parkingService';
import { predictParkingAvailabilityEnhanced } from './parkingPredictionService';
import { getRecentParkingUpdates } from './parkingDatabaseService';

interface AlertThreshold {
  parkingLotId: string;
  threshold: number; // Occupancy percentage
  enabled: boolean;
}

// Store alert thresholds (can be persisted to AsyncStorage or database)
let alertThresholds: AlertThreshold[] = [];

/**
 * Initialize alert service
 */
export async function initializeParkingAlerts() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
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

    return true;
  } catch (error) {
    console.error('Error initializing parking alerts:', error);
    return false;
  }
}

/**
 * Monitor parking lots and send alerts when thresholds are reached
 */
export async function monitorParkingAlerts() {
  try {
    const lots = await getParkingLots();

    for (const lot of lots) {
      const occupancy = ((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100;

      // Check thresholds
      const threshold = alertThresholds.find((t) => t.parkingLotId === lot.id);
      const alertThreshold = threshold?.threshold || PARKING_CONFIG.alertThreshold;
      const isEnabled = threshold?.enabled !== false; // Default to enabled

      if (!isEnabled) continue;

      // Check if parking lot is getting full
      if (occupancy >= alertThreshold && occupancy < PARKING_CONFIG.criticalThreshold) {
        await sendParkingAlert(lot, occupancy, 'filling');
      } else if (occupancy >= PARKING_CONFIG.criticalThreshold) {
        await sendParkingAlert(lot, occupancy, 'critical');
      }
    }
  } catch (error) {
    console.error('Error monitoring parking alerts:', error);
  }
}

/**
 * Send parking alert notification
 */
async function sendParkingAlert(
  lot: ParkingLot,
  occupancy: number,
  severity: 'filling' | 'critical'
) {
  try {
    const title =
      severity === 'critical'
        ? '🚗 Parking Almost Full'
        : '⚠️ Parking Filling Up';
    const body =
      severity === 'critical'
        ? `${lot.name} is almost full! Only ${lot.availableSpots} spots left (${Math.round(occupancy)}% occupied). Consider alternative parking.`
        : `${lot.name} is filling up! ${lot.availableSpots} spots remaining (${Math.round(occupancy)}% occupied).`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          parkingLotId: lot.id,
          occupancy,
          severity,
          type: 'parking_alert',
        },
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending parking alert:', error);
  }
}

/**
 * Set alert threshold for a parking lot
 */
export function setAlertThreshold(parkingLotId: string, threshold: number, enabled: boolean = true) {
  const existing = alertThresholds.findIndex((t) => t.parkingLotId === parkingLotId);
  const thresholdData: AlertThreshold = { parkingLotId, threshold, enabled };

  if (existing >= 0) {
    alertThresholds[existing] = thresholdData;
  } else {
    alertThresholds.push(thresholdData);
  }
}

/**
 * Get alert threshold for a parking lot
 */
export function getAlertThreshold(parkingLotId: string): AlertThreshold | undefined {
  return alertThresholds.find((t) => t.parkingLotId === parkingLotId);
}

/**
 * Enable/disable alerts for a parking lot
 */
export function setAlertEnabled(parkingLotId: string, enabled: boolean) {
  const threshold = alertThresholds.find((t) => t.parkingLotId === parkingLotId);
  if (threshold) {
    threshold.enabled = enabled;
  } else {
    // Create default threshold if doesn't exist
    setAlertThreshold(parkingLotId, PARKING_CONFIG.alertThreshold, enabled);
  }
}

/**
 * Predictive alert - warn before parking lot fills up
 */
export async function sendPredictiveAlert(parkingLotId: string, minutesAhead: number = 30) {
  try {
    const targetTime = new Date(Date.now() + minutesAhead * 60 * 1000);
    const prediction = await predictParkingAvailabilityEnhanced(parkingLotId, targetTime);

    if (prediction.predictedOccupancy >= PARKING_CONFIG.alertThreshold) {
      const lots = await getParkingLots();
      const lot = lots.find((l) => l.id === parkingLotId);
      if (!lot) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 Predictive Parking Alert',
          body: `In ${minutesAhead} minutes, ${lot.name} is predicted to be ${Math.round(prediction.predictedOccupancy)}% full. Plan accordingly.`,
          data: {
            parkingLotId,
            predictedOccupancy: prediction.predictedOccupancy,
            type: 'predictive_alert',
          },
        },
        trigger: null,
      });
    }
  } catch (error) {
    console.error('Error sending predictive alert:', error);
  }
}

/**
 * Check for rapid fill-up (multiple reports in short time)
 */
export async function checkRapidFillUp(parkingLotId: string) {
  try {
    const recentUpdates = await getRecentParkingUpdates(parkingLotId, 15); // Last 15 minutes

    if (recentUpdates.length >= 3) {
      // Check if availability is decreasing rapidly
      const sortedUpdates = recentUpdates.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );

      const mostRecent = sortedUpdates[0];
      const oldest = sortedUpdates[sortedUpdates.length - 1];

      const spotsLost = oldest.availableSpots - mostRecent.availableSpots;
      const timeDiff = mostRecent.timestamp.getTime() - oldest.timestamp.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      // If losing more than 10 spots per 10 minutes, send alert
      if (spotsLost > 0 && minutesDiff > 0) {
        const rate = (spotsLost / minutesDiff) * 10;
        if (rate >= 10) {
          const lots = await getParkingLots();
          const lot = lots.find((l) => l.id === parkingLotId);
          if (!lot) return;

          await Notifications.scheduleNotificationAsync({
            content: {
              title: '⚡ Rapid Fill-Up Detected',
              body: `${lot.name} is filling up quickly! ${mostRecent.availableSpots} spots remaining.`,
              data: {
                parkingLotId,
                type: 'rapid_fillup_alert',
              },
            },
            trigger: null,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking rapid fill-up:', error);
  }
}

/**
 * Schedule periodic monitoring
 */
let monitoringInterval: NodeJS.Timeout | null = null;

export function startParkingMonitoring(intervalMinutes: number = 5) {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
  }

  // Initial check
  monitorParkingAlerts();

  // Set up periodic monitoring
  monitoringInterval = setInterval(() => {
    monitorParkingAlerts();
  }, intervalMinutes * 60 * 1000);
}

export function stopParkingMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
}




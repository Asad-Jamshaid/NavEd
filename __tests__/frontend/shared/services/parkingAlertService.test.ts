/**
 * Unit Tests for Parking Alert Service
 * Tests alert monitoring, thresholds, and notifications
 */

import * as Notifications from 'expo-notifications';
import {
  initializeParkingAlerts,
  monitorParkingAlerts,
  setAlertThreshold,
  getAlertThreshold,
  setAlertEnabled,
  sendPredictiveAlert,
  checkRapidFillUp,
  startParkingMonitoring,
  stopParkingMonitoring,
} from '../../src/services/parkingAlertService';
import { getParkingLots } from '../../src/services/parkingService';
import { predictParkingAvailabilityEnhanced } from '../../src/services/parkingPredictionService';
import { getRecentParkingUpdates } from '../../src/services/parkingDatabaseService';

// Mock dependencies
jest.mock('expo-notifications');
jest.mock('../../src/services/parkingService');
jest.mock('../../src/services/parkingPredictionService');
jest.mock('../../src/services/parkingDatabaseService');

describe('Parking Alert Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-id');
    (getParkingLots as jest.Mock).mockResolvedValue([
      {
        id: 'park-1',
        name: 'A Parking',
        totalSpots: 100,
        availableSpots: 20, // 80% occupied
        latitude: 31.44679,
        longitude: 74.268438,
        type: 'mixed',
        isAccessible: true,
        operatingHours: { open: '06:00', close: '22:00', days: [1, 2, 3, 4, 5] },
        lastUpdated: new Date(),
        peakHours: [],
      },
    ]);
  });

  describe('initializeParkingAlerts()', () => {
    test('should request notification permissions', async () => {
      const result = await initializeParkingAlerts();

      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test('should return false when permissions denied', async () => {
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      const result = await initializeParkingAlerts();

      expect(result).toBe(false);
    });

    test('should configure notification handler', async () => {
      await initializeParkingAlerts();

      expect(Notifications.setNotificationHandler).toHaveBeenCalled();
    });
  });

  describe('monitorParkingAlerts()', () => {
    test('should check parking lots for alerts', async () => {
      await monitorParkingAlerts();

      expect(getParkingLots).toHaveBeenCalled();
    });

    test('should send alert when occupancy exceeds threshold', async () => {
      await monitorParkingAlerts();

      // Should send alert for 80% occupied lot
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    test('should not send alert when below threshold', async () => {
      (getParkingLots as jest.Mock).mockResolvedValueOnce([
        {
          id: 'park-1',
          name: 'A Parking',
          totalSpots: 100,
          availableSpots: 50, // 50% occupied
          latitude: 31.44679,
          longitude: 74.268438,
          type: 'mixed',
          isAccessible: true,
          operatingHours: { open: '06:00', close: '22:00', days: [1, 2, 3, 4, 5] },
          lastUpdated: new Date(),
          peakHours: [],
        },
      ]);

      await monitorParkingAlerts();

      // Should not send alert
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    test('should respect disabled alerts', async () => {
      setAlertEnabled('park-1', false);

      await monitorParkingAlerts();

      // Should not send alert for disabled lot
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
      
      // Restore state for other tests
      setAlertEnabled('park-1', true);
    });
  });

  describe('setAlertThreshold()', () => {
    test('should set threshold for parking lot', () => {
      setAlertThreshold('park-1', 85, true);

      const threshold = getAlertThreshold('park-1');
      expect(threshold).toBeDefined();
      expect(threshold?.threshold).toBe(85);
      expect(threshold?.enabled).toBe(true);
    });

    test('should update existing threshold', () => {
      setAlertThreshold('park-1', 80, true);
      setAlertThreshold('park-1', 90, false);

      const threshold = getAlertThreshold('park-1');
      expect(threshold?.threshold).toBe(90);
      expect(threshold?.enabled).toBe(false);
    });
  });

  describe('getAlertThreshold()', () => {
    test('should return undefined for non-existent threshold', () => {
      const threshold = getAlertThreshold('non-existent');
      expect(threshold).toBeUndefined();
    });

    test('should return threshold when set', () => {
      setAlertThreshold('park-1', 85, true);
      const threshold = getAlertThreshold('park-1');

      expect(threshold).toBeDefined();
      expect(threshold?.parkingLotId).toBe('park-1');
    });
  });

  describe('setAlertEnabled()', () => {
    test('should enable/disable alerts', () => {
      setAlertThreshold('park-1', 80, true);
      setAlertEnabled('park-1', false);

      const threshold = getAlertThreshold('park-1');
      expect(threshold?.enabled).toBe(false);
    });

    test('should create default threshold if not exists', () => {
      setAlertEnabled('park-2', true);

      const threshold = getAlertThreshold('park-2');
      expect(threshold).toBeDefined();
      expect(threshold?.enabled).toBe(true);
    });
  });

  describe('sendPredictiveAlert()', () => {
    test('should send alert when prediction exceeds threshold', async () => {
      (predictParkingAvailabilityEnhanced as jest.Mock).mockResolvedValueOnce({
        parkingLotId: 'park-1',
        predictedOccupancy: 85,
        confidence: 0.8,
        timestamp: new Date(),
        recommendation: 'Test',
      });

      await sendPredictiveAlert('park-1', 30);

      expect(predictParkingAvailabilityEnhanced).toHaveBeenCalled();
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    test('should not send alert when prediction below threshold', async () => {
      (predictParkingAvailabilityEnhanced as jest.Mock).mockResolvedValueOnce({
        parkingLotId: 'park-1',
        predictedOccupancy: 50,
        confidence: 0.8,
        timestamp: new Date(),
        recommendation: 'Test',
      });

      await sendPredictiveAlert('park-1', 30);

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('checkRapidFillUp()', () => {
    test('should detect rapid fill-up', async () => {
      (getRecentParkingUpdates as jest.Mock).mockResolvedValueOnce([
        {
          parkingLotId: 'park-1',
          availableSpots: 50,
          reportedBy: 'user-1',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          confidence: 0.8,
        },
        {
          parkingLotId: 'park-1',
          availableSpots: 40,
          reportedBy: 'user-2',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          confidence: 0.8,
        },
        {
          parkingLotId: 'park-1',
          availableSpots: 20,
          reportedBy: 'user-3',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          confidence: 0.8,
        },
      ]);

      await checkRapidFillUp('park-1');

      expect(getRecentParkingUpdates).toHaveBeenCalled();
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
      // Should send alert for rapid fill-up (30 spots lost in 10 minutes = 30 spots/10 min)
    });
  });

  describe('startParkingMonitoring() / stopParkingMonitoring()', () => {
    test('should start periodic monitoring', () => {
      jest.useFakeTimers();

      startParkingMonitoring(1); // 1 minute interval

      expect(getParkingLots).toHaveBeenCalled();

      jest.advanceTimersByTime(60000); // Advance 1 minute

      expect(getParkingLots).toHaveBeenCalledTimes(2); // Initial + after interval

      stopParkingMonitoring();
      jest.useRealTimers();
    });

    test('should stop monitoring', () => {
      jest.useFakeTimers();

      startParkingMonitoring(1);
      stopParkingMonitoring();

      jest.advanceTimersByTime(60000);

      // Should not call again after stop
      const callCount = (getParkingLots as jest.Mock).mock.calls.length;
      jest.advanceTimersByTime(60000);

      expect((getParkingLots as jest.Mock).mock.calls.length).toBe(callCount);

      jest.useRealTimers();
    });
  });

  describe('Error handling', () => {
    test('should handle errors gracefully', async () => {
      (getParkingLots as jest.Mock).mockRejectedValueOnce(new Error('Service error'));

      await expect(monitorParkingAlerts()).resolves.not.toThrow();
    });
  });
});




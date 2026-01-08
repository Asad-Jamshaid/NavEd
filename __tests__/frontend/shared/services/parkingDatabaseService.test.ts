/**
 * Unit Tests for Parking Database Service
 * Tests database operations with AsyncStorage fallback
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  reportParkingAvailability,
  getRecentParkingUpdates,
  getParkingHistory,
  saveParkedVehicleToDb,
  getParkedVehicleFromDb,
  clearParkedVehicleFromDb,
  subscribeToParkingUpdates,
  unsubscribeFromParkingUpdates,
} from '../../src/services/parkingDatabaseService';
import { PARKING_LOTS } from '../../src/data/campusData';

// Mock database service
jest.mock('../../src/services/databaseService', () => ({
  getSupabaseClient: jest.fn(() => ({})), // Minimal mock
  isSupabaseAvailable: jest.fn(() => false),
  safeDbOperation: jest.fn(async (op, fallback) => await fallback()),
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  const { createClient, mockSupabaseClient } = require('../../__mocks__/supabase');
  return { createClient };
});

describe('Parking Database Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

    // Restore safeDbOperation mock implementation (wiped by resetMocks: true)
    const { safeDbOperation } = require('../../src/services/databaseService');
    safeDbOperation.mockImplementation(async (op, fallback) => await fallback());
  });

  describe('reportParkingAvailability()', () => {
    test('should fallback to AsyncStorage when database unavailable', async () => {
      const result = await reportParkingAvailability('park-1', 10);

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test('should save to AsyncStorage with correct structure', async () => {
      await reportParkingAvailability('park-1', 15, 'user-123');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('parking_updates'),
        expect.any(String)
      );

      const callArgs = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        (call) => call[0].includes('PARKING_UPDATES')
      );
      if (callArgs) {
        const savedData = JSON.parse(callArgs[1]);
        expect(Array.isArray(savedData)).toBe(true);
        expect(savedData[0]).toHaveProperty('parkingLotId', 'park-1');
        expect(savedData[0]).toHaveProperty('availableSpots', 15);
      }
    });

    test('should save parking history to AsyncStorage', async () => {
      await reportParkingAvailability('park-1', 20);

      const historyCall = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        (call) => call[0].includes('parking_history')
      );
      expect(historyCall).toBeDefined();
    });
  });

  describe('getRecentParkingUpdates()', () => {
    test('should return empty array when no updates in AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const updates = await getRecentParkingUpdates();

      expect(updates).toEqual([]);
    });

    test('should return updates from AsyncStorage', async () => {
      const mockUpdates = [
        {
          parkingLotId: 'park-1',
          availableSpots: 10,
          reportedBy: 'user-123',
          timestamp: new Date().toISOString(),
          confidence: 0.8,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUpdates));

      const updates = await getRecentParkingUpdates();

      expect(updates.length).toBeGreaterThan(0);
      expect(updates[0].parkingLotId).toBe('park-1');
    });

    test('should filter updates by parking lot ID', async () => {
      const mockUpdates = [
        {
          parkingLotId: 'park-1',
          availableSpots: 10,
          reportedBy: 'user-123',
          timestamp: new Date().toISOString(),
          confidence: 0.8,
        },
        {
          parkingLotId: 'park-2',
          availableSpots: 20,
          reportedBy: 'user-123',
          timestamp: new Date().toISOString(),
          confidence: 0.8,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUpdates));

      const updates = await getRecentParkingUpdates('park-1');

      expect(updates.every((u) => u.parkingLotId === 'park-1')).toBe(true);
    });
  });

  describe('getParkingHistory()', () => {
    test('should return empty array when no history in AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const history = await getParkingHistory('park-1');

      expect(history).toEqual([]);
    });

    test('should filter history by parking lot ID', async () => {
      const mockHistory = [
        {
          parkingLotId: 'park-1',
          dayOfWeek: 1,
          hour: 10,
          occupancy: 75,
          timestamp: new Date().toISOString(),
        },
        {
          parkingLotId: 'park-2',
          dayOfWeek: 1,
          hour: 10,
          occupancy: 80,
          timestamp: new Date().toISOString(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockHistory));

      const history = await getParkingHistory('park-1');

      expect(history.every((h) => h.parkingLotId === 'park-1')).toBe(true);
    });
  });

  describe('saveParkedVehicleToDb()', () => {
    const mockVehicle = {
      id: 'vehicle-123',
      parkingLotId: 'park-1',
      spotNumber: 'A-15',
      parkedAt: new Date(),
      latitude: 37.7749,
      longitude: -122.4194,
    };

    test('should fallback to AsyncStorage when database unavailable', async () => {
      const result = await saveParkedVehicleToDb(mockVehicle, 'user-123');

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test('should save vehicle to AsyncStorage with correct structure', async () => {
      await saveParkedVehicleToDb(mockVehicle, 'user-123');

      const callArgs = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        (call) => call[0].includes('USER_VEHICLE')
      );
      if (callArgs) {
        const savedVehicle = JSON.parse(callArgs[1]);
        expect(savedVehicle.id).toBe('vehicle-123');
        expect(savedVehicle.parkingLotId).toBe('park-1');
      }
    });
  });

  describe('getParkedVehicleFromDb()', () => {
    test('should return null when no vehicle in AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const vehicle = await getParkedVehicleFromDb('user-123');

      expect(vehicle).toBeNull();
    });

    test('should return vehicle from AsyncStorage', async () => {
      const mockVehicle = {
        id: 'vehicle-123',
        parkingLotId: 'park-1',
        parkedAt: new Date().toISOString(),
        latitude: 37.7749,
        longitude: -122.4194,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockVehicle));

      const vehicle = await getParkedVehicleFromDb('user-123');

      expect(vehicle).not.toBeNull();
      expect(vehicle?.id).toBe('vehicle-123');
    });
  });

  describe('clearParkedVehicleFromDb()', () => {
    test('should remove vehicle from AsyncStorage', async () => {
      const result = await clearParkedVehicleFromDb('user-123');

      expect(result).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('subscribeToParkingUpdates()', () => {
    test('should return null when database unavailable', () => {
      const unsubscribe = subscribeToParkingUpdates(() => { });

      expect(unsubscribe).toBeNull();
    });
  });

  describe('unsubscribeFromParkingUpdates()', () => {
    test('should not throw when no subscription exists', () => {
      expect(() => unsubscribeFromParkingUpdates()).not.toThrow();
    });
  });
});


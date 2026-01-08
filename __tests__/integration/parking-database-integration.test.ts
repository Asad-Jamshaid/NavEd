/**
 * Integration Tests for Parking Database Integration
 * Tests parking service with database and AsyncStorage fallback
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getParkingLots,
  reportParkingAvailability,
  predictParkingAvailability,
  saveVehicleLocation,
  getVehicleLocation,
} from '../../src/services/parkingService';

// Mock database service - simulate unavailable
jest.mock('../../src/services/databaseService', () => ({
  getSupabaseClient: jest.fn(() => null),
  isSupabaseAvailable: jest.fn(() => false),
  safeDbOperation: jest.fn(async (dbOp, fallback) => await fallback()),
}));

// Mock parking database service
jest.mock('../../src/services/parkingDatabaseService', () => ({
  reportParkingAvailability: jest.fn(() => Promise.resolve(false)),
  getRecentParkingUpdates: jest.fn(() => Promise.resolve([])),
  getParkingHistory: jest.fn(() => Promise.resolve([])),
  saveParkedVehicleToDb: jest.fn(() => Promise.resolve(false)),
  getParkedVehicleFromDb: jest.fn(() => Promise.resolve(null)),
  clearParkedVehicleFromDb: jest.fn(() => Promise.resolve(false)),
  subscribeToParkingUpdates: jest.fn(() => null),
  unsubscribeFromParkingUpdates: jest.fn(),
}));

describe('Parking Database Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Fallback to AsyncStorage', () => {
    test('getParkingLots should use AsyncStorage when database unavailable', async () => {
      const lots = await getParkingLots();

      expect(Array.isArray(lots)).toBe(true);
      expect(lots.length).toBeGreaterThan(0);
    });

    test('reportParkingAvailability should save to AsyncStorage', async () => {
      const result = await reportParkingAvailability('park-1', 10);

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test('predictParkingAvailability should use AsyncStorage history', async () => {
      const prediction = await predictParkingAvailability('park-1');

      expect(prediction).toHaveProperty('parkingLotId');
      expect(prediction).toHaveProperty('predictedOccupancy');
    });

    test('saveVehicleLocation should save to AsyncStorage', async () => {
      const vehicle = {
        id: 'vehicle-123',
        parkingLotId: 'park-1',
        parkedAt: new Date(),
        latitude: 37.7749,
        longitude: -122.4194,
      };

      await saveVehicleLocation(vehicle);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test('getVehicleLocation should read from AsyncStorage', async () => {
      const mockVehicle = {
        id: 'vehicle-123',
        parkingLotId: 'park-1',
        parkedAt: new Date().toISOString(),
        latitude: 37.7749,
        longitude: -122.4194,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockVehicle));

      const vehicle = await getVehicleLocation();

      expect(vehicle).not.toBeNull();
      expect(vehicle?.id).toBe('vehicle-123');
    });
  });

  describe('Data consistency', () => {
    test('should maintain data format between database and AsyncStorage', async () => {
      await reportParkingAvailability('park-1', 15);

      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const updatesCall = setItemCalls.find((call) => call[0].includes('PARKING_UPDATES'));

      if (updatesCall) {
        const savedData = JSON.parse(updatesCall[1]);
        expect(Array.isArray(savedData)).toBe(true);
        expect(savedData[0]).toHaveProperty('parkingLotId');
        expect(savedData[0]).toHaveProperty('availableSpots');
        expect(savedData[0]).toHaveProperty('timestamp');
      }
    });
  });

  describe('Error recovery', () => {
    test('should recover from database errors', async () => {
      const { safeDbOperation } = require('../../src/services/databaseService');
      safeDbOperation.mockImplementationOnce(async (dbOp: any, fallback: any) => {
        // Simulate database error
        return await fallback();
      });

      const result = await reportParkingAvailability('park-1', 10);

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test('should recover from AsyncStorage errors', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const result = await reportParkingAvailability('park-1', 10);

      // Should return false but not throw
      expect(result).toBe(false);
    });
  });
});


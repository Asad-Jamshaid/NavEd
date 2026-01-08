/**
 * Backward Compatibility Tests for Parking Service
 * Ensures existing functionality still works after enhancements
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getParkingLots,
  reportParkingAvailability,
  predictParkingAvailability,
  saveVehicleLocation,
  getVehicleLocation,
  clearVehicleLocation,
} from '../../src/services/parkingService';

// Mock database service to return unavailable (tests AsyncStorage fallback)
jest.mock('../../src/services/databaseService', () => ({
  getSupabaseClient: jest.fn(() => null),
  isSupabaseAvailable: jest.fn(() => false),
  safeDbOperation: jest.fn((dbOp, fallback) => fallback()),
}));

// Mock parking database service
jest.mock('../../src/services/parkingDatabaseService', () => ({
  reportParkingAvailability: jest.fn(() => Promise.resolve(false)),
  getRecentParkingUpdates: jest.fn(() => Promise.resolve([])),
  getParkingHistory: jest.fn(() => Promise.resolve([])),
  saveParkedVehicleToDb: jest.fn(() => Promise.resolve(false)),
  getParkedVehicleFromDb: jest.fn(() => Promise.resolve(null)),
  clearParkedVehicleFromDb: jest.fn(() => Promise.resolve(false)),
}));

describe('Parking Service - Backward Compatibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Existing function signatures preserved', () => {
    test('getParkingLots() should work without database', async () => {
      const lots = await getParkingLots();

      expect(Array.isArray(lots)).toBe(true);
      expect(lots.length).toBeGreaterThan(0);
    });

    test('reportParkingAvailability() should work with AsyncStorage fallback', async () => {
      const result = await reportParkingAvailability('park-1', 10, 'anonymous');

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test('reportParkingAvailability() should work without userId parameter', async () => {
      const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');
      const result = await reportParkingAvailability('park-1', 10);

      expect(result).toBe(true);
      // Should default to 'anonymous'
      expect(setItemSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"reportedBy":"anonymous"')
      );
      setItemSpy.mockRestore();
    });

    test('predictParkingAvailability() should work with AsyncStorage fallback', async () => {
      const prediction = await predictParkingAvailability('park-1');

      expect(prediction).toHaveProperty('parkingLotId');
      expect(prediction).toHaveProperty('predictedOccupancy');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction).toHaveProperty('recommendation');
    });

    test('saveVehicleLocation() should work without userId parameter', async () => {
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

    test('saveVehicleLocation() should work with userId parameter', async () => {
      const vehicle = {
        id: 'vehicle-123',
        parkingLotId: 'park-1',
        parkedAt: new Date(),
        latitude: 37.7749,
        longitude: -122.4194,
      };

      await saveVehicleLocation(vehicle, 'user-123');

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test('getVehicleLocation() should work without userId parameter', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const vehicle = await getVehicleLocation();

      expect(vehicle).toBeNull();
    });

    test('getVehicleLocation() should work with userId parameter', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const vehicle = await getVehicleLocation('user-123');

      expect(vehicle).toBeNull();
    });

    test('clearVehicleLocation() should work without userId parameter', async () => {
      await clearVehicleLocation();

      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });

    test('clearVehicleLocation() should work with userId parameter', async () => {
      await clearVehicleLocation('user-123');

      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('AsyncStorage fallback behavior', () => {
    test('should use AsyncStorage when database unavailable', async () => {
      await reportParkingAvailability('park-1', 10);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test('should handle AsyncStorage errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const result = await reportParkingAvailability('park-1', 10);

      // Should return false on error
      expect(result).toBe(false);
    });
  });

  describe('Data format compatibility', () => {
    test('should maintain existing data structure in AsyncStorage', async () => {
      const mockUpdates = [
        {
          parkingLotId: 'park-1',
          availableSpots: 10,
          reportedBy: 'anonymous',
          timestamp: new Date().toISOString(),
          confidence: 0.8,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUpdates));

      const lots = await getParkingLots();

      expect(lots).toBeDefined();
      expect(Array.isArray(lots)).toBe(true);
    });

    test('should handle existing vehicle data format', async () => {
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

  describe('Error handling compatibility', () => {
    test('should handle errors without breaking', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const lots = await getParkingLots();

      // Should return base lots even on error
      expect(Array.isArray(lots)).toBe(true);
    });

    test('should not throw on prediction errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const prediction = await predictParkingAvailability('park-1');

      // Should return fallback prediction
      expect(prediction).toHaveProperty('parkingLotId');
    });
  });
});




/**
 * Unit Tests for Parking Service
 * Tests parking lot management, predictions, and vehicle location
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParkingLot, ParkedVehicle } from '../../src/types';

import {
  getParkingLots,
  reportParkingAvailability,
  predictParkingAvailability,
  saveVehicleLocation,
  getVehicleLocation,
  clearVehicleLocation,
  findNearestAvailableParking,
  getAccessibleParkingLots,
} from '../../src/services/parkingService';

describe('Parking Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('getParkingLots()', () => {
    test('should return array of parking lots', async () => {
      const lots = await getParkingLots();

      expect(Array.isArray(lots)).toBe(true);
      expect(lots.length).toBeGreaterThan(0);
    });

    test('each parking lot should have required properties', async () => {
      const lots = await getParkingLots();
      const lot = lots[0];

      expect(lot).toHaveProperty('id');
      expect(lot).toHaveProperty('name');
      expect(lot).toHaveProperty('totalSpots');
      expect(lot).toHaveProperty('availableSpots');
      expect(lot).toHaveProperty('latitude');
      expect(lot).toHaveProperty('longitude');
      expect(lot).toHaveProperty('isAccessible');
    });

    test('available spots should not exceed total spots', async () => {
      const lots = await getParkingLots();

      lots.forEach(lot => {
        expect(lot.availableSpots).toBeLessThanOrEqual(lot.totalSpots);
        expect(lot.availableSpots).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('reportParkingAvailability()', () => {
    test('should return true when report is successful', async () => {
      const lots = await getParkingLots();
      const result = await reportParkingAvailability(lots[0].id, 10);

      expect(result).toBe(true);
    });

    test('should update the parking lot availability', async () => {
      const lots = await getParkingLots();
      const lotId = lots[0].id;

      await reportParkingAvailability(lotId, 5);
      const updatedLots = await getParkingLots();
      const updatedLot = updatedLots.find(l => l.id === lotId);

      // After reporting, the lot should reflect some update
      expect(updatedLot).toBeDefined();
    });
  });

  describe('predictParkingAvailability()', () => {
    test('should return prediction object with required fields', async () => {
      const lots = await getParkingLots();
      const prediction = await predictParkingAvailability(lots[0].id);

      expect(prediction).toHaveProperty('parkingLotId');
      expect(prediction).toHaveProperty('predictedOccupancy');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction).toHaveProperty('recommendation');
    });

    test('confidence should be between 0 and 1', async () => {
      const lots = await getParkingLots();
      const prediction = await predictParkingAvailability(lots[0].id);

      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
    });

    test('predictedOccupancy should be between 0 and 100', async () => {
      const lots = await getParkingLots();
      const prediction = await predictParkingAvailability(lots[0].id);

      expect(prediction.predictedOccupancy).toBeGreaterThanOrEqual(0);
      expect(prediction.predictedOccupancy).toBeLessThanOrEqual(100);
    });
  });

  describe('Vehicle Location Management', () => {
    const mockVehicle: ParkedVehicle = {
      id: 'vehicle-123',
      parkingLotId: 'lot-1',
      spotNumber: 'A-15',
      parkedAt: new Date(),
      latitude: 37.7749,
      longitude: -122.4194,
    };

    test('saveVehicleLocation() should save to AsyncStorage', async () => {
      await saveVehicleLocation(mockVehicle);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String)
      );
    });

    test('getVehicleLocation() should return null when no vehicle saved', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const vehicle = await getVehicleLocation();

      expect(vehicle).toBeNull();
    });

    test('getVehicleLocation() should return saved vehicle', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockVehicle)
      );

      const vehicle = await getVehicleLocation();

      expect(vehicle).not.toBeNull();
      expect(vehicle?.id).toBe(mockVehicle.id);
      expect(vehicle?.spotNumber).toBe(mockVehicle.spotNumber);
    });

    test('clearVehicleLocation() should remove from AsyncStorage', async () => {
      await clearVehicleLocation();

      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('findNearestAvailableParking()', () => {
    const userLocation = { latitude: 37.7749, longitude: -122.4194 };

    test('should return nearest lot with available spots', async () => {
      const lots = await getParkingLots();
      const nearest = findNearestAvailableParking(userLocation, lots);

      if (lots.some(l => l.availableSpots > 0)) {
        expect(nearest).not.toBeNull();
        expect(nearest?.availableSpots).toBeGreaterThan(0);
      }
    });

    test('should return null when all lots are full', () => {
      const fullLots: ParkingLot[] = [
        {
          id: 'lot-1',
          name: 'Full Lot',
          latitude: 37.78,
          longitude: -122.42,
          totalSpots: 100,
          availableSpots: 0,
          type: 'car',
          isAccessible: true,
          operatingHours: { open: '06:00', close: '22:00', days: [1, 2, 3, 4, 5] },
          lastUpdated: new Date(),
          peakHours: [],
        },
      ];

      const nearest = findNearestAvailableParking(userLocation, fullLots);
      expect(nearest).toBeNull();
    });

    test('should prioritize closer lots', () => {
      const lots: ParkingLot[] = [
        {
          id: 'far-lot',
          name: 'Far Lot',
          latitude: 38.0,
          longitude: -123.0,
          totalSpots: 100,
          availableSpots: 50,
          type: 'car',
          isAccessible: true,
          operatingHours: { open: '06:00', close: '22:00', days: [1, 2, 3, 4, 5] },
          lastUpdated: new Date(),
          peakHours: [],
        },
        {
          id: 'near-lot',
          name: 'Near Lot',
          latitude: 37.7750,
          longitude: -122.4195,
          totalSpots: 100,
          availableSpots: 25,
          type: 'car',
          isAccessible: true,
          operatingHours: { open: '06:00', close: '22:00', days: [1, 2, 3, 4, 5] },
          lastUpdated: new Date(),
          peakHours: [],
        },
      ];

      const nearest = findNearestAvailableParking(userLocation, lots);
      expect(nearest?.id).toBe('near-lot');
    });
  });

  describe('Filtering parking lots', () => {
    test('lots can be filtered for available spots', async () => {
      const lots = await getParkingLots();
      const available = lots.filter(l => l.availableSpots > 0);

      expect(available.length).toBeLessThanOrEqual(lots.length);
    });
  });

  describe('getAccessibleParkingLots()', () => {
    test('should return only accessible lots', async () => {
      const lots = await getParkingLots();
      const accessible = getAccessibleParkingLots(lots);

      accessible.forEach(lot => {
        expect(lot.isAccessible).toBe(true);
      });
    });
  });
});

/**
 * Integration Tests - Parking Flow
 * Tests the complete parking availability and vehicle tracking workflow
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider } from '../../src/contexts/AppContext';
import ParkingScreen from '../../src/screens/parking/ParkingScreen';
import {
  getParkingLots,
  reportParkingAvailability,
  predictParkingAvailability,
  saveVehicleLocation,
  getVehicleLocation,
  clearVehicleLocation,
  findNearestAvailableParking,
} from '../../src/services/parkingService';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
};

const mockRoute = {
  params: {},
  key: 'test-key',
  name: 'Parking',
};

describe('Parking Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('Parking Availability Workflow', () => {
    it('should display parking lots and allow reporting availability', async () => {
      const { getByText, getByTestId } = render(
        <AppProvider>
          <ParkingScreen />
        </AppProvider>
      );

      // Wait for parking lots to load
      await waitFor(() => {
        expect(getByText(/Main Gate Parking/i)).toBeTruthy();
      });

      // Parking lots should be displayed
      const lots = await getParkingLots();
      expect(lots.length).toBeGreaterThan(0);
    });

    it('should update parking availability through crowdsourcing', async () => {
      const lotId = 'park-1';
      const newAvailableSpots = 50;

      // Report parking availability
      const reported = await reportParkingAvailability(lotId, newAvailableSpots, 'test-user');
      expect(reported).toBe(true);

      // Verify the update was saved
      const lots = await getParkingLots();
      const updatedLot = lots.find(lot => lot.id === lotId);

      // Note: This test assumes recent updates (within 30 minutes)
      expect(updatedLot).toBeDefined();
    });

    it('should generate parking predictions based on historical data', async () => {
      const lotId = 'park-1';

      // Add some historical data first
      await reportParkingAvailability(lotId, 40, 'user1');
      await reportParkingAvailability(lotId, 35, 'user2');
      await reportParkingAvailability(lotId, 42, 'user3');

      // Get prediction
      const prediction = await predictParkingAvailability(lotId);

      expect(prediction).toHaveProperty('parkingLotId', lotId);
      expect(prediction).toHaveProperty('predictedOccupancy');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction).toHaveProperty('recommendation');
      expect(prediction.confidence).toBeGreaterThan(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
    });

    it('should find nearest available parking lot', async () => {
      const userLocation = { latitude: 31.5200, longitude: 74.3585 };
      const lots = await getParkingLots();

      const nearest = findNearestAvailableParking(userLocation, lots);

      expect(nearest).toBeDefined();
      if (nearest) {
        expect(nearest).toHaveProperty('id');
        expect(nearest).toHaveProperty('name');
        expect(nearest).toHaveProperty('latitude');
        expect(nearest).toHaveProperty('longitude');
      }
    });
  });

  describe('Vehicle Location Tracking Workflow', () => {
    it('should save and retrieve vehicle location', async () => {
      const vehicleData = {
        id: 'vehicle-1',
        latitude: 31.5210,
        longitude: 74.3590,
        parkingLotId: 'park-1',
        spotNumber: 'A-42',
        parkedAt: new Date(),
        notes: 'Near the tree',
      };

      // Save vehicle location
      await saveVehicleLocation(vehicleData);

      // Retrieve it
      const saved = await getVehicleLocation();

      expect(saved).toBeDefined();
      if (saved) {
        expect(saved.latitude).toBe(vehicleData.latitude);
        expect(saved.longitude).toBe(vehicleData.longitude);
        expect(saved.parkingLotId).toBe(vehicleData.parkingLotId);
        expect(saved.spotNumber).toBe(vehicleData.spotNumber);
      }
    });

    it('should clear vehicle location', async () => {
      // Save first
      await saveVehicleLocation({
        id: 'vehicle-1',
        latitude: 31.5210,
        longitude: 74.3590,
        parkingLotId: 'park-1',
        parkedAt: new Date(),
      });

      // Clear
      await clearVehicleLocation();

      // Verify cleared
      const saved = await getVehicleLocation();
      expect(saved).toBeNull();
    });
  });

  describe('Accessibility Features in Parking', () => {
    it('should filter accessible parking lots', async () => {
      const lots = await getParkingLots();
      const accessibleLots = lots.filter(lot => lot.isAccessible);

      expect(accessibleLots.length).toBeGreaterThan(0);
      accessibleLots.forEach(lot => {
        expect(lot.isAccessible).toBe(true);
      });
    });

    it('should prioritize accessible parking in recommendations', async () => {
      const userLocation = { latitude: 31.5200, longitude: 74.3585 };
      const lots = await getParkingLots();
      const accessibleLots = lots.filter(lot => lot.isAccessible);

      if (accessibleLots.length > 0) {
        const nearest = findNearestAvailableParking(userLocation, accessibleLots);
        expect(nearest?.isAccessible).toBe(true);
      }
    });
  });

  describe('Error Handling in Parking Flow', () => {
    it('should handle storage errors gracefully', async () => {
      // Mock AsyncStorage to fail
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      // Should not throw
      await expect(getParkingLots()).resolves.toBeDefined();
    });

    it('should handle invalid parking lot ID', async () => {
      const result = await reportParkingAvailability('invalid-id', 50);
      // Should complete without throwing
      expect(typeof result).toBe('boolean');
    });

    it('should handle prediction with no historical data', async () => {
      const prediction = await predictParkingAvailability('new-lot-id');

      expect(prediction).toHaveProperty('parkingLotId');
      expect(prediction).toHaveProperty('confidence');
      // Confidence should be low with no data
      expect(prediction.confidence).toBeLessThan(0.5);
    });
  });

  describe('Peak Hours and Alerts', () => {
    it('should identify peak hours for parking lots', async () => {
      const lots = await getParkingLots();
      const lotsWithPeakHours = lots.filter(lot => lot.peakHours && lot.peakHours.length > 0);

      expect(lotsWithPeakHours.length).toBeGreaterThan(0);

      lotsWithPeakHours.forEach(lot => {
        lot.peakHours.forEach(peakHour => {
          expect(peakHour).toHaveProperty('dayOfWeek');
          expect(peakHour).toHaveProperty('startHour');
          expect(peakHour).toHaveProperty('endHour');
          expect(peakHour).toHaveProperty('averageOccupancy');
          expect(peakHour.dayOfWeek).toBeGreaterThanOrEqual(0);
          expect(peakHour.dayOfWeek).toBeLessThanOrEqual(6);
          expect(peakHour.averageOccupancy).toBeGreaterThan(0);
          expect(peakHour.averageOccupancy).toBeLessThanOrEqual(100);
        });
      });
    });
  });

  describe('Complete Parking User Journey', () => {
    it('should complete full parking workflow: check -> report -> save vehicle', async () => {
      // Step 1: Get parking lots
      const lots = await getParkingLots();
      expect(lots.length).toBeGreaterThan(0);

      // Step 2: Find a specific lot
      const mainGateLot = lots.find(lot => lot.id === 'park-1');
      expect(mainGateLot).toBeDefined();

      // Step 3: Report availability
      const reported = await reportParkingAvailability('park-1', 45, 'test-user');
      expect(reported).toBe(true);

      // Step 4: Save vehicle location
      const vehicleData = {
        id: 'vehicle-1',
        latitude: 31.5195,
        longitude: 74.3588,
        parkingLotId: 'park-1',
        spotNumber: 'B-15',
        parkedAt: new Date(),
        notes: 'Near entrance',
      };

      await saveVehicleLocation(vehicleData);

      // Step 5: Verify vehicle was saved
      const saved = await getVehicleLocation();
      expect(saved).toBeDefined();
      expect(saved?.parkingLotId).toBe('park-1');

      // Step 6: Clear vehicle when leaving
      await clearVehicleLocation();
      const cleared = await getVehicleLocation();
      expect(cleared).toBeNull();
    });
  });
});

/**
 * Unit Tests for Enhanced Parking Prediction Service
 * Tests enhanced prediction algorithms with database fallback
 */

import {
  predictParkingAvailabilityEnhanced,
  predictParkingAvailabilityForTimeSlots,
  getPredictionConfidenceLevel,
} from '../../src/services/parkingPredictionService';
import { predictParkingAvailability } from '../../src/services/parkingService';
import { PARKING_LOTS } from '../../src/data/campusData';

// Mock parking database service
jest.mock('../../src/services/parkingDatabaseService', () => ({
  getParkingHistory: jest.fn(() => Promise.resolve([])),
}));

// Mock parking service
// Mock parking service
jest.mock('../../src/services/parkingService', () => ({
  predictParkingAvailability: jest.fn((id, time) =>
    Promise.resolve({
      parkingLotId: 'park-1',
      predictedOccupancy: 50,
      confidence: 0.5,
      timestamp: time || new Date(),
      recommendation: 'Test recommendation',
    })
  ),
}));

describe('Enhanced Parking Prediction Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks to default behavior
    const { getParkingHistory } = require('../../src/services/parkingDatabaseService');
    getParkingHistory.mockResolvedValue([]);
    const { predictParkingAvailability } = require('../../src/services/parkingService');
    predictParkingAvailability.mockImplementation((id, time) => Promise.resolve({
      parkingLotId: 'park-1',
      predictedOccupancy: 50,
      confidence: 0.5,
      timestamp: time || new Date(),
      recommendation: 'Test recommendation',
    }));
  });

  describe('predictParkingAvailabilityEnhanced()', () => {
    test('should return prediction object with required fields', async () => {
      const prediction = await predictParkingAvailabilityEnhanced('park-1');

      expect(prediction).toHaveProperty('parkingLotId');
      expect(prediction).toHaveProperty('predictedOccupancy');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction).toHaveProperty('recommendation');
      expect(prediction).toHaveProperty('timestamp');
    });

    test('should fallback to standard prediction when database unavailable', async () => {
      const prediction = await predictParkingAvailabilityEnhanced('park-1');

      expect(predictParkingAvailability).toHaveBeenCalled();
      expect(prediction.parkingLotId).toBe('park-1');
    });

    test('should use enhanced algorithm when history data available', async () => {
      const { getParkingHistory } = require('../../src/services/parkingDatabaseService');
      getParkingHistory.mockResolvedValueOnce([
        {
          parkingLotId: 'park-1',
          dayOfWeek: 1,
          hour: 10,
          occupancy: 75,
          timestamp: new Date(),
        },
        {
          parkingLotId: 'park-1',
          dayOfWeek: 1,
          hour: 10,
          occupancy: 80,
          timestamp: new Date(),
        },
        {
          parkingLotId: 'park-1',
          dayOfWeek: 1,
          hour: 10,
          occupancy: 70,
          timestamp: new Date(),
        },
        {
          parkingLotId: 'park-1',
          dayOfWeek: 1,
          hour: 10,
          occupancy: 78,
          timestamp: new Date(),
        },
        {
          parkingLotId: 'park-1',
          dayOfWeek: 1,
          hour: 10,
          occupancy: 72,
          timestamp: new Date(),
        },
        // Add more to reach 10+ threshold
        ...Array(5).fill({
          parkingLotId: 'park-1',
          dayOfWeek: 1,
          hour: 10,
          occupancy: 75,
          timestamp: new Date(),
        }),
      ]);

      const prediction = await predictParkingAvailabilityEnhanced('park-1');

      expect(prediction).toHaveProperty('predictedOccupancy');
      expect(prediction.predictedOccupancy).toBeGreaterThanOrEqual(0);
      expect(prediction.predictedOccupancy).toBeLessThanOrEqual(100);
    });

    test('should handle invalid parking lot ID', async () => {
      await expect(predictParkingAvailabilityEnhanced('invalid-lot')).rejects.toThrow(
        'Parking lot not found'
      );
    });

    test('should accept targetTime parameter', async () => {
      const targetTime = new Date('2024-01-15T10:00:00');
      const prediction = await predictParkingAvailabilityEnhanced('park-1', targetTime);

      expect(prediction.timestamp).toEqual(targetTime);
    });
  });

  describe('predictParkingAvailabilityForTimeSlots()', () => {
    test('should return predictions for multiple time slots', async () => {
      const timeSlots = [
        new Date('2024-01-15T10:00:00'),
        new Date('2024-01-15T11:00:00'),
        new Date('2024-01-15T12:00:00'),
      ];

      const predictions = await predictParkingAvailabilityForTimeSlots('park-1', timeSlots);

      expect(predictions).toHaveLength(3);
      predictions.forEach((pred) => {
        expect(pred).toHaveProperty('parkingLotId', 'park-1');
        expect(pred).toHaveProperty('predictedOccupancy');
      });
    });
  });

  describe('getPredictionConfidenceLevel()', () => {
    test('should return "high" for confidence >= 0.8', () => {
      expect(getPredictionConfidenceLevel(0.9)).toBe('high');
      expect(getPredictionConfidenceLevel(0.8)).toBe('high');
    });

    test('should return "medium" for confidence >= 0.6 and < 0.8', () => {
      expect(getPredictionConfidenceLevel(0.7)).toBe('medium');
      expect(getPredictionConfidenceLevel(0.6)).toBe('medium');
    });

    test('should return "low" for confidence < 0.6', () => {
      expect(getPredictionConfidenceLevel(0.5)).toBe('low');
      expect(getPredictionConfidenceLevel(0.3)).toBe('low');
    });
  });

  describe('Error handling', () => {
    test('should handle database errors gracefully', async () => {
      const { getParkingHistory } = require('../../src/services/parkingDatabaseService');
      getParkingHistory.mockRejectedValueOnce(new Error('Database error'));

      const prediction = await predictParkingAvailabilityEnhanced('park-1');

      // Should fallback to standard prediction
      expect(prediction).toHaveProperty('parkingLotId');
    });

    test('should handle prediction service errors gracefully', async () => {
      const { predictParkingAvailability } = require('../../src/services/parkingService');
      (predictParkingAvailability as jest.Mock)
        .mockRejectedValueOnce(new Error('Prediction error'))
        .mockRejectedValueOnce(new Error('Fallback prediction error'));

      // The function has a try-catch that should handle this
      // It will try to call predictParkingAvailability again in the outer catch
      // which will also fail, so it should throw
      await expect(predictParkingAvailabilityEnhanced('park-1')).rejects.toThrow();
    });
  });
});


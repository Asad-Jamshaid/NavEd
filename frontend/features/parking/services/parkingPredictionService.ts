// ==========================================
// Enhanced Parking Prediction Service
// Uses database historical data for better predictions
// Falls back to existing prediction logic if database unavailable
// ==========================================

import { ParkingPrediction } from '../../../shared/types';
import { PARKING_LOTS } from '../../../shared/data/campusData';
import { getParkingHistory } from './parkingDatabaseService';
import { predictParkingAvailability } from './parkingService';

/**
 * Enhanced prediction using database historical data
 * Falls back to existing prediction if database unavailable
 */
export async function predictParkingAvailabilityEnhanced(
  parkingLotId: string,
  targetTime?: Date
): Promise<ParkingPrediction> {
  const lot = PARKING_LOTS.find((l) => l.id === parkingLotId);
  if (!lot) {
    throw new Error('Parking lot not found');
  }

  const now = targetTime || new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();

  try {
    // Try to get enhanced prediction from database
    try {
      // Get historical data from database (broader time window for better accuracy)
      const history = await getParkingHistory(parkingLotId, dayOfWeek, hour);

      if (history.length >= 10) {
        // We have enough data for enhanced prediction
        // Use weighted average based on recency
        const sortedHistory = history.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );

        // Weight recent data more heavily
        let totalWeight = 0;
        let weightedSum = 0;

        sortedHistory.slice(0, 50).forEach((point, index) => {
          const recencyWeight = 1 / (index + 1); // More recent = higher weight
          const timeProximityWeight = Math.abs(point.hour - hour) <= 1 ? 1 : 0.5;
          const weight = recencyWeight * timeProximityWeight;

          weightedSum += point.occupancy * weight;
          totalWeight += weight;
        });

        const predictedOccupancy = totalWeight > 0 ? weightedSum / totalWeight : 50;
        const confidence = Math.min(0.95, 0.6 + Math.min(history.length / 100, 0.35));

        // Consider trend (increasing or decreasing)
        const recentPoints = sortedHistory.slice(0, 10);
        const olderPoints = sortedHistory.slice(10, 20);
        
        let trendAdjustment = 0;
        if (recentPoints.length >= 5 && olderPoints.length >= 5) {
          const recentAvg = recentPoints.reduce((sum, p) => sum + p.occupancy, 0) / recentPoints.length;
          const olderAvg = olderPoints.reduce((sum, p) => sum + p.occupancy, 0) / olderPoints.length;
          trendAdjustment = (recentAvg - olderAvg) * 0.3; // 30% of trend
        }

        const finalOccupancy = Math.max(0, Math.min(100, predictedOccupancy + trendAdjustment));

        return {
          parkingLotId,
          predictedOccupancy: Math.round(finalOccupancy),
          confidence,
          timestamp: now,
          recommendation: generateEnhancedRecommendation(finalOccupancy, lot.name, confidence),
        };
      }
    } catch (dbError) {
      console.log('Enhanced prediction unavailable, using standard prediction');
    }

    // Fallback to existing prediction logic
    return await predictParkingAvailability(parkingLotId, targetTime);
  } catch (error) {
    console.error('Error in enhanced prediction:', error);
    // Fallback to existing prediction - if this also fails, let it throw
    try {
      return await predictParkingAvailability(parkingLotId, targetTime);
    } catch (fallbackError) {
      // If fallback also fails, throw the original error
      throw error;
    }
  }
}

/**
 * Predict parking availability for multiple time slots
 */
export async function predictParkingAvailabilityForTimeSlots(
  parkingLotId: string,
  timeSlots: Date[]
): Promise<ParkingPrediction[]> {
  const predictions = await Promise.all(
    timeSlots.map((time) => predictParkingAvailabilityEnhanced(parkingLotId, time))
  );
  return predictions;
}

/**
 * Get prediction confidence level
 */
export function getPredictionConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.6) return 'medium';
  return 'low';
}

/**
 * Generate enhanced recommendation with confidence level
 */
function generateEnhancedRecommendation(
  occupancy: number,
  lotName: string,
  confidence: number
): string {
  const confidenceLevel = getPredictionConfidenceLevel(confidence);
  const confidenceNote =
    confidenceLevel === 'high'
      ? ' (High confidence)'
      : confidenceLevel === 'medium'
      ? ' (Medium confidence)'
      : ' (Low confidence - check real-time updates)';

  if (occupancy >= 95) {
    return `${lotName} is expected to be full${confidenceNote}. Consider alternative parking.`;
  } else if (occupancy >= 80) {
    return `${lotName} is filling up${confidenceNote}. Arrive early to secure a spot.`;
  } else if (occupancy >= 60) {
    return `${lotName} has moderate availability${confidenceNote}. Good time to park.`;
  } else {
    return `${lotName} has plenty of available spots${confidenceNote}.`;
  }
}


// ==========================================
// Parking Database Service
// Handles parking-related database operations with AsyncStorage fallback
// ==========================================

import { getSupabaseClient, safeDbOperation, isSupabaseAvailable } from '../../../shared/services/databaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParkingLot, ParkedVehicle } from '../../../shared/types';
import { PARKING_LOTS } from '../../../shared/data/campusData';
import { RealtimeChannel } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  PARKING_UPDATES: '@naved_parking_updates',
  PARKING_HISTORY: '@naved_parking_history',
  USER_VEHICLE: '@naved_user_vehicle',
};

// ==========================================
// Parking Updates (Crowdsourced)
// ==========================================

interface ParkingUpdate {
  parkingLotId: string;
  availableSpots: number;
  reportedBy: string;
  timestamp: Date;
  confidence: number;
}

/**
 * Report parking availability to database
 * Falls back to AsyncStorage if database unavailable
 */
export async function reportParkingAvailability(
  parkingLotId: string,
  availableSpots: number,
  userId?: string
): Promise<boolean> {
  return await safeDbOperation(
    async (supabase) => {
      const { error } = await supabase.from('parking_updates').insert({
        parking_lot_id: parkingLotId,
        available_spots: availableSpots,
        reported_by: userId || null,
        confidence: 0.8,
      });

      if (error) throw error;

      // Also save to history
      const lot = PARKING_LOTS.find((l) => l.id === parkingLotId);
      if (lot) {
        const now = new Date();
        // Validate and clamp inputs before calculating occupancy
        const totalSpots = Math.max(1, lot.totalSpots); // Ensure > 0
        const clampedSpots = Math.max(0, Math.min(availableSpots, totalSpots));
        const occupancy = ((totalSpots - clampedSpots) / totalSpots) * 100;

        const { error: historyError } = await supabase.from('parking_history').insert({
          parking_lot_id: parkingLotId,
          day_of_week: now.getDay(),
          hour: now.getHours(),
          occupancy: occupancy,
        });
        
        if (historyError) {
          console.error('Error saving parking history:', historyError);
        }
      }

      return true;
    },
    async () => {
      // Fallback to AsyncStorage
      try {
        const updatesJson = await AsyncStorage.getItem(STORAGE_KEYS.PARKING_UPDATES);
        const updates: ParkingUpdate[] = updatesJson ? JSON.parse(updatesJson) : [];

        const newUpdate: ParkingUpdate = {
          parkingLotId,
          availableSpots,
          reportedBy: userId || 'anonymous',
          timestamp: new Date(),
          confidence: 0.8,
        };

        const updatedList = [newUpdate, ...updates].slice(0, 100);
        await AsyncStorage.setItem(STORAGE_KEYS.PARKING_UPDATES, JSON.stringify(updatedList));

        // Save to history
        const lot = PARKING_LOTS.find((l) => l.id === parkingLotId);
        if (lot) {
          const now = new Date();
          // Validate and clamp inputs before calculating occupancy
          const totalSpots = Math.max(1, lot.totalSpots); // Ensure > 0
          const clampedSpots = Math.max(0, Math.min(availableSpots, totalSpots));
          const occupancy = ((totalSpots - clampedSpots) / totalSpots) * 100;

          const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.PARKING_HISTORY);
          const history: any[] = historyJson ? JSON.parse(historyJson) : [];

          history.unshift({
            parkingLotId,
            dayOfWeek: now.getDay(),
            hour: now.getHours(),
            occupancy,
            timestamp: now,
          });

          await AsyncStorage.setItem(
            STORAGE_KEYS.PARKING_HISTORY,
            JSON.stringify(history.slice(0, 1000))
          );
        }

        return true;
      } catch (error) {
        console.error('Error saving parking update to AsyncStorage:', error);
        return false;
      }
    }
  );
}

/**
 * Get recent parking updates from database
 * Falls back to AsyncStorage if database unavailable
 */
export async function getRecentParkingUpdates(
  parkingLotId?: string,
  minutes: number = 30
): Promise<ParkingUpdate[]> {
  return safeDbOperation(
    async (supabase) => {
      let query = supabase
        .from('parking_updates')
        .select('*')
        .gte('created_at', new Date(Date.now() - minutes * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (parkingLotId) {
        query = query.eq('parking_lot_id', parkingLotId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (
        data?.map((update) => ({
          parkingLotId: update.parking_lot_id,
          availableSpots: update.available_spots,
          reportedBy: update.reported_by || 'anonymous',
          timestamp: new Date(update.created_at),
          confidence: update.confidence || 0.8,
        })) || []
      );
    },
    async () => {
      // Fallback to AsyncStorage
      try {
        const updatesJson = await AsyncStorage.getItem(STORAGE_KEYS.PARKING_UPDATES);
        const updates: ParkingUpdate[] = updatesJson ? JSON.parse(updatesJson) : [];

        const cutoffTime = Date.now() - minutes * 60 * 1000;
        let filtered = updates.filter((u) => new Date(u.timestamp).getTime() > cutoffTime);

        if (parkingLotId) {
          filtered = filtered.filter((u) => u.parkingLotId === parkingLotId);
        }

        return filtered.slice(0, 100);
      } catch (error) {
        console.error('Error getting parking updates from AsyncStorage:', error);
        return [];
      }
    }
  );
}

// ==========================================
// Parking History (for predictions)
// ==========================================

interface HistoricalDataPoint {
  parkingLotId: string;
  dayOfWeek: number;
  hour: number;
  occupancy: number;
  timestamp: Date;
}

/**
 * Get parking history for predictions
 * Falls back to AsyncStorage if database unavailable
 */
export async function getParkingHistory(
  parkingLotId: string,
  dayOfWeek?: number,
  hour?: number
): Promise<HistoricalDataPoint[]> {
  return safeDbOperation(
    async (supabase) => {
      let query = supabase
        .from('parking_history')
        .select('*')
        .eq('parking_lot_id', parkingLotId)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (dayOfWeek !== undefined) {
        query = query.eq('day_of_week', dayOfWeek);
      }

      if (hour !== undefined) {
        query = query.eq('hour', hour);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (
        data?.map((point) => ({
          parkingLotId: point.parking_lot_id,
          dayOfWeek: point.day_of_week,
          hour: point.hour,
          occupancy: point.occupancy,
          timestamp: new Date(point.created_at),
        })) || []
      );
    },
    async () => {
      // Fallback to AsyncStorage
      try {
        const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.PARKING_HISTORY);
        const history: HistoricalDataPoint[] = historyJson ? JSON.parse(historyJson) : [];

        let filtered = history.filter((h) => h.parkingLotId === parkingLotId);

        if (dayOfWeek !== undefined) {
          filtered = filtered.filter((h) => h.dayOfWeek === dayOfWeek);
        }

        if (hour !== undefined) {
          filtered = filtered.filter((h) => h.hour === hour);
        }

        return filtered.slice(0, 1000);
      } catch (error) {
        console.error('Error getting parking history from AsyncStorage:', error);
        return [];
      }
    }
  );
}

// ==========================================
// Parked Vehicles
// ==========================================

/**
 * Save parked vehicle to database
 * Falls back to AsyncStorage if database unavailable
 */
export async function saveParkedVehicleToDb(vehicle: ParkedVehicle, userId?: string): Promise<boolean> {
  // Validate userId at the top - both paths need it
  if (!userId) {
    throw new Error('User ID required for database storage');
  }
  
  return safeDbOperation(
    async (supabase) => {

      const { error } = await supabase.from('parked_vehicles').insert({
        user_id: userId,
        parking_lot_id: vehicle.parkingLotId,
        spot_number: vehicle.spotNumber || null,
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        photo_uri: vehicle.photoUri || null,
        notes: vehicle.notes || null,
        parked_at: vehicle.parkedAt.toISOString(),
      });

      if (error) throw error;
      return true;
    },
    async () => {
      // Fallback to AsyncStorage
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_VEHICLE, JSON.stringify(vehicle));
        return true;
      } catch (error) {
        console.error('Error saving parked vehicle to AsyncStorage:', error);
        return false;
      }
    }
  );
}

/**
 * Get parked vehicle from database
 * Falls back to AsyncStorage if database unavailable
 */
export async function getParkedVehicleFromDb(userId?: string): Promise<ParkedVehicle | null> {
  // Early return if userId is missing - both paths need it
  if (!userId) {
    return null;
  }
  
  return safeDbOperation(
    async (supabase) => {

      const { data, error } = await supabase
        .from('parked_vehicles')
        .select('*')
        .eq('user_id', userId)
        .order('parked_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        parkingLotId: data.parking_lot_id,
        spotNumber: data.spot_number || undefined,
        parkedAt: new Date(data.parked_at),
        photoUri: data.photo_uri || undefined,
        notes: data.notes || undefined,
        latitude: data.latitude,
        longitude: data.longitude,
      };
    },
    async () => {
      // Fallback to AsyncStorage
      try {
        const vehicleJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_VEHICLE);
        if (!vehicleJson) return null;

        const vehicle = JSON.parse(vehicleJson);
        // Ensure dates are Date objects
        if (vehicle.parkedAt) {
          vehicle.parkedAt = new Date(vehicle.parkedAt);
        }
        return vehicle;
      } catch (error) {
        console.error('Error getting parked vehicle from AsyncStorage:', error);
        return null;
      }
    }
  );
}

/**
 * Clear parked vehicle from database
 * Falls back to AsyncStorage if database unavailable
 */
export async function clearParkedVehicleFromDb(userId?: string): Promise<boolean> {
  return safeDbOperation(
    async (supabase) => {
      if (!userId) {
        return true; // No-op if no user
      }

      const { error } = await supabase.from('parked_vehicles').delete().eq('user_id', userId);

      if (error) throw error;
      return true;
    },
    async () => {
      // Fallback to AsyncStorage
      try {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_VEHICLE);
        return true;
      } catch (error) {
        console.error('Error clearing parked vehicle from AsyncStorage:', error);
        return false;
      }
    }
  );
}

// ==========================================
// Realtime Subscriptions
// ==========================================

let parkingUpdatesChannel: RealtimeChannel | null = null;
const parkingUpdateCallbacks = new Set<(update: ParkingUpdate) => void>();

/**
 * Subscribe to real-time parking updates
 * @param callback Function to call when updates are received
 * @returns Unsubscribe function
 */
export function subscribeToParkingUpdates(
  callback: (update: ParkingUpdate) => void
): (() => void) | null {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return null;
    }

    // Add callback to set
    parkingUpdateCallbacks.add(callback);

    // Create channel only if it doesn't exist
    if (!parkingUpdatesChannel) {
      parkingUpdatesChannel = supabase
        .channel('parking_updates_channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'parking_updates',
          },
          (payload) => {
            const update = payload.new as any;
            const updateData = {
              parkingLotId: update.parking_lot_id,
              availableSpots: update.available_spots,
              reportedBy: update.reported_by || 'anonymous',
              timestamp: new Date(update.created_at),
              confidence: update.confidence || 0.8,
            };
            // Invoke all callbacks
            parkingUpdateCallbacks.forEach(cb => cb(updateData));
          }
        )
        .subscribe();
    }

    // Return unsubscribe function
    return () => {
      parkingUpdateCallbacks.delete(callback);
      // Only remove channel if no callbacks remain
      if (parkingUpdateCallbacks.size === 0 && parkingUpdatesChannel && supabase) {
        supabase.removeChannel(parkingUpdatesChannel);
        parkingUpdatesChannel = null;
      }
    };
  } catch (error) {
    console.error('Error subscribing to parking updates:', error);
    return null;
  }
}

/**
 * Unsubscribe from parking updates
 */
export function unsubscribeFromParkingUpdates() {
  if (parkingUpdatesChannel) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.removeChannel(parkingUpdatesChannel);
      }
      parkingUpdatesChannel = null;
    } catch (error) {
      console.error('Error unsubscribing from parking updates:', error);
    }
  }
}


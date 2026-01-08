import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserPreferences, ParkedVehicle, Document, ParkingAlert } from '../types';
import { getSupabaseClient, isSupabaseAvailable } from '../services/databaseService';
import { getParkedVehicleFromDb, saveParkedVehicleToDb, clearParkedVehicleFromDb } from '../../features/parking/services/parkingDatabaseService';

// ==========================================
// App State Types
// ==========================================
interface AppState {
  user: User | null;
  isLoading: boolean;
  parkedVehicle: ParkedVehicle | null;
  documents: Document[];
  parkingAlerts: ParkingAlert[];
  isAccessibilityMode: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PARKED_VEHICLE'; payload: ParkedVehicle | null }
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'REMOVE_DOCUMENT'; payload: string }
  | { type: 'SET_PARKING_ALERTS'; payload: ParkingAlert[] }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'TOGGLE_ACCESSIBILITY'; payload: boolean }
  | { type: 'RESET_STATE' };

// ==========================================
// Initial State
// ==========================================
const defaultPreferences: UserPreferences = {
  accessibilityMode: false,
  highContrast: false,
  fontSize: 'medium',
  voiceGuidance: false,
  hapticFeedback: true,
  preferredLanguage: 'en',
  darkMode: false,
};

const initialState: AppState = {
  user: {
    id: 'local-user',
    preferences: defaultPreferences,
  },
  isLoading: true,
  parkedVehicle: null,
  documents: [],
  parkingAlerts: [],
  isAccessibilityMode: false,
};

// ==========================================
// Reducer
// ==========================================
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_PARKED_VEHICLE':
      return { ...state, parkedVehicle: action.payload };
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload };
    case 'ADD_DOCUMENT':
      return { ...state, documents: [...state.documents, action.payload] };
    case 'REMOVE_DOCUMENT':
      return { ...state, documents: state.documents.filter(d => d.id !== action.payload) };
    case 'SET_PARKING_ALERTS':
      return { ...state, parkingAlerts: action.payload };
    case 'UPDATE_PREFERENCES':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          preferences: { ...state.user.preferences, ...action.payload },
        },
      };
    case 'TOGGLE_ACCESSIBILITY':
      return { ...state, isAccessibilityMode: action.payload };
    case 'RESET_STATE':
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
}

// ==========================================
// Context
// ==========================================
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  saveParkedVehicle: (vehicle: ParkedVehicle | null) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  addDocument: (doc: Document) => Promise<void>;
  removeDocument: (docId: string) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ==========================================
// Provider
// ==========================================
const STORAGE_KEYS = {
  USER: '@naved_user',
  PARKED_VEHICLE: '@naved_parked_vehicle',
  DOCUMENTS: '@naved_documents',
  PARKING_ALERTS: '@naved_parking_alerts',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted data on mount
  useEffect(() => {
    loadPersistedData();
  }, []);

  const loadPersistedData = async () => {
    try {
      // Try to load user profile from database if available
      let user: User | null = null;
      let parkedVehicle: ParkedVehicle | null = null;

      if (isSupabaseAvailable()) {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
              // Try to load user profile from database
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

              if (profile) {
                const defaultPreferences: UserPreferences = {
                  accessibilityMode: false,
                  highContrast: false,
                  fontSize: 'medium',
                  voiceGuidance: false,
                  hapticFeedback: true,
                  preferredLanguage: 'en',
                  darkMode: false,
                };
                user = {
                  id: profile.id,
                  email: profile.email,
                  name: profile.name,
                  preferences: profile.preferences || defaultPreferences,
                };
              }

              // Try to load parked vehicle from database
              parkedVehicle = await getParkedVehicleFromDb(authUser.id);
            }
          }
        } catch (dbError) {
          console.error('Database unavailable, using AsyncStorage fallback:', dbError);
        }
      }

      // Fallback to AsyncStorage (existing behavior)
      const [userJson, vehicleJson, docsJson, alertsJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        !parkedVehicle ? AsyncStorage.getItem(STORAGE_KEYS.PARKED_VEHICLE) : Promise.resolve(null),
        AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS),
        AsyncStorage.getItem(STORAGE_KEYS.PARKING_ALERTS),
      ]);

      if (!user && userJson) {
        user = JSON.parse(userJson);
      }
      if (!parkedVehicle && vehicleJson) {
        parkedVehicle = JSON.parse(vehicleJson);
      }

      if (user) {
        dispatch({ type: 'SET_USER', payload: user });
      }
      if (parkedVehicle) {
        dispatch({ type: 'SET_PARKED_VEHICLE', payload: parkedVehicle });
      }
      if (docsJson) {
        dispatch({ type: 'SET_DOCUMENTS', payload: JSON.parse(docsJson) });
      }
      if (alertsJson) {
        dispatch({ type: 'SET_PARKING_ALERTS', payload: JSON.parse(alertsJson) });
      }
    } catch (error) {
      console.error('Error loading persisted data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveParkedVehicle = async (vehicle: ParkedVehicle | null) => {
    try {
      // Try to save to database if available and user is authenticated
      if (isSupabaseAvailable()) {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser && vehicle) {
              await saveParkedVehicleToDb(vehicle, authUser.id);
            } else if (authUser && !vehicle) {
              await clearParkedVehicleFromDb(authUser.id);
            }
          }
        } catch (dbError) {
          console.error('Database unavailable, using AsyncStorage fallback:', dbError);
        }
      }

      // Always save to AsyncStorage as backup (existing behavior)
      if (vehicle) {
        await AsyncStorage.setItem(STORAGE_KEYS.PARKED_VEHICLE, JSON.stringify(vehicle));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.PARKED_VEHICLE);
      }
      dispatch({ type: 'SET_PARKED_VEHICLE', payload: vehicle });
    } catch (error) {
      console.error('Error saving parked vehicle:', error);
    }
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    try {
      dispatch({ type: 'UPDATE_PREFERENCES', payload: prefs });
      const updatedUser = {
        ...state.user,
        preferences: { ...state.user?.preferences, ...prefs },
      };

      // Try to save to database if available and user is authenticated
      if (isSupabaseAvailable()) {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
              await supabase
                .from('user_profiles')
                .update({ preferences: updatedUser.preferences })
                .eq('id', authUser.id);
            }
          }
        } catch (dbError) {
          console.error('Database unavailable, using AsyncStorage fallback:', dbError);
        }
      }

      // Always save to AsyncStorage as backup (existing behavior)
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

      // Update accessibility mode if changed
      if (prefs.accessibilityMode !== undefined) {
        dispatch({ type: 'TOGGLE_ACCESSIBILITY', payload: prefs.accessibilityMode });
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const addDocument = async (doc: Document) => {
    try {
      dispatch({ type: 'ADD_DOCUMENT', payload: doc });
      const updatedDocs = [...state.documents, doc];
      await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updatedDocs));
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };

  const removeDocument = async (docId: string) => {
    try {
      dispatch({ type: 'REMOVE_DOCUMENT', payload: docId });
      const updatedDocs = state.documents.filter(d => d.id !== docId);
      await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updatedDocs));
    } catch (error) {
      console.error('Error removing document:', error);
    }
  };

  const clearAllData = async () => {
    try {
      // Clear all storage keys
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.PARKED_VEHICLE,
        STORAGE_KEYS.DOCUMENTS,
        STORAGE_KEYS.PARKING_ALERTS,
        '@naved_theme_mode',
        '@naved_font_scale',
        '@naved_high_contrast',
        '@naved_accessibility_settings',
        '@naved_chat_history',
        '@naved_api_keys',
      ]);
      // Reset state to initial
      dispatch({ type: 'RESET_STATE' });
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        saveParkedVehicle,
        updatePreferences,
        addDocument,
        removeDocument,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

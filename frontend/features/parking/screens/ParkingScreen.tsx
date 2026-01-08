// ==========================================
// Parking Screen - Modern Minimal Design
// Crowdsourced & Predictive - NO IoT sensors!
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  Platform,
  Linking,
  Animated,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import AccessibleButton from '../../../shared/components/common/AccessibleButton';
import Card, { SimpleCard } from '../../../shared/components/common/Card';
import EmptyState from '../../../shared/components/common/EmptyState';
import { CardSkeleton } from '../../../shared/components/common/LoadingSkeleton';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useApp } from '../../../shared/contexts/AppContext';
import { ParkingLot, ParkedVehicle, ParkingPrediction } from '../../../shared/types';
import { getParkingStatus } from '../../../shared/data/campusData';
import {
  getParkingLots,
  reportParkingAvailability,
  predictParkingAvailability,
  saveVehicleLocation,
  getVehicleLocation,
  clearVehicleLocation,
  findNearestAvailableParking,
} from '../services/parkingService';
import { predictParkingAvailabilityEnhanced } from '../services/parkingPredictionService';
import { subscribeToParkingUpdates, unsubscribeFromParkingUpdates } from '../services/parkingDatabaseService';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { speak, triggerHaptic } from '../../../shared/services/accessibilityService';

// ==========================================
// PARKING SCREEN
// ==========================================

export default function ParkingScreen() {
  const { theme } = useTheme();
  const { state, saveParkedVehicle } = useApp();
  const { user: authUser } = useAuth();
  const insets = useSafeAreaInsets();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [parkedVehicle, setParkedVehicle] = useState<ParkedVehicle | null>(null);
  const [predictions, setPredictions] = useState<Record<string, ParkingPrediction>>({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [showParkModal, setShowParkModal] = useState(false);
  const [reportSpots, setReportSpots] = useState('');
  const [spotNumber, setSpotNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [filterAccessible, setFilterAccessible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const accessibilityMode = state.user?.preferences.accessibilityMode;
  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 16) : 0;

  // Load data
  useEffect(() => {
    loadData();
    loadUserLocation();
    
    // Subscribe to real-time parking updates if available
    const unsubscribe = subscribeToParkingUpdates((update) => {
      // Refresh parking lots when update received
      loadData();
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      unsubscribeFromParkingUpdates();
    };
  }, [authUser?.id]);

  const loadData = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ParkingScreen.tsx:98',message:'loadData started',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'PRED'})}).catch(()=>{});
    // #endregion
    try {
      setIsLoading(true);
      const lots = await getParkingLots();
      setParkingLots(lots);

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ParkingScreen.tsx:101',message:'parking lots loaded',data:{lotCount:lots.length,lotIds:lots.map(l=>l.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'PRED'})}).catch(()=>{});
      // #endregion

      // Load predictions - try enhanced first, fallback to standard
      const predPromises = lots.map(async (lot) => {
        try {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ParkingScreen.tsx:108',message:'loading prediction for lot',data:{lotId:lot.id},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'PRED'})}).catch(()=>{});
          // #endregion
          // Try enhanced prediction first
          const pred = await predictParkingAvailabilityEnhanced(lot.id);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ParkingScreen.tsx:111',message:'enhanced prediction received',data:{lotId:lot.id,occupancy:pred.predictedOccupancy,confidence:pred.confidence,hasRecommendation:!!pred.recommendation},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'PRED'})}).catch(()=>{});
          // #endregion
          return pred;
        } catch (error) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ParkingScreen.tsx:114',message:'enhanced prediction failed, using fallback',data:{lotId:lot.id,error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'PRED'})}).catch(()=>{});
          // #endregion
          // Fallback to standard prediction (existing behavior)
          const pred = await predictParkingAvailability(lot.id);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ParkingScreen.tsx:117',message:'fallback prediction received',data:{lotId:lot.id,occupancy:pred.predictedOccupancy,confidence:pred.confidence},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'PRED'})}).catch(()=>{});
          // #endregion
          return pred;
        }
      });
      const preds = await Promise.all(predPromises);
      const predMap: Record<string, ParkingPrediction> = {};
      preds.forEach(pred => {
        predMap[pred.parkingLotId] = pred;
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ParkingScreen.tsx:119',message:'predictions map created',data:{predictionCount:Object.keys(predMap).length,predictionIds:Object.keys(predMap),highConfidenceCount:preds.filter(p=>p.confidence>0.5).length},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'PRED'})}).catch(()=>{});
      // #endregion
      setPredictions(predMap);

      // Load parked vehicle - try database first if user authenticated
      const vehicle = await getVehicleLocation(authUser?.id);
      setParkedVehicle(vehicle);
      if (vehicle) {
        saveParkedVehicle(vehicle);
      }
    } catch (error) {
      console.error('Error loading parking data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    triggerHaptic('light');
  };

  // Navigate to vehicle location using maps app
  const handleNavigateToVehicle = useCallback(async () => {
    if (!parkedVehicle) return;

    setIsNavigating(true);
    triggerHaptic('medium');

    if (accessibilityMode) {
      speak('Opening navigation to your parked vehicle');
    }

    try {
      const { latitude, longitude } = parkedVehicle;
      const lot = parkingLots.find(l => l.id === parkedVehicle.parkingLotId);
      const label = lot ? `My Car at ${lot.name}` : 'My Parked Car';

      // Create maps URL (works on both iOS and Android)
      let url: string;
      if (Platform.OS === 'ios') {
        url = `maps:0,0?q=${label}@${latitude},${longitude}`;
      } else {
        url = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(label)})`;
      }

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback to Google Maps web URL
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('Error opening navigation:', error);
      Alert.alert('Navigation Error', 'Could not open maps application.');
    } finally {
      setIsNavigating(false);
    }
  }, [parkedVehicle, parkingLots, accessibilityMode]);

  // Navigate to parking lot - with accessible route option
  const handleNavigateToLot = useCallback(async (lot: ParkingLot) => {
    triggerHaptic('medium');

    if (accessibilityMode) {
      speak(`Opening navigation to ${lot.name}${lot.isAccessible ? ' using accessible route' : ''}`);
    }

    try {
      const { latitude, longitude } = lot;
      const label = lot.isAccessible ? `${lot.name} (Accessible)` : lot.name;

      let url: string;
      if (Platform.OS === 'ios') {
        url = `maps:0,0?q=${label}@${latitude},${longitude}`;
      } else {
        url = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(label)})`;
      }

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert('Navigation Error', 'Could not open maps application.');
    }
  }, [accessibilityMode]);

  // Report parking availability
  const handleReport = async () => {
    if (!selectedLot || !reportSpots) return;

    const spots = parseInt(reportSpots);
    if (isNaN(spots) || spots < 0 || spots > selectedLot.totalSpots) {
      Alert.alert('Invalid Input', 'Please enter a valid number of spots.');
      return;
    }

    const success = await reportParkingAvailability(selectedLot.id, spots, authUser?.id || 'anonymous');
    if (success) {
      triggerHaptic('success');
      Alert.alert('Thank You!', 'Your parking report helps the community.');
      setShowReportModal(false);
      setReportSpots('');
      loadData();

      if (accessibilityMode) {
        speak('Thank you for reporting parking availability');
      }
    }
  };

  // Save vehicle location
  const handleParkVehicle = async () => {
    if (!selectedLot || !userLocation) return;

    const vehicle: ParkedVehicle = {
      id: `vehicle-${Date.now()}`,
      parkingLotId: selectedLot.id,
      spotNumber: spotNumber || undefined,
      parkedAt: new Date(),
      notes: notes || undefined,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    };

    await saveVehicleLocation(vehicle, authUser?.id);
    setParkedVehicle(vehicle);
    saveParkedVehicle(vehicle);

    // Decrease available spots when parking
    const newAvailableSpots = Math.max(0, selectedLot.availableSpots - 1);
    await reportParkingAvailability(selectedLot.id, newAvailableSpots, authUser?.id || 'anonymous');

    // Refresh data to show updated count
    loadData();

    setShowParkModal(false);
    setSpotNumber('');
    setNotes('');
    triggerHaptic('success');

    if (accessibilityMode) {
      speak(`Vehicle parked at ${selectedLot.name}${spotNumber ? `, spot ${spotNumber}` : ''}`);
    }
  };

  // Clear parked vehicle
  const handleClearVehicle = async () => {
    Alert.alert(
      'Clear Parked Vehicle',
      'Are you sure you want to clear your parked vehicle location?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            // Increase available spots when leaving (if we know the lot)
            if (parkedVehicle?.parkingLotId) {
              const lot = parkingLots.find(l => l.id === parkedVehicle.parkingLotId);
              if (lot) {
                const newAvailableSpots = Math.min(lot.totalSpots, lot.availableSpots + 1);
                await reportParkingAvailability(lot.id, newAvailableSpots, authUser?.id || 'anonymous');
              }
            }

            await clearVehicleLocation(authUser?.id);
            setParkedVehicle(null);
            saveParkedVehicle(null);
            triggerHaptic('medium');

            // Refresh data to show updated count
            loadData();
          },
        },
      ]
    );
  };

  // Find nearest parking
  const handleFindNearest = () => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location to find nearest parking.');
      return;
    }

    const nearest = findNearestAvailableParking(userLocation, parkingLots);
    if (nearest) {
      setSelectedLot(nearest);
      triggerHaptic('medium');
      if (accessibilityMode) {
        speak(`Nearest available parking is ${nearest.name} with ${nearest.availableSpots} spots`);
      }
    } else {
      Alert.alert('No Parking Available', 'All parking lots are currently full.');
    }
  };

  // Get status color and info
  const getStatusInfo = (lot: ParkingLot) => {
    const occupancy = ((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100;

    let color = theme.colors.success;
    let label = 'Available';

    if (occupancy > 90) {
      color = theme.colors.error;
      label = 'Full';
    } else if (occupancy > 70) {
      color = theme.colors.warning;
      label = 'Filling Up';
    }

    return { color, label, occupancy };
  };

  // Filter lots - show only lots with dedicated disabled parking spots
  const filteredLots = filterAccessible
    ? parkingLots.filter(lot => (lot.disabledParkingSpots || 0) > 0)
    : parkingLots;

  // Time since parked
  const getTimeSinceParked = () => {
    if (!parkedVehicle) return '';
    const parkedTime = new Date(parkedVehicle.parkedAt);
    const now = new Date();
    const diffMs = now.getTime() - parkedTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header Actions */}
      <View style={[styles.headerActions, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: filterAccessible ? theme.colors.primary : 'transparent',
              borderColor: theme.colors.primary,
              borderRadius: theme.borderRadius.full,
            },
          ]}
          onPress={() => {
            setFilterAccessible(!filterAccessible);
            triggerHaptic('light');
          }}
          accessible={true}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: filterAccessible }}
          accessibilityLabel="Filter accessible parking"
        >
          <MaterialIcons
            name="accessible"
            size={18}
            color={filterAccessible ? theme.colors.textInverse : theme.colors.primary}
          />
          <Text
            style={[
              styles.filterText,
              { color: filterAccessible ? theme.colors.textInverse : theme.colors.primary },
            ]}
          >
            Accessible
          </Text>
        </TouchableOpacity>

        <AccessibleButton
          title="Find Nearest"
          icon="near-me"
          size="small"
          variant="outline"
          onPress={handleFindNearest}
          accessibilityHint="Find the nearest available parking"
        />
      </View>

      {/* Parked Vehicle Card */}
      {parkedVehicle && (
        <SimpleCard variant="elevated" style={styles.parkedCard}>
          <View style={styles.parkedHeader}>
            <View style={[styles.parkedIconContainer, { backgroundColor: `${theme.colors.secondary}15` }]}>
              <MaterialIcons name="directions-car" size={24} color={theme.colors.secondary} />
            </View>
            <View style={styles.parkedInfo}>
              <Text style={[styles.parkedTitle, { color: theme.colors.textPrimary }]}>
                Your Vehicle
              </Text>
              <Text style={[styles.parkedLot, { color: theme.colors.textSecondary }]}>
                {parkingLots.find(l => l.id === parkedVehicle.parkingLotId)?.name || 'Unknown Location'}
                {parkedVehicle.spotNumber && ` • Spot ${parkedVehicle.spotNumber}`}
              </Text>
              <Text style={[styles.parkedTime, { color: theme.colors.textTertiary }]}>
                Parked {getTimeSinceParked()}
              </Text>
            </View>
          </View>

          <View style={styles.parkedActions}>
            <AccessibleButton
              title={isNavigating ? 'Opening...' : 'Navigate'}
              icon="navigation"
              size="small"
              onPress={handleNavigateToVehicle}
              disabled={isNavigating}
              style={{ flex: 1 }}
            />
            <AccessibleButton
              title="Clear"
              icon="close"
              size="small"
              variant="ghost"
              onPress={handleClearVehicle}
            />
          </View>
        </SimpleCard>
      )}

      {/* Parking Lots List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {filterAccessible ? 'Disabled Parking Spots' : 'Parking Lots'}
          </Text>
          <Text style={[styles.updateHint, { color: theme.colors.textTertiary }]}>
            {filterAccessible
              ? `Showing ${filteredLots.length} lot${filteredLots.length !== 1 ? 's' : ''} with dedicated disabled parking`
              : 'Pull to refresh • Tap for details'
            }
          </Text>
        </View>

        {/* Loading State */}
        {isLoading && (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        )}

        {/* Empty State */}
        {!isLoading && filteredLots.length === 0 && (
          <EmptyState
            icon="accessible"
            title="No disabled parking spots found"
            description="There are no parking lots with dedicated disabled parking spaces at this time"
            actionLabel={filterAccessible ? "Show All Parking" : "Refresh"}
            onAction={filterAccessible ? () => setFilterAccessible(false) : loadData}
          />
        )}

        {/* Parking Lots */}
        {!isLoading && filteredLots.map(lot => {
          const { color, label, occupancy } = getStatusInfo(lot);
          const prediction = predictions[lot.id];
          const isSelected = selectedLot?.id === lot.id;

          // #region agent log
          if (prediction) {
            fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ParkingScreen.tsx:512',message:'prediction found for lot',data:{lotId:lot.id,occupancy:prediction.predictedOccupancy,confidence:prediction.confidence,willDisplay:prediction.confidence>0.5,recommendation:prediction.recommendation},timestamp:Date.now(),sessionId:'debug-session',runId:'render',hypothesisId:'PRED'})}).catch(()=>{});
          } else {
            fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ParkingScreen.tsx:512',message:'no prediction for lot',data:{lotId:lot.id},timestamp:Date.now(),sessionId:'debug-session',runId:'render',hypothesisId:'PRED'})}).catch(()=>{});
          }
          // #endregion

          return (
            <TouchableOpacity
              key={lot.id}
              style={[
                styles.parkingCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.lg,
                  borderColor: isSelected ? theme.colors.primary : 'transparent',
                },
                isSelected && theme.shadows.md,
              ]}
              onPress={() => {
                setSelectedLot(isSelected ? null : lot);
                triggerHaptic('light');
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${lot.name}, ${lot.availableSpots} of ${lot.totalSpots} spots available, ${label}`}
            >
              {/* Header Row */}
              <View style={styles.parkingHeader}>
                <View style={styles.parkingTitleRow}>
                  <Text style={[styles.parkingName, { color: theme.colors.textPrimary }]}>
                    {lot.name}
                  </Text>
                  {(lot.disabledParkingSpots || 0) > 0 && (
                    <View style={[styles.accessibleBadge, { backgroundColor: `${theme.colors.secondary}15` }]}>
                      <MaterialIcons name="accessible" size={14} color={theme.colors.secondary} />
                      <Text style={[styles.disabledSpotsText, { color: theme.colors.secondary }]}>
                        {lot.disabledParkingSpots}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${color}15` }]}>
                  <View style={[styles.statusDot, { backgroundColor: color }]} />
                  <Text style={[styles.statusText, { color }]}>{label}</Text>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.parkingStats}>
                <View style={styles.spotCounter}>
                  <Text style={[styles.spotNumber, { color }]}>
                    {lot.availableSpots}
                  </Text>
                  <Text style={[styles.spotLabel, { color: theme.colors.textSecondary }]}>
                    / {lot.totalSpots} spots
                  </Text>
                </View>

                <View style={[styles.occupancyBar, { backgroundColor: theme.colors.border }]}>
                  <Animated.View
                    style={[
                      styles.occupancyFill,
                      {
                        width: `${occupancy}%`,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Prediction */}
              {prediction && prediction.confidence > 0.5 && (
                <View style={[styles.predictionRow, { backgroundColor: `${theme.colors.info}10` }]}>
                  <MaterialIcons name="insights" size={14} color={theme.colors.info} />
                  <Text style={[styles.predictionText, { color: theme.colors.info }]}>
                    {prediction.recommendation}
                  </Text>
                </View>
              )}

              {/* Last Updated */}
              <Text style={[styles.lastUpdated, { color: theme.colors.textTertiary }]}>
                Updated {new Date(lot.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>

              {/* Selected Actions */}
              {isSelected && (
                <View style={[styles.selectedActions, { borderTopColor: theme.colors.border }]}>
                  <AccessibleButton
                    title="Navigate"
                    icon="navigation"
                    size="small"
                    variant="outline"
                    onPress={() => handleNavigateToLot(lot)}
                    style={{ flex: 1 }}
                  />
                  <AccessibleButton
                    title="Park Here"
                    icon="local-parking"
                    size="small"
                    onPress={() => setShowParkModal(true)}
                    style={{ flex: 1 }}
                  />
                  <AccessibleButton
                    title="Report"
                    icon="edit"
                    size="small"
                    variant="ghost"
                    onPress={() => setShowReportModal(true)}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Community Help Banner - Enhanced UI */}
        {!isLoading && filteredLots.length > 0 && (
          <TouchableOpacity
            style={[
              styles.communityCard,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
                ...theme.shadows.sm,
              },
            ]}
            onPress={() => {
              if (filteredLots.length > 0) {
                setSelectedLot(filteredLots[0]);
                setShowReportModal(true);
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.communityContent}>
              <View
                style={[
                  styles.communityIcon,
                  {
                    backgroundColor: `${theme.colors.primary}15`,
                    borderRadius: theme.borderRadius.md,
                  },
                ]}
              >
                <MaterialIcons name="people" size={28} color={theme.colors.primary} />
              </View>
              <View style={styles.communityText}>
                <Text style={[styles.communityTitle, { color: theme.colors.textPrimary }]}>
                  Help Your Community
                </Text>
                <Text style={[styles.communityDesc, { color: theme.colors.textSecondary }]}>
                  Report parking availability to help fellow students
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textTertiary} />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                    Report Availability
                  </Text>
                  <TouchableOpacity onPress={() => setShowReportModal(false)}>
                    <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                  Report availability at {selectedLot?.name}
                </Text>

                <Text style={[styles.currentCount, { color: theme.colors.textTertiary }]}>
                  Current count: {selectedLot?.availableSpots} / {selectedLot?.totalSpots} spots
                </Text>

                {/* Quick Action Buttons */}
                <View style={styles.quickActions}>
                  <TouchableOpacity
                    style={[styles.quickButton, { backgroundColor: theme.colors.success + '20', borderColor: theme.colors.success }]}
                    onPress={() => {
                      if (selectedLot) {
                        const newCount = Math.min(selectedLot.totalSpots, selectedLot.availableSpots + 1);
                        setReportSpots(newCount.toString());
                      }
                    }}
                  >
                    <MaterialIcons name="add" size={20} color={theme.colors.success} />
                    <Text style={[styles.quickButtonText, { color: theme.colors.success }]}>+1 Spot</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.quickButton, { backgroundColor: theme.colors.success + '20', borderColor: theme.colors.success }]}
                    onPress={() => {
                      if (selectedLot) {
                        const newCount = Math.min(selectedLot.totalSpots, selectedLot.availableSpots + 5);
                        setReportSpots(newCount.toString());
                      }
                    }}
                  >
                    <MaterialIcons name="add" size={20} color={theme.colors.success} />
                    <Text style={[styles.quickButtonText, { color: theme.colors.success }]}>+5 Spots</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.orText, { color: theme.colors.textTertiary }]}>
                  Or enter exact total:
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.border,
                      color: theme.colors.textPrimary,
                      borderRadius: theme.borderRadius.md,
                    },
                  ]}
                  placeholder="Total available spots"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="number-pad"
                  value={reportSpots}
                  onChangeText={setReportSpots}
                />

                <View style={styles.modalActions}>
                  <AccessibleButton
                    title="Cancel"
                    variant="ghost"
                    onPress={() => {
                      setShowReportModal(false);
                      setReportSpots('');
                    }}
                    style={{ flex: 1 }}
                  />
                  <AccessibleButton
                    title="Submit Report"
                    icon="check"
                    onPress={handleReport}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Park Vehicle Modal */}
      <Modal
        visible={showParkModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowParkModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                    Save Vehicle Location
                  </Text>
                  <TouchableOpacity onPress={() => setShowParkModal(false)}>
                    <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                  Remember where you parked at {selectedLot?.name}
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.border,
                      color: theme.colors.textPrimary,
                      borderRadius: theme.borderRadius.md,
                    },
                  ]}
                  placeholder="Spot number (optional)"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={spotNumber}
                  onChangeText={setSpotNumber}
                />

                <TextInput
                  style={[
                    styles.input,
                    styles.notesInput,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.border,
                      color: theme.colors.textPrimary,
                      borderRadius: theme.borderRadius.md,
                    },
                  ]}
                  placeholder="Notes (e.g., near exit, level 2)"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />

                <View style={styles.modalActions}>
                  <AccessibleButton
                    title="Cancel"
                    variant="ghost"
                    onPress={() => {
                      setShowParkModal(false);
                      setSpotNumber('');
                      setNotes('');
                    }}
                    style={{ flex: 1 }}
                  />
                  <AccessibleButton
                    title="Save Location"
                    icon="save"
                    onPress={handleParkVehicle}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  parkedCard: {
    margin: 16,
    marginBottom: 0,
  },
  parkedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  parkedIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  parkedInfo: {
    flex: 1,
  },
  parkedTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  parkedLot: {
    fontSize: 14,
    marginTop: 2,
  },
  parkedTime: {
    fontSize: 12,
    marginTop: 2,
  },
  parkedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  updateHint: {
    fontSize: 12,
    marginTop: 4,
  },
  parkingCard: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  parkingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  parkingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  parkingName: {
    fontSize: 16,
    fontWeight: '600',
  },
  accessibleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 3,
  },
  disabledSpotsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  parkingStats: {
    marginBottom: 12,
  },
  spotCounter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  spotNumber: {
    fontSize: 32,
    fontWeight: '700',
  },
  spotLabel: {
    fontSize: 14,
    marginLeft: 4,
  },
  occupancyBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  occupancyFill: {
    height: '100%',
    borderRadius: 3,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  predictionText: {
    fontSize: 12,
    flex: 1,
  },
  lastUpdated: {
    fontSize: 11,
  },
  selectedActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  communityCard: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
  },
  communityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityIcon: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  communityText: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  communityDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  currentCount: {
    fontSize: 13,
    marginBottom: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});

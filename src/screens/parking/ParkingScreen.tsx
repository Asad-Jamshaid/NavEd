// ==========================================
// Parking Screen - Crowdsourced & Predictive
// NO IoT sensors - Community driven!
// ==========================================

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';

import AccessibleButton from '../../components/common/AccessibleButton';
import Card from '../../components/common/Card';
import { COLORS, SPACING, BORDER_RADIUS, CAMPUS_CONFIG } from '../../utils/constants';
import { ParkingLot, ParkedVehicle, ParkingPrediction } from '../../types';
import { getParkingStatus } from '../../data/campusData';
import {
  getParkingLots,
  reportParkingAvailability,
  predictParkingAvailability,
  saveVehicleLocation,
  getVehicleLocation,
  clearVehicleLocation,
  findNearestAvailableParking,
  schedulePeakHourAlert,
} from '../../services/parkingService';
import { getRoute, formatDistance, formatDuration } from '../../services/navigationService';
import { speak, triggerHaptic } from '../../services/accessibilityService';
import { useApp } from '../../contexts/AppContext';

export default function ParkingScreen() {
  const { state, saveParkedVehicle } = useApp();
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

  const accessibilityMode = state.user?.preferences.accessibilityMode;
  const highContrast = state.user?.preferences.highContrast;

  // Load data
  useEffect(() => {
    loadData();
    loadUserLocation();
  }, []);

  const loadData = async () => {
    try {
      const lots = await getParkingLots();
      setParkingLots(lots);

      // Load predictions for all lots
      const predPromises = lots.map(lot => predictParkingAvailability(lot.id));
      const preds = await Promise.all(predPromises);
      const predMap: Record<string, ParkingPrediction> = {};
      preds.forEach(pred => {
        predMap[pred.parkingLotId] = pred;
      });
      setPredictions(predMap);

      // Load parked vehicle
      const vehicle = await getVehicleLocation();
      setParkedVehicle(vehicle);
      if (vehicle) {
        saveParkedVehicle(vehicle);
      }
    } catch (error) {
      console.error('Error loading parking data:', error);
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

  // Report parking availability
  const handleReport = async () => {
    if (!selectedLot || !reportSpots) return;

    const spots = parseInt(reportSpots);
    if (isNaN(spots) || spots < 0 || spots > selectedLot.totalSpots) {
      Alert.alert('Invalid Input', 'Please enter a valid number of spots.');
      return;
    }

    const success = await reportParkingAvailability(selectedLot.id, spots);
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

    await saveVehicleLocation(vehicle);
    setParkedVehicle(vehicle);
    saveParkedVehicle(vehicle);
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
            await clearVehicleLocation();
            setParkedVehicle(null);
            saveParkedVehicle(null);
            triggerHaptic('medium');
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

  // Get status color
  const getStatusColor = (lot: ParkingLot) => {
    const status = getParkingStatus(lot);
    switch (status) {
      case 'available':
        return COLORS.parkingAvailable;
      case 'moderate':
        return COLORS.parkingModerate;
      case 'full':
        return COLORS.parkingFull;
    }
  };

  // Filter lots
  const filteredLots = filterAccessible
    ? parkingLots.filter(lot => lot.isAccessible)
    : parkingLots;

  return (
    <View style={[styles.container, highContrast && styles.containerHighContrast]}>
      {/* Header Actions */}
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={[styles.filterButton, filterAccessible && styles.filterButtonActive]}
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
            size={20}
            color={filterAccessible ? COLORS.white : COLORS.primary}
          />
          <Text style={[
            styles.filterText,
            filterAccessible && styles.filterTextActive,
          ]}>
            Accessible
          </Text>
        </TouchableOpacity>

        <AccessibleButton
          title="Find Nearest"
          icon="near-me"
          size="small"
          onPress={handleFindNearest}
          accessibilityHint="Find the nearest available parking"
        />
      </View>

      {/* Parked Vehicle Card */}
      {parkedVehicle && (
        <Card
          icon="directions-car"
          iconColor={COLORS.secondary}
          title="Your Parked Vehicle"
          style={styles.parkedCard}
          highContrast={highContrast}
        >
          <View style={styles.parkedInfo}>
            <Text style={[styles.parkedLot, highContrast && styles.textHighContrast]}>
              {parkingLots.find(l => l.id === parkedVehicle.parkingLotId)?.name || 'Unknown'}
            </Text>
            {parkedVehicle.spotNumber && (
              <Text style={styles.parkedSpot}>Spot: {parkedVehicle.spotNumber}</Text>
            )}
            <Text style={styles.parkedTime}>
              Parked: {new Date(parkedVehicle.parkedAt).toLocaleTimeString()}
            </Text>
          </View>
          <View style={styles.parkedActions}>
            <AccessibleButton
              title="Navigate"
              icon="navigation"
              size="small"
              onPress={() => {
                // Navigate to vehicle
                if (accessibilityMode) {
                  speak('Navigating to your parked vehicle');
                }
              }}
            />
            <AccessibleButton
              title="Clear"
              icon="delete"
              size="small"
              variant="outline"
              onPress={handleClearVehicle}
            />
          </View>
        </Card>
      )}

      {/* Parking Lots List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={[styles.sectionTitle, highContrast && styles.textHighContrast]}>
          Parking Availability
        </Text>
        <Text style={styles.updateHint}>
          Pull to refresh • Tap to see details • Help update availability
        </Text>

        {filteredLots.map(lot => {
          const prediction = predictions[lot.id];
          const status = getParkingStatus(lot);

          return (
            <TouchableOpacity
              key={lot.id}
              style={[
                styles.parkingCard,
                highContrast && styles.parkingCardHighContrast,
                selectedLot?.id === lot.id && styles.parkingCardSelected,
              ]}
              onPress={() => {
                setSelectedLot(lot);
                triggerHaptic('light');
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${lot.name}, ${lot.availableSpots} of ${lot.totalSpots} spots available, ${status}`}
            >
              <View style={styles.parkingHeader}>
                <View style={styles.parkingTitleRow}>
                  <Text style={[styles.parkingName, highContrast && styles.textHighContrast]}>
                    {lot.name}
                  </Text>
                  {lot.isAccessible && (
                    <MaterialIcons name="accessible" size={18} color={COLORS.secondary} />
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lot) }]}>
                  <Text style={styles.statusText}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.parkingStats}>
                <View style={styles.spotCounter}>
                  <Text style={[styles.spotNumber, { color: getStatusColor(lot) }]}>
                    {lot.availableSpots}
                  </Text>
                  <Text style={styles.spotLabel}>/ {lot.totalSpots} spots</Text>
                </View>

                <View style={styles.occupancyBar}>
                  <View
                    style={[
                      styles.occupancyFill,
                      {
                        width: `${((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100}%`,
                        backgroundColor: getStatusColor(lot),
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Prediction */}
              {prediction && prediction.confidence > 0.5 && (
                <View style={styles.predictionRow}>
                  <MaterialIcons name="trending-up" size={16} color={COLORS.info} />
                  <Text style={styles.predictionText}>
                    {prediction.recommendation}
                  </Text>
                </View>
              )}

              {/* Last Updated */}
              <Text style={styles.lastUpdated}>
                Updated: {new Date(lot.lastUpdated).toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Community Help Banner */}
        <Card style={styles.communityCard} highContrast={highContrast}>
          <View style={styles.communityContent}>
            <MaterialIcons name="people" size={32} color={COLORS.primary} />
            <View style={styles.communityText}>
              <Text style={[styles.communityTitle, highContrast && styles.textHighContrast]}>
                Help Your Community
              </Text>
              <Text style={styles.communityDesc}>
                Report parking availability to help fellow students find spots faster!
              </Text>
            </View>
          </View>
          <AccessibleButton
            title="Report Now"
            icon="edit"
            onPress={() => {
              if (selectedLot) {
                setShowReportModal(true);
              } else {
                Alert.alert('Select Parking', 'Please select a parking lot first.');
              }
            }}
            fullWidth
          />
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Selected Lot Actions */}
      {selectedLot && (
        <View style={[styles.actionBar, highContrast && styles.actionBarHighContrast]}>
          <View style={styles.selectedInfo}>
            <Text style={[styles.selectedName, highContrast && styles.textHighContrast]}>
              {selectedLot.name}
            </Text>
            <Text style={styles.selectedSpots}>
              {selectedLot.availableSpots} spots available
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <AccessibleButton
              title="Navigate"
              icon="navigation"
              size="small"
              onPress={() => {
                if (accessibilityMode) {
                  speak(`Navigating to ${selectedLot.name}`);
                }
              }}
            />
            <AccessibleButton
              title="Park Here"
              icon="local-parking"
              size="small"
              variant="secondary"
              onPress={() => setShowParkModal(true)}
            />
          </View>
        </View>
      )}

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, highContrast && styles.modalContentHighContrast]}>
            <Text style={[styles.modalTitle, highContrast && styles.textHighContrast]}>
              Report Availability
            </Text>
            <Text style={styles.modalSubtitle}>
              How many spots are available at {selectedLot?.name}?
            </Text>

            <TextInput
              style={[styles.input, highContrast && styles.inputHighContrast]}
              placeholder="Number of available spots"
              placeholderTextColor={COLORS.gray}
              keyboardType="number-pad"
              value={reportSpots}
              onChangeText={setReportSpots}
              accessible={true}
              accessibilityLabel="Number of available spots"
            />

            <View style={styles.modalActions}>
              <AccessibleButton
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setShowReportModal(false);
                  setReportSpots('');
                }}
                style={styles.modalButton}
              />
              <AccessibleButton
                title="Submit"
                onPress={handleReport}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Park Vehicle Modal */}
      <Modal
        visible={showParkModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowParkModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, highContrast && styles.modalContentHighContrast]}>
            <Text style={[styles.modalTitle, highContrast && styles.textHighContrast]}>
              Save Vehicle Location
            </Text>
            <Text style={styles.modalSubtitle}>
              Remember where you parked at {selectedLot?.name}
            </Text>

            <TextInput
              style={[styles.input, highContrast && styles.inputHighContrast]}
              placeholder="Spot number (optional)"
              placeholderTextColor={COLORS.gray}
              value={spotNumber}
              onChangeText={setSpotNumber}
              accessible={true}
              accessibilityLabel="Parking spot number"
            />

            <TextInput
              style={[styles.input, styles.notesInput, highContrast && styles.inputHighContrast]}
              placeholder="Notes (e.g., near exit, level 2)"
              placeholderTextColor={COLORS.gray}
              value={notes}
              onChangeText={setNotes}
              multiline
              accessible={true}
              accessibilityLabel="Parking notes"
            />

            <View style={styles.modalActions}>
              <AccessibleButton
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setShowParkModal(false);
                  setSpotNumber('');
                  setNotes('');
                }}
                style={styles.modalButton}
              />
              <AccessibleButton
                title="Save Location"
                icon="save"
                onPress={handleParkVehicle}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerHighContrast: {
    backgroundColor: '#000000',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    marginLeft: SPACING.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  parkedCard: {
    margin: SPACING.md,
    marginBottom: 0,
  },
  parkedInfo: {
    marginBottom: SPACING.sm,
  },
  parkedLot: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  parkedSpot: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  parkedTime: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  parkedActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  textHighContrast: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  updateHint: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: SPACING.md,
  },
  parkingCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  parkingCardHighContrast: {
    backgroundColor: '#1A1A1A',
    borderColor: '#333333',
  },
  parkingCardSelected: {
    borderColor: COLORS.primary,
  },
  parkingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  parkingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  parkingName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  parkingStats: {
    marginBottom: SPACING.sm,
  },
  spotCounter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  spotNumber: {
    fontSize: 28,
    fontWeight: '700',
  },
  spotLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  occupancyBar: {
    height: 8,
    backgroundColor: COLORS.grayLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  occupancyFill: {
    height: '100%',
    borderRadius: 4,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  predictionText: {
    fontSize: 12,
    color: COLORS.info,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  lastUpdated: {
    fontSize: 11,
    color: COLORS.gray,
  },
  communityCard: {
    marginTop: SPACING.md,
  },
  communityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  communityText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  communityDesc: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  bottomPadding: {
    height: 100,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBarHighContrast: {
    backgroundColor: '#1A1A1A',
    borderTopColor: '#FFFFFF',
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  selectedSpots: {
    fontSize: 14,
    color: COLORS.gray,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalContentHighContrast: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: SPACING.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 16,
    marginBottom: SPACING.md,
  },
  inputHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
    color: '#FFFFFF',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  modalButton: {
    flex: 1,
  },
});

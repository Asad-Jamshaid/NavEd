// ==========================================
// Campus Map Screen - OpenStreetMap (FREE)
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Video } from 'expo-av';

import SearchBar from '../../components/common/SearchBar';
import AccessibleButton from '../../components/common/AccessibleButton';
import Card from '../../components/common/Card';
import { COLORS, SPACING, CAMPUS_CONFIG, BUILDING_CATEGORIES } from '../../utils/constants';
import { Building, Coordinate, NavigationRoute, Room } from '../../types';
import {
  BUILDINGS,
  ROOMS,
  searchBuildings,
  searchRooms,
  getBuildingById,
  VIDEO_ROUTES,
} from '../../data/campusData';
import {
  getRoute,
  formatDistance,
  formatDuration,
  calculateDistance,
} from '../../services/navigationService';
import {
  speak,
  announceNavigation,
  announceArrival,
  triggerHaptic,
} from '../../services/accessibilityService';
import { useApp } from '../../contexts/AppContext';

export default function CampusMapScreen() {
  const { state } = useApp();
  const mapRef = useRef<MapView>(null);

  // State
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(Building | Room)[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeRoute, setActiveRoute] = useState<NavigationRoute | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showAccessibleOnly, setShowAccessibleOnly] = useState(false);
  const [showBuildingDetails, setShowBuildingDetails] = useState(false);

  const accessibilityMode = state.user?.preferences.accessibilityMode;
  const highContrast = state.user?.preferences.highContrast;

  // Get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  // Search handler
  useEffect(() => {
    if (searchQuery.length > 0) {
      const buildings = searchBuildings(searchQuery);
      const rooms = searchRooms(searchQuery);
      setSearchResults([...buildings, ...rooms].slice(0, 10));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Filter buildings by category
  const filteredBuildings = BUILDINGS.filter(b => {
    if (showAccessibleOnly) {
      if (!b.accessibilityFeatures.includes('wheelchair_ramp') &&
          !b.accessibilityFeatures.includes('elevator')) {
        return false;
      }
    }
    if (selectedCategory === 'all') return true;
    return b.category === selectedCategory;
  });

  // Navigate to building
  const navigateToBuilding = async (building: Building) => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location to get directions.');
      return;
    }

    triggerHaptic('medium');
    setSelectedBuilding(building);

    const route = await getRoute(
      userLocation,
      { latitude: building.latitude, longitude: building.longitude },
      showAccessibleOnly
    );

    if (route) {
      setActiveRoute(route);

      // Fit map to show route
      mapRef.current?.fitToCoordinates(
        [userLocation, { latitude: building.latitude, longitude: building.longitude }],
        { edgePadding: { top: 100, right: 50, bottom: 200, left: 50 }, animated: true }
      );

      // Voice announcement
      if (accessibilityMode) {
        speak(`Navigating to ${building.name}. Distance: ${formatDistance(route.distance)}. Estimated time: ${formatDuration(route.duration)}`);
      }
    }
  };

  // Start turn-by-turn navigation
  const startNavigation = () => {
    if (!activeRoute) return;

    setIsNavigating(true);
    triggerHaptic('success');

    if (accessibilityMode && activeRoute.steps.length > 0) {
      announceNavigation(activeRoute.steps[0].instruction);
    }
  };

  // Play video route
  const playVideoRoute = (building: Building) => {
    // Check if we have a video for this route
    const routeKey = `gate-to-${building.shortName.toLowerCase()}`;
    const video = VIDEO_ROUTES[routeKey];

    if (video) {
      setVideoUrl(video);
      setShowVideoModal(true);
    } else {
      Alert.alert(
        'Video Not Available',
        'Video navigation for this route is coming soon. Using map navigation instead.'
      );
    }
  };

  // Select search result
  const selectSearchResult = (result: Building | Room) => {
    setSearchQuery('');
    setSearchResults([]);

    if ('floors' in result) {
      // It's a building
      setSelectedBuilding(result);
      setShowBuildingDetails(true);
      mapRef.current?.animateToRegion({
        latitude: result.latitude,
        longitude: result.longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      });
    } else {
      // It's a room - find its building
      const building = getBuildingById(result.buildingId);
      if (building) {
        setSelectedBuilding(building);
        setShowBuildingDetails(true);
        mapRef.current?.animateToRegion({
          latitude: building.latitude,
          longitude: building.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        });
      }
    }

    triggerHaptic('light');
  };

  return (
    <View style={[styles.container, highContrast && styles.containerHighContrast]}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...CAMPUS_CONFIG.center,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        accessible={true}
        accessibilityLabel="Campus map"
      >
        {/* Building Markers */}
        {filteredBuildings.map(building => (
          <Marker
            key={building.id}
            coordinate={{
              latitude: building.latitude,
              longitude: building.longitude,
            }}
            title={building.name}
            description={building.description}
            onPress={() => {
              setSelectedBuilding(building);
              setShowBuildingDetails(true);
              triggerHaptic('light');
            }}
          >
            <View style={[
              styles.markerContainer,
              selectedBuilding?.id === building.id && styles.markerSelected,
            ]}>
              <MaterialIcons
                name={getCategoryIcon(building.category)}
                size={20}
                color={COLORS.white}
              />
            </View>
          </Marker>
        ))}

        {/* Navigation Route */}
        {activeRoute && (
          <Polyline
            coordinates={activeRoute.steps.map(s => s.coordinate)}
            strokeColor={COLORS.primary}
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search buildings, rooms..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          highContrast={highContrast}
        />

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={[styles.searchResults, highContrast && styles.searchResultsHighContrast]}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchResultItem}
                  onPress={() => selectSearchResult(result)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={'name' in result ? result.name : (result as Room).roomNumber}
                >
                  <MaterialIcons
                    name={'floors' in result ? 'business' : 'room'}
                    size={20}
                    color={COLORS.gray}
                  />
                  <View style={styles.searchResultText}>
                    <Text style={[styles.searchResultTitle, highContrast && styles.textHighContrast]}>
                      {'name' in result ? result.name : `Room ${(result as Room).roomNumber}`}
                    </Text>
                    {'floors' in result && (
                      <Text style={styles.searchResultSubtitle}>
                        {result.shortName}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        <TouchableOpacity
          style={[
            styles.accessibleFilter,
            showAccessibleOnly && styles.accessibleFilterActive,
          ]}
          onPress={() => {
            setShowAccessibleOnly(!showAccessibleOnly);
            triggerHaptic('light');
          }}
          accessible={true}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: showAccessibleOnly }}
          accessibilityLabel="Show accessible buildings only"
        >
          <MaterialIcons
            name="accessible"
            size={20}
            color={showAccessibleOnly ? COLORS.white : COLORS.primary}
          />
        </TouchableOpacity>

        {BUILDING_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && styles.categoryChipActive,
            ]}
            onPress={() => {
              setSelectedCategory(cat.id);
              triggerHaptic('light');
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedCategory === cat.id }}
            accessibilityLabel={cat.name}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === cat.id && styles.categoryTextActive,
            ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Building Details Panel */}
      {showBuildingDetails && selectedBuilding && (
        <View style={[styles.detailsPanel, highContrast && styles.detailsPanelHighContrast]}>
          <View style={styles.detailsHeader}>
            <View style={styles.detailsTitle}>
              <Text style={[styles.buildingName, highContrast && styles.textHighContrast]}>
                {selectedBuilding.name}
              </Text>
              <Text style={styles.buildingShortName}>
                {selectedBuilding.shortName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setShowBuildingDetails(false);
                setActiveRoute(null);
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close details"
            >
              <MaterialIcons name="close" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.buildingDescription, highContrast && styles.textHighContrast]}>
            {selectedBuilding.description}
          </Text>

          {/* Accessibility Features */}
          {selectedBuilding.accessibilityFeatures.length > 0 && (
            <View style={styles.accessibilityBadges}>
              {selectedBuilding.accessibilityFeatures.map(feature => (
                <View key={feature} style={styles.accessibilityBadge}>
                  <MaterialIcons
                    name={getAccessibilityIcon(feature)}
                    size={14}
                    color={COLORS.secondary}
                  />
                  <Text style={styles.accessibilityText}>
                    {formatAccessibilityFeature(feature)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Route Info */}
          {activeRoute && (
            <View style={styles.routeInfo}>
              <View style={styles.routeInfoItem}>
                <MaterialIcons name="straighten" size={20} color={COLORS.primary} />
                <Text style={styles.routeInfoText}>
                  {formatDistance(activeRoute.distance)}
                </Text>
              </View>
              <View style={styles.routeInfoItem}>
                <MaterialIcons name="schedule" size={20} color={COLORS.primary} />
                <Text style={styles.routeInfoText}>
                  {formatDuration(activeRoute.duration)}
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <AccessibleButton
              title="Get Directions"
              icon="directions"
              onPress={() => navigateToBuilding(selectedBuilding)}
              style={styles.actionButton}
              accessibilityHint="Get walking directions to this building"
            />
            <AccessibleButton
              title="Video Guide"
              icon="play-circle-filled"
              variant="secondary"
              onPress={() => playVideoRoute(selectedBuilding)}
              style={styles.actionButton}
              accessibilityHint="Watch a video showing the route"
            />
          </View>

          {isNavigating && activeRoute && (
            <View style={styles.navigationPanel}>
              <Text style={styles.navInstruction}>
                {activeRoute.steps[0]?.instruction}
              </Text>
              <AccessibleButton
                title="Stop Navigation"
                variant="danger"
                onPress={() => {
                  setIsNavigating(false);
                  setActiveRoute(null);
                }}
              />
            </View>
          )}
        </View>
      )}

      {/* Video Modal */}
      <Modal
        visible={showVideoModal}
        animationType="slide"
        onRequestClose={() => setShowVideoModal(false)}
      >
        <View style={styles.videoModal}>
          <View style={styles.videoHeader}>
            <Text style={styles.videoTitle}>Video Navigation Guide</Text>
            <TouchableOpacity
              onPress={() => setShowVideoModal(false)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close video"
            >
              <MaterialIcons name="close" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {videoUrl ? (
            <Video
              source={{ uri: videoUrl }}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
              shouldPlay
            />
          ) : (
            <View style={styles.videoPlaceholder}>
              <MaterialIcons name="videocam-off" size={48} color={COLORS.gray} />
              <Text style={styles.videoPlaceholderText}>
                Video not available for this route
              </Text>
            </View>
          )}

          <View style={styles.videoControls}>
            <Text style={styles.videoHint}>
              Follow along with the video to reach your destination
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helper functions
function getCategoryIcon(category: string): keyof typeof MaterialIcons.glyphMap {
  const icons: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    academic: 'school',
    administrative: 'business',
    library: 'local-library',
    cafeteria: 'restaurant',
    sports: 'fitness-center',
    hostel: 'hotel',
    medical: 'local-hospital',
    parking: 'local-parking',
    other: 'place',
  };
  return icons[category] || 'place';
}

function getAccessibilityIcon(feature: string): keyof typeof MaterialIcons.glyphMap {
  const icons: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    wheelchair_ramp: 'accessible',
    elevator: 'elevator',
    braille_signage: 'visibility',
    audio_guidance: 'hearing',
    wide_doors: 'sensor-door',
    accessible_washroom: 'wc',
    tactile_paving: 'texture',
  };
  return icons[feature] || 'check-circle';
}

function formatAccessibilityFeature(feature: string): string {
  return feature.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerHighContrast: {
    backgroundColor: '#000000',
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
  },
  searchResults: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginTop: SPACING.xs,
    maxHeight: 200,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultsHighContrast: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  searchResultText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    color: COLORS.black,
  },
  searchResultSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
  },
  textHighContrast: {
    color: '#FFFFFF',
  },
  categoryScroll: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  categoryContent: {
    paddingHorizontal: SPACING.md,
  },
  accessibleFilter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  accessibleFilterActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  categoryTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  markerSelected: {
    backgroundColor: COLORS.accent,
    transform: [{ scale: 1.2 }],
  },
  detailsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  detailsPanelHighContrast: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  detailsTitle: {
    flex: 1,
  },
  buildingName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
  },
  buildingShortName: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  buildingDescription: {
    fontSize: 14,
    color: COLORS.grayDark,
    marginBottom: SPACING.sm,
  },
  accessibilityBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  accessibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  accessibilityText: {
    fontSize: 12,
    color: COLORS.secondary,
    marginLeft: 4,
  },
  routeInfo: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  routeInfoText: {
    marginLeft: SPACING.xs,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  navigationPanel: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },
  navInstruction: {
    fontSize: 16,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  videoModal: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  video: {
    flex: 1,
    width: '100%',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    color: COLORS.gray,
    marginTop: SPACING.md,
  },
  videoControls: {
    padding: SPACING.lg,
  },
  videoHint: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 14,
  },
});

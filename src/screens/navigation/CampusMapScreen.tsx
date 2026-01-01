// ==========================================
// Campus Map Screen - Modern Minimal Design
// OpenStreetMap (FREE) - No API keys required!
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
import MapView, { Marker, Polyline, MapLibreMapRef } from '../../components/common/MapViewFallback';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Video, ResizeMode } from 'expo-av';

import SearchBar from '../../components/common/SearchBar';
import AccessibleButton from '../../components/common/AccessibleButton';
import Card, { SimpleCard } from '../../components/common/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { CAMPUS_CONFIG, BUILDING_CATEGORIES } from '../../utils/constants';
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
} from '../../services/navigationService';
import {
  speak,
  announceNavigation,
  announceArrival,
  triggerHaptic,
} from '../../services/accessibilityService';
import { useApp } from '../../contexts/AppContext';

export default function CampusMapScreen() {
  const { theme } = useTheme();
  const { state } = useApp();
  const mapRef = useRef<MapLibreMapRef>(null);

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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
              {
                backgroundColor: selectedBuilding?.id === building.id ? theme.colors.secondary : theme.colors.primary,
                borderColor: theme.colors.surface,
                borderRadius: theme.borderRadius.full,
              },
              selectedBuilding?.id === building.id && { transform: [{ scale: 1.2 }] },
            ]}>
              <MaterialIcons
                name={getCategoryIcon(building.category)}
                size={20}
                color={theme.colors.textInverse}
              />
            </View>
          </Marker>
        ))}

        {/* Navigation Route */}
        {activeRoute && (
          <Polyline
            coordinates={activeRoute.steps.map(s => s.coordinate)}
            strokeColor={theme.colors.primary}
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { top: Platform.OS === 'ios' ? 60 : 40 }]}>
        <SearchBar
          placeholder="Search buildings, rooms..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          variant="floating"
        />

        {/* Search Results */}
        {searchResults.length > 0 && (
          <SimpleCard variant="elevated" style={styles.searchResults}>
            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }}>
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.searchResultItem,
                    { borderBottomColor: theme.colors.border },
                    index === searchResults.length - 1 && { borderBottomWidth: 0 },
                  ]}
                  onPress={() => selectSearchResult(result)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={'name' in result ? result.name : (result as Room).roomNumber}
                >
                  <MaterialIcons
                    name={'floors' in result ? 'business' : 'room'}
                    size={20}
                    color={theme.colors.textTertiary}
                  />
                  <View style={styles.searchResultText}>
                    <Text style={[styles.searchResultTitle, { color: theme.colors.textPrimary }]}>
                      {'name' in result ? result.name : `Room ${(result as Room).roomNumber}`}
                    </Text>
                    {'floors' in result && (
                      <Text style={[styles.searchResultSubtitle, { color: theme.colors.textSecondary }]}>
                        {result.shortName}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SimpleCard>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.categoryScroll, { top: Platform.OS === 'ios' ? 120 : 100 }]}
        contentContainerStyle={styles.categoryContent}
      >
        <TouchableOpacity
          style={[
            styles.accessibleFilter,
            {
              backgroundColor: showAccessibleOnly ? theme.colors.primary : theme.colors.surface,
              borderColor: theme.colors.primary,
              borderRadius: theme.borderRadius.full,
            },
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
            color={showAccessibleOnly ? theme.colors.textInverse : theme.colors.primary}
          />
        </TouchableOpacity>

        {BUILDING_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === cat.id ? theme.colors.primary : theme.colors.surface,
                borderColor: selectedCategory === cat.id ? theme.colors.primary : theme.colors.border,
                borderRadius: theme.borderRadius.full,
              },
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
              {
                color: selectedCategory === cat.id ? theme.colors.textInverse : theme.colors.textSecondary,
                fontWeight: selectedCategory === cat.id ? '600' : '400',
              },
            ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Building Details Panel */}
      {showBuildingDetails && selectedBuilding && (
        <SimpleCard variant="elevated" style={styles.detailsPanel}>
          <View style={styles.detailsHeader}>
            <View style={styles.detailsTitle}>
              <Text style={[styles.buildingName, { color: theme.colors.textPrimary }]}>
                {selectedBuilding.name}
              </Text>
              <Text style={[styles.buildingShortName, { color: theme.colors.textSecondary }]}>
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
              <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.buildingDescription, { color: theme.colors.textSecondary }]}>
            {selectedBuilding.description}
          </Text>

          {/* Accessibility Features */}
          {selectedBuilding.accessibilityFeatures.length > 0 && (
            <View style={styles.accessibilityBadges}>
              {selectedBuilding.accessibilityFeatures.map(feature => (
                <View
                  key={feature}
                  style={[
                    styles.accessibilityBadge,
                    {
                      backgroundColor: `${theme.colors.secondary}15`,
                      borderRadius: theme.borderRadius.md,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={getAccessibilityIcon(feature)}
                    size={14}
                    color={theme.colors.secondary}
                  />
                  <Text style={[styles.accessibilityText, { color: theme.colors.secondary }]}>
                    {formatAccessibilityFeature(feature)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Route Info */}
          {activeRoute && (
            <View style={[styles.routeInfo, { backgroundColor: theme.colors.surfaceVariant, borderRadius: theme.borderRadius.md }]}>
              <View style={styles.routeInfoItem}>
                <MaterialIcons name="straighten" size={20} color={theme.colors.primary} />
                <Text style={[styles.routeInfoText, { color: theme.colors.textPrimary }]}>
                  {formatDistance(activeRoute.distance)}
                </Text>
              </View>
              <View style={styles.routeInfoItem}>
                <MaterialIcons name="schedule" size={20} color={theme.colors.primary} />
                <Text style={[styles.routeInfoText, { color: theme.colors.textPrimary }]}>
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
              style={{ flex: 1 }}
              accessibilityHint="Get walking directions to this building"
            />
            <AccessibleButton
              title="Video Guide"
              icon="play-circle-filled"
              variant="outline"
              onPress={() => playVideoRoute(selectedBuilding)}
              style={{ flex: 1 }}
              accessibilityHint="Watch a video showing the route"
            />
          </View>

          {isNavigating && activeRoute && (
            <View style={[styles.navigationPanel, { backgroundColor: `${theme.colors.primary}15`, borderRadius: theme.borderRadius.md }]}>
              <Text style={[styles.navInstruction, { color: theme.colors.textPrimary }]}>
                {activeRoute.steps[0]?.instruction}
              </Text>
              <AccessibleButton
                title="Stop Navigation"
                variant="danger"
                size="small"
                onPress={() => {
                  setIsNavigating(false);
                  setActiveRoute(null);
                }}
              />
            </View>
          )}
        </SimpleCard>
      )}

      {/* Video Modal */}
      <Modal
        visible={showVideoModal}
        animationType="slide"
        onRequestClose={() => setShowVideoModal(false)}
      >
        <View style={styles.videoModal}>
          <View style={[styles.videoHeader, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.videoTitle, { color: theme.colors.textPrimary }]}>Video Navigation Guide</Text>
            <TouchableOpacity
              onPress={() => setShowVideoModal(false)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close video"
            >
              <MaterialIcons name="close" size={28} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {videoUrl ? (
            <Video
              source={{ uri: videoUrl }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
            />
          ) : (
            <View style={styles.videoPlaceholder}>
              <MaterialIcons name="videocam-off" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.videoPlaceholderText, { color: theme.colors.textSecondary }]}>
                Video not available for this route
              </Text>
            </View>
          )}

          <View style={[styles.videoControls, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.videoHint, { color: theme.colors.textSecondary }]}>
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

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchResults: {
    marginTop: 8,
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  searchResultText: {
    marginLeft: 12,
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
  },
  searchResultSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  categoryScroll: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 5,
  },
  categoryContent: {
    paddingHorizontal: 16,
  },
  accessibleFilter: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1.5,
  },
  categoryText: {
    fontSize: 14,
  },
  markerContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  detailsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailsTitle: {
    flex: 1,
  },
  buildingName: {
    fontSize: 20,
    fontWeight: '700',
  },
  buildingShortName: {
    fontSize: 14,
    marginTop: 2,
  },
  buildingDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  accessibilityBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  accessibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  accessibilityText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  routeInfo: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  routeInfoText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navigationPanel: {
    marginTop: 16,
    padding: 16,
  },
  navInstruction: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  videoModal: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    marginTop: 16,
    fontSize: 14,
  },
  videoControls: {
    padding: 20,
  },
  videoHint: {
    textAlign: 'center',
    fontSize: 14,
  },
});

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
  Animated,
  KeyboardAvoidingView,
} from 'react-native';
import MapView, { Marker, Polyline, MapLibreMapRef } from '../components/MapLibreMap';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Video, ResizeMode } from 'expo-av';

import SearchBar from '../../../shared/components/common/SearchBar';
import AccessibleButton from '../../../shared/components/common/AccessibleButton';
import Card, { SimpleCard } from '../../../shared/components/common/Card';
import Building3DLayer from '../components/Building3DLayer';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { CAMPUS_CONFIG, BUILDING_CATEGORIES } from '../../../shared/utils/constants';
import { Building, Coordinate, NavigationRoute, Room } from '../../../shared/types';
import {
  BUILDINGS,
  ROOMS,
  searchBuildings,
  searchRooms,
  getBuildingById,
  VIDEO_ROUTES,
} from '../../../shared/data/campusData';
import {
  getRoute,
  formatDistance,
  formatDuration,
} from '../services/navigationService';
import {
  speak,
  announceNavigation,
  announceArrival,
  triggerHaptic,
} from '../../../shared/services/accessibilityService';
import { useApp } from '../../../shared/contexts/AppContext';

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
  // Satellite View State
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  // 3D View State (supported with MapLibre)
  const [is3DMode, setIs3DMode] = useState(false);
  // Loading state for navigation
  const [isLoading, setIsLoading] = useState(false);

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

  // Search handler - also search landmarks
  useEffect(() => {
    if (searchQuery.length > 0) {
      const buildings = searchBuildings(searchQuery);
      const rooms = searchRooms(searchQuery);
      
      // Also search for landmarks using navigation service
      (async () => {
        try {
          const { searchLocation } = await import('../../services/navigationService');
          const landmarkCoord = await searchLocation(searchQuery);
          if (landmarkCoord) {
            // Add a virtual building for the landmark
            const landmarkBuilding: Building = {
              id: `landmark-${Date.now()}`,
              name: searchQuery,
              shortName: searchQuery.substring(0, 10),
              description: `Landmark: ${searchQuery}`,
              latitude: landmarkCoord.latitude,
              longitude: landmarkCoord.longitude,
              category: 'other',
              accessibilityFeatures: [],
              floors: 1,
              facilities: [],
            };
            setSearchResults([...buildings, ...rooms, landmarkBuilding].slice(0, 10));
          } else {
            setSearchResults([...buildings, ...rooms].slice(0, 10));
          }
        } catch (error) {
          console.error('Landmark search error:', error);
          setSearchResults([...buildings, ...rooms].slice(0, 10));
        }
      })();
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

  // Navigate to building with timeout protection
  const navigateToBuilding = async (building: Building) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CampusMapScreen.tsx:144',message:'navigateToBuilding called',data:{buildingId:building.id,buildingName:building.name,hasUserLocation:!!userLocation,isLoading,showAccessibleOnly},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Use campus center as fallback if user location not available
    const startLocation = userLocation || {
      latitude: CAMPUS_CONFIG.center.latitude,
      longitude: CAMPUS_CONFIG.center.longitude,
    };

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CampusMapScreen.tsx:149',message:'startLocation determined',data:{hasUserLocation:!!userLocation,startLat:startLocation.latitude,startLng:startLocation.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'F'})}).catch(()=>{});
    // #endregion

    // Show warning if using fallback location
    if (!userLocation) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CampusMapScreen.tsx:152',message:'showing fallback location alert',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      Alert.alert(
        'Using Campus Center',
        'Location not available. Showing route from campus main entrance.',
        [{ text: 'OK' }]
      );
    }

    // Prevent multiple simultaneous route calculations
    if (isLoading) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CampusMapScreen.tsx:161',message:'navigation already in progress, returning early',data:{isLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return;
    }

    triggerHaptic('medium');
    setSelectedBuilding(building);
    setIsLoading(true);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CampusMapScreen.tsx:167',message:'calling getRoute',data:{fromLat:startLocation.latitude,fromLng:startLocation.longitude,toLat:building.latitude,toLng:building.longitude,accessibleOnly:showAccessibleOnly},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    try {
      // #region agent log
      console.log('[Nav] Starting route calculation...');
      fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CampusMapScreen.tsx:187',message:'starting route calculation',data:{fromLat:startLocation.latitude,fromLng:startLocation.longitude,toLat:building.latitude,toLng:building.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Add timeout to prevent infinite hanging (reduced to 5s since A* should be fast)
      const routePromise = getRoute(
        startLocation,
        { latitude: building.latitude, longitude: building.longitude },
        showAccessibleOnly
      );
      
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => {
          console.error('[Nav] Route calculation timeout after 5s');
          reject(new Error('Route calculation timeout'));
        }, 5000);
      });

      // #region agent log
      console.log('[Nav] Waiting for route with 5s timeout...');
      fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CampusMapScreen.tsx:199',message:'waiting for route with timeout',data:{timeoutMs:5000},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'G'})}).catch(()=>{});
      // #endregion

      const route = await Promise.race([routePromise, timeoutPromise]);
      
      // #region agent log
      console.log('[Nav] Route received:', route ? `steps: ${route.steps.length}` : 'null');
      // #endregion

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CampusMapScreen.tsx:183',message:'route received',data:{hasRoute:!!route,stepCount:route?.steps?.length||0,distance:route?.distance},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      if (route) {
        setActiveRoute(route);
        setIsNavigating(true);

        // Draw route on map using the new method (with null check)
        if (mapRef.current && route.steps.length > 0) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CampusMapScreen.tsx:188',message:'drawing route on map',data:{hasMapRef:!!mapRef.current,stepCount:route.steps.length},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          const routeCoordinates = route.steps.map(s => s.coordinate);
          // Use requestAnimationFrame to prevent blocking
          requestAnimationFrame(() => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CampusMapScreen.tsx:192',message:'calling drawRoute',data:{coordinateCount:routeCoordinates.length},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            mapRef.current?.drawRoute(routeCoordinates, theme.colors.primary, 5);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CampusMapScreen.tsx:193',message:'drawRoute completed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
          });
        }

        // Voice announcement
        if (accessibilityMode) {
          speak(`Navigating to ${building.name}. Distance: ${formatDistance(route.distance)}. Estimated time: ${formatDuration(route.duration)}`);
        }
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CampusMapScreen.tsx:200',message:'route is null, showing error',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        Alert.alert('Route Error', 'Could not calculate route. Please try again.');
      }
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CampusMapScreen.tsx:203',message:'navigation error caught',data:{errorMessage:error?.message,errorType:error?.constructor?.name,isTimeout:error?.message==='Route calculation timeout'},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('Navigation error:', error);
      const message = error?.message === 'Route calculation timeout' 
        ? 'Route calculation took too long. Please try again.'
        : 'Failed to get directions. Please try again.';
      Alert.alert('Navigation Error', message);
    } finally {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CampusMapScreen.tsx:209',message:'navigateToBuilding finally block',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setIsLoading(false);
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Map */}
        <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...CAMPUS_CONFIG.center,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }}
        showsUserLocation={true}
        accessible={true}
        accessibilityLabel="Campus map"
        enable3D={is3DMode}
      >
        {/* Building Layer (enabled in 3D mode with MapLibre) */}
        <Building3DLayer
          selectedBuildingId={selectedBuilding?.id}
          visible={is3DMode}
          onBuildingPress={(buildingId) => {
            const building = BUILDINGS.find(b => b.id === buildingId);
            if (building) {
              setSelectedBuilding(building);
              setShowBuildingDetails(true);
              triggerHaptic('light');
            }
          }}
        />

        {/* Building Markers (show in 2D mode or as labels) */}
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

      {/* Map Controls (Right Side) */}
      <View style={styles.mapControls}>
        {/* Reset Orientation Button */}
        <TouchableOpacity
          style={[
            styles.mapControlButton,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.md,
              ...theme.shadows.sm,
            },
          ]}
          onPress={() => {
            mapRef.current?.resetOrientation();
            triggerHaptic('light');
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Reset map orientation to north"
        >
          <MaterialIcons name="explore" size={22} color={theme.colors.primary} />
        </TouchableOpacity>

        {/* Recenter on Campus */}
        <TouchableOpacity
          style={[
            styles.mapControlButton,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.md,
              ...theme.shadows.sm,
            },
          ]}
          onPress={() => {
            mapRef.current?.animateToRegion({
              ...CAMPUS_CONFIG.center,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            });
            triggerHaptic('light');
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Center map on campus"
        >
          <MaterialIcons name="my-location" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

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
        {/* 2D/3D Toggle Button */}
        <TouchableOpacity
          style={[
            styles.toggle3DButton,
            {
              backgroundColor: is3DMode ? theme.colors.primary : theme.colors.surface,
              borderColor: is3DMode ? theme.colors.primary : theme.colors.border,
              borderRadius: theme.borderRadius.md,
              ...theme.shadows.sm,
            },
          ]}
          onPress={() => {
            const newMode = !is3DMode;
            setIs3DMode(newMode);
            triggerHaptic('medium');

            // Toggle 3D view on the map
            mapRef.current?.set3DView(newMode);

            if (accessibilityMode) {
              speak(newMode ? 'Switched to 3D view' : 'Switched to 2D view');
            }
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={is3DMode ? 'Switch to 2D view' : 'Switch to 3D view'}
        >
          <MaterialIcons
            name={is3DMode ? 'view-in-ar' : 'map'}
            size={18}
            color={is3DMode ? theme.colors.textInverse : theme.colors.primary}
          />
          <Text style={[
            styles.toggle3DText,
            { color: is3DMode ? theme.colors.textInverse : theme.colors.primary },
          ]}>
            {is3DMode ? '3D' : '2D'}
          </Text>
        </TouchableOpacity>

        {/* Accessible Buildings Filter */}
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

        {/* Map Style Toggle Button (Satellite View) */}
        <TouchableOpacity
          style={[
            styles.accessibleFilter,
            {
              backgroundColor: isSatelliteView ? theme.colors.primary : theme.colors.surface,
              borderColor: theme.colors.primary,
              borderRadius: theme.borderRadius.full,
            },
          ]}
          onPress={() => {
            const newMode = !isSatelliteView;
            setIsSatelliteView(newMode);
            triggerHaptic('light');

            // Change map style
            mapRef.current?.changeMapStyle(newMode ? 'satellite' : 'light');

            if (accessibilityMode) {
              speak(newMode ? 'Switched to satellite view' : 'Switched to map view');
            }
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isSatelliteView ? 'Switch to map view' : 'Switch to satellite view'}
        >
          <MaterialIcons
            name={isSatelliteView ? 'satellite' : 'satellite-alt'}
            size={20}
            color={isSatelliteView ? theme.colors.textInverse : theme.colors.primary}
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
          {/* Only show building details when NOT navigating */}
          {!isNavigating && (
            <>
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

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <AccessibleButton
                  title="Get Directions"
                  icon="directions"
                  onPress={() => navigateToBuilding(selectedBuilding)}
                  accessibilityHint="Get walking directions to this building"
                />
              </View>
            </>
          )}

          {/* Turn-by-Turn Navigation Panel */}
          {isNavigating && activeRoute && (
            <View style={[styles.navigationPanel, { backgroundColor: `${theme.colors.primary}15`, borderRadius: theme.borderRadius.md }]}>
              <View style={styles.navigationHeader}>
                <MaterialIcons name="navigation" size={24} color={theme.colors.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.navInstruction, { color: theme.colors.textPrimary }]}>
                    {activeRoute.steps[0]?.instruction || 'Start walking onto 4 Street'}
                  </Text>
                  <View style={styles.navInfo}>
                    <Text style={[styles.navDistance, { color: theme.colors.textSecondary }]}>
                      {formatDistance(activeRoute.distance)} • {formatDuration(activeRoute.duration)}
                    </Text>
                  </View>
                </View>
              </View>
              <AccessibleButton
                title="Stop Navigation"
                variant="danger"
                size="small"
                onPress={() => {
                  setIsNavigating(false);
                  setActiveRoute(null);
                  setShowBuildingDetails(false);
                  // Clear the route from the map
                  mapRef.current?.clearRoute();
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
    </KeyboardAvoidingView>
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
  mapControls: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'ios' ? 180 : 160,
    gap: 8,
    zIndex: 5,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
  toggle3DButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 2,
    gap: 4,
  },
  toggle3DText: {
    fontSize: 13,
    fontWeight: '700',
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
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  navInstruction: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  navInfo: {
    marginTop: 4,
  },
  navDistance: {
    fontSize: 13,
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

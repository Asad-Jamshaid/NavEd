# React Native & Expo Performance Optimization Guide

## Best Practices for High-Performance Mobile Apps

**Last Updated:** November 2025
**Based On:** React Native 0.74+, Expo SDK 51+

---

## Table of Contents

1. [Component Optimization](#1-component-optimization)
2. [FlatList & List Performance](#2-flatlist--list-performance)
3. [Map Marker Clustering](#3-map-marker-clustering)
4. [Bundle Size Optimization](#4-bundle-size-optimization)
5. [Memory Management](#5-memory-management)
6. [Animation Performance](#6-animation-performance)
7. [Offline-First Architecture](#7-offline-first-architecture)
8. [Image Optimization](#8-image-optimization)

---

## 1. Component Optimization

### Use React.memo Wisely

```typescript
// BAD: Component re-renders on every parent render
const BuildingCard = ({ building, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(building.id)}>
      <Text>{building.name}</Text>
    </TouchableOpacity>
  );
};

// GOOD: Memoized component with proper comparison
const BuildingCard = React.memo(
  ({ building, onPress }) => {
    return (
      <TouchableOpacity onPress={() => onPress(building.id)}>
        <Text>{building.name}</Text>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison - only re-render if these change
    return (
      prevProps.building.id === nextProps.building.id &&
      prevProps.building.name === nextProps.building.name
    );
  }
);
```

### Use useCallback for Event Handlers

```typescript
// BAD: New function created every render
const MapScreen = () => {
  const [selected, setSelected] = useState(null);

  return (
    <BuildingList
      onSelect={(id) => setSelected(id)} // New function every render!
    />
  );
};

// GOOD: Stable function reference
const MapScreen = () => {
  const [selected, setSelected] = useState(null);

  const handleSelect = useCallback((id: string) => {
    setSelected(id);
  }, []); // Empty deps = stable reference

  return (
    <BuildingList onSelect={handleSelect} />
  );
};
```

### Use useMemo for Expensive Calculations

```typescript
// BAD: Filters on every render
const SearchResults = ({ buildings, searchTerm }) => {
  // This runs on EVERY render
  const filtered = buildings.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return <FlatList data={filtered} />;
};

// GOOD: Only recalculates when dependencies change
const SearchResults = ({ buildings, searchTerm }) => {
  const filtered = useMemo(() => {
    return buildings.filter(b =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [buildings, searchTerm]); // Only runs when these change

  return <FlatList data={filtered} />;
};
```

### Avoid Anonymous Functions in Props

```typescript
// BAD: Creates new object/function every render
<Marker
  coordinate={{ latitude: lat, longitude: lng }} // New object!
  onPress={() => handlePress(id)} // New function!
/>

// GOOD: Stable references
const coordinate = useMemo(() => ({ latitude: lat, longitude: lng }), [lat, lng]);
const handleMarkerPress = useCallback(() => handlePress(id), [id]);

<Marker
  coordinate={coordinate}
  onPress={handleMarkerPress}
/>
```

---

## 2. FlatList & List Performance

### Essential FlatList Props

```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}

  // Performance props
  removeClippedSubviews={true}        // Unmount off-screen items (Android)
  maxToRenderPerBatch={10}            // Items per batch (default 10)
  updateCellsBatchingPeriod={50}      // Batch delay in ms
  initialNumToRender={10}             // Initial items to render
  windowSize={5}                      // Render window multiplier

  // If items have fixed height
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Use FlashList for Better Performance

```bash
npm install @shopify/flash-list
```

```typescript
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={buildings}
  renderItem={({ item }) => <BuildingCard building={item} />}
  estimatedItemSize={100} // Required: estimated item height
  keyExtractor={item => item.id}
/>
```

### Optimized renderItem

```typescript
// BAD: Creating functions inside renderItem
const renderItem = ({ item }) => (
  <TouchableOpacity onPress={() => handlePress(item.id)}>
    <Text>{item.name}</Text>
  </TouchableOpacity>
);

// GOOD: Use onPress on parent FlatList
const ParkingList = ({ parkingLots, onSelect }) => {
  const renderItem = useCallback(({ item }) => (
    <ParkingCard parking={item} />
  ), []);

  const handlePress = useCallback((event, item) => {
    onSelect(item.id);
  }, [onSelect]);

  return (
    <FlatList
      data={parkingLots}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      onPress={handlePress} // Handle at list level
    />
  );
};
```

---

## 3. Map Marker Clustering

### Install react-native-map-clustering

```bash
npm install react-native-map-clustering
```

### Implementation

```typescript
import MapView from 'react-native-map-clustering';
import { Marker } from 'react-native-maps';

const ClusteredMap = ({ buildings }) => {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={INITIAL_REGION}
      // Clustering props
      clusterColor="#1E88E5"
      clusterTextColor="#fff"
      clusterFontFamily="System"
      radius={50}                    // Cluster radius in pixels
      maxZoom={16}                   // Max zoom for clustering
      minZoom={1}                    // Min zoom for clustering
      minPoints={2}                  // Min points to form cluster
      extent={512}                   // Tile extent
      nodeSize={64}                  // Node size for clustering
      // Performance props
      tracksViewChanges={false}      // Important for performance
      animationEnabled={false}       // Disable cluster animations
    >
      {buildings.map(building => (
        <Marker
          key={building.id}
          coordinate={building.coordinate}
          title={building.name}
          tracksViewChanges={false}  // Critical for performance
        />
      ))}
    </MapView>
  );
};
```

### Custom Cluster Component

```typescript
import MapView, { Cluster } from 'react-native-map-clustering';

const renderCluster = (cluster) => {
  const { id, geometry, onPress, properties } = cluster;
  const points = properties.point_count;

  return (
    <Marker
      key={`cluster-${id}`}
      coordinate={{
        longitude: geometry.coordinates[0],
        latitude: geometry.coordinates[1],
      }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={styles.cluster}>
        <Text style={styles.clusterText}>{points}</Text>
      </View>
    </Marker>
  );
};

<MapView
  renderCluster={renderCluster}
  // ... other props
/>
```

### For 1000+ Markers: Use react-native-clusterer

```bash
npm install react-native-clusterer
```

```typescript
import { useClusterer } from 'react-native-clusterer';

const LargeDatasetMap = ({ points }) => {
  const [region, setRegion] = useState(INITIAL_REGION);

  // Convert points to GeoJSON format
  const geoJSONPoints = useMemo(() =>
    points.map(p => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [p.longitude, p.latitude],
      },
      properties: { id: p.id, name: p.name },
    })),
    [points]
  );

  // Use clusterer hook (C++ powered - 10x faster!)
  const [clusters] = useClusterer(
    geoJSONPoints,
    { width: Dimensions.get('window').width, height: 400 },
    region
  );

  return (
    <MapView
      region={region}
      onRegionChangeComplete={setRegion}
    >
      {clusters.map(cluster => {
        if (cluster.properties.cluster) {
          return (
            <ClusterMarker
              key={cluster.properties.cluster_id}
              cluster={cluster}
            />
          );
        }
        return (
          <Marker
            key={cluster.properties.id}
            coordinate={{
              latitude: cluster.geometry.coordinates[1],
              longitude: cluster.geometry.coordinates[0],
            }}
          />
        );
      })}
    </MapView>
  );
};
```

---

## 4. Bundle Size Optimization

### Use Expo Atlas to Analyze Bundle

```bash
# Install
npx expo install expo-atlas

# Analyze
npx expo export --dump-assetmap
npx expo-atlas
```

### Tree Shaking with Imports

```typescript
// BAD: Imports entire library
import _ from 'lodash';
const result = _.map(items, fn);

// GOOD: Import only what you need
import map from 'lodash/map';
const result = map(items, fn);

// BAD: Full icon library
import { MaterialIcons } from '@expo/vector-icons';

// GOOD: Import specific icon (when possible)
// Or use a single icon set consistently
```

### Lazy Loading Screens

```typescript
import { lazy, Suspense } from 'react';

// Lazy load heavy screens
const StudyAssistantScreen = lazy(() =>
  import('./screens/StudyAssistantScreen')
);

const App = () => (
  <Suspense fallback={<LoadingScreen />}>
    <NavigationContainer>
      {/* ... */}
    </NavigationContainer>
  </Suspense>
);
```

---

## 5. Memory Management

### Clean Up Effects

```typescript
useEffect(() => {
  const subscription = someAPI.subscribe(data => {
    setData(data);
  });

  // Always clean up!
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Avoid Memory Leaks in Async Operations

```typescript
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    const result = await api.getData();

    // Only update state if still mounted
    if (isMounted) {
      setData(result);
    }
  };

  fetchData();

  return () => {
    isMounted = false;
  };
}, []);
```

### Use InteractionManager for Heavy Operations

```typescript
import { InteractionManager } from 'react-native';

useEffect(() => {
  // Wait for animations/transitions to complete
  const task = InteractionManager.runAfterInteractions(() => {
    // Do heavy work here
    processLargeDataset();
  });

  return () => task.cancel();
}, []);
```

---

## 6. Animation Performance

### Use Native Driver

```typescript
import { Animated } from 'react-native';

// GOOD: Runs on native thread
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // Critical!
}).start();
```

### Use Reanimated for Complex Animations

```bash
npx expo install react-native-reanimated
```

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedCard = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(1.1, {}, () => {
      scale.value = withSpring(1);
    });
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity onPress={handlePress}>
        {/* ... */}
      </TouchableOpacity>
    </Animated.View>
  );
};
```

---

## 7. Offline-First Architecture

### AsyncStorage with Caching

```typescript
// src/utils/cache.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

/**
 * Cache data with expiration
 */
export const cacheData = async <T>(
  key: string,
  data: T,
  expiresIn: number = 3600000 // 1 hour default
): Promise<void> => {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    expiresIn,
  };

  await AsyncStorage.setItem(key, JSON.stringify(entry));
};

/**
 * Get cached data if not expired
 */
export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const stored = await AsyncStorage.getItem(key);

    if (!stored) return null;

    const entry: CacheEntry<T> = JSON.parse(stored);
    const isExpired = Date.now() - entry.timestamp > entry.expiresIn;

    if (isExpired) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
};

/**
 * Fetch with cache fallback
 */
export const fetchWithCache = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  expiresIn?: number
): Promise<T> => {
  const netInfo = await NetInfo.fetch();

  // If offline, try cache first
  if (!netInfo.isConnected) {
    const cached = await getCachedData<T>(key);
    if (cached) return cached;
    throw new Error('No internet and no cached data');
  }

  // Try to fetch fresh data
  try {
    const freshData = await fetchFn();
    await cacheData(key, freshData, expiresIn);
    return freshData;
  } catch (error) {
    // On error, fall back to cache
    const cached = await getCachedData<T>(key);
    if (cached) return cached;
    throw error;
  }
};
```

### Usage Example

```typescript
const ParkingScreen = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const loadParkingData = async () => {
      try {
        const data = await fetchWithCache(
          'parking_lots',
          () => api.getParkingLots(),
          300000 // 5 minutes cache
        );
        setParkingLots(data);
      } catch (error) {
        console.error('Failed to load parking data:', error);
      }
    };

    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    loadParkingData();

    return unsubscribe;
  }, []);

  return (
    <View>
      {isOffline && <OfflineBanner />}
      <ParkingList data={parkingLots} />
    </View>
  );
};
```

---

## 8. Image Optimization

### Use expo-image for Better Performance

```bash
npx expo install expo-image
```

```typescript
import { Image } from 'expo-image';

const BuildingImage = ({ uri }) => (
  <Image
    source={{ uri }}
    style={styles.image}
    contentFit="cover"
    placeholder={require('./placeholder.png')}
    transition={200}
    cachePolicy="memory-disk" // Cache aggressively
  />
);
```

### Optimize Image Loading

```typescript
// Preload important images
import { Image } from 'expo-image';

const preloadImages = async () => {
  const images = [
    require('./assets/map-marker.png'),
    require('./assets/parking-icon.png'),
  ];

  await Promise.all(
    images.map(image => Image.prefetch(image))
  );
};
```

---

## Performance Checklist

### Component Level
- [ ] Use React.memo for frequently rendered components
- [ ] Use useCallback for event handlers
- [ ] Use useMemo for expensive calculations
- [ ] Avoid inline objects/functions in JSX

### Lists
- [ ] Use FlatList/FlashList instead of map()
- [ ] Implement getItemLayout for fixed-height items
- [ ] Set proper keyExtractor
- [ ] Enable removeClippedSubviews on Android

### Maps
- [ ] Implement marker clustering for 50+ markers
- [ ] Set tracksViewChanges={false} on markers
- [ ] Use react-native-clusterer for 1000+ points

### Images
- [ ] Use expo-image instead of Image
- [ ] Implement proper caching
- [ ] Use appropriate image sizes

### General
- [ ] Clean up useEffect subscriptions
- [ ] Use InteractionManager for heavy operations
- [ ] Implement offline-first caching
- [ ] Use native driver for animations

---

## Sources

- [React Native Performance](https://reactnative.dev/docs/performance)
- [Expo Best Practices for Reducing Lag](https://expo.dev/blog/best-practices-for-reducing-lag-in-expo-apps)
- [Callstack React Native Optimization Guide](https://www.callstack.com/ebooks/the-ultimate-guide-to-react-native-optimization)
- [react-native-map-clustering](https://github.com/tomekvenits/react-native-map-clustering)
- [FlashList by Shopify](https://shopify.github.io/flash-list/)

---

**Document Version:** 1.0
**Last Updated:** November 2025

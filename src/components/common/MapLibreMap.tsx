/**
 * MapLibre Map Component
 * Free, open-source alternative to Google Maps
 * Uses OpenStreetMap tiles - completely FREE!
 */

import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapLibreGL, { MapViewRef, CameraRef } from '@maplibre/maplibre-react-native';
import { useTheme } from '../../contexts/ThemeContext';

// Initialize MapLibre (required)
MapLibreGL.setAccessToken(null);

// Free OpenStreetMap tile styles
const MAP_STYLES = {
  // OpenFreeMap (free, maintained community style)
  openFreeMap: 'https://tiles.openfreemap.org/styles/liberty',
  // Alternative: OSM Bright style (free, no API key needed)
  default: 'https://demotiles.maplibre.org/style.json',
  // Alternative: Versatiles (free, colorful style)
  versatiles: 'https://tiles.versatiles.org/assets/styles/colorful.json',
};

// Types
export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Region extends Coordinate {
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapLibreMapProps {
  style?: any;
  initialRegion?: Region;
  showsUserLocation?: boolean;
  onPress?: (event: any) => void;
  onRegionChange?: (region: Region) => void;
  children?: React.ReactNode;
  accessible?: boolean;
  accessibilityLabel?: string;
}

export interface MapLibreMapRef {
  animateToRegion: (region: Region, duration?: number) => void;
  fitToCoordinates: (coordinates: Coordinate[], options?: any) => void;
  getCamera: () => Promise<any>;
}

// Main MapView Component
export const MapView = forwardRef<MapLibreMapRef, MapLibreMapProps>((props, ref) => {
  const {
    style,
    initialRegion,
    showsUserLocation = false,
    onPress,
    children,
    accessible,
    accessibilityLabel,
  } = props;

  const { theme } = useTheme();
  const mapRef = useRef<MapViewRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    animateToRegion: (region: Region, duration = 500) => {
      cameraRef.current?.setCamera({
        centerCoordinate: [region.longitude, region.latitude],
        zoomLevel: Math.log2(360 / region.latitudeDelta) - 1,
        animationDuration: duration,
      });
    },
    fitToCoordinates: (coordinates: Coordinate[], options?: any) => {
      if (coordinates.length === 0) return;

      const lngs = coordinates.map(c => c.longitude);
      const lats = coordinates.map(c => c.latitude);

      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);

      const padding = options?.edgePadding || { top: 50, right: 50, bottom: 50, left: 50 };

      cameraRef.current?.fitBounds(
        [minLng, minLat],
        [maxLng, maxLat],
        [padding.top, padding.right, padding.bottom, padding.left],
        options?.animated ? 500 : 0
      );
    },
    getCamera: async () => {
      return cameraRef.current;
    },
  }));

  const defaultCamera = initialRegion ? {
    centerCoordinate: [initialRegion.longitude, initialRegion.latitude] as [number, number],
    zoomLevel: Math.log2(360 / initialRegion.latitudeDelta) - 1,
  } : {
    centerCoordinate: [74.3587, 31.5204] as [number, number], // Default: Lahore
    zoomLevel: 15,
  };

  return (
    <View
      style={[styles.container, style]}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
    >
      <MapLibreGL.MapView
        ref={mapRef}
        style={styles.map}
        mapStyle={MAP_STYLES.openFreeMap}
        onDidFinishLoadingMap={() => setIsMapReady(true)}
        onPress={onPress}
        logoEnabled={false}
        attributionEnabled={true}
        attributionPosition={{ bottom: 8, right: 8 }}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          defaultSettings={defaultCamera}
        />

        {showsUserLocation && (
          <MapLibreGL.UserLocation
            visible={true}
            showsUserHeadingIndicator={true}
          />
        )}

        {isMapReady && children}
      </MapLibreGL.MapView>
    </View>
  );
});

// Marker Component
export interface MarkerProps {
  coordinate: Coordinate;
  title?: string;
  description?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  anchor?: { x: number; y: number };
}

export const Marker: React.FC<MarkerProps> = ({
  coordinate,
  onPress,
  children,
  anchor = { x: 0.5, y: 1 },
}) => {
  const { theme } = useTheme();
  return (
    <MapLibreGL.MarkerView
      coordinate={[coordinate.longitude, coordinate.latitude]}
      anchor={anchor}
    >
      <View onTouchEnd={onPress}>
        {children || (
          <View style={[styles.defaultMarker, { backgroundColor: theme.colors.primary, borderColor: theme.colors.surface }]}>
            <View style={[styles.defaultMarkerInner, { backgroundColor: theme.colors.surface }]} />
          </View>
        )}
      </View>
    </MapLibreGL.MarkerView>
  );
};

// Polyline Component
export interface PolylineProps {
  coordinates: Coordinate[];
  strokeColor?: string;
  strokeWidth?: number;
}

let polylineCounter = 0;

export const Polyline: React.FC<PolylineProps> = ({
  coordinates,
  strokeColor = '#2563EB', // Default primary color (will be overridden by parent)
  strokeWidth = 4,
}) => {
  if (coordinates.length < 2) return null;

  const lineCoordinates = coordinates.map(c => [c.longitude, c.latitude]);
  const id = `route-${++polylineCounter}`;

  const lineStyle = {
    lineColor: strokeColor,
    lineWidth: strokeWidth,
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
  };

  return (
    <MapLibreGL.ShapeSource
      id={id}
      shape={{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: lineCoordinates,
        },
      }}
    >
      <MapLibreGL.LineLayer
        id={`${id}-line`}
        style={lineStyle}
      />
    </MapLibreGL.ShapeSource>
  );
};

// Circle Component (for location accuracy indicator)
export interface CircleProps {
  center: Coordinate;
  radius: number; // in meters
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

let circleCounter = 0;

export const Circle: React.FC<CircleProps> = ({
  center,
  radius,
  fillColor = 'rgba(37, 99, 235, 0.2)', // Default primary with opacity
  strokeColor = '#2563EB', // Default primary color
  strokeWidth = 2,
}) => {
  // Create a circle polygon approximation
  const points = 64;
  const coordinates: [number, number][] = [];
  const id = `circle-${++circleCounter}`;

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const lat = center.latitude + (radius / 111320) * Math.cos(angle);
    const lng = center.longitude + (radius / (111320 * Math.cos(center.latitude * Math.PI / 180))) * Math.sin(angle);
    coordinates.push([lng, lat]);
  }

  return (
    <MapLibreGL.ShapeSource
      id={id}
      shape={{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      }}
    >
      <MapLibreGL.FillLayer
        id={`${id}-fill`}
        style={{ fillColor, fillOpacity: 0.3 }}
      />
      <MapLibreGL.LineLayer
        id={`${id}-stroke`}
        style={{ lineColor: strokeColor, lineWidth: strokeWidth }}
      />
    </MapLibreGL.ShapeSource>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  defaultMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  defaultMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default MapView;

/**
 * OpenStreetMap WebView Component
 * Uses Leaflet.js via WebView for reliable map rendering
 * 100% FREE - No API keys required!
 */

import React, { forwardRef, useImperativeHandle, useRef, useState, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../contexts/ThemeContext';

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

export interface MarkerProps {
  coordinate: Coordinate;
  title?: string;
  description?: string;
  onPress?: () => void;
  children?: React.ReactNode;
}

export interface PolylineProps {
  coordinates: Coordinate[];
  strokeColor?: string;
  strokeWidth?: number;
}

export interface CircleProps {
  center: Coordinate;
  radius: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

// Collect markers from children
const extractMarkers = (children: React.ReactNode): MarkerProps[] => {
  const markers: MarkerProps[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === Marker) {
      markers.push(child.props as MarkerProps);
    }
  });
  return markers;
};

// Collect polylines from children
const extractPolylines = (children: React.ReactNode): PolylineProps[] => {
  const polylines: PolylineProps[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === Polyline) {
      polylines.push(child.props as PolylineProps);
    }
  });
  return polylines;
};

// Generate Leaflet HTML
const generateMapHTML = (
  center: Coordinate,
  zoom: number,
  markers: MarkerProps[],
  polylines: PolylineProps[],
  showUserLocation: boolean,
  primaryColor: string
) => {
  const markersJS = markers.map((m, i) => `
    (function() {
      var icon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: ${primaryColor}; width: 36px; height: 36px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="color: white; font-size: 16px; font-weight: bold;">${(i + 1)}</div></div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
      });
      L.marker([${m.coordinate.latitude}, ${m.coordinate.longitude}], { icon: icon })
        .addTo(map)
        .bindPopup('<b>${(m.title || 'Location').replace(/'/g, "\\'")}</b>${m.description ? '<br>' + m.description.replace(/'/g, "\\'") : ''}')
        .on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerPress',
            index: ${i},
            coordinate: { latitude: ${m.coordinate.latitude}, longitude: ${m.coordinate.longitude} }
          }));
        });
    })();
  `).join('\n');

  const polylinesJS = polylines.map((p, i) => `
    L.polyline([${p.coordinates.map(c => `[${c.latitude}, ${c.longitude}]`).join(',')}], {
      color: '${p.strokeColor || primaryColor}',
      weight: ${p.strokeWidth || 4}
    }).addTo(map);
  `).join('\n');

  const userLocationJS = showUserLocation ? `
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var userMarker = L.circleMarker([position.coords.latitude, position.coords.longitude], {
          radius: 8,
          fillColor: '#4285F4',
          color: '#ffffff',
          weight: 3,
          fillOpacity: 1
        }).addTo(map);

        L.circle([position.coords.latitude, position.coords.longitude], {
          radius: position.coords.accuracy,
          fillColor: '#4285F4',
          fillOpacity: 0.15,
          color: '#4285F4',
          weight: 1
        }).addTo(map);
      });
    }
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .leaflet-control-attribution { font-size: 10px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: true,
      attributionControl: true
    }).setView([${center.latitude}, ${center.longitude}], ${zoom});

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // Add markers
    ${markersJS}

    // Add polylines
    ${polylinesJS}

    // User location
    ${userLocationJS}

    // Handle map clicks
    map.on('click', function(e) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'mapPress',
        coordinate: { latitude: e.latlng.lat, longitude: e.latlng.lng }
      }));
    });

    // Functions callable from React Native
    window.flyTo = function(lat, lng, zoom) {
      map.flyTo([lat, lng], zoom || map.getZoom());
    };

    window.fitBounds = function(bounds) {
      map.fitBounds(bounds);
    };
  </script>
</body>
</html>
`;
};

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
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  const center = initialRegion || { latitude: 31.5204, longitude: 74.3587 };
  const zoom = initialRegion ? Math.round(Math.log2(360 / initialRegion.latitudeDelta)) : 15;

  const markers = extractMarkers(children);
  const polylines = extractPolylines(children);

  // Generate a key based on marker coordinates to force re-render when markers change
  const mapKey = useMemo(() => {
    const markerKey = markers.map(m => `${m.coordinate.latitude},${m.coordinate.longitude}`).join('|');
    const polylineKey = polylines.length.toString();
    return `map-${markerKey}-${polylineKey}`;
  }, [markers, polylines]);

  const html = useMemo(
    () => generateMapHTML(center, zoom, markers, polylines, showsUserLocation, theme.colors.primary),
    [center, zoom, markers, polylines, showsUserLocation, theme.colors.primary]
  );

  useImperativeHandle(ref, () => ({
    animateToRegion: (region: Region, duration = 500) => {
      const newZoom = Math.round(Math.log2(360 / region.latitudeDelta));
      webViewRef.current?.injectJavaScript(`
        window.flyTo(${region.latitude}, ${region.longitude}, ${newZoom});
        true;
      `);
    },
    fitToCoordinates: (coordinates: Coordinate[], options?: any) => {
      if (coordinates.length === 0) return;
      const bounds = coordinates.map(c => [c.latitude, c.longitude]);
      webViewRef.current?.injectJavaScript(`
        window.fitBounds(${JSON.stringify(bounds)});
        true;
      `);
    },
    getCamera: async () => {
      return null;
    },
  }));

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapPress' && onPress) {
        onPress({ nativeEvent: { coordinate: data.coordinate } });
      }
      if (data.type === 'markerPress') {
        const marker = markers[data.index];
        if (marker?.onPress) {
          marker.onPress();
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  };

  return (
    <View
      style={[styles.container, style]}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
    >
      <WebView
        key={mapKey}
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        geolocationEnabled={showsUserLocation}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        cacheEnabled={false}
        originWhitelist={['*']}
      />
      {isLoading && (
        <View style={[styles.loadingOverlay, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textPrimary }]}>Loading map...</Text>
        </View>
      )}
    </View>
  );
});

// Marker Component (used for data extraction, not rendering)
export const Marker: React.FC<MarkerProps> = () => null;

// Polyline Component (used for data extraction, not rendering)
export const Polyline: React.FC<PolylineProps> = () => null;

// Circle Component
export const Circle: React.FC<CircleProps> = () => null;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
});

export default MapView;

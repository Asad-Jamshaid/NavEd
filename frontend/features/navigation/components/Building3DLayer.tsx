// ==========================================
// 3D Building Layer Component
// Renders campus buildings as 3D extrusions using MapLibre
// ==========================================

import React, { useMemo } from 'react';
import MapLibreGL from '@maplibre/maplibre-react-native';
import {
  BUILDING_FOOTPRINTS,
  footprintsToGeoJSON,
  CATEGORY_COLORS,
  CATEGORY_COLORS_SELECTED,
} from '../../../shared/data/buildingFootprints';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { BuildingCategory } from '../../../shared/types';

interface Building3DLayerProps {
  selectedBuildingId?: string;
  visible?: boolean;
  onBuildingPress?: (buildingId: string) => void;
}

export default function Building3DLayer({
  selectedBuildingId,
  visible = true,
  onBuildingPress,
}: Building3DLayerProps) {
  const { theme } = useTheme();

  // Generate GeoJSON with selection state
  const geoJSON = useMemo(() => {
    return footprintsToGeoJSON(BUILDING_FOOTPRINTS, selectedBuildingId);
  }, [selectedBuildingId]);

  // Create color expression for MapLibre based on category
  const fillColorExpression: any = useMemo(() => {
    const cases: any[] = [];

    // Add selected building case first (higher priority)
    Object.keys(CATEGORY_COLORS_SELECTED).forEach(category => {
      cases.push(
        ['all',
          ['==', ['get', 'isSelected'], true],
          ['==', ['get', 'category'], category]
        ],
        CATEGORY_COLORS_SELECTED[category as BuildingCategory]
      );
    });

    // Add regular category colors
    Object.keys(CATEGORY_COLORS).forEach(category => {
      cases.push(
        ['==', ['get', 'category'], category],
        CATEGORY_COLORS[category as BuildingCategory]
      );
    });

    return [
      'case',
      ...cases,
      '#94A3B8', // Default fallback color
    ];
  }, []);

  // Height expression - taller when selected for emphasis
  const heightExpression: any = useMemo(() => {
    return [
      'case',
      ['==', ['get', 'isSelected'], true],
      ['+', ['get', 'height'], 4], // Add 4m when selected for more emphasis
      ['get', 'height'],
    ];
  }, []);

  // Base height expression - slight lift for 3D effect
  const baseHeightExpression: any = useMemo(() => {
    return [
      'case',
      ['==', ['get', 'isSelected'], true],
      1, // Slight lift when selected
      ['get', 'baseHeight'],
    ];
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Main 3D Buildings Layer */}
      <MapLibreGL.ShapeSource
        id="buildings-3d-source"
        shape={geoJSON}
        onPress={(e) => {
          if (onBuildingPress && e.features?.[0]?.properties?.buildingId) {
            onBuildingPress(e.features[0].properties.buildingId);
          }
        }}
      >
        {/* 3D Extrusion Layer - Enhanced styling for satellite view */}
        <MapLibreGL.FillExtrusionLayer
          id="buildings-3d-fill"
          style={{
            fillExtrusionColor: fillColorExpression,
            fillExtrusionHeight: heightExpression,
            fillExtrusionBase: baseHeightExpression,
            // Higher opacity for better visibility over satellite imagery
            fillExtrusionOpacity: 0.88,
            // Enable vertical gradient for realistic 3D shading
            fillExtrusionVerticalGradient: true,
          }}
        />

        {/* Building Outline - Enhanced definition with glow effect */}
        <MapLibreGL.LineLayer
          id="buildings-3d-outline"
          style={{
            lineColor: [
              'case',
              ['==', ['get', 'isSelected'], true],
              theme.isDark ? '#60A5FA' : '#2563EB', // Blue glow when selected
              theme.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(31,41,55,0.6)',
            ],
            lineWidth: [
              'case',
              ['==', ['get', 'isSelected'], true],
              3,
              1.5,
            ],
            lineOpacity: [
              'case',
              ['==', ['get', 'isSelected'], true],
              1,
              theme.isDark ? 0.4 : 0.5,
            ],
          }}
        />
      </MapLibreGL.ShapeSource>

      {/* Building Labels (at top of buildings) - Enhanced styling */}
      <MapLibreGL.ShapeSource
        id="building-labels-source"
        shape={geoJSON}
      >
        <MapLibreGL.SymbolLayer
          id="building-labels"
          minZoomLevel={15.5}
          style={{
            textField: ['get', 'name'],
            textSize: [
              'interpolate', ['linear'], ['zoom'],
              15.5, 10,
              17, 12,
              19, 14,
            ],
            textColor: theme.isDark ? '#F9FAFB' : '#1F2937',
            textHaloColor: theme.isDark ? 'rgba(31,41,55,0.9)' : 'rgba(255,255,255,0.95)',
            textHaloWidth: 2,
            textHaloBlur: 0.5,
            textAnchor: 'center',
            textOffset: [0, 0],
            textAllowOverlap: false,
            textIgnorePlacement: false,
            textLetterSpacing: 0.05,
            textTransform: 'uppercase',
            symbolPlacement: 'point',
            textFont: ['Open Sans Bold', 'Arial Unicode MS Bold'],
          }}
        />
      </MapLibreGL.ShapeSource>
    </>
  );
}

// Separate shadow layer for more realistic 3D effect
export function Building3DShadowLayer({ visible = true }: { visible?: boolean }) {
  const geoJSON = useMemo(() => {
    return footprintsToGeoJSON(BUILDING_FOOTPRINTS);
  }, []);

  if (!visible) return null;

  return (
    <MapLibreGL.ShapeSource
      id="buildings-shadow-source"
      shape={geoJSON}
    >
      <MapLibreGL.FillLayer
        id="buildings-shadow"
        style={{
          fillColor: '#000000',
          fillOpacity: 0.15,
          fillTranslate: [3, 3], // Offset for shadow effect
        }}
        belowLayerID="buildings-3d-fill"
      />
    </MapLibreGL.ShapeSource>
  );
}

export { CATEGORY_COLORS, CATEGORY_COLORS_SELECTED };

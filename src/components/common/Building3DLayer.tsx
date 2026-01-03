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
} from '../../data/buildingFootprints';
import { useTheme } from '../../contexts/ThemeContext';
import { BuildingCategory } from '../../types';

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

  // Height expression - slightly taller when selected
  const heightExpression: any = useMemo(() => {
    return [
      'case',
      ['==', ['get', 'isSelected'], true],
      ['+', ['get', 'height'], 2], // Add 2m when selected
      ['get', 'height'],
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
        {/* 3D Extrusion Layer */}
        <MapLibreGL.FillExtrusionLayer
          id="buildings-3d-fill"
          style={{
            fillExtrusionColor: fillColorExpression,
            fillExtrusionHeight: heightExpression,
            fillExtrusionBase: ['get', 'baseHeight'],
            fillExtrusionOpacity: theme.isDark ? 0.85 : 0.9,
            // Add slight vertical gradient for realism
            fillExtrusionVerticalGradient: true,
          }}
        />

        {/* Building Outline for definition */}
        <MapLibreGL.LineLayer
          id="buildings-3d-outline"
          style={{
            lineColor: theme.isDark ? '#FFFFFF' : '#1F2937',
            lineWidth: [
              'case',
              ['==', ['get', 'isSelected'], true],
              2.5,
              1,
            ],
            lineOpacity: theme.isDark ? 0.3 : 0.4,
          }}
        />
      </MapLibreGL.ShapeSource>

      {/* Building Labels (at top of buildings) */}
      <MapLibreGL.ShapeSource
        id="building-labels-source"
        shape={geoJSON}
      >
        <MapLibreGL.SymbolLayer
          id="building-labels"
          minZoomLevel={16}
          style={{
            textField: ['get', 'name'],
            textSize: 11,
            textColor: theme.isDark ? '#F9FAFB' : '#1F2937',
            textHaloColor: theme.isDark ? '#1F2937' : '#FFFFFF',
            textHaloWidth: 1.5,
            textHaloBlur: 0.5,
            textAnchor: 'center',
            textOffset: [0, 0],
            textAllowOverlap: false,
            textIgnorePlacement: false,
            // Position labels based on height
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

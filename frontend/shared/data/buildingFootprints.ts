// ==========================================
// UCP Campus 3D Building Footprints
// Detailed polygon data for 3D extrusion rendering
// ==========================================

import { BuildingCategory } from '../types';

// ==========================================
// TYPES
// ==========================================

export interface BuildingFootprint {
  id: string;
  buildingId: string;
  name: string;
  coordinates: [number, number][];  // [longitude, latitude][] - GeoJSON format
  height: number;  // Height in meters
  baseHeight: number;  // Base elevation (for multi-level structures)
  category: BuildingCategory;
}

// Helper to create footprints - offset from center point
// 1 degree latitude ≈ 111,320 meters
// 1 degree longitude ≈ 111,320 * cos(latitude) meters ≈ 95,500 meters at 31.4°N
const METER_TO_LAT = 1 / 111320;
const METER_TO_LNG = 1 / 95500;  // Approximate for Lahore latitude

// Create a rectangle footprint from center, width (E-W), and depth (N-S) in meters
function createRect(
  centerLng: number,
  centerLat: number,
  widthM: number,
  depthM: number
): [number, number][] {
  const halfW = (widthM / 2) * METER_TO_LNG;
  const halfD = (depthM / 2) * METER_TO_LAT;

  return [
    [centerLng - halfW, centerLat + halfD],  // NW
    [centerLng + halfW, centerLat + halfD],  // NE
    [centerLng + halfW, centerLat - halfD],  // SE
    [centerLng - halfW, centerLat - halfD],  // SW
    [centerLng - halfW, centerLat + halfD],  // Close ring
  ];
}

// Create L-shaped footprint
function createLShape(
  centerLng: number,
  centerLat: number,
  mainWidth: number,
  mainDepth: number,
  wingWidth: number,
  wingDepth: number,
  wingPosition: 'NE' | 'SE' | 'SW' | 'NW'
): [number, number][] {
  const mW = mainWidth * METER_TO_LNG;
  const mD = mainDepth * METER_TO_LAT;
  const wW = wingWidth * METER_TO_LNG;
  const wD = wingDepth * METER_TO_LAT;

  // Base rectangle coordinates
  const west = centerLng - mW / 2;
  const east = centerLng + mW / 2;
  const north = centerLat + mD / 2;
  const south = centerLat - mD / 2;

  switch (wingPosition) {
    case 'NE':
      return [
        [west, north],
        [east, north],
        [east, north - wD],
        [east - wW, north - wD],
        [east - wW, south],
        [west, south],
        [west, north],
      ];
    case 'SE':
      return [
        [west, north],
        [east - wW, north],
        [east - wW, south + wD],
        [east, south + wD],
        [east, south],
        [west, south],
        [west, north],
      ];
    case 'SW':
      return [
        [west, north],
        [east, north],
        [east, south],
        [west + wW, south],
        [west + wW, south + wD],
        [west, south + wD],
        [west, north],
      ];
    case 'NW':
    default:
      return [
        [west, north - wD],
        [west + wW, north - wD],
        [west + wW, north],
        [east, north],
        [east, south],
        [west, south],
        [west, north - wD],
      ];
  }
}

// Create U-shaped footprint (for buildings with courtyard)
function createUShape(
  centerLng: number,
  centerLat: number,
  outerWidth: number,
  outerDepth: number,
  innerWidth: number,
  innerDepth: number,
  openSide: 'N' | 'S' | 'E' | 'W'
): [number, number][] {
  const oW = outerWidth * METER_TO_LNG;
  const oD = outerDepth * METER_TO_LAT;
  const iW = innerWidth * METER_TO_LNG;
  const iD = innerDepth * METER_TO_LAT;

  const west = centerLng - oW / 2;
  const east = centerLng + oW / 2;
  const north = centerLat + oD / 2;
  const south = centerLat - oD / 2;

  const innerWest = centerLng - iW / 2;
  const innerEast = centerLng + iW / 2;

  if (openSide === 'S') {
    return [
      [west, north],
      [east, north],
      [east, south],
      [innerEast, south],
      [innerEast, south + iD],
      [innerWest, south + iD],
      [innerWest, south],
      [west, south],
      [west, north],
    ];
  }
  // Default: open to South
  return [
    [west, north],
    [east, north],
    [east, south],
    [innerEast, south],
    [innerEast, north - iD],
    [innerWest, north - iD],
    [innerWest, south],
    [west, south],
    [west, north],
  ];
}

// ==========================================
// BUILDING FOOTPRINTS DATA
// ==========================================

export const BUILDING_FOOTPRINTS: BuildingFootprint[] = [
  // Building A - Main Academic Building (4 floors) - Large L-shaped
  {
    id: 'fp-1',
    buildingId: 'bld-1',
    name: 'Building A',
    coordinates: createLShape(74.267673, 31.446939, 50, 35, 20, 15, 'SE'),
    height: 14,  // 4 floors × 3.5m
    baseHeight: 0,
    category: 'academic',
  },

  // Building B - Academic (4 floors) - L-shaped
  {
    id: 'fp-2',
    buildingId: 'bld-2',
    name: 'Building B',
    coordinates: createLShape(74.267917, 31.447621, 45, 30, 18, 12, 'NW'),
    height: 14,
    baseHeight: 0,
    category: 'academic',
  },

  // Building C - Academic with cafeteria (4 floors) - U-shaped
  {
    id: 'fp-3',
    buildingId: 'bld-3',
    name: 'Building C',
    coordinates: createUShape(74.268277, 31.448067, 55, 40, 25, 20, 'S'),
    height: 14,
    baseHeight: 0,
    category: 'academic',
  },

  // Building D / Faculty Offices (3 floors) - Rectangle
  {
    id: 'fp-4',
    buildingId: 'bld-4',
    name: 'Building D',
    coordinates: createRect(74.267344, 31.446317, 40, 25),
    height: 10.5,  // 3 floors
    baseHeight: 0,
    category: 'administrative',
  },

  // Admission Office (2 floors) - Small rectangle
  {
    id: 'fp-5',
    buildingId: 'bld-5',
    name: 'Admission Office',
    coordinates: createRect(74.267797, 31.447117, 25, 15),
    height: 7,  // 2 floors
    baseHeight: 0,
    category: 'administrative',
  },

  // UCP Library (3 floors) - Large rectangle with stepped design
  {
    id: 'fp-6',
    buildingId: 'bld-6',
    name: 'UCP Library',
    coordinates: createRect(74.26774, 31.447767, 50, 35),
    height: 12,  // 3 floors with high ceilings
    baseHeight: 0,
    category: 'library',
  },

  // Auditorium (2 floors) - Wide rectangle with dome effect
  {
    id: 'fp-7',
    buildingId: 'bld-7',
    name: 'Auditorium',
    coordinates: createRect(74.268152, 31.446688, 45, 30),
    height: 10,  // 2 floors with high ceiling
    baseHeight: 0,
    category: 'other',
  },

  // Sports Complex (4 floors) - Large L-shaped
  {
    id: 'fp-8',
    buildingId: 'bld-8',
    name: 'Sports Complex',
    coordinates: createLShape(74.267212, 31.447088, 55, 40, 25, 20, 'NE'),
    height: 14,
    baseHeight: 0,
    category: 'sports',
  },

  // Amphitheater (1 floor) - Semi-circular approximation (octagon)
  {
    id: 'fp-9',
    buildingId: 'bld-9',
    name: 'Amphitheater',
    coordinates: [
      [74.267394, 31.447432],
      [74.267494, 31.447432],
      [74.267564, 31.447382],
      [74.267564, 31.447282],
      [74.267494, 31.447232],
      [74.267394, 31.447232],
      [74.267324, 31.447282],
      [74.267324, 31.447382],
      [74.267394, 31.447432],
    ],
    height: 5,  // Open structure
    baseHeight: 0,
    category: 'other',
  },

  // Examination Office (2 floors) - Small rectangle
  {
    id: 'fp-10',
    buildingId: 'bld-10',
    name: 'Examination Office',
    coordinates: createRect(74.267671, 31.44682, 20, 15),
    height: 7,
    baseHeight: 0,
    category: 'administrative',
  },

  // Student Service Center (2 floors) - Rectangle
  {
    id: 'fp-11',
    buildingId: 'bld-11',
    name: 'Student Service Center',
    coordinates: createRect(74.267904, 31.446955, 22, 18),
    height: 7,
    baseHeight: 0,
    category: 'administrative',
  },

  // VIS Office (1 floor) - Small rectangle
  {
    id: 'fp-12',
    buildingId: 'bld-12',
    name: 'VIS Office',
    coordinates: createRect(74.2681, 31.446673, 15, 12),
    height: 3.5,
    baseHeight: 0,
    category: 'administrative',
  },

  // Takhleeq Incubator (2 floors) - Modern rectangle
  {
    id: 'fp-13',
    buildingId: 'bld-13',
    name: 'Takhleeq Incubator',
    coordinates: createRect(74.267124, 31.446355, 30, 20),
    height: 8,
    baseHeight: 0,
    category: 'other',
  },

  // Civil Block A (3 floors) - L-shaped
  {
    id: 'fp-14',
    buildingId: 'bld-14',
    name: 'Civil Block A',
    coordinates: createLShape(74.267121, 31.446554, 35, 25, 15, 12, 'SW'),
    height: 10.5,
    baseHeight: 0,
    category: 'academic',
  },

  // Civil Block B (3 floors) - Rectangle
  {
    id: 'fp-15',
    buildingId: 'bld-15',
    name: 'Civil Block B',
    coordinates: createRect(74.266957, 31.44639, 30, 22),
    height: 10.5,
    baseHeight: 0,
    category: 'academic',
  },

  // Mechanical Block (3 floors) - L-shaped workshop
  {
    id: 'fp-16',
    buildingId: 'bld-16',
    name: 'Mechanical Block',
    coordinates: createLShape(74.267207, 31.446731, 40, 28, 18, 14, 'NE'),
    height: 10.5,
    baseHeight: 0,
    category: 'academic',
  },

  // Fabrication Shop (1 floor) - Large single-story workshop
  {
    id: 'fp-17',
    buildingId: 'bld-17',
    name: 'Fabrication Shop',
    coordinates: createRect(74.26715, 31.44685, 35, 25),
    height: 6,  // High ceiling workshop
    baseHeight: 0,
    category: 'academic',
  },

  // C Block Offices (2 floors) - Rectangle
  {
    id: 'fp-18',
    buildingId: 'bld-18',
    name: 'C Block Offices',
    coordinates: createRect(74.267016, 31.447159, 25, 18),
    height: 7,
    baseHeight: 0,
    category: 'administrative',
  },

  // Book Shop (1 floor) - Small rectangle
  {
    id: 'fp-19',
    buildingId: 'bld-19',
    name: 'Book Shop',
    coordinates: createRect(74.267376, 31.447502, 18, 12),
    height: 4,
    baseHeight: 0,
    category: 'other',
  },

  // Cafe A (1 floor) - Rectangle
  {
    id: 'fp-20',
    buildingId: 'bld-20',
    name: 'Cafe A',
    coordinates: createRect(74.267786, 31.447332, 20, 15),
    height: 4,
    baseHeight: 0,
    category: 'cafeteria',
  },

  // C Cafe (1 floor) - Rectangle
  {
    id: 'fp-21',
    buildingId: 'bld-21',
    name: 'C Cafe',
    coordinates: createRect(74.268376, 31.448122, 22, 16),
    height: 4,
    baseHeight: 0,
    category: 'cafeteria',
  },

  // Food Street (1 floor) - Long narrow structure
  {
    id: 'fp-22',
    buildingId: 'bld-22',
    name: 'Food Street',
    coordinates: createRect(74.267877, 31.446545, 40, 12),
    height: 4,
    baseHeight: 0,
    category: 'cafeteria',
  },

  // Wudu Area (1 floor) - Small structure
  {
    id: 'fp-23',
    buildingId: 'bld-23',
    name: 'Wudu Area',
    coordinates: createRect(74.267317, 31.447344, 15, 10),
    height: 3,
    baseHeight: 0,
    category: 'other',
  },

  // A Building Lobby (1 floor) - Entrance structure
  {
    id: 'fp-24',
    buildingId: 'bld-24',
    name: 'A Building Lobby',
    coordinates: createRect(74.267831, 31.446958, 18, 12),
    height: 5,  // Tall lobby
    baseHeight: 0,
    category: 'other',
  },
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getFootprintByBuildingId(buildingId: string): BuildingFootprint | undefined {
  return BUILDING_FOOTPRINTS.find(fp => fp.buildingId === buildingId);
}

export function getFootprintsByCategory(category: BuildingCategory): BuildingFootprint[] {
  return BUILDING_FOOTPRINTS.filter(fp => fp.category === category);
}

// Convert footprints to GeoJSON FeatureCollection for MapLibre
export function footprintsToGeoJSON(
  footprints: BuildingFootprint[] = BUILDING_FOOTPRINTS,
  selectedId?: string
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: footprints.map(fp => ({
      type: 'Feature' as const,
      id: fp.id,
      properties: {
        id: fp.id,
        buildingId: fp.buildingId,
        name: fp.name,
        height: fp.height,
        baseHeight: fp.baseHeight,
        category: fp.category,
        isSelected: fp.buildingId === selectedId,
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [fp.coordinates],
      },
    })),
  };
}

// Category colors for 3D buildings - Rich, vibrant colors
export const CATEGORY_COLORS: Record<BuildingCategory, string> = {
  academic: '#1D4ED8',      // Deep Blue - academic excellence
  administrative: '#475569', // Cool Slate - professional
  library: '#D97706',       // Rich Amber - knowledge warmth
  cafeteria: '#EA580C',     // Vibrant Orange - social energy
  sports: '#059669',        // Emerald - vitality
  hostel: '#7C3AED',        // Vivid Purple - residential
  medical: '#DC2626',       // Strong Red - health importance
  parking: '#6B7280',       // Neutral Gray - utility
  other: '#0D9488',         // Rich Teal - versatility
};

// Brighter colors for selected/highlighted buildings
export const CATEGORY_COLORS_SELECTED: Record<BuildingCategory, string> = {
  academic: '#60A5FA',      // Bright Blue glow
  administrative: '#CBD5E1', // Light Slate highlight
  library: '#FCD34D',       // Golden highlight
  cafeteria: '#FDBA74',     // Warm Orange glow
  sports: '#6EE7B7',        // Bright Green
  hostel: '#C4B5FD',        // Soft Purple glow
  medical: '#FCA5A5',       // Soft Red highlight
  parking: '#E5E7EB',       // Light Gray
  other: '#5EEAD4',         // Bright Teal
};

export default BUILDING_FOOTPRINTS;

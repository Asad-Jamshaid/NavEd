// ==========================================
// Navigation Service - FREE OpenStreetMap APIs
// No cost for routing and geocoding!
// ==========================================

import { Coordinate, NavigationRoute, NavigationStep, Building } from '../types';
import { BUILDINGS, ROOMS } from '../data/campusData';
import { OSM_CONFIG } from '../utils/constants';

// ==========================================
// OSRM Routing (Completely FREE)
// ==========================================
interface OSRMRoute {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
  };
  legs: {
    steps: {
      distance: number;
      duration: number;
      maneuver: {
        type: string;
        modifier?: string;
        location: [number, number];
      };
      name: string;
    }[];
  }[];
}

export async function getRoute(
  from: Coordinate,
  to: Coordinate,
  accessibleOnly: boolean = false
): Promise<NavigationRoute | null> {
  try {
    // Using OSRM demo server (FREE, but rate-limited)
    // For production, you can self-host OSRM for FREE
    const profile = accessibleOnly ? 'foot' : 'foot'; // Use foot for campus navigation
    const url = `${OSM_CONFIG.routingApiUrl}/${profile}/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes?.length) {
      // Fallback to direct route calculation
      return calculateDirectRoute(from, to);
    }

    const osrmRoute: OSRMRoute = data.routes[0];

    const steps: NavigationStep[] = osrmRoute.legs[0]?.steps.map((step, index) => ({
      instruction: formatInstruction(step.maneuver.type, step.maneuver.modifier, step.name),
      distance: step.distance,
      duration: step.duration,
      maneuver: mapManeuverType(step.maneuver.type, step.maneuver.modifier),
      coordinate: {
        latitude: step.maneuver.location[1],
        longitude: step.maneuver.location[0],
      },
      isIndoor: false,
    })) || [];

    return {
      id: `route-${Date.now()}`,
      fromLocation: from,
      toLocation: to,
      distance: osrmRoute.distance,
      duration: osrmRoute.duration,
      steps,
      isAccessible: accessibleOnly,
    };
  } catch (error) {
    console.error('Error fetching route:', error);
    // Fallback to direct calculation
    return calculateDirectRoute(from, to);
  }
}

// ==========================================
// Fallback Direct Route Calculation
// Works offline without any API
// ==========================================
function calculateDirectRoute(from: Coordinate, to: Coordinate): NavigationRoute {
  const distance = calculateDistance(from, to);
  const duration = distance / 1.4; // Average walking speed ~1.4 m/s

  // Create simple waypoints
  const steps: NavigationStep[] = [
    {
      instruction: 'Start walking towards your destination',
      distance: 0,
      duration: 0,
      maneuver: 'straight',
      coordinate: from,
      isIndoor: false,
    },
    {
      instruction: `Continue for ${Math.round(distance)} meters`,
      distance: distance,
      duration: duration,
      maneuver: 'straight',
      coordinate: {
        latitude: (from.latitude + to.latitude) / 2,
        longitude: (from.longitude + to.longitude) / 2,
      },
      isIndoor: false,
    },
    {
      instruction: 'You have arrived at your destination',
      distance: 0,
      duration: 0,
      maneuver: 'arrive',
      coordinate: to,
      isIndoor: false,
    },
  ];

  return {
    id: `route-${Date.now()}`,
    fromLocation: from,
    toLocation: to,
    distance,
    duration,
    steps,
    isAccessible: true, // Assume direct route is accessible
  };
}

// ==========================================
// Haversine Distance Calculation (Offline)
// ==========================================
export function calculateDistance(from: Coordinate, to: Coordinate): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (from.latitude * Math.PI) / 180;
  const φ2 = (to.latitude * Math.PI) / 180;
  const Δφ = ((to.latitude - from.latitude) * Math.PI) / 180;
  const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// ==========================================
// Geocoding with Nominatim (FREE)
// ==========================================
export async function searchLocation(query: string): Promise<Coordinate | null> {
  try {
    // First check local campus data
    const localResult = searchLocalData(query);
    if (localResult) return localResult;

    // Fall back to Nominatim (FREE, but respect usage policy)
    const url = `${OSM_CONFIG.geocodingApiUrl}/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NavEd Campus Navigation App',
      },
    });
    const data = await response.json();

    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Search local campus data first (no API needed)
function searchLocalData(query: string): Coordinate | null {
  const lowerQuery = query.toLowerCase();

  // Search buildings
  const building = BUILDINGS.find(
    b =>
      b.name.toLowerCase().includes(lowerQuery) ||
      b.shortName.toLowerCase() === lowerQuery
  );
  if (building) {
    return { latitude: building.latitude, longitude: building.longitude };
  }

  // Search rooms
  const room = ROOMS.find(
    r =>
      r.name.toLowerCase().includes(lowerQuery) ||
      r.roomNumber.toLowerCase() === lowerQuery
  );
  if (room) {
    const roomBuilding = BUILDINGS.find(b => b.id === room.buildingId);
    if (roomBuilding) {
      return { latitude: roomBuilding.latitude, longitude: roomBuilding.longitude };
    }
  }

  return null;
}

// ==========================================
// Indoor Navigation (Offline, Pre-calculated)
// ==========================================
export function getIndoorRoute(
  buildingId: string,
  fromFloor: number,
  fromRoom: string,
  toFloor: number,
  toRoom: string
): NavigationStep[] {
  const building = BUILDINGS.find(b => b.id === buildingId);
  if (!building) return [];

  const steps: NavigationStep[] = [];
  const hasElevator = building.accessibilityFeatures.includes('elevator');

  // Start instruction
  steps.push({
    instruction: `Starting from Room ${fromRoom} on Floor ${fromFloor}`,
    distance: 0,
    duration: 0,
    maneuver: 'straight',
    coordinate: { latitude: building.latitude, longitude: building.longitude },
    isIndoor: true,
    floor: fromFloor,
  });

  // Floor change if needed
  if (fromFloor !== toFloor) {
    const method = hasElevator ? 'elevator' : 'stairs';
    const floorDiff = Math.abs(toFloor - fromFloor);
    const direction = toFloor > fromFloor ? 'up' : 'down';

    steps.push({
      instruction: `Take the ${method} ${direction} to Floor ${toFloor}`,
      distance: floorDiff * 4, // ~4m per floor
      duration: floorDiff * (hasElevator ? 20 : 30), // seconds
      maneuver: 'straight',
      coordinate: { latitude: building.latitude, longitude: building.longitude },
      isIndoor: true,
      floor: fromFloor,
    });
  }

  // Final instruction
  steps.push({
    instruction: `Proceed to Room ${toRoom}`,
    distance: 20, // Estimated corridor distance
    duration: 30,
    maneuver: 'straight',
    coordinate: { latitude: building.latitude, longitude: building.longitude },
    isIndoor: true,
    floor: toFloor,
  });

  steps.push({
    instruction: `You have arrived at Room ${toRoom}`,
    distance: 0,
    duration: 0,
    maneuver: 'arrive',
    coordinate: { latitude: building.latitude, longitude: building.longitude },
    isIndoor: true,
    floor: toFloor,
  });

  return steps;
}

// ==========================================
// Helper Functions
// ==========================================
function formatInstruction(type: string, modifier?: string, name?: string): string {
  const streetName = name && name !== '' ? ` onto ${name}` : '';

  switch (type) {
    case 'depart':
      return `Start walking${streetName}`;
    case 'turn':
      return `Turn ${modifier || 'ahead'}${streetName}`;
    case 'continue':
      return `Continue straight${streetName}`;
    case 'arrive':
      return 'You have arrived at your destination';
    case 'roundabout':
      return `Enter the roundabout and take the exit${streetName}`;
    default:
      return `Continue${streetName}`;
  }
}

function mapManeuverType(type: string, modifier?: string): NavigationStep['maneuver'] {
  if (type === 'arrive') return 'arrive';

  switch (modifier) {
    case 'left':
      return 'left';
    case 'right':
      return 'right';
    case 'slight left':
      return 'slight_left';
    case 'slight right':
      return 'slight_right';
    case 'uturn':
      return 'u_turn';
    default:
      return 'straight';
  }
}

// Format distance for display
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

// Format duration for display
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours}h ${remainingMins}m`;
}

// Get bearing between two points (for compass direction)
export function getBearing(from: Coordinate, to: Coordinate): number {
  const φ1 = (from.latitude * Math.PI) / 180;
  const φ2 = (to.latitude * Math.PI) / 180;
  const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);

  return ((θ * 180) / Math.PI + 360) % 360;
}

// Get compass direction from bearing
export function getCompassDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

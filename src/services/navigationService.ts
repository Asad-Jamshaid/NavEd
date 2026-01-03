// ==========================================
// Navigation Service - Campus A* Pathfinding
// Optimized for UCP campus walking routes
// ==========================================

import { Coordinate, NavigationRoute, NavigationStep, Building } from '../types';
import { BUILDINGS, ROOMS, searchBuildings, searchRooms, getAccessibleBuildings } from '../data/campusData';

// Re-export search functions for convenience
export { searchBuildings, searchRooms, getAccessibleBuildings };

// ==========================================
// CAMPUS WAYPOINTS & PATHFINDING GRAPH
// Pre-defined walkable paths on campus
// ==========================================

interface Waypoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isAccessible: boolean;
  nearbyBuildingId?: string;
}

interface PathConnection {
  from: string;
  to: string;
  distance: number; // meters
  isAccessible: boolean;
  pathType: 'paved' | 'stairs' | 'ramp' | 'indoor';
}

// UCP Campus Waypoints (intersections and building entrances)
const WAYPOINTS: Waypoint[] = [
  // Main Gate Area
  { id: 'wp-gate', name: 'Main Gate', latitude: 31.446500, longitude: 74.268500, isAccessible: true },

  // Central Plaza / Crossings
  { id: 'wp-plaza-1', name: 'Central Plaza', latitude: 31.446939, longitude: 74.267800, isAccessible: true },
  { id: 'wp-plaza-2', name: 'Library Junction', latitude: 31.447500, longitude: 74.267700, isAccessible: true },
  { id: 'wp-plaza-3', name: 'B-C Junction', latitude: 31.447800, longitude: 74.268100, isAccessible: true },

  // Building Entrances
  { id: 'wp-bld-a', name: 'Building A Entrance', latitude: 31.446939, longitude: 74.267673, isAccessible: true, nearbyBuildingId: 'bld-1' },
  { id: 'wp-bld-b', name: 'Building B Entrance', latitude: 31.447621, longitude: 74.267917, isAccessible: true, nearbyBuildingId: 'bld-2' },
  { id: 'wp-bld-c', name: 'Building C Entrance', latitude: 31.448067, longitude: 74.268277, isAccessible: true, nearbyBuildingId: 'bld-3' },
  { id: 'wp-bld-d', name: 'Building D Entrance', latitude: 31.446317, longitude: 74.267344, isAccessible: true, nearbyBuildingId: 'bld-4' },
  { id: 'wp-admission', name: 'Admission Office', latitude: 31.447117, longitude: 74.267797, isAccessible: true, nearbyBuildingId: 'bld-5' },
  { id: 'wp-library', name: 'Library Entrance', latitude: 31.447767, longitude: 74.26774, isAccessible: true, nearbyBuildingId: 'bld-6' },
  { id: 'wp-auditorium', name: 'Auditorium Entrance', latitude: 31.446688, longitude: 74.268152, isAccessible: true, nearbyBuildingId: 'bld-7' },
  { id: 'wp-sports', name: 'Sports Complex', latitude: 31.447088, longitude: 74.267212, isAccessible: true, nearbyBuildingId: 'bld-8' },
  { id: 'wp-amphi', name: 'Amphitheater', latitude: 31.447332, longitude: 74.267494, isAccessible: true, nearbyBuildingId: 'bld-9' },
  { id: 'wp-exam', name: 'Exam Office', latitude: 31.44682, longitude: 74.267671, isAccessible: true, nearbyBuildingId: 'bld-10' },
  { id: 'wp-ssc', name: 'Student Service Center', latitude: 31.446955, longitude: 74.267904, isAccessible: true, nearbyBuildingId: 'bld-11' },
  { id: 'wp-takhleeq', name: 'Takhleeq Incubator', latitude: 31.446355, longitude: 74.267124, isAccessible: true, nearbyBuildingId: 'bld-13' },
  { id: 'wp-civil-a', name: 'Civil Block A', latitude: 31.446554, longitude: 74.267121, isAccessible: true, nearbyBuildingId: 'bld-14' },
  { id: 'wp-civil-b', name: 'Civil Block B', latitude: 31.44639, longitude: 74.266957, isAccessible: true, nearbyBuildingId: 'bld-15' },
  { id: 'wp-mech', name: 'Mechanical Block', latitude: 31.446731, longitude: 74.267207, isAccessible: true, nearbyBuildingId: 'bld-16' },
  { id: 'wp-fab', name: 'Fabrication Shop', latitude: 31.44685, longitude: 74.26715, isAccessible: true, nearbyBuildingId: 'bld-17' },
  { id: 'wp-cafe-a', name: 'Cafe A', latitude: 31.447332, longitude: 74.267786, isAccessible: true, nearbyBuildingId: 'bld-20' },
  { id: 'wp-cafe-c', name: 'C Cafe', latitude: 31.448122, longitude: 74.268376, isAccessible: true, nearbyBuildingId: 'bld-21' },
  { id: 'wp-food', name: 'Food Street', latitude: 31.446545, longitude: 74.267877, isAccessible: true, nearbyBuildingId: 'bld-22' },

  // Parking Areas
  { id: 'wp-park-a', name: 'A Parking', latitude: 31.44679, longitude: 74.268438, isAccessible: true },
  { id: 'wp-park-b', name: 'B Parking', latitude: 31.447502, longitude: 74.268636, isAccessible: true },
  { id: 'wp-park-c', name: 'C Parking', latitude: 31.448212, longitude: 74.268665, isAccessible: true },

  // Path Junctions
  { id: 'wp-j1', name: 'Junction 1', latitude: 31.446700, longitude: 74.267400, isAccessible: true },
  { id: 'wp-j2', name: 'Junction 2', latitude: 31.447200, longitude: 74.267600, isAccessible: true },
  { id: 'wp-j3', name: 'Junction 3', latitude: 31.447000, longitude: 74.268000, isAccessible: true },
  { id: 'wp-j4', name: 'Junction 4', latitude: 31.447600, longitude: 74.268300, isAccessible: true },
];

// Path connections between waypoints
const PATH_CONNECTIONS: PathConnection[] = [
  // Main Gate to central areas
  { from: 'wp-gate', to: 'wp-park-a', distance: 30, isAccessible: true, pathType: 'paved' },
  { from: 'wp-gate', to: 'wp-j3', distance: 50, isAccessible: true, pathType: 'paved' },
  { from: 'wp-j3', to: 'wp-plaza-1', distance: 25, isAccessible: true, pathType: 'paved' },
  { from: 'wp-j3', to: 'wp-food', distance: 20, isAccessible: true, pathType: 'paved' },
  { from: 'wp-j3', to: 'wp-auditorium', distance: 25, isAccessible: true, pathType: 'paved' },

  // Central Plaza connections
  { from: 'wp-plaza-1', to: 'wp-bld-a', distance: 15, isAccessible: true, pathType: 'paved' },
  { from: 'wp-plaza-1', to: 'wp-exam', distance: 20, isAccessible: true, pathType: 'paved' },
  { from: 'wp-plaza-1', to: 'wp-ssc', distance: 20, isAccessible: true, pathType: 'paved' },
  { from: 'wp-plaza-1', to: 'wp-j1', distance: 45, isAccessible: true, pathType: 'paved' },
  { from: 'wp-plaza-1', to: 'wp-j2', distance: 35, isAccessible: true, pathType: 'paved' },

  // Building A area
  { from: 'wp-bld-a', to: 'wp-admission', distance: 25, isAccessible: true, pathType: 'paved' },
  { from: 'wp-bld-a', to: 'wp-ssc', distance: 25, isAccessible: true, pathType: 'paved' },

  // Junction 1 (Engineering area)
  { from: 'wp-j1', to: 'wp-bld-d', distance: 30, isAccessible: true, pathType: 'paved' },
  { from: 'wp-j1', to: 'wp-mech', distance: 25, isAccessible: true, pathType: 'paved' },
  { from: 'wp-j1', to: 'wp-fab', distance: 30, isAccessible: true, pathType: 'paved' },
  { from: 'wp-j1', to: 'wp-civil-a', distance: 35, isAccessible: true, pathType: 'paved' },
  { from: 'wp-j1', to: 'wp-takhleeq', distance: 40, isAccessible: true, pathType: 'paved' },
  { from: 'wp-civil-a', to: 'wp-civil-b', distance: 25, isAccessible: true, pathType: 'paved' },

  // Junction 2 (Central path)
  { from: 'wp-j2', to: 'wp-sports', distance: 40, isAccessible: true, pathType: 'paved' },
  { from: 'wp-j2', to: 'wp-amphi', distance: 20, isAccessible: true, pathType: 'paved' },
  { from: 'wp-j2', to: 'wp-plaza-2', distance: 35, isAccessible: true, pathType: 'paved' },
  { from: 'wp-amphi', to: 'wp-cafe-a', distance: 30, isAccessible: true, pathType: 'paved' },

  // Library area
  { from: 'wp-plaza-2', to: 'wp-library', distance: 30, isAccessible: true, pathType: 'paved' },
  { from: 'wp-plaza-2', to: 'wp-bld-b', distance: 25, isAccessible: true, pathType: 'paved' },
  { from: 'wp-plaza-2', to: 'wp-cafe-a', distance: 25, isAccessible: true, pathType: 'paved' },
  { from: 'wp-plaza-2', to: 'wp-plaza-3', distance: 45, isAccessible: true, pathType: 'paved' },

  // B-C Junction
  { from: 'wp-plaza-3', to: 'wp-bld-b', distance: 30, isAccessible: true, pathType: 'paved' },
  { from: 'wp-plaza-3', to: 'wp-bld-c', distance: 35, isAccessible: true, pathType: 'paved' },
  { from: 'wp-plaza-3', to: 'wp-j4', distance: 30, isAccessible: true, pathType: 'paved' },

  // Junction 4 (C area)
  { from: 'wp-j4', to: 'wp-cafe-c', distance: 25, isAccessible: true, pathType: 'paved' },
  { from: 'wp-j4', to: 'wp-park-b', distance: 35, isAccessible: true, pathType: 'paved' },
  { from: 'wp-bld-c', to: 'wp-cafe-c', distance: 20, isAccessible: true, pathType: 'paved' },
  { from: 'wp-cafe-c', to: 'wp-park-c', distance: 30, isAccessible: true, pathType: 'paved' },

  // Parking connections
  { from: 'wp-park-a', to: 'wp-auditorium', distance: 35, isAccessible: true, pathType: 'paved' },
  { from: 'wp-park-a', to: 'wp-food', distance: 40, isAccessible: true, pathType: 'paved' },
  { from: 'wp-park-b', to: 'wp-bld-b', distance: 70, isAccessible: true, pathType: 'paved' },
];

// Build adjacency list for pathfinding
function buildGraph(accessibleOnly: boolean = false): Map<string, { to: string; distance: number }[]> {
  const graph = new Map<string, { to: string; distance: number }[]>();

  // Initialize all waypoints
  WAYPOINTS.forEach(wp => {
    graph.set(wp.id, []);
  });

  // Add connections (bidirectional)
  PATH_CONNECTIONS.forEach(conn => {
    if (accessibleOnly && !conn.isAccessible) return;

    graph.get(conn.from)?.push({ to: conn.to, distance: conn.distance });
    graph.get(conn.to)?.push({ to: conn.from, distance: conn.distance });
  });

  return graph;
}

// Find nearest waypoint to a coordinate
function findNearestWaypoint(coord: Coordinate): Waypoint {
  let nearest = WAYPOINTS[0];
  let minDist = Infinity;

  WAYPOINTS.forEach(wp => {
    const dist = calculateDistance(coord, { latitude: wp.latitude, longitude: wp.longitude });
    if (dist < minDist) {
      minDist = dist;
      nearest = wp;
    }
  });

  return nearest;
}

// Find waypoint for a building
function findBuildingWaypoint(buildingId: string): Waypoint | null {
  return WAYPOINTS.find(wp => wp.nearbyBuildingId === buildingId) || null;
}

// A* Pathfinding Algorithm
function aStarPathfinding(
  startId: string,
  endId: string,
  graph: Map<string, { to: string; distance: number }[]>
): string[] | null {
  const startWp = WAYPOINTS.find(wp => wp.id === startId);
  const endWp = WAYPOINTS.find(wp => wp.id === endId);

  if (!startWp || !endWp) return null;

  // Heuristic: straight-line distance
  const heuristic = (wpId: string): number => {
    const wp = WAYPOINTS.find(w => w.id === wpId);
    if (!wp) return 0;
    return calculateDistance(
      { latitude: wp.latitude, longitude: wp.longitude },
      { latitude: endWp.latitude, longitude: endWp.longitude }
    );
  };

  const openSet = new Set<string>([startId]);
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  WAYPOINTS.forEach(wp => {
    gScore.set(wp.id, Infinity);
    fScore.set(wp.id, Infinity);
  });

  gScore.set(startId, 0);
  fScore.set(startId, heuristic(startId));

  while (openSet.size > 0) {
    // Find node with lowest fScore
    let current = '';
    let lowestF = Infinity;
    openSet.forEach(id => {
      const f = fScore.get(id) || Infinity;
      if (f < lowestF) {
        lowestF = f;
        current = id;
      }
    });

    if (current === endId) {
      // Reconstruct path
      const path: string[] = [current];
      while (cameFrom.has(current)) {
        current = cameFrom.get(current)!;
        path.unshift(current);
      }
      return path;
    }

    openSet.delete(current);

    const neighbors = graph.get(current) || [];
    for (const neighbor of neighbors) {
      const tentativeG = (gScore.get(current) || 0) + neighbor.distance;

      if (tentativeG < (gScore.get(neighbor.to) || Infinity)) {
        cameFrom.set(neighbor.to, current);
        gScore.set(neighbor.to, tentativeG);
        fScore.set(neighbor.to, tentativeG + heuristic(neighbor.to));
        openSet.add(neighbor.to);
      }
    }
  }

  return null; // No path found
}

// Main routing function using A* pathfinding
export async function getRoute(
  from: Coordinate,
  to: Coordinate,
  accessibleOnly: boolean = false
): Promise<NavigationRoute | null> {
  try {
    // Find nearest waypoints
    const startWp = findNearestWaypoint(from);
    const endWp = findNearestWaypoint(to);

    // Build graph
    const graph = buildGraph(accessibleOnly);

    // Find path using A*
    const path = aStarPathfinding(startWp.id, endWp.id, graph);

    if (!path || path.length < 2) {
      // Fallback to direct route
      return calculateDirectRoute(from, to);
    }

    // Convert path to navigation steps
    const steps: NavigationStep[] = [];
    let totalDistance = 0;

    // Add starting step (walk to first waypoint)
    const firstWp = WAYPOINTS.find(wp => wp.id === path[0])!;
    const distToFirst = calculateDistance(from, { latitude: firstWp.latitude, longitude: firstWp.longitude });

    steps.push({
      instruction: `Start walking towards ${firstWp.name}`,
      distance: distToFirst,
      duration: distToFirst / 1.4,
      maneuver: 'straight',
      coordinate: from,
      isIndoor: false,
    });
    totalDistance += distToFirst;

    // Add path steps
    for (let i = 0; i < path.length - 1; i++) {
      const currentWp = WAYPOINTS.find(wp => wp.id === path[i])!;
      const nextWp = WAYPOINTS.find(wp => wp.id === path[i + 1])!;

      const segmentDist = calculateDistance(
        { latitude: currentWp.latitude, longitude: currentWp.longitude },
        { latitude: nextWp.latitude, longitude: nextWp.longitude }
      );

      // Determine turn direction
      const bearing = getBearing(
        { latitude: currentWp.latitude, longitude: currentWp.longitude },
        { latitude: nextWp.latitude, longitude: nextWp.longitude }
      );
      const prevBearing = i > 0 ? getBearing(
        { latitude: WAYPOINTS.find(wp => wp.id === path[i - 1])!.latitude, longitude: WAYPOINTS.find(wp => wp.id === path[i - 1])!.longitude },
        { latitude: currentWp.latitude, longitude: currentWp.longitude }
      ) : bearing;

      const turnAngle = ((bearing - prevBearing + 360) % 360);
      let maneuver: NavigationStep['maneuver'] = 'straight';
      let turnText = 'Continue';

      if (turnAngle > 30 && turnAngle < 150) {
        maneuver = 'right';
        turnText = 'Turn right';
      } else if (turnAngle > 210 && turnAngle < 330) {
        maneuver = 'left';
        turnText = 'Turn left';
      }

      const instruction = i === path.length - 2
        ? `${turnText} and head towards ${nextWp.name}`
        : `${turnText} at ${currentWp.name} towards ${nextWp.name}`;

      steps.push({
        instruction,
        distance: segmentDist,
        duration: segmentDist / 1.4,
        maneuver,
        coordinate: { latitude: currentWp.latitude, longitude: currentWp.longitude },
        isIndoor: false,
      });

      totalDistance += segmentDist;
    }

    // Add final step (walk to destination)
    const lastWp = WAYPOINTS.find(wp => wp.id === path[path.length - 1])!;
    const distToEnd = calculateDistance({ latitude: lastWp.latitude, longitude: lastWp.longitude }, to);

    steps.push({
      instruction: 'You have arrived at your destination',
      distance: distToEnd,
      duration: distToEnd / 1.4,
      maneuver: 'arrive',
      coordinate: to,
      isIndoor: false,
    });
    totalDistance += distToEnd;

    return {
      id: `route-${Date.now()}`,
      fromLocation: from,
      toLocation: to,
      distance: totalDistance,
      duration: totalDistance / 1.4,
      steps,
      isAccessible: accessibleOnly,
    };
  } catch (error) {
    console.error('Error calculating route:', error);
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
// Location Search (Local Campus Data First)
// ==========================================
export async function searchLocation(query: string): Promise<Coordinate | null> {
  try {
    // First check local campus data (primary source)
    const localResult = searchLocalData(query);
    if (localResult) return localResult;

    // Fall back to Nominatim for external locations (FREE)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

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

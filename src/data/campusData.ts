// ==========================================
// Campus Data - Replace with YOUR University Data
// This is sample data - customize for your campus
// ==========================================

import { Building, Room, ParkingLot, NavigationRoute } from '../types';

// ==========================================
// SAMPLE BUILDINGS (Replace with your campus)
// ==========================================
export const BUILDINGS: Building[] = [
  {
    id: 'bld-1',
    name: 'Main Academic Block',
    shortName: 'MAB',
    latitude: 31.5210,
    longitude: 74.3590,
    floors: 4,
    description: 'Primary academic building with classrooms and labs',
    category: 'academic',
    facilities: ['Classrooms', 'Computer Labs', 'Seminar Halls'],
    accessibilityFeatures: ['wheelchair_ramp', 'elevator', 'wide_doors'],
    imageUrl: 'building_mab.jpg',
  },
  {
    id: 'bld-2',
    name: 'Engineering Block',
    shortName: 'EB',
    latitude: 31.5215,
    longitude: 74.3595,
    floors: 3,
    description: 'Engineering departments and workshops',
    category: 'academic',
    facilities: ['Workshops', 'Electronics Lab', 'Mechanical Lab'],
    accessibilityFeatures: ['elevator', 'wide_doors'],
  },
  {
    id: 'bld-3',
    name: 'Central Library',
    shortName: 'LIB',
    latitude: 31.5205,
    longitude: 74.3580,
    floors: 3,
    description: 'Main library with study areas and digital resources',
    category: 'library',
    facilities: ['Reading Halls', 'Digital Library', 'Discussion Rooms'],
    accessibilityFeatures: ['wheelchair_ramp', 'elevator', 'braille_signage', 'audio_guidance'],
  },
  {
    id: 'bld-4',
    name: 'Administration Block',
    shortName: 'ADMIN',
    latitude: 31.5200,
    longitude: 74.3585,
    floors: 2,
    description: 'Administrative offices and student services',
    category: 'administrative',
    facilities: ['Registrar Office', 'Finance Office', 'Dean Office'],
    accessibilityFeatures: ['wheelchair_ramp', 'elevator'],
  },
  {
    id: 'bld-5',
    name: 'Student Cafeteria',
    shortName: 'CAFE',
    latitude: 31.5198,
    longitude: 74.3592,
    floors: 1,
    description: 'Main dining hall and food court',
    category: 'cafeteria',
    facilities: ['Food Court', 'Seating Area', 'Vending Machines'],
    accessibilityFeatures: ['wheelchair_ramp', 'wide_doors', 'accessible_washroom'],
  },
  {
    id: 'bld-6',
    name: 'Sports Complex',
    shortName: 'SPORTS',
    latitude: 31.5220,
    longitude: 74.3575,
    floors: 2,
    description: 'Indoor and outdoor sports facilities',
    category: 'sports',
    facilities: ['Gymnasium', 'Basketball Court', 'Swimming Pool'],
    accessibilityFeatures: ['wheelchair_ramp', 'elevator'],
  },
  {
    id: 'bld-7',
    name: 'Boys Hostel',
    shortName: 'BH',
    latitude: 31.5225,
    longitude: 74.3600,
    floors: 4,
    description: 'Male student dormitory',
    category: 'hostel',
    facilities: ['Rooms', 'Common Room', 'Laundry'],
    accessibilityFeatures: ['elevator'],
  },
  {
    id: 'bld-8',
    name: 'Girls Hostel',
    shortName: 'GH',
    latitude: 31.5225,
    longitude: 74.3570,
    floors: 4,
    description: 'Female student dormitory',
    category: 'hostel',
    facilities: ['Rooms', 'Common Room', 'Laundry'],
    accessibilityFeatures: ['elevator'],
  },
  {
    id: 'bld-9',
    name: 'Medical Center',
    shortName: 'MED',
    latitude: 31.5202,
    longitude: 74.3578,
    floors: 1,
    description: 'Campus health center and first aid',
    category: 'medical',
    facilities: ['Clinic', 'Pharmacy', 'Emergency Services'],
    accessibilityFeatures: ['wheelchair_ramp', 'wide_doors', 'accessible_washroom'],
  },
  {
    id: 'bld-10',
    name: 'IT Center',
    shortName: 'IT',
    latitude: 31.5212,
    longitude: 74.3582,
    floors: 2,
    description: 'Computer Science department and data center',
    category: 'academic',
    facilities: ['Computer Labs', 'Server Room', 'Training Center'],
    accessibilityFeatures: ['wheelchair_ramp', 'elevator'],
  },
];

// ==========================================
// SAMPLE ROOMS (Replace with your campus)
// ==========================================
export const ROOMS: Room[] = [
  // Main Academic Block Rooms
  {
    id: 'room-1',
    buildingId: 'bld-1',
    floor: 1,
    roomNumber: '101',
    name: 'Lecture Hall A',
    type: 'classroom',
    capacity: 100,
    facilities: ['Projector', 'AC', 'Microphone'],
    accessibilityFeatures: ['wide_doors', 'wheelchair_ramp'],
  },
  {
    id: 'room-2',
    buildingId: 'bld-1',
    floor: 1,
    roomNumber: '102',
    name: 'Lecture Hall B',
    type: 'classroom',
    capacity: 80,
    facilities: ['Projector', 'AC'],
    accessibilityFeatures: ['wide_doors'],
  },
  {
    id: 'room-3',
    buildingId: 'bld-1',
    floor: 2,
    roomNumber: '201',
    name: 'Computer Lab 1',
    type: 'lab',
    capacity: 40,
    facilities: ['Computers', 'Projector', 'AC'],
    accessibilityFeatures: ['elevator', 'wide_doors'],
  },
  {
    id: 'room-4',
    buildingId: 'bld-1',
    floor: 2,
    roomNumber: '202',
    name: 'Computer Lab 2',
    type: 'lab',
    capacity: 40,
    facilities: ['Computers', 'Projector', 'AC'],
    accessibilityFeatures: ['elevator'],
  },
  {
    id: 'room-5',
    buildingId: 'bld-1',
    floor: 3,
    roomNumber: '301',
    name: 'Seminar Hall',
    type: 'auditorium',
    capacity: 200,
    facilities: ['Stage', 'Sound System', 'Projector', 'AC'],
    accessibilityFeatures: ['elevator', 'wide_doors', 'audio_guidance'],
  },
  // Engineering Block Rooms
  {
    id: 'room-6',
    buildingId: 'bld-2',
    floor: 1,
    roomNumber: 'G-01',
    name: 'Electronics Lab',
    type: 'lab',
    capacity: 30,
    facilities: ['Workbenches', 'Oscilloscopes', 'Power Supplies'],
    accessibilityFeatures: ['wide_doors'],
  },
  {
    id: 'room-7',
    buildingId: 'bld-2',
    floor: 1,
    roomNumber: 'G-02',
    name: 'Mechanical Workshop',
    type: 'lab',
    capacity: 25,
    facilities: ['Machines', 'Tools', 'Safety Equipment'],
    accessibilityFeatures: ['wide_doors'],
  },
  // Library Rooms
  {
    id: 'room-8',
    buildingId: 'bld-3',
    floor: 1,
    roomNumber: 'L-01',
    name: 'Reading Hall 1',
    type: 'library',
    capacity: 150,
    facilities: ['Study Tables', 'WiFi', 'Power Outlets'],
    accessibilityFeatures: ['wheelchair_ramp', 'braille_signage'],
  },
  {
    id: 'room-9',
    buildingId: 'bld-3',
    floor: 2,
    roomNumber: 'L-02',
    name: 'Digital Library',
    type: 'library',
    capacity: 50,
    facilities: ['Computers', 'Printers', 'Scanners'],
    accessibilityFeatures: ['elevator', 'audio_guidance'],
  },
  // IT Center Rooms
  {
    id: 'room-10',
    buildingId: 'bld-10',
    floor: 1,
    roomNumber: 'IT-101',
    name: 'Programming Lab',
    type: 'lab',
    capacity: 35,
    facilities: ['High-end Computers', 'Dual Monitors', 'AC'],
    accessibilityFeatures: ['wheelchair_ramp', 'wide_doors'],
  },
];

// ==========================================
// SAMPLE PARKING LOTS (Replace with your campus)
// ==========================================
export const PARKING_LOTS: ParkingLot[] = [
  {
    id: 'park-1',
    name: 'Main Gate Parking',
    latitude: 31.5195,
    longitude: 74.3588,
    totalSpots: 100,
    availableSpots: 45,
    type: 'mixed',
    isAccessible: true,
    operatingHours: { open: '06:00', close: '22:00', days: [1, 2, 3, 4, 5, 6] },
    lastUpdated: new Date(),
    peakHours: [
      { dayOfWeek: 1, startHour: 8, endHour: 10, averageOccupancy: 90 },
      { dayOfWeek: 1, startHour: 13, endHour: 15, averageOccupancy: 85 },
      { dayOfWeek: 2, startHour: 8, endHour: 10, averageOccupancy: 88 },
      { dayOfWeek: 3, startHour: 8, endHour: 10, averageOccupancy: 92 },
    ],
  },
  {
    id: 'park-2',
    name: 'Library Parking',
    latitude: 31.5203,
    longitude: 74.3575,
    totalSpots: 50,
    availableSpots: 12,
    type: 'car',
    isAccessible: true,
    operatingHours: { open: '07:00', close: '23:00', days: [0, 1, 2, 3, 4, 5, 6] },
    lastUpdated: new Date(),
    peakHours: [
      { dayOfWeek: 1, startHour: 9, endHour: 12, averageOccupancy: 95 },
      { dayOfWeek: 2, startHour: 9, endHour: 12, averageOccupancy: 93 },
    ],
  },
  {
    id: 'park-3',
    name: 'Sports Complex Parking',
    latitude: 31.5222,
    longitude: 74.3572,
    totalSpots: 80,
    availableSpots: 60,
    type: 'mixed',
    isAccessible: true,
    operatingHours: { open: '05:00', close: '21:00', days: [0, 1, 2, 3, 4, 5, 6] },
    lastUpdated: new Date(),
    peakHours: [
      { dayOfWeek: 6, startHour: 16, endHour: 19, averageOccupancy: 85 },
      { dayOfWeek: 0, startHour: 16, endHour: 19, averageOccupancy: 80 },
    ],
  },
  {
    id: 'park-4',
    name: 'Engineering Block Parking',
    latitude: 31.5218,
    longitude: 74.3598,
    totalSpots: 60,
    availableSpots: 5,
    type: 'motorcycle',
    isAccessible: false,
    operatingHours: { open: '06:00', close: '20:00', days: [1, 2, 3, 4, 5] },
    lastUpdated: new Date(),
    peakHours: [
      { dayOfWeek: 1, startHour: 8, endHour: 9, averageOccupancy: 98 },
      { dayOfWeek: 2, startHour: 8, endHour: 9, averageOccupancy: 97 },
      { dayOfWeek: 3, startHour: 8, endHour: 9, averageOccupancy: 96 },
    ],
  },
  {
    id: 'park-5',
    name: 'Faculty Parking',
    latitude: 31.5208,
    longitude: 74.3595,
    totalSpots: 40,
    availableSpots: 15,
    type: 'car',
    isAccessible: true,
    operatingHours: { open: '07:00', close: '19:00', days: [1, 2, 3, 4, 5] },
    lastUpdated: new Date(),
    peakHours: [
      { dayOfWeek: 1, startHour: 9, endHour: 11, averageOccupancy: 90 },
    ],
  },
];

// ==========================================
// SAMPLE VIDEO ROUTES (Local storage paths)
// These videos should be stored locally in the app
// or on free hosting like GitHub releases
// ==========================================
export const VIDEO_ROUTES: Record<string, string> = {
  'gate-to-mab': 'videos/route_gate_to_mab.mp4',
  'gate-to-library': 'videos/route_gate_to_library.mp4',
  'mab-to-cafeteria': 'videos/route_mab_to_cafeteria.mp4',
  'library-to-sports': 'videos/route_library_to_sports.mp4',
};

// ==========================================
// ACCESSIBILITY ROUTES
// Pre-defined routes that are wheelchair accessible
// ==========================================
export const ACCESSIBLE_ROUTES = [
  {
    id: 'acc-1',
    name: 'Main Gate to Library (Accessible)',
    description: 'Wheelchair-friendly route via paved pathways',
    waypoints: [
      { latitude: 31.5195, longitude: 74.3588 },
      { latitude: 31.5200, longitude: 74.3585 },
      { latitude: 31.5205, longitude: 74.3580 },
    ],
    features: ['Ramps', 'No stairs', 'Wide paths'],
  },
  {
    id: 'acc-2',
    name: 'Library to Cafeteria (Accessible)',
    description: 'Flat terrain route with rest areas',
    waypoints: [
      { latitude: 31.5205, longitude: 74.3580 },
      { latitude: 31.5200, longitude: 74.3585 },
      { latitude: 31.5198, longitude: 74.3592 },
    ],
    features: ['Flat terrain', 'Benches available', 'Covered walkway'],
  },
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================
export function getBuildingById(id: string): Building | undefined {
  return BUILDINGS.find(b => b.id === id);
}

export function getRoomsByBuilding(buildingId: string): Room[] {
  return ROOMS.filter(r => r.buildingId === buildingId);
}

export function getParkingLotById(id: string): ParkingLot | undefined {
  return PARKING_LOTS.find(p => p.id === id);
}

export function getAccessibleBuildings(): Building[] {
  return BUILDINGS.filter(b =>
    b.accessibilityFeatures.includes('wheelchair_ramp') ||
    b.accessibilityFeatures.includes('elevator')
  );
}

export function searchBuildings(query: string): Building[] {
  const lowerQuery = query.toLowerCase();
  return BUILDINGS.filter(b =>
    b.name.toLowerCase().includes(lowerQuery) ||
    b.shortName.toLowerCase().includes(lowerQuery) ||
    b.description.toLowerCase().includes(lowerQuery)
  );
}

export function searchRooms(query: string): Room[] {
  const lowerQuery = query.toLowerCase();
  return ROOMS.filter(r =>
    r.name.toLowerCase().includes(lowerQuery) ||
    r.roomNumber.toLowerCase().includes(lowerQuery)
  );
}

// Calculate parking lot status
export function getParkingStatus(lot: ParkingLot): 'available' | 'moderate' | 'full' {
  const occupancyRate = ((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100;
  if (occupancyRate >= 95) return 'full';
  if (occupancyRate >= 70) return 'moderate';
  return 'available';
}

// ==========================================
// University of Central Punjab (UCP) Campus Data
// Khayaban-e-Jinnah Road, Johar Town, Lahore, Pakistan
// ==========================================

import { Building, Room, ParkingLot, NavigationRoute } from '../types';

// ==========================================
// UCP BUILDINGS
// Campus comprises 5 main blocks + additional facilities
// ==========================================
export const BUILDINGS: Building[] = [
  {
    id: 'bld-1',
    name: 'Block A - Engineering & IT',
    shortName: 'Block A',
    latitude: 31.4705,
    longitude: 74.2805,
    floors: 4,
    description: 'Faculty of Engineering and Faculty of Information Technology & Computer Science. Houses engineering labs, computer labs, and classrooms.',
    category: 'academic',
    facilities: ['Engineering Labs', 'Computer Labs', 'Classrooms', 'Faculty Offices', 'Project Rooms'],
    accessibilityFeatures: ['wheelchair_ramp', 'elevator', 'wide_doors'],
  },
  {
    id: 'bld-2',
    name: 'Block B - Management Sciences',
    shortName: 'Block B',
    latitude: 31.4700,
    longitude: 74.2800,
    floors: 4,
    description: 'Faculty of Management Sciences. Business and management programs with modern classrooms and seminar halls.',
    category: 'academic',
    facilities: ['Classrooms', 'Seminar Halls', 'Business Labs', 'Case Study Rooms', 'Faculty Offices'],
    accessibilityFeatures: ['wheelchair_ramp', 'elevator', 'wide_doors'],
  },
  {
    id: 'bld-3',
    name: 'Block C - Sciences & Pharmacy',
    shortName: 'Block C',
    latitude: 31.4695,
    longitude: 74.2805,
    floors: 4,
    description: 'Faculty of Pharmaceutical Sciences, Faculty of Life Sciences, and Faculty of Science & Technology. Contains chemistry labs, biology labs, and pharmacy facilities.',
    category: 'academic',
    facilities: ['Chemistry Labs', 'Biology Labs', 'Pharmacy Labs', 'Research Labs', 'Classrooms'],
    accessibilityFeatures: ['wheelchair_ramp', 'elevator', 'wide_doors', 'accessible_washroom'],
  },
  {
    id: 'bld-4',
    name: 'Block D - Humanities & Law',
    shortName: 'Block D',
    latitude: 31.4700,
    longitude: 74.2795,
    floors: 3,
    description: 'Faculty of Humanities and Social Sciences, Faculty of Law, School of Media and Communication Studies, and Faculty of Language & Literature.',
    category: 'academic',
    facilities: ['Classrooms', 'Media Studios', 'Law Library', 'Moot Court', 'Language Labs', 'Faculty Offices'],
    accessibilityFeatures: ['wheelchair_ramp', 'elevator', 'wide_doors'],
  },
  {
    id: 'bld-5',
    name: 'Block E - Administration',
    shortName: 'Block E',
    latitude: 31.4705,
    longitude: 74.2795,
    floors: 3,
    description: 'Administrative offices, Registrar Office, Finance Office, Student Affairs, and main reception.',
    category: 'administrative',
    facilities: ['Registrar Office', 'Finance Office', 'Student Affairs', 'Admissions Office', 'HR Office', 'Reception'],
    accessibilityFeatures: ['wheelchair_ramp', 'elevator', 'wide_doors', 'braille_signage'],
  },
  {
    id: 'bld-6',
    name: 'Central Library',
    shortName: 'Library',
    latitude: 31.4698,
    longitude: 74.2800,
    floors: 3,
    description: 'Main library with over 40,000 books, digital resources, reading halls, and study areas. Organized by Dewey Decimal Classification.',
    category: 'library',
    facilities: ['Reading Halls', 'Digital Library', 'Study Rooms', 'Computer Section', 'Reference Section', 'Periodicals'],
    accessibilityFeatures: ['wheelchair_ramp', 'elevator', 'braille_signage', 'audio_guidance', 'wide_doors'],
  },
  {
    id: 'bld-7',
    name: 'Auditorium',
    shortName: 'Auditorium',
    latitude: 31.4702,
    longitude: 74.2802,
    floors: 2,
    description: '300-seat auditorium for events, seminars, conferences, and cultural activities.',
    category: 'other',
    facilities: ['Main Hall', 'Stage', 'Sound System', 'Projection System', 'Green Room', 'Reception Area'],
    accessibilityFeatures: ['wheelchair_ramp', 'elevator', 'wide_doors', 'accessible_washroom', 'braille_signage'],
  },
  {
    id: 'bld-8',
    name: 'Cafeteria',
    shortName: 'Cafeteria',
    latitude: 31.4695,
    longitude: 74.2798,
    floors: 1,
    description: 'Main dining hall and food court serving meals and snacks throughout the day.',
    category: 'cafeteria',
    facilities: ['Food Court', 'Seating Area', 'Vending Machines', 'Coffee Shop', 'Outdoor Seating'],
    accessibilityFeatures: ['wheelchair_ramp', 'wide_doors', 'accessible_washroom'],
  },
  {
    id: 'bld-9',
    name: 'Sports Complex',
    shortName: 'Sports',
    latitude: 31.4710,
    longitude: 74.2800,
    floors: 2,
    description: 'Indoor and outdoor sports facilities including gymnasium, courts, and recreational areas.',
    category: 'sports',
    facilities: ['Gymnasium', 'Basketball Court', 'Badminton Court', 'Table Tennis', 'Fitness Center', 'Changing Rooms'],
    accessibilityFeatures: ['wheelchair_ramp', 'elevator', 'wide_doors'],
  },
  {
    id: 'bld-10',
    name: 'IT Center',
    shortName: 'IT Center',
    latitude: 31.4703,
    longitude: 74.2803,
    floors: 2,
    description: 'IT support center, server rooms, and technical facilities.',
    category: 'administrative',
    facilities: ['Server Room', 'IT Support', 'Network Operations', 'Computer Repair'],
    accessibilityFeatures: ['elevator', 'wide_doors'],
  },
];

// ==========================================
// UCP ROOMS
// Sample rooms from various buildings
// ==========================================
export const ROOMS: Room[] = [
  // Block A - Engineering & IT
  {
    id: 'room-1',
    buildingId: 'bld-1',
    floor: 1,
    roomNumber: 'A-101',
    name: 'Computer Lab 1',
    type: 'lab',
    capacity: 40,
    facilities: ['Computers', 'Projector', 'Network Access'],
    accessibilityFeatures: ['wide_doors'],
  },
  {
    id: 'room-2',
    buildingId: 'bld-1',
    floor: 1,
    roomNumber: 'A-102',
    name: 'Electronics Lab',
    type: 'lab',
    capacity: 30,
    facilities: ['Workbenches', 'Oscilloscopes', 'Power Supplies'],
    accessibilityFeatures: ['wide_doors'],
  },
  {
    id: 'room-3',
    buildingId: 'bld-1',
    floor: 2,
    roomNumber: 'A-201',
    name: 'Engineering Drawing Hall',
    type: 'classroom',
    capacity: 50,
    facilities: ['Drawing Boards', 'Projector'],
    accessibilityFeatures: ['wide_doors'],
  },
  {
    id: 'room-4',
    buildingId: 'bld-1',
    floor: 3,
    roomNumber: 'A-301',
    name: 'Software Engineering Lab',
    type: 'lab',
    capacity: 35,
    facilities: ['Computers', 'Development Tools', 'Projector'],
    accessibilityFeatures: ['wide_doors'],
  },
  // Block B - Management Sciences
  {
    id: 'room-5',
    buildingId: 'bld-2',
    floor: 1,
    roomNumber: 'B-101',
    name: 'Business Lab',
    type: 'lab',
    capacity: 30,
    facilities: ['Computers', 'Business Software', 'Projector'],
    accessibilityFeatures: ['wide_doors'],
  },
  {
    id: 'room-6',
    buildingId: 'bld-2',
    floor: 2,
    roomNumber: 'B-201',
    name: 'Seminar Hall 1',
    type: 'auditorium',
    capacity: 80,
    facilities: ['Projector', 'Sound System', 'Stage'],
    accessibilityFeatures: ['wheelchair_ramp', 'wide_doors'],
  },
  // Block C - Sciences & Pharmacy
  {
    id: 'room-7',
    buildingId: 'bld-3',
    floor: 1,
    roomNumber: 'C-101',
    name: 'Chemistry Lab',
    type: 'lab',
    capacity: 25,
    facilities: ['Lab Equipment', 'Fume Hoods', 'Safety Equipment'],
    accessibilityFeatures: ['wide_doors'],
  },
  {
    id: 'room-8',
    buildingId: 'bld-3',
    floor: 2,
    roomNumber: 'C-201',
    name: 'Pharmacy Lab',
    type: 'lab',
    capacity: 30,
    facilities: ['Pharmacy Equipment', 'Storage', 'Workbenches'],
    accessibilityFeatures: ['wide_doors'],
  },
  // Block D - Humanities & Law
  {
    id: 'room-9',
    buildingId: 'bld-4',
    floor: 1,
    roomNumber: 'D-101',
    name: 'Media Studio',
    type: 'lab',
    capacity: 20,
    facilities: ['Recording Equipment', 'Cameras', 'Editing Stations'],
    accessibilityFeatures: ['wide_doors'],
  },
  {
    id: 'room-10',
    buildingId: 'bld-4',
    floor: 2,
    roomNumber: 'D-201',
    name: 'Moot Court',
    type: 'other',
    capacity: 50,
    facilities: ['Court Setup', 'Judge Bench', 'Seating', 'Projector'],
    accessibilityFeatures: ['wheelchair_ramp', 'wide_doors'],
  },
  // Library
  {
    id: 'room-11',
    buildingId: 'bld-6',
    floor: 1,
    roomNumber: 'L-101',
    name: 'Reading Hall 1',
    type: 'library',
    capacity: 100,
    facilities: ['Study Tables', 'WiFi', 'Power Outlets', 'Quiet Zone'],
    accessibilityFeatures: ['wheelchair_ramp', 'braille_signage'],
  },
  {
    id: 'room-12',
    buildingId: 'bld-6',
    floor: 2,
    roomNumber: 'L-201',
    name: 'Digital Library',
    type: 'library',
    capacity: 50,
    facilities: ['Computers', 'Online Resources', 'Printers', 'Scanners'],
    accessibilityFeatures: ['elevator', 'audio_guidance'],
  },
  {
    id: 'room-13',
    buildingId: 'bld-6',
    floor: 2,
    roomNumber: 'L-202',
    name: 'Discussion Room 1',
    type: 'library',
    capacity: 8,
    facilities: ['Whiteboard', 'Projector', 'Seating'],
    accessibilityFeatures: ['wide_doors'],
  },
];

// ==========================================
// UCP PARKING LOTS
// ==========================================
export const PARKING_LOTS: ParkingLot[] = [
  {
    id: 'park-1',
    name: 'Main Gate Parking',
    latitude: 31.4708,
    longitude: 74.2808,
    totalSpots: 150,
    availableSpots: 75,
    type: 'mixed',
    isAccessible: true,
    operatingHours: {
      open: '06:00',
      close: '22:00',
      days: [1, 2, 3, 4, 5, 6], // Monday-Saturday
    },
    lastUpdated: new Date(),
    peakHours: [
      { dayOfWeek: 1, startHour: 8, endHour: 10, averageOccupancy: 90 },
      { dayOfWeek: 1, startHour: 13, endHour: 15, averageOccupancy: 85 },
      { dayOfWeek: 2, startHour: 8, endHour: 10, averageOccupancy: 88 },
      { dayOfWeek: 3, startHour: 8, endHour: 10, averageOccupancy: 92 },
      { dayOfWeek: 4, startHour: 8, endHour: 10, averageOccupancy: 87 },
      { dayOfWeek: 5, startHour: 8, endHour: 10, averageOccupancy: 89 },
    ],
  },
  {
    id: 'park-2',
    name: 'Library Parking',
    latitude: 31.4695,
    longitude: 74.2795,
    totalSpots: 80,
    availableSpots: 40,
    type: 'car',
    isAccessible: true,
    operatingHours: {
      open: '07:00',
      close: '23:00',
      days: [0, 1, 2, 3, 4, 5, 6], // All days
    },
    lastUpdated: new Date(),
    peakHours: [
      { dayOfWeek: 1, startHour: 9, endHour: 12, averageOccupancy: 95 },
      { dayOfWeek: 2, startHour: 9, endHour: 12, averageOccupancy: 93 },
      { dayOfWeek: 3, startHour: 9, endHour: 12, averageOccupancy: 97 },
    ],
  },
  {
    id: 'park-3',
    name: 'Sports Complex Parking',
    latitude: 31.4712,
    longitude: 74.2802,
    totalSpots: 60,
    availableSpots: 35,
    type: 'mixed',
    isAccessible: true,
    operatingHours: {
      open: '06:00',
      close: '21:00',
      days: [1, 2, 3, 4, 5, 6],
    },
    lastUpdated: new Date(),
    peakHours: [
      { dayOfWeek: 1, startHour: 14, endHour: 18, averageOccupancy: 80 },
      { dayOfWeek: 3, startHour: 14, endHour: 18, averageOccupancy: 85 },
      { dayOfWeek: 5, startHour: 14, endHour: 18, averageOccupancy: 82 },
    ],
  },
  {
    id: 'park-4',
    name: 'Faculty Parking',
    latitude: 31.4703,
    longitude: 74.2798,
    totalSpots: 50,
    availableSpots: 25,
    type: 'car',
    isAccessible: true,
    operatingHours: {
      open: '07:00',
      close: '20:00',
      days: [1, 2, 3, 4, 5],
    },
    lastUpdated: new Date(),
    peakHours: [
      { dayOfWeek: 1, startHour: 8, endHour: 10, averageOccupancy: 95 },
      { dayOfWeek: 2, startHour: 8, endHour: 10, averageOccupancy: 92 },
    ],
  },
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getBuildingById(id: string): Building | undefined {
  return BUILDINGS.find(b => b.id === id);
}

export function getRoomById(id: string): Room | undefined {
  return ROOMS.find(r => r.id === id);
}

export function getParkingLotById(id: string): ParkingLot | undefined {
  return PARKING_LOTS.find(p => p.id === id);
}

// Get parking status color
export function getParkingStatus(lot: ParkingLot): 'available' | 'moderate' | 'full' {
  const occupancy = (lot.totalSpots - lot.availableSpots) / lot.totalSpots;
  if (occupancy < 0.5) return 'available';
  if (occupancy < 0.8) return 'moderate';
  return 'full';
}

// Search buildings by name or short name
export function searchBuildings(query: string): Building[] {
  const lowerQuery = query.toLowerCase();
  return BUILDINGS.filter(
    b =>
      b.name.toLowerCase().includes(lowerQuery) ||
      b.shortName.toLowerCase().includes(lowerQuery) ||
      b.description.toLowerCase().includes(lowerQuery)
  );
}

// Search rooms by number or name
export function searchRooms(query: string): Room[] {
  const lowerQuery = query.toLowerCase();
  return ROOMS.filter(
    r =>
      r.roomNumber.toLowerCase().includes(lowerQuery) ||
      r.name.toLowerCase().includes(lowerQuery)
  );
}

// Get accessible buildings only
export function getAccessibleBuildings(): Building[] {
  return BUILDINGS.filter(
    b =>
      b.accessibilityFeatures.includes('wheelchair_ramp') ||
      b.accessibilityFeatures.includes('elevator')
  );
}

// Get buildings by category
export function getBuildingsByCategory(category: string): Building[] {
  if (category === 'all') return BUILDINGS;
  return BUILDINGS.filter(b => b.category === category);
}

// Video routes (if available)
export const VIDEO_ROUTES: Record<string, string> = {
  // Add video URLs here if you have campus navigation videos
  // Example:
  // 'gate-to-block-a': 'https://your-cdn.com/videos/gate-to-block-a.mp4',
};

// Sample navigation routes (for testing)
export const SAMPLE_ROUTES: NavigationRoute[] = [];

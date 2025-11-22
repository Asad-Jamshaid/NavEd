# Campus Data Collection Template

## How to Configure NavEd for Your Campus

**Last Updated:** November 2025
**Purpose:** Customize NavEd with your campus buildings, parking lots, and routes

---

## Table of Contents

1. [Data Collection Guide](#1-data-collection-guide)
2. [Building Data Template](#2-building-data-template)
3. [Parking Lot Template](#3-parking-lot-template)
4. [Room Data Template](#4-room-data-template)
5. [Video Route Recording Guide](#5-video-route-recording-guide)
6. [Complete Example](#6-complete-example)
7. [GPS Coordinate Collection](#7-gps-coordinate-collection)

---

## 1. Data Collection Guide

### What You Need to Collect

| Data Type | Required | Purpose |
|-----------|----------|---------|
| Building locations | Yes | Map markers |
| Building details | Yes | Information display |
| Parking lots | Yes | Parking module |
| Room locations | Optional | Indoor navigation |
| Video routes | Optional | Video guides |
| Operating hours | Recommended | User information |
| Accessibility features | Recommended | Accessible routing |

### Tools Needed

1. **GPS App** (Google Maps, GPS Status)
2. **Spreadsheet** (Google Sheets, Excel)
3. **Camera** (for video routes)
4. **Campus Map** (reference)

---

## 2. Building Data Template

### Data Collection Spreadsheet

| Field | Description | Example | Required |
|-------|-------------|---------|----------|
| id | Unique identifier | building-001 | Yes |
| name | Full building name | Main Library | Yes |
| code | Short code | LIB | Yes |
| category | Building type | library | Yes |
| latitude | GPS latitude | 33.6844 | Yes |
| longitude | GPS longitude | 73.0479 | Yes |
| description | Short description | 3-floor library with study rooms | Yes |
| floors | Number of floors | 3 | Yes |
| accessibility | Accessibility features | wheelchair_ramp, elevator | Yes |
| facilities | What's inside | Study rooms, Computer lab | Optional |
| imageUrl | Building photo URL | https://... | Optional |

### Category Options

```typescript
type BuildingCategory =
  | 'academic'      // Classrooms, lecture halls
  | 'administrative' // Offices, registrar
  | 'library'       // Libraries
  | 'cafeteria'     // Food, dining
  | 'sports'        // Gym, fields
  | 'hostel'        // Dormitories
  | 'medical'       // Health center
  | 'parking'       // Parking structures
  | 'other';        // Miscellaneous
```

### Accessibility Feature Options

```typescript
type AccessibilityFeature =
  | 'wheelchair_ramp'
  | 'elevator'
  | 'braille_signage'
  | 'audio_guidance'
  | 'wide_doors'
  | 'accessible_washroom'
  | 'tactile_paving'
  | 'automatic_doors'
  | 'hearing_loop'
  | 'lowered_counters';
```

### TypeScript Building Template

```typescript
// src/data/campusData.ts

import { Building } from '@/types';

export const BUILDINGS: Building[] = [
  {
    id: 'building-001',
    name: 'Main Library',
    code: 'LIB',
    category: 'library',
    coordinate: {
      latitude: 33.6844,
      longitude: 73.0479,
    },
    description: 'Central library with 3 floors of study space, computer labs, and research facilities.',
    floors: 3,
    accessibilityFeatures: [
      'wheelchair_ramp',
      'elevator',
      'accessible_washroom',
      'braille_signage',
    ],
    facilities: [
      'Study Rooms',
      'Computer Lab',
      'Printing Services',
      'Research Section',
      'Group Study Areas',
    ],
    openingHours: {
      monday: { open: '08:00', close: '22:00' },
      tuesday: { open: '08:00', close: '22:00' },
      wednesday: { open: '08:00', close: '22:00' },
      thursday: { open: '08:00', close: '22:00' },
      friday: { open: '08:00', close: '20:00' },
      saturday: { open: '10:00', close: '18:00' },
      sunday: { open: '12:00', close: '18:00' },
    },
    imageUrl: null,
    contactInfo: {
      phone: '+1-234-567-8900',
      email: 'library@university.edu',
    },
  },
  // Add more buildings...
];
```

---

## 3. Parking Lot Template

### Data Collection Spreadsheet

| Field | Description | Example | Required |
|-------|-------------|---------|----------|
| id | Unique identifier | parking-001 | Yes |
| name | Lot name | Main Parking Lot | Yes |
| code | Short code | P1 | Yes |
| latitude | GPS latitude | 33.6840 | Yes |
| longitude | GPS longitude | 73.0470 | Yes |
| totalSpots | Total parking spaces | 200 | Yes |
| type | Lot type | student | Yes |
| openTime | Opening time | 06:00 | Yes |
| closeTime | Closing time | 22:00 | Yes |
| accessibleSpots | Handicap spaces | 10 | Yes |
| evChargingSpots | EV chargers | 0 | Optional |
| coveredSpots | Covered spaces | 50 | Optional |
| hourlyRate | Cost per hour | 0 | Optional |
| monthlyRate | Monthly pass cost | 0 | Optional |

### Parking Type Options

```typescript
type ParkingType =
  | 'student'
  | 'faculty'
  | 'visitor'
  | 'mixed'
  | 'accessible'
  | 'motorcycle'
  | 'bicycle';
```

### TypeScript Parking Template

```typescript
// src/data/campusData.ts

import { ParkingLot } from '@/types';

export const PARKING_LOTS: ParkingLot[] = [
  {
    id: 'parking-001',
    name: 'Main Parking Lot',
    code: 'P1',
    coordinate: {
      latitude: 33.6840,
      longitude: 73.0470,
    },
    totalSpots: 200,
    availableSpots: 200, // Initial value, will be updated dynamically
    type: 'student',
    operatingHours: {
      open: '06:00',
      close: '22:00',
    },
    accessibleSpots: 10,
    evChargingSpots: 4,
    coveredSpots: 50,
    hourlyRate: 0, // Free for students
    monthlyRate: 0,
    peakHours: [
      { day: 'monday', startTime: '08:00', endTime: '10:00' },
      { day: 'monday', startTime: '14:00', endTime: '16:00' },
      { day: 'tuesday', startTime: '08:00', endTime: '10:00' },
      // Add for each day...
    ],
    nearestBuildings: ['building-001', 'building-002'],
  },
  // Add more parking lots...
];
```

---

## 4. Room Data Template

### Data Collection Spreadsheet

| Field | Description | Example | Required |
|-------|-------------|---------|----------|
| id | Unique identifier | room-001 | Yes |
| buildingId | Parent building ID | building-001 | Yes |
| name | Room name | Computer Lab A | Yes |
| number | Room number | 101 | Yes |
| floor | Floor number | 1 | Yes |
| type | Room type | lab | Yes |
| capacity | Max occupancy | 30 | Optional |

### Room Type Options

```typescript
type RoomType =
  | 'classroom'
  | 'lecture_hall'
  | 'lab'
  | 'office'
  | 'conference'
  | 'restroom'
  | 'cafeteria'
  | 'study_room'
  | 'library'
  | 'gym'
  | 'auditorium'
  | 'storage'
  | 'other';
```

### TypeScript Room Template

```typescript
// src/data/campusData.ts

import { Room } from '@/types';

export const ROOMS: Room[] = [
  {
    id: 'room-001',
    buildingId: 'building-001',
    name: 'Computer Lab A',
    number: '101',
    floor: 1,
    type: 'lab',
    capacity: 30,
    facilities: ['Computers', 'Projector', 'Whiteboard'],
    accessibilityFeatures: ['wide_doors', 'accessible_seating'],
  },
  {
    id: 'room-002',
    buildingId: 'building-001',
    name: 'Study Room 1',
    number: '102',
    floor: 1,
    type: 'study_room',
    capacity: 6,
    facilities: ['Whiteboard', 'Power outlets'],
    accessibilityFeatures: [],
  },
  // Add more rooms...
];
```

---

## 5. Video Route Recording Guide

### Equipment Needed

- Smartphone with good camera
- Gimbal or stabilizer (optional but recommended)
- Fully charged battery
- Clear weather (for outdoor routes)

### Recording Guidelines

1. **Orientation:** Hold phone horizontally (landscape)
2. **Resolution:** 1080p minimum, 4K preferred
3. **Duration:** Keep under 2 minutes per route
4. **Speed:** Walk at normal pace
5. **Narration:** Optional voice guidance
6. **Format:** MP4

### Recording Checklist

```markdown
Before Recording:
- [ ] Battery charged
- [ ] Storage space available
- [ ] Route planned
- [ ] Weather suitable
- [ ] Low traffic time

During Recording:
- [ ] Start from clear landmark
- [ ] Keep camera steady
- [ ] Show important turns
- [ ] Pause at decision points
- [ ] End at destination entrance

After Recording:
- [ ] Trim start/end
- [ ] Check video quality
- [ ] Compress if needed
- [ ] Upload to hosting
```

### Video Hosting Options (Free)

| Service | Free Tier | Direct URL | Recommended |
|---------|-----------|------------|-------------|
| YouTube (Unlisted) | Unlimited | No | No |
| Cloudinary | 25GB | Yes | Yes |
| Firebase Storage | 5GB | Yes | Yes |
| AWS S3 (Free tier) | 5GB | Yes | Yes |
| GitHub Releases | 2GB/file | Yes | For small files |

### Video Route Data Template

```typescript
// src/data/campusData.ts

export const VIDEO_ROUTES: Record<string, string> = {
  // Format: 'fromBuildingId_to_toBuildingId': 'videoUrl'
  'building-001_to_building-002': 'https://your-cdn.com/routes/lib-to-eng.mp4',
  'building-002_to_building-001': 'https://your-cdn.com/routes/eng-to-lib.mp4',
  'building-001_to_building-003': 'https://your-cdn.com/routes/lib-to-cafe.mp4',
  // Add more routes...
};

// Helper function to get video URL
export const getVideoRouteUrl = (fromId: string, toId: string): string | null => {
  return VIDEO_ROUTES[`${fromId}_to_${toId}`] || null;
};
```

---

## 6. Complete Example

### Full campusData.ts File

```typescript
// src/data/campusData.ts

import {
  Building,
  ParkingLot,
  Room,
  Coordinate,
} from '@/types';

// Campus center coordinates
export const CAMPUS_CONFIG = {
  center: {
    latitude: 33.6844,  // Replace with your campus center
    longitude: 73.0479,
  },
  latitudeDelta: 0.01,  // Zoom level
  longitudeDelta: 0.01,
  name: 'University Campus',
};

// All buildings
export const BUILDINGS: Building[] = [
  // Academic Buildings
  {
    id: 'building-eng',
    name: 'Engineering Building',
    code: 'ENG',
    category: 'academic',
    coordinate: { latitude: 33.6850, longitude: 73.0485 },
    description: 'Home to the Engineering Department with labs and classrooms.',
    floors: 4,
    accessibilityFeatures: ['wheelchair_ramp', 'elevator', 'accessible_washroom'],
    facilities: ['Lecture Halls', 'Computer Labs', 'Workshop', 'Faculty Offices'],
    openingHours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '16:00' },
      saturday: null,
      sunday: null,
    },
    imageUrl: null,
  },
  {
    id: 'building-sci',
    name: 'Science Complex',
    code: 'SCI',
    category: 'academic',
    coordinate: { latitude: 33.6855, longitude: 73.0490 },
    description: 'Science departments including Physics, Chemistry, and Biology.',
    floors: 3,
    accessibilityFeatures: ['wheelchair_ramp', 'elevator'],
    facilities: ['Research Labs', 'Lecture Halls', 'Student Lounge'],
    openingHours: {
      monday: { open: '08:00', close: '20:00' },
      tuesday: { open: '08:00', close: '20:00' },
      wednesday: { open: '08:00', close: '20:00' },
      thursday: { open: '08:00', close: '20:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '09:00', close: '14:00' },
      sunday: null,
    },
    imageUrl: null,
  },

  // Library
  {
    id: 'building-lib',
    name: 'Central Library',
    code: 'LIB',
    category: 'library',
    coordinate: { latitude: 33.6844, longitude: 73.0479 },
    description: 'Main campus library with extensive collections and study spaces.',
    floors: 3,
    accessibilityFeatures: [
      'wheelchair_ramp',
      'elevator',
      'accessible_washroom',
      'braille_signage',
      'hearing_loop',
    ],
    facilities: [
      'Silent Study Area',
      'Group Study Rooms',
      'Computer Lab',
      'Printing Services',
      'Research Section',
      'Media Center',
    ],
    openingHours: {
      monday: { open: '07:00', close: '23:00' },
      tuesday: { open: '07:00', close: '23:00' },
      wednesday: { open: '07:00', close: '23:00' },
      thursday: { open: '07:00', close: '23:00' },
      friday: { open: '07:00', close: '21:00' },
      saturday: { open: '09:00', close: '18:00' },
      sunday: { open: '10:00', close: '18:00' },
    },
    imageUrl: null,
  },

  // Cafeteria
  {
    id: 'building-cafe',
    name: 'Student Center & Cafeteria',
    code: 'CAFE',
    category: 'cafeteria',
    coordinate: { latitude: 33.6838, longitude: 73.0472 },
    description: 'Main dining facility with multiple food options.',
    floors: 2,
    accessibilityFeatures: ['wheelchair_ramp', 'accessible_washroom', 'lowered_counters'],
    facilities: ['Food Court', 'Coffee Shop', 'Student Lounge', 'ATM'],
    openingHours: {
      monday: { open: '07:00', close: '21:00' },
      tuesday: { open: '07:00', close: '21:00' },
      wednesday: { open: '07:00', close: '21:00' },
      thursday: { open: '07:00', close: '21:00' },
      friday: { open: '07:00', close: '21:00' },
      saturday: { open: '08:00', close: '18:00' },
      sunday: { open: '09:00', close: '17:00' },
    },
    imageUrl: null,
  },

  // Administration
  {
    id: 'building-admin',
    name: 'Administration Building',
    code: 'ADMIN',
    category: 'administrative',
    coordinate: { latitude: 33.6860, longitude: 73.0475 },
    description: 'Main administrative offices, registrar, and admissions.',
    floors: 2,
    accessibilityFeatures: ['wheelchair_ramp', 'elevator', 'accessible_washroom'],
    facilities: ['Registrar', 'Admissions', 'Finance Office', 'Student Services'],
    openingHours: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '16:00' },
      saturday: null,
      sunday: null,
    },
    imageUrl: null,
  },

  // Sports
  {
    id: 'building-sports',
    name: 'Sports Complex',
    code: 'SPORTS',
    category: 'sports',
    coordinate: { latitude: 33.6830, longitude: 73.0495 },
    description: 'Athletic facilities including gym, pool, and courts.',
    floors: 2,
    accessibilityFeatures: ['wheelchair_ramp', 'accessible_washroom', 'elevator'],
    facilities: ['Gymnasium', 'Swimming Pool', 'Basketball Courts', 'Fitness Center'],
    openingHours: {
      monday: { open: '06:00', close: '22:00' },
      tuesday: { open: '06:00', close: '22:00' },
      wednesday: { open: '06:00', close: '22:00' },
      thursday: { open: '06:00', close: '22:00' },
      friday: { open: '06:00', close: '20:00' },
      saturday: { open: '08:00', close: '18:00' },
      sunday: { open: '10:00', close: '16:00' },
    },
    imageUrl: null,
  },

  // Medical
  {
    id: 'building-health',
    name: 'Health Center',
    code: 'HEALTH',
    category: 'medical',
    coordinate: { latitude: 33.6835, longitude: 73.0465 },
    description: 'Campus health services and first aid.',
    floors: 1,
    accessibilityFeatures: [
      'wheelchair_ramp',
      'accessible_washroom',
      'automatic_doors',
      'wide_doors',
    ],
    facilities: ['Medical Clinic', 'Counseling Services', 'Pharmacy'],
    openingHours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '16:00' },
      saturday: { open: '09:00', close: '13:00' },
      sunday: null, // Emergency only
    },
    imageUrl: null,
  },
];

// All parking lots
export const PARKING_LOTS: ParkingLot[] = [
  {
    id: 'parking-main',
    name: 'Main Parking Lot',
    code: 'P1',
    coordinate: { latitude: 33.6840, longitude: 73.0460 },
    totalSpots: 300,
    availableSpots: 300,
    type: 'mixed',
    operatingHours: { open: '06:00', close: '23:00' },
    accessibleSpots: 15,
    evChargingSpots: 6,
    coveredSpots: 100,
    hourlyRate: 0,
    monthlyRate: 0,
    peakHours: [
      { day: 'monday', startTime: '08:00', endTime: '10:00' },
      { day: 'monday', startTime: '13:00', endTime: '15:00' },
      { day: 'tuesday', startTime: '08:00', endTime: '10:00' },
      { day: 'wednesday', startTime: '08:00', endTime: '10:00' },
      { day: 'thursday', startTime: '08:00', endTime: '10:00' },
      { day: 'friday', startTime: '08:00', endTime: '10:00' },
    ],
    nearestBuildings: ['building-lib', 'building-admin'],
  },
  {
    id: 'parking-eng',
    name: 'Engineering Parking',
    code: 'P2',
    coordinate: { latitude: 33.6858, longitude: 73.0492 },
    totalSpots: 150,
    availableSpots: 150,
    type: 'student',
    operatingHours: { open: '06:00', close: '22:00' },
    accessibleSpots: 8,
    evChargingSpots: 4,
    coveredSpots: 0,
    hourlyRate: 0,
    monthlyRate: 0,
    peakHours: [
      { day: 'monday', startTime: '09:00', endTime: '11:00' },
      { day: 'wednesday', startTime: '09:00', endTime: '11:00' },
    ],
    nearestBuildings: ['building-eng', 'building-sci'],
  },
  {
    id: 'parking-sports',
    name: 'Sports Complex Parking',
    code: 'P3',
    coordinate: { latitude: 33.6825, longitude: 73.0500 },
    totalSpots: 100,
    availableSpots: 100,
    type: 'mixed',
    operatingHours: { open: '06:00', close: '23:00' },
    accessibleSpots: 5,
    evChargingSpots: 0,
    coveredSpots: 0,
    hourlyRate: 0,
    monthlyRate: 0,
    peakHours: [
      { day: 'saturday', startTime: '09:00', endTime: '12:00' },
      { day: 'sunday', startTime: '10:00', endTime: '13:00' },
    ],
    nearestBuildings: ['building-sports'],
  },
];

// Video routes (optional)
export const VIDEO_ROUTES: Record<string, string> = {
  'building-lib_to_building-eng': '',    // Add URL when recorded
  'building-eng_to_building-lib': '',
  'building-lib_to_building-cafe': '',
  'building-cafe_to_building-lib': '',
  'building-admin_to_building-lib': '',
  // Add more as needed
};

// Helper functions
export const getBuildingById = (id: string): Building | undefined => {
  return BUILDINGS.find(b => b.id === id);
};

export const getBuildingByCode = (code: string): Building | undefined => {
  return BUILDINGS.find(b => b.code.toLowerCase() === code.toLowerCase());
};

export const getBuildingsByCategory = (category: string): Building[] => {
  return BUILDINGS.filter(b => b.category === category);
};

export const getParkingLotById = (id: string): ParkingLot | undefined => {
  return PARKING_LOTS.find(p => p.id === id);
};

export const getAccessibleBuildings = (): Building[] => {
  return BUILDINGS.filter(b =>
    b.accessibilityFeatures.includes('wheelchair_ramp') &&
    b.accessibilityFeatures.includes('elevator')
  );
};

export const getNearestParking = (buildingId: string): ParkingLot | undefined => {
  return PARKING_LOTS.find(p => p.nearestBuildings?.includes(buildingId));
};
```

---

## 7. GPS Coordinate Collection

### Method 1: Google Maps (Desktop)

```
1. Open Google Maps on computer
2. Navigate to your campus
3. Right-click on building location
4. Click the coordinates that appear
5. Coordinates are copied to clipboard
6. Paste into spreadsheet

Format: 33.6844, 73.0479 (latitude, longitude)
```

### Method 2: Google Maps (Mobile)

```
1. Open Google Maps app
2. Long-press on building location
3. Dropped pin shows coordinates at top
4. Tap to copy

Format: 33.6844, 73.0479
```

### Method 3: GPS Apps

Recommended apps:
- **GPS Status & Toolbox** (Android)
- **GPS Coordinates** (iOS)
- **What3Words** (Cross-platform)

### Coordinate Accuracy Tips

```
1. Stand at building entrance (not center)
2. Wait for GPS accuracy < 5 meters
3. Take multiple readings, average them
4. Verify on map after collection
5. Use satellite view for verification
```

### Batch Collection Template

```csv
building_id,building_name,code,category,latitude,longitude,notes
building-001,Main Library,LIB,library,33.6844,73.0479,Collected from entrance
building-002,Engineering,ENG,academic,33.6850,73.0485,Northwest corner
building-003,Cafeteria,CAFE,cafeteria,33.6838,73.0472,Main entrance
```

---

## Validation Checklist

Before deploying:

- [ ] All coordinates verified on map
- [ ] No duplicate IDs
- [ ] All required fields filled
- [ ] Opening hours accurate
- [ ] Accessibility features verified
- [ ] Parking spot counts correct
- [ ] Video routes tested (if any)
- [ ] Category assignments correct
- [ ] Building codes unique

---

**Document Version:** 1.0
**Last Updated:** November 2025

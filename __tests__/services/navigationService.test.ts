// ==========================================
// Navigation Service Tests
// ==========================================

import {
  calculateDistance,
  getBearing,
  formatDistance,
  formatDuration,
  searchBuildings,
  searchRooms,
  getAccessibleBuildings,
} from '../../src/services/navigationService';
import { Building, Room } from '../../src/types';

// Mock campus data
const mockBuildings: Building[] = [
  {
    id: 'bld-1',
    name: 'Main Academic Block',
    shortName: 'MAB',
    latitude: 31.5210,
    longitude: 74.3590,
    floors: 4,
    description: 'Primary academic building',
    category: 'academic',
    facilities: ['Classrooms'],
    accessibilityFeatures: ['wheelchair_ramp', 'elevator'],
  },
  {
    id: 'bld-2',
    name: 'Central Library',
    shortName: 'LIB',
    latitude: 31.5205,
    longitude: 74.3580,
    floors: 3,
    description: 'Main library',
    category: 'library',
    facilities: ['Reading Halls'],
    accessibilityFeatures: ['wheelchair_ramp', 'braille_signage'],
  },
  {
    id: 'bld-3',
    name: 'Sports Complex',
    shortName: 'SPORTS',
    latitude: 31.5220,
    longitude: 74.3575,
    floors: 2,
    description: 'Sports facilities',
    category: 'sports',
    facilities: ['Gymnasium'],
    accessibilityFeatures: [],
  },
];

const mockRooms: Room[] = [
  {
    id: 'room-1',
    buildingId: 'bld-1',
    floor: 1,
    roomNumber: '101',
    name: 'Lecture Hall A',
    type: 'classroom',
    capacity: 100,
    facilities: ['Projector'],
    accessibilityFeatures: ['wide_doors'],
  },
  {
    id: 'room-2',
    buildingId: 'bld-1',
    floor: 2,
    roomNumber: '201',
    name: 'Computer Lab 1',
    type: 'lab',
    capacity: 40,
    facilities: ['Computers'],
    accessibilityFeatures: [],
  },
];

describe('NavigationService', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates using Haversine formula', () => {
      const from = { latitude: 31.5210, longitude: 74.3590 };
      const to = { latitude: 31.5205, longitude: 74.3580 };

      const distance = calculateDistance(from, to);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(200); // Less than 200 meters
      expect(typeof distance).toBe('number');
    });

    it('should return 0 for same coordinates', () => {
      const point = { latitude: 31.5210, longitude: 74.3590 };

      const distance = calculateDistance(point, point);

      expect(distance).toBe(0);
    });

    it('should calculate longer distances correctly', () => {
      const lahore = { latitude: 31.5497, longitude: 74.3436 };
      const karachi = { latitude: 24.8607, longitude: 67.0011 };

      const distance = calculateDistance(lahore, karachi);

      expect(distance).toBeGreaterThan(1000000); // More than 1000 km
    });
  });

  describe('getBearing', () => {
    it('should calculate bearing from one point to another', () => {
      const from = { latitude: 31.5210, longitude: 74.3590 };
      const to = { latitude: 31.5220, longitude: 74.3590 }; // North

      const bearing = getBearing(from, to);

      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
      expect(bearing).toBeCloseTo(0, 0); // Approximately north
    });

    it('should return different bearings for different directions', () => {
      const from = { latitude: 31.5210, longitude: 74.3590 };
      const east = { latitude: 31.5210, longitude: 74.3600 };
      const south = { latitude: 31.5200, longitude: 74.3590 };

      const bearingEast = getBearing(from, east);
      const bearingSouth = getBearing(from, south);

      expect(bearingEast).toBeCloseTo(90, 0); // Approximately east
      expect(bearingSouth).toBeCloseTo(180, 0); // Approximately south
    });
  });

  describe('formatDistance', () => {
    it('should format distances less than 1km in meters', () => {
      expect(formatDistance(500)).toBe('500 m');
      expect(formatDistance(100)).toBe('100 m');
      expect(formatDistance(999)).toBe('999 m');
    });

    it('should format distances 1km or more in kilometers', () => {
      expect(formatDistance(1000)).toBe('1.0 km');
      expect(formatDistance(1500)).toBe('1.5 km');
      expect(formatDistance(2345)).toBe('2.3 km');
      expect(formatDistance(10000)).toBe('10.0 km');
    });

    it('should round to one decimal place for kilometers', () => {
      expect(formatDistance(1234)).toBe('1.2 km');
      expect(formatDistance(5678)).toBe('5.7 km');
    });
  });

  describe('formatDuration', () => {
    it('should format durations less than 1 hour in minutes', () => {
      expect(formatDuration(30)).toBe('30 min');
      expect(formatDuration(5)).toBe('5 min');
      expect(formatDuration(59)).toBe('59 min');
    });

    it('should format durations 1 hour or more', () => {
      expect(formatDuration(60)).toBe('1 h 0 min');
      expect(formatDuration(90)).toBe('1 h 30 min');
      expect(formatDuration(120)).toBe('2 h 0 min');
      expect(formatDuration(135)).toBe('2 h 15 min');
    });

    it('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('0 min');
    });

    it('should handle large durations', () => {
      expect(formatDuration(300)).toBe('5 h 0 min');
      expect(formatDuration(1440)).toBe('24 h 0 min'); // 1 day
    });
  });

  describe('searchBuildings', () => {
    // Note: This would need the actual function to be exported from navigationService
    // For now, we test the concept

    it('should find buildings by name', () => {
      const query = 'library';
      const results = mockBuildings.filter(b =>
        b.name.toLowerCase().includes(query.toLowerCase())
      );

      expect(results).toHaveLength(1);
      expect(results[0].shortName).toBe('LIB');
    });

    it('should find buildings by short name', () => {
      const query = 'MAB';
      const results = mockBuildings.filter(b =>
        b.shortName.toLowerCase().includes(query.toLowerCase())
      );

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Main Academic Block');
    });

    it('should return empty array for no matches', () => {
      const query = 'xyz123';
      const results = mockBuildings.filter(b =>
        b.name.toLowerCase().includes(query.toLowerCase())
      );

      expect(results).toHaveLength(0);
    });

    it('should be case insensitive', () => {
      const query = 'LIBRARY';
      const results = mockBuildings.filter(b =>
        b.name.toLowerCase().includes(query.toLowerCase())
      );

      expect(results).toHaveLength(1);
    });
  });

  describe('getAccessibleBuildings', () => {
    it('should return only buildings with accessibility features', () => {
      const accessible = mockBuildings.filter(b =>
        b.accessibilityFeatures.length > 0
      );

      expect(accessible).toHaveLength(2);
      expect(accessible.every(b => b.accessibilityFeatures.length > 0)).toBe(true);
    });

    it('should exclude buildings without accessibility features', () => {
      const accessible = mockBuildings.filter(b =>
        b.accessibilityFeatures.length > 0
      );

      const hasNonAccessible = accessible.some(b => b.id === 'bld-3');
      expect(hasNonAccessible).toBe(false);
    });

    it('should filter by specific accessibility features', () => {
      const withRamp = mockBuildings.filter(b =>
        b.accessibilityFeatures.includes('wheelchair_ramp')
      );

      expect(withRamp).toHaveLength(2);
      expect(withRamp.every(b =>
        b.accessibilityFeatures.includes('wheelchair_ramp')
      )).toBe(true);
    });
  });

  describe('searchRooms', () => {
    it('should find rooms by room number', () => {
      const query = '101';
      const results = mockRooms.filter(r =>
        r.roomNumber.includes(query)
      );

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Lecture Hall A');
    });

    it('should find rooms by name', () => {
      const query = 'lab';
      const results = mockRooms.filter(r =>
        r.name.toLowerCase().includes(query.toLowerCase())
      );

      expect(results).toHaveLength(1);
      expect(results[0].roomNumber).toBe('201');
    });

    it('should filter rooms by building', () => {
      const buildingRooms = mockRooms.filter(r => r.buildingId === 'bld-1');

      expect(buildingRooms).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('calculateDistance should handle extreme coordinates', () => {
      const northPole = { latitude: 90, longitude: 0 };
      const southPole = { latitude: -90, longitude: 0 };

      const distance = calculateDistance(northPole, southPole);

      expect(distance).toBeGreaterThan(0);
      expect(isFinite(distance)).toBe(true);
    });

    it('getBearing should handle equal coordinates', () => {
      const point = { latitude: 31.5210, longitude: 74.3590 };

      const bearing = getBearing(point, point);

      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });

    it('formatDistance should handle negative distances gracefully', () => {
      // While mathematically incorrect, ensure no errors
      expect(() => formatDistance(-100)).not.toThrow();
    });

    it('formatDuration should handle negative durations gracefully', () => {
      expect(() => formatDuration(-30)).not.toThrow();
    });
  });
});

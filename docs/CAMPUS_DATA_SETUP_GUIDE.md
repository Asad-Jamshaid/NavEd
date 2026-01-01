# Campus Data Setup Guide

## Quick Start

To make NavEd work for your university, you need to replace the sample data with your actual campus information.

## Step 1: Get Your Campus Coordinates

### Method 1: Using Google Maps
1. Open [Google Maps](https://www.google.com/maps)
2. Search for your university
3. Right-click on the main building/center of campus
4. Click the coordinates that appear (e.g., "31.5204, 74.3587")
5. Copy the latitude and longitude

### Method 2: Using GPS on Your Phone
1. Open Google Maps on your phone
2. Go to your campus location
3. Long-press on the map
4. The coordinates will appear at the bottom

## Step 2: Update Campus Configuration

Edit `src/utils/constants.ts`:

```typescript
export const CAMPUS_CONFIG = {
  center: {
    latitude: YOUR_LATITUDE,  // Replace with your campus center
    longitude: YOUR_LONGITUDE, // Replace with your campus center
  },
  defaultZoom: 16,
  minZoom: 14,
  maxZoom: 20,
};
```

## Step 3: Add Your Buildings

Edit `src/data/campusData.ts` and replace the `BUILDINGS` array:

### For Each Building, You Need:

1. **Basic Info:**
   - `id`: Unique identifier (e.g., 'bld-1')
   - `name`: Full building name (e.g., 'Main Academic Block')
   - `shortName`: Abbreviation (e.g., 'MAB')
   - `latitude`: GPS latitude
   - `longitude`: GPS longitude
   - `floors`: Number of floors
   - `description`: Brief description
   - `category`: One of: 'academic', 'administrative', 'library', 'cafeteria', 'sports', 'hostel', 'medical', 'parking', 'other'

2. **Facilities:** Array of strings (e.g., ['Classrooms', 'Labs', 'WiFi'])

3. **Accessibility Features:** Array from:
   - 'wheelchair_ramp'
   - 'elevator'
   - 'braille_signage'
   - 'audio_guidance'
   - 'wide_doors'
   - 'accessible_washroom'
   - 'tactile_paving'

### Example Building Entry:

```typescript
{
  id: 'bld-1',
  name: 'Main Academic Block',
  shortName: 'MAB',
  latitude: 31.5210,  // Your building's latitude
  longitude: 74.3590, // Your building's longitude
  floors: 4,
  description: 'Primary academic building with classrooms and labs',
  category: 'academic',
  facilities: ['Classrooms', 'Computer Labs', 'Seminar Halls'],
  accessibilityFeatures: ['wheelchair_ramp', 'elevator', 'wide_doors'],
}
```

### How to Get Building Coordinates:

1. **Using Google Maps:**
   - Search for your building name
   - Right-click on the building
   - Copy coordinates

2. **Using Your Phone:**
   - Stand at the building entrance
   - Open Google Maps
   - Your location will show coordinates
   - Note them down

## Step 4: Add Rooms (Optional)

If you want room-level navigation, add rooms to the `ROOMS` array:

```typescript
{
  id: 'room-1',
  buildingId: 'bld-1', // Must match a building ID
  floor: 1,
  roomNumber: '101',
  name: 'Computer Lab 1',
  type: 'lab',
  capacity: 30,
  facilities: ['Computers', 'Projector'],
  accessibilityFeatures: ['wide_doors'],
}
```

## Step 5: Add Parking Lots

Replace the `PARKING_LOTS` array:

```typescript
{
  id: 'park-1',
  name: 'Main Gate Parking',
  latitude: 31.5195,  // Parking lot location
  longitude: 74.3588,
  totalSpots: 100,
  availableSpots: 45, // Update this regularly or use crowdsourcing
  type: 'mixed', // 'car', 'motorcycle', 'bicycle', or 'mixed'
  isAccessible: true,
  operatingHours: {
    open: '06:00',
    close: '22:00',
    days: [1, 2, 3, 4, 5, 6] // Monday-Saturday (0=Sunday)
  },
  lastUpdated: new Date(),
  peakHours: [
    {
      dayOfWeek: 1, // Monday
      startHour: 8,
      endHour: 10,
      averageOccupancy: 90 // Percentage
    }
  ],
}
```

## Step 6: Add Video Routes (Optional)

If you have video navigation guides, add them to `VIDEO_ROUTES`:

```typescript
export const VIDEO_ROUTES: Record<string, string> = {
  'gate-to-mab': 'https://your-cdn.com/videos/gate-to-mab.mp4',
  'gate-to-library': 'https://your-cdn.com/videos/gate-to-library.mp4',
};
```

## Tips for Data Collection

### Efficient Method:
1. **Create a Spreadsheet:**
   - Column 1: Building Name
   - Column 2: Short Name
   - Column 3: Latitude
   - Column 4: Longitude
   - Column 5: Category
   - Column 6: Facilities (comma-separated)
   - Column 7: Accessibility Features (comma-separated)

2. **Collect Data:**
   - Walk around campus with Google Maps open
   - Note coordinates for each building
   - Take photos for reference

3. **Convert to Code:**
   - Use the spreadsheet to generate the TypeScript array
   - Copy-paste into `campusData.ts`

### Quick Data Collection Script:

You can use this helper to convert a CSV to the building format:

```typescript
// Example CSV format:
// Building Name,Short Name,Latitude,Longitude,Category,Facilities,Accessibility
// Main Academic Block,MAB,31.5210,74.3590,academic,"Classrooms,Labs","wheelchair_ramp,elevator"
```

## Validation Checklist

Before using your app, verify:

- [ ] Campus center coordinates are correct
- [ ] All buildings have valid coordinates
- [ ] Building IDs are unique
- [ ] Room `buildingId` values match actual building IDs
- [ ] Parking lots have valid coordinates
- [ ] All categories are from the allowed list
- [ ] Accessibility features use correct names

## Testing Your Data

After updating the data:

1. Run the app: `npm start`
2. Open the Campus Map screen
3. Verify buildings appear in correct locations
4. Test search functionality
5. Test navigation to buildings
6. Verify parking lots show up

## Need Help?

- Check `src/data/campusData.ts` for the full data structure
- See `src/types/index.ts` for type definitions
- Review the sample data as examples

## Common Issues

**Buildings don't appear on map:**
- Check coordinates are valid (latitude: -90 to 90, longitude: -180 to 180)
- Verify campus center is near your buildings
- Check zoom level (try zooming in/out)

**Navigation doesn't work:**
- Ensure coordinates are accurate (within 10 meters)
- Check internet connection (OSRM routing needs internet)

**Search doesn't find buildings:**
- Verify building names are spelled correctly
- Check that `shortName` is set


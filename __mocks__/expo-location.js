// Mock for expo-location
module.exports = {
    // Permission status
    PermissionStatus: {
        GRANTED: 'granted',
        DENIED: 'denied',
        UNDETERMINED: 'undetermined',
    },

    // Location accuracy
    Accuracy: {
        Lowest: 1,
        Low: 2,
        Balanced: 3,
        High: 4,
        Highest: 5,
        BestForNavigation: 6,
    },

    // Activity type
    ActivityType: {
        Other: 1,
        AutomotiveNavigation: 2,
        Fitness: 3,
        OtherNavigation: 4,
        Airborne: 5,
    },

    // Permission methods
    requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({
        status: 'granted',
        granted: true,
        canAskAgain: true,
    })),
    requestBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({
        status: 'granted',
        granted: true,
        canAskAgain: true,
    })),
    getForegroundPermissionsAsync: jest.fn(() => Promise.resolve({
        status: 'granted',
        granted: true,
        canAskAgain: true,
    })),
    getBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({
        status: 'granted',
        granted: true,
        canAskAgain: true,
    })),

    // Location methods
    getCurrentPositionAsync: jest.fn(() => Promise.resolve({
        coords: {
            latitude: 31.5204,
            longitude: 74.3587,
            altitude: 100,
            accuracy: 10,
            altitudeAccuracy: 5,
            heading: 0,
            speed: 0,
        },
        timestamp: Date.now(),
    })),
    getLastKnownPositionAsync: jest.fn(() => Promise.resolve({
        coords: {
            latitude: 31.5204,
            longitude: 74.3587,
            altitude: 100,
            accuracy: 10,
            altitudeAccuracy: 5,
            heading: 0,
            speed: 0,
        },
        timestamp: Date.now(),
    })),
    watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
    watchHeadingAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
    getHeadingAsync: jest.fn(() => Promise.resolve({
        trueHeading: 0,
        magHeading: 0,
        accuracy: 1,
    })),

    // Geocoding
    geocodeAsync: jest.fn(() => Promise.resolve([{
        latitude: 31.5204,
        longitude: 74.3587,
    }])),
    reverseGeocodeAsync: jest.fn(() => Promise.resolve([{
        city: 'Lahore',
        country: 'Pakistan',
        district: 'Test District',
        name: 'Test Location',
        postalCode: '54000',
        region: 'Punjab',
        street: 'Test Street',
        streetNumber: '123',
    }])),

    // Background location
    hasStartedLocationUpdatesAsync: jest.fn(() => Promise.resolve(false)),
    startLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
    stopLocationUpdatesAsync: jest.fn(() => Promise.resolve()),

    // Geofencing
    hasStartedGeofencingAsync: jest.fn(() => Promise.resolve(false)),
    startGeofencingAsync: jest.fn(() => Promise.resolve()),
    stopGeofencingAsync: jest.fn(() => Promise.resolve()),

    // Service status
    hasServicesEnabledAsync: jest.fn(() => Promise.resolve(true)),
    isBackgroundLocationAvailableAsync: jest.fn(() => Promise.resolve(true)),
};

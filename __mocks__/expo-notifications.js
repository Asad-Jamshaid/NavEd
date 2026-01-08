// Mock for expo-notifications
module.exports = {
    scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
    cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
    cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
    getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted', granted: true })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted', granted: true })),
    getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'ExponentPushToken[xxx]' })),
    setNotificationHandler: jest.fn(),
    addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
    addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
    AndroidImportance: {
        DEFAULT: 3,
        HIGH: 4,
        LOW: 2,
        MAX: 5,
        MIN: 1,
        NONE: 0,
    },
};

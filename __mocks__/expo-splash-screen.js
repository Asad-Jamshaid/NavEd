// Mock for expo-splash-screen
module.exports = {
    preventAutoHideAsync: jest.fn(() => Promise.resolve()),
    hideAsync: jest.fn(() => Promise.resolve()),
    setOptions: jest.fn(),
};

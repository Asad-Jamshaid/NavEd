// Mock for expo-speech
module.exports = {
    speak: jest.fn(() => Promise.resolve()),
    stop: jest.fn(() => Promise.resolve()),
    pause: jest.fn(() => Promise.resolve()),
    resume: jest.fn(() => Promise.resolve()),
    isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
    getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])),
    VoiceQuality: {
        Default: 'Default',
        Enhanced: 'Enhanced',
    },
};

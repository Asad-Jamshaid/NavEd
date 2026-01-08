// Mock for expo-av
module.exports = {
    Video: 'Video',
    Audio: {
        Sound: {
            createAsync: jest.fn(() => Promise.resolve({ 
                sound: { unloadAsync: jest.fn() },
                status: {
                    isLoaded: false,
                    shouldPlay: false,
                    isPlaying: false,
                    rate: 1.0,
                    shouldCorrectPitch: false,
                    volume: 1.0,
                    isMuted: false,
                    isLooping: false,
                    didJustFinish: false,
                }
            })),
        },
        setAudioModeAsync: jest.fn(),
    },
    ResizeMode: {
        CONTAIN: 'contain',
        COVER: 'cover',
        STRETCH: 'stretch',
    },
};

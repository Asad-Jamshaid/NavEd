// Mock for react-native in tests
// Note: @testing-library/react-native needs actual React Native components
// So we provide minimal mocks that work with the testing library
const React = require('react');

module.exports = {
    StyleSheet: {
        create: (styles) => styles,
    },
    View: ({ children, ...props }) => React.createElement('View', props, children),
    Text: ({ children, ...props }) => React.createElement('Text', props, children),
    TextInput: (props) => React.createElement('TextInput', props),
    Button: ({ title, onPress, ...props }) => React.createElement('Button', { ...props, title, onPress }),
    TouchableOpacity: ({ children, ...props }) => React.createElement('TouchableOpacity', props, children),
    Pressable: ({ children, ...props }) => React.createElement('Pressable', props, children),
    Switch: (props) => React.createElement('Switch', props),
    ScrollView: ({ children, ...props }) => React.createElement('ScrollView', props, children),
    FlatList: (props) => React.createElement('FlatList', props),
    Platform: {
        OS: 'ios',
        select: (obj) => obj.ios || obj.default,
    },
    Dimensions: {
        get: () => ({ width: 375, height: 667 }),
    },
    ActivityIndicator: (props) => React.createElement('ActivityIndicator', props),
    StatusBar: (props) => React.createElement('StatusBar', props),
    Modal: ({ children, ...props }) => React.createElement('Modal', props, children),
    KeyboardAvoidingView: ({ children, ...props }) => React.createElement('KeyboardAvoidingView', props, children),
    TouchableWithoutFeedback: ({ children, ...props }) => React.createElement('TouchableWithoutFeedback', props, children),
    Keyboard: {
        dismiss: jest.fn(),
        addListener: jest.fn(() => ({ remove: jest.fn() })),
        removeListener: jest.fn(),
    },
    Linking: {
        openURL: jest.fn(() => Promise.resolve()),
        canOpenURL: jest.fn(() => Promise.resolve(true)),
        addEventListener: jest.fn(() => ({ remove: jest.fn() })),
        removeEventListener: jest.fn(),
    },
    Alert: {
        alert: jest.fn(),
        prompt: jest.fn(),
    },
    RefreshControl: (props) => React.createElement('RefreshControl', props),
    Animated: {
        View: ({ children, ...props }) => React.createElement('Animated.View', props, children),
        Value: jest.fn((initialValue) => {
            const value = {
                _value: initialValue || 0,
                setValue: jest.fn((val) => { value._value = val; }),
                addListener: jest.fn(),
                removeListener: jest.fn(),
                interpolate: jest.fn((config) => {
                    // Return a mock animated value that can be used in styles
                    return {
                        _value: initialValue || 0,
                        __getValue: () => value._value,
                    };
                }),
            };
            return value;
        }),
        timing: jest.fn(() => ({ start: jest.fn() })),
        sequence: jest.fn((animations) => ({ start: jest.fn(), stop: jest.fn() })),
        loop: jest.fn((animation) => ({ start: jest.fn(), stop: jest.fn() })),
    },
    // Add useColorScheme mock
    useColorScheme: jest.fn(() => 'light'),
    Appearance: {
        getColorScheme: jest.fn(() => 'light'),
        addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
        removeChangeListener: jest.fn(),
    },
};

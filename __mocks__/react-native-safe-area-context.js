// Mock for react-native-safe-area-context
const React = require('react');

const insets = { top: 0, right: 0, bottom: 0, left: 0 };
const frame = { x: 0, y: 0, width: 375, height: 667 };

module.exports = {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children, ...props }) => React.createElement('View', props, children),
    SafeAreaInsetsContext: React.createContext(insets),
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: {
        insets,
        frame,
    },
    withSafeAreaInsets: (Component) => Component,
};

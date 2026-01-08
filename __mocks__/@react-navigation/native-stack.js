// Mock for @react-navigation/native-stack
const React = require('react');

const createNativeStackNavigator = () => ({
    Navigator: ({ children, screenOptions, ...props }) => {
        return React.createElement('View', { testID: 'native-stack-navigator', ...props }, children);
    },
    Screen: ({ children, name, component: Component, ...props }) => {
        if (Component && typeof Component === 'function') {
            return React.createElement(Component, { ...props, testID: `screen-${name}` });
        }
        if (children) {
            // Handle function children (render props pattern)
            if (typeof children === 'function') {
                return React.createElement(React.Fragment, {}, children());
            }
            return React.createElement(React.Fragment, {}, children);
        }
        return React.createElement('View', { testID: `screen-${name}-placeholder` });
    },
    Group: ({ children }) => children,
});

module.exports = {
    createNativeStackNavigator,
};

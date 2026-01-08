// Mock for @react-navigation/bottom-tabs
const React = require('react');

const createBottomTabNavigator = () => ({
    Navigator: ({ children, screenOptions, ...props }) => {
        return React.createElement('View', { testID: 'bottom-tab-navigator', ...props }, children);
    },
    Screen: ({ children, name, component: Component, ...props }) => {
        if (Component && typeof Component === 'function') {
            return React.createElement(Component, { ...props, testID: `screen-${name}` });
        }
        if (children) {
            return React.createElement(React.Fragment, {}, children);
        }
        return React.createElement('View', { testID: `screen-${name}-placeholder` });
    },
    Group: ({ children }) => children,
});

module.exports = {
    createBottomTabNavigator,
    BottomTabBar: (props) => React.createElement('View', { testID: 'bottom-tab-bar', ...props }),
    useBottomTabBarHeight: () => 49,
};

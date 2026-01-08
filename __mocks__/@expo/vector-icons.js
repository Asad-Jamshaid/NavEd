// Mock for @expo/vector-icons
const React = require('react');

const createIconComponent = (name) => {
    const IconComponent = (props) => {
        return React.createElement('Text', {
            ...props,
            testID: props.testID || `icon-${name}`,
            children: props.children !== undefined ? props.children : (props.name || name),
        });
    };
    IconComponent.displayName = name;
    return IconComponent;
};

module.exports = {
    MaterialIcons: createIconComponent('MaterialIcons'),
    MaterialCommunityIcons: createIconComponent('MaterialCommunityIcons'),
    FontAwesome: createIconComponent('FontAwesome'),
    FontAwesome5: createIconComponent('FontAwesome5'),
    Ionicons: createIconComponent('Ionicons'),
    AntDesign: createIconComponent('AntDesign'),
    Feather: createIconComponent('Feather'),
    Entypo: createIconComponent('Entypo'),
    createIconSet: jest.fn(() => createIconComponent('CustomIcon')),
    createIconSetFromFontello: jest.fn(() => createIconComponent('FontelloIcon')),
    createIconSetFromIcoMoon: jest.fn(() => createIconComponent('IcoMoonIcon')),
};

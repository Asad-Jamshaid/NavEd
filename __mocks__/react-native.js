// Mock for react-native in tests
module.exports = {
    StyleSheet: {
        create: (styles) => styles,
    },
    View: 'View',
    Text: 'Text',
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
    ScrollView: 'ScrollView',
    FlatList: 'FlatList',
    Platform: {
        OS: 'ios',
        select: (obj) => obj.ios || obj.default,
    },
    Dimensions: {
        get: () => ({ width: 375, height: 667 }),
    },
};

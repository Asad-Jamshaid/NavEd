// Mock for @react-navigation/native
const React = require('react');

const NavigationContext = React.createContext(null);
const NavigationContainerRefContext = React.createContext(null);

const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setParams: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    isFocused: jest.fn(() => true),
    addListener: jest.fn(() => jest.fn()),
    removeListener: jest.fn(),
    canGoBack: jest.fn(() => true),
    getParent: jest.fn(),
    getState: jest.fn(() => ({ routes: [], index: 0 })),
};

const mockRoute = {
    key: 'mock-key',
    name: 'MockScreen',
    params: {},
};

module.exports = {
    NavigationContainer: ({ children }) => children,
    NavigationContext,
    NavigationContainerRefContext,
    useNavigation: () => mockNavigation,
    useRoute: () => mockRoute,
    useFocusEffect: (callback) => {
        React.useEffect(() => {
            callback();
        }, []);
    },
    useIsFocused: () => true,
    useNavigationState: jest.fn((selector) => {
        const mockState = { routes: [], index: 0 };
        return typeof selector === 'function' ? selector(mockState) : mockState;
    }),
    CommonActions: {
        navigate: jest.fn(),
        reset: jest.fn(),
        goBack: jest.fn(),
        setParams: jest.fn(),
    },
    StackActions: {
        push: jest.fn(),
        pop: jest.fn(),
        popToTop: jest.fn(),
        replace: jest.fn(),
    },
    createNavigationContainerRef: () => ({
        current: mockNavigation,
        isReady: jest.fn(() => true),
    }),
    DefaultTheme: {
        dark: false,
        colors: {
            primary: '#007AFF',
            background: '#FFFFFF',
            card: '#FFFFFF',
            text: '#000000',
            border: '#CCCCCC',
            notification: '#FF3B30',
        },
    },
    DarkTheme: {
        dark: true,
        colors: {
            primary: '#0A84FF',
            background: '#000000',
            card: '#1C1C1E',
            text: '#FFFFFF',
            border: '#38383A',
            notification: '#FF453A',
        },
    },
};

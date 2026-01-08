// Mock for @maplibre/maplibre-react-native
const React = require('react');

const MapView = (props) => React.createElement('View', { testID: 'maplibre-mapview', ...props });
const Camera = (props) => React.createElement('View', { testID: 'maplibre-camera', ...props });
const MarkerView = (props) => React.createElement('View', { testID: 'maplibre-marker', ...props });
const PointAnnotation = (props) => React.createElement('View', { testID: 'maplibre-point-annotation', ...props });
const Callout = (props) => React.createElement('View', { testID: 'maplibre-callout', ...props });
const UserLocation = (props) => React.createElement('View', { testID: 'maplibre-user-location', ...props });
const ShapeSource = (props) => React.createElement('View', { testID: 'maplibre-shape-source', ...props });
const LineLayer = (props) => React.createElement('View', { testID: 'maplibre-line-layer', ...props });
const FillLayer = (props) => React.createElement('View', { testID: 'maplibre-fill-layer', ...props });
const CircleLayer = (props) => React.createElement('View', { testID: 'maplibre-circle-layer', ...props });
const SymbolLayer = (props) => React.createElement('View', { testID: 'maplibre-symbol-layer', ...props });
const Images = (props) => React.createElement('View', { testID: 'maplibre-images', ...props });

const setAccessToken = jest.fn();
const getAccessToken = jest.fn(() => null);
const requestAndroidLocationPermissions = jest.fn(() => Promise.resolve(true));

// Default export object
const MapLibreGL = {
    setAccessToken,
    getAccessToken,
    requestAndroidLocationPermissions,
    offlineManager: {
        createPack: jest.fn(),
        deletePack: jest.fn(),
        getPacks: jest.fn(() => Promise.resolve([])),
    },
    MapView,
    Camera,
    MarkerView,
    PointAnnotation,
    Callout,
    UserLocation,
    ShapeSource,
    LineLayer,
    FillLayer,
    CircleLayer,
    SymbolLayer,
    Images,
};

module.exports = MapLibreGL;
module.exports.default = MapLibreGL;
module.exports.MapView = MapView;
module.exports.Camera = Camera;
module.exports.MarkerView = MarkerView;
module.exports.PointAnnotation = PointAnnotation;
module.exports.Callout = Callout;
module.exports.UserLocation = UserLocation;
module.exports.ShapeSource = ShapeSource;
module.exports.LineLayer = LineLayer;
module.exports.FillLayer = FillLayer;
module.exports.CircleLayer = CircleLayer;
module.exports.SymbolLayer = SymbolLayer;
module.exports.Images = Images;
module.exports.StyleURL = {
    Street: 'maplibre://styles/streets',
    Dark: 'maplibre://styles/dark',
    Light: 'maplibre://styles/light',
};
module.exports.UserTrackingMode = {
    Follow: 'follow',
    FollowWithHeading: 'followWithHeading',
    FollowWithCourse: 'followWithCourse',
};

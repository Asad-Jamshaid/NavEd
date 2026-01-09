# NavEd - Frontend Documentation

## Table of Contents
1. [Frontend Architecture](#frontend-architecture)
2. [Components](#components)
3. [Screens](#screens)
4. [Contexts (State Management)](#contexts-state-management)
5. [Navigation Structure](#navigation-structure)
6. [Theming System](#theming-system)
7. [Accessibility Implementation](#accessibility-implementation)

---

## Frontend Architecture

### Technology Stack
- **React Native**: 0.81.5
- **Expo SDK**: ~54.0.31
- **TypeScript**: ~5.9.2
- **React Navigation**: v6
- **MapLibre GL**: ^10.4.2

### Architecture Pattern
- **Component-Based**: Reusable, composable components
- **Context API**: Global state management
- **Hooks-Based**: Functional components with hooks
- **Type-Safe**: Full TypeScript coverage

---

## Components

### Component Structure

All reusable components are located in `src/components/common/`:

#### 1. **AccessibleButton.tsx**
**Purpose**: Button component with full accessibility support

**Features**:
- WCAG 2.1 AA compliant (48px minimum touch target)
- Screen reader support
- Haptic feedback
- Loading states
- Icon support

**Props**:
```typescript
interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}
```

**Usage**:
```tsx
<AccessibleButton
  title="Navigate"
  onPress={handleNavigate}
  icon="navigation"
  accessibilityLabel="Navigate to building"
  accessibilityHint="Double tap to start navigation"
/>
```

#### 2. **Card.tsx**
**Purpose**: Container component for content cards

**Features**:
- Consistent styling
- Shadow/elevation support
- Padding customization
- Header/footer slots

**Variants**:
- `Card`: Full-featured card with header, body, footer
- `SimpleCard`: Minimal card for simple content

**Usage**:
```tsx
<Card
  title="Building A"
  subtitle="Main Academic Building"
  onPress={handlePress}
>
  <Text>Card content here</Text>
</Card>
```

#### 3. **SearchBar.tsx**
**Purpose**: Search input with debouncing

**Features**:
- Auto-focus support
- Clear button
- Loading indicator
- Accessibility labels

**Usage**:
```tsx
<SearchBar
  placeholder="Search buildings, rooms..."
  value={searchQuery}
  onChangeText={setSearchQuery}
  onClear={() => setSearchQuery('')}
/>
```

#### 4. **MapLibreMap.tsx**
**Purpose**: Map component using MapLibre GL

**Features**:
- OpenStreetMap tiles (free)
- Custom markers
- Polylines for routes
- 3D building support
- Gesture handling

**Props**:
```typescript
interface MapLibreMapProps {
  initialRegion: Region;
  markers?: Marker[];
  polylines?: Polyline[];
  onMarkerPress?: (marker: Marker) => void;
  onRegionChange?: (region: Region) => void;
  showUserLocation?: boolean;
  showsCompass?: boolean;
}
```

**Usage**:
```tsx
<MapLibreMap
  initialRegion={campusRegion}
  markers={buildingMarkers}
  polylines={[routePolyline]}
  onMarkerPress={handleMarkerPress}
  showUserLocation={true}
/>
```

#### 5. **ErrorBoundary.tsx**
**Purpose**: Catch and handle React errors gracefully

**Features**:
- Error logging
- Fallback UI
- Recovery options

**Usage**:
```tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

#### 6. **LoadingSkeleton.tsx**
**Purpose**: Loading placeholders

**Variants**:
- `CardSkeleton`: For card loading states
- `ListSkeleton`: For list loading states

#### 7. **EmptyState.tsx**
**Purpose**: Empty state displays

**Variants**:
- `EmptyState`: Generic empty state
- `NoDocumentsEmpty`: Specific for document list

---

## Screens

### Screen Structure

All screens are located in `src/screens/`:

#### 1. **CampusMapScreen.tsx**
**Location**: `src/screens/navigation/CampusMapScreen.tsx`

**Purpose**: Main campus navigation interface

**Features**:
- Interactive map with OpenStreetMap
- Building search and filtering
- Route calculation and display
- Turn-by-turn navigation
- Video route playback (optional)
- Accessibility mode
- 3D building visualization

**State Management**:
```typescript
const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
const [searchQuery, setSearchQuery] = useState('');
const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
const [activeRoute, setActiveRoute] = useState<NavigationRoute | null>(null);
const [isNavigating, setIsNavigating] = useState(false);
```

**Key Functions**:
- `navigateToBuilding()`: Calculate and display route
- `handleSearch()`: Search buildings and rooms
- `startNavigation()`: Begin turn-by-turn guidance
- `playVideoRoute()`: Play pre-recorded route video

**User Flow**:
1. User opens map screen
2. Map centers on campus (or user location if available)
3. User searches for building/room
4. User selects destination
5. Route calculated using A* algorithm
6. Route displayed on map with polyline
7. User can start navigation for turn-by-turn guidance

**Accessibility**:
- Voice announcements for navigation steps
- Haptic feedback for turns
- Screen reader optimized
- High contrast mode support

#### 2. **ParkingScreen.tsx**
**Location**: `src/screens/parking/ParkingScreen.tsx`

**Purpose**: Parking availability and management

**Features**:
- Real-time parking lot status
- Crowdsourced availability updates
- Parking predictions (ML-based)
- Vehicle locator (save parked car)
- Peak hour alerts
- Accessible parking filter

**State Management**:
```typescript
const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
const [parkedVehicle, setParkedVehicle] = useState<ParkedVehicle | null>(null);
const [predictions, setPredictions] = useState<Record<string, ParkingPrediction>>({});
```

**Key Functions**:
- `loadData()`: Load parking lots and predictions
- `reportParking()`: Submit crowdsourced update
- `saveParkedVehicle()`: Save vehicle location
- `predictParking()`: Get ML predictions

**User Flow**:
1. User opens parking screen
2. List of parking lots displayed with availability
3. User can:
   - View predictions for future times
   - Report current availability
   - Save parked vehicle location
   - Navigate to parking lot
   - Filter accessible parking only

**Data Sources**:
- Base data: Static parking lot definitions
- Real-time: Crowdsourced user reports
- Predictions: Historical data + ML algorithm

#### 3. **StudyAssistantScreen.tsx**
**Location**: `src/screens/study/StudyAssistantScreen.tsx`

**Purpose**: AI-powered study assistant with RAG

**Features**:
- Document upload (PDF, DOCX, TXT, PPTX)
- Text extraction from documents
- RAG-based Q&A chatbot
- Quiz generation
- Study plan creation
- Assignment help

**State Management**:
```typescript
const [documents, setDocuments] = useState<Document[]>([]);
const [activeDocument, setActiveDocument] = useState<Document | null>(null);
const [documentText, setDocumentText] = useState<string>('');
const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
```

**Key Functions**:
- `handleUploadDocument()`: Upload and extract text
- `chatWithDocument()`: RAG-based Q&A
- `generateQuiz()`: Create quiz from document
- `generateStudyPlan()`: Create study schedule

**User Flow**:
1. User uploads document
2. Text extracted (PDF via Gemini, DOCX via JSZip)
3. Document chunked for RAG
4. User asks questions
5. Relevant chunks retrieved
6. LLM generates answer with context
7. User can generate quiz or study plan

**RAG Implementation**:
- Chunk size: 500 characters
- Overlap: 50 characters
- Retrieval: Keyword-based matching
- Top-K: 3 most relevant chunks

#### 4. **SettingsScreen.tsx**
**Location**: `src/screens/settings/SettingsScreen.tsx`

**Purpose**: App settings and preferences

**Features**:
- Theme settings (dark mode, font size)
- Accessibility settings
- API key configuration
- Data management
- About information

**Settings Categories**:
1. **Appearance**: Theme, font size, high contrast
2. **Accessibility**: Voice guidance, haptics, screen reader
3. **API Keys**: Gemini, Groq, HuggingFace keys
4. **Data**: Clear cache, export data
5. **About**: Version, credits, license

#### 5. **LoginScreen.tsx & SignupScreen.tsx**
**Location**: `src/screens/auth/`

**Purpose**: User authentication (optional)

**Features**:
- Email/password authentication
- Supabase integration
- Error handling
- Accessibility support

**Note**: Authentication is optional. App works without it.

---

## Contexts (State Management)

### Context Architecture

NavEd uses React Context API for global state management:

#### 1. **AppContext.tsx**
**Location**: `src/contexts/AppContext.tsx`

**Purpose**: App-wide state management

**State**:
```typescript
interface AppState {
  user: User | null;
  isLoading: boolean;
  parkedVehicle: ParkedVehicle | null;
  documents: Document[];
  parkingAlerts: ParkingAlert[];
  isAccessibilityMode: boolean;
}
```

**Actions**:
- `SET_USER`: Update user profile
- `SET_PARKED_VEHICLE`: Save/clear parked vehicle
- `ADD_DOCUMENT`: Add uploaded document
- `UPDATE_PREFERENCES`: Update user preferences
- `TOGGLE_ACCESSIBILITY`: Enable/disable accessibility mode

**Persistence**:
- AsyncStorage for local persistence
- Supabase database (if authenticated)
- Automatic sync between local and cloud

**Usage**:
```tsx
const { state, saveParkedVehicle, updatePreferences } = useApp();

// Save parked vehicle
await saveParkedVehicle(vehicle);

// Update preferences
await updatePreferences({ fontSize: 'large' });
```

#### 2. **AuthContext.tsx**
**Location**: `src/contexts/AuthContext.tsx`

**Purpose**: Authentication state

**State**:
```typescript
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthEnabled: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}
```

**Features**:
- Automatic session management
- Auth state change listeners
- Optional authentication (works without Supabase)

**Usage**:
```tsx
const { user, isAuthenticated, signIn, signOut } = useAuth();

if (!isAuthenticated) {
  // Show login screen
}
```

#### 3. **ThemeContext.tsx**
**Location**: `src/contexts/ThemeContext.tsx`

**Purpose**: Theme and accessibility settings

**State**:
```typescript
interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode; // 'light' | 'dark' | 'system'
  fontSizeScale: FontSizeScale; // 'small' | 'medium' | 'large' | 'xlarge'
  isHighContrast: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setFontSizeScale: (scale: FontSizeScale) => void;
  setHighContrast: (enabled: boolean) => void;
  toggleDarkMode: () => void;
}
```

**Theme Object**:
```typescript
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  isDark: boolean;
  spacing: Spacing;
  borderRadius: BorderRadius;
  fontSizes: FontSizes;
}
```

**Usage**:
```tsx
const { theme, setThemeMode, setFontSizeScale } = useTheme();

<View style={{ backgroundColor: theme.colors.background }}>
  <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.lg }}>
    Themed text
  </Text>
</View>
```

---

## Navigation Structure

### Navigation Hierarchy

```
App (Root)
│
├─> AuthNavigator (if auth enabled & not authenticated)
│   ├─> LoginScreen
│   └─> SignupScreen
│
└─> MainNavigator (Stack)
    └─> TabNavigator (Bottom Tabs)
        ├─> Map Tab
        │   └─> CampusMapScreen
        ├─> Parking Tab
        │   └─> ParkingScreen
        ├─> Study Tab
        │   └─> StudyAssistantScreen
        └─> Settings Tab
            └─> SettingsScreen
```

### Navigation Configuration

**App.tsx**:
```typescript
// Tab Navigator
<Tab.Navigator
  screenOptions={({ route }) => ({
    tabBarIcon: ({ focused, color }) => {
      // Icon based on route name
    },
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.textTertiary,
  })}
>
  <Tab.Screen name="Map" component={CampusMapScreen} />
  <Tab.Screen name="Parking" component={ParkingScreen} />
  <Tab.Screen name="Study" component={StudyAssistantScreen} />
  <Tab.Screen name="Settings" component={SettingsScreen} />
</Tab.Navigator>
```

**Navigation Features**:
- Bottom tab navigation
- Custom tab bar styling
- Icon-based navigation
- Accessibility labels
- Deep linking support (future)

---

## Theming System

### Theme Structure

**Location**: `src/theme/index.ts`

**Color Palette**:
```typescript
const lightColors = {
  primary: '#1E3A5F',
  secondary: '#4CAF50',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  textPrimary: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
};

const darkColors = {
  primary: '#2E5A8F',
  secondary: '#6FCF73',
  background: '#121212',
  surface: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#333333',
  // ... similar structure
};
```

**Font Sizes**:
```typescript
const fontSizes = {
  small: { xs: 10, sm: 12, md: 14, lg: 16, xl: 18, xxl: 22, title: 26 },
  medium: { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 26, title: 32 },
  large: { xs: 14, sm: 16, md: 18, lg: 22, xl: 26, xxl: 32, title: 38 },
  xlarge: { xs: 16, sm: 18, md: 22, lg: 26, xl: 32, xxl: 38, title: 44 },
};
```

**Theme Creation**:
```typescript
export function createTheme(
  isDark: boolean,
  isHighContrast: boolean,
  fontSizeScale: FontSizeScale
): Theme {
  return {
    colors: isHighContrast 
      ? getContrastColors(true) 
      : (isDark ? darkColors : lightColors),
    isDark,
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    fontSizes: fontSizes[fontSizeScale],
  };
}
```

**Usage in Components**:
```tsx
const { theme } = useTheme();

<View style={{
  backgroundColor: theme.colors.surface,
  padding: theme.spacing.md,
  borderRadius: theme.borderRadius.lg,
}}>
  <Text style={{
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.lg,
  }}>
    Themed Component
  </Text>
</View>
```

---

## Accessibility Implementation

### Accessibility Features

#### 1. **Screen Reader Support**
- All interactive elements have `accessibilityLabel`
- Semantic roles (`button`, `link`, `header`)
- State announcements (`selected`, `disabled`, `checked`)

**Example**:
```tsx
<TouchableOpacity
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Navigate to Building A"
  accessibilityHint="Double tap to start navigation"
  accessibilityState={{ disabled: isLoading }}
>
  <Text>Navigate</Text>
</TouchableOpacity>
```

#### 2. **Touch Target Sizes**
- Minimum: 44x44 pixels (WCAG requirement)
- Preferred: 48x48 pixels
- All buttons meet this requirement

**Implementation**:
```tsx
const touchTargetStyle = {
  minWidth: 48,
  minHeight: 48,
  justifyContent: 'center',
  alignItems: 'center',
};
```

#### 3. **Color Contrast**
- Text contrast: 4.5:1 minimum (WCAG AA)
- Large text: 3:1 minimum
- High contrast mode available

**High Contrast Colors**:
```typescript
const highContrastColors = {
  background: '#000000',
  text: '#FFFFFF',
  primary: '#FFFF00',
  border: '#FFFFFF',
};
```

#### 4. **Voice Guidance**
- Text-to-speech for navigation
- Adjustable speech rate (0.5x - 1.5x)
- Language support (default: en-US)

**Implementation**:
```tsx
import { speak, announceNavigation } from '../services/accessibilityService';

// Announce navigation step
await announceNavigation('Turn right in 50 meters');

// Speak custom text
await speak('You have arrived at Building A');
```

#### 5. **Haptic Feedback**
- Light, medium, heavy impacts
- Success, warning, error notifications
- Selection feedback

**Implementation**:
```tsx
import { triggerHaptic } from '../services/accessibilityService';

// On button press
await triggerHaptic('medium');

// On success
await triggerHaptic('success');

// On error
await triggerHaptic('error');
```

#### 6. **Font Scaling**
- Four size options: small, medium, large, xlarge
- Scales all text proportionally
- Respects system font size preferences

#### 7. **Reduced Motion**
- Detects system reduced motion preference
- Disables animations if enabled
- Provides static alternatives

---

## Component Patterns

### 1. **Container/Presentational Pattern**
- Containers: Handle logic, state, API calls
- Presentational: Pure UI components

**Example**:
```tsx
// Container (Screen)
function CampusMapScreen() {
  const [buildings, setBuildings] = useState([]);
  const [route, setRoute] = useState(null);
  
  const handleNavigate = async (building) => {
    const route = await getRoute(userLocation, building);
    setRoute(route);
  };
  
  return <MapView buildings={buildings} route={route} onNavigate={handleNavigate} />;
}

// Presentational (Component)
function MapView({ buildings, route, onNavigate }) {
  return (
    <View>
      {buildings.map(building => (
        <BuildingMarker 
          key={building.id} 
          building={building}
          onPress={() => onNavigate(building)}
        />
      ))}
    </View>
  );
}
```

### 2. **Custom Hooks Pattern**
- Extract reusable logic into hooks
- Keep components clean

**Example**:
```tsx
// Custom hook
function useParkingLots() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadParkingLots().then(setLots).finally(() => setLoading(false));
  }, []);
  
  return { lots, loading };
}

// Usage in component
function ParkingScreen() {
  const { lots, loading } = useParkingLots();
  // ...
}
```

### 3. **Error Boundary Pattern**
- Catch errors at component level
- Provide fallback UI

**Example**:
```tsx
<ErrorBoundary fallback={<ErrorScreen />}>
  <CampusMapScreen />
</ErrorBoundary>
```

---

## Performance Optimizations

### 1. **React.memo**
Prevent unnecessary re-renders:
```tsx
export const BuildingCard = React.memo(({ building, onPress }) => {
  return <Card title={building.name} onPress={onPress} />;
});
```

### 2. **useCallback**
Memoize callback functions:
```tsx
const handlePress = useCallback((building) => {
  navigateToBuilding(building);
}, []);
```

### 3. **useMemo**
Memoize expensive computations:
```tsx
const filteredBuildings = useMemo(() => {
  return buildings.filter(b => b.category === selectedCategory);
}, [buildings, selectedCategory]);
```

### 4. **FlatList**
Virtualize long lists:
```tsx
<FlatList
  data={buildings}
  renderItem={({ item }) => <BuildingCard building={item} />}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={5}
/>
```

---

## Testing

### Component Testing
```tsx
import { render, fireEvent } from '@testing-library/react-native';
import { AccessibleButton } from '../AccessibleButton';

test('button calls onPress when pressed', () => {
  const onPress = jest.fn();
  const { getByText } = render(
    <AccessibleButton title="Test" onPress={onPress} />
  );
  
  fireEvent.press(getByText('Test'));
  expect(onPress).toHaveBeenCalled();
});
```

### Screen Testing
```tsx
import { render, waitFor } from '@testing-library/react-native';
import CampusMapScreen from '../CampusMapScreen';

test('loads and displays buildings', async () => {
  const { getByText } = render(<CampusMapScreen />);
  
  await waitFor(() => {
    expect(getByText('Building A')).toBeTruthy();
  });
});
```

---

## Conclusion

The frontend of NavEd demonstrates:

- **Modern React Native Patterns**: Hooks, Context, TypeScript
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimized rendering, memoization
- **User Experience**: Intuitive navigation, clear feedback
- **Maintainability**: Clean code structure, reusable components

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Prepared For**: Final Year Project Phase 4 Presentation


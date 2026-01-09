# NavEd - Code Walkthrough & Implementation Details

## Table of Contents
1. [Code Structure Overview](#code-structure-overview)
2. [Key Implementation Patterns](#key-implementation-patterns)
3. [Algorithm Implementations](#algorithm-implementations)
4. [Data Flow Examples](#data-flow-examples)
5. [Error Handling Patterns](#error-handling-patterns)

---

## Code Structure Overview

### File Organization

```
NavEd/
├── App.tsx                    # Entry point, navigation setup
├── src/
│   ├── components/           # Reusable UI components
│   ├── screens/              # Main app screens
│   ├── services/             # Business logic
│   ├── contexts/             # State management
│   ├── data/                 # Static campus data
│   ├── types/                 # TypeScript definitions
│   ├── utils/                # Utilities and constants
│   └── theme/                # Theming system
```

### Entry Point: App.tsx

**Purpose**: Initializes app, sets up navigation, providers

**Key Responsibilities**:
1. Provider setup (Theme, Auth, App)
2. Navigation structure (Tabs, Stack)
3. Service initialization
4. Error boundary

**Code Structure**:
```typescript
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <AuthProvider>
            <AppProvider>
              <AppContent />
            </AppProvider>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
```

**Initialization Flow**:
```typescript
useEffect(() => {
  initializeApp();
}, []);

const initializeApp = async () => {
  await initializeAccessibility();
  await initializeNotifications();
  await setupParkingAlerts();
  await loadApiKeys();
  await SplashScreen.hideAsync();
};
```

---

## Key Implementation Patterns

### 1. Service Pattern

**Location**: `src/services/`

**Pattern**: Each service is a module with exported functions

**Example**: `navigationService.ts`
```typescript
// Service exports functions, not classes
export async function getRoute(
  from: Coordinate,
  to: Coordinate,
  accessibleOnly: boolean = false
): Promise<NavigationRoute | null> {
  // Implementation
}

export function calculateDistance(
  from: Coordinate,
  to: Coordinate
): number {
  // Implementation
}
```

**Benefits**:
- Simple, functional approach
- Easy to test
- No state management complexity
- Tree-shakeable

### 2. Context Pattern

**Location**: `src/contexts/`

**Pattern**: React Context for global state

**Example**: `AppContext.tsx`
```typescript
// State interface
interface AppState {
  user: User | null;
  parkedVehicle: ParkedVehicle | null;
  documents: Document[];
  // ...
}

// Action types
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PARKED_VEHICLE'; payload: ParkedVehicle | null }
  // ...

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    // ...
  }
}

// Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  // ...
}
```

**Usage**:
```typescript
const { state, saveParkedVehicle } = useApp();
await saveParkedVehicle(vehicle);
```

### 3. Offline-First Pattern

**Pattern**: Try database, fallback to AsyncStorage

**Example**: `parkingService.ts`
```typescript
export async function reportParkingAvailability(
  parkingLotId: string,
  availableSpots: number,
  userId: string = 'anonymous'
): Promise<boolean> {
  try {
    // Try database first
    const dbSuccess = await reportParkingToDb(
      parkingLotId,
      availableSpots,
      userId === 'anonymous' ? undefined : userId
    );
    
    if (dbSuccess) {
      // Also save to AsyncStorage as backup
      await AsyncStorage.setItem(STORAGE_KEYS.PARKING_UPDATES, ...);
      return true;
    }
    
    // Fallback to AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.PARKING_UPDATES, ...);
    return true;
  } catch (error) {
    console.error('Error reporting parking:', error);
    return false;
  }
}
```

**Benefits**:
- Always works, even offline
- Automatic sync when online
- No data loss

### 4. Multi-Provider Fallback Pattern

**Pattern**: Try providers in order, fallback to offline

**Example**: `studyAssistantService.ts`
```typescript
async function callLLM(
  prompt: string,
  systemPrompt: string = '',
  provider: LLMProvider = 'gemini'
): Promise<string> {
  const providers: LLMProvider[] = ['gemini', 'groq', 'huggingface', 'offline'];
  
  for (const p of providers) {
    if (p === 'offline') {
      return generateOfflineResponse(prompt);
    }
    
    try {
      const response = await callProvider(p, prompt, systemPrompt);
      if (response) return response;
    } catch (error) {
      console.log(`Provider ${p} failed, trying next...`);
    }
  }
  
  return generateOfflineResponse(prompt);
}
```

**Benefits**:
- Redundancy
- Always returns a response
- Uses best available provider

---

## Algorithm Implementations

### A* Pathfinding Algorithm

**Location**: `src/services/navigationService.ts`

**Complete Implementation**:
```typescript
function aStarPathfinding(
  startId: string,
  endId: string,
  graph: Map<string, { to: string; distance: number }[]>
): string[] | null {
  const startWp = WAYPOINTS.find(wp => wp.id === startId);
  const endWp = WAYPOINTS.find(wp => wp.id === endId);
  
  if (!startWp || !endWp) return null;
  
  // Heuristic: straight-line distance
  const heuristic = (wpId: string): number => {
    const wp = WAYPOINTS.find(w => w.id === wpId);
    if (!wp) return 0;
    return calculateDistance(
      { latitude: wp.latitude, longitude: wp.longitude },
      { latitude: endWp.latitude, longitude: endWp.longitude }
    );
  };
  
  const openSet = new Set<string>([startId]);
  const closedSet = new Set<string>();
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  
  // Initialize scores
  WAYPOINTS.forEach(wp => {
    gScore.set(wp.id, Infinity);
    fScore.set(wp.id, Infinity);
  });
  
  gScore.set(startId, 0);
  fScore.set(startId, heuristic(startId));
  
  let iterations = 0;
  const maxIterations = 1000;
  
  while (openSet.size > 0) {
    iterations++;
    if (iterations > maxIterations) break;
    
    // Find node with lowest fScore
    let current = '';
    let lowestF = Infinity;
    openSet.forEach(id => {
      const f = fScore.get(id) || Infinity;
      if (f < lowestF) {
        lowestF = f;
        current = id;
      }
    });
    
    if (!current || current === '' || lowestF === Infinity) break;
    
    if (current === endId) {
      // Reconstruct path
      const path: string[] = [current];
      while (cameFrom.has(current)) {
        current = cameFrom.get(current)!;
        path.unshift(current);
      }
      return path;
    }
    
    openSet.delete(current);
    closedSet.add(current);
    
    // Check neighbors
    const neighbors = graph.get(current) || [];
    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor.to)) continue;
      
      const tentativeG = (gScore.get(current) || 0) + neighbor.distance;
      
      if (tentativeG < (gScore.get(neighbor.to) || Infinity)) {
        cameFrom.set(neighbor.to, current);
        gScore.set(neighbor.to, tentativeG);
        fScore.set(neighbor.to, tentativeG + heuristic(neighbor.to));
        openSet.add(neighbor.to);
      }
    }
  }
  
  return null; // No path found
}
```

**Key Features**:
- Closed set prevents revisiting nodes
- Max iterations prevents infinite loops
- Heuristic ensures optimal paths
- Path reconstruction from cameFrom map

### RAG Retrieval Algorithm

**Location**: `src/services/studyAssistantService.ts`

**Complete Implementation**:
```typescript
export function retrieveRelevantChunks(
  query: string,
  chunks: DocumentChunk[],
  topK: number = 3
): DocumentChunk[] {
  // Extract keywords (words > 2 characters)
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  // Score each chunk
  const scored = chunks.map(chunk => {
    const chunkLower = chunk.content.toLowerCase();
    let score = 0;
    
    // Count keyword matches
    for (const word of queryWords) {
      const matches = (chunkLower.match(new RegExp(word, 'g')) || []).length;
      score += matches;
    }
    
    // Boost for exact phrase matches
    if (chunkLower.includes(query.toLowerCase())) {
      score += 10;
    }
    
    return { chunk, score };
  });
  
  // Filter, sort, and return top K
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.chunk);
}
```

**Scoring Logic**:
- Base score: Number of keyword matches
- Exact phrase boost: +10 points
- Case-insensitive matching
- Returns top K chunks by score

### Text Chunking Algorithm

**Location**: `src/services/studyAssistantService.ts`

**Complete Implementation**:
```typescript
export function chunkText(text: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const { chunkSize, chunkOverlap } = STUDY_CONFIG; // 500, 50
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  let chunkId = 0;
  
  for (const para of paragraphs) {
    // If paragraph itself exceeds chunk size, split it
    if (para.length > chunkSize) {
      // Save current chunk if it exists
      if (currentChunk) {
        chunks.push({
          id: `chunk-${chunkId++}`,
          documentId: '',
          content: currentChunk.trim(),
        });
        currentChunk = '';
      }
      
      // Split the long paragraph into smaller chunks
      let remainingPara = para;
      while (remainingPara.length > 0) {
        const chunk = remainingPara.substring(0, chunkSize);
        chunks.push({
          id: `chunk-${chunkId++}`,
          documentId: '',
          content: chunk.trim(),
        });
        remainingPara = remainingPara.substring(chunkSize - chunkOverlap);
      }
    } else if (currentChunk.length + para.length > chunkSize) {
      // Current chunk + paragraph would exceed size, save current chunk
      if (currentChunk) {
        chunks.push({
          id: `chunk-${chunkId++}`,
          documentId: '',
          content: currentChunk.trim(),
        });
      }
      currentChunk = para;
    } else {
      // Add paragraph to current chunk
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }
  
  // Save remaining chunk
  if (currentChunk) {
    chunks.push({
      id: `chunk-${chunkId}`,
      documentId: '',
      content: currentChunk.trim(),
    });
  }
  
  return chunks;
}
```

**Chunking Strategy**:
- Preserves paragraph boundaries
- Handles long paragraphs by splitting
- 50-character overlap for context
- Maintains document structure

### Parking Prediction Algorithm

**Location**: `src/services/parkingService.ts`

**Complete Implementation**:
```typescript
export async function predictParkingAvailability(
  parkingLotId: string,
  targetTime?: Date
): Promise<ParkingPrediction> {
  const lot = PARKING_LOTS.find(l => l.id === parkingLotId);
  if (!lot) throw new Error('Parking lot not found');
  
  const now = targetTime || new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();
  
  try {
    // Get historical data
    let history: HistoricalDataPoint[] = [];
    
    try {
      const dbHistory = await getParkingHistoryFromDb(parkingLotId, dayOfWeek, hour);
      history = dbHistory.map(h => ({
        parkingLotId: h.parkingLotId,
        dayOfWeek: h.dayOfWeek,
        hour: h.hour,
        occupancy: h.occupancy,
        timestamp: h.timestamp,
      }));
    } catch (dbError) {
      // Fallback to AsyncStorage
      const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.PARKING_HISTORY);
      history = historyJson ? JSON.parse(historyJson) : [];
    }
    
    // Filter relevant data points
    const relevantPoints = history.filter(
      p =>
        p.parkingLotId === parkingLotId &&
        p.dayOfWeek === dayOfWeek &&
        Math.abs(p.hour - hour) <= 1
    );
    
    let predictedOccupancy: number;
    let confidence: number;
    
    if (relevantPoints.length >= 5) {
      // We have enough data - use average
      predictedOccupancy = relevantPoints.reduce((sum, p) => sum + p.occupancy, 0) / relevantPoints.length;
      confidence = Math.min(0.9, 0.5 + relevantPoints.length * 0.05);
    } else {
      // Use pre-defined peak hours as fallback
      const peakHour = lot.peakHours.find(
        p => p.dayOfWeek === dayOfWeek && hour >= p.startHour && hour <= p.endHour
      );
      
      if (peakHour) {
        predictedOccupancy = peakHour.averageOccupancy;
        confidence = 0.7;
      } else {
        // Default estimation
        predictedOccupancy = ((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100;
        confidence = 0.4;
      }
    }
    
    // Generate recommendation
    const recommendation = generateRecommendation(predictedOccupancy, lot.name);
    
    return {
      parkingLotId,
      predictedOccupancy: Math.round(predictedOccupancy),
      confidence,
      timestamp: now,
      recommendation,
    };
  } catch (error) {
    console.error('Error predicting parking:', error);
    // Fallback prediction
    return {
      parkingLotId,
      predictedOccupancy: 50,
      confidence: 0.3,
      timestamp: now,
      recommendation: 'Unable to predict accurately. Check real-time updates.',
    };
  }
}
```

**Prediction Logic**:
- Uses historical data for same day/hour
- Confidence increases with more data points
- Falls back to peak hours if insufficient data
- Always returns a prediction (with low confidence if needed)

---

## Data Flow Examples

### Example 1: Navigation Flow

```typescript
// User searches for building
const searchResults = searchBuildings('Building A');
// Returns: [{ id: 'bld-1', name: 'Building A', ... }]

// User selects building
const building = searchResults[0];

// Calculate route
const route = await getRoute(
  userLocation,  // { latitude: 31.446939, longitude: 74.267673 }
  { latitude: building.latitude, longitude: building.longitude },
  false  // accessibleOnly
);

// Route contains:
// {
//   distance: 250,  // meters
//   duration: 178,  // seconds
//   steps: [
//     { instruction: 'Start walking towards Central Plaza', distance: 30, ... },
//     { instruction: 'Turn right at Central Plaza', distance: 50, ... },
//     { instruction: 'You have arrived at Building A', distance: 0, ... }
//   ]
// }

// Display route on map
setActiveRoute(route);

// Start navigation
startNavigation(route);
// Announces: "Start walking towards Central Plaza"
// Haptic feedback: medium impact
```

### Example 2: Parking Update Flow

```typescript
// User reports parking availability
await reportParkingAvailability('park-1', 45, userId);

// Process:
// 1. Validate: 45 >= 0, 45 <= 100 (total spots)
// 2. Save to database:
await reportParkingToDb('park-1', 45, userId);
// INSERT INTO parking_updates (parking_lot_id, available_spots, reported_by, confidence)
// VALUES ('park-1', 45, userId, 0.8)

// 3. Save to AsyncStorage (backup)
const updates = await AsyncStorage.getItem('@naved_parking_updates');
const newUpdate = {
  parkingLotId: 'park-1',
  availableSpots: 45,
  reportedBy: userId,
  timestamp: new Date(),
  confidence: 0.8
};
await AsyncStorage.setItem('@naved_parking_updates', JSON.stringify([newUpdate, ...updates]));

// 4. Save to history for predictions
await saveParkingHistory('park-1', 45);
// Calculates occupancy: (100 - 45) / 100 = 55%
// Saves: { parkingLotId: 'park-1', dayOfWeek: 1, hour: 14, occupancy: 55 }

// 5. Update local state
const lots = await getParkingLots();
// Recalculates weighted average of recent updates
// Updates parking lot availability
```

### Example 3: RAG Q&A Flow

```typescript
// User uploads document
const doc = await pickDocument();
// Returns: { id: 'doc-123', name: 'lecture.pdf', type: 'pdf', ... }

// Extract text
const text = await extractTextFromDocument(doc);
// For PDF: Calls Gemini API with PDF as base64
// Returns: "Introduction to Machine Learning. Machine learning is..."

// Chunk text
const chunks = chunkText(text);
// Returns: [
//   { id: 'chunk-0', content: 'Introduction to Machine Learning...' },
//   { id: 'chunk-1', content: 'Supervised learning is...' },
//   ...
// ]

// User asks question
const question = "What is supervised learning?";

// Retrieve relevant chunks
const relevantChunks = retrieveRelevantChunks(question, chunks, 3);
// Scores chunks based on keyword matches
// Returns top 3: [chunk-1, chunk-5, chunk-2]

// Build context
const context = relevantChunks.map(c => c.content).join('\n\n---\n\n');

// Call LLM
const answer = await chatWithDocument(question, text, chatHistory);
// Prompt: "You are a helpful study assistant. Answer questions based on:
// DOCUMENT CONTEXT:
// [chunk-1 content]
// ---
// [chunk-5 content]
// ---
// [chunk-2 content]
//
// User: What is supervised learning?"
//
// LLM returns: "Supervised learning is a type of machine learning where..."

// Display answer
setChatMessages([...chatMessages, {
  id: 'msg-123',
  role: 'assistant',
  content: answer,
  sources: relevantChunks
}]);
```

---

## Error Handling Patterns

### Pattern 1: Try-Catch with Fallback

```typescript
export async function getParkingLots(): Promise<ParkingLot[]> {
  try {
    // Try database first
    let updates: ParkingUpdate[] = [];
    try {
      const dbUpdates = await getRecentParkingUpdates(undefined, 30);
      updates = dbUpdates.map(/* transform */);
    } catch (dbError) {
      // Fallback to AsyncStorage
      const updatesJson = await AsyncStorage.getItem(STORAGE_KEYS.PARKING_UPDATES);
      updates = updatesJson ? JSON.parse(updatesJson) : [];
    }
    
    // Merge with base data
    return PARKING_LOTS.map(lot => {
      // Calculate weighted average
      // ...
    });
  } catch (error) {
    console.error('Error getting parking lots:', error);
    // Return base data if all fails
    return PARKING_LOTS;
  }
}
```

### Pattern 2: Multi-Provider Fallback

```typescript
async function callLLM(prompt: string, systemPrompt: string): Promise<string> {
  const providers = ['gemini', 'groq', 'huggingface', 'offline'];
  
  for (const provider of providers) {
    if (provider === 'offline') {
      return generateOfflineResponse(prompt);
    }
    
    try {
      const response = await callProvider(provider, prompt, systemPrompt);
      if (response) return response;
    } catch (error) {
      console.log(`Provider ${provider} failed, trying next...`);
      // Continue to next provider
    }
  }
  
  return generateOfflineResponse(prompt);
}
```

### Pattern 3: Timeout Protection

```typescript
const routePromise = getRoute(startLocation, endLocation, accessibleOnly);
const timeoutPromise = new Promise<null>((_, reject) => {
  setTimeout(() => reject(new Error('Route calculation timeout')), 5000);
});

try {
  const route = await Promise.race([routePromise, timeoutPromise]);
  if (route) {
    setActiveRoute(route);
  } else {
    // Fallback to direct route
    setActiveRoute(calculateDirectRoute(startLocation, endLocation));
  }
} catch (error) {
  console.error('Route calculation error:', error);
  // Fallback to direct route
  setActiveRoute(calculateDirectRoute(startLocation, endLocation));
}
```

---

## Conclusion

The codebase demonstrates:

- **Clean Architecture**: Separation of concerns, modular design
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Comprehensive error handling with fallbacks
- **Performance**: Optimized algorithms and data structures
- **Maintainability**: Clear code structure, well-documented

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Prepared For**: Final Year Project Phase 4 Presentation


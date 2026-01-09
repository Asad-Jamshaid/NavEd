# NavEd - Backend & Services Documentation

## Table of Contents
1. [Backend Architecture](#backend-architecture)
2. [Services Layer](#services-layer)
3. [Database Schema](#database-schema)
4. [API Integration](#api-integration)
5. [Data Flow](#data-flow)
6. [Algorithms & Logic](#algorithms--logic)

---

## Backend Architecture

### Architecture Overview

NavEd uses a **service-oriented architecture** with the following layers:

```
┌─────────────────────────────────────┐
│         Screens (UI Layer)          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Services (Business Logic)       │
│  ┌──────────┐  ┌──────────┐         │
│  │Navigation│  │ Parking  │         │
│  └──────────┘  └──────────┘         │
│  ┌──────────┐  ┌──────────┐         │
│  │  Study   │  │Database  │         │
│  └──────────┘  └──────────┘         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Data Layer (Storage & APIs)       │
│  ┌──────────┐  ┌──────────┐         │
│  │AsyncStore│  │ Supabase │         │
│  └──────────┘  └──────────┘         │
│  ┌──────────┐  ┌──────────┐         │
│  │External  │  │  Local   │         │
│  │  APIs    │  │   Data   │         │
│  └──────────┘  └──────────┘         │
└─────────────────────────────────────┘
```

### Design Principles

1. **Offline-First**: All services work without internet
2. **Graceful Degradation**: Fallback to local storage if cloud unavailable
3. **Service Isolation**: Each service is independent and testable
4. **Type Safety**: Full TypeScript coverage

---

## Services Layer

### Service Structure

All services are located in `src/services/`:

#### 1. **navigationService.ts**

**Purpose**: Campus navigation and route calculation

**Key Functions**:

##### `getRoute(from, to, accessibleOnly)`
Calculates navigation route using A* pathfinding algorithm.

**Algorithm**:
1. Find nearest waypoints to start and end locations
2. Build pathfinding graph (filter accessible paths if needed)
3. Run A* algorithm to find optimal path
4. Convert waypoint path to navigation steps
5. Calculate distance and duration

**Parameters**:
```typescript
from: Coordinate          // Starting location
to: Coordinate            // Destination location
accessibleOnly: boolean   // Filter for wheelchair-accessible paths
```

**Returns**:
```typescript
NavigationRoute {
  id: string;
  fromLocation: Coordinate;
  toLocation: Coordinate;
  distance: number;        // meters
  duration: number;        // seconds
  steps: NavigationStep[];
  isAccessible: boolean;
}
```

**A* Algorithm Implementation**:
```typescript
function aStarPathfinding(startId, endId, graph) {
  const openSet = new Set([startId]);
  const closedSet = new Set();
  const gScore = new Map();  // Cost from start
  const fScore = new Map();  // Estimated total cost
  
  gScore.set(startId, 0);
  fScore.set(startId, heuristic(startId, endId));
  
  while (openSet.size > 0) {
    // Find node with lowest fScore
    const current = findLowestFScore(openSet, fScore);
    
    if (current === endId) {
      return reconstructPath(cameFrom, current);
    }
    
    openSet.delete(current);
    closedSet.add(current);
    
    // Check neighbors
    for (const neighbor of graph.get(current)) {
      if (closedSet.has(neighbor.to)) continue;
      
      const tentativeG = gScore.get(current) + neighbor.distance;
      
      if (tentativeG < gScore.get(neighbor.to)) {
        cameFrom.set(neighbor.to, current);
        gScore.set(neighbor.to, tentativeG);
        fScore.set(neighbor.to, tentativeG + heuristic(neighbor.to, endId));
        openSet.add(neighbor.to);
      }
    }
  }
  
  return null; // No path found
}
```

**Heuristic Function**:
Uses Haversine distance (straight-line distance) as heuristic:
```typescript
function heuristic(wpId, endId): number {
  const wp = WAYPOINTS.find(w => w.id === wpId);
  const end = WAYPOINTS.find(w => w.id === endId);
  return calculateDistance(wp, end);
}
```

**Waypoint System**:
- Pre-defined waypoints at intersections and building entrances
- Path connections between waypoints
- Distance and accessibility information for each path

##### `searchLocation(query)`
Searches for locations (buildings, rooms, or external landmarks).

**Process**:
1. Search local campus data first (no API call)
2. If not found, use Nominatim (free OpenStreetMap geocoding)
3. Return coordinate or null

##### `calculateDistance(from, to)`
Calculates distance between two coordinates using Haversine formula.

**Formula**:
```
a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
c = 2 × atan2(√a, √(1−a))
d = R × c
```
Where:
- φ = latitude in radians
- λ = longitude in radians
- R = Earth's radius (6,371,000 meters)

#### 2. **parkingService.ts**

**Purpose**: Parking availability management and predictions

**Key Functions**:

##### `getParkingLots()`
Retrieves current parking lot status with crowdsourced updates.

**Process**:
1. Load base parking lot data
2. Get recent crowdsourced updates (last 30 minutes)
3. Calculate weighted average of updates
4. Merge with base data
5. Return updated parking lots

**Weighted Average Calculation**:
```typescript
const weightedAvg = recentUpdates.reduce(
  (sum, u) => sum + u.availableSpots * u.confidence,
  0
) / totalWeight;
```

##### `reportParkingAvailability(lotId, spots, userId)`
Submits crowdsourced parking update.

**Process**:
1. Validate input (spots >= 0, <= total spots)
2. Save to database (if available)
3. Save to AsyncStorage (backup)
4. Save to history for predictions
5. Return success/failure

**Confidence Scoring**:
- Default: 0.8 (can be adjusted based on user reputation)
- Future: Increase confidence for verified users

##### `predictParkingAvailability(lotId, targetTime)`
Predicts parking availability using historical data and ML.

**Algorithm**:
1. Get historical data for same day of week and hour
2. If sufficient data (>= 5 points):
   - Calculate average occupancy
   - Confidence based on data points count
3. Else:
   - Use pre-defined peak hours
   - Lower confidence (0.4-0.7)
4. Generate recommendation based on predicted occupancy

**Prediction Formula**:
```typescript
if (relevantPoints.length >= 5) {
  predictedOccupancy = average(relevantPoints.occupancy);
  confidence = min(0.9, 0.5 + relevantPoints.length * 0.05);
} else {
  predictedOccupancy = peakHour.averageOccupancy || currentOccupancy;
  confidence = 0.4 - 0.7;
}
```

**Recommendation Generation**:
```typescript
if (occupancy >= 95) {
  return "Lot is expected to be full. Consider alternative parking.";
} else if (occupancy >= 80) {
  return "Lot is filling up. Arrive early to secure a spot.";
} else if (occupancy >= 60) {
  return "Lot has moderate availability. Good time to park.";
} else {
  return "Lot has plenty of available spots.";
}
```

##### `saveVehicleLocation(vehicle, userId)`
Saves parked vehicle location for later retrieval.

**Data Stored**:
- Parking lot ID
- Spot number (optional)
- GPS coordinates
- Photo URI (optional)
- Notes (optional)
- Timestamp

##### `getVehicleLocation(userId)`
Retrieves saved vehicle location.

**Priority**:
1. Database (if authenticated)
2. AsyncStorage (fallback)

#### 3. **studyAssistantService.ts**

**Purpose**: Document processing and AI-powered study assistance

**Key Functions**:

##### `pickDocument()`
Opens document picker and returns selected file.

**Supported Formats**:
- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- PowerPoint (`.ppt`, `.pptx`)
- Text (`.txt`)

**File Size Limit**: 10MB

##### `extractTextFromDocument(doc)`
Extracts text from uploaded document.

**Process by Format**:

**TXT**:
- Direct file read using FileSystem

**DOCX**:
1. Read file as base64
2. Convert to ArrayBuffer
3. Load as ZIP archive (DOCX is a ZIP file)
4. Extract `word/document.xml`
5. Parse XML to extract text from `<w:t>` tags
6. Fallback to Gemini API if parsing fails

**PPTX**:
1. Similar to DOCX (ZIP archive)
2. Extract all `ppt/slides/slide*.xml` files
3. Parse each slide XML for `<a:t>` tags
4. Combine all slide text

**PDF**:
1. Read file as base64
2. Use Gemini API with multimodal capability
3. Send PDF as inline data
4. Extract text from response
5. Fallback to Vercel serverless function if API unavailable

**Code Example (DOCX)**:
```typescript
async function extractTextFromDocx(doc: Document): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(doc.uri, {
    encoding: 'base64' as any,
  });
  
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const zip = await JSZip.loadAsync(bytes);
  const documentXml = await zip.file('word/document.xml')?.async('string');
  
  if (!documentXml) {
    throw new Error('Could not find document.xml in DOCX file');
  }
  
  return parseDocxXml(documentXml);
}
```

##### `chunkText(text)`
Splits document text into chunks for RAG.

**Chunking Strategy**:
- Chunk size: 500 characters
- Overlap: 50 characters
- Split by paragraphs first
- If paragraph > chunk size, split further

**Algorithm**:
```typescript
function chunkText(text: string): DocumentChunk[] {
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  const chunks: DocumentChunk[] = [];
  
  for (const para of paragraphs) {
    if (para.length > chunkSize) {
      // Split long paragraph
      splitLongParagraph(para, chunks);
    } else if (currentChunk.length + para.length > chunkSize) {
      // Save current chunk
      chunks.push({ content: currentChunk });
      currentChunk = para;
    } else {
      // Add to current chunk
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }
  
  if (currentChunk) {
    chunks.push({ content: currentChunk });
  }
  
  return chunks;
}
```

##### `retrieveRelevantChunks(query, chunks, topK)`
Retrieves most relevant chunks for RAG using keyword matching.

**Algorithm**:
1. Extract keywords from query (words > 2 characters)
2. Score each chunk:
   - Count keyword matches
   - Boost for exact phrase matches (+10 points)
3. Sort by score (descending)
4. Return top K chunks

**Scoring Example**:
```typescript
const scored = chunks.map(chunk => {
  let score = 0;
  for (const word of queryWords) {
    const matches = (chunk.content.match(new RegExp(word, 'g')) || []).length;
    score += matches;
  }
  if (chunk.content.includes(query.toLowerCase())) {
    score += 10; // Exact phrase boost
  }
  return { chunk, score };
});
```

##### `chatWithDocument(message, documentText, chatHistory)`
RAG-based Q&A with document context.

**Process**:
1. Chunk document text
2. Retrieve relevant chunks (top 3)
3. Build context from chunks
4. Build conversation history (last 4 messages)
5. Call LLM with context and history
6. Return answer

**Prompt Structure**:
```
System: You are a helpful study assistant. Answer questions based on the following document excerpts.

DOCUMENT CONTEXT:
[Relevant chunks joined with separators]

Previous conversation:
[Last 4 messages]

User: [Current question]
```

##### `generateQuiz(documentText, numQuestions)`
Generates quiz from document using LLM.

**Process**:
1. Send document preview (first 3000 chars) to LLM
2. Request JSON format with questions, options, correct answers, explanations
3. Parse JSON response
4. Return Quiz object

**Prompt**:
```
Create a ${numQuestions}-question quiz based on this document content:

DOCUMENT:
[Document preview]

Create multiple-choice questions testing understanding of the key concepts.

IMPORTANT: Respond with ONLY valid JSON:
{
  "title": "[Topic] Quiz",
  "questions": [
    {
      "question": "What is X?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": 0,
      "explanation": "Explanation here"
    }
  ]
}
```

##### `generateStudyPlan(documentText, daysAvailable, hoursPerDay)`
Generates personalized study plan.

**Process**: Similar to quiz generation, returns StudyPlan object with:
- Learning objectives
- Study sessions (25 minutes each)
- Topics per session

##### `callLLM(prompt, systemPrompt, provider)`
Calls LLM with automatic fallback.

**Provider Priority**:
1. Gemini (if API key available)
2. Groq (if API key available)
3. HuggingFace (if API key available)
4. Offline template responses

**Gemini API Call**:
```typescript
async function callGemini(prompt: string, systemPrompt: string): Promise<string> {
  const response = await fetch(
    `${LLM_CONFIG.gemini.baseUrl}/models/${LLM_CONFIG.gemini.model}:generateContent?key=${API_KEYS.gemini}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt }],
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    }
  );
  
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}
```

#### 4. **accessibilityService.ts**

**Purpose**: Accessibility features (voice, haptics, screen reader)

**Key Functions**:

##### `speak(text, options)`
Text-to-speech using Expo Speech.

**Options**:
- `language`: Language code (default: 'en-US')
- `pitch`: Voice pitch (default: 1.0)
- `rate`: Speech rate (default: 0.9, range: 0.5-1.5)
- `onDone`: Callback when speech completes

##### `triggerHaptic(type)`
Triggers haptic feedback.

**Types**:
- `light`, `medium`, `heavy`: Impact feedback
- `success`, `warning`, `error`: Notification feedback

##### `announceNavigation(instruction)`
Announces navigation instruction with haptic.

##### `announceArrival(destination)`
Announces arrival with heavy haptic.

#### 5. **databaseService.ts**

**Purpose**: Supabase database client and connection management

**Key Functions**:

##### `getSupabaseClient()`
Returns Supabase client instance (or null if not configured).

##### `isSupabaseAvailable()`
Checks if Supabase is configured and available.

##### `safeDbOperation(dbOperation, fallback)`
Executes database operation with fallback to local storage.

**Pattern**:
```typescript
export async function safeDbOperation<T>(
  dbOperation: (client: SupabaseClient) => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  if (!isSupabaseAvailable() || !supabaseClient) {
    return await fallback();
  }
  
  try {
    return await dbOperation(supabaseClient);
  } catch (error) {
    console.error('Database operation failed, using fallback:', error);
    return await fallback();
  }
}
```

#### 6. **authService.ts**

**Purpose**: User authentication via Supabase

**Key Functions**:

##### `signUp(email, password, name)`
Creates new user account.

**Process**:
1. Call Supabase auth.signUp()
2. Create user profile in database
3. Return user object or error

##### `signIn(email, password)`
Signs in existing user.

**Process**:
1. Call Supabase auth.signInWithPassword()
2. Fetch user profile from database
3. Return user object or error

##### `signOut()`
Signs out current user.

##### `getSession()`
Gets current authentication session.

##### `onAuthStateChange(callback)`
Listens to authentication state changes.

---

## Database Schema

### Supabase PostgreSQL Schema

**Location**: `database/migrations/001_initial_schema.sql`

#### Tables

##### 1. **user_profiles**
Extends Supabase auth.users with additional profile data.

```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: User UUID (foreign key to auth.users)
- `email`: User email (optional for privacy)
- `name`: User display name
- `preferences`: JSON object with user preferences
- `created_at`, `updated_at`: Timestamps

##### 2. **parking_lots**
Base parking lot definitions.

```sql
CREATE TABLE public.parking_lots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  total_spots INTEGER NOT NULL CHECK (total_spots > 0),
  type TEXT NOT NULL CHECK (type IN ('car', 'motorcycle', 'bicycle', 'mixed')),
  is_accessible BOOLEAN DEFAULT false,
  disabled_parking_spots INTEGER DEFAULT 0,
  operating_hours JSONB,
  peak_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Parking lot identifier
- `name`: Display name
- `latitude`, `longitude`: GPS coordinates
- `total_spots`: Total parking capacity
- `type`: Vehicle type allowed
- `is_accessible`: Wheelchair accessible flag
- `disabled_parking_spots`: Number of disabled spots
- `operating_hours`: JSON object with hours
- `peak_hours`: JSON array of peak hour definitions

##### 3. **parking_updates**
Crowdsourced parking availability updates.

```sql
CREATE TABLE public.parking_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parking_lot_id TEXT NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
  available_spots INTEGER NOT NULL CHECK (available_spots >= 0),
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  confidence DECIMAL(3,2) DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Update UUID
- `parking_lot_id`: Reference to parking lot
- `available_spots`: Reported available spots
- `reported_by`: User who reported (optional)
- `confidence`: Confidence score (0-1)
- `created_at`: Timestamp

**Indexes**:
```sql
CREATE INDEX idx_parking_updates_lot_time 
ON parking_updates(parking_lot_id, created_at DESC);
```

##### 4. **parking_history**
Historical parking data for predictions.

```sql
CREATE TABLE public.parking_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parking_lot_id TEXT NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  occupancy DECIMAL(5,2) NOT NULL CHECK (occupancy >= 0 AND occupancy <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: History record UUID
- `parking_lot_id`: Reference to parking lot
- `day_of_week`: 0-6 (Sunday-Saturday)
- `hour`: 0-23 (hour of day)
- `occupancy`: Percentage occupancy (0-100)
- `created_at`: Timestamp

**Indexes**:
```sql
CREATE INDEX idx_parking_history_lot_day_hour 
ON parking_history(parking_lot_id, day_of_week, hour);
```

##### 5. **parked_vehicles**
User's parked vehicle locations.

```sql
CREATE TABLE public.parked_vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parking_lot_id TEXT NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
  spot_number TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  photo_uri TEXT,
  notes TEXT,
  parked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Vehicle record UUID
- `user_id`: Owner user ID
- `parking_lot_id`: Parking lot where parked
- `spot_number`: Optional spot number
- `latitude`, `longitude`: GPS coordinates
- `photo_uri`: Optional photo of parking spot
- `notes`: Optional notes
- `parked_at`: When vehicle was parked

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

**User Profiles**:
- Users can only view/update their own profile

**Parking Lots**:
- Public read access
- Admin write access (future)

**Parking Updates**:
- Public read access
- Authenticated users can insert (with their user ID)

**Parking History**:
- Public read access
- Authenticated users can insert

**Parked Vehicles**:
- Users can only access their own vehicles

---

## API Integration

### External APIs Used

#### 1. **Google Gemini API**
**Purpose**: LLM for Q&A, quiz generation, PDF extraction

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`

**Authentication**: API key in query parameter

**Free Tier**:
- 60 requests/minute
- 1,500 requests/day

**Usage**:
```typescript
const response = await fetch(
  `${baseUrl}/models/${model}:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  }
);
```

#### 2. **Groq API**
**Purpose**: Fast LLM inference (alternative to Gemini)

**Endpoint**: `https://api.groq.com/openai/v1/chat/completions`

**Authentication**: Bearer token in Authorization header

**Free Tier**: Very generous limits

**Usage**:
```typescript
const response = await fetch(`${baseUrl}/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  }),
});
```

#### 3. **HuggingFace Inference API**
**Purpose**: Alternative LLM provider

**Endpoint**: `https://api-inference.huggingface.co/models/{model}`

**Authentication**: Bearer token in Authorization header

#### 4. **Nominatim (OpenStreetMap)**
**Purpose**: Geocoding for external locations

**Endpoint**: `https://nominatim.openstreetmap.org/search`

**Free**: No API key required, rate-limited

**Usage**:
```typescript
const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
const response = await fetch(url, {
  headers: {
    'User-Agent': 'NavEd Campus Navigation App',
  },
});
```

#### 5. **Vercel Serverless Function**
**Purpose**: PDF text extraction (server-side)

**Endpoint**: `https://your-app.vercel.app/api/extract-pdf`

**Implementation**: See `api/extract-pdf.ts`

**Free Tier**:
- 100GB bandwidth/month
- 100 hours execution/month

---

## Data Flow

### Parking Update Flow

```
User Reports Parking
  │
  ├─> Validate Input
  │
  ├─> Save to Database (if available)
  │   └─> parking_updates table
  │
  ├─> Save to AsyncStorage (backup)
  │   └─> @naved_parking_updates
  │
  ├─> Save to History
  │   └─> parking_history table (for predictions)
  │
  └─> Update Local State
      └─> Refresh parking lots list
```

### Document Processing Flow

```
User Uploads Document
  │
  ├─> Pick File (DocumentPicker)
  │
  ├─> Extract Text
  │   ├─> PDF → Gemini API or Vercel function
  │   ├─> DOCX → JSZip extraction
  │   ├─> PPTX → JSZip extraction
  │   └─> TXT → Direct read
  │
  ├─> Chunk Text (500 chars per chunk)
  │
  ├─> Save Document
  │   └─> AsyncStorage
  │
  └─> Ready for Q&A
```

### RAG Q&A Flow

```
User Asks Question
  │
  ├─> Extract Keywords from Query
  │
  ├─> Retrieve Relevant Chunks
  │   └─> Keyword matching + scoring
  │
  ├─> Build Context
  │   └─> Join top 3 chunks
  │
  ├─> Build Conversation History
  │   └─> Last 4 messages
  │
  ├─> Call LLM
  │   ├─> Try Gemini
  │   ├─> Try Groq (if Gemini fails)
  │   ├─> Try HuggingFace (if Groq fails)
  │   └─> Fallback to template (if all fail)
  │
  └─> Return Answer
      └─> Display in chat
```

---

## Algorithms & Logic

### A* Pathfinding Algorithm

**Time Complexity**: O(b^d) where b is branching factor, d is depth
**Space Complexity**: O(b^d)

**Optimization**: Closed set prevents revisiting nodes

### Parking Prediction Algorithm

**Time Complexity**: O(n) where n is number of historical points
**Space Complexity**: O(n)

**Accuracy**: Improves with more historical data

### RAG Retrieval Algorithm

**Time Complexity**: O(n × m) where n is chunks, m is query words
**Space Complexity**: O(n)

**Accuracy**: Keyword-based, can be improved with embeddings

---

## Error Handling

### Service Error Patterns

All services follow consistent error handling:

```typescript
try {
  // Service operation
  return result;
} catch (error) {
  console.error('Service error:', error);
  // Fallback or throw
  throw new Error('User-friendly error message');
}
```

### Database Error Handling

```typescript
try {
  const result = await dbOperation();
  return result;
} catch (error) {
  console.error('Database error:', error);
  // Fallback to AsyncStorage
  return await fallbackOperation();
}
```

### API Error Handling

```typescript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return await response.json();
} catch (error) {
  console.error('API error:', error);
  // Try next provider or return fallback
  return await tryNextProvider();
}
```

---

## Performance Optimizations

### Caching Strategy

1. **Local Cache**: AsyncStorage for frequently accessed data
2. **Memory Cache**: React state for current session
3. **API Response Cache**: Cache LLM responses (future)

### Batch Operations

- Group multiple database operations
- Batch API calls when possible

### Lazy Loading

- Load data on demand
- Paginate large lists
- Load predictions only when needed

---

## Conclusion

The backend of NavEd demonstrates:

- **Service-Oriented Architecture**: Clean separation of concerns
- **Offline-First Design**: Works without internet
- **Graceful Degradation**: Fallbacks at every layer
- **Type Safety**: Full TypeScript coverage
- **Scalability**: Can handle growth with proper indexing

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Prepared For**: Final Year Project Phase 4 Presentation


# NavEd Phase 4 - AI Diagram Maker Prompts

This document contains personalized prompts for generating all necessary diagrams for NavEd's Phase 4 documentation using an AI Diagrams Maker tool.

## Project Context

**NavEd** (Smart Campus Navigation & Student Assistance System) is a React Native + Expo mobile application with three main modules:
1. **Campus Navigation** - Interactive maps with turn-by-turn routing
2. **Parking Guidance** - Crowdsourced parking availability with predictions
3. **Study Assistant** - AI-powered RAG chatbot for document analysis

**Technology Stack:**
- Frontend: React Native 0.81.5, Expo SDK 54, TypeScript
- State Management: React Context API (AppContext, ThemeContext)
- Storage: AsyncStorage (local device storage)
- External APIs: OpenStreetMap, OSRM, Gemini/Groq/HuggingFace, Vercel
- Services: navigationService, parkingService, studyAssistantService, accessibilityService, notificationService

---

## 1. ERD (Entity Relationship Diagram)

### Prompt:

Create an Entity Relationship Diagram (ERD) for NavEd mobile application showing the data model and relationships. The system uses AsyncStorage for local storage (not a traditional database, but model it as entities for documentation purposes).

**Entities and Attributes:**

1. **User**
   - id (PK, string)
   - email (string, optional)
   - name (string, optional)
   - preferences (embedded object)

2. **UserPreferences** (embedded in User)
   - accessibilityMode (boolean)
   - highContrast (boolean)
   - fontSize (enum: small, medium, large, xlarge)
   - voiceGuidance (boolean)
   - hapticFeedback (boolean)
   - preferredLanguage (string)
   - darkMode (boolean)

3. **Building**
   - id (PK, string)
   - name (string)
   - shortName (string)
   - latitude (number)
   - longitude (number)
   - floors (number)
   - description (string)
   - category (enum: academic, administrative, library, cafeteria, sports, hostel, medical, parking, other)
   - facilities (array of strings)
   - accessibilityFeatures (array of enums)
   - imageUrl (string, optional)
   - videoRouteUrl (string, optional)

4. **Room**
   - id (PK, string)
   - buildingId (FK, string) → Building
   - floor (number)
   - roomNumber (string)
   - name (string)
   - type (enum: classroom, lab, office, auditorium, washroom, cafeteria, library, other)
   - capacity (number, optional)
   - facilities (array of strings)
   - accessibilityFeatures (array of enums)

5. **ParkingLot**
   - id (PK, string)
   - name (string)
   - latitude (number)
   - longitude (number)
   - totalSpots (number)
   - availableSpots (number)
   - type (enum: car, motorcycle, bicycle, mixed)
   - isAccessible (boolean)
   - disabledParkingSpots (number, optional)
   - operatingHours (embedded object)
   - lastUpdated (date)
   - peakHours (array of objects)

6. **ParkedVehicle**
   - id (PK, string)
   - parkingLotId (FK, string) → ParkingLot
   - spotNumber (string, optional)
   - parkedAt (date)
   - photoUri (string, optional)
   - notes (string, optional)
   - latitude (number)
   - longitude (number)

7. **ParkingUpdate** (for crowdsourced data)
   - id (PK, string)
   - parkingLotId (FK, string) → ParkingLot
   - availableSpots (number)
   - reportedBy (string)
   - timestamp (date)
   - confidence (number)

8. **Document**
   - id (PK, string)
   - name (string)
   - uri (string)
   - type (enum: pdf, doc, docx, txt, ppt, pptx)
   - size (number)
   - uploadedAt (date)
   - processedAt (date, optional)
   - chunks (array of objects, optional)

9. **DocumentChunk**
   - id (PK, string)
   - documentId (FK, string) → Document
   - content (string)
   - embedding (array of numbers, optional)
   - pageNumber (number, optional)

10. **ChatMessage**
    - id (PK, string)
    - role (enum: user, assistant, system)
    - content (string)
    - timestamp (date)
    - documentId (FK, string, optional) → Document
    - sources (array of DocumentChunk references, optional)

11. **StudyPlan**
    - id (PK, string)
    - documentId (FK, string) → Document
    - title (string)
    - objectives (array of strings)
    - schedule (array of StudySession objects)
    - createdAt (date)

12. **StudySession** (embedded in StudyPlan)
    - id (string)
    - topic (string)
    - duration (number)
    - completed (boolean)
    - notes (string, optional)

13. **Quiz**
    - id (PK, string)
    - documentId (FK, string) → Document
    - title (string)
    - questions (array of QuizQuestion objects)
    - createdAt (date)
    - score (number, optional)
    - completedAt (date, optional)

14. **QuizQuestion** (embedded in Quiz)
    - id (string)
    - question (string)
    - options (array of strings)
    - correctAnswer (number)
    - explanation (string)
    - userAnswer (number, optional)

15. **ParkingAlert**
    - id (PK, string)
    - parkingLotId (FK, string) → ParkingLot
    - message (string)
    - threshold (number)
    - enabled (boolean)

**Relationships:**
- User has one UserPreferences (1:1)
- Building has many Rooms (1:N)
- ParkingLot has many ParkedVehicles (1:N)
- ParkingLot has many ParkingUpdates (1:N, for crowdsourced data)
- Document has many DocumentChunks (1:N)
- Document has many ChatMessages (1:N, optional)
- Document has many StudyPlans (1:N)
- Document has many Quizzes (1:N)
- ParkingLot has many ParkingAlerts (1:N)

**Note:** Since this is a mobile app using AsyncStorage, show this as a conceptual ERD. Use standard ERD notation with entities as rectangles, attributes listed, and relationships shown with cardinality (1:1, 1:N, N:M).

---

## 2. Activity Diagram (Processing View)

### Prompt:

Create an Activity Diagram showing the main processing workflows in NavEd mobile application. Include three main processes:

**Process 1: Campus Navigation Flow**
- Start: User opens Campus Map screen
- Activity: Display map with building markers
- Decision: User selects destination?
  - Yes: Activity: Calculate route using OSRM API
  - Activity: Display route on map
  - Activity: Start voice guidance
  - Activity: Update turn-by-turn instructions as user moves
  - End: User arrives at destination
  - No: Activity: User searches for building/room
  - Activity: Display search results
  - Decision: User selects result?
    - Yes: Go to route calculation
    - No: Return to map view

**Process 2: Parking Availability Reporting Flow**
- Start: User opens Parking screen
- Activity: Load parking lots from AsyncStorage
- Activity: Display parking dashboard with availability
- Decision: User reports availability?
  - Yes: Activity: User enters available spots count
  - Activity: Save parking update to AsyncStorage
  - Activity: Update parking lot availability (weighted average)
  - Activity: Save to parking history for predictions
  - Activity: Refresh dashboard display
  - No: Decision: User saves vehicle location?
    - Yes: Activity: Capture GPS coordinates
    - Activity: Save ParkedVehicle to AsyncStorage
    - Activity: Display vehicle location on map
    - No: Continue displaying dashboard

**Process 3: Study Assistant Q&A Flow**
- Start: User opens Study Assistant screen
- Activity: Load documents from AsyncStorage
- Decision: User uploads new document?
  - Yes: Activity: Select file (PDF/DOC/TXT)
  - Activity: Extract text (via Vercel API for PDFs)
  - Activity: Chunk document into segments
  - Activity: Save document and chunks to AsyncStorage
  - No: Decision: User selects existing document?
    - Yes: Activity: Load document chunks
    - Activity: User asks question
    - Activity: Retrieve relevant chunks using RAG
    - Activity: Send query + chunks to LLM API (Gemini/Groq)
    - Activity: Receive AI response
    - Activity: Save chat message to AsyncStorage
    - Activity: Display response to user
    - Decision: User asks another question?
      - Yes: Loop back to question input
      - No: End
    - No: End

Use standard Activity Diagram notation with rounded rectangles for activities, diamonds for decisions, arrows for flow, and swimlanes if needed to show different components (Screen, Service, Storage, External API).

---

## 3. DFD Level 0 (Context Diagram)

### Prompt:

Create a Data Flow Diagram Level 0 (Context Diagram) for NavEd mobile application showing the system boundary and external entities.

**System Name:** NavEd Mobile Application

**External Entities:**
1. **Student** (User) - Primary actor
2. **Faculty** (User) - Secondary actor
3. **Visitor** (User) - Secondary actor
4. **OpenStreetMap** - External API for map tiles
5. **OSRM Routing Service** - External API for route calculation
6. **Gemini AI API** - External LLM service
7. **Groq API** - External LLM service (alternative)
8. **HuggingFace API** - External LLM service (alternative)
9. **Vercel PDF API** - External service for PDF text extraction
10. **Device GPS** - Device hardware for location tracking
11. **Device Storage** - Local AsyncStorage on mobile device

**Data Flows:**

From Student/Faculty/Visitor to NavEd:
- App launch request
- Search query (building/room name)
- Navigation request (from location, to location)
- Parking availability report (lot ID, available spots)
- Vehicle location save request (coordinates, notes)
- Document upload (file)
- Chat question (text, document ID)
- Study plan generation request
- Quiz generation request
- Settings preferences update

From NavEd to Student/Faculty/Visitor:
- Map display (tiles, markers, routes)
- Navigation instructions (text, voice)
- Parking availability status
- Vehicle location saved confirmation
- Document list
- AI chat response
- Study plan
- Quiz questions
- Settings confirmation

From NavEd to OpenStreetMap:
- Map tile request (zoom, x, y coordinates)

From OpenStreetMap to NavEd:
- Map tiles (image data)

From NavEd to OSRM Routing Service:
- Route request (from lat/long, to lat/long)

From OSRM Routing Service to NavEd:
- Route data (steps, distance, duration)

From NavEd to Gemini/Groq/HuggingFace API:
- LLM request (prompt, context chunks, API key)

From LLM APIs to NavEd:
- AI response (text)

From NavEd to Vercel PDF API:
- PDF extraction request (base64 PDF data)

From Vercel PDF API to NavEd:
- Extracted text (string)

From Device GPS to NavEd:
- Current location (latitude, longitude)

From NavEd to Device Storage:
- Save data (user preferences, parking updates, documents, chat history)

From Device Storage to NavEd:
- Load data (user preferences, parking updates, documents, chat history)

Use standard DFD notation: System as a circle or rounded rectangle in center, external entities as rectangles on the perimeter, data flows as arrows labeled with data names.

---

## 4. DFD Level 1

### Prompt:

Create a Data Flow Diagram Level 1 for NavEd mobile application, decomposing the system into major processes.

**Processes:**

1. **1.0 Display Campus Map**
   - Input: Map tile request, user location from GPS
   - Output: Map display with buildings and user location
   - Data stores: D1 (Campus Data - static), D2 (User Preferences)
   - External: OpenStreetMap (map tiles)

2. **2.0 Calculate Navigation Route**
   - Input: From location, to location, accessibility preference
   - Output: Route with steps and instructions
   - Data stores: D1 (Campus Data - waypoints)
   - External: OSRM Routing Service

3. **3.0 Provide Voice Guidance**
   - Input: Navigation steps, user preferences
   - Output: Voice announcements
   - Data stores: D2 (User Preferences - speech rate, voice guidance enabled)

4. **4.0 Manage Parking Data**
   - Input: Parking lot requests, availability reports
   - Output: Parking availability status, predictions
   - Data stores: D3 (Parking Updates), D4 (Parking History), D1 (Parking Lots - static)
   - Process: Calculate weighted average, generate predictions

5. **5.0 Save Vehicle Location**
   - Input: GPS coordinates, parking lot ID, notes
   - Output: Vehicle location saved confirmation
   - Data stores: D5 (Parked Vehicles)

6. **6.0 Process Documents**
   - Input: Document file upload
   - Output: Document stored, text extracted, chunks created
   - Data stores: D6 (Documents), D7 (Document Chunks)
   - External: Vercel PDF API (for PDF extraction)

7. **7.0 Generate AI Response (RAG)**
   - Input: User question, document ID
   - Output: AI response with sources
   - Data stores: D7 (Document Chunks - for retrieval), D8 (Chat History)
   - External: Gemini/Groq/HuggingFace API
   - Process: Retrieve relevant chunks, send to LLM, save response

8. **8.0 Generate Study Plan**
   - Input: Document ID, study plan request
   - Output: Study plan with sessions
   - Data stores: D6 (Documents), D9 (Study Plans)
   - External: LLM API

9. **9.0 Generate Quiz**
   - Input: Document ID, quiz generation request
   - Output: Quiz with questions
   - Data stores: D6 (Documents), D10 (Quizzes)
   - External: LLM API

10. **10.0 Manage User Settings**
    - Input: Preference updates
    - Output: Settings saved confirmation
    - Data stores: D2 (User Preferences)

**Data Stores:**
- D1: Campus Data (Buildings, Rooms, Parking Lots - static)
- D2: User Preferences
- D3: Parking Updates (crowdsourced)
- D4: Parking History (for predictions)
- D5: Parked Vehicles
- D6: Documents
- D7: Document Chunks
- D8: Chat History
- D9: Study Plans
- D10: Quizzes

Use standard DFD Level 1 notation: Processes as circles with numbers, data stores as open rectangles with D# labels, external entities as rectangles, data flows as labeled arrows.

---

## 5. Component Diagram

### Prompt:

Create a Component Diagram for NavEd mobile application showing all major components and their relationships.

**Component Groups:**

**1. Presentation Layer (Screens):**
- CampusMapScreen
- ParkingScreen
- StudyAssistantScreen
- SettingsScreen

**2. Context Layer (State Management):**
- AppContext (provides: user, documents, parkedVehicle, parkingAlerts)
- ThemeContext (provides: theme, isDark, toggleTheme)

**3. Service Layer (Business Logic):**
- navigationService
  - Functions: calculateDistance, getBearing, formatDistance, formatDuration, searchBuildings, searchRooms, getAccessibleBuildings, getRoute
- parkingService
  - Functions: getParkingLots, reportParkingAvailability, predictParkingAvailability, saveVehicleLocation, getVehicleLocation, clearVehicleLocation, findNearestAvailableParking
- studyAssistantService
  - Functions: uploadDocument, getDocuments, deleteDocument, askQuestion, generateStudyPlan, generateQuiz, generateAssignment, setApiKey, loadApiKeys
- accessibilityService
  - Functions: speak, stopSpeaking, hapticFeedback, initializeAccessibility
- notificationService
  - Functions: initializeNotifications, scheduleNotification, cancelNotification, getNotificationPermissions

**4. Component Layer (UI Components):**
- AccessibleButton
- Card
- SearchBar
- ErrorBoundary
- ErrorState
- EmptyState
- LoadingSkeleton
- MapLibreMap
- MapViewFallback
- Building3DLayer

**5. Data Layer:**
- AsyncStorage (local storage interface)
- campusData (static data: BUILDINGS, ROOMS, PARKING_LOTS)

**6. External APIs:**
- OpenStreetMap API
- OSRM Routing API
- Gemini AI API
- Groq API
- HuggingFace API
- Vercel PDF API

**Dependencies/Relationships:**
- Screens depend on Contexts (use hooks: useApp, useTheme)
- Screens depend on Services (import and call service functions)
- Screens use Components (import and render UI components)
- Services depend on AsyncStorage (save/load data)
- Services depend on External APIs (HTTP requests)
- Services depend on campusData (read static data)
- Components are used by Screens
- ErrorBoundary wraps the entire app

Use UML Component Diagram notation: Components as rectangles with <<component>> stereotype, dependencies as dashed arrows, interfaces as lollipop notation if needed. Group related components visually.

---

## 6. Sequence Diagram - Navigation Flow

### Prompt:

Create a Sequence Diagram for the Campus Navigation use case in NavEd mobile application.

**Actors/Objects:**
- User
- CampusMapScreen
- AppContext
- navigationService
- OSRM API (external)
- OpenStreetMap (external)
- Device GPS
- accessibilityService
- AsyncStorage

**Sequence:**

1. User opens app → CampusMapScreen loads
2. CampusMapScreen → AppContext: get user preferences
3. AppContext → AsyncStorage: load user preferences
4. AsyncStorage → AppContext: return preferences
5. AppContext → CampusMapScreen: provide preferences
6. CampusMapScreen → Device GPS: request current location
7. Device GPS → CampusMapScreen: return location (lat, long)
8. CampusMapScreen → OpenStreetMap: request map tiles
9. OpenStreetMap → CampusMapScreen: return map tiles
10. CampusMapScreen → campusData: load buildings
11. campusData → CampusMapScreen: return building list
12. CampusMapScreen: Display map with user location and building markers

13. User searches for "Library" → CampusMapScreen
14. CampusMapScreen → navigationService: searchBuildings("Library")
15. navigationService → campusData: search in BUILDINGS array
16. campusData → navigationService: return matching buildings
17. navigationService → CampusMapScreen: return search results
18. CampusMapScreen: Display search results

19. User selects "UCP Library" → CampusMapScreen
20. CampusMapScreen → navigationService: getRoute(currentLocation, libraryLocation, isAccessible)
21. navigationService → OSRM API: HTTP GET route request
22. OSRM API → navigationService: return route data (steps, distance, duration)
23. navigationService → CampusMapScreen: return NavigationRoute object
24. CampusMapScreen: Display route on map
25. CampusMapScreen → accessibilityService: speak("Turn right in 50 meters")
26. accessibilityService: Announce navigation instruction

27. [Loop] As user moves:
    - Device GPS → CampusMapScreen: update location
    - CampusMapScreen: Update route display
    - CampusMapScreen → accessibilityService: speak next instruction

28. User arrives at destination
29. CampusMapScreen → accessibilityService: speak("You have arrived")
30. CampusMapScreen: Display arrival message

Use standard UML Sequence Diagram notation with lifelines as vertical dashed lines, activation boxes, messages as horizontal arrows with labels, and notes for important details.

---

## 7. Sequence Diagram - Parking Reporting Flow

### Prompt:

Create a Sequence Diagram for the Parking Availability Reporting use case in NavEd mobile application.

**Actors/Objects:**
- User
- ParkingScreen
- AppContext
- parkingService
- AsyncStorage
- notificationService

**Sequence:**

1. User opens Parking tab → ParkingScreen loads
2. ParkingScreen → AppContext: get user and parking alerts
3. AppContext → AsyncStorage: load user data
4. AsyncStorage → AppContext: return user data
5. AppContext → ParkingScreen: provide user data
6. ParkingScreen → parkingService: getParkingLots()
7. parkingService → AsyncStorage: get parking updates
8. AsyncStorage → parkingService: return parking updates array
9. parkingService → campusData: get static parking lot data
10. campusData → parkingService: return PARKING_LOTS array
11. parkingService: Merge static data with crowdsourced updates (calculate weighted average)
12. parkingService → ParkingScreen: return updated ParkingLot[] array
13. ParkingScreen: Display parking dashboard with availability status

14. User arrives at parking lot and sees available spots
15. User taps "Report Availability" → ParkingScreen
16. ParkingScreen: Show input dialog for available spots count
17. User enters "50" available spots → ParkingScreen
18. ParkingScreen → parkingService: reportParkingAvailability("park-1", 50, "user-id")
19. parkingService: Create ParkingUpdate object with timestamp and confidence
20. parkingService → AsyncStorage: save parking update
21. AsyncStorage → parkingService: confirm save
22. parkingService → AsyncStorage: save to parking history (for predictions)
23. AsyncStorage → parkingService: confirm save
24. parkingService → ParkingScreen: return true (success)
25. ParkingScreen: Refresh parking dashboard
26. ParkingScreen → parkingService: getParkingLots() (to show updated data)
27. parkingService → AsyncStorage: get updated parking data
28. AsyncStorage → parkingService: return updated data
29. parkingService → ParkingScreen: return updated ParkingLot[] with new availability
30. ParkingScreen: Display updated availability (now shows 50 available)

31. [Optional] If parking lot is filling up:
    - parkingService → notificationService: check if alert threshold reached
    - notificationService: Schedule notification if needed

Use standard UML Sequence Diagram notation.

---

## 8. Sequence Diagram - Study Assistant Q&A Flow

### Prompt:

Create a Sequence Diagram for the Study Assistant Q&A (RAG-based) use case in NavEd mobile application.

**Actors/Objects:**
- User
- StudyAssistantScreen
- AppContext
- studyAssistantService
- Vercel PDF API (external)
- Gemini AI API (external)
- AsyncStorage

**Sequence:**

1. User opens Study tab → StudyAssistantScreen loads
2. StudyAssistantScreen → AppContext: get documents
3. AppContext → AsyncStorage: load documents
4. AsyncStorage → AppContext: return documents array
5. AppContext → StudyAssistantScreen: provide documents
6. StudyAssistantScreen: Display document library

7. User taps "Upload Document" → StudyAssistantScreen
8. StudyAssistantScreen: Open file picker
9. User selects PDF file → StudyAssistantScreen
10. StudyAssistantScreen → studyAssistantService: uploadDocument(file)
11. studyAssistantService: Read file as base64
12. studyAssistantService → Vercel PDF API: POST request with base64 PDF
13. Vercel PDF API → studyAssistantService: return extracted text
14. studyAssistantService: Chunk text into segments (500 chars each, 50 char overlap)
15. studyAssistantService → AsyncStorage: save document and chunks
16. AsyncStorage → studyAssistantService: confirm save
17. studyAssistantService → StudyAssistantScreen: return Document object
18. StudyAssistantScreen → AppContext: add document
19. AppContext → AsyncStorage: save updated documents list
20. StudyAssistantScreen: Display new document in library

21. User selects document → StudyAssistantScreen
22. StudyAssistantScreen: Load chat interface
23. StudyAssistantScreen → AsyncStorage: load chat history for document
24. AsyncStorage → StudyAssistantScreen: return chat messages
25. StudyAssistantScreen: Display chat history

26. User types question "What is machine learning?" → StudyAssistantScreen
27. User taps send → StudyAssistantScreen
28. StudyAssistantScreen → studyAssistantService: askQuestion(documentId, "What is machine learning?")
29. studyAssistantService → AsyncStorage: load document chunks
30. AsyncStorage → studyAssistantService: return DocumentChunk[] array
31. studyAssistantService: Perform RAG retrieval - find relevant chunks using keyword matching
32. studyAssistantService: Select top 3 most relevant chunks
33. studyAssistantService: Build prompt with question + context chunks
34. studyAssistantService → Gemini AI API: POST request with prompt and API key
35. Gemini AI API → studyAssistantService: return AI response text
36. studyAssistantService: Create ChatMessage objects (user message + assistant response)
37. studyAssistantService → AsyncStorage: save chat messages
38. AsyncStorage → studyAssistantService: confirm save
39. studyAssistantService → StudyAssistantScreen: return ChatMessage[] array
40. StudyAssistantScreen: Display user question and AI response
41. StudyAssistantScreen: Highlight source chunks used

Use standard UML Sequence Diagram notation.

---

## 9. Use Case Diagram

### Prompt:

Create a Use Case Diagram for NavEd mobile application showing actors and their use cases.

**Actors:**
1. **Student** (Primary actor)
2. **Faculty** (Secondary actor)
3. **Visitor** (Secondary actor)

**Use Cases by Module:**

**Campus Navigation Module:**
- View Campus Map
- Search for Building
- Search for Room
- Get Navigation Route
- View Turn-by-Turn Directions
- Enable Voice Guidance
- Filter Accessible Routes
- View Building Details
- View Room Details

**Parking Guidance Module:**
- View Parking Dashboard
- View Parking Availability
- Report Parking Availability (extends View Parking Dashboard)
- Save Vehicle Location
- Find Parked Vehicle
- View Parking Predictions
- Set Parking Alerts
- Navigate to Parking Lot

**Study Assistant Module:**
- Upload Document
- View Document Library
- Delete Document
- Ask Question About Document (extends View Document Library)
- Generate Study Plan (extends View Document Library)
- Generate Quiz (extends View Document Library)
- Generate Assignment (extends View Document Library)
- View Chat History
- Configure API Keys

**Settings & Accessibility Module:**
- Update User Preferences
- Toggle Dark Mode
- Adjust Font Size
- Enable High Contrast Mode
- Configure Voice Guidance
- Toggle Haptic Feedback
- Set Preferred Language
- Clear App Data

**System Use Cases (All Actors):**
- Launch Application
- Handle Errors (system use case, triggered automatically)

**Relationships:**
- Student can perform all use cases
- Faculty can perform all use cases (same as Student)
- Visitor can perform: View Campus Map, Search for Building, Get Navigation Route, View Parking Dashboard, View Parking Availability (limited access)
- "Report Parking Availability" extends "View Parking Dashboard"
- "Ask Question About Document" extends "View Document Library"
- "Generate Study Plan" extends "View Document Library"
- "Generate Quiz" extends "View Document Library"
- "Generate Assignment" extends "View Document Library"

Use standard UML Use Case Diagram notation: Actors as stick figures, use cases as ovals, system boundary as rectangle, relationships as lines (include, extend shown with <<include>> and <<extend>> stereotypes).

---

## 10. Workflow/Swimlane Diagram - Navigation Module

### Prompt:

Create a Swimlane Diagram showing the workflow for the Campus Navigation module in NavEd mobile application.

**Swimlanes:**
1. User
2. CampusMapScreen
3. navigationService
4. External APIs (OSRM, OpenStreetMap)
5. Device (GPS, Storage)
6. accessibilityService

**Workflow Steps:**

**User Lane:**
- Open app
- View map with buildings
- Search for destination
- Select building from results
- Tap "Navigate"
- Follow voice instructions
- Arrive at destination

**CampusMapScreen Lane:**
- Initialize map component
- Request GPS permission
- Load user preferences from AppContext
- Request map tiles from OpenStreetMap
- Display map with markers
- Handle search input
- Call navigationService.searchBuildings()
- Display search results
- Call navigationService.getRoute()
- Display route on map
- Start navigation mode
- Update route as user moves
- Call accessibilityService for voice announcements
- Display arrival message

**navigationService Lane:**
- Receive search query
- Search in campusData.BUILDINGS
- Return matching buildings
- Receive route request (from, to, isAccessible)
- Call OSRM API for route
- Process route response
- Calculate distance and duration
- Format navigation steps
- Return NavigationRoute object

**External APIs Lane:**
- OpenStreetMap: Return map tiles
- OSRM: Receive route request, return route data

**Device Lane:**
- GPS: Provide current location (continuous updates)
- Storage: Save/load user preferences

**accessibilityService Lane:**
- Receive speak request
- Check if voice guidance enabled
- Use device TTS to speak instruction
- Provide haptic feedback on turns

Show decision points (diamonds) for: "Voice guidance enabled?", "User moving?", "Arrived at destination?". Use horizontal swimlanes with activities connected by arrows showing flow.

---

## 11. Workflow/Swimlane Diagram - Parking Module

### Prompt:

Create a Swimlane Diagram showing the workflow for the Parking Guidance module in NavEd mobile application.

**Swimlanes:**
1. User
2. ParkingScreen
3. parkingService
4. AsyncStorage
5. notificationService

**Workflow Steps:**

**User Lane:**
- Open Parking tab
- View parking dashboard
- See availability status (Green/Orange/Red)
- Arrive at parking lot
- Count available spots
- Tap "Report Availability"
- Enter available spots count
- Tap "Save Vehicle Location" (optional)
- View updated availability

**ParkingScreen Lane:**
- Load parking dashboard
- Call parkingService.getParkingLots()
- Display parking lot cards
- Show color-coded status
- Handle "Report Availability" button tap
- Show input dialog
- Receive user input (available spots)
- Call parkingService.reportParkingAvailability()
- Refresh dashboard
- Handle "Save Vehicle Location" button tap
- Capture GPS coordinates
- Call parkingService.saveVehicleLocation()
- Display confirmation

**parkingService Lane:**
- Receive getParkingLots() request
- Load parking updates from AsyncStorage
- Load static parking lot data from campusData
- Calculate weighted average of recent updates
- Generate predictions if historical data available
- Return updated ParkingLot[] array
- Receive reportParkingAvailability() request
- Create ParkingUpdate object
- Save to AsyncStorage (updates and history)
- Check if threshold reached for alerts
- Return success confirmation
- Receive saveVehicleLocation() request
- Create ParkedVehicle object
- Save to AsyncStorage
- Return success confirmation

**AsyncStorage Lane:**
- Store parking updates
- Store parking history
- Store parked vehicle data
- Retrieve parking data on request

**notificationService Lane:**
- Check parking alert thresholds
- Schedule notification if lot filling up
- Send push notification to user

Show decision points: "Recent updates available?", "Threshold reached?", "User wants to save vehicle?". Use horizontal swimlanes.

---

## 12. Workflow/Swimlane Diagram - Study Assistant Module

### Prompt:

Create a Swimlane Diagram showing the workflow for the Study Assistant module in NavEd mobile application.

**Swimlanes:**
1. User
2. StudyAssistantScreen
3. studyAssistantService
4. Vercel PDF API (external)
5. LLM API (Gemini/Groq - external)
6. AsyncStorage

**Workflow Steps:**

**User Lane:**
- Open Study tab
- View document library
- Tap "Upload Document"
- Select file (PDF/DOC/TXT)
- Wait for processing
- Select document
- View chat interface
- Type question
- Send question
- View AI response
- Ask follow-up questions (optional)
- Generate quiz/study plan (optional)

**StudyAssistantScreen Lane:**
- Load document library
- Call studyAssistantService.getDocuments()
- Display document list
- Handle file picker
- Call studyAssistantService.uploadDocument()
- Show loading indicator
- Display new document
- Load chat history
- Display chat messages
- Handle user input
- Call studyAssistantService.askQuestion()
- Display AI response
- Save chat to history

**studyAssistantService Lane:**
- Receive uploadDocument() request
- Check file type
- If PDF: Call Vercel PDF API for extraction
- If TXT/DOC: Read file directly
- Chunk text into segments (500 chars, 50 overlap)
- Create Document and DocumentChunk objects
- Save to AsyncStorage
- Return Document object
- Receive askQuestion() request
- Load document chunks from AsyncStorage
- Perform RAG retrieval (keyword matching)
- Select top relevant chunks
- Build prompt with question + context
- Call LLM API (Gemini/Groq)
- Process AI response
- Create ChatMessage objects
- Save to AsyncStorage
- Return ChatMessage array

**Vercel PDF API Lane:**
- Receive PDF extraction request
- Extract text from PDF
- Return extracted text

**LLM API Lane:**
- Receive prompt with context
- Generate AI response
- Return response text

**AsyncStorage Lane:**
- Store documents
- Store document chunks
- Store chat history
- Retrieve data on request

Show decision points: "PDF file?", "Chunks found?", "API key available?". Use horizontal swimlanes.

---

## Usage Instructions

1. Copy the prompt for the diagram you need to generate
2. Paste it into your AI Diagrams Maker tool (e.g., ChatGPT with diagram plugins, Mermaid Live Editor, Draw.io AI, etc.)
3. The tool should generate a professional diagram based on the detailed specifications
4. Review and adjust the diagram as needed for your Phase 4 document
5. Export the diagram in a format suitable for your document (PNG, SVG, or PDF)

## Notes

- All diagrams are based on NavEd's actual architecture and codebase
- Entity names, service names, and component names match the actual implementation
- Data flows and processes reflect the real system behavior
- External APIs and dependencies are accurately represented
- The diagrams can be customized further based on specific requirements

---

**Generated for:** NavEd Phase 4 Documentation  
**Project:** Smart Campus Navigation & Student Assistance System  
**Group:** S25DS002  
**Date:** December 2025


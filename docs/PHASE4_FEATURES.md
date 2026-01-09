# NavEd - Features & Functionalities Documentation

## Table of Contents
1. [Module 1: Campus Navigation](#module-1-campus-navigation)
2. [Module 2: Parking Guidance](#module-2-parking-guidance)
3. [Module 3: Study Assistant](#module-3-study-assistant)
4. [Accessibility Features](#accessibility-features)
5. [User Experience Features](#user-experience-features)

---

## Module 1: Campus Navigation

### Overview
Interactive campus map with turn-by-turn navigation, building search, and route planning.

### Core Features

#### 1. **Interactive Map**
- **OpenStreetMap Integration**: Free, detailed campus maps
- **Custom Markers**: Building locations, parking lots, points of interest
- **User Location**: Real-time GPS tracking (with permission)
- **Map Controls**: Zoom, pan, compass, my location button
- **3D Buildings**: Optional 3D building visualization
- **Satellite View**: Toggle between map and satellite view

**Technical Implementation**:
- MapLibre GL for map rendering
- OpenStreetMap tiles (free, no API key)
- Custom marker components
- Polyline rendering for routes

#### 2. **Building & Room Search**
- **Search Functionality**: Search by building name, room number, or description
- **Real-time Results**: Instant search results as you type
- **Filter by Category**: Academic, Administrative, Library, Cafeteria, Sports, etc.
- **Accessibility Filter**: Show only wheelchair-accessible buildings
- **Room Details**: View room information (capacity, facilities, floor)

**Search Algorithm**:
1. Search local campus data first (instant, no API call)
2. If not found, search Nominatim (free OpenStreetMap geocoding)
3. Display results with relevance ranking

**Example Searches**:
- "Building A" → Finds Building A
- "A-101" → Finds Room A-101
- "Computer Lab" → Finds all computer labs
- "Library" → Finds library building

#### 3. **Route Calculation**
- **A* Pathfinding Algorithm**: Custom implementation for campus routes
- **Multiple Route Options**: Standard and accessible routes
- **Distance & Duration**: Accurate calculations using Haversine formula
- **Turn-by-Turn Directions**: Step-by-step navigation instructions
- **Route Visualization**: Polyline on map showing path

**Route Features**:
- Pre-defined waypoints at intersections
- Path connections with distance and accessibility info
- Optimal path finding using A* algorithm
- Fallback to direct route if pathfinding fails

**Route Information Displayed**:
- Total distance (meters/kilometers)
- Estimated walking time
- Number of steps
- Accessibility status

#### 4. **Turn-by-Turn Navigation**
- **Voice Guidance**: Text-to-speech announcements
- **Visual Instructions**: Step-by-step directions on screen
- **Haptic Feedback**: Vibration for turns and arrivals
- **Distance Announcements**: "Turn right in 50 meters"
- **Arrival Notification**: "You have arrived at Building A"

**Navigation Steps Include**:
- Instruction text
- Distance to next step
- Maneuver type (straight, left, right, arrive)
- GPS coordinates
- Indoor/outdoor flag

#### 5. **Video Route Playback** (Optional)
- **Pre-recorded Videos**: Walk-through videos for popular routes
- **Visual Guidance**: See the actual path while walking
- **Synchronized Playback**: Video matches navigation steps

**Video Format**:
- MP4 files stored in `assets/videos/`
- Naming convention: `route_{from}_{to}.mp4`
- Example: `route_gate_to_library.mp4`

#### 6. **Indoor Navigation**
- **Building Floor Plans**: Navigate within buildings
- **Room-to-Room Routing**: Find rooms on different floors
- **Elevator/Stairs Instructions**: Guidance for floor changes
- **Accessibility Info**: Elevator availability, ramp locations

**Indoor Route Example**:
1. "Starting from Room A-101 on Floor 1"
2. "Take the elevator up to Floor 4"
3. "Proceed to Room A-401"
4. "You have arrived at Room A-401"

---

## Module 2: Parking Guidance

### Overview
Crowdsourced parking availability with ML-based predictions and vehicle locator.

### Core Features

#### 1. **Real-Time Parking Status**
- **Parking Lot Dashboard**: View all parking lots with current availability
- **Color-Coded Status**: 
  - Green: Available (>50% spots free)
  - Orange: Moderate (20-50% spots free)
  - Red: Full (<20% spots free)
- **Last Updated Time**: Shows when data was last refreshed
- **Crowdsourced Updates**: Real-time updates from other users

**Status Calculation**:
```typescript
const occupancy = (totalSpots - availableSpots) / totalSpots;
if (occupancy < 0.5) return 'available';
if (occupancy < 0.8) return 'moderate';
return 'full';
```

#### 2. **Crowdsourced Reporting**
- **Report Availability**: Users can report current parking availability
- **Confidence Scoring**: Each report has a confidence score (0-1)
- **Weighted Average**: Multiple reports averaged with confidence weights
- **Recent Updates Only**: Only consider updates from last 30 minutes

**Reporting Process**:
1. User selects parking lot
2. User enters available spots
3. System validates input
4. Report saved to database and local storage
5. Parking lot status updated

**Confidence Calculation**:
- Default: 0.8 for all users
- Future: Increase for verified/trusted users
- Decrease for conflicting reports

#### 3. **Parking Predictions**
- **ML-Based Forecasting**: Predicts future parking availability
- **Historical Data Analysis**: Uses past patterns
- **Peak Hour Detection**: Identifies busy times
- **Confidence Scores**: Shows prediction reliability
- **Time-Based Predictions**: Predict for specific times

**Prediction Algorithm**:
1. Get historical data for same day of week and hour
2. If sufficient data (>= 5 points):
   - Calculate average occupancy
   - Confidence based on data points
3. Else:
   - Use pre-defined peak hours
   - Lower confidence

**Prediction Display**:
- Predicted occupancy percentage
- Confidence level (0-100%)
- Recommendation text
- Time of prediction

**Example Predictions**:
- "A Parking is expected to be 90% full at 9 AM (High confidence)"
- "B Parking has moderate availability at 2 PM (Medium confidence)"
- "C Parking has plenty of spots at 11 AM (Low confidence - limited data)"

#### 4. **Vehicle Locator**
- **Save Parked Vehicle**: Record where you parked
- **GPS Coordinates**: Precise location tracking
- **Spot Number**: Optional spot number entry
- **Photo**: Optional photo of parking spot
- **Notes**: Optional notes (e.g., "Near entrance")
- **Navigate to Vehicle**: Get directions back to your car

**Vehicle Data Stored**:
- Parking lot ID
- GPS coordinates (latitude, longitude)
- Spot number (optional)
- Photo URI (optional)
- Notes (optional)
- Timestamp

**Usage Flow**:
1. User parks vehicle
2. User opens app, selects "I Parked Here"
3. App saves location (with optional photo/notes)
4. Later, user selects "Find My Vehicle"
5. App shows route to saved location

#### 5. **Peak Hour Alerts**
- **Push Notifications**: Alerts when lots are filling up
- **Configurable Thresholds**: Alert at 80% full, critical at 95%
- **Scheduled Alerts**: Alerts before peak hours
- **Customizable**: Users can enable/disable per lot

**Alert Types**:
- **Filling Up Alert**: "A Parking is 85% full. Only 15 spots remaining."
- **Critical Alert**: "A Parking is almost full! Only 5 spots left."
- **Peak Hour Alert**: "A Parking peak hours approaching. Expected 90% occupancy soon."

#### 6. **Accessible Parking Filter**
- **Wheelchair-Accessible Lots**: Filter to show only accessible parking
- **Disabled Spots Count**: Shows number of dedicated disabled spots
- **Accessibility Info**: Ramp locations, proximity to buildings

**Accessibility Features**:
- Filter toggle: "Show accessible parking only"
- Visual indicator on accessible lots
- Disabled spots count displayed
- Route to accessible parking prioritized

#### 7. **Parking Lot Details**
- **Total Capacity**: Total number of spots
- **Current Availability**: Available spots count
- **Occupancy Percentage**: Visual progress bar
- **Operating Hours**: When parking is available
- **Vehicle Types**: Car, motorcycle, bicycle, mixed
- **Location**: GPS coordinates, map view

---

## Module 3: Study Assistant

### Overview
AI-powered study assistant with RAG (Retrieval-Augmented Generation) for document Q&A, quiz generation, and study planning.

### Core Features

#### 1. **Document Upload & Processing**
- **Supported Formats**: PDF, DOCX, PPTX, TXT
- **File Size Limit**: 10MB maximum
- **Text Extraction**: Automatic text extraction from documents
- **Multi-Format Support**: Different extraction methods per format

**Text Extraction Methods**:
- **PDF**: Gemini API (multimodal) or Vercel serverless function
- **DOCX**: JSZip (extract XML, parse text)
- **PPTX**: JSZip (extract slide XML, parse text)
- **TXT**: Direct file read

**Processing Flow**:
1. User selects document
2. File validated (size, format)
3. Text extracted based on format
4. Document chunked for RAG (500 chars per chunk)
5. Document saved and ready for Q&A

#### 2. **RAG-Based Q&A Chatbot**
- **Context-Aware Answers**: Answers based on uploaded document
- **Relevant Chunk Retrieval**: Finds most relevant document sections
- **Conversation History**: Maintains context across messages
- **Source Citations**: Shows which parts of document were used

**RAG Process**:
1. User asks question
2. System extracts keywords from question
3. Retrieves top 3 most relevant chunks (keyword matching)
4. Builds context from chunks
5. Calls LLM with context and conversation history
6. Returns answer with source information

**Example Q&A**:
```
User: "What is the main topic of this document?"
Assistant: "Based on the document, the main topic is [answer]. 
This information is found in sections [chunk references]."

User: "Can you explain chapter 3?"
Assistant: "Chapter 3 discusses [answer]. Here are the key points..."
```

**LLM Providers** (with automatic fallback):
1. Google Gemini (primary)
2. Groq (fast alternative)
3. HuggingFace (fallback)
4. Offline templates (if all APIs unavailable)

#### 3. **Quiz Generation**
- **Automatic Quiz Creation**: Generates quiz from document
- **Multiple Choice Questions**: Standard MCQ format
- **Configurable Questions**: 5-25 questions
- **Answer Explanations**: Explains correct answers
- **Score Tracking**: Track quiz performance

**Quiz Generation Process**:
1. User selects "Generate Quiz"
2. System sends document preview to LLM
3. LLM generates questions in JSON format
4. System parses and displays quiz
5. User takes quiz
6. System scores and shows results

**Quiz Format**:
```json
{
  "title": "Document Quiz",
  "questions": [
    {
      "question": "What is X?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": 0,
      "explanation": "Explanation of correct answer"
    }
  ]
}
```

**Quiz Features**:
- Question-by-question navigation
- Answer selection
- Immediate feedback (optional)
- Final score display
- Review incorrect answers

#### 4. **Study Plan Generation**
- **Personalized Plans**: AI-generated study schedules
- **Learning Objectives**: Extracted from document
- **Session Breakdown**: 25-minute Pomodoro sessions
- **Topic Organization**: Topics grouped logically
- **Progress Tracking**: Mark sessions as complete

**Study Plan Structure**:
- Title: Based on document topic
- Objectives: 3-4 learning goals
- Sessions: 4-6 study sessions
  - Topic: What to study
  - Duration: 25 minutes (Pomodoro)
  - Completed: Checkbox

**Example Study Plan**:
```
Title: "Introduction to Machine Learning Study Plan"

Objectives:
- Understand basic ML concepts
- Learn supervised vs unsupervised learning
- Practice with examples

Sessions:
1. Introduction & Overview (25 min)
2. Key Concepts Deep Dive (25 min)
3. Practice & Examples (25 min)
4. Review & Summary (25 min)
```

#### 5. **Assignment Help**
- **Task Breakdown**: Breaks assignments into manageable tasks
- **Difficulty Levels**: Easy, medium, hard
- **Step-by-Step Guidance**: Detailed instructions
- **Progress Tracking**: Check off completed tasks

**Assignment Generation**:
1. User uploads assignment document
2. System analyzes document
3. Generates task list
4. User can check off tasks as complete

**Assignment Format**:
- Title: Assignment name
- Description: Overview
- Tasks: List of actionable items
- Due Date: Optional deadline
- Notes: User can add notes per task

#### 6. **Document Management**
- **Multiple Documents**: Upload and manage multiple documents
- **Document List**: View all uploaded documents
- **Document Selection**: Switch between documents
- **Delete Documents**: Remove documents
- **Chat History**: Separate chat history per document

**Document Storage**:
- Local: AsyncStorage (offline-first)
- Cloud: Supabase (optional, if authenticated)
- Metadata: Name, type, size, upload date

---

## Accessibility Features

### Overview
Full WCAG 2.1 Level AA compliance for inclusive design.

### Core Accessibility Features

#### 1. **Screen Reader Support**
- **Accessibility Labels**: All interactive elements labeled
- **Semantic Roles**: Proper ARIA roles (button, link, header)
- **State Announcements**: Selected, disabled, checked states
- **Screen Reader Optimized**: Tested with TalkBack (Android) and VoiceOver (iOS)

**Implementation**:
```tsx
<TouchableOpacity
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Navigate to Building A"
  accessibilityHint="Double tap to start navigation"
  accessibilityState={{ disabled: isLoading }}
>
```

#### 2. **Voice Guidance**
- **Text-to-Speech**: All navigation instructions spoken
- **Adjustable Rate**: 0.5x to 1.5x speech rate
- **Language Support**: Multiple languages (default: en-US)
- **Navigation Announcements**: Turn-by-turn voice guidance

**Features**:
- "Turn right in 50 meters"
- "You have arrived at Building A"
- "A Parking is 85% full"
- Document reading (optional)

#### 3. **Haptic Feedback**
- **Impact Feedback**: Light, medium, heavy vibrations
- **Notification Feedback**: Success, warning, error patterns
- **Selection Feedback**: Subtle vibration on button press
- **Navigation Feedback**: Vibration for turns and arrivals

**Haptic Types**:
- Light: Subtle interactions
- Medium: Standard button presses
- Heavy: Important actions (arrival)
- Success: Positive feedback
- Warning: Caution alerts
- Error: Error notifications

#### 4. **High Contrast Mode**
- **Enhanced Contrast**: 7:1 contrast ratio (exceeds WCAG AAA)
- **Color Scheme**: Black background, white text, yellow accents
- **Toggle Option**: Enable/disable in settings
- **System-Wide**: Applies to all screens

**High Contrast Colors**:
- Background: #000000 (black)
- Text: #FFFFFF (white)
- Primary: #FFFF00 (yellow)
- Border: #FFFFFF (white)
- Success: #00FF00 (green)
- Error: #FF0000 (red)

#### 5. **Font Scaling**
- **Four Size Options**: Small, medium, large, xlarge
- **Proportional Scaling**: All text scales together
- **System Integration**: Respects system font size preferences
- **Accessibility**: Meets WCAG requirement for text resizing

**Font Size Multipliers**:
- Small: 0.85x
- Medium: 1.0x (default)
- Large: 1.25x
- XLarge: 1.5x

#### 6. **Touch Target Sizes**
- **Minimum Size**: 44x44 pixels (WCAG requirement)
- **Preferred Size**: 48x48 pixels
- **All Buttons**: Meet minimum size requirement
- **Spacing**: Adequate spacing between targets

#### 7. **Color Contrast**
- **Text Contrast**: 4.5:1 minimum (WCAG AA)
- **Large Text**: 3:1 minimum
- **Interactive Elements**: 3:1 minimum
- **High Contrast Mode**: 7:1 (WCAG AAA)

#### 8. **Reduced Motion**
- **System Detection**: Detects system reduced motion preference
- **Animation Disabling**: Disables animations if enabled
- **Static Alternatives**: Provides static UI when motion reduced

---

## User Experience Features

### 1. **Dark Mode**
- **System Integration**: Follows system theme
- **Manual Toggle**: Override system preference
- **Theme Persistence**: Saves preference
- **Smooth Transitions**: Animated theme changes

### 2. **Offline Support**
- **Offline-First**: Works without internet
- **Local Storage**: All data stored locally
- **Cloud Sync**: Optional sync when online
- **Graceful Degradation**: Fallbacks for all features

### 3. **Real-Time Updates**
- **Parking Updates**: Real-time crowdsourced data
- **Database Sync**: Automatic sync with Supabase
- **Push Notifications**: Alerts for parking and navigation

### 4. **Error Handling**
- **User-Friendly Messages**: Clear error messages
- **Retry Options**: Retry failed operations
- **Fallback Mechanisms**: Always provides alternative
- **Error Logging**: Logs errors for debugging

### 5. **Performance Optimizations**
- **Fast Loading**: Optimized initial load
- **Smooth Animations**: 60 FPS animations
- **Efficient Rendering**: React.memo, useCallback, useMemo
- **Lazy Loading**: Load data on demand

### 6. **Data Privacy**
- **Local-First**: Data stored on device
- **Optional Cloud**: Cloud sync is optional
- **No Tracking**: No analytics or tracking
- **User Control**: Users control their data

---

## Feature Comparison

### NavEd vs. Commercial Solutions

| Feature | NavEd | Google Maps | Commercial Parking Apps |
|---------|-------|------------|------------------------|
| **Cost** | FREE | Free (limited) / Paid | $5-20/month |
| **Campus-Specific** | ✅ Yes | ❌ No | ❌ No |
| **Indoor Navigation** | ✅ Yes | ❌ No | ❌ No |
| **Parking Predictions** | ✅ ML-based | ❌ No | ⚠️ Basic |
| **Study Assistant** | ✅ AI-powered | ❌ No | ❌ No |
| **Offline Support** | ✅ Full | ⚠️ Limited | ⚠️ Limited |
| **Accessibility** | ✅ WCAG AA | ⚠️ Basic | ⚠️ Basic |
| **Crowdsourced Data** | ✅ Yes | ❌ No | ⚠️ Limited |

---

## Future Enhancements

### Planned Features

1. **AR Navigation**: Augmented reality route overlay
2. **Indoor Positioning**: Bluetooth beacons for precise indoor location
3. **Social Features**: Share routes, parking tips with friends
4. **Analytics Dashboard**: Usage statistics for administrators
5. **Multi-Campus Support**: Support multiple universities
6. **Voice Commands**: Voice-controlled navigation
7. **Offline Maps**: Downloadable map tiles
8. **Vector Embeddings**: Upgrade RAG with semantic search

---

## Conclusion

NavEd provides a comprehensive set of features that:

- **Covers All Student Needs**: Navigation, parking, study assistance
- **Works Offline**: No internet required for core features
- **Accessible to All**: WCAG 2.1 AA compliant
- **Cost-Effective**: $0/month operational costs
- **Scalable**: Can handle thousands of users

The combination of these features makes NavEd a complete solution for university students.

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Prepared For**: Final Year Project Phase 4 Presentation


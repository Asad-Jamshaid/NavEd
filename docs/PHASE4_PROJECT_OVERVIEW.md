# NavEd - Phase 4 Project Overview & Architecture

## Table of Contents
1. [Project Introduction](#project-introduction)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Key Design Decisions](#key-design-decisions)
6. [Budget-Friendly Approach](#budget-friendly-approach)

---

## Project Introduction

**NavEd** (Smart Campus Navigation and Student Assistance System) is a comprehensive mobile application designed for university students with three main modules:

1. **🗺️ Campus Navigation** - Interactive maps with video-guided routes
2. **🅿️ Parking Guidance** - Crowdsourced availability with smart predictions
3. **📚 Study Assistant** - AI-powered RAG chatbot for document analysis

### Project Goals
- Provide budget-friendly solution (no expensive APIs or IoT devices)
- Ensure accessibility for all users (WCAG 2.1 AA compliant)
- Work offline-first with optional cloud sync
- Use free tiers of all services

### Target Users
- University students navigating campus
- Students with disabilities (accessibility features)
- Students needing parking assistance
- Students requiring study help with documents

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NavEd Mobile Application                  │
│                  (React Native + Expo)                       │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│   Frontend     │  │   Services     │  │   Storage      │
│   Components   │  │   Layer        │  │   Layer        │
│   & Screens    │  │                 │  │                │
└────────────────┘  └────────────────┘  └────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│   External     │  │   Database     │  │   Local        │
│   APIs         │  │   (Supabase)   │  │   Storage      │
│   (Free)       │  │   (Optional)   │  │   (AsyncStorage)│
└────────────────┘  └────────────────┘  └────────────────┘
```

### Architecture Layers

#### 1. **Presentation Layer (Frontend)**
- **React Native Components**: Reusable UI components
- **Screens**: Main app screens (Map, Parking, Study, Settings)
- **Contexts**: Global state management (AppContext, AuthContext, ThemeContext)
- **Navigation**: React Navigation with bottom tabs

#### 2. **Business Logic Layer (Services)**
- **Navigation Service**: A* pathfinding algorithm for campus routes
- **Parking Service**: Crowdsourced updates and ML predictions
- **Study Assistant Service**: RAG-based document Q&A with LLM
- **Accessibility Service**: Voice guidance, haptics, screen reader support
- **Database Service**: Supabase integration (optional)

#### 3. **Data Layer**
- **Local Storage**: AsyncStorage for offline-first approach
- **Cloud Database**: Supabase PostgreSQL (optional, free tier)
- **Static Data**: Campus buildings, rooms, parking lots

#### 4. **External Services**
- **Maps**: OpenStreetMap (free)
- **Routing**: OSRM (free) or custom A* algorithm
- **AI/LLM**: Google Gemini, Groq, HuggingFace (free tiers)
- **PDF Extraction**: Vercel serverless function (free)

---

## Technology Stack

### Core Framework
- **React Native**: 0.81.5 - Cross-platform mobile development
- **Expo SDK**: ~54.0.31 - Development platform and tooling
- **TypeScript**: ~5.9.2 - Type safety and better developer experience

### Navigation & UI
- **React Navigation**: v6 - Navigation library
  - `@react-navigation/native`: ^6.1.18
  - `@react-navigation/bottom-tabs`: ^6.6.1
  - `@react-navigation/native-stack`: ^6.11.0
- **MapLibre GL**: ^10.4.2 - Open-source map rendering
- **Expo Vector Icons**: ^15.0.3 - Icon library

### State Management
- **React Context API**: Built-in state management
- **AsyncStorage**: 2.2.0 - Local data persistence
- **React Hooks**: useState, useEffect, useReducer, useContext

### Backend Services
- **Supabase**: ^2.39.0 - Backend-as-a-Service (optional)
  - Authentication
  - PostgreSQL database
  - Real-time subscriptions
- **Axios**: ^1.6.2 - HTTP client for API calls

### AI & Document Processing
- **JSZip**: ^3.10.1 - Extract text from DOCX/PPTX files
- **Google Gemini API**: Free tier for LLM and PDF extraction
- **Groq API**: Free tier for fast LLM inference
- **HuggingFace API**: Free tier for ML models

### Accessibility
- **Expo Speech**: ~14.0.8 - Text-to-speech
- **Expo Haptics**: ~15.0.8 - Haptic feedback
- **React Native Accessibility**: Built-in screen reader support

### Development Tools
- **Jest**: ^29.7.0 - Testing framework
- **TypeScript**: Type checking
- **ESLint**: Code linting (via TypeScript)

---

## Project Structure

```
NavEd/
├── App.tsx                      # Main app entry point
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
│
├── src/
│   ├── components/              # Reusable UI components
│   │   └── common/
│   │       ├── AccessibleButton.tsx
│   │       ├── Card.tsx
│   │       ├── SearchBar.tsx
│   │       ├── MapLibreMap.tsx
│   │       └── ...
│   │
│   ├── screens/                  # App screens
│   │   ├── navigation/
│   │   │   └── CampusMapScreen.tsx
│   │   ├── parking/
│   │   │   └── ParkingScreen.tsx
│   │   ├── study/
│   │   │   └── StudyAssistantScreen.tsx
│   │   ├── settings/
│   │   │   └── SettingsScreen.tsx
│   │   └── auth/
│   │       ├── LoginScreen.tsx
│   │       └── SignupScreen.tsx
│   │
│   ├── services/                 # Business logic
│   │   ├── navigationService.ts      # A* pathfinding
│   │   ├── parkingService.ts         # Parking predictions
│   │   ├── studyAssistantService.ts  # RAG + LLM
│   │   ├── accessibilityService.ts   # Voice, haptics
│   │   ├── databaseService.ts        # Supabase client
│   │   ├── authService.ts            # Authentication
│   │   └── ...
│   │
│   ├── contexts/                 # Global state
│   │   ├── AppContext.tsx        # App-wide state
│   │   ├── AuthContext.tsx       # Authentication state
│   │   └── ThemeContext.tsx      # Theme (dark mode, fonts)
│   │
│   ├── data/                     # Static campus data
│   │   ├── campusData.ts         # Buildings, rooms, parking
│   │   └── buildingFootprints.ts # Building shapes
│   │
│   ├── types/                    # TypeScript definitions
│   │   └── index.ts              # All type definitions
│   │
│   ├── utils/                    # Utilities
│   │   └── constants.ts         # App constants, configs
│   │
│   └── theme/                    # Theming
│       └── index.ts              # Theme colors, fonts
│
├── database/                     # Database migrations
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed_*.sql                # Seed data
│
├── api/                          # Serverless functions
│   └── extract-pdf.ts            # PDF extraction (Vercel)
│
├── __tests__/                    # Test files
│   ├── components/
│   ├── services/
│   └── integration/
│
└── docs/                         # Documentation
    ├── PHASE4_PROJECT_OVERVIEW.md
    ├── PHASE4_FRONTEND.md
    ├── PHASE4_BACKEND.md
    └── ...
```

---

## Key Design Decisions

### 1. **Offline-First Architecture**
- **Decision**: Store all data locally using AsyncStorage
- **Rationale**: Works without internet, faster performance, no server costs
- **Implementation**: AsyncStorage for all user data, Supabase as optional sync

### 2. **Crowdsourced Parking Data**
- **Decision**: Users report parking availability instead of IoT sensors
- **Rationale**: No hardware costs, community engagement, scalable
- **Implementation**: Weighted average of recent reports with confidence scores

### 3. **A* Pathfinding Algorithm**
- **Decision**: Custom A* implementation for campus navigation
- **Rationale**: Works offline, no API costs, customizable for campus paths
- **Implementation**: Pre-defined waypoints and path connections graph

### 4. **RAG without Vector Embeddings**
- **Decision**: Keyword-based retrieval instead of embeddings API
- **Rationale**: No vector database needed, works with any free LLM
- **Implementation**: Simple keyword matching with relevance scoring

### 5. **Multi-Provider LLM Fallback**
- **Decision**: Support Gemini, Groq, and HuggingFace with automatic fallback
- **Rationale**: Redundancy, use best available free tier
- **Implementation**: Try providers in order, fallback to offline templates

### 6. **Optional Authentication**
- **Decision**: App works without authentication, Supabase optional
- **Rationale**: Lower barrier to entry, works offline, can add auth later
- **Implementation**: Check if Supabase configured, show auth screens only if enabled

### 7. **Accessibility-First Design**
- **Decision**: WCAG 2.1 AA compliance from the start
- **Rationale**: Inclusive design, required for many institutions
- **Implementation**: 48px touch targets, 4.5:1 contrast, screen reader support

---

## Budget-Friendly Approach

### Cost Breakdown

| Component | Cost | Alternative |
|-----------|------|-------------|
| Maps | **FREE** (OpenStreetMap) | Google Maps ($200+/month) |
| Routing | **FREE** (OSRM + A*) | Google Directions API ($5/1000) |
| AI/LLM | **FREE** (Gemini/Groq tiers) | OpenAI ($20+/month) |
| Storage | **FREE** (Local + Supabase free) | AWS S3 ($5+/month) |
| Database | **FREE** (Supabase free tier) | AWS RDS ($15+/month) |
| Notifications | **FREE** (Expo Push) | Firebase ($0-25/month) |
| PDF Processing | **FREE** (Vercel free tier) | AWS Lambda ($5+/month) |
| **Total** | **$0/month** | **$250+/month** |

### Free API Limits

1. **Google Gemini**
   - 60 requests/minute
   - 1,500 requests/day
   - Sufficient for student use

2. **Groq**
   - Very generous free tier
   - Fast inference
   - Good for real-time chat

3. **HuggingFace**
   - Variable free tier
   - Good for fallback
   - Multiple model options

4. **Supabase Free Tier**
   - 500MB database
   - 1GB file storage
   - 2GB bandwidth
   - 50,000 monthly active users

5. **Vercel Free Tier**
   - 100GB bandwidth/month
   - 100 hours execution/month
   - Unlimited projects

### Cost Optimization Strategies

1. **Local-First**: Minimize API calls by caching locally
2. **Batch Operations**: Group multiple requests when possible
3. **Smart Caching**: Cache API responses with expiration
4. **Offline Fallbacks**: Always provide offline functionality
5. **Free Tier Monitoring**: Track usage to stay within limits

---

## System Flow Diagrams

### App Initialization Flow

```
App Start
  │
  ├─> Load Theme Preferences
  ├─> Check Auth Status (if enabled)
  ├─> Initialize Accessibility Services
  ├─> Load User Data (AsyncStorage)
  ├─> Connect to Database (if available)
  └─> Show Main App / Auth Screen
```

### Navigation Flow

```
User Searches Location
  │
  ├─> Search Local Campus Data
  ├─> If Not Found: Search Nominatim (free)
  │
  └─> Calculate Route
      │
      ├─> Find Nearest Waypoints
      ├─> Build Pathfinding Graph
      ├─> Run A* Algorithm
      ├─> Generate Navigation Steps
      └─> Display Route on Map
```

### Parking Update Flow

```
User Reports Parking
  │
  ├─> Save to Database (if available)
  ├─> Save to AsyncStorage (backup)
  ├─> Update Local State
  ├─> Calculate Weighted Average
  ├─> Save to History (for predictions)
  └─> Broadcast Update (if real-time enabled)
```

### Study Assistant Flow

```
User Uploads Document
  │
  ├─> Extract Text (PDF/DOCX/TXT)
  │   ├─> PDF: Gemini API or Vercel function
  │   ├─> DOCX: JSZip extraction
  │   └─> TXT: Direct read
  │
  ├─> Chunk Text (500 chars per chunk)
  ├─> Store Document
  │
  └─> User Asks Question
      │
      ├─> Retrieve Relevant Chunks (keyword matching)
      ├─> Build RAG Context
      ├─> Call LLM (Gemini/Groq/HuggingFace)
      └─> Return Answer with Sources
```

---

## Security Considerations

### Data Privacy
- **Local Storage**: All sensitive data encrypted by OS
- **Supabase**: Row Level Security (RLS) policies
- **API Keys**: Stored securely, never exposed in client code
- **User Data**: Optional email storage (can be disabled)

### Authentication
- **Supabase Auth**: Industry-standard JWT tokens
- **Session Management**: Automatic token refresh
- **Password Security**: Handled by Supabase (bcrypt hashing)

### API Security
- **CORS**: Configured for mobile app only
- **Rate Limiting**: Handled by API providers
- **Error Handling**: No sensitive data in error messages

---

## Performance Optimizations

### Frontend
- **React.memo**: Prevent unnecessary re-renders
- **useCallback/useMemo**: Memoize expensive computations
- **FlatList**: Virtualized lists for large datasets
- **Image Optimization**: Lazy loading, caching

### Backend
- **Local Caching**: Cache API responses
- **Batch Requests**: Group multiple operations
- **Lazy Loading**: Load data on demand
- **Database Indexing**: Optimized queries with indexes

### Network
- **Request Batching**: Combine multiple API calls
- **Retry Logic**: Automatic retry with exponential backoff
- **Offline Queue**: Queue requests when offline

---

## Scalability Considerations

### Current Capacity
- **Users**: Supports 50,000+ monthly active users (Supabase free tier)
- **Parking Updates**: Unlimited (local storage)
- **Documents**: Limited by device storage
- **API Calls**: Within free tier limits

### Scaling Strategies
1. **Database**: Upgrade Supabase plan if needed
2. **Caching**: Implement Redis for frequently accessed data
3. **CDN**: Use Cloudflare for static assets
4. **Load Balancing**: Multiple API endpoints
5. **Database Sharding**: Partition data by region/campus

---

## Future Enhancements

### Planned Features
1. **Indoor Navigation**: Bluetooth beacons for indoor positioning
2. **AR Navigation**: Augmented reality route overlay
3. **Social Features**: Share routes, parking tips
4. **Analytics Dashboard**: Usage statistics for admins
5. **Multi-Campus Support**: Support multiple universities

### Technical Improvements
1. **Vector Embeddings**: Upgrade RAG with embeddings
2. **Real-time Sync**: WebSocket for live updates
3. **Progressive Web App**: Web version support
4. **Offline Maps**: Downloadable map tiles
5. **Machine Learning**: On-device ML for predictions

---

## Conclusion

NavEd is a comprehensive, budget-friendly mobile application that demonstrates:

- **Modern Architecture**: React Native, TypeScript, clean code structure
- **Cost Efficiency**: $0/month operational costs
- **Accessibility**: WCAG 2.1 AA compliant
- **Scalability**: Can handle thousands of users
- **Extensibility**: Easy to add new features

The project showcases advanced mobile development skills, AI integration, and thoughtful design decisions that balance functionality, cost, and user experience.

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Prepared For**: Final Year Project Phase 4 Presentation


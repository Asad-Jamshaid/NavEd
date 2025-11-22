# NavEd - Campus Navigation & Study Assistant

<p align="center">
  <strong>Budget-Friendly Mobile App for University Students</strong><br>
  No IoT devices required • Uses FREE APIs • Accessibility-focused
</p>

---

## 📱 About NavEd

NavEd (Smart Campus Navigation and Student Assistance System) is a comprehensive mobile application designed for university students with three main modules:

1. **🗺️ Campus Navigation** - Interactive maps with video-guided routes
2. **🅿️ Parking Guidance** - Crowdsourced availability with smart predictions
3. **📚 Study Assistant** - AI-powered RAG chatbot for document analysis

### Budget-Friendly Design

This app is specifically designed for students on a tight budget:

- ✅ **NO expensive APIs** - Uses free tiers of all services
- ✅ **NO IoT hardware** - Crowdsourced data instead of sensors
- ✅ **NO server costs** - Local storage with optional free cloud
- ✅ **100% Open Source** - React Native + Expo

---

## 🚀 Features

### 1. Campus Navigation Module

| Feature | Description |
|---------|-------------|
| Interactive Map | OpenStreetMap-based campus map (FREE) |
| Video Navigation | Pre-recorded route videos for visual guidance |
| Turn-by-Turn | Voice-guided directions using OSRM (FREE) |
| Room Finder | Search for classrooms, labs, and offices |
| Accessibility Routes | Wheelchair-friendly paths with ramp/elevator info |

### 2. Parking Guidance Module

| Feature | Description |
|---------|-------------|
| Availability Dashboard | Real-time parking lot status |
| Crowdsourced Updates | Users report available spots |
| Smart Predictions | ML-based peak hour forecasting |
| Vehicle Locator | Save and find your parked car |
| Push Notifications | Alerts when lots are filling up |

### 3. Study Assistant System

| Feature | Description |
|---------|-------------|
| Document Upload | Support for PDF, Word, TXT files |
| RAG-based Q&A | Ask questions about your documents |
| Quiz Generation | Auto-generate practice quizzes |
| Study Plans | AI-created study schedules |
| Assignment Help | Task breakdown and guidance |

### 4. Accessibility Features

- 🔊 Voice guidance with adjustable speech rate
- 📳 Haptic feedback for interactions
- 🎨 High contrast mode
- 📏 Adjustable font sizes
- ♿ Screen reader optimized
- 🎯 Large touch targets (WCAG 2.1 AA compliant)

---

## 💰 Cost Breakdown

| Component | Cost | Alternative |
|-----------|------|-------------|
| Maps | FREE (OpenStreetMap) | - |
| Routing | FREE (OSRM) | Self-host for higher limits |
| AI/LLM | FREE tiers available | See below |
| Storage | FREE (Local + Supabase free tier) | - |
| Notifications | FREE (Expo Push) | - |
| **Total** | **$0/month** | - |

### Free AI API Options

1. **Google Gemini** - 60 requests/minute FREE
   - Get key: https://makersuite.google.com/app/apikey

2. **Groq** - Very generous free tier
   - Get key: https://console.groq.com/keys

3. **HuggingFace** - Free inference API
   - Get key: https://huggingface.co/settings/tokens

---

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-repo/naved.git
cd naved

# Install dependencies
npm install

# Start the development server
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

### Configuration

1. **Update Campus Data**

   Edit `src/data/campusData.ts` with your university's:
   - Building coordinates
   - Room information
   - Parking lot locations

2. **Add API Keys** (Optional)

   In the app, go to Study > Settings icon and add your free API key.

3. **Add Video Routes** (Optional)

   Place MP4 videos in `assets/videos/` following the naming convention:
   ```
   route_gate_to_mab.mp4
   route_gate_to_library.mp4
   ```

---

## 📁 Project Structure

```
NavEd/
├── App.tsx                 # Main app entry
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Buttons, Cards, SearchBar
│   │   ├── navigation/     # Map markers, route display
│   │   ├── parking/        # Parking status cards
│   │   └── study/          # Chat bubbles, quiz cards
│   ├── contexts/           # React Context providers
│   │   └── AppContext.tsx  # Global state management
│   ├── data/               # Static campus data
│   │   └── campusData.ts   # Buildings, rooms, parking lots
│   ├── screens/            # App screens
│   │   ├── navigation/     # Campus map screen
│   │   ├── parking/        # Parking dashboard
│   │   ├── study/          # Study assistant
│   │   └── settings/       # App settings
│   ├── services/           # Business logic
│   │   ├── navigationService.ts   # Routing (OSRM)
│   │   ├── parkingService.ts      # Parking predictions
│   │   ├── studyAssistantService.ts # RAG + LLM
│   │   └── accessibilityService.ts # Voice, haptics
│   ├── types/              # TypeScript definitions
│   └── utils/              # Constants, helpers
├── assets/                 # Images, videos, fonts
└── package.json
```

---

## 🎓 For Your FYP

### Customizing for Your University

1. **Campus Map**
   - Get your campus coordinates from Google Maps
   - Update `CAMPUS_CONFIG` in `src/utils/constants.ts`
   - Add building data in `src/data/campusData.ts`

2. **Recording Video Routes**
   - Walk the routes while recording with your phone
   - Keep videos under 2 minutes for smooth playback
   - Use 720p to balance quality and file size

3. **Parking Data Collection**
   - Survey your campus parking lots
   - Note peak hours from observation
   - Add accessibility information

### Presentation Tips

- Demo the accessibility features (impressive for evaluators!)
- Show the cost comparison with commercial solutions
- Highlight the crowdsourced data science approach
- Demonstrate offline capability

---

## 🔧 Technical Details

### Technologies Used

| Category | Technology | Why |
|----------|------------|-----|
| Framework | React Native + Expo | Cross-platform, fast development |
| Maps | react-native-maps + OpenStreetMap | Free, detailed maps |
| Routing | OSRM | Free, open-source routing |
| AI/LLM | Gemini/Groq/HuggingFace | Free tiers available |
| Storage | AsyncStorage | Local, no server needed |
| Navigation | React Navigation | Standard for RN apps |
| Icons | Expo Vector Icons | Comprehensive icon set |

### Key Design Decisions

1. **No Backend Server**
   - All data stored locally on device
   - Reduces hosting costs to $0
   - Works offline

2. **Crowdsourced Parking**
   - Users report availability
   - Builds community engagement
   - No expensive IoT sensors

3. **RAG without Embeddings API**
   - Keyword-based retrieval
   - Works with any free LLM
   - No vector database needed

---

## 📄 License

MIT License - Feel free to use for your FYP!

---

## 🤝 Contributing

Contributions welcome! This is an open-source project designed to help students.

---

<p align="center">
  Made with ❤️ for students, by students<br>
  <strong>NavEd - Navigate. Park. Study. Succeed.</strong>
</p>

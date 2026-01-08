# NavEd Frontend Structure

This document describes the frontend (React Native mobile app) structure.

## 📁 Frontend Directory Structure

```
frontend/
├── app/                       # Application entry point
│   └── App.tsx               # Root component with navigation setup
│
├── features/                  # Feature-based modules (Domain-Driven Design)
│   ├── auth/                 # Authentication feature
│   │   ├── components/       # Auth-specific components
│   │   ├── hooks/            # Auth-specific hooks
│   │   ├── screens/          # Auth screens
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   ├── services/        # Auth services
│   │   │   └── authService.ts
│   │   └── types/            # Auth-specific types
│   │
│   ├── navigation/           # Campus Navigation feature
│   │   ├── components/       # Navigation-specific components
│   │   │   ├── Building3DLayer.tsx
│   │   │   ├── MapLibreMap.tsx
│   │   │   └── MapViewFallback.tsx
│   │   ├── hooks/            # Navigation hooks
│   │   ├── screens/          # Navigation screens
│   │   │   └── CampusMapScreen.tsx
│   │   ├── services/         # Navigation services
│   │   │   └── navigationService.ts
│   │   └── types/            # Navigation-specific types
│   │
│   ├── parking/               # Parking Guidance feature
│   │   ├── components/       # Parking-specific components
│   │   ├── hooks/            # Parking hooks
│   │   ├── screens/          # Parking screens
│   │   │   └── ParkingScreen.tsx
│   │   ├── services/         # Parking services
│   │   │   ├── parkingService.ts
│   │   │   ├── parkingDatabaseService.ts
│   │   │   ├── parkingPredictionService.ts
│   │   │   └── parkingAlertService.ts
│   │   └── types/            # Parking-specific types
│   │
│   └── study/                 # Study Assistant feature
│       ├── components/       # Study-specific components
│       ├── hooks/            # Study hooks
│       ├── screens/          # Study screens
│       │   └── StudyAssistantScreen.tsx
│       ├── services/        # Study services
│       │   └── studyAssistantService.ts
│       └── types/            # Study-specific types
│
└── shared/                    # Shared code across features
    ├── components/            # Reusable components
    │   ├── common/           # Common UI components
    │   │   ├── AccessibleButton.tsx
    │   │   ├── Card.tsx
    │   │   ├── EmptyState.tsx
    │   │   ├── ErrorBoundary.tsx
    │   │   ├── ErrorState.tsx
    │   │   ├── LoadingSkeleton.tsx
    │   │   └── SearchBar.tsx
    │   └── ui/               # UI components (for future use)
    │
    ├── contexts/              # React contexts
    │   ├── AppContext.tsx
    │   ├── AuthContext.tsx
    │   └── ThemeContext.tsx
    │
    ├── data/                  # Static data
    │   ├── buildingFootprints.ts
    │   └── campusData.ts
    │
    ├── hooks/                 # Shared custom hooks
    │
    ├── screens/               # Shared screens
    │   └── SettingsScreen.tsx
    │
    ├── services/              # Shared services
    │   ├── accessibilityService.ts
    │   ├── databaseService.ts
    │   └── notificationService.ts
    │
    ├── theme/                 # Theme configuration
    │   └── index.ts
    │
    ├── types/                 # Shared TypeScript types
    │   ├── env.d.ts
    │   └── index.ts
    │
    └── utils/                 # Utility functions
        └── constants.ts
```

## 🎯 Architecture Principles

### Feature-Based Architecture
Each feature (auth, navigation, parking, study) is self-contained with:
- Components specific to that feature
- Services for business logic
- Screens for user interfaces
- Types for TypeScript definitions
- Hooks for reusable logic

### Shared Code
The `shared/` directory contains code used across multiple features:
- Common UI components
- React contexts
- Shared services
- Utility functions
- Static data

## 📝 Import Examples

### Using Path Aliases (Recommended)
```typescript
// From any feature
import { useTheme } from '@shared/contexts/ThemeContext';
import { ParkingLot } from '@shared/types';
import AccessibleButton from '@components/common/AccessibleButton';

// Feature-specific imports
import { getParkingLots } from '../services/parkingService'; // Within feature
```

### Relative Imports
```typescript
// Within same feature
import { getParkingLots } from '../services/parkingService';

// From feature to shared
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { ParkingLot } from '../../../shared/types';
```

## ⚙️ Configuration

### TypeScript (`tsconfig.json`)
Path aliases configured:
- `@/*` → `frontend/*`
- `@app/*` → `frontend/app/*`
- `@features/*` → `frontend/features/*`
- `@shared/*` → `frontend/shared/*`
- `@components/*` → `frontend/shared/components/*`
- `@screens/*` → `frontend/features/*/screens/*`
- `@services/*` → `frontend/shared/services/*` or `frontend/features/*/services/*`
- `@utils/*` → `frontend/shared/utils/*`
- `@assets/*` → `assets/*`

### Babel (`babel.config.js`)
Module resolver aliases configured for runtime resolution.

### Jest (`jest.config.js`)
Test module paths and mappers configured for `frontend/`.

## 🚀 Entry Point

The app entry point is:
- **File**: `frontend/app/App.tsx`
- **Expo Entry**: `node_modules/expo/AppEntry.js` (Expo automatically finds App.tsx)

## 📚 Related Documentation

- Overall Structure: See `STRUCTURE.md`
- Backend Structure: See `BACKEND_STRUCTURE.md`


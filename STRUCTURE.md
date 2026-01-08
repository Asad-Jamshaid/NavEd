# NavEd - Production-Level File Structure

This document describes the production-level file structure reorganization of the NavEd mobile application.

## 📁 Directory Structure

```
NavEd/
├── backend/                    # Backend services (separated)
│   ├── api/                   # Serverless API functions
│   ├── database/              # Database migrations and seeds
│   ├── scripts/               # Backend utility scripts
│   ├── config/                # Backend configuration
│   └── package.json           # Backend dependencies
│
├── frontend/                  # Frontend (React Native mobile app)
│   ├── app/                   # Application entry point
│   │   └── App.tsx            # Root component with navigation setup
│   │
│   ├── features/              # Feature-based modules (Domain-Driven Design)
│   │   ├── auth/              # Authentication feature
│   │   │   ├── components/    # Auth-specific components
│   │   │   ├── hooks/         # Auth-specific hooks
│   │   │   ├── screens/       # Auth screens
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   └── SignupScreen.tsx
│   │   │   ├── services/      # Auth services
│   │   │   │   └── authService.ts
│   │   │   └── types/         # Auth-specific types
│   │   │
│   │   ├── navigation/        # Campus Navigation feature
│   │   │   ├── components/    # Navigation-specific components
│   │   │   │   ├── Building3DLayer.tsx
│   │   │   │   ├── MapLibreMap.tsx
│   │   │   │   └── MapViewFallback.tsx
│   │   │   ├── hooks/         # Navigation hooks
│   │   │   ├── screens/       # Navigation screens
│   │   │   │   └── CampusMapScreen.tsx
│   │   │   ├── services/      # Navigation services
│   │   │   │   └── navigationService.ts
│   │   │   └── types/         # Navigation-specific types
│   │   │
│   │   ├── parking/           # Parking Guidance feature
│   │   │   ├── components/    # Parking-specific components
│   │   │   ├── hooks/          # Parking hooks
│   │   │   ├── screens/        # Parking screens
│   │   │   │   └── ParkingScreen.tsx
│   │   │   ├── services/       # Parking services
│   │   │   │   ├── parkingService.ts
│   │   │   │   ├── parkingDatabaseService.ts
│   │   │   │   ├── parkingPredictionService.ts
│   │   │   │   └── parkingAlertService.ts
│   │   │   └── types/          # Parking-specific types
│   │   │
│   │   └── study/              # Study Assistant feature
│   │       ├── components/     # Study-specific components
│   │       ├── hooks/           # Study hooks
│   │       ├── screens/         # Study screens
│   │       │   └── StudyAssistantScreen.tsx
│   │       ├── services/        # Study services
│   │       │   └── studyAssistantService.ts
│   │       └── types/           # Study-specific types
│   │
│   └── shared/                # Shared code across features
│       ├── components/         # Reusable components
│       │   ├── common/          # Common UI components
│       │   │   ├── AccessibleButton.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── EmptyState.tsx
│       │   │   ├── ErrorBoundary.tsx
│       │   │   ├── ErrorState.tsx
│       │   │   ├── LoadingSkeleton.tsx
│       │   │   └── SearchBar.tsx
│       │   └── ui/              # UI components (for future use)
│       │
│       ├── contexts/           # React contexts
│       │   ├── AppContext.tsx
│       │   ├── AuthContext.tsx
│       │   └── ThemeContext.tsx
│       │
│       ├── data/               # Static data
│       │   ├── buildingFootprints.ts
│       │   └── campusData.ts
│       │
│       ├── hooks/              # Shared custom hooks
│       │
│       ├── screens/            # Shared screens
│       │   └── SettingsScreen.tsx
│       │
│       ├── services/           # Shared services
│       │   ├── accessibilityService.ts
│       │   ├── databaseService.ts
│       │   └── notificationService.ts
│       │
│       ├── theme/               # Theme configuration
│       │   └── index.ts
│       │
│       ├── types/              # Shared TypeScript types
│       │   ├── env.d.ts
│       │   └── index.ts
│       │
│       └── utils/              # Utility functions
│           └── constants.ts
│
├── config/                     # Configuration files
│   ├── app.json
│   ├── eas.json
│   ├── babel.config.js
│   ├── jest.config.js
│   ├── jest.setup.js
│   └── vercel.json
│
├── __tests__/                  # Test files (mirrors src structure)
│   ├── components/
│   ├── contexts/
│   ├── integration/
│   ├── screens/
│   ├── services/
│   └── utils/
│
├── assets/                     # Static assets
│   ├── icon.png
│   ├── splash.png
│   └── ...
│
├── scripts/                    # Build and utility scripts
│   ├── build/
│   ├── test/
│   └── ...
│
├── docs/                       # Documentation
├── __mocks__/                  # Jest mocks
├── android/                    # Android native code
├── node_modules/               # Dependencies
├── package.json
├── tsconfig.json              # TypeScript configuration
└── README.md
```

## 🔄 Frontend vs Backend Separation

### Frontend (`frontend/`)
- React Native mobile application code
- All UI components, screens, and client-side logic
- Client-side services and state management
- Mobile-specific implementations

### Backend (`backend/`)
- Serverless API functions (Vercel)
- Database migrations and seed files
- Backend utility scripts
- Server-side configuration

**See `BACKEND_STRUCTURE.md` for detailed backend documentation.**

## 🎯 Key Principles

### 1. **Feature-Based Architecture (Domain-Driven Design)**
- Each feature (auth, navigation, parking, study) is self-contained
- Features have their own components, services, hooks, screens, and types
- Promotes modularity and scalability

### 2. **Shared Code Organization**
- `shared/` contains code used across multiple features
- Common components, contexts, services, and utilities
- Prevents code duplication

### 3. **Separation of Concerns**
- **app/**: Application entry point and navigation setup
- **core/**: Core infrastructure (API, config, navigation)
- **features/**: Business logic organized by domain
- **shared/**: Reusable code

### 4. **TypeScript Path Aliases**
Updated `tsconfig.json` includes:
- `@app/*` → `src/app/*`
- `@features/*` → `src/features/*`
- `@shared/*` → `src/shared/*`
- `@core/*` → `src/core/*`
- `@components/*` → `src/shared/components/*`
- `@screens/*` → `src/features/*/screens/*`
- `@services/*` → `src/shared/services/*` or `src/features/*/services/*`
- `@utils/*` → `src/shared/utils/*`
- `@assets/*` → `assets/*`

## 📝 Import Examples

### Before (Old Structure)
```typescript
import { useTheme } from '../../contexts/ThemeContext';
import { ParkingLot } from '../../types';
import { getParkingLots } from '../../services/parkingService';
```

### After (New Structure)
```typescript
// Feature-specific imports
import { getParkingLots } from '../services/parkingService'; // Within feature
import { ParkingLot } from '../../../shared/types'; // From shared

// Shared imports
import { useTheme } from '../contexts/ThemeContext'; // Within shared
import AccessibleButton from '../components/common/AccessibleButton'; // Within shared
```

### Using Path Aliases (Recommended)
```typescript
import { useTheme } from '@shared/contexts/ThemeContext';
import { ParkingLot } from '@shared/types';
import { getParkingLots } from '@features/parking/services/parkingService';
import AccessibleButton from '@components/common/AccessibleButton';
```

## 🔄 Migration Status

✅ **Completed:**
- Directory structure created
- Files moved to new locations
- Import paths updated in:
  - App.tsx
  - All screen files
  - All service files
  - All component files
  - All context files
- tsconfig.json paths updated
- SettingsScreen created in correct location

⏳ **In Progress:**
- Test file reorganization (to mirror src structure)
- Creating index files for cleaner exports
- Navigation setup organization

📋 **Future Enhancements:**
- Add index.ts files for barrel exports
- Organize custom hooks
- Create feature-specific type definitions
- Add feature-specific constants

## 🚀 Benefits

1. **Scalability**: Easy to add new features without affecting existing code
2. **Maintainability**: Clear separation makes code easier to understand and modify
3. **Testability**: Features can be tested in isolation
4. **Team Collaboration**: Multiple developers can work on different features simultaneously
5. **Code Reusability**: Shared components and utilities are easily accessible
6. **Type Safety**: Better TypeScript support with organized types

## 📚 Next Steps

1. Reorganize test files to mirror the new src structure
2. Create index.ts files for barrel exports
3. Extract custom hooks into dedicated hook files
4. Add feature-specific constants
5. Update documentation with new import patterns


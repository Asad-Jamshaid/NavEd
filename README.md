# NavEd - Campus Navigation & Study Assistant

A React Native mobile application for university students featuring campus navigation, parking guidance, and AI-powered study assistance.

## Features

- 🗺️ **Campus Navigation** - Interactive maps with turn-by-turn directions
- 🅿️ **Parking Guidance** - Real-time parking availability and predictions
- 📚 **Study Assistant** - AI-powered document analysis and Q&A

## Tech Stack

- React Native + Expo
- TypeScript
- Supabase (optional cloud features)
- MapLibre GL (maps)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/Asad-Jamshaid/NavEd.git
cd NavEd

# Install dependencies
npm install

# Start the development server
npm start
```

### Configuration

1. Copy `.env.example` to `.env`
2. Add your API keys (see `.env.example` for required variables)
3. Configure campus data in `frontend/shared/data/campusData.ts`

## Project Structure

```
frontend/          # React Native app
  app/            # App entry point
  features/       # Feature modules (auth, navigation, parking, study)
  shared/         # Shared components, services, utilities
backend/          # Backend services (API, database)
__tests__/        # Test files
```

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## License

MIT

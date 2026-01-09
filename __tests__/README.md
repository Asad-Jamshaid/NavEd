# Test Suite Documentation

## Overview
Comprehensive test suite for authentication, database integration, and enhanced parking prediction features.

## Test Structure

```
__tests__/
├── services/
│   ├── databaseService.test.ts              # Supabase client tests
│   ├── authService.test.ts                  # Authentication service tests
│   ├── parkingDatabaseService.test.ts       # Parking DB operations tests
│   ├── parkingPredictionService.test.ts     # Enhanced predictions tests
│   ├── parkingAlertService.test.ts          # Alert system tests
│   ├── parkingService.test.ts               # Original parking service tests
│   └── parkingService.backwardCompatibility.test.ts  # Backward compatibility
├── contexts/
│   ├── AuthContext.test.tsx                 # Auth context tests
│   └── AppContext.backwardCompatibility.test.tsx     # AppContext compatibility
├── integration/
│   ├── auth-flow.test.tsx                   # Complete auth flow
│   ├── parking-database-integration.test.ts # DB integration
│   └── app-initialization.test.tsx          # App startup tests
└── README.md                                 # This file
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test File
```bash
npm test databaseService
npm test authService
npm test backwardCompatibility
```

### With Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

## Test Categories

### Unit Tests
- Individual service functions
- Isolated component behavior
- Mock dependencies

### Integration Tests
- Complete feature flows
- Service interactions
- Real-world scenarios

### Backward Compatibility Tests
- Existing functionality preserved
- Optional parameters work
- Fallback mechanisms verified

## Key Testing Principles

1. **Non-Breaking**: All existing tests must pass
2. **Optional Features**: Tests work with/without Supabase
3. **Fallback Testing**: Every DB operation has AsyncStorage fallback
4. **Error Handling**: All error paths tested
5. **Real Scenarios**: Integration tests cover actual usage

## Mock Strategy

- Supabase: Mocked to simulate available/unavailable states
- AsyncStorage: Mocked for consistent test behavior
- Services: Mocked to test isolation
- Navigation: Mocked for screen tests

## Coverage Goals

- Services: >90% coverage
- Contexts: >85% coverage
- Integration: All critical paths covered
- Backward Compatibility: 100% of existing features tested




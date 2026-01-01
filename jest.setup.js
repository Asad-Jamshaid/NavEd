// Simplified Jest Setup File for NavEd
// Only essential mocks needed for basic testing

// Mock console to reduce noise
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch for API tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    status: 200,
    headers: {
      get: () => null,
    },
  })
);

// Mock for Supabase client in tests
const mockSupabaseClient = {
  auth: {
    signUp: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signInWithPassword: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
  })),
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
  })),
  removeChannel: jest.fn(),
};

const createClient = jest.fn(() => mockSupabaseClient);

module.exports = {
  createClient,
  mockSupabaseClient,
};




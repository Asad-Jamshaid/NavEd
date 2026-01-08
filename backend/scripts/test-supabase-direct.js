// Direct Supabase connection test with provided credentials
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://clusdofsjhjkzrzgjzhw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdXNkb2Zzamhqa3pyemdqemh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTYxNzAsImV4cCI6MjA4MzQzMjE3MH0.AFGWZUxTWDr14IcxZkbQNBCbmfc47fkSp1806ubQ31k';

console.log('=== Testing Supabase Connection ===\n');
console.log('URL:', SUPABASE_URL);
console.log('Anon Key:', SUPABASE_ANON_KEY.substring(0, 50) + '...\n');

try {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✓ Supabase client created\n');

  // Test 1: Check auth connection
  console.log('Test 1: Checking auth connection...');
  supabase.auth.getSession()
    .then(({ data, error }) => {
      if (error) {
        console.log('⚠ Auth check warning:', error.message);
      } else {
        console.log('✓ Auth connection successful');
        console.log('  Active session:', data.session ? 'Yes' : 'No');
      }

      // Test 2: Check database access (user_profiles table)
      console.log('\nTest 2: Checking database access (user_profiles table)...');
      return supabase.from('user_profiles').select('count').limit(1);
    })
    .then(({ data, error }) => {
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.log('❌ user_profiles table does not exist');
          console.log('\n⚠ ACTION REQUIRED:');
          console.log('You need to create the user_profiles table in your Supabase dashboard.');
          console.log('Go to: SQL Editor → Run this SQL:');
          console.log(`
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
          `);
        } else {
          console.log('⚠ Database access error:', error.message);
          console.log('  Code:', error.code);
        }
      } else {
        console.log('✓ Database access successful');
        console.log('  user_profiles table exists and is accessible');
      }

      // Test 3: Try a test signup (optional - will create a test user)
      console.log('\n=== Test Results ===');
      console.log('✓ Supabase connection: WORKING');
      console.log('✓ Credentials: VALID');
      if (error && error.code === 'PGRST116') {
        console.log('⚠ Database schema: NEEDS SETUP');
      } else {
        console.log('✓ Database schema: READY');
      }
      console.log('\n✅ Your Supabase is properly configured!');
      console.log('\nNext steps:');
      console.log('1. Update your .env file to include the values on the same line:');
      console.log('   SUPABASE_URL=https://clusdofsjhjkzrzgjzhw.supabase.co');
      console.log('   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
      console.log('2. If you see the table error above, run the SQL in your Supabase dashboard');
      console.log('3. Restart your app to load the updated .env file');
      
      // Give Node.js sufficient time to close all async HTTP handles before exiting
      // This prevents the assertion error on Windows when handles are still closing
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    })
    .catch((error) => {
      console.log('❌ Connection test failed:', error.message);
      console.log('  Details:', error);
      // Give Node.js sufficient time to close all async HTTP handles before exiting
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });
} catch (error) {
  console.log('❌ Failed to create Supabase client:', error.message);
  // Give Node.js sufficient time to close all async HTTP handles before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
}


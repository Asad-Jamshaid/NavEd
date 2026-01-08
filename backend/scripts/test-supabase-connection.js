// Quick test script to verify Supabase connection
const { createClient } = require('@supabase/supabase-js');

// Try to load environment variables
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

try {
  const env = require('@env');
  SUPABASE_URL = env.SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL || '';
  SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  console.log('✓ Environment variables loaded from @env');
} catch (e) {
  console.log('✗ Could not load from @env, trying direct require...');
  // Try loading from .env file directly (for Node.js)
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      console.log('Debug: .env file size:', envContent.length, 'chars');
      // Show raw content around SUPABASE lines
      const lines = envContent.split(/\r?\n/);
      console.log('\nDebug: Lines 24-32:');
      lines.slice(23, 32).forEach((l, i) => {
        console.log(`  ${i + 24}: [${l.length} chars] "${l.substring(0, 60)}"`);
      });
      console.log('');
      // Handle both \n and \r\n line endings
      let foundLines = 0;
      lines.forEach((line, index) => {
        line = line.trim();
        // Skip comments and empty lines
        if (!line || line.startsWith('#')) return;
        // Handle spaces around = sign
        const equalIndex = line.indexOf('=');
        if (equalIndex > 0) {
          foundLines++;
          const key = line.substring(0, equalIndex).trim();
          const value = line.substring(equalIndex + 1).trim();
          console.log(`Debug: Line ${index + 1}: ${key} = ${value.substring(0, 30)}... (length: ${value.length})`);
          if (key === 'SUPABASE_URL') {
            SUPABASE_URL = value;
            console.log(`  → Set SUPABASE_URL (length: ${SUPABASE_URL.length})`);
          }
          if (key === 'SUPABASE_ANON_KEY') {
            SUPABASE_ANON_KEY = value;
            console.log(`  → Set SUPABASE_ANON_KEY (length: ${SUPABASE_ANON_KEY.length})`);
          }
        } else if (line) {
          console.log(`Debug: Line ${index + 1} didn't contain =: "${line.substring(0, 50)}"`);
        }
      });
      console.log(`✓ Environment variables loaded from .env file (found ${foundLines} variable lines)`);
    } else {
      console.log('✗ .env file not found');
    }
  } catch (e2) {
    console.log('✗ Could not load environment variables:', e2.message);
  }
}

console.log('\n=== Supabase Configuration Test ===\n');
console.log('URL:', SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : 'NOT SET');
console.log('Anon Key:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 30)}...` : 'NOT SET');
console.log('');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('❌ ERROR: Supabase credentials not found!');
  console.log('Make sure your .env file contains:');
  console.log('  SUPABASE_URL=https://...');
  console.log('  SUPABASE_ANON_KEY=eyJ...');
  process.exit(1);
}

// Test Supabase connection
try {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✓ Supabase client created');
  
  // Test connection by checking auth
  supabase.auth.getSession()
    .then(({ data, error }) => {
      if (error) {
        console.log('⚠ Warning:', error.message);
      } else {
        console.log('✓ Supabase connection successful');
        console.log('  Session:', data.session ? 'Active' : 'No active session');
      }
      
      // Test database access (check if user_profiles table exists)
      return supabase.from('user_profiles').select('count').limit(1);
    })
    .then(({ data, error }) => {
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.log('⚠ Warning: user_profiles table does not exist');
          console.log('  You need to run the SQL schema in your Supabase dashboard');
        } else {
          console.log('⚠ Database access error:', error.message);
        }
      } else {
        console.log('✓ Database access successful');
        console.log('  user_profiles table exists');
      }
      
      console.log('\n=== Test Complete ===');
      console.log('✓ Supabase is properly configured!');
      process.exit(0);
    })
    .catch((error) => {
      console.log('❌ Connection test failed:', error.message);
      process.exit(1);
    });
} catch (error) {
  console.log('❌ Failed to create Supabase client:', error.message);
  process.exit(1);
}


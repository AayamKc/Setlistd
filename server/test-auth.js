/**
 * Supabase Authentication Testing Script
 * 
 * This script tests various authentication scenarios with your Supabase backend.
 * Make sure you have the following environment variables set:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - SUPABASE_ANON_KEY (for client-side testing)
 */

require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SERVER_URL = 'http://localhost:3000';
const TEST_EMAIL = 'akc0539@gmail.com';
const TEST_PASSWORD = 'testpassword123';

// Create Supabase client for direct testing
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables.');
  process.exit(1);
}

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Test utilities
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  log(`\n🧪 Testing: ${testName}`, 'blue');
  log('─'.repeat(50), 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

// Test functions
async function testDirectSupabaseConnection() {
  logTest('Direct Supabase Connection');
  
  try {
    // Test basic connection
    const { data, error } = await supabaseClient.from('auth.users').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is expected for auth.users table
      logWarning(`Expected error accessing auth.users directly: ${error.message}`);
    }
    
    logSuccess('Supabase client initialized successfully');
    logInfo(`Supabase URL: ${supabaseUrl}`);
    return true;
  } catch (error) {
    logError(`Failed to connect to Supabase: ${error.message}`);
    return false;
  }
}

async function testServerHealth() {
  logTest('Server Health Check');
  
  try {
    const response = await axios.get(`${SERVER_URL}/api/events?q=test&per_page=1`);
    logSuccess(`Server is running on ${SERVER_URL}`);
    logInfo(`Response status: ${response.status}`);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      logError(`Server is not running on ${SERVER_URL}`);
      logInfo('Please start the server with: npm run dev');
    } else {
      logError(`Server health check failed: ${error.message}`);
    }
    return false;
  }
}

async function testUserRegistration() {
  logTest('User Registration');
  
  try {
    // First, try to clean up any existing test user
    await cleanupTestUser();
    
    const response = await axios.post(`${SERVER_URL}/auth/signup`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    logSuccess(`User registration successful`);
    logInfo(`Response status: ${response.status}`);
    logInfo(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
    return response.data;
  } catch (error) {
    if (error.response) {
      logError(`Registration failed: ${error.response.data.error}`);
      logInfo(`Status: ${error.response.status}`);
    } else {
      logError(`Registration failed: ${error.message}`);
    }
    return null;
  }
}

async function testUserLogin() {
  logTest('User Login');
  
  try {
    const response = await axios.post(`${SERVER_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    logSuccess('User login successful');
    logInfo(`Response status: ${response.status}`);
    
    if (response.data.session && response.data.session.access_token) {
      logSuccess('Access token received');
      logInfo(`Token: ${response.data.session.access_token.substring(0, 20)}...`);
      return response.data.session.access_token;
    } else {
      logWarning('No access token in response');
      return null;
    }
  } catch (error) {
    if (error.response) {
      logError(`Login failed: ${error.response.data.error}`);
      logInfo(`Status: ${error.response.status}`);
    } else {
      logError(`Login failed: ${error.message}`);
    }
    return null;
  }
}

async function testProtectedRoute(token) {
  logTest('Protected Route Access');
  
  if (!token) {
    logError('No token provided for protected route test');
    return false;
  }
  
  try {
    const response = await axios.get(`${SERVER_URL}/api/protected-data`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    logSuccess('Protected route access successful');
    logInfo(`Response: ${JSON.stringify(response.data, null, 2)}`);
    return true;
  } catch (error) {
    if (error.response) {
      logError(`Protected route access failed: ${error.response.data.message}`);
      logInfo(`Status: ${error.response.status}`);
    } else {
      logError(`Protected route access failed: ${error.message}`);
    }
    return false;
  }
}

async function testInvalidToken() {
  logTest('Invalid Token Handling');
  
  try {
    const response = await axios.get(`${SERVER_URL}/api/protected-data`, {
      headers: {
        Authorization: 'Bearer invalid_token_12345'
      }
    });
    
    logError('Invalid token was accepted (this should not happen)');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logSuccess('Invalid token correctly rejected');
      logInfo(`Response: ${error.response.data.message}`);
      return true;
    } else {
      logError(`Unexpected error: ${error.message}`);
      return false;
    }
  }
}

async function testNoToken() {
  logTest('No Token Handling');
  
  try {
    const response = await axios.get(`${SERVER_URL}/api/protected-data`);
    
    logError('Request without token was accepted (this should not happen)');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logSuccess('Request without token correctly rejected');
      logInfo(`Response: ${error.response.data.message}`);
      return true;
    } else {
      logError(`Unexpected error: ${error.message}`);
      return false;
    }
  }
}

async function testUserLogout(token) {
  logTest('User Logout');
  
  if (!token) {
    logWarning('No token provided for logout test');
    return false;
  }
  
  try {
    const response = await axios.post(`${SERVER_URL}/auth/logout`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    logSuccess('User logout successful');
    logInfo(`Response: ${JSON.stringify(response.data, null, 2)}`);
    return true;
  } catch (error) {
    if (error.response) {
      logError(`Logout failed: ${error.response.data.error || error.response.data.message}`);
      logInfo(`Status: ${error.response.status}`);
    } else {
      logError(`Logout failed: ${error.message}`);
    }
    return false;
  }
}

async function cleanupTestUser() {
  logTest('Cleanup Test User');
  
  try {
    // Note: In a production environment, you'd want to use admin functions
    // For testing, we'll try to sign in and delete the user
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (!error && data.user) {
      // User exists, try to delete
      const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(data.user.id);
      if (!deleteError) {
        logInfo('Test user cleaned up successfully');
      }
    }
  } catch (error) {
    // Ignore cleanup errors
    logInfo('Cleanup completed (user may not have existed)');
  }
}

// Main test runner
async function runAllTests() {
  log('\n🚀 Starting Supabase Authentication Tests', 'magenta');
  log('='.repeat(60), 'magenta');
  
  let passedTests = 0;
  let totalTests = 0;
  let authToken = null;
  
  // Test 1: Direct Supabase connection
  totalTests++;
  if (await testDirectSupabaseConnection()) {
    passedTests++;
  }
  
  // Test 2: Server health
  totalTests++;
  const serverRunning = await testServerHealth();
  if (serverRunning) {
    passedTests++;
  } else {
    log('\n❌ Server is not running. Please start the server and try again.', 'red');
    return;
  }
  
  // Test 3: User registration
  totalTests++;
  if (await testUserRegistration()) {
    passedTests++;
  }
  
  // Test 4: User login
  totalTests++;
  authToken = await testUserLogin();
  if (authToken) {
    passedTests++;
  }
  
  // Test 5: Protected route with valid token
  totalTests++;
  if (await testProtectedRoute(authToken)) {
    passedTests++;
  }
  
  // Test 6: Invalid token handling
  totalTests++;
  if (await testInvalidToken()) {
    passedTests++;
  }
  
  // Test 7: No token handling
  totalTests++;
  if (await testNoToken()) {
    passedTests++;
  }
  
  // Test 8: User logout
  totalTests++;
  if (await testUserLogout(authToken)) {
    passedTests++;
  }
  
  // Final cleanup
  await cleanupTestUser();
  
  // Results
  log('\n📊 Test Results', 'magenta');
  log('='.repeat(60), 'magenta');
  log(`Passed: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('🎉 All tests passed! Your Supabase authentication is working correctly.', 'green');
  } else {
    log('⚠️  Some tests failed. Please check the errors above.', 'yellow');
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Supabase Authentication Test Suite

Usage: node test-auth.js [options]

Options:
  --help, -h     Show this help message
  
Environment Variables Required:
  SUPABASE_URL              Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY Your Supabase service role key
  SUPABASE_ANON_KEY         Your Supabase anon/public key
  
Before running:
1. Make sure your server is running (npm run dev)
2. Set up your environment variables in .env file
3. Ensure Supabase project is configured

Test Email: ${TEST_EMAIL}
Test Password: ${TEST_PASSWORD}
Server URL: ${SERVER_URL}
`);
  process.exit(0);
}

// Run tests
if (require.main === module) {
  runAllTests().catch(error => {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testDirectSupabaseConnection,
  testServerHealth,
  testUserRegistration,
  testUserLogin,
  testProtectedRoute,
  testInvalidToken,
  testNoToken,
  testUserLogout
};

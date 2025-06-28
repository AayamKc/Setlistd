require('dotenv').config();

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const optionalEnvVars = [
  'SUPABASE_ANON_KEY',
  'PORT',
  'SEATGEEK_CLIENT_ID',
  'SEATGEEK_CLIENT_SECRET',
  'MONGODB_URI'
];

console.log('🔍 Environment Configuration Check');
console.log('='.repeat(40));

let allRequired = true;

console.log('\n✅ Required Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✓ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ❌ ${varName}: Not set`);
    allRequired = false;
  }
});

console.log('\n📋 Optional Variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✓ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ⚪ ${varName}: Not set`);
  }
});

if (allRequired) {
  console.log('\n🎉 All required environment variables are configured!');
  console.log('You can now run: npm run test:auth');
} else {
  console.log('\n❌ Missing required environment variables.');
  console.log('Please check your .env file and ensure all required variables are set.');
  console.log('See .env.example for reference.');
}

console.log('\n📝 Next Steps:');
console.log('1. Start your server: npm run dev');
console.log('2. Run authentication tests: npm run test:auth');

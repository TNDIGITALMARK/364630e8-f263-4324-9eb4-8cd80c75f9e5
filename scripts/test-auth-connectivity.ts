/**
 * Authentication Connectivity Test Script
 *
 * This script tests the connectivity to the Control Plane API
 * to help diagnose "failed to fetch" errors during signup.
 *
 * Run: npx tsx scripts/test-auth-connectivity.ts
 */

const CONTROL_PLANE_URL = process.env.NEXT_PUBLIC_CONTROL_PLANE_API_URL || 'https://phoenixengine2-0.onrender.com';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '2luDlbgjvhO32uRKNns0OwSKemA3';
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || '219dfe5b-7ca9-4dd6-bfa0-00aabc4b6ff1';

console.log('🔍 Testing Authentication System Connectivity\n');
console.log('Configuration:');
console.log(`  Control Plane: ${CONTROL_PLANE_URL}`);
console.log(`  Tenant ID: ${TENANT_ID}`);
console.log(`  Project ID: ${PROJECT_ID}\n`);

// Test 1: Basic connectivity
async function testBasicConnectivity() {
  console.log('📡 Test 1: Basic connectivity to Control Plane...');
  try {
    const response = await fetch(CONTROL_PLANE_URL, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });
    console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
    return true;
  } catch (error: any) {
    console.error(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

// Test 2: Boot endpoint (get scoped anon token)
async function testBootEndpoint() {
  console.log('\n📡 Test 2: Boot endpoint (scoped anon token)...');
  try {
    const response = await fetch(`${CONTROL_PLANE_URL}/api/supabase/boot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        tenantId: TENANT_ID,
        projectId: PROJECT_ID,
      }),
      signal: AbortSignal.timeout(15000),
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success! Token received (expires in ${data.expires_in}s)`);
      return true;
    } else {
      const text = await response.text();
      console.error(`   ❌ Failed: ${text.substring(0, 200)}`);
      return false;
    }
  } catch (error: any) {
    console.error(`   ❌ Network error: ${error.message}`);
    return false;
  }
}

// Test 3: Ensure tenant_users table
async function testEnsureTable() {
  console.log('\n📡 Test 3: Ensure tenant_users table...');
  try {
    const response = await fetch(`${CONTROL_PLANE_URL}/api/supabase/tenant-users/ensure-table`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        tenantId: TENANT_ID,
        projectId: PROJECT_ID,
      }),
      signal: AbortSignal.timeout(30000),
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success! Table status: ${JSON.stringify(data)}`);
      return true;
    } else {
      const text = await response.text();
      console.error(`   ❌ Failed: ${text.substring(0, 200)}`);
      return false;
    }
  } catch (error: any) {
    console.error(`   ❌ Network error: ${error.message}`);
    return false;
  }
}

// Test 4: Signup endpoint (with test credentials - will fail if user exists, but tests connectivity)
async function testSignupEndpoint() {
  console.log('\n📡 Test 4: Signup endpoint connectivity...');
  const testEmail = `test-${Date.now()}@example.com`;
  try {
    const response = await fetch(`${CONTROL_PLANE_URL}/api/supabase/tenant-users/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        tenantId: TENANT_ID,
        projectId: PROJECT_ID,
        email: testEmail,
        password: 'TestPassword123!',
        full_name: 'Test User',
      }),
      signal: AbortSignal.timeout(15000),
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok || response.status === 400 || response.status === 409) {
      // Success, bad request, or conflict (user exists) are all OK for connectivity test
      console.log('   ✅ Endpoint is reachable (signup may have succeeded or returned expected error)');
      return true;
    } else {
      const text = await response.text();
      console.error(`   ⚠️  Unexpected status: ${text.substring(0, 200)}`);
      return false;
    }
  } catch (error: any) {
    console.error(`   ❌ Network error: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const results = {
    basicConnectivity: await testBasicConnectivity(),
    bootEndpoint: await testBootEndpoint(),
    ensureTable: await testEnsureTable(),
    signupEndpoint: await testSignupEndpoint(),
  };

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results Summary:');
  console.log('='.repeat(60));
  console.log(`  Basic Connectivity:    ${results.basicConnectivity ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Boot Endpoint:         ${results.bootEndpoint ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Ensure Table:          ${results.ensureTable ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Signup Endpoint:       ${results.signupEndpoint ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(60));

  const allPassed = Object.values(results).every(r => r);

  if (allPassed) {
    console.log('\n✅ All tests passed! Authentication system is properly configured.');
  } else {
    console.log('\n❌ Some tests failed. Common issues:');
    console.log('   - Control Plane server may be down or unreachable');
    console.log('   - CORS issues (if running from browser)');
    console.log('   - Network firewall blocking requests');
    console.log('   - Invalid tenant/project IDs');
    console.log('\nCheck the error messages above for specific details.');
  }
}

// Execute tests
runAllTests().catch((error) => {
  console.error('\n💥 Fatal error running tests:', error);
  process.exit(1);
});

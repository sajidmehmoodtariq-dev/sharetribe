// Test Authentication Flow
// Run this in the browser console when on http://localhost:3000

async function testHeadHunterSignup() {
  console.log('🧪 Testing Head Hunter Signup...');
  
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'Test123!@#',
    fullName: 'Test Head Hunter',
    mobileNumber: '0400000000',
    role: 'head-hunter',
    selectedGoal: 'find-workers',
    subscriptionPackage: {
      id: 'user-plus',
      name: 'User +',
      price: 8,
      benefits: ['benefit 1', 'benefit 2', 'benefit 3', 'benefit 4']
    }
  };

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Signup successful!');
      console.log('User:', data.user);
      return testUser;
    } else {
      console.error('❌ Signup failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

async function testLogin(email, password) {
  console.log('🧪 Testing Login...');
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('User:', data.user);
      return true;
    } else {
      console.error('❌ Login failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

async function testGetMe() {
  console.log('🧪 Testing Get Current User...');
  
  try {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ User data retrieved!');
      console.log('User:', data.user);
      return data.user;
    } else {
      console.error('❌ Failed to get user:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

async function testLogout() {
  console.log('🧪 Testing Logout...');
  
  try {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Logout successful!');
      return true;
    } else {
      console.error('❌ Logout failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Run full test suite
async function runFullTest() {
  console.log('🚀 Starting Full Authentication Test Suite\n');
  
  // Test 1: Signup
  const testUser = await testHeadHunterSignup();
  if (!testUser) {
    console.error('❌ Test suite failed at signup');
    return;
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Get current user (should work since we just signed up)
  const currentUser = await testGetMe();
  if (!currentUser) {
    console.error('❌ Test suite failed at getting current user');
    return;
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Logout
  const logoutSuccess = await testLogout();
  if (!logoutSuccess) {
    console.error('❌ Test suite failed at logout');
    return;
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 4: Login with same credentials
  const loginSuccess = await testLogin(testUser.email, testUser.password);
  if (!loginSuccess) {
    console.error('❌ Test suite failed at login');
    return;
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 5: Get current user again
  const currentUser2 = await testGetMe();
  if (!currentUser2) {
    console.error('❌ Test suite failed at second get current user');
    return;
  }
  
  console.log('\n✅ ALL TESTS PASSED! 🎉');
  console.log('\nTest User Credentials:');
  console.log('Email:', testUser.email);
  console.log('Password:', testUser.password);
}

// Export for use
window.testAuth = {
  runFullTest,
  testHeadHunterSignup,
  testLogin,
  testGetMe,
  testLogout
};

console.log('Authentication test suite loaded!');
console.log('Run: testAuth.runFullTest() to test everything');
console.log('Or run individual tests like: testAuth.testHeadHunterSignup()');

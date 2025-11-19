'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, isError = false) => {
    setResults(prev => [...prev, { message, isError, timestamp: new Date().toISOString() }]);
  };

  const testSignup = async () => {
    setLoading(true);
    addResult('🧪 Testing Employer Signup (with subscription)...');

    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: 'Test123!@#',
      fullName: 'Test Employer',
      mobileNumber: '0400000000',
      role: 'employer',
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
        addResult(`✅ Signup successful! User: ${data.user.email}`);
        sessionStorage.setItem('testUser', JSON.stringify({ email: testUser.email, password: testUser.password }));
        return testUser;
      } else {
        addResult(`❌ Signup failed: ${data.error}`, true);
        return null;
      }
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, true);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const testEmployerSignup = async () => {
    setLoading(true);
    addResult('🧪 Testing Employer Signup...');

    const testEmployer = {
      email: `employer${Date.now()}@example.com`,
      password: 'Test123!@#',
      fullName: 'Test Employer',
      mobileNumber: '0411111111',
      role: 'employer',
      selectedGoal: 'find-workers',
      dateOfBirth: '1990-01-01',
      address: '123 Business St, Sydney, NSW, 2000',
      showEmailOnProfile: true,
      showMobileOnProfile: false,
      businessName: 'Test Company Pty Ltd',
      country: 'Australia',
      businessAddress: '123 Business St, Sydney, NSW, 2000',
      industry: 'construction',
      businessSize: '11-50',
      yourRole: 'owner',
      website: 'https://testcompany.com.au',
      abn: '12345678901',
      businessSummary: 'We are a leading construction company with over 10 years of experience.',
    };

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testEmployer)
      });

      const data = await response.json();

      if (response.ok) {
        addResult(`✅ Employer signup successful! User: ${data.user.email}`);
        sessionStorage.setItem('testUser', JSON.stringify({ email: testEmployer.email, password: testEmployer.password }));
        return testEmployer;
      } else {
        addResult(`❌ Employer signup failed: ${data.error}`, true);
        return null;
      }
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, true);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const testEmployeeSignup = async () => {
    setLoading(true);
    addResult('🧪 Testing Employee Signup...');

    const testEmployee = {
      email: `employee${Date.now()}@example.com`,
      password: 'Test123!@#',
      fullName: 'Test Employee',
      mobileNumber: '0422222222',
      role: 'employee',
      selectedGoal: 'find-work',
      dateOfBirth: '1995-05-15',
      address: '456 Worker Ave, Melbourne, VIC, 3000',
      personalSummary: 'Experienced tradesperson looking for new opportunities.',
      showEmailOnProfile: true,
      showMobileOnProfile: true,
    };

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testEmployee)
      });

      const data = await response.json();

      if (response.ok) {
        addResult(`✅ Employee signup successful! User: ${data.user.email}`);
        sessionStorage.setItem('testUser', JSON.stringify({ email: testEmployee.email, password: testEmployee.password }));
        return testEmployee;
      } else {
        addResult(`❌ Employee signup failed: ${data.error}`, true);
        return null;
      }
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, true);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    addResult('🧪 Testing Login...');

    const testUser = JSON.parse(sessionStorage.getItem('testUser') || '{}');
    
    if (!testUser.email) {
      addResult('❌ No test user found. Run signup first!', true);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email, password: testUser.password })
      });

      const data = await response.json();

      if (response.ok) {
        addResult(`✅ Login successful! User: ${data.user.email}`);
      } else {
        addResult(`❌ Login failed: ${data.error}`, true);
      }
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  const testGetMe = async () => {
    setLoading(true);
    addResult('🧪 Testing Get Current User...');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        addResult(`✅ User data retrieved! User: ${data.user.email}, Role: ${data.user.role}`);
        console.log('Full user data:', data.user);
      } else {
        addResult(`❌ Failed to get user: ${data.error}`, true);
      }
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    setLoading(true);
    addResult('🧪 Testing Logout...');

    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await response.json();

      if (response.ok) {
        addResult('✅ Logout successful!');
      } else {
        addResult(`❌ Logout failed: ${data.error}`, true);
      }
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  const runFullTest = async () => {
    setResults([]);
    addResult('🚀 Starting Full Authentication Test Suite');

    await testSignup();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testGetMe();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testLogout();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testLogin();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testGetMe();
    
    addResult('✅ ALL TESTS COMPLETED!');
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-3xl font-bold mb-8">Authentication Test Suite</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Button 
            onClick={testSignup} 
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Test Employer (Simple)
          </Button>
          <Button 
            onClick={testEmployerSignup} 
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600"
          >
            Test Employer (Full)
          </Button>
          <Button 
            onClick={testEmployeeSignup} 
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-600"
          >
            Test Employee
          </Button>
          <Button 
            onClick={testLogin} 
            disabled={loading}
            className="bg-green-500 hover:bg-green-600"
          >
            Test Login
          </Button>
          <Button 
            onClick={testGetMe} 
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600"
          >
            Test Get User
          </Button>
          <Button 
            onClick={testLogout} 
            disabled={loading}
            className="bg-red-500 hover:bg-red-600"
          >
            Test Logout
          </Button>
          <Button 
            onClick={runFullTest} 
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-black col-span-2 md:col-span-3"
          >
            Run Full Test Suite
          </Button>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-xl font-semibold">Test Results</h2>
            <Button 
              onClick={() => setResults([])} 
              variant="outline"
              size="sm"
              className="border-zinc-700 text-white hover:bg-zinc-800"
            >
              Clear
            </Button>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-zinc-500 text-sm">No tests run yet. Click a button above to start testing.</p>
            ) : (
              results.map((result, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded text-sm font-mono ${
                    result.isError 
                      ? 'bg-red-500/10 text-red-400' 
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {result.message}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <h2 className="text-white text-xl font-semibold mb-4">Instructions</h2>
          <ol className="text-zinc-400 space-y-2 text-sm">
            <li>1. Make sure MongoDB is running (you're using Atlas)</li>
            <li>2. Test individual roles:
              <ul className="ml-4 mt-1 space-y-1">
                <li>• <strong className="text-blue-500">Employer (Simple)</strong>: Quick signup with subscription</li>
                <li>• <strong className="text-indigo-500">Employer (Full)</strong>: Complete business profile</li>
                <li>• <strong className="text-cyan-500">Employee</strong>: Job seeker profile</li>
              </ul>
            </li>
            <li>3. Click "Run Full Test Suite" to test everything automatically</li>
            <li>4. Or click individual test buttons to test specific features</li>
            <li>5. Check the results above and browser console for detailed logs</li>
            <li>6. Check MongoDB Atlas to verify data is being saved correctly</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

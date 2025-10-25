'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function BusinessSummaryPage() {
  const router = useRouter();
  const [businessSummary, setBusinessSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load existing data on mount
  useEffect(() => {
    const existingData = sessionStorage.getItem('employerData');
    if (existingData) {
      const parsedData = JSON.parse(existingData);
      if (parsedData.businessSummary) {
        setBusinessSummary(parsedData.businessSummary);
      }
    }
  }, []);

  const handleContinue = async () => {
    setLoading(true);
    setError('');

    try {
      // Get all employer data
      const employerData = JSON.parse(sessionStorage.getItem('employerData') || '{}');
      const signupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');
      const selectedGoal = sessionStorage.getItem('selectedGoal');

      console.log('Creating employer account...');

      // Create account with all data
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Basic auth info
          email: signupData.email,
          password: signupData.password,
          fullName: employerData.fullName || signupData.fullName,
          mobileNumber: employerData.mobileNumber || signupData.mobileNumber,
          role: 'employer',
          selectedGoal: selectedGoal,
          
          // Personal details
          dateOfBirth: employerData.dateOfBirth,
          address: employerData.address,
          showEmailOnProfile: employerData.showEmailOnProfile,
          showMobileOnProfile: employerData.showMobileOnProfile,
          
          // Business details
          businessName: employerData.businessName,
          country: employerData.country,
          businessAddress: employerData.businessAddress,
          industry: employerData.industry,
          businessSize: employerData.businessSize,
          yourRole: employerData.yourRole,
          website: employerData.website,
          abn: employerData.abn,
          businessSummary: businessSummary,
        }),
      });

      const data = await response.json();
      console.log('Signup response:', data);

      if (!response.ok) {
        // If user already exists, that's okay - they might have clicked back
        if (data.error === 'User already exists') {
          console.log('User already exists, redirecting to login...');
          alert('Account already exists. Please log in.');
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Signup failed');
      }

      // Clear session storage
      sessionStorage.removeItem('signupData');
      sessionStorage.removeItem('selectedGoal');
      sessionStorage.removeItem('employerData');
      sessionStorage.removeItem('userRole');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error creating account:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <svg className="w-16 h-16 text-white" viewBox="0 0 100 100" fill="currentColor">
              <text x="10" y="70" fontSize="80" fontFamily="Arial" fontWeight="bold">|||</text>
            </svg>
          </div>
          <div className="text-white text-sm font-light tracking-wider">HEAD HUNTD</div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8 space-x-3">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-sm mb-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-green-500 text-xs text-center">Personal<br/>Details</span>
          </div>
          <div className="w-8 h-0.5 bg-green-500 mb-6"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-sm mb-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-green-500 text-xs text-center">Business<br/>Details</span>
          </div>
          <div className="w-8 h-0.5 bg-green-500 mb-6"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-sm mb-1">
              3
            </div>
            <span className="text-green-500 text-xs text-center">Business<br/>Summary</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-700 mb-6"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold text-sm mb-1">
              4
            </div>
            <span className="text-gray-400 text-xs text-center">Availability</span>
          </div>
        </div>

        {/* Business Summary Form */}
        <div className="mb-6">
          <h2 className="text-white text-2xl font-bold mb-2">Business Summary</h2>
          <p className="text-gray-400 text-sm mb-6">
            Add a summary/description of your business to introduce who you are
          </p>

          <div>
            <Label htmlFor="businessSummary" className="text-white text-sm mb-2 block">
              Business Summary
            </Label>
            <Textarea
              id="businessSummary"
              placeholder="I am a concrete builder with 3 years of experience, skilled in formwork and foundations and certified in MR Class..."
              value={businessSummary}
              onChange={(e) => setBusinessSummary(e.target.value)}
              rows={6}
              maxLength={500}
              className="bg-transparent border border-gray-700 text-white rounded-2xl px-4 py-3 resize-none"
            />
            <p className="text-gray-500 text-xs mt-1 text-right">
              {businessSummary.length}/500
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-500 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={loading || !businessSummary.trim()}
          className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold rounded-full py-6 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : (
            <>Continue to <span className="ml-1 text-green-700">Availability →</span></>
          )}
        </Button>
      </div>
    </div>
  );
}

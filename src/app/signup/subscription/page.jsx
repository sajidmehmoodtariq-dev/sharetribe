'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function SubscriptionPage() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState(null);

  const packages = [
    {
      id: 'user-plus',
      name: 'User +',
      price: 8,
      description: '*plan description here',
      benefits: [
        '(subscription benefit)',
        '(subscription benefit)',
        '(subscription benefit)',
        '(subscription benefit)',
      ],
    },
    // Add more packages as needed
  ];

  const handleGetStarted = async () => {
    if (!selectedPackage) {
      alert('Please select a subscription package');
      return;
    }

    try {
      // Get signup data from session storage
      const signupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');
      const selectedGoal = sessionStorage.getItem('selectedGoal');

      // Create account with subscription
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
          fullName: signupData.fullName,
          mobileNumber: signupData.mobileNumber || '',
          role: 'employer',
          selectedGoal: selectedGoal,
          subscriptionPackage: selectedPackage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Clear session storage
      sessionStorage.removeItem('signupData');
      sessionStorage.removeItem('selectedGoal');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 100 100" className="text-white">
              <text x="50" y="60" fontSize="60" fill="currentColor" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                HH
              </text>
            </svg>
          </div>
          <h1 className="text-white text-sm mt-2">Head Huntd</h1>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
          <h2 className="text-white text-2xl font-semibold mb-2 text-center">
            Choose Your<br />Subscription Package
          </h2>
          <p className="text-zinc-400 text-sm mb-6 text-center">
            Choose a plan that works best for you
          </p>

          <div className="space-y-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`
                  border-2 rounded-lg p-6 cursor-pointer transition-all
                  ${selectedPackage?.id === pkg.id 
                    ? 'border-emerald-500 bg-emerald-500/5' 
                    : 'border-zinc-700 hover:border-zinc-600'
                  }
                `}
              >
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-emerald-500 text-2xl font-bold">{pkg.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-emerald-500 text-4xl font-bold">${pkg.price}</span>
                    <span className="text-zinc-400 text-sm ml-2">per month</span>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm mb-4">{pkg.description}</p>

                <ul className="space-y-2">
                  {pkg.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-white text-sm">
                      <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>

                {selectedPackage?.id === pkg.id && (
                  <Button
                    onClick={handleGetStarted}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold h-12 mt-6"
                  >
                    Get started
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="text-emerald-500 hover:text-emerald-400 hover:bg-transparent"
            >
              Continue to Payment →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

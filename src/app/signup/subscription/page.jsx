'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';

export default function SubscriptionPage() {
  const { getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName } = useTheme();
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState(null);

  const packages = [
    {
      id: 'user-plus',
      name: 'User +',
      price: 8,
      description: 'Perfect for small businesses just getting started',
      benefits: [
        'Post unlimited job listings',
        'Access to verified candidates',
        'Basic analytics and reporting',
        '24/7 customer support',
        'Mobile app access',
      ],
    },
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

  const handleSkip = () => {
    // Navigate to personal details onboarding instead of creating account immediately
    router.push('/onboarding/personal-details');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={getBackgroundStyle()}
    >
      <div className="w-full max-w-[375px] mx-auto h-screen flex flex-col">
        {/* Logo at top */}
        <div className="flex justify-center pt-8 pb-6">
          <Image
            src="/logo.png"
            alt="Head Huntd Logo"
            width={60}
            height={60}
            className="object-contain"
            priority
          />
        </div>

        {/* Form Card */}
        <div className="flex-1 mx-4">
          <div className={`${getCardClassName()} rounded-3xl px-8 py-10 h-full shadow-sm`}>
            <h2 className={`text-[22px] font-bold ${getTextClassName()} mb-4 leading-tight text-center`}>
              Choose Your<br />Subscription Package
            </h2>
            <p className={`text-[13px] ${getSubTextClassName()} mb-8 text-center`}>
              Choose a subscription best for you
            </p>

            {/* Subscription Plans */}
            <div className="mb-8">
              {packages.map((pkg) => (
                <div 
                  key={pkg.id}
                  className={`border-2 rounded-3xl p-6 cursor-pointer transition-all ${
                    selectedPackage?.id === pkg.id 
                      ? 'border-[#00EA72] bg-[#00EA72]/10' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className={`text-[20px] font-bold ${getTextClassName()} mb-2`}>
                      {pkg.name}
                    </h3>
                    <div className="flex items-baseline justify-center">
                      <span className="text-[32px] font-bold text-[#00EA72]">
                        ${pkg.price}
                      </span>
                      <span className={`text-[14px] ${getSubTextClassName()} ml-2`}>
                        per month
                      </span>
                    </div>
                    <p className={`text-[13px] ${getSubTextClassName()} mt-2`}>
                      {pkg.description}
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3 mb-6">
                    {pkg.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-[#00EA72] rounded-full flex items-center justify-center flex-shrink-0">
                          <svg 
                            className="w-3 h-3 text-white" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={3} 
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className={`text-[13px] ${getTextClassName()}`}>
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Get Started Button */}
                  <Button
                    className="w-full h-12 bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium text-[15px] rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPackage(pkg);
                      handleGetStarted();
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              ))}
            </div>

            {/* Skip Button */}
            <Button
              onClick={handleSkip}
              variant="ghost"
              className={`w-full h-12 rounded-full font-medium text-[15px] ${getSubTextClassName()} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
            >
              I'll decide later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

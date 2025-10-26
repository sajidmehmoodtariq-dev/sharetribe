'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';

export default function RoleSelectionPage() {
  const { getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName } = useTheme();
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState('');

  const handleContinue = () => {
    if (!selectedGoal) {
      alert('Please select an option');
      return;
    }

    // Store selection
    sessionStorage.setItem('selectedGoal', selectedGoal);

    // Set user role based on selection
    if (selectedGoal === 'find-work') {
      sessionStorage.setItem('userRole', 'employee');
    } else {
      sessionStorage.setItem('userRole', 'employer');
    }

    // All selections now go to subscription page
    router.push('/signup/subscription');
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
            <h2 className={`text-[22px] font-bold ${getTextClassName()} mb-4 leading-tight`}>
              What are you looking for?
            </h2>
            <p className={`text-[13px] ${getSubTextClassName()} mb-8`}>
              Select an option below
            </p>

            <div className="space-y-6">
              <div 
                className={`flex items-start space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedGoal === 'find-work' 
                    ? 'border-[#00EA72] bg-[#00EA72]/10' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedGoal('find-work')}
              >
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                  selectedGoal === 'find-work' 
                    ? 'border-[#00EA72] bg-[#00EA72]' 
                    : 'border-gray-400'
                }`}>
                  {selectedGoal === 'find-work' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <Label className={`text-[15px] font-semibold ${getTextClassName()} cursor-pointer block mb-1`}>
                    Find Work
                  </Label>
                  <p className={`text-[13px] ${getSubTextClassName()}`}>
                    Browse job listings that match your skills and interests
                  </p>
                </div>
              </div>

              <div 
                className={`flex items-start space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedGoal === 'find-workers' 
                    ? 'border-[#00EA72] bg-[#00EA72]/10' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedGoal('find-workers')}
              >
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                  selectedGoal === 'find-workers' 
                    ? 'border-[#00EA72] bg-[#00EA72]' 
                    : 'border-gray-400'
                }`}>
                  {selectedGoal === 'find-workers' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <Label className={`text-[15px] font-semibold ${getTextClassName()} cursor-pointer block mb-1`}>
                    Find Workers
                  </Label>
                  <p className={`text-[13px] ${getSubTextClassName()}`}>
                    Post jobs and connect with qualified candidates
                  </p>
                </div>
              </div>

              <div 
                className={`flex items-start space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedGoal === 'search-companies' 
                    ? 'border-[#00EA72] bg-[#00EA72]/10' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedGoal('search-companies')}
              >
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                  selectedGoal === 'search-companies' 
                    ? 'border-[#00EA72] bg-[#00EA72]' 
                    : 'border-gray-400'
                }`}>
                  {selectedGoal === 'search-companies' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <Label className={`text-[15px] font-semibold ${getTextClassName()} cursor-pointer block mb-1`}>
                    Search Companies
                  </Label>
                  <p className={`text-[13px] ${getSubTextClassName()}`}>
                    Explore company profiles, jobs and reviews
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button
                onClick={handleContinue}
                disabled={!selectedGoal}
                className={`w-full h-12 text-[15px] font-medium rounded-full transition-colors ${
                  selectedGoal 
                    ? 'bg-[#00EA72] hover:bg-[#00D66C] text-black' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue to Choose Subscription  →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState('');

  const handleContinue = () => {
    if (!selectedGoal) {
      alert('Please select an option');
      return;
    }

    // Store selection
    sessionStorage.setItem('selectedGoal', selectedGoal);

    // Route based on selection
    if (selectedGoal === 'find-work') {
      // Employee flow - goes to personal details then job-specific pages
      sessionStorage.setItem('userRole', 'employee');
      router.push('/employee/personal-details');
    } else if (selectedGoal === 'find-workers') {
      // Employer flow - goes to personal details then business pages
      sessionStorage.setItem('userRole', 'employer');
      router.push('/employer/personal-details');
    } else {
      // Search companies - simple signup with subscription
      sessionStorage.setItem('userRole', 'employer');
      router.push('/signup/subscription');
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
          <h2 className="text-white text-2xl font-semibold mb-2">What are you looking for?</h2>
          <p className="text-zinc-400 text-sm mb-6">Select an option below</p>

          <RadioGroup value={selectedGoal} onValueChange={setSelectedGoal} className="space-y-4">
            <div className="flex items-start space-x-3 group cursor-pointer">
              <RadioGroupItem 
                value="find-work" 
                id="find-work"
                className="border-zinc-700 text-emerald-500 mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="find-work" className="text-white font-medium cursor-pointer group-hover:text-emerald-500 transition-colors">
                  Find Work
                </Label>
                <p className="text-zinc-400 text-sm mt-1">
                  Browse job listings that match your skills and interests
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 group cursor-pointer">
              <RadioGroupItem 
                value="find-workers" 
                id="find-workers"
                className="border-zinc-700 text-emerald-500 mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="find-workers" className="text-white font-medium cursor-pointer group-hover:text-emerald-500 transition-colors">
                  Find Workers
                </Label>
                <p className="text-zinc-400 text-sm mt-1">
                  Post jobs and connect with qualified candidates
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 group cursor-pointer">
              <RadioGroupItem 
                value="search-companies" 
                id="search-companies"
                className="border-zinc-700 text-emerald-500 mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="search-companies" className="text-white font-medium cursor-pointer group-hover:text-emerald-500 transition-colors">
                  Search Companies
                </Label>
                <p className="text-zinc-400 text-sm mt-1">
                  Explore company profiles, jobs and reviews
                </p>
              </div>
            </div>
          </RadioGroup>

          <div className="mt-8">
            <Button
              onClick={handleContinue}
              className="w-full bg-transparent hover:bg-zinc-800 text-emerald-500 border border-emerald-500 font-semibold h-12"
            >
              Continue to <span className="ml-1">Choose Subscription Package →</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

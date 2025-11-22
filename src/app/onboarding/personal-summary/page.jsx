'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';

export default function PersonalSummaryPage() {
  const { theme, getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName } = useTheme();
  const router = useRouter();
  const [personalSummary, setPersonalSummary] = useState('');

  const handleContinue = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        router.push('/login');
        return;
      }

      // Update user profile with personal summary
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/onboarding/personal-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ personalSummary }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save personal summary');
      }

      // Navigate to skills/work experience
      router.push('/onboarding/work-experience');
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      {/* Fixed Background */}
      <div 
        className="fixed inset-0 w-full h-full z-0"
        style={getBackgroundStyle()}
      />
      
      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-[375px] mx-auto h-screen flex flex-col">
          {/* Logo at top */}
          <div className="flex justify-center pt-8 pb-6">
            <Image
              src={theme === 'dark' ? '/logo-light.png' : '/logo-dark.png'}
              alt="Head Huntd Logo"
              width={60}
              height={60}
              className="object-contain"
              priority
            />
          </div>

          {/* Progress Steps */}
          <div className="px-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              {[1, 2, 3, 4].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                    step <= 2 
                      ? 'bg-[#00EA72] text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {index < 3 && (
                    <div className={`w-8 h-0.5 mx-1 ${
                      step < 2 ? 'bg-[#00EA72]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs px-2">
              <span className={`${getSubTextClassName()} text-center`}>Personal<br />Details</span>
              <span className={`${getTextClassName()} font-medium text-center`}>Personal<br />Summary</span>
              <span className={`${getSubTextClassName()} text-center`}>Skills</span>
              <span className={`${getSubTextClassName()} text-center`}>Availability</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="flex-1 mx-4 mb-4">
            <div className={`${getCardClassName()} rounded-3xl px-8 py-8 h-full shadow-sm overflow-y-auto`}>
              <h2 className={`text-[22px] font-bold ${getTextClassName()} mb-8`}>
                Personal Details
              </h2>

              <div className="mb-8">
                <h3 className={`text-[18px] font-semibold ${getTextClassName()} mb-4`}>
                  Personal Summary
                </h3>
                <p className={`text-[13px] ${getSubTextClassName()} mb-4`}>
                  Add a personal summary / description to your profile to introduce who you are
                </p>
                
                <Textarea
                  value={personalSummary}
                  onChange={(e) => setPersonalSummary(e.target.value)}
                  placeholder="I am a concrete builder with 3 years of experience, skilled in formwork and foundations and certified in MR Class..."
                  className="min-h-[120px] rounded-xl border-gray-300 text-[15px] resize-none"
                />
              </div>

              {/* Continue Button */}
              <div className="mt-8">
                <Button
                  onClick={handleContinue}
                  className="w-full h-12 bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium text-[15px] rounded-full"
                >
                  Continue to Work Experience →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';

export default function AvailabilityPage() {
  const { theme, getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName } = useTheme();
  const router = useRouter();
  const [availability, setAvailability] = useState({
    morning: false,
    afternoon: false,
    evening: false
  });
  const [startDate, setStartDate] = useState('');
  const [noticePreference, setNoticePreference] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAvailabilityChange = (timeSlot) => {
    setAvailability(prev => ({
      ...prev,
      [timeSlot]: !prev[timeSlot]
    }));
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        router.push('/login');
        return;
      }

      // Update user profile with availability
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/onboarding/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          availability,
          startDate,
          noticePreference
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save availability');
      }

      // Clear any remaining session storage
      sessionStorage.clear();

      // Clear payment banner flag since user has completed onboarding and paid
      localStorage.removeItem('showPaymentBanner');
      
      // Redirect to home page with success flag to refresh subscription status
      router.push('/home?onboarding=complete');
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
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
                    step <= 4 
                      ? 'bg-[#00EA72] text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {index < 3 && (
                    <div className={`w-8 h-0.5 mx-1 ${
                      step < 4 ? 'bg-[#00EA72]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs px-2">
              <span className={`${getSubTextClassName()} text-center`}>Personal<br />Details</span>
              <span className={`${getSubTextClassName()} text-center`}>Personal<br />Summary</span>
              <span className={`${getSubTextClassName()} text-center`}>Skills</span>
              <span className={`${getTextClassName()} font-medium text-center`}>Availability</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="flex-1 mx-4 mb-4">
            <div className={`${getCardClassName()} rounded-3xl px-8 py-8 h-full shadow-sm overflow-y-auto`}>
              <h2 className={`text-[22px] font-bold ${getTextClassName()} mb-8`}>
                Availability
              </h2>

              {/* Work Availability Section */}
              <div className="mb-8">
                <h3 className={`text-[16px] font-semibold ${getTextClassName()} mb-4`}>
                  Work Availability
                </h3>
                <p className={`text-[13px] ${getSubTextClassName()} mb-4`}>
                  Tell us when you are available to work. Select an available time to work. You may select more than one.
                </p>
                
                {/* Time Slots */}
                <div className="flex space-x-3 mb-6">
                  {[
                    { key: 'morning', label: 'Morning' },
                    { key: 'afternoon', label: 'Afternoon' },
                    { key: 'evening', label: 'Evening' }
                  ].map((timeSlot) => (
                    <button
                      key={timeSlot.key}
                      onClick={() => handleAvailabilityChange(timeSlot.key)}
                      className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                        availability[timeSlot.key]
                          ? 'bg-[#00EA72] text-black'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {timeSlot.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Date Selection */}
              <div className="mb-8">
                <h3 className={`text-[16px] font-semibold ${getTextClassName()} mb-2`}>
                  Select your available start date to work*
                </h3>
                
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full h-12 rounded-xl border-gray-300 dark:border-gray-600 text-[15px] ${getTextClassName()} dark:bg-gray-800`}
                />
              </div>

              {/* Notice Period */}
              <div className="mb-8">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'immediately', label: 'Immediately' },
                    { value: 'any-other', label: 'Any / Other' },
                    { value: '1-week', label: '1 Week Notice' },
                    { value: '2-weeks', label: '2 Weeks Notice' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={option.value}
                        name="noticePreference"
                        value={option.value}
                        checked={noticePreference === option.value}
                        onChange={(e) => setNoticePreference(e.target.value)}
                        className="w-4 h-4 text-[#00EA72] border-gray-300 focus:ring-[#00EA72]"
                      />
                      <label 
                        htmlFor={option.value} 
                        className={`text-[13px] ${getTextClassName()} cursor-pointer`}
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8">
                <Button
                  onClick={handleFinish}
                  disabled={isSaving}
                  className="w-full h-12 bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium text-[15px] rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving && (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
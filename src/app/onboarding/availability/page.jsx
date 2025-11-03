'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';

export default function AvailabilityPage() {
  const { getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName } = useTheme();
  const router = useRouter();
  const [availability, setAvailability] = useState({
    morning: false,
    afternoon: false,
    evening: false
  });
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [noticePreference, setNoticePreference] = useState('');

  const handleAvailabilityChange = (timeSlot) => {
    setAvailability(prev => ({
      ...prev,
      [timeSlot]: !prev[timeSlot]
    }));
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFinish = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        router.push('/login');
        return;
      }

      // Update user profile with availability
      const response = await fetch('http://localhost:5000/api/user/onboarding/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          availability,
          dateRange,
          noticePreference
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save availability');
      }

      // Clear any remaining session storage
      sessionStorage.clear();

      alert('Profile completed successfully!');
      
      // Redirect to home page
      router.push('/home');
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
              src="/logo.png"
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
                          ? 'bg-[#00EA72] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {timeSlot.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range Selection */}
              <div className="mb-8">
                <h3 className={`text-[16px] font-semibold ${getTextClassName()} mb-2`}>
                  Select your available start and end date to work*
                </h3>
                
                <div className="flex space-x-3 mb-4">
                  <Input
                    name="from"
                    type="date"
                    value={dateRange.from}
                    onChange={handleDateRangeChange}
                    className="flex-1 h-12 rounded-xl border-gray-300 text-[15px]"
                  />
                  <span className={`flex items-center text-[15px] ${getTextClassName()}`}>-</span>
                  <Input
                    name="to"
                    type="date"
                    value={dateRange.to}
                    onChange={handleDateRangeChange}
                    className="flex-1 h-12 rounded-xl border-gray-300 text-[15px]"
                  />
                </div>
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
                  className="w-full h-12 bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium text-[15px] rounded-full"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
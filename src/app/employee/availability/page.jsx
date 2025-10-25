'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';

export default function AvailabilityPage() {
  const router = useRouter();
  const [step] = useState(4);
  const [formData, setFormData] = useState({
    timePreference: [],
    selectedDates: [],
    immediately: false,
    weekNotice: '',
  });
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem('employeeData') || '{}');
    if (data.availability) {
      setFormData(data.availability);
    }
  }, []);

  const handleFinish = async () => {
    try {
      const employeeData = JSON.parse(sessionStorage.getItem('employeeData') || '{}');
      const signupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');
      
      // Combine all the data
      const completeData = {
        ...employeeData,
        availability: formData,
        role: 'employee',
      };

      console.log('Creating employee account...');
      
      // Create account with the password from signupData
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupData.email || completeData.email,
          password: signupData.password,
          fullName: signupData.fullName || completeData.fullName,
          mobileNumber: signupData.mobileNumber || completeData.mobileNumber,
          role: 'employee',
          // Include all the profile data
          ...completeData,
        }),
      });

      const signupResult = await signupResponse.json();
      console.log('Signup response:', signupResult);

      if (!signupResponse.ok) {
        // If user already exists, that's okay - they might have clicked back
        if (signupResult.error === 'User already exists') {
          console.log('User already exists, redirecting to login...');
          alert('Account already exists. Please log in.');
          router.push('/login');
          return;
        }
        throw new Error(signupResult.error || 'Failed to create account');
      }

      // Clear session storage
      sessionStorage.removeItem('employeeData');
      sessionStorage.removeItem('signupData');

      // Redirect to search jobs
      router.push('/employee/search-jobs');
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Something went wrong. Please try again.');
    }
  };

  const toggleTimePreference = (time) => {
    if (formData.timePreference.includes(time)) {
      setFormData({
        ...formData,
        timePreference: formData.timePreference.filter(t => t !== time),
      });
    } else {
      setFormData({
        ...formData,
        timePreference: [...formData.timePreference, time],
      });
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

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 gap-4">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold
                ${step === num 
                  ? 'bg-emerald-500 text-black border-emerald-500' 
                  : step > num
                  ? 'bg-emerald-500 text-black border-emerald-500'
                  : 'bg-transparent text-zinc-400 border-zinc-700'
                }
              `}>
                {num}
              </div>
              {num < 4 && <div className="w-8 h-0.5 bg-zinc-700 mx-2" />}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
          <h2 className="text-white text-xl font-semibold mb-6">Work Availability</h2>

          <div className="space-y-6">
            {/* Tell us when you are available to work */}
            <div>
              <Label className="text-white text-sm mb-3 block">
                Tell us when you are available to work
              </Label>
              <p className="text-zinc-500 text-xs mb-3">
                Select an available time to work. You may select more than one
              </p>
              <div className="space-y-2">
                {['Morning', 'Afternoon', 'Evening'].map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox
                      id={time}
                      checked={formData.timePreference.includes(time)}
                      onCheckedChange={() => toggleTimePreference(time)}
                      className="border-zinc-700 data-[state=checked]:bg-emerald-500"
                    />
                    <label htmlFor={time} className="text-white text-sm">
                      {time}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Select your available start and end date to work */}
            <div>
              <Label className="text-white text-sm mb-3 block">
                Select your available start and end date to work*
              </Label>
              <p className="text-zinc-500 text-xs mb-3">
                Click the calendar symbol to open/close calendar
              </p>
              
              <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">August 2025</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-white">‹</Button>
                    <Button variant="ghost" size="sm" className="text-white">›</Button>
                  </div>
                </div>
                
                {/* Simple calendar grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className="text-zinc-400 text-xs p-2">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const dateStr = `2025-08-${day.toString().padStart(2, '0')}`;
                        const updatedDates = formData.selectedDates.includes(dateStr)
                          ? formData.selectedDates.filter(d => d !== dateStr)
                          : [...formData.selectedDates, dateStr];
                        setFormData({ ...formData, selectedDates: updatedDates });
                      }}
                      className={`
                        p-2 rounded text-sm
                        ${formData.selectedDates.includes(`2025-08-${day.toString().padStart(2, '0')}`)
                          ? 'bg-emerald-500 text-black font-semibold'
                          : 'text-white hover:bg-zinc-700'
                        }
                      `}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* When can you start */}
            <div>
              <Label className="text-white text-sm mb-3 block">
                When can you start
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="immediately"
                    checked={formData.immediately}
                    onCheckedChange={(checked) => setFormData({ ...formData, immediately: checked })}
                    className="border-zinc-700 data-[state=checked]:bg-emerald-500"
                  />
                  <label htmlFor="immediately" className="text-white text-sm">
                    Immediately
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notice"
                    className="border-zinc-700 data-[state=checked]:bg-emerald-500"
                  />
                  <label htmlFor="notice" className="text-white text-sm">
                    Any / Offer
                  </label>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  onClick={() => setFormData({ ...formData, weekNotice: '1 week' })}
                  variant="outline"
                  className={`border-zinc-700 ${formData.weekNotice === '1 week' ? 'bg-emerald-500 text-black border-emerald-500' : 'text-white hover:bg-zinc-800'}`}
                >
                  1 Week Notice
                </Button>
                <Button
                  type="button"
                  onClick={() => setFormData({ ...formData, weekNotice: '2 weeks' })}
                  variant="outline"
                  className={`border-zinc-700 ${formData.weekNotice === '2 weeks' ? 'bg-emerald-500 text-black border-emerald-500' : 'text-white hover:bg-zinc-800'}`}
                >
                  2 Weeks Notice
                </Button>
              </div>
            </div>

            <Button
              onClick={handleFinish}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold h-12"
            >
              Finish & Search Jobs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';

export default function PersonalSummaryPage() {
  const { theme, getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName } = useTheme();
  const router = useRouter();
  const [personalSummary, setPersonalSummary] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setUserRole(data.user.role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };
    fetchUserRole();
  }, []);

  const handleContinue = async () => {
    setIsSaving(true);
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

      // Check user role to determine next step
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        
        // If employer, skip work experience and availability - go straight to home
        if (userData.user.role === 'employer') {
          router.push('/home');
        } else {
          // Job seekers continue to work experience
          router.push('/onboarding/work-experience');
        }
      } else {
        // Fallback: go to work experience
        router.push('/onboarding/work-experience');
      }
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
              {userRole === 'employer' ? (
                // 2 steps for employers - centered with wider spacing
                <div className="flex items-center gap-12">
                  {[1, 2].map((step, index) => (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm ${
                        step <= 2 
                          ? 'bg-[#00EA72] text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step}
                      </div>
                      <span className={`mt-2 text-xs font-medium ${
                        step === 2 ? getTextClassName() : getSubTextClassName()
                      } text-center whitespace-nowrap`}>
                        {step === 1 ? 'Personal Details' : 'Personal Summary'}
                      </span>
                    </div>
                  ))}
                  <div className="absolute w-24 h-0.5 bg-[#00EA72]" style={{marginTop: '-28px'}} />
                </div>
              ) : (
                // 4 steps for job seekers
                [1, 2, 3, 4].map((step, index) => (
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
                ))
              )}
            </div>
            {userRole !== 'employer' && (
              <div className="flex justify-between text-xs px-2">
                <span className={`${getSubTextClassName()} text-center`}>Personal<br />Details</span>
                <span className={`${getTextClassName()} font-medium text-center`}>Personal<br />Summary</span>
                <span className={`${getSubTextClassName()} text-center`}>Skills</span>
                <span className={`${getSubTextClassName()} text-center`}>Availability</span>
              </div>
            )}
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
                  className={`min-h-[120px] rounded-xl border-gray-300 dark:border-gray-600 text-[15px] resize-none ${getTextClassName()} dark:bg-gray-800 placeholder:text-gray-400`}
                />
              </div>

              {/* Continue Button */}
              <div className="mt-8">
                <Button
                  onClick={handleContinue}
                  disabled={isSaving}
                  className="w-full h-12 bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium text-[15px] rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving && (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isSaving ? 'Saving...' : (userRole === 'employer' ? 'Complete Profile →' : 'Continue to Work Experience →')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
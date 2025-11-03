'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';

export default function SignupSuccessPage() {
  const { getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      // No session ID, redirect to login
      router.push('/login');
      return;
    }

    // Clear any signup-related session storage
    sessionStorage.removeItem('signupData');
    sessionStorage.removeItem('selectedGoal');
    sessionStorage.removeItem('userRole');
  }, [router, searchParams]);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/onboarding/personal-details');
    }
  }, [countdown, router]);

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

        {/* Success Card */}
        <div className="flex-1 mx-4 flex items-center">
          <div className={`${getCardClassName()} rounded-3xl px-8 py-16 w-full shadow-sm text-center`}>
            {/* Success Icon */}
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 bg-[#00EA72] rounded-full flex items-center justify-center">
                <svg 
                  className="w-12 h-12 text-white" 
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
            </div>

            <h1 className={`text-[26px] font-bold ${getTextClassName()} mb-4`}>
              Successfully Registered!
            </h1>
            
            <p className={`text-[15px] ${getSubTextClassName()} mb-8`}>
              Your payment was successful and your account has been created.
            </p>

            <div className={`text-[14px] ${getSubTextClassName()} mb-6`}>
              Redirecting to onboarding in <span className="text-[#00EA72] font-bold text-[18px]">{countdown}</span> seconds...
            </div>

            <button
              onClick={() => router.push('/onboarding/personal-details')}
              className="text-[#00EA72] hover:text-[#00D66C] font-medium text-[15px] underline"
            >
              Continue now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

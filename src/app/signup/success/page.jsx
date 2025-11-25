'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';

export default function SignupSuccessPage() {
  const { theme, getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(3);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10; // Max 20 seconds of retrying

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      router.push('/login');
      return;
    }

    // Verify session and get auth token
    const verifyAndAuthenticate = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stripe/verify-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });

        const data = await response.json();

        if (response.ok && data.token) {
          // Store token
          localStorage.setItem('token', data.token);
          setIsAuthenticating(false);
        } else {
          console.error('Session verification failed:', data.error);
          // Wait a bit and retry (webhook might still be processing)
          if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
              verifyAndAuthenticate();
            }, 2000);
          } else {
            // Max retries reached, proceed anyway
            console.warn('Max retries reached, proceeding without token');
            setIsAuthenticating(false);
          }
        }
      } catch (error) {
        console.error('Error verifying session:', error);
        // Retry after delay
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            verifyAndAuthenticate();
          }, 2000);
        } else {
          // Max retries reached, proceed anyway
          console.warn('Max retries reached, proceeding without token');
          setIsAuthenticating(false);
        }
      }
    };

    verifyAndAuthenticate();
  }, [router, searchParams, retryCount, maxRetries]);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown <= 0 && !isAuthenticating) {
      router.push('/onboarding/personal-details');
    }
  }, [countdown, isAuthenticating, router]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={getBackgroundStyle()}
    >
      {isAuthenticating ? (
        <div className={`text-center ${getTextClassName()}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00EA72] mx-auto mb-4"></div>
          <p>Setting up your account...</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}

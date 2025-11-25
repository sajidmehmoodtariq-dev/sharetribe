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
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      router.push('/login');
      return;
    }

    // Verify session and get authentication token
    const verifyAndAuthenticate = async () => {
      try {
        console.log('Verifying session:', sessionId);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stripe/verify-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();
        console.log('Verification response:', data);

        if (!response.ok) {
          // If user not found, it might be webhook delay - retry after a few seconds
          if (data.error && data.error.includes('not found')) {
            console.log('User not found, retrying in 3 seconds...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Retry once
            const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stripe/verify-session`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ sessionId }),
            });
            
            const retryData = await retryResponse.json();
            console.log('Retry response:', retryData);
            
            if (!retryResponse.ok) {
              throw new Error(retryData.error || 'Failed to verify payment after retry');
            }
            
            localStorage.setItem('token', retryData.token);
            console.log('✅ Payment verified and user authenticated (retry)');
            setIsAuthenticating(false);
            return;
          }
          
          throw new Error(data.error || 'Failed to verify payment');
        }

        // Store the token in localStorage
        localStorage.setItem('token', data.token);
        
        console.log('✅ Payment verified and user authenticated');
        setIsAuthenticating(false);
      } catch (err) {
        console.error('Session verification error:', err);
        setError(err.message || 'Failed to verify payment. Please contact support.');
        setIsAuthenticating(false);
      }
    };

    verifyAndAuthenticate();
  }, [router, searchParams]);

  useEffect(() => {
    // Countdown timer - stop at 0
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [countdown]);

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
          <p>Verifying your payment...</p>
        </div>
      ) : error ? (
        <div className="w-full max-w-[375px] mx-auto px-4">
          <div className={`${getCardClassName()} rounded-3xl px-8 py-16 shadow-sm text-center`}>
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h1 className={`text-[26px] font-bold ${getTextClassName()} mb-4`}>
              Verification Failed
            </h1>
            <p className={`text-[15px] ${getSubTextClassName()} mb-8`}>
              {error}
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full h-12 bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium text-[15px] rounded-full"
            >
              Go to Login
            </button>
          </div>
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
              {countdown > 0 ? (
                <>Redirecting to onboarding in <span className="text-[#00EA72] font-bold text-[18px]">{countdown}</span> seconds...</>
              ) : (
                <>Redirecting...</>
              )}
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

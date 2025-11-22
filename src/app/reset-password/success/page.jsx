'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';

export default function PasswordUpdatedPage() {
  const { theme, getBackgroundStyle, getCardClassName, getTextClassName } = useTheme();
  const router = useRouter();

  // Auto redirect after 3 seconds (optional)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Uncomment if you want auto redirect
      // router.push('/login/role-selection');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleLoginRedirect = () => {
    router.push('/login/role-selection');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: 'url(/bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
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

        {/* White Form Card */}
        <div className="flex-1 mx-4">
          <div className="bg-white rounded-3xl px-8 py-10 h-full shadow-sm">
            {/* Success Content */}
            <div className="text-center mb-8">
              <h1 className="text-[22px] font-bold text-black leading-tight mb-4">
                Password Updated
              </h1>
              <p className="text-[13px] text-[#464646] leading-relaxed mb-8">
                Your password was successfully updated
              </p>

              {/* Success Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-12 h-12 bg-[#00EA72] rounded-full flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-white" 
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

              {/* Login Button */}
              <Button
                onClick={handleLoginRedirect}
                className="w-full h-12 bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium text-[15px] rounded-full transition-colors"
              >
                Log in to your account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
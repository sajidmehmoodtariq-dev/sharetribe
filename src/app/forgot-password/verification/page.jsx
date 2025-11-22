'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';

export default function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { theme, getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName } = useTheme();
  
  const [code, setCode] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!email) {
      router.push('/forgot-password');
    }
  }, [email, router]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 4) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 5) {
      setError('Please enter all 5 digits');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const resetToken = sessionStorage.getItem('resetToken');
      
      if (!resetToken) {
        setError('Session expired. Please request a new verification code.');
        router.push('/forgot-password');
        return;
      }

      // Verify the code
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
          resetToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      // Store the verified code for password reset
      sessionStorage.setItem('verifiedCode', verificationCode);
      
      // Redirect to reset password page
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      // Update reset token
      if (data.resetToken) {
        sessionStorage.setItem('resetToken', data.resetToken);
      }
      
      // Clear current code
      setCode(['', '', '', '', '']);
      
      // Show success message (you can add a success state if needed)
      alert('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={getBackgroundStyle()}
    >
      <div className="w-full max-w-[95%] sm:max-w-md mx-auto min-h-screen flex flex-col">
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
          <div className={`${getCardClassName()} rounded-3xl px-8 py-10 h-full shadow-sm`}>
            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h1 className={`text-[22px] font-bold ${getTextClassName()} leading-tight mb-4`}>
                Enter your verification code
              </h1>
              <div className="space-y-2">
                <p className={`text-[13px] ${getSubTextClassName()}`}>
                  We sent a 5 digit verification code to:
                </p>
                <p className={`text-[13px] font-medium ${getTextClassName()}`}>
                  {email}
                </p>
                <p className={`text-[13px] ${getSubTextClassName()}`}>
                  Enter the code below to reset your password
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Verification Code Inputs */}
              <div className="flex justify-center space-x-3 mb-8">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-12 text-center text-lg font-medium border rounded-lg focus:ring-0 focus:outline-none ${
                      digit 
                        ? 'border-[#00EA72] bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    } ${getTextClassName()}`}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium text-[15px] rounded-full transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>

                {/* Resend Code Link */}
                <div className="text-center">
                  <span className="text-[13px] text-[#464646]">Haven't received the email yet? </span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-[13px] text-[#00EA72] font-medium hover:underline"
                  >
                    Resend code
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
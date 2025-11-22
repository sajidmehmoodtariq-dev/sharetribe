'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';

export default function ForgotPasswordPage() {
  const { getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName, getInputClassName } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First, check if user exists
      const checkRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const checkData = await checkRes.json();
      if (!checkRes.ok || !checkData.exists) {
        setError('User does not exist.');
        setLoading(false);
        return;
      }

      // If user exists, send verification code
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      // Store reset token in session storage for verification
      if (data.resetToken) {
        sessionStorage.setItem('resetToken', data.resetToken);
      }
      
      // Redirect to verification page with email
      router.push(`/forgot-password/verification?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={getBackgroundStyle()}
    >
      <div className="w-full max-w-[95%] sm:max-w-md mx-auto min-h-screen flex flex-col">
        {/* Logo at top */}
        <div className="flex justify-center pt-8 pb-6">
          <Image
            src="/logo.png"
            alt="Head Huntd Logo"
            width={60}
            height={60}
            className="object-contain dark:invert"
            priority
          />
        </div>

        {/* White Form Card */}
        <div className="flex-1 mx-4">
          <div className={`${getCardClassName()} rounded-3xl px-8 py-10 h-full shadow-sm`}>
            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h1 className={`text-[22px] font-bold ${getTextClassName()} leading-tight mb-4`}>
                Forgot your password?
              </h1>
              <p className={`text-[13px] ${getSubTextClassName()} leading-relaxed`}>
                Enter your email to reset your password. We will send you a 5 digit verification code to reset your password
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Address */}
              <div>
                <Label htmlFor="email" className={`text-[13px] font-medium ${getTextClassName()} mb-2 block`}>
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`${getInputClassName()} text-[13px]`}
                />
              </div>

              {/* Send Verification Button */}
              <div className="mt-8">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium text-[15px] rounded-full transition-colors"
                >
                  {loading ? 'Sending...' : 'Send verification code'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
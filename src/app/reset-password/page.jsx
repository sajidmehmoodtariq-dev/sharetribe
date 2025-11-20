'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Verify we have all required data
    if (!email || !sessionStorage.getItem('resetToken') || !sessionStorage.getItem('verifiedCode')) {
      router.push('/forgot-password');
    }
  }, [email, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const resetToken = sessionStorage.getItem('resetToken');
      const verifiedCode = sessionStorage.getItem('verifiedCode');

      if (!resetToken || !verifiedCode) {
        setError('Session expired. Please start over.');
        router.push('/forgot-password');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verifiedCode,
          resetToken,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      // Clear session storage
      sessionStorage.removeItem('resetToken');
      sessionStorage.removeItem('verifiedCode');
      
      // Redirect to success page
      router.push('/reset-password/success');
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
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
                Create a new password
              </h1>
              <p className={`text-[13px] ${getSubTextClassName()} leading-relaxed`}>
                Enter a new password for your Head Huntd account
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <Label htmlFor="newPassword" className={`text-[13px] font-medium ${getTextClassName()} mb-2 block`}>
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                  className={`${getInputClassName()} text-[13px]`}
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <Label htmlFor="confirmPassword" className={`text-[13px] font-medium ${getTextClassName()} mb-2 block`}>
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Enter your new password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className={`${getInputClassName()} text-[13px]`}
                />
              </div>

              {/* Update Password Button */}
              <div className="mt-8">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium text-[15px] rounded-full transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
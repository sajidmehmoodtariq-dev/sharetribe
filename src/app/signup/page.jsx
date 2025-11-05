'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';

export default function SignupPage() {
  const { getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName, getInputClassName } = useTheme();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: 'Sal Monella',
    email: 'salmonella@gmail.com',
    mobileNumber: '',
    password: '',
    agreeToTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms and Conditions');
      return;
    }

    setLoading(true);

    try {
      // Check if user already exists
      const checkResponse = await fetch('http://localhost:5000/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const checkData = await checkResponse.json();

      if (checkData.exists) {
        setError('This email is already registered. Please login instead.');
        setLoading(false);
        return;
      }

      // Store signup data in sessionStorage to use in next steps
      sessionStorage.setItem('signupData', JSON.stringify(formData));
      
      // Redirect to role selection
      router.push('/signup/role-selection');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

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

        {/* Form Card */}
        <div className="flex-1 mx-4">
          <div className={`${getCardClassName()} rounded-3xl px-8 py-10 h-full shadow-sm`}>
            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h1 className={`text-[22px] font-bold ${getTextClassName()} leading-tight mb-4`}>
                Welcome to Head Huntd
              </h1>
              <div className="flex flex-col items-center space-y-1">
                <p className={`text-[14px] font-medium ${getTextClassName()}`}>
                  Create an account
                </p>
                <p className={`text-[13px] ${getSubTextClassName()}`}>
                  Enter your details below to create an account
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
              {/* Full Name */}
              <div>
                <Label htmlFor="fullName" className={`text-[13px] font-medium ${getTextClassName()} mb-2 block`}>
                  Full Name*
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className={`${getInputClassName()} text-[13px]`}
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className={`text-[13px] font-medium ${getTextClassName()} mb-2 block`}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full h-12 border-2 border-[#00EA72] rounded-full bg-transparent text-[13px] px-4 focus:border-[#00EA72] focus:ring-0"
                  style={{
                    backgroundColor: 'transparent',
                    color: getTextClassName().includes('text-white') ? 'white' : 'black'
                  }}
                />
              </div>

              {/* Mobile Number */}
              <div>
                <Label htmlFor="mobileNumber" className={`text-[13px] font-medium ${getTextClassName()} mb-2 block`}>
                  Mobile Number
                </Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className={`${getInputClassName()} text-[13px]`}
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className={`text-[13px] font-medium ${getTextClassName()} mb-2 block`}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className={`${getInputClassName()} text-[13px]`}
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-3 mt-6">
                <div
                  className={`w-3.5 h-3.5 border ${getTextClassName().includes('text-white') ? 'border-white' : 'border-black'} rounded-sm mt-0.5 shrink-0 flex items-center justify-center cursor-pointer`}
                  onClick={() => setFormData({ ...formData, agreeToTerms: !formData.agreeToTerms })}
                >
                  {formData.agreeToTerms && (
                    <div className={`w-2 h-2 ${getTextClassName().includes('text-white') ? 'bg-white' : 'bg-black'} rounded-sm`}></div>
                  )}
                </div>
                <label className={`text-[13px] ${getTextClassName()} cursor-pointer select-none`}>
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#00EA72] font-medium">
                    Terms and Conditions
                  </Link>
                </label>
              </div>

              {/* Create Account Button */}
              <div className="space-y-4 mt-8">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium text-[15px] rounded-full transition-colors"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>

                {/* Login Link */}
                <p className={`text-center text-[13px] ${getSubTextClassName()}`}>
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#00EA72] font-medium">
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
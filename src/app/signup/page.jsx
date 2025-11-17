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
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    if (formData.password.length < 8) {
      setPasswordError('At least 8 characters required');
      return;
    }

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
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (passwordError) setPasswordError('');
                    }}
                    required
                    className={`${getInputClassName(passwordError)} text-[13px] pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${getTextClassName()} opacity-60 hover:opacity-100 transition-opacity`}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-[11px] mt-1 ml-4">
                    {passwordError}
                  </p>
                )}
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
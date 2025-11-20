'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const { getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName, getInputClassName } = useTheme();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check for login message from session storage
  useEffect(() => {
    const loginMessage = sessionStorage.getItem('loginMessage');
    if (loginMessage) {
      setMessage(loginMessage);
      sessionStorage.removeItem('loginMessage');
      // Clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    }
  }, []);

  // If no role is selected, redirect to role selection
  useEffect(() => {
    if (!role) {
      router.push('/login/role-selection');
    }
  }, [role, router]);

  const validateForm = () => {
    const newErrors = { email: '', password: '', general: '' };
    let isValid = true;

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'The password you have entered is incorrect';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: '', password: '', general: '' });

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setErrors({
            email: '',
            password: 'The password you have entered is incorrect',
            general: ''
          });
        } else if (response.status === 404) {
          setErrors({
            email: 'Please enter a valid email address',
            password: '',
            general: ''
          });
        } else {
          setErrors({
            email: '',
            password: '',
            general: data.error || 'Login failed'
          });
        }
        return;
      }

      // Save token to localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Redirect to home page for all users
      router.push('/home');
    } catch (err) {
      setErrors({
        email: '',
        password: '',
        general: 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return null; // Will redirect in useEffect
  }

  const roleTitle = role === 'job-hunter' ? 'Job Hunter' : 'Head Hunter';

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

        {/* Form Card */}
        <div className="flex-1 mx-4">
          <div className={`${getCardClassName()} rounded-3xl px-8 py-10 h-full shadow-sm`}>
            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h1 className={`text-[22px] font-bold ${getTextClassName()} leading-tight mb-4`}>
                Welcome Back to<br />Head Huntd
              </h1>
              <div className="flex flex-col items-center space-y-1">
                <p className={`text-[14px] font-medium ${getTextClassName()}`}>
                  {roleTitle} Login
                </p>
                <p className={`text-[13px] ${getSubTextClassName()}`}>
                  Enter your details below to login to your account
                </p>
              </div>
            </div>

            {message && (
              <div className="bg-blue-500/10 border border-blue-500 text-blue-600 dark:text-blue-400 px-4 py-2 rounded mb-4 text-sm">
                {message}
              </div>
            )}

            {errors.general && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4 text-sm">
                {errors.general}
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
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  required
                  className={`${getInputClassName(errors.email)} text-[13px]`}
                />
                {errors.email && (
                  <p className="text-red-500 text-[11px] mt-1 ml-4">
                    {errors.email}
                  </p>
                )}
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
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) {
                        setErrors({ ...errors, password: '' });
                      }
                    }}
                    required
                    className={`${getInputClassName(errors.password)} text-[13px] pr-10`}
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
                {errors.password && (
                  <p className="text-red-500 text-[11px] mt-1 ml-4">
                    {errors.password}
                  </p>
                )}
                <div className="text-right mt-2">
                  <Link href="/forgot-password" className="text-[13px] text-[#00EA72] font-medium">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              {/* Login Button and Sign Up Link */}
              <div className="space-y-4 mt-8">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium text-[15px] rounded-full transition-colors"
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </Button>

                {/* Sign Up Link */}
                <p className={`text-center text-[13px] ${getSubTextClassName()}`}>
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-[#00EA72] font-medium">
                    Sign up
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

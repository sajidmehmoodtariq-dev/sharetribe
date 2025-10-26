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
      const response = await fetch('/api/auth/login', {
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

      // Redirect based on user role
      if (data.user.role === 'employee' || role === 'job-hunter') {
        router.push('/employee/search-jobs');
      } else if (data.user.role === 'employer' || role === 'head-hunter') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
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
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) {
                      setErrors({ ...errors, password: '' });
                    }
                  }}
                  required
                  className={`${getInputClassName(errors.password)} text-[13px]`}
                />
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
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
      // Store signup data in sessionStorage to use in next steps
      sessionStorage.setItem('signupData', JSON.stringify(formData));
      
      // Navigate to role selection
      sessionStorage.setItem('signupData', JSON.stringify(formData));
      
      // Redirect to role selection
      router.push('/signup/role-selection');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 100 100" className="text-white">
              <text x="50" y="60" fontSize="60" fill="currentColor" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                HH
              </text>
            </svg>
          </div>
          <h1 className="text-white text-sm mt-2">Head Huntd</h1>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
          <h2 className="text-white text-2xl font-semibold mb-2">Welcome to Head Huntd</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Create an account<br />
            Enter your details below to create an account
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-white text-sm mb-2 block">
                Full Name*
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Sal Monella"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="bg-transparent border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-white text-sm mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="salmonella@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-transparent border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <Label htmlFor="mobileNumber" className="text-white text-sm mb-2 block">
                Mobile Number
              </Label>
              <Input
                id="mobileNumber"
                type="tel"
                placeholder="Enter your mobile number"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                className="bg-transparent border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white text-sm mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-transparent border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked })}
                className="border-zinc-700 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              />
              <label htmlFor="terms" className="text-sm text-zinc-400 leading-tight">
                I agree to the <Link href="/terms" className="text-emerald-500 hover:underline">Terms and Conditions</Link>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold h-12"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>

            <p className="text-center text-sm text-zinc-400">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-500 hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

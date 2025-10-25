'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Redirect based on user role
      if (data.user.role === 'job-hunter') {
        router.push('/job-hunter/search-jobs');
      } else if (data.user.role === 'head-hunter') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
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
          <h2 className="text-white text-2xl font-semibold mb-2">Welcome Back</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Log in to your account
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="password" className="text-white text-sm mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-transparent border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <Link href="/forgot-password" className="text-sm text-emerald-500 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold h-12"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </Button>

            <p className="text-center text-sm text-zinc-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-emerald-500 hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

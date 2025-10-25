'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-white font-bold text-xl">HH</div>
            <h1 className="text-white text-lg">Head Huntd</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white">{user?.fullName}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-zinc-700 text-white hover:bg-zinc-800"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
          <h2 className="text-white text-2xl font-semibold mb-4">
            Welcome, {user?.fullName}!
          </h2>
          <p className="text-zinc-400 mb-6">
            You're logged in as a {user?.role === 'head-hunter' ? 'Head Hunter' : 'Job Hunter'}
          </p>

          {user?.role === 'head-hunter' && (
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-white text-lg font-medium mb-2">Your Subscription</h3>
                <p className="text-zinc-400">
                  {user?.subscriptionPackage?.type || 'No subscription selected'}
                </p>
              </div>
              
              <div className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-white text-lg font-medium mb-2">Your Goal</h3>
                <p className="text-zinc-400">
                  {user?.selectedGoal || 'Not specified'}
                </p>
              </div>
            </div>
          )}

          {user?.role === 'job-hunter' && (
            <Button
              onClick={() => router.push('/job-hunter/search-jobs')}
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
            >
              Search Jobs
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { motion } from 'framer-motion';

export default function CreateJob() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/login/role-selection');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          router.push('/login/role-selection');
          return;
        }

        const data = await response.json();
        
        // Check if user is an employer
        if (data.user.role !== 'employer') {
          setError('Only employers can create job postings');
          setLoading(false);
          return;
        }

        setUser(data.user);
        setLoading(false);
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/login/role-selection');
      }
    };

    checkAuth();
  }, [router]);

  const handleCreateJob = async () => {
    if (creating) return; // Prevent double clicks
    
    try {
      setCreating(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          employerId: user._id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create job');
      }

      setJob(data.job);
      // Redirect to first step
      router.push(`/employer/create-job/${data.job._id}/step-1`);
    } catch (err) {
      setError(err.message);
      setCreating(false);
    }
  };

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>❌ Error</h2>
          <p>{error}</p>
          <Link href="/employer/dashboard" className={styles.button}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-gray-900 p-6"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create a New Job Posting</h1>
        <p className="text-gray-600 dark:text-gray-400">Post a job and find the perfect candidate for your team</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="text-5xl text-center mb-6"
          >
            📋
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2"
          >
            Get Started
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-600 dark:text-gray-400 text-center mb-6"
          >
            Follow our simple 4-step process:
          </motion.p>

          <div className="space-y-3 mb-6">
            {[
              { num: 1, title: 'Job Details', desc: 'Basic job information' },
              { num: 2, title: 'Job Summary', desc: 'Description and responsibilities' },
              { num: 3, title: 'Qualifications', desc: 'Skills required (Optional)' },
              { num: 4, title: 'Post Job', desc: 'Salary, location, and publish' }
            ].map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.08 }}
                whileHover={{ scale: 1.01, x: 3 }}
                className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-[#00EA72] transition-all"
              >
                <div className="w-8 h-8 bg-[#00EA72] text-black rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-0.5">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            whileHover={{ scale: creating ? 1 : 1.02, y: creating ? 0 : -2 }}
            whileTap={{ scale: creating ? 1 : 0.98 }}
            onClick={handleCreateJob}
            disabled={creating}
            className="w-full py-3 bg-[#00EA72] hover:bg-[#00D66C] text-black font-semibold rounded-full transition-all shadow-md hover:shadow-lg mb-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                Creating...
              </>
            ) : (
              'Start Creating Job →'
            )}
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <Link href="/home" className="block w-full py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-full transition-all text-center">
              Back to Dashboard
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

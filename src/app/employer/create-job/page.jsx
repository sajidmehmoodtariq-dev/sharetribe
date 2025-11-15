'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function CreateJob() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          router.push('/login');
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
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleCreateJob = async () => {
    try {
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Create a New Job Posting</h1>
        <p>Post a job and find the perfect candidate for your team</p>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.icon}>📋</div>
          <h2>Get Started</h2>
          <p>Follow our simple 4-step process to create and publish your job posting:</p>

          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepInfo}>
                <h3>Job Details</h3>
                <p>Provide basic job information like title, employment type, and experience level</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepInfo}>
                <h3>Job Summary</h3>
                <p>Write a detailed description of the job role and responsibilities</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepInfo}>
                <h3>Qualifications</h3>
                <p>Add the qualifications and skills required for this position</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepInfo}>
                <h3>Post Job</h3>
                <p>Set salary, location, deadline, and publish your job posting</p>
              </div>
            </div>
          </div>

          <button onClick={handleCreateJob} className={styles.primaryButton}>
            Start Creating Job ➜
          </button>

          <Link href="/employer/dashboard" className={styles.secondaryButton}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../page.module.css';

export default function JobSuccess() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch job');
        }

        const data = await response.json();
        setJob(data.job);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>❌</div>
          <h1>Error</h1>
          <p>{error}</p>
          <Link href="/employer/dashboard" className={styles.primaryButton}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.successContainer}>
        {/* Success Icon */}
        <div className={styles.successIcon}>✓</div>

        {/* Main Message */}
        <h1 className={styles.successTitle}>Job Published Successfully!</h1>
        <p className={styles.successSubtitle}>
          Your job posting is now live and visible to job seekers
        </p>

        {/* Job Preview Card */}
        <div className={styles.jobSummaryCard}>
          <div className={styles.jobHeader}>
            <h2>{job?.jobDetails?.jobTitle}</h2>
            <span className={styles.publishedBadge}>🟢 Published</span>
          </div>

          <div className={styles.jobDetails}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Employment Type:</span>
              <span className={styles.value}>{job?.jobDetails?.employmentType}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Shift Preference:</span>
              <span className={styles.value}>{job?.jobDetails?.shiftPreference}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Min. Experience:</span>
              <span className={styles.value}>{job?.jobDetails?.minimumExperience}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Location:</span>
              <span className={styles.value}>{job?.postJob?.workLocation}</span>
            </div>
            {job?.postJob?.salary && (
              <div className={styles.detailRow}>
                <span className={styles.label}>Salary:</span>
                <span className={styles.value}>{job?.postJob?.salary}</span>
              </div>
            )}
          </div>

          <div className={styles.jobStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>0</span>
              <span className={styles.statLabel}>Applications</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>0</span>
              <span className={styles.statLabel}>Views</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>📋</span>
              <span className={styles.statLabel}>Job ID: {jobId?.slice(0, 8)}</span>
            </div>
          </div>
        </div>

        {/* Action Steps */}
        <div className={styles.nextSteps}>
          <h3>📋 What's Next?</h3>
          <div className={styles.stepsList}>
            <div className={styles.nextStep}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h4>Share Your Job</h4>
                <p>Share the job listing on your social media or company website to reach more candidates</p>
              </div>
            </div>

            <div className={styles.nextStep}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h4>Review Applications</h4>
                <p>Check your dashboard regularly for new applications from interested job seekers</p>
              </div>
            </div>

            <div className={styles.nextStep}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h4>Shortlist Candidates</h4>
                <p>Save and review promising candidates, then reach out to schedule interviews</p>
              </div>
            </div>

            <div className={styles.nextStep}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h4>Make a Hire</h4>
                <p>Find the perfect fit for your team and mark the position as filled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.successActions}>
          <Link href="/employer/dashboard" className={styles.primaryButton}>
            🏠 Go to Dashboard
          </Link>
          <Link href={`/employer/job/${jobId}`} className={styles.secondaryButton}>
            👁️ View Job Posting
          </Link>
          <Link href="/employer/create-job" className={styles.outlineButton}>
            ➕ Create Another Job
          </Link>
        </div>

        {/* Tips Section */}
        <div className={styles.tipsSection}>
          <h3>💡 Tips to Attract Better Candidates</h3>
          <ul>
            <li>📝 Make sure your job description is clear and comprehensive</li>
            <li>💰 Provide a competitive salary range to attract qualified candidates</li>
            <li>🎯 Be specific about required qualifications and skills</li>
            <li>📍 Clearly mention the work location and flexibility options</li>
            <li>⚡ Respond quickly to applications to show you're actively hiring</li>
            <li>🌟 Highlight unique benefits and company culture</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

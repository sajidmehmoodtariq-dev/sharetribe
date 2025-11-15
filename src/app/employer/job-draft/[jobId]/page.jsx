'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../page.module.css';

export default function JobDraft() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishing, setPublishing] = useState(false);

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

  const handlePublishJob = async () => {
    try {
      setPublishing(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ status: 'published' })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish job');
      }

      router.push(`/employer/job-success/${jobId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

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

  const completionPercentage = job?.onboarding 
    ? Math.round((Object.values(job.onboarding).filter(v => v === true).length / 4) * 100)
    : 0;

  return (
    <div className={styles.container}>
      <div className={styles.draftContainer}>
        {/* Draft Icon */}
        <div className={styles.draftIcon}>💾</div>

        {/* Main Message */}
        <h1 className={styles.draftTitle}>Job Saved as Draft!</h1>
        <p className={styles.draftSubtitle}>
          Your job posting is saved. You can publish it whenever you're ready
        </p>

        {/* Completion Status */}
        <div className={styles.completionStatus}>
          <div className={styles.completionBar}>
            <div 
              className={styles.completionFill}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className={styles.completionText}>{completionPercentage}% Complete</p>
        </div>

        {/* Job Preview Card */}
        <div className={styles.jobSummaryCard}>
          <div className={styles.jobHeader}>
            <h2>{job?.jobDetails?.jobTitle}</h2>
            <span className={styles.draftBadge}>📋 Draft</span>
          </div>

          <div className={styles.jobDetails}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Employment Type:</span>
              <span className={styles.value}>{job?.jobDetails?.employmentType || '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Shift Preference:</span>
              <span className={styles.value}>{job?.jobDetails?.shiftPreference || '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Min. Experience:</span>
              <span className={styles.value}>{job?.jobDetails?.minimumExperience || '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Summary:</span>
              <span className={styles.value}>{job?.jobSummary?.summary ? '✓ Added' : '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Qualifications:</span>
              <span className={styles.value}>
                {job?.qualifications?.qualifications?.length || 0} added
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Location:</span>
              <span className={styles.value}>{job?.postJob?.workLocation || '—'}</span>
            </div>
          </div>
        </div>

        {/* Completion Checklist */}
        <div className={styles.checklist}>
          <h3>✅ Completion Checklist</h3>
          <div className={styles.checklistItems}>
            <div className={`${styles.checklistItem} ${job?.onboarding?.jobDetailsCompleted ? styles.completed : ''}`}>
              <span className={styles.checkIcon}>{job?.onboarding?.jobDetailsCompleted ? '✓' : '○'}</span>
              <span>Job Details</span>
              <Link href={`/employer/create-job/${jobId}/step-1`} className={styles.editLink}>
                Edit
              </Link>
            </div>

            <div className={`${styles.checklistItem} ${job?.onboarding?.jobSummaryCompleted ? styles.completed : ''}`}>
              <span className={styles.checkIcon}>{job?.onboarding?.jobSummaryCompleted ? '✓' : '○'}</span>
              <span>Job Summary</span>
              <Link href={`/employer/create-job/${jobId}/step-2`} className={styles.editLink}>
                Edit
              </Link>
            </div>

            <div className={`${styles.checklistItem} ${job?.onboarding?.qualificationsCompleted ? styles.completed : ''}`}>
              <span className={styles.checkIcon}>{job?.onboarding?.qualificationsCompleted ? '✓' : '○'}</span>
              <span>Qualifications</span>
              <Link href={`/employer/create-job/${jobId}/step-3`} className={styles.editLink}>
                Edit
              </Link>
            </div>

            <div className={`${styles.checklistItem} ${job?.onboarding?.postJobCompleted ? styles.completed : ''}`}>
              <span className={styles.checkIcon}>{job?.onboarding?.postJobCompleted ? '✓' : '○'}</span>
              <span>Post Job Details</span>
              <Link href={`/employer/create-job/${jobId}/step-4`} className={styles.editLink}>
                Edit
              </Link>
            </div>
          </div>
        </div>

        {/* Why Publish */}
        <div className={styles.whyPublish}>
          <h3>🚀 Why Publish Now?</h3>
          <ul>
            <li>✨ Your job will be visible to thousands of job seekers</li>
            <li>📬 Start receiving applications from interested candidates</li>
            <li>⚡ The sooner you publish, the sooner you find the right person</li>
            <li>🎯 Increase visibility by posting quality job descriptions</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className={styles.draftActions}>
          <button 
            onClick={handlePublishJob}
            disabled={publishing || completionPercentage < 100}
            className={styles.primaryButton}
          >
            {publishing ? '🚀 Publishing...' : '🚀 Publish Job Now'}
          </button>
          <Link href="/employer/dashboard" className={styles.secondaryButton}>
            📋 Back to Dashboard
          </Link>
          <Link href={`/employer/create-job/${jobId}/step-1`} className={styles.outlineButton}>
            ✏️ Continue Editing
          </Link>
        </div>

        {/* Additional Options */}
        <div className={styles.additionalOptions}>
          <h3>⚙️ More Options</h3>
          <div className={styles.optionsList}>
            <div className={styles.optionItem}>
              <h4>📋 View Draft</h4>
              <p>Preview how your job posting will look to candidates</p>
              <Link href={`/employer/job/${jobId}`} className={styles.linkButton}>
                Preview →
              </Link>
            </div>

            <div className={styles.optionItem}>
              <h4>🔄 Edit Any Step</h4>
              <p>Go back to any step to modify or update job details</p>
              <Link href={`/employer/create-job/${jobId}/step-1`} className={styles.linkButton}>
                Edit Job →
              </Link>
            </div>

            <div className={styles.optionItem}>
              <h4>➕ Create Another</h4>
              <p>Start creating a new job posting</p>
              <Link href="/employer/create-job" className={styles.linkButton}>
                Create Job →
              </Link>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className={styles.infoBox}>
          <h4>ℹ️ Note</h4>
          <p>
            Your job posting will remain in draft status until you choose to publish it. 
            You can make as many changes as you like before publishing. Once published, job seekers 
            will be able to find and apply for your position.
          </p>
        </div>
      </div>
    </div>
  );
}

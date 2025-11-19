'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../../page.module.css';

export function generateStaticParams() {
  return [];
}

export default function PostJobReview() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmations, setConfirmations] = useState({
    accurate: false,
    notifications: false
  });
  const [submitting, setSubmitting] = useState(false);

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

  const handleConfirmationChange = (key) => {
    setConfirmations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePublish = async () => {
    if (!confirmations.accurate || !confirmations.notifications) {
      setError('Please confirm both checkboxes before publishing');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobId}/post-job`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...job.postJob,
            publish: true
          })
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
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (error && !submitting) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>❌</div>
          <h1>Error</h1>
          <p>{error}</p>
          <Link href={`/employer/create-job/${jobId}/step-4`} className={styles.primaryButton}>
            Back to Step 4
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.reviewContainer}>
        {/* Header */}
        <div className={styles.reviewHeader}>
          <h1>🔍 Review Your Job Post</h1>
          <p>This is how your post will look on the Head Huntd dashboard for potential employees to see</p>
        </div>

        {/* Job Preview */}
        <div className={styles.jobPreviewSection}>
          <div className={styles.jobCard}>
            {/* Job Header */}
            <div className={styles.jobCardHeader}>
              <div className={styles.jobAvatar}>👔</div>
              <div className={styles.jobCardInfo}>
                <h2>{job?.jobDetails?.jobTitle}</h2>
                <p className={styles.companyName}>{job?.companyName}</p>
                <div className={styles.jobMeta}>
                  <span className={styles.metaItem}>📍 {job?.postJob?.workLocation || 'Location TBD'}</span>
                  <span className={styles.metaItem}>⏱️ {job?.postJob?.salaryFrequency || 'Not specified'}</span>
                  {job?.postJob?.salary && (
                    <span className={styles.metaItem}>💰 {job?.postJob?.salary}</span>
                  )}
                </div>
              </div>
              <span className={styles.publishedBadge}>✓ Published</span>
            </div>

            {/* Job Description */}
            <div className={styles.jobDescription}>
              <h3>About the role</h3>
              <p>{job?.jobSummary?.summary}</p>
            </div>

            {/* Job Details */}
            <div className={styles.jobDetailsSection}>
              <div className={styles.detailsColumn}>
                <h4>📋 Employment Details</h4>
                <ul>
                  <li><strong>Type:</strong> {job?.jobDetails?.employmentType}</li>
                  <li><strong>Shift:</strong> {job?.jobDetails?.shiftPreference}</li>
                  <li><strong>Experience:</strong> {job?.jobDetails?.minimumExperience}</li>
                  <li><strong>Workers Rights:</strong> {job?.jobDetails?.workersRights ? 'Required' : 'Not Required'}</li>
                </ul>
              </div>

              <div className={styles.detailsColumn}>
                <h4>📍 Location Details</h4>
                <ul>
                  <li><strong>Type:</strong> {job?.postJob?.workLocation}</li>
                  {job?.postJob?.address && <li><strong>Address:</strong> {job?.postJob?.address}</li>}
                  {job?.postJob?.city && <li><strong>City:</strong> {job?.postJob?.city}</li>}
                  {job?.postJob?.state && <li><strong>State:</strong> {job?.postJob?.state}</li>}
                  {job?.postJob?.postcode && <li><strong>Postcode:</strong> {job?.postJob?.postcode}</li>}
                </ul>
              </div>
            </div>

            {/* Required Qualifications */}
            <div className={styles.qualificationsSection}>
              <h4>🎯 Required Qualifications</h4>
              <div className={styles.qualificationsList}>
                {job?.qualifications?.qualifications?.map((qual, index) => (
                  <span key={index} className={styles.qualificationTag}>
                    {qual}
                  </span>
                ))}
              </div>
            </div>

            {/* Application Info */}
            <div className={styles.applicationInfo}>
              {job?.postJob?.numberOfPositions && (
                <span>📊 Positions Available: {job?.postJob?.numberOfPositions}</span>
              )}
              {job?.postJob?.applicationDeadline && (
                <span>⏰ Application Deadline: {new Date(job?.postJob?.applicationDeadline).toLocaleDateString()}</span>
              )}
            </div>

            {/* Call to Action */}
            <div className={styles.ctaSection}>
              <button className={styles.applyButton}>
                👥 View Applicants
              </button>
              <button className={styles.saveButton}>
                ❤️ Save Job
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Section */}
        <div className={styles.confirmationSection}>
          <h3>✅ Confirm Job Post</h3>
          <p className={styles.confirmationHint}>Review your listing preview and confirm before publishing</p>

          {error && submitting && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          <div className={styles.confirmationChecks}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={confirmations.accurate}
                onChange={() => handleConfirmationChange('accurate')}
              />
              <span>
                <strong>✓ I confirm this job post is accurate</strong>
                <small>The information I have provided is accurate with the details I entered</small>
              </span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={confirmations.notifications}
                onChange={() => handleConfirmationChange('notifications')}
              />
              <span>
                <strong>✓ Notify me when applicants apply</strong>
                <small>I want to receive notifications when new applicants apply to this job</small>
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className={styles.reviewActions}>
            <Link
              href={`/employer/create-job/${jobId}/step-4`}
              className={styles.secondaryButton}
            >
              ✏️ Edit Details
            </Link>
            <button
              onClick={handlePublish}
              disabled={submitting || !confirmations.accurate || !confirmations.notifications}
              className={styles.primaryButton}
            >
              {submitting ? '🚀 Publishing...' : '🚀 Publish Job'}
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className={styles.tipsSection}>
          <h3>💡 Tips for Success</h3>
          <ul>
            <li>✓ Double-check all job details are accurate and complete</li>
            <li>✓ Use clear and descriptive job titles</li>
            <li>✓ Provide realistic salary ranges to attract qualified candidates</li>
            <li>✓ Be specific about required qualifications and experience</li>
            <li>✓ Respond quickly to applications</li>
            <li>✓ Update your posting if requirements change</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

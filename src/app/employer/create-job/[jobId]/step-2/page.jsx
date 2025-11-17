'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../page.module.css';
import { motion } from 'framer-motion';

export default function Step2JobSummary() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId;

  const [formData, setFormData] = useState({
    summary: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [charCount, setCharCount] = useState(0);

  const maxChars = 5000;

  useEffect(() => {
    // Fetch job data
    const fetchJob = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch job');
        }

        const data = await response.json();
        setJobTitle(data.job.jobDetails?.jobTitle || '');

        // Pre-fill form if data exists
        if (data.job.jobSummary?.summary) {
          setFormData({ summary: data.job.jobSummary.summary });
          setCharCount(data.job.jobSummary.summary.length);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setFormData({ summary: value });
      setCharCount(value.length);
    }
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.summary.trim()) {
        throw new Error('Job summary is required');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobId}/job-summary`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save job summary');
      }

      router.push(`/employer/create-job/${jobId}/step-3`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    router.push(`/employer/create-job/${jobId}/step-1`);
  };

  return (
    <div className={styles.container}>
      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div className={styles.progress} style={{ width: '50%' }}></div>
      </div>

      <div className={styles.stepHeader}>
        <h1>Step 2: Job Summary</h1>
        <p>Provide a detailed description of the job role and responsibilities</p>
      </div>

      <div className={styles.stepContainer}>
        <form onSubmit={handleNext}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.jobPreview}>
            <strong>Position:</strong> {jobTitle || 'Loading...'}
          </div>

          {/* Job Summary */}
          <div className={styles.formGroup}>
            <label htmlFor="summary">
              Job Description <span className={styles.required}>*</span>
            </label>
            <p className={styles.hint}>
              Write a comprehensive job description that includes responsibilities, key tasks, and what you're looking for in a candidate.
            </p>
            <textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Write a detailed job description here..."
              rows="12"
              required
              className={styles.textarea}
            />
            <div className={styles.charCount}>
              {charCount} / {maxChars} characters
            </div>
          </div>

          {/* Tips */}
          <div className={styles.tipsBox}>
            <h3>💡 Tips for a Great Job Description:</h3>
            <ul>
              <li>Start with an engaging overview of the role</li>
              <li>List key responsibilities and duties</li>
              <li>Highlight what makes this opportunity special</li>
              <li>Mention growth opportunities or benefits</li>
              <li>Be clear about reporting structure</li>
              <li>Include team composition if relevant</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={handlePrevious}
              className={styles.secondaryButton}
              disabled={loading}
            >
              ← Back to Step 1
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.primaryButton}
            >
              {loading ? 'Saving...' : 'Continue to Step 3 →'}
            </button>
          </div>
        </form>
      </div>

      {/* Step Indicator */}
      <div className={styles.stepIndicator}>
        <span className={styles.inactiveStep}>1. Job Details</span>
        <span className={styles.activeStep}>2. Job Summary</span>
        <span className={styles.inactiveStep}>3. Qualifications</span>
        <span className={styles.inactiveStep}>4. Post Job</span>
      </div>
    </div>
  );
}

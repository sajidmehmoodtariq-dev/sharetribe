'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../page.module.css';

export default function Step1JobDetails() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId;

  const [formData, setFormData] = useState({
    jobTitle: '',
    employmentType: 'full-time',
    shiftPreference: 'morning',
    workersRights: true,
    minimumExperience: 'no-experience'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState(null);

  useEffect(() => {
    // Fetch job data to get progress
    const fetchJob = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch job');
        }

        const data = await response.json();
        setProgressData(data.job);

        // Pre-fill form if data exists
        if (data.job.jobDetails) {
          setFormData(data.job.jobDetails);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobId}/job-details`,
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
        throw new Error(data.error || 'Failed to save job details');
      }

      // Move to step 2
      router.push(`/employer/create-job/${jobId}/step-2`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div className={styles.progress} style={{ width: '25%' }}></div>
      </div>

      <div className={styles.stepHeader}>
        <h1>Step 1: Job Details</h1>
        <p>Provide basic information about the job position</p>
      </div>

      <div className={styles.stepContainer}>
        <form onSubmit={handleNext}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          {/* Job Title */}
          <div className={styles.formGroup}>
            <label htmlFor="jobTitle">
              Job Title <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="jobTitle"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="e.g., Senior Software Engineer, Marketing Manager"
              required
              className={styles.input}
            />
            <small>Use a clear and accurate job title</small>
          </div>

          {/* Employment Type */}
          <div className={styles.formGroup}>
            <label>
              Employment Type <span className={styles.required}>*</span>
            </label>
            <div className={styles.radioGroup}>
              {['full-time', 'part-time', 'casual', 'contract'].map(type => (
                <label key={type} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="employmentType"
                    value={type}
                    checked={formData.employmentType === type}
                    onChange={handleChange}
                    required
                  />
                  <span className={styles.capitalizeFirst}>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Shift Preference */}
          <div className={styles.formGroup}>
            <label>
              Shift Preference <span className={styles.required}>*</span>
            </label>
            <p className={styles.hint}>Indicate a shift preference for this role</p>
            <div className={styles.radioGroup}>
              {['morning', 'afternoon', 'evening'].map(shift => (
                <label key={shift} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="shiftPreference"
                    value={shift}
                    checked={formData.shiftPreference === shift}
                    onChange={handleChange}
                    required
                  />
                  <span className={styles.capitalizeFirst}>{shift}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Workers Rights */}
          <div className={styles.formGroup}>
            <label>
              Workers Rights <span className={styles.required}>*</span>
            </label>
            <p className={styles.hint}>Specify if candidates must have the right to work in Australia</p>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="workersRights"
                  value="true"
                  checked={formData.workersRights === true}
                  onChange={(e) => setFormData(prev => ({ ...prev, workersRights: e.target.value === 'true' }))}
                  required
                />
                <span>Yes</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="workersRights"
                  value="false"
                  checked={formData.workersRights === false}
                  onChange={(e) => setFormData(prev => ({ ...prev, workersRights: e.target.value === 'true' }))}
                  required
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {/* Minimum Experience */}
          <div className={styles.formGroup}>
            <label htmlFor="minimumExperience">
              Minimum Experience <span className={styles.required}>*</span>
            </label>
            <p className={styles.hint}>Select the minimum experience level required for this role</p>
            <select
              id="minimumExperience"
              name="minimumExperience"
              value={formData.minimumExperience}
              onChange={handleChange}
              required
              className={styles.select}
            >
              <option value="no-experience">No Experience</option>
              <option value="1-2-years">1-2 Years</option>
              <option value="2-5-years">2-5 Years</option>
              <option value="5-10-years">5-10 Years</option>
              <option value="10plus-years">10+ Years</option>
            </select>
          </div>

          {/* Buttons */}
          <div className={styles.buttonGroup}>
            <Link href="/employer/dashboard" className={styles.secondaryButton}>
              ← Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={styles.primaryButton}
            >
              {loading ? 'Saving...' : 'Continue to Step 2 →'}
            </button>
          </div>
        </form>
      </div>

      {/* Step Indicator */}
      <div className={styles.stepIndicator}>
        <span className={styles.activeStep}>1. Job Details</span>
        <span className={styles.inactiveStep}>2. Job Summary</span>
        <span className={styles.inactiveStep}>3. Qualifications</span>
        <span className={styles.inactiveStep}>4. Post Job</span>
      </div>
    </div>
  );
}

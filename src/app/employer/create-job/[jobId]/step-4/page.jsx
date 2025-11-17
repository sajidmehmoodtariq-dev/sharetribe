'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../page.module.css';
import { motion } from 'framer-motion';

export default function Step4PostJob() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId;

  const [formData, setFormData] = useState({
    salary: '',
    salaryRange: { min: '', max: '' },
    salaryFrequency: 'hourly',
    numberOfPositions: 1,
    applicationDeadline: '',
    workLocation: 'on-site',
    address: '',
    city: '',
    state: '',
    postcode: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [publish, setPublish] = useState(false);

  const australianStates = [
    'NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'
  ];

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
        if (data.job.postJob) {
          setFormData({
            salary: data.job.postJob.salary || '',
            salaryRange: data.job.postJob.salaryRange || { min: '', max: '' },
            salaryFrequency: data.job.postJob.salaryFrequency || 'hourly',
            numberOfPositions: data.job.postJob.numberOfPositions || 1,
            applicationDeadline: data.job.postJob.applicationDeadline 
              ? new Date(data.job.postJob.applicationDeadline).toISOString().split('T')[0]
              : '',
            workLocation: data.job.postJob.workLocation || 'on-site',
            address: data.job.postJob.address || '',
            city: data.job.postJob.city || '',
            state: data.job.postJob.state || '',
            postcode: data.job.postJob.postcode || ''
          });
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.workLocation) {
        throw new Error('Work location is required');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobId}/post-job`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...formData,
            publish
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save job posting');
      }

      // Redirect to success page or dashboard
      if (publish) {
        router.push(`/employer/job-success/${jobId}`);
      } else {
        router.push(`/employer/job-draft/${jobId}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    router.push(`/employer/create-job/${jobId}/step-3`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={styles.container}
    >
      {/* Progress Bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5 }}
        className={styles.progressBar}
        style={{ transformOrigin: 'left' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={styles.progress}
        ></motion.div>
      </motion.div>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={styles.stepHeader}
      >
        <h1>Step 4: Post Job</h1>
        <p>Set salary, location, and other posting details</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={styles.stepContainer}
      >
        <form onSubmit={handleSubmit}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.jobPreview}>
            <strong>Position:</strong> {jobTitle || 'Loading...'}
          </div>

          {/* Salary Information */}
          <fieldset className={styles.fieldset}>
            <legend>💰 Salary Information</legend>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="salary">Salary Display</label>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g., $60,000 - $80,000 per year"
                  className={styles.input}
                />
                <small>Or specify a range below</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="salaryFrequency">Salary Frequency</label>
                <select
                  id="salaryFrequency"
                  name="salaryFrequency"
                  value={formData.salaryFrequency}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="salaryMin">Salary Range Min</label>
                <input
                  type="number"
                  id="salaryMin"
                  name="salaryRange.min"
                  value={formData.salaryRange.min}
                  onChange={handleChange}
                  placeholder="Min salary"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="salaryMax">Salary Range Max</label>
                <input
                  type="number"
                  id="salaryMax"
                  name="salaryRange.max"
                  value={formData.salaryRange.max}
                  onChange={handleChange}
                  placeholder="Max salary"
                  className={styles.input}
                />
              </div>
            </div>
          </fieldset>

          {/* Position Details */}
          <fieldset className={styles.fieldset}>
            <legend>📍 Position Details</legend>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="numberOfPositions">Number of Positions</label>
                <input
                  type="number"
                  id="numberOfPositions"
                  name="numberOfPositions"
                  value={formData.numberOfPositions}
                  onChange={handleChange}
                  min="1"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="applicationDeadline">Application Deadline</label>
                <input
                  type="date"
                  id="applicationDeadline"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            </div>
          </fieldset>

          {/* Work Location */}
          <fieldset className={styles.fieldset}>
            <legend>🌍 Work Location</legend>

            <div className={styles.formGroup}>
              <label>Work Location Type <span className={styles.required}>*</span></label>
              <div className={styles.radioGroup}>
                {['on-site', 'remote', 'hybrid'].map(type => (
                  <label key={type} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="workLocation"
                      value={type}
                      checked={formData.workLocation === type}
                      onChange={handleChange}
                      required
                    />
                    <span className={styles.capitalizeFirst}>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.workLocation !== 'remote' && (
              <>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="address">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street address"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g., Sydney"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="state">State</label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="">Select a state</option>
                      {australianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="postcode">Postcode</label>
                    <input
                      type="text"
                      id="postcode"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleChange}
                      placeholder="e.g., 2000"
                      className={styles.input}
                    />
                  </div>
                </div>
              </>
            )}
          </fieldset>

          {/* Publishing Options */}
          <fieldset className={styles.fieldset}>
            <legend>📤 Publishing Options</legend>
            
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
              />
              <span>
                <strong>Publish this job immediately</strong>
                <small>If unchecked, the job will be saved as a draft</small>
              </span>
            </label>
          </fieldset>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={styles.buttonGroup}
          >
            <motion.button
              whileHover={{ scale: 1.02, x: -3 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handlePrevious}
              className={styles.secondaryButton}
              disabled={loading}
            >
              ← Back to Step 3
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={styles.primaryButton}
            >
              {loading ? 'Publishing...' : (publish ? '✓ Publish Job' : '💾 Save as Draft')}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>

      {/* Step Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={styles.stepIndicator}
      >
        <span className={styles.inactiveStep}>1. Job Details</span>
        <span className={styles.inactiveStep}>2. Job Summary</span>
        <span className={styles.inactiveStep}>3. Qualifications</span>
        <span className={styles.activeStep}>4. Post Job</span>
      </motion.div>
    </motion.div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../page.module.css';
import { motion, AnimatePresence } from 'framer-motion';

export default function Step3Qualifications() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId;

  const [formData, setFormData] = useState({
    qualifications: ['', '', '']
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobTitle, setJobTitle] = useState('');

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
        if (data.job.qualifications?.qualifications) {
          setFormData({ qualifications: data.job.qualifications.qualifications });
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleChange = (index, value) => {
    const newQualifications = [...formData.qualifications];
    newQualifications[index] = value;
    setFormData({ qualifications: newQualifications });
  };

  const handleAddQualification = () => {
    setFormData({
      qualifications: [...formData.qualifications, '']
    });
  };

  const handleRemoveQualification = (index) => {
    setFormData({
      qualifications: formData.qualifications.filter((_, i) => i !== index)
    });
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const filledQualifications = formData.qualifications.filter(q => q.trim());

      // Allow proceeding without qualifications (optional)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobId}/qualifications`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ qualifications: filledQualifications })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save qualifications');
      }

      router.push(`/employer/create-job/${jobId}/step-4`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push(`/employer/create-job/${jobId}/step-4`);
  };

  const handlePrevious = () => {
    router.push(`/employer/create-job/${jobId}/step-2`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
          animate={{ width: '75%' }}
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
        <h1>Step 3: Qualifications</h1>
        <p>Add the qualifications and skills required for this position (Optional)</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={styles.stepContainer}
      >
        <form onSubmit={handleNext}>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={styles.errorMessage}
            >
              {error}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={styles.jobPreview}
          >
            <strong>Position:</strong> {jobTitle || 'Loading...'}
          </motion.div>

          {/* Qualifications */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={styles.formGroup}
          >
            <label>
              Required Qualifications & Skills <span style={{ color: '#aaa', fontWeight: 'normal' }}>(Optional)</span>
            </label>
            <p className={styles.hint}>
              Add the qualifications, skills, education, and experience required for this role
            </p>

            <AnimatePresence mode="popLayout">
              <div className={styles.qualificationsList}>
                {formData.qualifications.map((qualification, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={styles.qualificationItem}
                  >
                    <div className={styles.qualificationIndex}>{index + 1}</div>
                    <input
                      type="text"
                      value={qualification}
                      onChange={(e) => handleChange(index, e.target.value)}
                      placeholder={`e.g., ${getPlaceholder(index)}`}
                      className={styles.input}
                    />
                    {formData.qualifications.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => handleRemoveQualification(index)}
                        className={styles.removeButton}
                        title="Remove qualification"
                      >
                        ✕
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleAddQualification}
              className={styles.addButton}
            >
              + Add Another Qualification
            </motion.button>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={styles.tipsBox}
          >
            <h3>💡 Examples of Qualifications:</h3>
            <ul>
              <li>Bachelor's Degree in Computer Science</li>
              <li>5+ years of experience in project management</li>
              <li>Proficiency in Python and JavaScript</li>
              <li>Excellent communication skills</li>
              <li>Experience with Agile methodologies</li>
              <li>Strong leadership abilities</li>
            </ul>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
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
              ← Back to Step 2
            </motion.button>
            <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleSkip}
                disabled={loading}
                className={styles.secondaryButton}
                style={{ flex: 1 }}
              >
                Skip →
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={styles.primaryButton}
                style={{ flex: 1 }}
              >
                {loading ? 'Saving...' : 'Continue to Step 4 →'}
              </motion.button>
            </div>
          </motion.div>
        </form>
      </motion.div>

      {/* Step Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className={styles.stepIndicator}
      >
        <span className={styles.inactiveStep}>1. Job Details</span>
        <span className={styles.inactiveStep}>2. Job Summary</span>
        <span className={styles.activeStep}>3. Qualifications</span>
        <span className={styles.inactiveStep}>4. Post Job</span>
      </motion.div>
    </motion.div>
  );
}

function getPlaceholder(index) {
  const examples = [
    'Bachelor\'s Degree in Computer Science',
    '3+ years of experience in management',
    'Proficiency in React and Node.js'
  ];
  return examples[index % examples.length];
}

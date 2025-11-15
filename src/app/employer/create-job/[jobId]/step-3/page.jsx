'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../page.module.css';

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

      if (filledQualifications.length === 0) {
        throw new Error('Please add at least one qualification');
      }

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

  const handlePrevious = () => {
    router.push(`/employer/create-job/${jobId}/step-2`);
  };

  return (
    <div className={styles.container}>
      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div className={styles.progress} style={{ width: '75%' }}></div>
      </div>

      <div className={styles.stepHeader}>
        <h1>Step 3: Qualifications</h1>
        <p>Add the qualifications and skills required for this position</p>
      </div>

      <div className={styles.stepContainer}>
        <form onSubmit={handleNext}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.jobPreview}>
            <strong>Position:</strong> {jobTitle || 'Loading...'}
          </div>

          {/* Qualifications */}
          <div className={styles.formGroup}>
            <label>
              Required Qualifications & Skills <span className={styles.required}>*</span>
            </label>
            <p className={styles.hint}>
              Add the qualifications, skills, education, and experience required for this role
            </p>

            <div className={styles.qualificationsList}>
              {formData.qualifications.map((qualification, index) => (
                <div key={index} className={styles.qualificationItem}>
                  <div className={styles.qualificationIndex}>{index + 1}</div>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => handleChange(index, e.target.value)}
                    placeholder={`e.g., ${getPlaceholder(index)}`}
                    className={styles.input}
                  />
                  {formData.qualifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQualification(index)}
                      className={styles.removeButton}
                      title="Remove qualification"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddQualification}
              className={styles.addButton}
            >
              + Add Another Qualification
            </button>
          </div>

          {/* Tips */}
          <div className={styles.tipsBox}>
            <h3>💡 Examples of Qualifications:</h3>
            <ul>
              <li>Bachelor's Degree in Computer Science</li>
              <li>5+ years of experience in project management</li>
              <li>Proficiency in Python and JavaScript</li>
              <li>Excellent communication skills</li>
              <li>Experience with Agile methodologies</li>
              <li>Strong leadership abilities</li>
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
              ← Back to Step 2
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.primaryButton}
            >
              {loading ? 'Saving...' : 'Continue to Step 4 →'}
            </button>
          </div>
        </form>
      </div>

      {/* Step Indicator */}
      <div className={styles.stepIndicator}>
        <span className={styles.inactiveStep}>1. Job Details</span>
        <span className={styles.inactiveStep}>2. Job Summary</span>
        <span className={styles.activeStep}>3. Qualifications</span>
        <span className={styles.inactiveStep}>4. Post Job</span>
      </div>
    </div>
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

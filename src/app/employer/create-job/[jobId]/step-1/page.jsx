'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../page.module.css';
import { motion } from 'framer-motion';

export default function Step1JobDetails() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId;

  const [formData, setFormData] = useState({
    jobTitle: '',
    employmentType: 'full-time',
    industryType: '',
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-6"
    >
      {/* Progress Bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl mx-auto h-1.5 bg-gray-200 rounded-full overflow-hidden mb-6"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '25%' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-full bg-[#00EA72] rounded-full"
        />
      </motion.div>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Job Details</h1>
        <p className="text-gray-600 text-sm">Provide basic information about the job position</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
      >
        <form onSubmit={handleNext}>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Job Title */}
          <div className="mb-6">
            <label htmlFor="jobTitle" className="block text-gray-900 font-semibold mb-2">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="jobTitle"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="e.g., Senior Software Engineer, Marketing Manager"
              required
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00EA72] focus:border-transparent transition-all"
            />
            <small className="text-gray-500 text-xs mt-1 block">Use a clear and accurate job title</small>
          </div>

          {/* Employment Type */}
          <div className="mb-6">
            <label className="block text-gray-900 font-semibold mb-2">
              Employment Type <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-2">
              {['full-time', 'part-time', 'casual', 'contract'].map(type => (
                <label key={type} className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-[#00EA72] transition-all">
                  <input
                    type="radio"
                    name="employmentType"
                    value={type}
                    checked={formData.employmentType === type}
                    onChange={handleChange}
                    required
                    className="w-4 h-4 accent-[#00EA72]"
                  />
                  <span className="capitalize text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Industry Type */}
          <div className={styles.formGroup}>
            <label htmlFor="industryType">
              Industry Type <span className={styles.required}>*</span>
            </label>
            <p className={styles.hint}>Select the industry this job belongs to</p>
            <select
              id="industryType"
              name="industryType"
              value={formData.industryType}
              onChange={handleChange}
              required
              className={styles.select}
            >
              <option value="">Select an industry</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Construction">Construction</option>
              <option value="Hospitality">Hospitality</option>
              <option value="Transportation">Transportation</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Marketing">Marketing</option>
              <option value="Legal">Legal</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Other">Other</option>
            </select>
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
          <div className="flex gap-3 mt-8">
            <Link href="/home" className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-full text-center hover:bg-gray-50 transition-all">
              ← Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#00EA72] hover:bg-[#00D66C] text-black font-semibold rounded-full transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Continue to Step 2 →'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Step Indicator */}
      <div className="flex justify-center gap-3 mt-6 flex-wrap">
        <span className="px-4 py-2 bg-[#00EA72] text-black rounded-full font-medium text-sm">1. Job Details</span>
        <span className="px-4 py-2 bg-gray-200 text-gray-500 rounded-full font-medium text-sm">2. Job Summary</span>
        <span className="px-4 py-2 bg-gray-200 text-gray-500 rounded-full font-medium text-sm">3. Qualifications</span>
        <span className="px-4 py-2 bg-gray-200 text-gray-500 rounded-full font-medium text-sm">4. Post Job</span>
      </div>
    </motion.div>
  );
}

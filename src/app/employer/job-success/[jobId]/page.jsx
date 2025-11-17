'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00EA72] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link 
            href="/home" 
            className="inline-block bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium px-6 py-3 rounded-full transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-[#00EA72] rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl text-white font-bold">✓</span>
        </div>

        {/* Main Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Job Published Successfully!
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-8">
          Your job posting is now live and visible to job seekers
        </p>

        {/* Job Preview Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{job?.jobDetails?.jobTitle}</h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              🟢 Published
            </span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Employment Type:</span>
              <span className="text-gray-900 dark:text-white">{job?.jobDetails?.employmentType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Shift Preference:</span>
              <span className="text-gray-900 dark:text-white">{job?.jobDetails?.shiftPreference}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Min. Experience:</span>
              <span className="text-gray-900 dark:text-white">{job?.jobDetails?.minimumExperience}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Location:</span>
              <span className="text-gray-900 dark:text-white">{job?.postJob?.workLocation}</span>
            </div>
            {job?.postJob?.salary && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Salary:</span>
                <span className="text-gray-900 dark:text-white">{job?.postJob?.salary}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#00EA72]">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Applications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#00EA72]">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">📋</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">ID: {jobId?.slice(0, 8)}</div>
            </div>
          </div>
        </div>

        {/* Action Steps */}


        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link 
            href="/home" 
            className="bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium px-6 py-3 rounded-full text-center transition-colors"
          >
          Go to Home
          </Link>
          <Link 
            href="/employer/create-job" 
            className="border-2 border-gray-300 dark:border-gray-600 hover:border-[#00EA72] text-gray-900 dark:text-white font-medium px-6 py-3 rounded-full text-center transition-colors"
          >
            Create Another Job
          </Link>
        </div>
      </div>
    </div>
  );
}

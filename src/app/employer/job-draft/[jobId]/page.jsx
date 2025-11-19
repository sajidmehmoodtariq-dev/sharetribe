'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export function generateStaticParams() { return []; }

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

  const completionPercentage = job?.onboarding 
    ? Math.round((Object.values(job.onboarding).filter(v => v === true).length / 4) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Draft Icon */}
        <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">💾</span>
        </div>

        {/* Main Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Job Saved as Draft!
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-8">
          Your job posting is saved. You can publish it whenever you're ready
        </p>

        {/* Completion Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
            <div 
              className="absolute top-0 left-0 h-full bg-[#00EA72] transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            {completionPercentage}% Complete
          </p>
        </div>

        {/* Job Preview Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {job?.jobDetails?.jobTitle}
            </h2>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
              📋 Draft
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Employment Type:</span>
              <span className="text-gray-900 dark:text-white">{job?.jobDetails?.employmentType || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Shift Preference:</span>
              <span className="text-gray-900 dark:text-white">{job?.jobDetails?.shiftPreference || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Min. Experience:</span>
              <span className="text-gray-900 dark:text-white">{job?.jobDetails?.minimumExperience || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Summary:</span>
              <span className="text-gray-900 dark:text-white">{job?.jobSummary?.summary ? '✓ Added' : '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Qualifications:</span>
              <span className="text-gray-900 dark:text-white">
                {job?.qualifications?.qualifications?.length || 0} added
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Location:</span>
              <span className="text-gray-900 dark:text-white">{job?.postJob?.workLocation || '—'}</span>
            </div>
          </div>
        </div>

        {/* Completion Checklist */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">✅ Completion Checklist</h3>
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-lg ${job?.onboarding?.jobDetailsCompleted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
              <div className="flex items-center gap-3">
                <span className={`text-xl ${job?.onboarding?.jobDetailsCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  {job?.onboarding?.jobDetailsCompleted ? '✓' : '○'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">Job Details</span>
              </div>
              <Link href={`/employer/create-job/${jobId}/step-1`} className="text-[#00EA72] hover:text-[#00D66C] text-sm font-medium">
                Edit
              </Link>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg ${job?.onboarding?.jobSummaryCompleted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
              <div className="flex items-center gap-3">
                <span className={`text-xl ${job?.onboarding?.jobSummaryCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  {job?.onboarding?.jobSummaryCompleted ? '✓' : '○'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">Job Summary</span>
              </div>
              <Link href={`/employer/create-job/${jobId}/step-2`} className="text-[#00EA72] hover:text-[#00D66C] text-sm font-medium">
                Edit
              </Link>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg ${job?.onboarding?.qualificationsCompleted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
              <div className="flex items-center gap-3">
                <span className={`text-xl ${job?.onboarding?.qualificationsCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  {job?.onboarding?.qualificationsCompleted ? '✓' : '○'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">Qualifications</span>
              </div>
              <Link href={`/employer/create-job/${jobId}/step-3`} className="text-[#00EA72] hover:text-[#00D66C] text-sm font-medium">
                Edit
              </Link>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg ${job?.onboarding?.postJobCompleted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
              <div className="flex items-center gap-3">
                <span className={`text-xl ${job?.onboarding?.postJobCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  {job?.onboarding?.postJobCompleted ? '✓' : '○'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">Post Job Details</span>
              </div>
              <Link href={`/employer/create-job/${jobId}/step-4`} className="text-[#00EA72] hover:text-[#00D66C] text-sm font-medium">
                Edit
              </Link>
            </div>
          </div>
        </div>

        {/* Why Publish */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🚀 Why Publish Now?</h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span>✨</span>
              <span>Your job will be visible to thousands of job seekers</span>
            </li>
            <li className="flex items-start gap-2">
              <span>📬</span>
              <span>Start receiving applications from interested candidates</span>
            </li>
            <li className="flex items-start gap-2">
              <span>⚡</span>
              <span>The sooner you publish, the sooner you find the right person</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🎯</span>
              <span>Increase visibility by posting quality job descriptions</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 mb-8">
          <button 
            onClick={handlePublishJob}
            disabled={publishing || completionPercentage < 100}
            className="w-full bg-[#00EA72] hover:bg-[#00D66C] disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-bold text-lg py-4 rounded-full transition-colors"
          >
            {publishing ? '🚀 Publishing...' : '🚀 Publish Job Now'}
          </button>
          {completionPercentage < 100 && (
            <p className="text-sm text-center text-yellow-600 dark:text-yellow-400">
              Please complete all steps before publishing
            </p>
          )}
          <Link href="/home" className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium text-lg py-4 rounded-full text-center transition-colors">
            📋 Back to Home
          </Link>
          <Link href={`/employer/create-job/${jobId}/step-1`} className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-[#00EA72] text-gray-900 dark:text-white font-medium text-lg py-4 rounded-full text-center transition-colors">
            ✏️ Continue Editing
          </Link>
        </div>

        {/* Additional Options */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">⚙️ More Options</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📋 View Draft</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Preview how your job posting will look to candidates
              </p>
              <Link href={`/job/${jobId}`} className="text-[#00EA72] hover:text-[#00D66C] text-sm font-medium">
                Preview →
              </Link>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🔄 Edit Any Step</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Go back to any step to modify or update job details
              </p>
              <Link href={`/employer/create-job/${jobId}/step-1`} className="text-[#00EA72] hover:text-[#00D66C] text-sm font-medium">
                Edit Job →
              </Link>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">➕ Create Another</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Start creating a new job posting
              </p>
              <Link href="/employer/create-job" className="text-[#00EA72] hover:text-[#00D66C] text-sm font-medium">
                Create Job →
              </Link>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <h4 className="font-bold text-gray-900 dark:text-white mb-2">ℹ️ Note</h4>
          <p className="text-gray-700 dark:text-gray-300">
            Your job posting will remain in draft status until you choose to publish it. 
            You can make as many changes as you like before publishing. Once published, job seekers 
            will be able to find and apply for your position.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';

export default function JobDetails() {
  const { theme, getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName } = useTheme();
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId;

  const [job, setJob] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

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

    fetchUser();
    fetchJob();
  }, [jobId]);

  const handleApply = async () => {
    if (!user) {
      alert('Please login to apply for this job');
      router.push('/login');
      return;
    }

    if (user.role !== 'jobSeeker') {
      alert('Only job seekers can apply for jobs');
      return;
    }

    setApplying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/applications/apply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            jobId: jobId,
            coverLetter: '',
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to apply for job');
      }

      alert('Application submitted successfully!');
      router.push('/home');
    } catch (err) {
      alert(err.message || 'Failed to apply for job');
    } finally {
      setApplying(false);
    }
  };

  const handleMessageEmployer = async () => {
    if (!user) {
      alert('Please login to message the employer');
      router.push('/login');
      return;
    }

    if (user.role !== 'jobSeeker') {
      alert('Only job seekers can message employers');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Get or create chat
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/job/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Navigate to chats page with the chat selected
        router.push(`/chats?chatId=${data.chat._id}`);
      } else {
        throw new Error('Failed to create chat');
      }
    } catch (err) {
      alert(err.message || 'Failed to start chat');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={getBackgroundStyle()}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00EA72] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={getSubTextClassName()}>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={getBackgroundStyle()}>
        <div className={`${getCardClassName()} rounded-2xl shadow-lg p-8 max-w-md w-full text-center`}>
          <div className="text-6xl mb-4">❌</div>
          <h1 className={`text-2xl font-bold ${getTextClassName()} mb-2`}>Error</h1>
          <p className={`${getSubTextClassName()} mb-6`}>{error}</p>
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
    <div className="min-h-screen" style={getBackgroundStyle()}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className={`flex items-center space-x-2 ${getSubTextClassName()} hover:text-[#00EA72] mb-6 transition-colors`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        {/* Job Header Card */}
        <div className={`${getCardClassName()} rounded-3xl shadow-lg p-6 mb-6`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-white">
                  {(job?.jobDetails?.businessName || job?.businessName || 'Company').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${getTextClassName()} mb-2`}>
                  {job?.jobDetails?.jobTitle || job?.jobTitle || 'Untitled Job'}
                </h1>
                <p className={`text-lg ${getSubTextClassName()} mb-2`}>
                  {job?.jobDetails?.businessName || job?.businessName || 'Company'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    job?.status === 'published' || job?.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {job?.status?.charAt(0).toUpperCase() + job?.status?.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className={`text-xs ${getSubTextClassName()} mb-1`}>Location</p>
              <p className={`text-sm font-medium ${getTextClassName()}`}>
                {job?.postJob?.workLocation || job?.location || 'Remote'}
              </p>
            </div>
            <div>
              <p className={`text-xs ${getSubTextClassName()} mb-1`}>Employment Type</p>
              <p className={`text-sm font-medium ${getTextClassName()}`}>
                {job?.jobDetails?.employmentType || job?.employmentType || 'N/A'}
              </p>
            </div>
            <div>
              <p className={`text-xs ${getSubTextClassName()} mb-1`}>Experience</p>
              <p className={`text-sm font-medium ${getTextClassName()}`}>
                {job?.jobDetails?.minimumExperience || job?.minimumExperience || 'N/A'}
              </p>
            </div>
            <div>
              <p className={`text-xs ${getSubTextClassName()} mb-1`}>Salary</p>
              <p className={`text-sm font-medium ${getTextClassName()}`}>
                {job?.postJob?.salary || job?.salary ? `$${job?.postJob?.salary || job?.salary}` : 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Job Summary */}
        {(job?.jobSummary?.summary || job?.jobDetails?.jobDescription || job?.jobDescription) && (
          <div className={`${getCardClassName()} rounded-3xl shadow-lg p-6 mb-6`}>
            <h2 className={`text-xl font-bold ${getTextClassName()} mb-4`}>Job Summary</h2>
            <p className={`${getSubTextClassName()} whitespace-pre-line`}>
              {job?.jobSummary?.summary || job?.jobDetails?.jobDescription || job?.jobDescription || 'No description available'}
            </p>
          </div>
        )}

        {/* Skills Required */}
        {(job?.qualifications?.essentialSkills?.length > 0 || job?.essentialSkills?.length > 0) && (
          <div className={`${getCardClassName()} rounded-3xl shadow-lg p-6 mb-6`}>
            <h2 className={`text-xl font-bold ${getTextClassName()} mb-4`}>Essential Skills</h2>
            <div className="flex flex-wrap gap-2">
              {(job?.qualifications?.essentialSkills || job?.essentialSkills || []).map((skill, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1.5 bg-[#00EA72] text-white text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Licenses */}
        {(job?.qualifications?.essentialLicenses?.length > 0 || job?.essentialLicenses?.length > 0) && (
          <div className={`${getCardClassName()} rounded-3xl shadow-lg p-6 mb-6`}>
            <h2 className={`text-xl font-bold ${getTextClassName()} mb-4`}>Essential Licenses</h2>
            <div className="flex flex-wrap gap-2">
              {(job?.qualifications?.essentialLicenses || job?.essentialLicenses || []).map((license, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-full"
                >
                  {license}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Additional Details */}
        <div className={`${getCardClassName()} rounded-3xl shadow-lg p-6 mb-6`}>
          <h2 className={`text-xl font-bold ${getTextClassName()} mb-4`}>Additional Details</h2>
          <div className="space-y-3">
            {(job?.jobDetails?.workSchedule || job?.workSchedule) && (
              <div className="flex justify-between">
                <span className={getSubTextClassName()}>Work Schedule:</span>
                <span className={getTextClassName()}>{job?.jobDetails?.workSchedule || job?.workSchedule}</span>
              </div>
            )}
            {(job?.jobDetails?.shiftPreference || job?.shiftPreference) && (
              <div className="flex justify-between">
                <span className={getSubTextClassName()}>Shift Preference:</span>
                <span className={getTextClassName()}>{job?.jobDetails?.shiftPreference || job?.shiftPreference}</span>
              </div>
            )}
            {(job?.postJob?.workLocation || job?.workLocation) && (
              <div className="flex justify-between">
                <span className={getSubTextClassName()}>Work Location:</span>
                <span className={getTextClassName()}>{job?.postJob?.workLocation || job?.workLocation}</span>
              </div>
            )}
            {(job?.postJob?.startDate) && (
              <div className="flex justify-between">
                <span className={getSubTextClassName()}>Start Date:</span>
                <span className={getTextClassName()}>
                  {new Date(job.postJob.startDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {(job?.postJob?.endDate) && (
              <div className="flex justify-between">
                <span className={getSubTextClassName()}>End Date:</span>
                <span className={getTextClassName()}>
                  {new Date(job.postJob.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className={getSubTextClassName()}>Posted:</span>
              <span className={getTextClassName()}>
                {job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons (only for job seekers) */}
        {user?.role === 'jobSeeker' && job?.status === 'published' && (
          <div className="sticky bottom-4 z-10 flex gap-3">
            <button
              onClick={handleMessageEmployer}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg py-4 rounded-full transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Message
            </button>
            <button
              onClick={handleApply}
              disabled={applying}
              className="flex-1 bg-[#00EA72] hover:bg-[#00D66C] disabled:bg-gray-400 text-black font-bold text-lg py-4 rounded-full transition-colors shadow-lg"
            >
              {applying ? 'Applying...' : 'Apply Now'}
            </button>
          </div>
        )}

        {/* Edit Button (for employers viewing their own job) */}
        {user?.role === 'employer' && job?.employerId === user?._id && (
          <div className="sticky bottom-4 z-10">
            <button
              onClick={() => router.push(`/employer/create-job/${jobId}/step-1`)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg py-4 rounded-full transition-colors shadow-lg"
            >
              Edit Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

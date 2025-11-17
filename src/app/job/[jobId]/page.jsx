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
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showApplicantModal, setShowApplicantModal] = useState(false);

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

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user || user.role !== 'employer' || !job || job.employerId !== user._id) return;
      
      setLoadingApplications(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/applications/job/${jobId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setApplications(data.applications || []);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchApplications();
  }, [jobId, user, job]);

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

  const handleChatWithApplicant = async (applicantId) => {
    try {
      const token = localStorage.getItem('token');
      // Get or create chat with applicant
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/job/${jobId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ participantId: applicantId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        router.push(`/chats?chatId=${data.chat._id}`);
      } else {
        throw new Error('Failed to create chat');
      }
    } catch (err) {
      alert(err.message || 'Failed to start chat');
    }
  };

  const handleViewApplicant = (application) => {
    setSelectedApplicant(application);
    setShowApplicantModal(true);
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
            <div>
              <h1 className={`text-2xl font-bold ${getTextClassName()} mb-2`}>
                {job?.jobDetails?.jobTitle || job?.jobTitle || 'Untitled Job'}
              </h1>
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
            <div className="flex justify-between">
              <span className={getSubTextClassName()}>Work Location:</span>
              <span className={getTextClassName()}>{job?.postJob?.workLocation || job?.workLocation || 'Not specified'}</span>
            </div>
            {(job?.postJob?.workLocation === 'on-site' && (job?.postJob?.address || job?.postJob?.city)) && (
              <div className="flex justify-between">
                <span className={getSubTextClassName()}>Address:</span>
                <span className={getTextClassName()}>
                  {[job?.postJob?.address, job?.postJob?.city, job?.postJob?.state, job?.postJob?.postcode]
                    .filter(Boolean)
                    .join(', ') || 'Not specified'}
                </span>
              </div>
            )}
            {job?.jobDetails?.industryType && (
              <div className="flex justify-between">
                <span className={getSubTextClassName()}>Industry Type:</span>
                <span className={getTextClassName()}>{job.jobDetails.industryType}</span>
              </div>
            )}
            {job?.postJob?.numberOfPositions && (
              <div className="flex justify-between">
                <span className={getSubTextClassName()}>Number of Positions:</span>
                <span className={getTextClassName()}>{job.postJob.numberOfPositions}</span>
              </div>
            )}
            {job?.postJob?.applicationDeadline && (
              <div className="flex justify-between">
                <span className={getSubTextClassName()}>Application Deadline:</span>
                <span className={getTextClassName()}>
                  {new Date(job.postJob.applicationDeadline).toLocaleDateString()}
                </span>
              </div>
            )}
            {job?.postJob?.closingDate && (
              <div className="flex justify-between">
                <span className={getSubTextClassName()}>Closing Date:</span>
                <span className={getTextClassName()}>
                  {new Date(job.postJob.closingDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {job?.postJob?.salaryFrequency && (
              <div className="flex justify-between">
                <span className={getSubTextClassName()}>Salary Frequency:</span>
                <span className={getTextClassName()}>{job.postJob.salaryFrequency}</span>
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

        {/* Applicants Section (only for employers viewing their own job) */}
        {user?.role === 'employer' && job?.employerId === user?._id && (
          <div className={`${getCardClassName()} rounded-3xl shadow-lg p-6 mb-6`}>
            <h2 className={`text-xl font-bold ${getTextClassName()} mb-4`}>
              Applicants ({applications.length})
            </h2>
            {loadingApplications ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-[#00EA72] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className={getSubTextClassName()}>Loading applicants...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <p className={getSubTextClassName()}>No applications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((application) => (
                  <div
                    key={application._id}
                    className={`${getCardClassName()} border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer`}
                    onClick={() => handleViewApplicant(application)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-[#00EA72] rounded-full flex items-center justify-center shrink-0">
                          <span className="text-lg font-bold text-white">
                            {(application.applicantId?.personalDetails?.firstName || application.applicantId?.email)?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className={`font-semibold ${getTextClassName()}`}>
                            {application.applicantId?.personalDetails?.firstName || application.applicantId?.email || 'Anonymous'}
                            {application.applicantId?.personalDetails?.lastName && ` ${application.applicantId.personalDetails.lastName}`}
                          </h3>
                          <p className={`text-sm ${getSubTextClassName()}`}>
                            Applied {new Date(application.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChatWithApplicant(application.applicantId._id);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applicant Details Modal */}
        {showApplicantModal && selectedApplicant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowApplicantModal(false)}>
            <div className={`${getCardClassName()} rounded-3xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <h2 className={`text-2xl font-bold ${getTextClassName()}`}>Applicant Details</h2>
                <button
                  onClick={() => setShowApplicantModal(false)}
                  className={`${getSubTextClassName()} hover:text-red-500 transition-colors`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className={`text-lg font-semibold ${getTextClassName()} mb-3`}>Personal Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={getSubTextClassName()}>Name:</span>
                      <span className={getTextClassName()}>
                        {selectedApplicant.applicantId?.personalDetails?.firstName || 'N/A'}
                        {selectedApplicant.applicantId?.personalDetails?.lastName && ` ${selectedApplicant.applicantId.personalDetails.lastName}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={getSubTextClassName()}>Email:</span>
                      <span className={getTextClassName()}>{selectedApplicant.applicantId?.email || 'N/A'}</span>
                    </div>
                    {selectedApplicant.applicantId?.personalDetails?.phone && (
                      <div className="flex justify-between">
                        <span className={getSubTextClassName()}>Phone:</span>
                        <span className={getTextClassName()}>{selectedApplicant.applicantId.personalDetails.phone}</span>
                      </div>
                    )}
                    {selectedApplicant.applicantId?.personalDetails?.location && (
                      <div className="flex justify-between">
                        <span className={getSubTextClassName()}>Location:</span>
                        <span className={getTextClassName()}>{selectedApplicant.applicantId.personalDetails.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Personal Summary */}
                {selectedApplicant.applicantId?.personalSummary && (
                  <div>
                    <h3 className={`text-lg font-semibold ${getTextClassName()} mb-3`}>Personal Summary</h3>
                    <p className={getSubTextClassName()}>{selectedApplicant.applicantId.personalSummary}</p>
                  </div>
                )}

                {/* Work Experience */}
                {selectedApplicant.applicantId?.workExperience?.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold ${getTextClassName()} mb-3`}>Work Experience</h3>
                    <div className="space-y-3">
                      {selectedApplicant.applicantId.workExperience.map((exp, idx) => (
                        <div key={idx} className="border-l-2 border-[#00EA72] pl-4">
                          <p className={`font-semibold ${getTextClassName()}`}>{exp.jobTitle}</p>
                          <p className={getSubTextClassName()}>{exp.company}</p>
                          <p className={`text-sm ${getSubTextClassName()}`}>
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover Letter */}
                {selectedApplicant.coverLetter && (
                  <div>
                    <h3 className={`text-lg font-semibold ${getTextClassName()} mb-3`}>Cover Letter</h3>
                    <p className={getSubTextClassName()}>{selectedApplicant.coverLetter}</p>
                  </div>
                )}

                {/* Application Status */}
                <div>
                  <h3 className={`text-lg font-semibold ${getTextClassName()} mb-3`}>Application Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={getSubTextClassName()}>Status:</span>
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        selectedApplicant.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        selectedApplicant.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        selectedApplicant.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedApplicant.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={getSubTextClassName()}>Applied:</span>
                      <span className={getTextClassName()}>{new Date(selectedApplicant.appliedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      handleChatWithApplicant(selectedApplicant.applicantId._id);
                      setShowApplicantModal(false);
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-full transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Start Chat
                  </button>
                  <button
                    onClick={() => setShowApplicantModal(false)}
                    className="flex-1 border-2 border-gray-300 dark:border-gray-600 hover:border-[#00EA72] font-medium py-3 rounded-full transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

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
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [existingApplication, setExistingApplication] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [assigningApplicant, setAssigningApplicant] = useState(null);

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
    const checkExistingApplication = async () => {
      if (!user || (user.role !== 'jobSeeker' && user.role !== 'employee')) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/applications/my-applications`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const application = data.applications?.find(app => app.jobId?._id === jobId);
          if (application) {
            setExistingApplication(application);
          }
        }
      } catch (err) {
        console.error('Error checking application:', err);
      }
    };

    checkExistingApplication();
  }, [jobId, user]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user || user.role !== 'employer' || !job) return;
      
      // Check if employer owns this job (handle ObjectId comparison)
      const isOwner = job.employerId === user._id || 
                      job.employerId?._id === user._id || 
                      job.employerId?.toString() === user._id?.toString();
      
      if (!isOwner) return;
      
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
          console.log('Fetched applications:', data.applications?.length || 0);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchApplications();
  }, [jobId, user, job]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Only PDF and DOCX files are allowed');
        setResumeFile(null);
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        setResumeFile(null);
        return;
      }
      
      setUploadError('');
      setResumeFile(file);
    }
  };

  const handleOpenApplicationModal = () => {
    if (existingApplication) {
      // Edit mode - populate with existing data
      setIsEditMode(true);
      setCoverLetter(existingApplication.coverLetter || '');
      // Note: Cannot pre-populate file input for security reasons
    } else {
      setIsEditMode(false);
      setCoverLetter('');
      setResumeFile(null);
    }
    setShowApplicationModal(true);
  };

  const handleApply = async () => {
    if (!user) {
      alert('Please login to apply for this job');
      router.push('/login');
      return;
    }

    if (user.role !== 'jobSeeker' && user.role !== 'employee') {
      alert('Only job seekers can apply for jobs');
      return;
    }

    if (!coverLetter.trim()) {
      alert('Please provide a cover letter');
      return;
    }

    // Make CV upload mandatory for new applications
    if (!isEditMode && !resumeFile) {
      alert('Please upload your CV/Resume to apply for this job');
      return;
    }

    // For edit mode, require CV if not already uploaded
    if (isEditMode && !resumeFile && !existingApplication?.resumeUrl) {
      alert('Please upload your CV/Resume');
      return;
    }

    setApplying(true);
    try {
      const token = localStorage.getItem('token');
      
      // Convert file to base64 if present
      let resumeData = null;
      if (resumeFile) {
        const reader = new FileReader();
        resumeData = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(resumeFile);
        });
      }

      let response;
      if (isEditMode && existingApplication) {
        // Update existing application
        response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/applications/${existingApplication._id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              coverLetter: coverLetter,
              resumeUrl: resumeData || existingApplication.resumeUrl,
              resumeFileName: resumeFile?.name || existingApplication.resumeFileName,
              resumeFileSize: resumeFile?.size || existingApplication.resumeFileSize,
            }),
          }
        );
      } else {
        // Create new application
        response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/applications/apply`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              jobId: jobId,
              coverLetter: coverLetter,
              resumeUrl: resumeData,
              resumeFileName: resumeFile?.name,
              resumeFileSize: resumeFile?.size,
            }),
          }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isEditMode ? 'update' : 'submit'} application`);
      }

      alert(`Application ${isEditMode ? 'updated' : 'submitted'} successfully!`);
      setShowApplicationModal(false);
      setCoverLetter('');
      setResumeFile(null);
      setIsEditMode(false);
      
      // Refresh application status
      if (isEditMode) {
        setExistingApplication(data.application);
      } else {
        setExistingApplication(data.application);
      }
    } catch (err) {
      alert(err.message || `Failed to ${isEditMode ? 'update' : 'submit'} application`);
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/job/${jobId}?jobSeekerId=${applicantId}`,
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

  const handleViewApplicant = (application) => {
    setSelectedApplicant(application);
    setShowApplicantModal(true);
  };

  const handleAssignJob = async (applicationId, applicantName) => {
    if (!confirm(`Are you sure you want to assign this job to ${applicantName}? This will mark their application as accepted.`)) {
      return;
    }

    setAssigningApplicant(applicationId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/applications/${applicationId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: 'accepted',
            employerNotes: 'Job assigned to this candidate'
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign job');
      }

      alert('Job assigned successfully!');
      
      // Refresh applications list
      const appsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/applications/job/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setApplications(appsData.applications || []);
      }
      
      // Close modal if open
      if (showApplicantModal) {
        setShowApplicantModal(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to assign job');
    } finally {
      setAssigningApplicant(null);
    }
  };

  const handleCloseJob = async () => {
    if (!window.confirm('Are you sure you want to close this job? It will no longer be visible to job seekers.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobId}/close`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to close job');
      }

      alert('Job closed successfully!');
      
      // Refresh job data
      const jobResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobId}`
      );

      if (jobResponse.ok) {
        const jobData = await jobResponse.json();
        setJob(jobData.job);
      }
    } catch (err) {
      alert(err.message || 'Failed to close job');
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
        {/* Back Button and Apply Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className={`flex items-center space-x-2 ${getSubTextClassName()} hover:text-[#00EA72] transition-colors`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          
          {user && (user.role === 'jobSeeker' || user.role === 'employee') && (
            <button
              onClick={handleOpenApplicationModal}
              className={`${
                existingApplication 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-[#00EA72] hover:bg-[#00D66C]'
              } text-${existingApplication ? 'white' : 'black'} font-semibold px-6 py-3 rounded-full transition-colors shadow-lg hover:shadow-xl flex items-center gap-2`}
            >
              {existingApplication ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Application
                </>
              ) : (
                'Apply for this Job'
              )}
            </button>
          )}
        </div>

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
        {user?.role === 'employer' && job?.employerId && (
          job?.employerId === user?._id || 
          job?.employerId?._id === user?._id || 
          job?.employerId?.toString() === user?._id?.toString()
        ) && (
          <>
            {/* Employer Actions */}
            {job?.status !== 'closed' && (
              <div className={`${getCardClassName()} rounded-3xl shadow-lg p-4 mb-6`}>
                <button
                  onClick={handleCloseJob}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close This Job
                </button>
              </div>
            )}

            <div className={`${getCardClassName()} rounded-3xl shadow-lg p-6 mb-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${getTextClassName()}`}>
                📋 Applicants
              </h2>
              <span className={`px-4 py-2 bg-[#00EA72]/10 text-[#00EA72] rounded-full font-bold`}>
                {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
              </span>
            </div>
            
            {loadingApplications ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-[#00EA72] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className={getSubTextClassName()}>Loading applicants...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className={`text-lg font-medium ${getTextClassName()} mb-2`}>No applications yet</p>
                <p className={getSubTextClassName()}>When candidates apply, they'll appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {applications.map((application) => (
                  <div
                    key={application._id}
                    className={`${getCardClassName()} border-2 ${
                      job.status === 'closed' || !job.isActive 
                        ? 'border-gray-400 opacity-60 grayscale cursor-not-allowed' 
                        : `${theme === 'dark' ? 'border-gray-700 hover:border-[#00EA72]' : 'border-gray-200 hover:border-[#00EA72]'} cursor-pointer hover:shadow-xl`
                    } rounded-2xl p-6 transition-all group`}
                    onClick={() => (job.status !== 'closed' && job.isActive) && handleViewApplicant(application)}
                  >
                    {/* Top Section - Avatar and Info */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 bg-linear-to-br from-[#00EA72] to-[#00D66C] rounded-full flex items-center justify-center shrink-0 shadow-lg">
                        <span className="text-2xl font-bold text-white">
                          {(application.applicantId?.personalDetails?.firstName || application.applicantId?.fullName || application.applicantId?.email)?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Applicant Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-xl font-bold ${getTextClassName()} mb-2`}>
                          {application.applicantId?.personalDetails?.firstName || application.applicantId?.fullName || 'Anonymous'}
                          {application.applicantId?.personalDetails?.lastName && ` ${application.applicantId.personalDetails.lastName}`}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`flex items-center gap-1.5 ${getSubTextClassName()}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(application.appliedAt).toLocaleDateString()}
                          </span>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            application.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            application.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            application.status === 'shortlisted' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                            application.status === 'interviewing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                          {application.resumeFileName && (
                            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                              </svg>
                              Proposal Attached
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom Section - Action Buttons */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      {application.status !== 'accepted' ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignJob(
                                application._id,
                                application.applicantId?.personalDetails?.firstName || application.applicantId?.fullName || 'this candidate'
                              );
                            }}
                            disabled={assigningApplicant === application._id || job.status === 'closed' || !job.isActive}
                            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          >
                            {assigningApplicant === application._id ? (
                              <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Assigning...
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {job.status === 'closed' || !job.isActive ? 'Job Closed' : 'Assign Job'}
                              </>
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChatWithApplicant(application.applicantId._id);
                            }}
                            disabled={job.status === 'closed' || !job.isActive}
                            className="flex-1 bg-[#00EA72] hover:bg-[#00D66C] disabled:bg-gray-400 disabled:cursor-not-allowed text-black px-5 py-3 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {job.status === 'closed' || !job.isActive ? 'Chat Unavailable' : 'Take Interview'}
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-5 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Job Assigned
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChatWithApplicant(application.applicantId._id);
                            }}
                            className="flex-1 bg-[#00EA72] hover:bg-[#00D66C] text-black px-5 py-3 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Take Interview
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        {/* Applicant Details Modal */}
        {showApplicantModal && selectedApplicant && selectedApplicant.applicantId && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowApplicantModal(false)}>
            <div className={`${getCardClassName()} rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`} onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-inherit p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-linear-to-br from-[#00EA72] to-[#00D66C] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white">
                        {(selectedApplicant.applicantId?.personalDetails?.firstName || selectedApplicant.applicantId?.fullName || selectedApplicant.applicantId?.email)?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className={`text-2xl font-bold ${getTextClassName()}`}>
                        {selectedApplicant.applicantId?.personalDetails?.firstName || selectedApplicant.applicantId?.fullName || 'Anonymous'}
                        {selectedApplicant.applicantId?.personalDetails?.lastName && ` ${selectedApplicant.applicantId.personalDetails.lastName}`}
                      </h2>
                      <p className={`text-sm ${getSubTextClassName()} mt-1`}>
                        Applied on {new Date(selectedApplicant.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowApplicantModal(false)}
                    className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${getSubTextClassName()} hover:text-red-500 transition-all`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Cover Letter Section - Prominent */}
                {selectedApplicant.coverLetter && (
                  <div className={`border-2 ${theme === 'dark' ? 'border-[#00EA72]/30 bg-[#00EA72]/5' : 'border-[#00EA72]/20 bg-[#00EA72]/5'} rounded-2xl p-6`}>
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-6 h-6 text-[#00EA72]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className={`text-xl font-bold ${getTextClassName()}`}>Cover Letter</h3>
                    </div>
                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 shadow-inner`}>
                      <p className={`${getTextClassName()} leading-relaxed whitespace-pre-wrap text-base`}>
                        {selectedApplicant.coverLetter}
                      </p>
                    </div>
                  </div>
                )}

                {/* Resume/Proposal Download Section - Prominent */}
                {selectedApplicant.resumeUrl && selectedApplicant.resumeFileName && (
                  <div className={`border-2 ${theme === 'dark' ? 'border-blue-500/30 bg-blue-500/5' : 'border-blue-500/20 bg-blue-50'} rounded-2xl p-6`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${getTextClassName()}`}>Resume / Proposal</h3>
                          <p className={`text-sm ${getSubTextClassName()} mt-1`}>
                            {selectedApplicant.resumeFileName}
                            {selectedApplicant.resumeFileSize && (
                              <span> • {(selectedApplicant.resumeFileSize / 1024).toFixed(2)} KB</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <a
                        href={selectedApplicant.resumeUrl}
                        download={selectedApplicant.resumeFileName}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                    </div>
                  </div>
                )}

                {/* Personal Information */}
                <div className={`border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-2xl p-6`}>
                  <h3 className={`text-lg font-bold ${getTextClassName()} mb-4 flex items-center gap-2`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className={`text-sm ${getSubTextClassName()}`}>Email</span>
                      <p className={`font-medium ${getTextClassName()} mt-1`}>{selectedApplicant.applicantId?.email || 'N/A'}</p>
                    </div>
                    {selectedApplicant.applicantId?.personalDetails?.phone && (
                      <div>
                        <span className={`text-sm ${getSubTextClassName()}`}>Phone</span>
                        <p className={`font-medium ${getTextClassName()} mt-1`}>{selectedApplicant.applicantId.personalDetails.phone}</p>
                      </div>
                    )}
                    {selectedApplicant.applicantId?.personalDetails?.location && (
                      <div>
                        <span className={`text-sm ${getSubTextClassName()}`}>Location</span>
                        <p className={`font-medium ${getTextClassName()} mt-1`}>{selectedApplicant.applicantId.personalDetails.location}</p>
                      </div>
                    )}
                    <div>
                      <span className={`text-sm ${getSubTextClassName()}`}>Status</span>
                      <span className={`inline-block px-3 py-1 mt-1 rounded-full text-xs font-semibold ${
                        selectedApplicant.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        selectedApplicant.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        selectedApplicant.status === 'shortlisted' ? 'bg-purple-100 text-purple-800' :
                        selectedApplicant.status === 'interviewing' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedApplicant.status.charAt(0).toUpperCase() + selectedApplicant.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Personal Summary */}
                {(selectedApplicant.applicantId?.personalSummary?.summary || selectedApplicant.applicantId?.personalSummary) && (
                  <div className={`border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-2xl p-6`}>
                    <h3 className={`text-lg font-bold ${getTextClassName()} mb-3`}>About</h3>
                    <p className={`${getSubTextClassName()} leading-relaxed`}>
                      {typeof selectedApplicant.applicantId.personalSummary === 'object' 
                        ? selectedApplicant.applicantId.personalSummary.summary 
                        : selectedApplicant.applicantId.personalSummary}
                    </p>
                  </div>
                )}

                {/* Work Experience */}
                {selectedApplicant.applicantId?.workExperience?.length > 0 && (
                  <div className={`border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-2xl p-6`}>
                    <h3 className={`text-lg font-bold ${getTextClassName()} mb-4 flex items-center gap-2`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v2a2 2 0 002 2M8 6v2a2 2 0 002 2" />
                      </svg>
                      Work Experience
                    </h3>
                    <div className="space-y-4">
                      {selectedApplicant.applicantId.workExperience.map((exp, idx) => (
                        <div key={idx} className={`border-l-4 border-[#00EA72] pl-4 ${idx !== 0 ? 'pt-4' : ''}`}>
                          <p className={`font-bold ${getTextClassName()} text-base`}>{exp.jobTitle}</p>
                          <p className={`${getSubTextClassName()} font-medium mt-1`}>{exp.company}</p>
                          <p className={`text-sm ${getSubTextClassName()} mt-1`}>
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer - Action Buttons */}
              <div className="sticky bottom-0 bg-inherit p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  {selectedApplicant.status !== 'accepted' && (
                    <button
                      onClick={() => handleAssignJob(
                        selectedApplicant._id,
                        selectedApplicant.applicantId?.personalDetails?.firstName || selectedApplicant.applicantId?.fullName || 'this candidate'
                      )}
                      disabled={assigningApplicant === selectedApplicant._id}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {assigningApplicant === selectedApplicant._id ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Assigning...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Assign Job to This Candidate
                        </>
                      )}
                    </button>
                  )}
                  {selectedApplicant.status === 'accepted' && (
                    <div className="flex-1 bg-green-100 text-green-800 font-semibold py-3 rounded-full flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Job Already Assigned
                    </div>
                  )}
                  <button
                    onClick={() => {
                      handleChatWithApplicant(selectedApplicant.applicantId._id);
                      setShowApplicantModal(false);
                    }}
                    className="flex-1 bg-[#00EA72] hover:bg-[#00D66C] text-black font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Take Interview
                  </button>
                  <button
                    onClick={() => setShowApplicantModal(false)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-full transition-colors shadow-lg hover:shadow-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
        )}

        {/* Application Modal */}
        {showApplicationModal && (
          <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => {
              if (!applying) {
                setShowApplicationModal(false);
                setCoverLetter('');
                setResumeFile(null);
                setUploadError('');
                setIsEditMode(false);
              }
            }}
          >
            <div 
              className={`${getCardClassName()} rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-inherit p-6 border-b border-gray-200 dark:border-gray-700 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-2xl font-bold ${getTextClassName()}`}>
                      {isEditMode ? 'Edit Application' : 'Apply for this Job'}
                    </h2>
                    <p className={`text-sm ${getSubTextClassName()} mt-1`}>
                      {job?.jobDetails?.jobTitle || 'Job Position'}
                    </p>
                    {isEditMode && existingApplication && (
                      <p className={`text-xs ${getSubTextClassName()} mt-1`}>
                        Applied on {new Date(existingApplication.appliedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (!applying) {
                        setShowApplicationModal(false);
                        setCoverLetter('');
                        setResumeFile(null);
                        setUploadError('');
                        setIsEditMode(false);
                      }
                    }}
                    className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${getSubTextClassName()} hover:text-red-500 transition-all`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Cover Letter */}
                <div>
                  <label className={`block text-sm font-semibold ${getTextClassName()} mb-2`}>
                    Cover Letter <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={10}
                    maxLength={2000}
                    placeholder="Tell the employer why you're a great fit for this position..."
                    className={`w-full px-4 py-3 border-2 ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'
                    } rounded-xl ${getTextClassName()} focus:border-[#00EA72] focus:ring-2 focus:ring-[#00EA72]/20 outline-none resize-none transition-all`}
                  />
                  <p className={`text-xs ${getSubTextClassName()} mt-1 text-right`}>
                    {coverLetter.length} / 2000 characters
                  </p>
                </div>

                {/* File Upload */}
                <div>
                  <label className={`block text-sm font-semibold ${getTextClassName()} mb-2`}>
                    Upload Resume/CV <span className="text-red-500">*</span>
                  </label>
                  <p className={`text-xs ${getSubTextClassName()} mb-3`}>
                    Supported formats: PDF, DOCX (Max size: 5MB) - <span className="text-red-500 font-semibold">Required</span>
                  </p>
                  
                  {isEditMode && existingApplication?.resumeFileName && !resumeFile && (
                    <div className={`mb-3 p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className={`text-sm font-medium ${getTextClassName()}`}>Current: {existingApplication.resumeFileName}</p>
                            <p className={`text-xs ${getSubTextClassName()}`}>
                              {existingApplication.resumeFileSize ? `${(existingApplication.resumeFileSize / 1024).toFixed(2)} KB` : 'File attached'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className={`text-xs ${getSubTextClassName()} mt-2`}>
                        Upload a new file to replace the current one
                      </p>
                    </div>
                  )}
                  
                  <div className="relative">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="resume-upload"
                      className={`block w-full px-4 py-6 border-2 border-dashed ${
                        theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
                      } rounded-xl cursor-pointer hover:border-[#00EA72] transition-all text-center`}
                    >
                      <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {resumeFile ? (
                        <div>
                          <p className={`text-sm font-medium ${getTextClassName()}`}>{resumeFile.name}</p>
                          <p className={`text-xs ${getSubTextClassName()} mt-1`}>
                            {(resumeFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className={`text-sm font-medium ${getTextClassName()}`}>Click to upload file</p>
                          <p className={`text-xs ${getSubTextClassName()} mt-1`}>or drag and drop</p>
                        </div>
                      )}
                    </label>
                  </div>

                  {uploadError && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {uploadError}
                    </p>
                  )}

                  {resumeFile && (
                    <button
                      onClick={() => {
                        setResumeFile(null);
                        setUploadError('');
                      }}
                      className="mt-2 text-sm text-red-500 hover:text-red-600 font-medium"
                    >
                      Remove file
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-inherit p-6 border-t border-gray-200 dark:border-gray-700 rounded-b-3xl">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (!applying) {
                        setShowApplicationModal(false);
                        setCoverLetter('');
                        setResumeFile(null);
                        setUploadError('');
                        setIsEditMode(false);
                      }
                    }}
                    disabled={applying}
                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={applying || !coverLetter.trim() || (!isEditMode && !resumeFile) || (isEditMode && !resumeFile && !existingApplication?.resumeUrl)}
                    className="flex-1 bg-[#00EA72] hover:bg-[#00D66C] disabled:bg-gray-400 text-black font-bold py-3 rounded-full transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isEditMode ? 'Updating...' : 'Submitting...'}
                      </span>
                    ) : (
                      isEditMode ? 'Update Application' : 'Submit Application'
                    )}
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

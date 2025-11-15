'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function MyJobsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, draft, published, closed
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    published: 0,
    closed: 0,
    applications: 0
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'employer') {
        fetchEmployerJobs();
      } else if (user.role === 'jobSeeker') {
        fetchJobSeekerApplications();
      }
    }
  }, [user, activeTab]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        router.push('/login');
        return;
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    }
  };

  const fetchEmployerJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let query = '';
      if (activeTab !== 'all') {
        query = `?status=${activeTab}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/employer/${user._id}${query}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        calculateEmployerStats(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobSeekerApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let query = '';
      if (activeTab !== 'all') {
        query = `?status=${activeTab}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/applications/my-applications${query}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
        calculateJobSeekerStats(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEmployerStats = (jobList) => {
    const newStats = {
      total: jobList.length,
      draft: jobList.filter(j => j.status === 'draft').length,
      published: jobList.filter(j => j.status === 'published').length,
      closed: jobList.filter(j => j.status === 'closed' || j.status === 'filled').length,
      applications: jobList.reduce((sum, j) => sum + (j.totalApplications || 0), 0)
    };
    setStats(newStats);
  };

  const calculateJobSeekerStats = (appList) => {
    const newStats = {
      total: appList.length,
      pending: appList.filter(a => a.status === 'pending').length,
      reviewing: appList.filter(a => a.status === 'reviewing' || a.status === 'shortlisted').length,
      accepted: appList.filter(a => a.status === 'accepted').length,
      rejected: appList.filter(a => a.status === 'rejected').length
    };
    setStats(newStats);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: '#ff9800', label: '📝 Draft' },
      published: { color: '#00ff00', label: '✓ Published' },
      closed: { color: '#f44336', label: '🔒 Closed' },
      filled: { color: '#9c27b0', label: '✓ Filled' },
      archived: { color: '#757575', label: '📦 Archived' },
      pending: { color: '#ff9800', label: '⏳ Pending' },
      reviewing: { color: '#2196f3', label: '👀 Reviewing' },
      shortlisted: { color: '#00bcd4', label: '⭐ Shortlisted' },
      interviewing: { color: '#9c27b0', label: '🎤 Interviewing' },
      accepted: { color: '#4caf50', label: '✓ Accepted' },
      rejected: { color: '#f44336', label: '✗ Rejected' },
      withdrawn: { color: '#757575', label: '↩ Withdrawn' }
    };

    const config = statusConfig[status] || { color: '#757575', label: status };
    
    return (
      <span className={styles.statusBadge} style={{ borderColor: config.color, color: config.color }}>
        {config.label}
      </span>
    );
  };

  const filteredJobs = jobs.filter(job => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      job.jobDetails?.jobTitle?.toLowerCase().includes(searchLower) ||
      job.companyName?.toLowerCase().includes(searchLower) ||
      job.postJob?.city?.toLowerCase().includes(searchLower)
    );
  });

  const filteredApplications = applications.filter(app => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      app.jobId?.jobDetails?.jobTitle?.toLowerCase().includes(searchLower) ||
      app.jobId?.companyName?.toLowerCase().includes(searchLower)
    );
  });

  if (loading && !user) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerTop}>
          <h1>My Jobs</h1>
          {user?.role === 'employer' && (
            <Link href="/employer/create-job" className={styles.createButton}>
              + Create New Job
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        {user?.role === 'employer' ? (
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{stats.total}</span>
              <span className={styles.statLabel}>Total Jobs</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{stats.draft}</span>
              <span className={styles.statLabel}>Drafts</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{stats.published}</span>
              <span className={styles.statLabel}>Published</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{stats.applications}</span>
              <span className={styles.statLabel}>Applications</span>
            </div>
          </div>
        ) : (
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{stats.total}</span>
              <span className={styles.statLabel}>Total Applications</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{stats.pending}</span>
              <span className={styles.statLabel}>Pending</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{stats.reviewing}</span>
              <span className={styles.statLabel}>Under Review</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{stats.accepted}</span>
              <span className={styles.statLabel}>Accepted</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={styles.controlsSection}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder={user?.role === 'employer' ? 'Search jobs...' : 'Search applications...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${activeTab === 'all' ? styles.active : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          
          {user?.role === 'employer' ? (
            <>
              <button
                className={`${styles.filterButton} ${activeTab === 'draft' ? styles.active : ''}`}
                onClick={() => setActiveTab('draft')}
              >
                Drafts
              </button>
              <button
                className={`${styles.filterButton} ${activeTab === 'published' ? styles.active : ''}`}
                onClick={() => setActiveTab('published')}
              >
                Published
              </button>
              <button
                className={`${styles.filterButton} ${activeTab === 'closed' ? styles.active : ''}`}
                onClick={() => setActiveTab('closed')}
              >
                Closed
              </button>
            </>
          ) : (
            <>
              <button
                className={`${styles.filterButton} ${activeTab === 'pending' ? styles.active : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                Pending
              </button>
              <button
                className={`${styles.filterButton} ${activeTab === 'reviewing' ? styles.active : ''}`}
                onClick={() => setActiveTab('reviewing')}
              >
                Reviewing
              </button>
              <button
                className={`${styles.filterButton} ${activeTab === 'accepted' ? styles.active : ''}`}
                onClick={() => setActiveTab('accepted')}
              >
                Accepted
              </button>
              <button
                className={`${styles.filterButton} ${activeTab === 'rejected' ? styles.active : ''}`}
                onClick={() => setActiveTab('rejected')}
              >
                Rejected
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={styles.jobsContainer}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading...</p>
          </div>
        ) : user?.role === 'employer' ? (
          // Employer View
          filteredJobs.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📋</span>
              <h2>No Jobs Found</h2>
              <p>
                {activeTab === 'all' 
                  ? "You haven't created any jobs yet."
                  : `No ${activeTab} jobs found.`}
              </p>
              <Link href="/employer/create-job" className={styles.primaryButton}>
                Create Your First Job
              </Link>
            </div>
          ) : (
            <div className={styles.jobsList}>
              {filteredJobs.map((job) => (
                <div key={job._id} className={styles.jobListItem}>
                  <div className={styles.jobItemHeader}>
                    <div className={styles.jobItemTitle}>
                      <h3>{job.jobDetails?.jobTitle || 'Untitled Job'}</h3>
                      {getStatusBadge(job.status)}
                    </div>
                  </div>

                  <div className={styles.jobItemDetails}>
                    <div className={styles.detailItem}>
                      <strong>Company:</strong> {job.companyName}
                    </div>
                    {job.postJob?.city && (
                      <div className={styles.detailItem}>
                        <strong>Location:</strong> {job.postJob.city}, {job.postJob.state}
                      </div>
                    )}
                    {job.jobDetails?.employmentType && (
                      <div className={styles.detailItem}>
                        <strong>Type:</strong> {job.jobDetails.employmentType}
                      </div>
                    )}
                    <div className={styles.detailItem}>
                      <strong>Applications:</strong> {job.totalApplications || 0}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Views:</strong> {job.views || 0}
                    </div>
                  </div>

                  {job.jobSummary?.summary && (
                    <p className={styles.jobSummary}>{job.jobSummary.summary}</p>
                  )}

                  {job.status === 'draft' && (
                    <div className={styles.progressContainer}>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill} 
                          style={{ width: `${job.completionPercentage || 0}%` }}
                        />
                      </div>
                      <span className={styles.progressText}>
                        {job.completionPercentage || 0}% Complete
                      </span>
                    </div>
                  )}

                  <div className={styles.jobItemMeta}>
                    <div className={styles.metaLeft}>
                      <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                      {job.publishDate && (
                        <span>Published: {new Date(job.publishDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className={styles.metaRight}>
                      {job.status === 'draft' ? (
                        <Link 
                          href={`/employer/create-job/${job._id}/step-${job.onboarding?.currentStep || 1}`}
                          className={styles.actionLink}
                        >
                          Continue Editing →
                        </Link>
                      ) : (
                        <>
                          <Link 
                            href={`/employer/job/${job._id}`}
                            className={styles.actionLink}
                          >
                            View Details →
                          </Link>
                          {job.totalApplications > 0 && (
                            <Link 
                              href={`/employer/job/${job._id}/applications`}
                              className={styles.actionLink}
                            >
                              View Applications ({job.totalApplications}) →
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Job Seeker View
          filteredApplications.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>💼</span>
              <h2>No Applications Found</h2>
              <p>
                {activeTab === 'all' 
                  ? "You haven't applied to any jobs yet."
                  : `No ${activeTab} applications found.`}
              </p>
              <Link href="/jobs" className={styles.primaryButton}>
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className={styles.jobsList}>
              {filteredApplications.map((application) => (
                <div key={application._id} className={styles.jobListItem}>
                  <div className={styles.jobItemHeader}>
                    <div className={styles.jobItemTitle}>
                      <h3>{application.jobId?.jobDetails?.jobTitle || 'Job Title'}</h3>
                      {getStatusBadge(application.status)}
                    </div>
                  </div>

                  <div className={styles.jobItemDetails}>
                    <div className={styles.detailItem}>
                      <strong>Company:</strong> {application.jobId?.companyName}
                    </div>
                    {application.jobId?.postJob?.city && (
                      <div className={styles.detailItem}>
                        <strong>Location:</strong> {application.jobId.postJob.city}, {application.jobId.postJob.state}
                      </div>
                    )}
                    {application.jobId?.jobDetails?.employmentType && (
                      <div className={styles.detailItem}>
                        <strong>Type:</strong> {application.jobId.jobDetails.employmentType}
                      </div>
                    )}
                    {application.jobId?.postJob?.salary && (
                      <div className={styles.detailItem}>
                        <strong>Salary:</strong> ${application.jobId.postJob.salary} {application.jobId.postJob.salaryFrequency}
                      </div>
                    )}
                  </div>

                  {application.interviewScheduled && application.interviewDate && (
                    <div className={styles.interviewNotice}>
                      <strong>🎤 Interview Scheduled:</strong> {new Date(application.interviewDate).toLocaleString()}
                      {application.interviewLocation && ` at ${application.interviewLocation}`}
                    </div>
                  )}

                  <div className={styles.jobItemMeta}>
                    <div className={styles.metaLeft}>
                      <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                      {application.statusUpdatedAt && application.status !== 'pending' && (
                        <span>Updated: {new Date(application.statusUpdatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className={styles.metaRight}>
                      <Link 
                        href={`/application/${application._id}`}
                        className={styles.actionLink}
                      >
                        View Application →
                      </Link>
                      {application.status === 'pending' && (
                        <button
                          onClick={() => handleWithdraw(application._id)}
                          className={styles.withdrawButton}
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );

  async function handleWithdraw(applicationId) {
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/applications/${applicationId}/withdraw`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        alert('Application withdrawn successfully');
        fetchJobSeekerApplications();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to withdraw application');
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
      alert('An error occurred');
    }
  }
}

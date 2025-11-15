'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function EmployerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, published, draft, closed
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check authentication and fetch jobs
    const fetchData = async () => {
      try {
        // Get current user
        const userResponse = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        });

        if (!userResponse.ok) {
          router.push('/login');
          return;
        }

        const userData = await userResponse.json();
        
        // Verify employer role
        if (userData.user.role !== 'employer') {
          setError('Access denied. Only employers can access this page.');
          setLoading(false);
          return;
        }

        setUser(userData.user);

        // Fetch jobs
        let query = `?page=1&limit=20`;
        if (filter !== 'all') {
          query += `&status=${filter}`;
        }

        const jobsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/employer/${userData.user._id}${query}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (!jobsResponse.ok) {
          throw new Error('Failed to fetch jobs');
        }

        const jobsData = await jobsResponse.json();
        setJobs(jobsData.jobs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, router]);

  const filteredJobs = jobs.filter(job => 
    job.jobDetails?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'published': return '#00ff00';
      case 'draft': return '#ffdd00';
      case 'closed': return '#ff8888';
      case 'filled': return '#00ccff';
      default: return '#aaa';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'published': return '✓';
      case 'draft': return '💾';
      case 'closed': return '🔒';
      case 'filled': return '✅';
      default: return '○';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading your jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>❌ Error</h2>
          <p>{error}</p>
          <Link href="/" className={styles.primaryButton}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerTop}>
          <h1>📋 My Job Listings</h1>
          <div className={styles.headerActions}>
            <Link href="/employer/create-job" className={styles.createButton}>
              ➕ Create New Job
            </Link>
            <button className={styles.settingsButton}>⚙️</button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{jobs.length}</span>
            <span className={styles.statLabel}>Total Jobs</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {jobs.filter(j => j.status === 'published').length}
            </span>
            <span className={styles.statLabel}>Published</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {jobs.reduce((sum, j) => sum + (j.totalApplications || 0), 0)}
            </span>
            <span className={styles.statLabel}>Applications</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {jobs.reduce((sum, j) => sum + (j.views || 0), 0)}
            </span>
            <span className={styles.statLabel}>Views</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className={styles.controlsSection}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="🔍 Search jobs by title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterButtons}>
          {['all', 'published', 'draft', 'closed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`${styles.filterButton} ${filter === status ? styles.active : ''}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Job List */}
      <div className={styles.jobsContainer}>
        {filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h2>No jobs found</h2>
            <p>
              {filter === 'all' 
                ? 'You haven\'t created any jobs yet. Create your first job posting!'
                : `You don't have any ${filter} jobs.`}
            </p>
            <Link href="/employer/create-job" className={styles.primaryButton}>
              Create First Job
            </Link>
          </div>
        ) : (
          <div className={styles.jobsList}>
            {filteredJobs.map((job) => (
              <div key={job._id} className={styles.jobListItem}>
                {/* Job Header */}
                <div className={styles.jobItemHeader}>
                  <div className={styles.jobItemTitle}>
                    <h3>{job.jobDetails?.jobTitle}</h3>
                    <span 
                      className={styles.statusBadge}
                      style={{ borderColor: getStatusColor(job.status) }}
                    >
                      {getStatusIcon(job.status)} {job.status}
                    </span>
                  </div>
                  <div className={styles.jobItemActions}>
                    <button className={styles.actionButton} title="Edit">
                      ✏️
                    </button>
                    <button className={styles.actionButton} title="View">
                      👁️
                    </button>
                    <button className={styles.actionButton} title="More">
                      ⋮
                    </button>
                  </div>
                </div>

                {/* Job Details Row */}
                <div className={styles.jobItemDetails}>
                  <span className={styles.detailItem}>
                    📍 {job.postJob?.workLocation || 'Location TBD'}
                  </span>
                  <span className={styles.detailItem}>
                    💼 {job.jobDetails?.employmentType}
                  </span>
                  <span className={styles.detailItem}>
                    📊 {job.totalApplications || 0} applications
                  </span>
                  <span className={styles.detailItem}>
                    👁️ {job.views || 0} views
                  </span>
                </div>

                {/* Job Summary */}
                <p className={styles.jobSummary}>
                  {job.jobSummary?.summary?.substring(0, 120)}...
                </p>

                {/* Job Meta */}
                <div className={styles.jobItemMeta}>
                  <div className={styles.metaLeft}>
                    <span>📅 Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                    {job.status === 'published' && job.publishDate && (
                      <span>🚀 Published: {new Date(job.publishDate).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className={styles.metaRight}>
                    {job.status === 'draft' && (
                      <Link 
                        href={`/employer/create-job/${job._id}/step-1`}
                        className={styles.actionLink}
                      >
                        Continue →
                      </Link>
                    )}
                    {job.status === 'published' && (
                      <Link 
                        href={`/employer/job/${job._id}`}
                        className={styles.actionLink}
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Progress Bar (for draft jobs) */}
                {job.status === 'draft' && (
                  <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ 
                          width: `${job.completionPercentage || 50}%`
                        }}
                      ></div>
                    </div>
                    <span className={styles.progressText}>
                      {job.completionPercentage || 50}% Complete
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className={styles.footerCta}>
        <h2>Ready to hire?</h2>
        <p>Post a job and find qualified candidates instantly</p>
        <Link href="/employer/create-job" className={styles.ctaButton}>
          Post a Job Now →
        </Link>
      </div>
    </div>
  );
}

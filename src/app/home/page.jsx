'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';
import { Bell, User, Menu, Calendar, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const { theme, getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName, getInputClassName } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [myJobs, setMyJobs] = useState([]); // Employer's created jobs or Job seeker's applications
  const [allJobs, setAllJobs] = useState([]); // All published jobs
  const [savedJobs, setSavedJobs] = useState([]); // Job seeker's saved/favorited jobs
  const [jobsLoading, setJobsLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('');
  const [selectedWorkLocation, setSelectedWorkLocation] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [businessSearchQuery, setBusinessSearchQuery] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [sortBy, setSortBy] = useState('Relevance');
  const [favoriteJobs, setFavoriteJobs] = useState(new Set()); // Start with empty set, will be populated from backend
  const [favoriteLoadingJobs, setFavoriteLoadingJobs] = useState(new Set()); // Track which jobs are being favorited
  const [connectionSearchQuery, setConnectionSearchQuery] = useState('');
  const [sortConnectionsBy, setSortConnectionsBy] = useState('Alphabetical');
  const [employees, setEmployees] = useState([]); // For employers to browse employees
  const [connections, setConnections] = useState([]); // Accepted connections
  const [pendingRequests, setPendingRequests] = useState([]); // Pending requests received
  const [sentRequests, setSentRequests] = useState([]); // Requests sent by user
  const [networkLoading, setNetworkLoading] = useState(false);
  const [connectionRequestLoading, setConnectionRequestLoading] = useState(new Set());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    profileImage: '',
    summary: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentBanner, setShowPaymentBanner] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [editJobForm, setEditJobForm] = useState({
    // Job Details
    jobTitle: '',
    employmentType: '',
    industryType: '',
    minimumExperience: '',
    // Job Summary
    summary: '',
    // Qualifications
    qualifications: [],
    // Post Job Details
    salary: '',
    salaryMin: '',
    salaryMax: '',
    salaryFrequency: 'hourly',
    numberOfPositions: 1,
    applicationDeadline: '',
    closingDate: '',
    workLocation: '',
    address: '',
    city: '',
    state: '',
    postcode: '',
    country: 'Australia'
  });
  const [editJobStep, setEditJobStep] = useState(1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login/role-selection');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Initial user fetch - Subscription Status:', data.user.subscriptionStatus);
          setUser(data.user);
          
          // Show payment banner ONLY if user doesn't have active subscription
          const hasActiveSubscription = data.user.subscriptionStatus === 'active';
          console.log('💳 Has active subscription:', hasActiveSubscription);
          setShowPaymentBanner(!hasActiveSubscription);
          
          // Set initial tab based on role
          if (data.user.role === 'employer') {
            setActiveTab('My Jobs');
          } else {
            setActiveTab('Search Jobs');
          }
          
          // Initialize edit form with user data
          const dob = data.user?.personalDetails?.dateOfBirth;
          let formattedDob = '';
          if (dob) {
            // Handle both string and MongoDB date object
            const dateObj = typeof dob === 'string' ? new Date(dob) : new Date(dob.$date?.$numberLong ? parseInt(dob.$date.$numberLong) : dob);
            formattedDob = dateObj.toISOString().split('T')[0];
          }
          setEditForm({
            fullName: data.user?.fullName || '',
            email: data.user?.email || '',
            phoneNumber: data.user?.mobileNumber || data.user?.phoneNumber || '',
            dateOfBirth: formattedDob,
            address: data.user?.personalDetails?.address || '',
            profileImage: data.user?.personalDetails?.profileImage || '',
            summary: data.user?.personalSummary?.summary || ''
          });
        } else {
          router.push('/login/role-selection');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/login/role-selection');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Handle payment success/cancel from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    const onboardingStatus = urlParams.get('onboarding');
    
    if (paymentStatus === 'success' && sessionId) {
      // Verify Stripe session and update database
      const verifyPayment = async () => {
        try {
          console.log('Verifying Stripe session:', sessionId);
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stripe/verify-session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          });

          const data = await response.json();
          console.log('Verification response:', data);
          console.log('Response status:', response.status, response.ok);
          console.log('User from verification:', data.user);

          if (!response.ok) {
            // If verification fails, retry after delay
            console.log('❌ Verification failed, retrying in 3 seconds...');
            console.log('Error:', data.error);
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stripe/verify-session`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ sessionId }),
            });
            
            const retryData = await retryResponse.json();
            
            if (!retryResponse.ok) {
              console.error('❌ Payment verification failed after retry:', retryData.error);
              alert('Payment verification failed. Please contact support.');
              return;
            }
            
            console.log('✅ Payment verified on retry');
            
            // Update token and user from retry data
            if (retryData.token) {
              localStorage.setItem('token', retryData.token);
            }
            if (retryData.user) {
              setUser(retryData.user);
              console.log('User subscription status from retry:', retryData.user.subscriptionStatus);
            }
          } else {
            console.log('✅ Payment verified successfully');
            
            // Update token and user from initial verification
            if (data.token) {
              localStorage.setItem('token', data.token);
            }
            if (data.user) {
              setUser(data.user);
              console.log('User subscription status:', data.user.subscriptionStatus);
            }
          }
          
          // Remove payment banner immediately
          localStorage.removeItem('showPaymentBanner');
          setShowPaymentBanner(false);
          
          // Clean URL
          window.history.replaceState({}, '', '/home');
          
          // Refresh user data to get updated subscription status
          const token = localStorage.getItem('token');
          const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('✅ User data refreshed, subscription status:', userData.user.subscriptionStatus);
            
            // Update state immediately
            setUser(userData.user);
            setShowPaymentBanner(userData.user.subscriptionStatus !== 'active');
            
            // Force reload to refetch jobs with new subscription status
            console.log('🔄 Reloading page to show unlocked features...');
            window.location.reload();
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          alert('Failed to verify payment. Please refresh the page.');
        }
      };
      
      verifyPayment();
    } else if (paymentStatus === 'success') {
      // Payment success without session_id (shouldn't happen normally)
      console.warn('Payment success without session_id');
      localStorage.removeItem('showPaymentBanner');
      setShowPaymentBanner(false);
      window.history.replaceState({}, '', '/home');
      window.location.reload();
    } else if (onboardingStatus === 'complete') {
      // Onboarding just completed, remove banner and refresh
      localStorage.removeItem('showPaymentBanner');
      setShowPaymentBanner(false);
      
      // Clean URL
      window.history.replaceState({}, '', '/home');
      
      // Force reload to refresh subscription status
      window.location.reload();
    } else if (paymentStatus === 'cancelled') {
      // Clean URL
      window.history.replaceState({}, '', '/home');
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Poll notifications every 30 seconds
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch jobs based on user role
  useEffect(() => {
    if (user) {
      fetchMyJobs();
      fetchAllJobs();
      if (user.role === 'jobSeeker' || user.role === 'employee') {
        fetchSavedJobs();
      }
    }
  }, [user]);

  // Fetch network data when Networks/My Network tab is active
  useEffect(() => {
    if (user && (activeTab === 'Networks' || activeTab === 'My Network')) {
      if (user.role === 'employer') {
        fetchEmployees();
      } else {
        fetchConnections();
        fetchPendingRequests();
      }
    }
  }, [user, activeTab, connectionSearchQuery]);

  const fetchSavedJobs = async () => {
    if (!user || (user.role !== 'jobSeeker' && user.role !== 'employee')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/saved/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const jobs = data.savedJobs || [];
        setSavedJobs(jobs);
        // Update favoriteJobs with the IDs of saved jobs
        const savedJobIds = jobs.map(job => job._id);
        setFavoriteJobs(new Set(savedJobIds));
        console.log('Saved jobs fetched:', jobs.length, 'Job IDs:', savedJobIds);
      } else {
        console.error('Failed to fetch saved jobs:', response.status);
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const fetchMyJobs = async () => {
    if (!user) return;
    
    try {
      setJobsLoading(true);
      
      // Check if user has active subscription from database
      const hasActiveSubscription = user?.subscriptionStatus === 'active';
      
      // If no active subscription, show dummy data
      if (!hasActiveSubscription) {
        const dummyJobs = user.role === 'employer' 
          ? [
              {
                _id: 'dummy1',
                jobTitle: '🔒 Unlock to View',
                employmentType: 'Full-time',
                industryType: 'Technology',
                status: 'draft',
                salary: '$0',
                createdAt: new Date().toISOString(),
                isDummy: true
              },
              {
                _id: 'dummy2',
                jobTitle: '🔒 Unlock to View',
                employmentType: 'Part-time',
                industryType: 'Marketing',
                status: 'draft',
                salary: '$0',
                createdAt: new Date().toISOString(),
                isDummy: true
              }
            ]
          : [
              {
                _id: 'dummy1',
                job: {
                  _id: 'job1',
                  jobTitle: '🔒 Unlock to View',
                  employmentType: 'Full-time',
                  industryType: 'Technology',
                  employer: { fullName: 'Hidden Employer' }
                },
                status: 'pending',
                appliedAt: new Date().toISOString(),
                isDummy: true
              }
            ];
        
        setMyJobs(dummyJobs);
        setJobsLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      
      let url;
      if (user.role === 'employer') {
        // Fetch jobs created by employer
        url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/employer/${user._id}`;
      } else {
        // Fetch applications for job seeker
        url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/applications/my-applications`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (user.role === 'employer') {
          setMyJobs(data.jobs || []);
        } else {
          setMyJobs(data.applications || []);
        }
      }
    } catch (error) {
      console.error('Error fetching my jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchAllJobs = async () => {
    try {
      // Check if user has active subscription from database
      const hasActiveSubscription = user?.subscriptionStatus === 'active';
      
      // If no active subscription, show limited dummy data
      if (!hasActiveSubscription) {
        const dummyAllJobs = [
          {
            _id: 'dummy_all_1',
            jobTitle: '🔒 Subscribe to View More Jobs',
            employmentType: 'Full-time',
            industryType: 'Various',
            workLocation: 'Multiple Locations',
            salary: 'Competitive',
            summary: 'Subscribe now to unlock thousands of job opportunities tailored for you.',
            employer: { 
              fullName: 'Multiple Employers',
              businessSummary: { companyLogo: '' }
            },
            createdAt: new Date().toISOString(),
            isDummy: true
          },
          {
            _id: 'dummy_all_2',
            jobTitle: '🔒 Premium Job Listings',
            employmentType: 'Contract',
            industryType: 'Various',
            workLocation: 'Remote',
            salary: 'Negotiable',
            summary: 'Get access to premium job listings from top companies.',
            employer: { 
              fullName: 'Top Companies',
              businessSummary: { companyLogo: '' }
            },
            createdAt: new Date().toISOString(),
            isDummy: true
          }
        ];
        
        setAllJobs(dummyAllJobs);
        return;
      }
      
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/published/list`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setAllJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching all jobs:', error);
    }
  };

  // Fetch all employees (for employers)
  const fetchEmployees = async () => {
    if (user?.role !== 'employer') return;
    
    try {
      setNetworkLoading(true);
      const token = localStorage.getItem('token');
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connections/employees?search=${connectionSearchQuery}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setNetworkLoading(false);
    }
  };

  // Fetch connections (accepted)
  const fetchConnections = async () => {
    try {
      setNetworkLoading(true);
      const token = localStorage.getItem('token');
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connections?search=${connectionSearchQuery}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setNetworkLoading(false);
    }
  };

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connections/pending`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  // Send connection request
  const sendConnectionRequest = async (receiverId) => {
    try {
      setConnectionRequestLoading(prev => new Set(prev).add(receiverId));
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connections/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId,
          message: 'Hi, I would like to connect with you!'
        })
      });

      if (response.ok) {
        alert('Connection request sent successfully!');
        // Refresh employees list to update status
        await fetchEmployees();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Failed to send connection request');
    } finally {
      setConnectionRequestLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(receiverId);
        return newSet;
      });
    }
  };

  // Accept connection request
  const acceptConnectionRequest = async (connectionId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connections/${connectionId}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Connection accepted!');
        await fetchPendingRequests();
        await fetchConnections();
      } else {
        alert('Failed to accept connection');
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
      alert('Failed to accept connection');
    }
  };

  // Reject connection request
  const rejectConnectionRequest = async (connectionId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connections/${connectionId}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Connection rejected');
        await fetchPendingRequests();
      } else {
        alert('Failed to reject connection');
      }
    } catch (error) {
      console.error('Error rejecting connection:', error);
      alert('Failed to reject connection');
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Try to call logout endpoint, but don't fail if it errors
      if (token) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, { 
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (logoutError) {
          // Ignore logout endpoint errors - token might be expired
          console.log('Logout endpoint error (ignored):', logoutError);
        }
      }
      
      // Always clear token and redirect
      localStorage.removeItem('token');
      router.push('/login/role-selection');
    } catch (error) {
      console.error('Error signing out:', error);
      // Even on error, ensure user is logged out
      localStorage.removeItem('token');
      router.push('/login/role-selection');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          // Create image element
          const img = document.createElement('img');
          img.src = event.target.result;
          
          img.onload = () => {
            // Create canvas for compression
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 400;
            const MAX_HEIGHT = 400;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress and convert to base64
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            setEditForm(prev => ({ ...prev, profileImage: compressedBase64 }));
          };
        } catch (error) {
          console.error('Error processing image:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    setSaveMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsEditingProfile(false);
        setSaveMessage('Profile updated successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        const error = await response.json();
        setSaveMessage(error.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage('Error updating profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    // Reset form to current user data
    const dob = user?.personalDetails?.dateOfBirth;
    let formattedDob = '';
    if (dob) {
      // Handle both string and MongoDB date object
      const dateObj = typeof dob === 'string' ? new Date(dob) : new Date(dob.$date?.$numberLong ? parseInt(dob.$date.$numberLong) : dob);
      formattedDob = dateObj.toISOString().split('T')[0];
    }
    setEditForm({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.mobileNumber || user?.phoneNumber || '',
      dateOfBirth: formattedDob,
      address: user?.personalDetails?.address || '',
      profileImage: user?.personalDetails?.profileImage || '',
      summary: user?.personalSummary?.summary || ''
    });
    setSaveMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={getBackgroundStyle()}>
        <div className={`text-lg ${getTextClassName()}`}>Loading...</div>
      </div>
    );
  }

  const chatMessages = [
    {
      id: 1,
      name: 'Full name',
      message: 'Hi Sal Monella, Thanks for...',
      time: 'Just now',
      isActive: true,
      isTyping: false,
      hasNewMessage: true
    },
    {
      id: 2,
      name: 'Al Dente',
      message: 'Al Dente is typing...',
      time: '10:00 am',
      isActive: true,
      isTyping: true,
      hasNewMessage: false
    },
    {
      id: 3,
      name: 'Walter Melon',
      message: 'Hi there, I am looking for work in...',
      time: '9:24 am',
      isActive: true,
      isTyping: false,
      hasNewMessage: false
    },
    {
      id: 4,
      name: 'Full name',
      message: 'Message description to go here...',
      time: 'Sun',
      isActive: false,
      isTyping: false,
      hasNewMessage: false
    },
    {
      id: 5,
      name: 'Full name',
      message: 'Message description to go here...',
      time: 'Aug 8',
      isActive: false,
      isTyping: false,
      hasNewMessage: false
    },
    {
      id: 6,
      name: 'Full name',
      message: 'Message description to go here...',
      time: 'Aug 8',
      isActive: false,
      isTyping: false,
      hasNewMessage: false
    },
    {
      id: 7,
      name: 'Full name',
      message: 'Message description to go here...',
      time: 'Aug 7',
      isActive: false,
      isTyping: false,
      hasNewMessage: false
    }
  ];

  // Conditional tabs based on user role
  const tabs = user?.role === 'employer' 
    ? ['My Jobs', 'Networks']
    : ['Search Jobs', 'My Applications', 'Saved Jobs', 'My Network'];

  const networkConnections = [
    {
      id: 1,
      name: 'Company Name',
      jobTitle: 'Job Title',
      location: 'Location',
      avatar: null,
      isOnline: true
    },
    {
      id: 2,
      name: 'Company Name',
      jobTitle: 'Job Title',
      location: 'Location',
      avatar: null,
      isOnline: false
    },
    {
      id: 3,
      name: 'Name',
      jobTitle: 'Job Title',
      location: 'Location',
      avatar: null,
      isOnline: true
    },
    {
      id: 4,
      name: 'Name',
      jobTitle: 'Job Title',
      location: 'Location',
      avatar: null,
      isOnline: false
    },
    {
      id: 5,
      name: 'Name',
      jobTitle: 'Job Title',
      location: 'Location',
      avatar: null,
      isOnline: true
    },
    {
      id: 6,
      name: 'Name',
      jobTitle: 'Job Title',
      location: 'Location',
      avatar: null,
      isOnline: false
    }
  ];
  const industries = ['Carpentry', 'Earthworks', 'Electrician', 'Concrete', 'Plumbing'];

  const jobListings = [
    {
      id: 1,
      title: 'Concrete Finisher',
      company: 'Konform Civil Constructions',
      address: 'Norwood, SA',
      schedule: '9am-6pm',
      type: 'Full-time',
      isFavorite: true,
      description: 'Adelaide Concreters is a leading concrete company delivering exceptional concrete solutions tailored to our clients\' needs.',
      skillsRequired: ['Foundations', 'Commercial', 'Decorative', 'Residential', 'Labourer'],
      essentialLicenses: ['Current White Card', 'Current Driver\'s License (C Manual)', 'MR Class'],
      postedTime: '12d ago',
      isLiveChat: true
    },
    {
      id: 2,
      title: 'Concrete Finisher',
      company: 'Konform Civil Constructions',
      address: 'Norwood, SA',
      schedule: '9am-6pm',
      type: 'Full-time',
      isFavorite: false,
      description: 'Adelaide Concreters is a leading concrete company delivering exceptional concrete solutions tailored to our clients\' needs.',
      skillsRequired: ['Foundations', 'Commercial', 'Decorative', 'Residential', 'Labourer'],
      essentialLicenses: ['Current White Card', 'Current Driver\'s License (C Manual)', 'MR Class'],
      postedTime: '12d ago',
      isLiveChat: true
    }
  ];

  const companies = [
    {
      id: 1,
      name: 'Company Name',
      jobTitle: 'Job Title',
      avatar: null
    },
    {
      id: 2,
      name: 'Company Name',
      jobTitle: 'Job Title',
      avatar: null
    },
    {
      id: 3,
      name: 'Company Name',
      jobTitle: 'Job Title',
      avatar: null
    },
    {
      id: 4,
      name: 'Company Name',
      jobTitle: 'Job Title',
      avatar: null
    }
  ];

  const handleSearch = () => {
    // Handle search functionality
    console.log('Searching for:', searchQuery, 'in', location);
  };

  const toggleFavorite = async (jobId) => {
    if (!user) {
      alert('Please login to save jobs');
      return;
    }

    if (!jobId) {
      console.error('Job ID is missing');
      return;
    }

    // Add to loading set
    setFavoriteLoadingJobs(prev => new Set([...prev, jobId]));

    try {
      const token = localStorage.getItem('token');
      const isFavorited = favoriteJobs.has(jobId);
      
      console.log(`Toggling favorite for job ${jobId}. Currently favorited: ${isFavorited}`);
      
      // Call API to save/unsave job
      const endpoint = isFavorited ? 'unsave' : 'save';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobId}/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            userId: user._id 
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update saved job');
      }

      const result = await response.json();
      console.log('Toggle favorite result:', result);

      // Update local state
      setFavoriteJobs(prev => {
        const newFavorites = new Set(prev);
        if (isFavorited) {
          newFavorites.delete(jobId);
          console.log(`Removed ${jobId} from favorites`);
        } else {
          newFavorites.add(jobId);
          console.log(`Added ${jobId} to favorites`);
        }
        console.log('Updated favorite jobs:', Array.from(newFavorites));
        return newFavorites;
      });

      // Refresh saved jobs list if on Saved Jobs tab
      if (activeTab === 'Saved Jobs') {
        fetchSavedJobs();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert(error.message || 'Failed to save job. Please try again.');
    } finally {
      // Remove from loading set
      setFavoriteLoadingJobs(prev => {
        const newLoading = new Set(prev);
        newLoading.delete(jobId);
        return newLoading;
      });
    }
  };

  // Notification functions
  const handleNotificationClick = async (notification) => {
    try {
      const token = localStorage.getItem('token');
      
      // Mark as read
      if (!notification.isRead) {
        await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/${notification._id}/read`,
          {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Update local state
        setNotifications(prev =>
          prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate based on notification type
      setShowNotifications(false);
      if (notification.metadata?.chatId) {
        router.push(`/chats?chatId=${notification.metadata.chatId}`);
      } else if (notification.metadata?.jobId) {
        router.push(`/job/${notification.metadata.jobId}`);
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/read-all`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        fetchNotifications(); // Refresh to update unread count
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleSubscribe = async (packageId) => {
    try {
      setSubscriptionLoading(true);
      const token = localStorage.getItem('token');
      
      // Check if user has completed onboarding
      const hasCompletedOnboarding = user?.onboarding?.personalDetailsCompleted && 
                                      user?.onboarding?.personalSummaryCompleted;
      
      // Set success URL based on onboarding status - include session_id placeholder
      const successUrl = hasCompletedOnboarding 
        ? `${window.location.origin}/home?payment=success&session_id={CHECKOUT_SESSION_ID}`
        : `${window.location.origin}/onboarding/personal-details?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      
      // Create checkout session
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: user.email,
          password: 'existing-user', // Not used for existing users
          fullName: user.fullName,
          mobileNumber: user.mobileNumber || '',
          role: user.role,
          selectedGoal: user.selectedGoal || '',
          packageId: packageId,
          successUrl: successUrl,
          cancelUrl: `${window.location.origin}/home?payment=cancelled`
        })
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Remove payment banner flag
        localStorage.removeItem('showPaymentBanner');
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        setSubscriptionLoading(false);
        alert(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      setSubscriptionLoading(false);
      console.error('Error creating checkout:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleLiveChat = () => {
    // Handle live chat functionality
    console.log('Opening live chat...');
    // You can add live chat implementation here
  };

  const handleDeleteJob = async (jobId) => {
    setJobToDelete(jobId);
    setShowDeleteModal(true);
  };

  const handleEditJob = async (job) => {
    setEditingJob(job);
    setEditJobForm({
      // Job Details
      jobTitle: job.jobDetails?.jobTitle || '',
      employmentType: job.jobDetails?.employmentType || '',
      industryType: job.jobDetails?.industryType || '',
      minimumExperience: job.jobDetails?.minimumExperience || '',
      // Job Summary
      summary: job.jobSummary?.summary || '',
      // Qualifications
      qualifications: job.qualifications?.qualifications || [],
      // Post Job Details
      salary: job.postJob?.salary || '',
      salaryMin: job.postJob?.salaryRange?.min || '',
      salaryMax: job.postJob?.salaryRange?.max || '',
      salaryFrequency: job.postJob?.salaryFrequency || 'hourly',
      numberOfPositions: job.postJob?.numberOfPositions || 1,
      applicationDeadline: job.postJob?.applicationDeadline ? new Date(job.postJob.applicationDeadline).toISOString().split('T')[0] : '',
      closingDate: job.postJob?.closingDate ? new Date(job.postJob.closingDate).toISOString().split('T')[0] : '',
      workLocation: job.postJob?.workLocation || '',
      address: job.postJob?.address || '',
      city: job.postJob?.city || '',
      state: job.postJob?.state || '',
      postcode: job.postJob?.postcode || '',
      country: job.postJob?.country || 'Australia'
    });
    setEditJobStep(1);
    setShowEditJobModal(true);
  };

  const handleSaveEditJob = async () => {
    if (!editingJob) return;

    setSaveLoading(true);
    setSaveMessage('');

    try {
      const token = localStorage.getItem('token');
      
      // Update job details
      const jobDetailsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${editingJob._id}/job-details`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            jobTitle: editJobForm.jobTitle,
            employmentType: editJobForm.employmentType,
            industryType: editJobForm.industryType,
            minimumExperience: editJobForm.minimumExperience,
          }),
        }
      );

      if (!jobDetailsResponse.ok) {
        throw new Error('Failed to update job details');
      }

      // Update job summary
      const summaryResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${editingJob._id}/job-summary`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            summary: editJobForm.summary,
          }),
        }
      );

      if (!summaryResponse.ok) {
        throw new Error('Failed to update job summary');
      }

      // Update qualifications
      const qualificationsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${editingJob._id}/qualifications`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            qualifications: editJobForm.qualifications,
          }),
        }
      );

      if (!qualificationsResponse.ok) {
        throw new Error('Failed to update qualifications');
      }

      // Update post job details
      const postJobResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${editingJob._id}/post-job`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            salary: editJobForm.salary,
            salaryRange: {
              min: editJobForm.salaryMin ? Number(editJobForm.salaryMin) : undefined,
              max: editJobForm.salaryMax ? Number(editJobForm.salaryMax) : undefined,
            },
            salaryFrequency: editJobForm.salaryFrequency,
            workLocation: editJobForm.workLocation,
            numberOfPositions: editJobForm.numberOfPositions,
            applicationDeadline: editJobForm.applicationDeadline || undefined,
            closingDate: editJobForm.closingDate || undefined,
            city: editJobForm.city,
            address: editJobForm.address,
            state: editJobForm.state,
            postcode: editJobForm.postcode,
            country: editJobForm.country,
          }),
        }
      );

      if (!postJobResponse.ok) {
        throw new Error('Failed to update post job details');
      }

      setSaveMessage('Job updated successfully!');
      setTimeout(() => {
        setShowEditJobModal(false);
        setEditingJob(null);
        setSaveMessage('');
        setEditJobStep(1);
        fetchMyJobs(); // Refresh job list
      }, 1500);
    } catch (error) {
      console.error('Error updating job:', error);
      setSaveMessage(error.message || 'Failed to update job');
    } finally {
      setSaveLoading(false);
    }
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete job');
      }

      // Refresh the jobs list
      await fetchMyJobs();
      setShowDeleteModal(false);
      setJobToDelete(null);
    } catch (error) {
      console.error('Error deleting job:', error);
      alert(error.message || 'Failed to delete job. Please try again.');
    }
  };

  const handleRequestChat = async (jobId) => {
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

  return (
    <div className="min-h-screen" style={getBackgroundStyle()}>
      <div className="w-full max-w-none mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-6">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => {
                // Reset all states to return to homepage
                setShowProfile(false);
                setShowLiveChat(false);
                setShowSettings(false);
                setShowNotifications(false);
                // Set active tab based on user role
                if (user?.role === 'employer') {
                  setActiveTab('My Jobs');
                } else {
                  setActiveTab('Search Jobs');
                }
              }}
              className="flex items-center"
            >
              <Image
                src={theme === 'dark' ? '/logo-light.png' : '/logo-dark.png'}
                alt="Head Huntd Logo"
                width={40}
                height={40}
              />
            </button>
          </div>
          
          {/* Icons */}
          <div className="flex items-center gap-2">
            {/* Messages Icon */}
            <button 
              className="p-2 relative" 
              onClick={() => router.push('/chats')}
              title="Messages"
            >
              <MessageCircle className={`w-6 h-6 ${getTextClassName()}`} />
            </button>
            {/* Bell Icon - Notifications */}
            <button 
              className="p-2 relative" 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowLiveChat(false);
                setShowProfile(false);
                setShowSettings(false);
              }}
              title="Notifications"
            >
              <Bell className={`w-6 h-6 ${getTextClassName()}`} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {/* Profile Icon */}
            <button className="p-2" onClick={() => {
              setShowProfile(!showProfile);
              setShowLiveChat(false);
              setShowSettings(false);
            }}>
              <User className={`w-6 h-6 ${getTextClassName()}`} />
            </button>
            {/* Menu Icon */}
            <button className="p-2" onClick={() => {
              setShowSettings(true);
              setShowProfile(false);
              setShowLiveChat(false);
            }}>
              <Menu className={`w-6 h-6 ${getTextClassName()}`} />
            </button>
          </div>
        </div>

        {/* Payment Banner */}
        <AnimatePresence>
          {showPaymentBanner && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mx-4 mb-4"
            >
              <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl p-4 shadow-lg relative overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] animate-pulse"></div>
                </div>

                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                      <h3 className="text-white font-bold text-lg">Unlock Full Access</h3>
                    </div>
                    <p className="text-white/90 text-sm">
                      You're viewing limited features. Subscribe now to explore everything!
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowSubscriptionModal(true)}
                      className="px-6 py-2.5 bg-white text-orange-600 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                    >
                      💳 Subscribe Now
                    </motion.button>
                    <button
                      onClick={() => {
                        setShowPaymentBanner(false);
                        localStorage.removeItem('showPaymentBanner');
                      }}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      aria-label="Close banner"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 px-2">
          <div className={`${getCardClassName()} rounded-3xl px-4 py-6 shadow-sm w-[97%] mx-auto`}>
            <AnimatePresence mode="wait">
            {showNotifications ? (
              /* Notification Center */
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className={`text-lg font-semibold ${getTextClassName()}`}>Notifications</h2>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className={`text-2xl ${getSubTextClassName()} hover:${getTextClassName()}`}
                  >
                    ×
                  </button>
                </div>

                {/* Action Buttons */}
                {unreadCount > 0 && (
                  <div className="flex justify-end">
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-sm text-[#00EA72] hover:text-[#00D66C] font-medium"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}

                {/* Notifications List */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className={`w-16 h-16 mx-auto mb-4 ${getSubTextClassName()} opacity-50`} />
                      <p className={`text-sm ${getSubTextClassName()}`}>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const getNotificationIcon = (type) => {
                        switch (type) {
                          case 'job_created': return '💼';
                          case 'application_received': return '📝';
                          case 'application_status_changed': return '✅';
                          case 'job_closed': return '🔒';
                          case 'job_assigned': return '🎉';
                          case 'new_message': return '💬';
                          case 'chat_closed': return '🔕';
                          case 'chat_reopened': return '🔔';
                          case 'interview_scheduled': return '📅';
                          default: return '🔔';
                        }
                      };

                      const getTimeAgo = (date) => {
                        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
                        if (seconds < 60) return 'Just now';
                        const minutes = Math.floor(seconds / 60);
                        if (minutes < 60) return `${minutes}m ago`;
                        const hours = Math.floor(minutes / 60);
                        if (hours < 24) return `${hours}h ago`;
                        const days = Math.floor(hours / 24);
                        if (days < 7) return `${days}d ago`;
                        return new Date(date).toLocaleDateString();
                      };

                      return (
                        <motion.div
                          key={notification._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            notification.isRead
                              ? theme === 'dark' 
                                ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' 
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              : theme === 'dark'
                                ? 'bg-[#00EA72]/10 border-[#00EA72]/30 hover:bg-[#00EA72]/20'
                                : 'bg-[#00EA72]/5 border-[#00EA72]/20 hover:bg-[#00EA72]/10'
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className={`font-semibold text-sm ${getTextClassName()}`}>
                                  {notification.title}
                                </h3>
                                <button
                                  onClick={(e) => deleteNotification(notification._id, e)}
                                  className={`text-sm ${getSubTextClassName()} hover:text-red-500`}
                                >
                                  ×
                                </button>
                              </div>
                              <p className={`text-sm ${getSubTextClassName()} mb-2`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className={`text-xs ${getSubTextClassName()}`}>
                                  {getTimeAgo(notification.createdAt)}
                                </span>
                                {notification.metadata?.senderName && (
                                  <span className={`text-xs ${getSubTextClassName()}`}>
                                    From: {notification.metadata.senderName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            ) : showLiveChat ? (
              /* Live Chat Page */
              <motion.div
                key="live-chat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg font-semibold ${getTextClassName()}`}>Messages</h2>
                  <button 
                    onClick={() => setShowLiveChat(false)}
                    className={`text-sm ${getSubTextClassName()}`}
                  >
                    ×
                  </button>
                </div>

                {/* Active Users */}
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {chatMessages.filter(msg => msg.isActive).map((user) => (
                    <div key={user.id} className="shrink-0 relative">
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                  ))}
                </div>

                {/* Tabs */}
                <div className={`flex space-x-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button className={`pb-2 text-sm font-medium ${getTextClassName()} border-b-2 border-[#00EA72]`}>
                    All
                  </button>
                  <button className={`pb-2 text-sm font-medium ${getSubTextClassName()}`}>
                    Unread
                  </button>
                </div>

                {/* Message List */}
                <div className="space-y-3">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`flex items-center space-x-3 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                      <div className="relative">
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        {message.isActive && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-semibold text-sm ${getTextClassName()}`}>{message.name}</h4>
                          <span className={`text-xs ${getSubTextClassName()}`}>{message.time}</span>
                        </div>
                        <p className={`text-sm ${message.isTyping ? 'text-[#00EA72] italic' : getSubTextClassName()} truncate`}>
                          {message.message}
                        </p>
                      </div>
                      {message.hasNewMessage && (
                        <div className="w-2 h-2 bg-[#00EA72] rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : showSettings ? (
              /* Settings/Drop Down Page */
              <motion.div
                key="settings"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg font-semibold ${getTextClassName()}`}>Settings</h2>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className={`text-sm ${getSubTextClassName()}`}
                  >
                    ×
                  </button>
                </div>

                {/* Menu Items */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-1"
                >
                  <motion.button 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowSettings(false);
                      setShowProfile(true);
                    }}
                    className={`w-full text-left p-4 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} ${getTextClassName()}`}
                  >
                    My Profile Card
                  </motion.button>
                  
                  <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} my-2`}></div>
                  
                  <motion.button 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02, x: 5, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSignOut}
                    className="w-full text-left p-4 rounded-lg hover:bg-gray-50 text-red-600"
                  >
                    Sign Out
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : showProfile ? (
              /* Profile Card Content */
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Profile Header */}
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`text-lg font-semibold ${getTextClassName()}`}
                >
                  My Profile Card
                </motion.h2>

                {/* Profile Info */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    {user?.personalDetails?.profileImage ? (
                      <motion.img 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
                        src={user.personalDetails.profileImage} 
                        alt={user.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
                        className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center"
                      >
                        <User className="w-6 h-6 text-white" />
                      </motion.div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <h3 className={`font-semibold ${getTextClassName()}`}>{user?.fullName || 'User'}</h3>
                      <p className={`text-sm ${getSubTextClassName()}`}>
                        {user?.role === 'employer' 
                          ? (user?.businessSummary?.companyName || 'Employer')
                          : (user?.workExperience?.industry || 'Industry not specified')
                        }
                      </p>
                      <p className={`text-xs ${getSubTextClassName()}`}>
                        • {user?.personalDetails?.address || user?.address || 'Location not set'}
                      </p>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2 text-sm"
                    >
                      Edit Profile
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Profile Tabs */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex space-x-6 border-b border-gray-200 overflow-x-auto"
                >
                  {['Profile'].map((tab, index) => (
                    <motion.button
                      key={tab}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (index * 0.05) }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`pb-2 text-sm font-medium whitespace-nowrap ${
                        index === 0 
                          ? `${getTextClassName()} border-b-2 border-[#00EA72]` 
                          : `${getSubTextClassName()}`
                      }`}
                    >
                      {tab}
                    </motion.button>
                  ))}
                </motion.div>

                {/* About Section */}
                <div>
                  <div className="flex space-x-6 border-b border-gray-200 mb-4">
                    <button className={`pb-2 text-sm font-medium ${getTextClassName()} border-b-2 border-[#00EA72]`}>
                      About
                    </button>
                  </div>
                  <p className={`text-sm leading-relaxed ${getSubTextClassName()}`}>
                    {user?.personalSummary?.summary || user?.personalSummary || 'No professional summary provided yet.'}
                  </p>
                </div>

                {/* Availability - Only for Job Seekers/Employees */}
                {user?.role !== 'employer' && user?.availability && (
                  <div>
                    <h4 className={`font-semibold mb-4 ${getTextClassName()}`}>My available start date to work is:</h4>
                    {user.availability.startDate ? (
                      <div className="space-y-4">
                        {/* Calendar Display */}
                        <div className="flex justify-center">
                          {/* Start Date Calendar */}
                          <div className={`w-full max-w-[280px] p-6 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                            <Calendar className="w-12 h-12 mb-3 mx-auto text-[#00EA72]" />
                            <p className={`text-lg font-semibold ${getTextClassName()}`}>
                              {new Date(user.availability.startDate).toLocaleDateString('en-US', { weekday: 'long' })},
                            </p>
                            <p className={`text-lg font-semibold ${getTextClassName()}`}>
                              {new Date(user.availability.startDate).toLocaleDateString('en-US', { month: 'long' })} {new Date(user.availability.startDate).getDate()}
                            </p>
                            <p className={`text-base ${getSubTextClassName()} mt-1`}>
                              {new Date(user.availability.startDate).getFullYear()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className={`text-sm mb-3 ${getSubTextClassName()}`}>Not specified</p>
                    )}
                    
                    {user.availability.preferredWorkTimes && user.availability.preferredWorkTimes.length > 0 && (
                      <div className="mt-4">
                        <h5 className={`text-sm font-medium ${getTextClassName()} mb-2`}>Preferred Work Times:</h5>
                        <div className="flex flex-wrap gap-2">
                          {user.availability.preferredWorkTimes.map((time, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {user.availability.noticePreference && (
                      <p className={`text-xs mt-3 ${getSubTextClassName()}`}>
                        Notice Preference: <span className="font-medium capitalize">{user.availability.noticePreference.replace('-', ' ')}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Skills - Only for Job Seekers/Employees */}
                {user?.role !== 'employer' && user?.workExperience && (
                  <div>
                    <h4 className={`font-semibold mb-4 ${getTextClassName()}`}>Industry & Skills</h4>
                    {user.workExperience.industry && (
                      <div className="mb-4">
                        <p className={`text-sm font-medium ${getTextClassName()} mb-2`}>Industry:</p>
                        <span className="px-4 py-2 bg-[#00EA72] text-black rounded-full text-sm font-medium">
                          {user.workExperience.industry}
                        </span>
                      </div>
                    )}
                    {user.workExperience.skills && user.workExperience.skills.length > 0 && (
                      <div>
                        <p className={`text-sm font-medium ${getTextClassName()} mb-2`}>Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {user.workExperience.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              /* Original Job Search Content */
              <>
                {/* Tabs */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`flex space-x-4 mb-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-x-auto`}
                >
                  {tabs.map((tab, index) => (
                    <motion.button
                      key={tab}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 text-[14px] font-medium transition-colors relative whitespace-nowrap ${
                        activeTab === tab
                          ? `${getTextClassName()}`
                          : `${getSubTextClassName()} hover:${getTextClassName()}`
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00EA72]"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </motion.div>

                {activeTab === 'Networks' || activeTab === 'My Network' ? (
                  /* Networks Tab Content */
                  <motion.div
                    key="networks-tab"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    {/* Networks Greeting */}
                    <motion.h2 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`text-[18px] font-bold ${getTextClassName()} mb-6`}
                    >
                      My Network
                    </motion.h2>

                    {/* Search Connections */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mb-6"
                    >
                      <h3 className={`text-[16px] font-semibold ${getTextClassName()} mb-4`}>
                        Search Connections
                      </h3>
                      
                      {/* Search Input */}
                      <motion.div 
                        className="relative mb-4"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Input
                          value={connectionSearchQuery}
                          onChange={(e) => setConnectionSearchQuery(e.target.value)}
                          placeholder="Search connected users"
                          className="h-12 rounded-full border-2 border-[#00EA72] text-[14px] pl-10 pr-4"
                        />
                        <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </motion.div>

                      {/* Advanced Filters */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <button 
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className={`text-[14px] font-medium ${getTextClassName()} flex items-center space-x-1`}
                          >
                            <span>Advanced Filters</span>
                            <svg className={`w-3 h-3 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button className={`text-[12px] ${getSubTextClassName()}`}>
                            Reset all filters
                          </button>
                        </div>
                        
                        <p className={`text-[12px] ${getSubTextClassName()} mb-3`}>
                          Narrow searches with these additional fields
                        </p>

                        {/* Filter Buttons */}
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="flex flex-wrap gap-2 mb-4"
                        >
                          {['Industry Type', 'Main Role', 'Main Skills', 'Employment Type', 'Location'].map((filter, index) => (
                            <motion.button
                              key={filter}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.35 + (index * 0.05) }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-[12px] font-medium flex items-center space-x-1"
                            >
                              <span>{filter}</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </motion.button>
                          ))}
                        </motion.div>

                        {/* Results Header with Grid Toggle */}
                        <div className="flex items-center justify-between mb-4">
                          <p className={`text-sm ${getTextClassName()}`}>
                            {user?.role === 'employer' 
                              ? `${employees.length} ${employees.length === 1 ? 'employee' : 'employees'} found`
                              : `${connections.length} ${connections.length === 1 ? 'connection' : 'connections'}`
                            }
                          </p>
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            <select 
                              value={sortConnectionsBy}
                              onChange={(e) => setSortConnectionsBy(e.target.value)}
                              className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded px-2 py-1"
                            >
                              <option>Alphabetical</option>
                              <option>Order (A-Z)</option>
                              <option>Relevance</option>
                              <option>Newest</option>
                              <option>Oldest</option>
                            </select>
                          </div>
                        </div>

                        {/* Loading State */}
                        {networkLoading && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-8"
                          >
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00EA72] mx-auto"></div>
                            <p className={`mt-2 text-sm ${getSubTextClassName()}`}>Loading...</p>
                          </motion.div>
                        )}

                        {/* Pending Requests Section (Employee only) */}
                        {user?.role !== 'employer' && pendingRequests.length > 0 && !networkLoading && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-6"
                          >
                            <h3 className={`text-[16px] font-semibold ${getTextClassName()} mb-4`}>
                              Pending Requests ({pendingRequests.length})
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              {pendingRequests.map((request, index) => (
                                <motion.div
                                  key={request._id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.3 + (index * 0.05) }}
                                  whileHover={{ scale: 1.03, y: -5 }}
                                  className={`${getCardClassName()} rounded-lg p-4 shadow-sm border ${theme === 'dark' ? 'border-yellow-700' : 'border-yellow-200'} text-center`}
                                >
                                  <motion.div 
                                    className="relative mx-auto mb-3 w-12 h-12"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                  >
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#00EA72] to-[#00D66C] rounded-full flex items-center justify-center">
                                      <User className="w-6 h-6 text-white" />
                                    </div>
                                    <motion.div 
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: 0.4 + (index * 0.05), type: "spring" }}
                                      className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"
                                    />
                                  </motion.div>
                                  <h4 className={`font-semibold text-[14px] ${getTextClassName()} mb-1`}>
                                    {request.senderId?.fullName || 'Unknown User'}
                                  </h4>
                                  <p className={`text-[12px] ${getSubTextClassName()} mb-1`}>
                                    {request.senderId?.businessSummary?.companyName || 'Employer'}
                                  </p>
                                  {request.message && (
                                    <p className={`text-[11px] ${getSubTextClassName()} mb-3 italic`}>
                                      "{request.message}"
                                    </p>
                                  )}
                                  <div className="flex flex-col space-y-2">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Button 
                                        onClick={() => acceptConnectionRequest(request._id)}
                                        className="w-full bg-[#00EA72] hover:bg-[#00D66C] text-black text-[11px] px-3 py-1 rounded-full font-semibold"
                                      >
                                        ✓ Accept
                                      </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Button 
                                        onClick={() => rejectConnectionRequest(request._id)}
                                        className={`w-full ${getCardClassName()} border ${theme === 'dark' ? 'border-red-600 text-red-400 hover:bg-red-900/20' : 'border-red-300 text-red-600 hover:bg-red-50'} text-[11px] px-3 py-1 rounded-full`}
                                      >
                                        ✕ Reject
                                      </Button>
                                    </motion.div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {/* Network Connections/Employees Grid */}
                        {!networkLoading && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="grid grid-cols-2 gap-4"
                          >
                            {user?.role === 'employer' ? (
                              // Employer view: Show all employees with connection status
                              employees.length > 0 ? (
                                employees.map((employee, index) => (
                                  <motion.div 
                                    key={employee._id} 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.45 + (index * 0.05) }}
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    className={`${getCardClassName()} rounded-lg p-4 shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} text-center`}
                                  >
                                    <motion.div 
                                      className="relative mx-auto mb-3 w-12 h-12"
                                      whileHover={{ scale: 1.1 }}
                                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    >
                                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                      </div>
                                      {employee.connectionStatus === 'accepted' && (
                                        <motion.div 
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ delay: 0.5 + (index * 0.05), type: "spring" }}
                                          className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                                        />
                                      )}
                                    </motion.div>
                                    <h4 className={`font-semibold text-[14px] ${getTextClassName()} mb-1`}>
                                      {employee.fullName}
                                    </h4>
                                    <p className={`text-[12px] ${getSubTextClassName()} mb-1`}>
                                      {employee.onboardingData?.workExperience?.industry || 'Industry not specified'}
                                    </p>
                                    <p className={`text-[11px] ${getSubTextClassName()} mb-3`}>
                                      {employee.onboardingData?.personalDetails?.address || 'Location not specified'}
                                    </p>
                                    
                                    {/* Connection Status Badge */}
                                    {employee.connectionStatus === 'accepted' && (
                                      <motion.div 
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mb-2"
                                      >
                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-[10px] rounded-full font-medium">
                                          ✓ Connected
                                        </span>
                                      </motion.div>
                                    )}
                                    {employee.connectionStatus === 'pending' && (
                                      <motion.div 
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mb-2"
                                      >
                                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-[10px] rounded-full font-medium">
                                          ⏳ Pending
                                        </span>
                                      </motion.div>
                                    )}
                                    
                                    <div className="flex flex-col space-y-2">
                                      {employee.connectionStatus === 'none' || employee.connectionStatus === 'rejected' ? (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                          <Button 
                                            onClick={() => sendConnectionRequest(employee._id)}
                                            disabled={connectionRequestLoading.has(employee._id)}
                                            className="w-full bg-[#00EA72] hover:bg-[#00D66C] text-black text-[11px] px-3 py-1 rounded-full font-semibold"
                                          >
                                            {connectionRequestLoading.has(employee._id) ? '⏳ Sending...' : '➕ Send Request'}
                                          </Button>
                                        </motion.div>
                                      ) : employee.connectionStatus === 'accepted' ? (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                          <Button 
                                            onClick={() => router.push(`/chats?userId=${employee._id}`)}
                                            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-[11px] px-3 py-1 rounded-full font-semibold"
                                          >
                                            💬 Message
                                          </Button>
                                        </motion.div>
                                      ) : null}
                                    </div>
                                  </motion.div>
                                ))
                              ) : (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="col-span-2 text-center py-8"
                                >
                                  <p className={getSubTextClassName()}>No employees found</p>
                                </motion.div>
                              )
                            ) : (
                              // Employee view: Show accepted connections
                              connections.length > 0 ? (
                                connections.map((connection, index) => (
                                  <motion.div 
                                    key={connection.connectionId} 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.45 + (index * 0.05) }}
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    className={`${getCardClassName()} rounded-lg p-4 shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} text-center`}
                                  >
                                    <motion.div 
                                      className="relative mx-auto mb-3 w-12 h-12"
                                      whileHover={{ scale: 1.1 }}
                                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    >
                                      <div className="w-12 h-12 bg-gradient-to-br from-[#00EA72] to-[#00D66C] rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                      </div>
                                      <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5 + (index * 0.05), type: "spring" }}
                                        className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                                      />
                                    </motion.div>
                                    <h4 className={`font-semibold text-[14px] ${getTextClassName()} mb-1`}>
                                      {connection.fullName}
                                    </h4>
                                    <p className={`text-[12px] ${getSubTextClassName()} mb-1`}>
                                      {connection.businessSummary?.companyName || 'Employer'}
                                    </p>
                                    <p className={`text-[11px] ${getSubTextClassName()} mb-3`}>
                                      Connected {new Date(connection.connectedAt).toLocaleDateString()}
                                    </p>
                                    <div className="flex flex-col space-y-2">
                                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button 
                                          onClick={() => router.push(`/chats?userId=${connection.userId}`)}
                                          className="w-full bg-[#00EA72] hover:bg-[#00D66C] text-black text-[11px] px-3 py-1 rounded-full font-semibold"
                                        >
                                          💬 Message
                                        </Button>
                                      </motion.div>
                                    </div>
                                  </motion.div>
                                ))
                              ) : (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="col-span-2 text-center py-8"
                                >
                                  <p className={getSubTextClassName()}>No connections yet</p>
                                  <p className={`text-sm ${getSubTextClassName()} mt-2`}>
                                    Accept connection requests to start networking
                                  </p>
                                </motion.div>
                              )
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <>
                    {/* Greeting */}
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="mb-6"
                    >
                    </motion.div>

                    {/* Search Section */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="mb-6"
                    >
                      <h3 className={`text-[16px] font-semibold ${getTextClassName()} mb-4`}>
                        {user?.role === 'employer' ? 'Search Jobs' : 'Find jobs'}
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Single Search Input */}
                        <motion.div 
                          className="relative"
                          whileHover={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={user?.role === 'employer' ? 'Search for jobs by company name or job description' : 'Search for jobs by name, company, or description'}
                            className={`h-14 ${getInputClassName()} border-2 border-[#00EA72] text-[14px] pl-12 pr-4 rounded-full`}
                          />
                          <svg className="absolute left-4 top-4 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </motion.div>

                        {/* Filter Options */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className="flex gap-3"
                        >
                          {/* Employment Type Filter */}
                          <motion.div className="flex-1">
                            <Label className={`text-[13px] font-medium ${getTextClassName()} mb-2 block`}>
                              Employment Type
                            </Label>
                            <select
                              value={selectedEmploymentType}
                              onChange={(e) => setSelectedEmploymentType(e.target.value)}
                              className={`w-full h-11 ${getInputClassName()} border-2 border-gray-300 text-[13px] px-4 rounded-full`}
                            >
                              <option value="">All Types</option>
                              <option value="full-time">Full-time</option>
                              <option value="part-time">Part-time</option>
                              <option value="casual">Casual</option>
                              <option value="contract">Contract</option>
                            </select>
                          </motion.div>

                          {/* Work Location Filter */}
                          <motion.div className="flex-1">
                            <Label className={`text-[13px] font-medium ${getTextClassName()} mb-2 block`}>
                              Work Location
                            </Label>
                            <select
                              value={selectedWorkLocation}
                              onChange={(e) => setSelectedWorkLocation(e.target.value)}
                              className={`w-full h-11 ${getInputClassName()} border-2 border-gray-300 text-[13px] px-4 rounded-full`}
                            >
                              <option value="">All Locations</option>
                              <option value="on-site">On-site</option>
                              <option value="remote">Remote</option>
                              <option value="hybrid">Hybrid</option>
                            </select>
                          </motion.div>
                        </motion.div>

                        {/* Create Job Button (Employer Only) */}
                        {user?.role === 'employer' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button 
                              onClick={() => router.push('/employer/create-job')}
                              className="w-full h-12 bg-[#00EA72] hover:bg-[#00D66C] text-black  text-[14px] rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              Create new Job
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>

                {/* Job Listing */}
                <div className="space-y-4">
                  {jobsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="w-8 h-8 border-4 border-[#00EA72] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    (() => {
                      // Determine which data source to use based on activeTab
                      let displayJobs = [];
                      
                      if (user?.role === 'employer') {
                        if (activeTab === 'My Jobs') {
                          displayJobs = myJobs;
                        } else if (activeTab === 'All Jobs') {
                          displayJobs = allJobs;
                        }
                      } else if (user?.role === 'jobSeeker' || user?.role === 'employee') {
                        // Handle both 'jobSeeker' and 'employee' roles (employee is used in some parts of the app)
                        if (activeTab === 'My Applications') {
                          displayJobs = myJobs; // These are applications
                        } else if (activeTab === 'Search Jobs') {
                          displayJobs = allJobs;
                        } else if (activeTab === 'Saved Jobs') {
                          displayJobs = savedJobs;
                        }
                      }

                      // Apply search filters
                      if (debouncedSearchQuery || location || selectedEmploymentType || selectedWorkLocation) {
                        displayJobs = displayJobs.filter(job => {
                          const jobData = job.jobId || job; // Handle application structure
                          const jobTitle = (jobData.jobDetails?.jobTitle || jobData.jobTitle || '').toLowerCase();
                          const businessName = (jobData.jobDetails?.businessName || jobData.businessName || '').toLowerCase();
                          const jobDescription = (jobData.jobSummary?.summary || jobData.jobDetails?.jobDescription || jobData.description || '').toLowerCase();
                          const jobLocation = (jobData.postJob?.workLocation || jobData.location || '').toLowerCase();
                          const employmentType = (jobData.jobDetails?.employmentType || jobData.employmentType || '').toLowerCase();
                          
                          const searchLower = debouncedSearchQuery.toLowerCase();
                          const locationLower = location.toLowerCase();
                          
                          const matchesSearch = !debouncedSearchQuery || 
                            jobTitle.includes(searchLower) || 
                            businessName.includes(searchLower) || 
                            jobDescription.includes(searchLower);
                          
                          const matchesLocation = !location || jobLocation.includes(locationLower);
                          const matchesEmploymentType = !selectedEmploymentType || employmentType === selectedEmploymentType;
                          const matchesWorkLocation = !selectedWorkLocation || jobLocation === selectedWorkLocation;
                          
                          return matchesSearch && matchesLocation && matchesEmploymentType && matchesWorkLocation;
                        });
                      }

                      // Show empty state if no jobs
                      if (displayJobs.length === 0) {
                        const hasFilters = debouncedSearchQuery || location || selectedEmploymentType || selectedWorkLocation;
                        return (
                          <div className={`text-center py-12 ${getCardClassName()} rounded-3xl border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
                            <svg className={`w-16 h-16 mx-auto mb-4 ${getSubTextClassName()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v2a2 2 0 01-2 2h-4a2 2 0 01-2-2V6m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                            </svg>
                            <p className={`text-[14px] font-medium ${getTextClassName()} mb-2`}>
                              {hasFilters ? 'No jobs match your filters' :
                               activeTab === 'My Jobs' ? 'No jobs posted yet' : 
                               activeTab === 'My Applications' ? 'No applications yet' :
                               activeTab === 'Saved Jobs' ? 'No saved jobs yet' :
                               'No jobs available'}
                            </p>
                            <p className={`text-[12px] ${getSubTextClassName()}`}>
                              {hasFilters ? 'Try adjusting your search criteria or clearing filters' :
                               activeTab === 'My Jobs' ? 'Create your first job posting to get started' : 
                               activeTab === 'My Applications' ? 'Start applying to jobs to see them here' :
                               activeTab === 'Saved Jobs' ? 'Save jobs you\'re interested in to view them here' :
                               'Check back later for new opportunities'}
                            </p>
                            {hasFilters && (
                              <button
                                onClick={() => {
                                  setSearchQuery('');
                                  setLocation('');
                                  setSelectedEmploymentType('');
                                  setSelectedWorkLocation('');
                                }}
                                className="mt-4 px-4 py-2 bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium rounded-full transition-colors"
                              >
                                Clear Filters
                              </button>
                            )}
                          </div>
                        );
                      }

                      // Render jobs
                      return displayJobs.map((job, index) => {
                        // Handle application data structure (for My Applications tab)
                        const isApplication = job.jobId && job.applicantId;
                        const jobData = isApplication ? job.jobId : job;
                        const jobId = jobData._id || jobData.id || job._id;
                        const isClosed = jobData.status === 'closed' || jobData.isActive === false;
                        
                        return (
                        <motion.div 
                          key={jobId} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          whileHover={{ scale: isClosed ? 1 : 1.02, boxShadow: isClosed ? 'none' : '0 10px 30px rgba(0, 234, 114, 0.15)' }}
                          className={`border rounded-3xl p-4 ${getCardClassName()} shadow-sm ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} ${
                            isClosed ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-[14px] ${getTextClassName()} mb-1 truncate`}>
                            {jobData.jobDetails?.jobTitle || jobData.jobTitle || jobData.title || 'Job Title'}
                          </h4>
                            {/* Show Job Closed badge for closed jobs in applications */}
                            {isApplication && isClosed && (
                              <div className="mb-2">
                                <span className="px-2 py-1 text-[10px] rounded-full bg-red-500 text-white font-semibold">
                                  Job Closed
                                </span>
                              </div>
                            )}
                            {/* Show application status for job seekers */}
                            {isApplication && job.status && (
                              <div className="mb-2">
                                <span className={`px-2 py-1 text-[10px] rounded-full ${
                                  job.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                  job.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                  job.status === 'interviewing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                  job.status === 'shortlisted' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                </span>
                              </div>
                            )}
                            {/* Show job status for employers */}
                            {activeTab === 'My Jobs' && user?.role === 'employer' && !isApplication && jobData.status && (
                              <div className="mb-2">
                                <span className={`px-2 py-1 text-[10px] rounded-full ${
                                  jobData.status === 'published' || jobData.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                  jobData.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  jobData.status === 'closed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                  jobData.status === 'archived' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                  {jobData.status.charAt(0).toUpperCase() + jobData.status.slice(1)}
                                </span>
                              </div>
                            )}
                          <div className={`flex items-center space-x-3 text-[10px] ${getSubTextClassName()}`}>
                            <div className="flex items-center space-x-1">
                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                              <span className="truncate">{jobData.postJob?.city || jobData.location || jobData.address || jobData.postJob?.workLocation || 'Remote'}</span>
                            </div>
                            {jobData.workSchedule && (
                              <div className="flex items-center space-x-1">
                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{jobData.workSchedule || jobData.schedule}</span>
                              </div>
                            )}
                            {jobData.employmentType && (
                              <div className="flex items-center space-x-1">
                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2M8 6v2a2 2 0 002 2" />
                                </svg>
                                <span>{jobData.employmentType || jobData.type}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          {activeTab === 'My Jobs' && user?.role === 'employer' && !isApplication ? (
                            <>
                              <motion.button 
                                whileHover={{ scale: jobData.isDummy ? 1 : 1.1 }}
                                whileTap={{ scale: jobData.isDummy ? 1 : 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (jobData.isDummy) {
                                    setShowSubscriptionModal(true);
                                  } else {
                                    handleEditJob(jobData);
                                  }
                                }}
                                className={`p-1.5 ${jobData.isDummy ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} rounded-full transition-colors`}
                                title={jobData.isDummy ? 'Subscribe to unlock' : 'Edit Job'}
                                disabled={jobData.isDummy}
                              >
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </motion.button>
                              <motion.button 
                                whileHover={{ scale: jobData.isDummy ? 1 : 1.1 }}
                                whileTap={{ scale: jobData.isDummy ? 1 : 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (jobData.isDummy) {
                                    setShowSubscriptionModal(true);
                                  } else {
                                    handleDeleteJob(jobId);
                                  }
                                }}
                                className={`p-1.5 ${jobData.isDummy ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} rounded-full transition-colors`}
                                title={jobData.isDummy ? 'Subscribe to unlock' : 'Delete Job'}
                                disabled={jobData.isDummy}
                              >
                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </motion.button>
                            </>
                          ) : (user?.role === 'jobSeeker' || user?.role === 'employee') ? (
                            <motion.button 
                              whileHover={{ scale: (favoriteLoadingJobs.has(jobId) || jobData.isDummy) ? 1 : 1.2 }}
                              whileTap={{ scale: (favoriteLoadingJobs.has(jobId) || jobData.isDummy) ? 1 : 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (jobData.isDummy) {
                                  setShowSubscriptionModal(true);
                                } else if (!favoriteLoadingJobs.has(jobId)) {
                                  toggleFavorite(jobId);
                                }
                              }}
                              className={`p-1 relative ${jobData.isDummy ? 'opacity-50' : ''}`}
                              disabled={favoriteLoadingJobs.has(jobId) || jobData.isDummy}
                              title={jobData.isDummy ? 'Subscribe to unlock' : favoriteLoadingJobs.has(jobId) ? 'Loading...' : (favoriteJobs.has(jobId) ? 'Remove from favorites' : 'Add to favorites')}
                            >
                              {favoriteLoadingJobs.has(jobId) ? (
                                <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className={`w-5 h-5 transition-colors ${favoriteJobs.has(jobId) ? 'text-red-500' : 'text-gray-400 hover:text-red-300'}`} fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                              )}
                            </motion.button>
                          ) : null}
                        </div>
                      </div>

                      {(jobData.jobSummary?.summary || jobData.jobDescription || jobData.description) && (
                        <p className={`text-[12px] ${getSubTextClassName()} mb-3 line-clamp-2`}>
                          {(jobData.jobSummary?.summary || jobData.jobDescription || jobData.description || '').substring(0, 120)}
                          {(jobData.jobSummary?.summary || jobData.jobDescription || jobData.description || '').length > 120 ? '...' : ''}
                        </p>
                      )}

                      {(jobData.skillsRequired || jobData.essentialSkills)?.length > 0 && (
                        <div className="mb-3">
                          <p className={`text-[12px] font-medium ${getTextClassName()} mb-2`}>Skills Required</p>
                          <div className="flex flex-wrap gap-1">
                            {(jobData.skillsRequired || jobData.essentialSkills || []).map((skill, idx) => (
                              <span key={`skill-${idx}`} className="px-2 py-1 bg-[#00EA72] text-white text-[10px] rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {(jobData.essentialLicenses || jobData.licenses)?.length > 0 && (
                        <div className="mb-3">
                          <p className={`text-[12px] font-medium ${getTextClassName()} mb-2`}>Essential Licenses</p>
                          <div className="flex flex-wrap gap-1">
                            {(jobData.essentialLicenses || jobData.licenses || []).map((license, idx) => (
                              <span key={`license-${idx}`} className="px-2 py-1 bg-[#00EA72] text-white text-[10px] rounded-full">
                                {license}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <p className={`text-[10px] ${getSubTextClassName()}`}>
                          {isApplication && job.createdAt 
                            ? `Applied ${new Date(job.createdAt).toLocaleDateString()}`
                            : jobData.createdAt
                            ? `Posted ${new Date(jobData.createdAt).toLocaleDateString()}`
                            : 'Recently posted'}
                        </p>
                        <div className="flex items-center space-x-2">
                          {jobData.salary && (
                            <span className={`text-[10px] font-medium ${getTextClassName()}`}>
                              ${jobData.salary}
                            </span>
                          )}
                          {activeTab === 'My Jobs' && user?.role === 'employer' && (
                            <span className={`text-[10px] ${getSubTextClassName()}`}>
                              {jobData.totalApplications || 0} applications
                            </span>
                          )}
                        </div>
                      </div>

                      {/* View Details Button */}
                      <motion.button
                        whileHover={{ scale: (isClosed || jobData.isDummy) ? 1 : 1.03 }}
                        whileTap={{ scale: (isClosed || jobData.isDummy) ? 1 : 0.97 }}
                        onClick={() => {
                          if (jobData.isDummy) {
                            setShowSubscriptionModal(true);
                          } else if (!isClosed) {
                            router.push(`/job/${jobId}`);
                          }
                        }}
                        disabled={isClosed && isApplication}
                        className={`w-full ${
                          jobData.isDummy 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' 
                            : isClosed && isApplication 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-[#00EA72] hover:bg-[#00D66C]'
                        } text-${jobData.isDummy ? 'white' : 'black'} font-medium text-[13px] py-2 rounded-full transition-colors`}
                      >
                        {jobData.isDummy ? '🔓 Subscribe to Unlock' : isClosed && isApplication ? 'Job Closed' : 'View Details'}
                      </motion.button>
                    </motion.div>
                        );
                      });
                    })()
                  )}
                </div>
                  </>
                )}
              </>
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && handleCancelEdit()}
        >
          <div className={`${getCardClassName()} max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-in zoom-in-95 duration-200`}>
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${getTextClassName()}`}>Edit Profile</h2>
                <button
                  onClick={handleCancelEdit}
                  className={`p-2 rounded-lg hover:bg-gray-100 ${getTextClassName()}`}
                >
                  ✕
                </button>
              </div>

              {/* Save Message */}
              {saveMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  saveMessage.includes('success') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {saveMessage}
                </div>
              )}

              {/* Edit Form */}
              <div className="space-y-5">
                {/* Profile Image */}
                <div className="flex flex-col items-center">
                  <Label className={`${getTextClassName()} mb-3 text-center`}>Profile Image</Label>
                  <div className="flex flex-col items-center gap-3">
                    {editForm.profileImage ? (
                      <img 
                        src={editForm.profileImage} 
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-[#00EA72]/20"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center border-4 border-gray-200">
                        <User className="w-12 h-12 text-gray-500" />
                      </div>
                    )}
                    <input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="profileImage"
                      className="px-6 py-2.5 bg-[#00EA72] text-white rounded-lg cursor-pointer hover:bg-[#00d966] transition-colors font-medium shadow-sm hover:shadow-md"
                    >
                      Upload Photo
                    </label>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <Label htmlFor="fullName" className={`${getTextClassName()} mb-1.5 block font-medium`}>Full Name</Label>
                  <Input
                    id="fullName"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                    className={`${getInputClassName()} h-11`}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className={`${getTextClassName()} mb-1.5 block font-medium`}>Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`${getInputClassName()} h-11`}
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <Label htmlFor="phoneNumber" className={`${getTextClassName()} mb-1.5 block font-medium`}>Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className={`${getInputClassName()} h-11`}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <Label htmlFor="dateOfBirth" className={`${getTextClassName()} mb-1.5 block font-medium`}>Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className={`${getInputClassName()} h-11`}
                  />
                </div>

                {/* Address */}
                <div>
                  <Label htmlFor="address" className={`${getTextClassName()} mb-1.5 block font-medium`}>Address</Label>
                  <Input
                    id="address"
                    value={editForm.address}
                    onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    className={`${getInputClassName()} h-11`}
                    placeholder="City, Country"
                  />
                </div>

                {/* Professional Summary */}
                <div>
                  <Label htmlFor="summary" className={`${getTextClassName()} mb-1.5 block font-medium`}>Professional Summary</Label>
                  <Textarea
                    id="summary"
                    value={editForm.summary}
                    onChange={(e) => setEditForm(prev => ({ ...prev, summary: e.target.value }))}
                    rows={6}
                    className={`${getInputClassName()} min-h-[140px] resize-none rounded-[5px]`}
                    placeholder="Write a brief professional summary about yourself..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saveLoading}
                    className="flex-1 bg-[#00EA72] text-white hover:bg-[#00d966] h-11 font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    {saveLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="flex-1 h-11 font-medium"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      <AnimatePresence>
        {showEditJobModal && editingJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            onClick={() => {
              if (!saveLoading) {
                setShowEditJobModal(false);
                setEditingJob(null);
                setEditJobStep(1);
                setSaveMessage('');
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`${getCardClassName()} rounded-3xl border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className={`text-3xl font-bold ${getTextClassName()} mb-2`}>Edit Job Posting</h2>
                  <p className={`text-sm ${getSubTextClassName()}`}>
                    Update your job details • Step {editJobStep} of 4
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (!saveLoading) {
                      setShowEditJobModal(false);
                      setEditingJob(null);
                      setEditJobStep(1);
                      setSaveMessage('');
                    }
                  }}
                  className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${getSubTextClassName()} hover:text-red-500 transition-all`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <button
                      onClick={() => setEditJobStep(step)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                        editJobStep === step
                          ? 'bg-[#00EA72] text-black scale-110'
                          : editJobStep > step
                          ? 'bg-[#00EA72]/30 text-[#00EA72]'
                          : `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} ${getSubTextClassName()}`
                      }`}
                    >
                      {step}
                    </button>
                    {step < 4 && (
                      <div className={`flex-1 h-1 mx-2 rounded-full ${
                        editJobStep > step ? 'bg-[#00EA72]' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Save Message */}
              <AnimatePresence>
                {saveMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mb-6 p-4 rounded-xl ${
                      saveMessage.includes('success')
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{saveMessage}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={editJobStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {editJobStep === 1 && (
                    <div className="space-y-6">
                      <h3 className={`text-xl font-bold ${getTextClassName()} mb-4`}>📋 Basic Job Details</h3>
                      
                      {/* Job Title */}
                      <div>
                        <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>Job Title *</Label>
                        <Input
                          value={editJobForm.jobTitle}
                          onChange={(e) => setEditJobForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                          className={`${getInputClassName()} h-12 rounded-xl`}
                          placeholder="e.g., Senior Software Engineer"
                        />
                      </div>

                      {/* Employment Type & Industry Type */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>Employment Type *</Label>
                          <select
                            value={editJobForm.employmentType}
                            onChange={(e) => setEditJobForm(prev => ({ ...prev, employmentType: e.target.value }))}
                            className={`w-full h-12 ${getInputClassName()} border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} rounded-xl px-4`}
                          >
                            <option value="">Select Type</option>
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                            <option value="casual">Casual</option>
                            <option value="contract">Contract</option>
                          </select>
                        </div>

                        <div>
                          <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>Industry Type *</Label>
                          <select
                            value={editJobForm.industryType}
                            onChange={(e) => setEditJobForm(prev => ({ ...prev, industryType: e.target.value }))}
                            className={`w-full h-12 ${getInputClassName()} border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} rounded-xl px-4`}
                          >
                            <option value="">Select Industry</option>
                            <option value="Technology">Technology</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Finance">Finance</option>
                            <option value="Education">Education</option>
                            <option value="Construction">Construction</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Retail">Retail</option>
                            <option value="Hospitality">Hospitality</option>
                            <option value="Transportation">Transportation</option>
                            <option value="Real Estate">Real Estate</option>
                            <option value="Legal">Legal</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Arts & Entertainment">Arts & Entertainment</option>
                            <option value="Agriculture">Agriculture</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Minimum Experience */}
                      <div>
                        <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>Minimum Experience *</Label>
                        <select
                          value={editJobForm.minimumExperience}
                          onChange={(e) => setEditJobForm(prev => ({ ...prev, minimumExperience: e.target.value }))}
                          className={`w-full h-12 ${getInputClassName()} border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} rounded-xl px-4`}
                        >
                          <option value="">Select Experience</option>
                          <option value="no-experience">No Experience</option>
                          <option value="1-2-years">1-2 Years</option>
                          <option value="2-5-years">2-5 Years</option>
                          <option value="5-10-years">5-10 Years</option>
                          <option value="10plus-years">10+ Years</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {editJobStep === 2 && (
                    <div className="space-y-6">
                      <h3 className={`text-xl font-bold ${getTextClassName()} mb-4`}>📝 Job Description</h3>
                      
                      {/* Job Summary */}
                      <div>
                        <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>Job Summary</Label>
                        <Textarea
                          value={editJobForm.summary}
                          onChange={(e) => setEditJobForm(prev => ({ ...prev, summary: e.target.value }))}
                          rows={18}
                          className={`${getInputClassName()} resize-none rounded-xl`}
                          placeholder="Describe the job role, responsibilities, and requirements..."
                        />
                        <p className={`text-xs ${getSubTextClassName()} mt-2`}>
                          {editJobForm.summary.length} / 5000 characters
                        </p>
                      </div>
                    </div>
                  )}

                  {editJobStep === 3 && (
                    <div className="space-y-6">
                      <h3 className={`text-xl font-bold ${getTextClassName()} mb-4`}>🎯 Qualifications</h3>
                      
                      {/* Qualifications List */}
                      <div>
                        <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>Qualifications (Optional)</Label>
                        <div className="space-y-3">
                          {editJobForm.qualifications.map((qual, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={qual}
                                onChange={(e) => {
                                  const newQuals = [...editJobForm.qualifications];
                                  newQuals[index] = e.target.value;
                                  setEditJobForm(prev => ({ ...prev, qualifications: newQuals }));
                                }}
                                className={`${getInputClassName()} h-11 rounded-xl flex-1`}
                                placeholder={`Qualification ${index + 1}`}
                              />
                              <button
                                onClick={() => {
                                  const newQuals = editJobForm.qualifications.filter((_, i) => i !== index);
                                  setEditJobForm(prev => ({ ...prev, qualifications: newQuals }));
                                }}
                                className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => setEditJobForm(prev => ({ ...prev, qualifications: [...prev.qualifications, ''] }))}
                            className={`w-full h-11 border-2 border-dashed ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} rounded-xl ${getTextClassName()} hover:border-[#00EA72] hover:bg-[#00EA72]/5 transition-all`}
                          >
                            + Add Qualification
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {editJobStep === 4 && (
                    <div className="space-y-6">
                      <h3 className={`text-xl font-bold ${getTextClassName()} mb-4`}>💼 Compensation & Location</h3>
                      
                      {/* Salary Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>Salary</Label>
                          <Input
                            value={editJobForm.salary}
                            onChange={(e) => setEditJobForm(prev => ({ ...prev, salary: e.target.value }))}
                            className={`${getInputClassName()} h-12 rounded-xl`}
                            placeholder="e.g., 60000"
                          />
                        </div>
                        <div>
                          <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>Salary Frequency</Label>
                          <select
                            value={editJobForm.salaryFrequency}
                            onChange={(e) => setEditJobForm(prev => ({ ...prev, salaryFrequency: e.target.value }))}
                            className={`w-full h-12 ${getInputClassName()} border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} rounded-xl px-4`}
                          >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                        </div>
                      </div>

                      {/* Salary Range */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>Salary Min</Label>
                          <Input
                            type="number"
                            value={editJobForm.salaryMin}
                            onChange={(e) => setEditJobForm(prev => ({ ...prev, salaryMin: e.target.value }))}
                            className={`${getInputClassName()} h-12 rounded-xl`}
                            placeholder="Minimum"
                          />
                        </div>
                        <div>
                          <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>Salary Max</Label>
                          <Input
                            type="number"
                            value={editJobForm.salaryMax}
                            onChange={(e) => setEditJobForm(prev => ({ ...prev, salaryMax: e.target.value }))}
                            className={`${getInputClassName()} h-12 rounded-xl`}
                            placeholder="Maximum"
                          />
                        </div>
                      </div>

                      {/* Work Location */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>Work Location</Label>
                          <select
                            value={editJobForm.workLocation}
                            onChange={(e) => setEditJobForm(prev => ({ ...prev, workLocation: e.target.value }))}
                            className={`w-full h-12 ${getInputClassName()} border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} rounded-xl px-4`}
                          >
                            <option value="">Select Location</option>
                            <option value="on-site">On-site</option>
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>
                        <div>
                          <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>Number of Positions</Label>
                          <Input
                            type="number"
                            min="1"
                            value={editJobForm.numberOfPositions}
                            onChange={(e) => setEditJobForm(prev => ({ ...prev, numberOfPositions: parseInt(e.target.value) || 1 }))}
                            className={`${getInputClassName()} h-12 rounded-xl`}
                          />
                        </div>
                      </div>

                      {/* Address Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>City</Label>
                          <Input
                            value={editJobForm.city}
                            onChange={(e) => setEditJobForm(prev => ({ ...prev, city: e.target.value }))}
                            className={`${getInputClassName()} h-12 rounded-xl`}
                            placeholder="e.g., Sydney"
                          />
                        </div>
                        <div>
                          <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>State</Label>
                          <Input
                            value={editJobForm.state}
                            onChange={(e) => setEditJobForm(prev => ({ ...prev, state: e.target.value }))}
                            className={`${getInputClassName()} h-12 rounded-xl`}
                            placeholder="e.g., NSW"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>Postcode</Label>
                          <Input
                            value={editJobForm.postcode}
                            onChange={(e) => setEditJobForm(prev => ({ ...prev, postcode: e.target.value }))}
                            className={`${getInputClassName()} h-12 rounded-xl`}
                            placeholder="e.g., 2000"
                          />
                        </div>
                        <div>
                          <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>Country</Label>
                          <Input
                            value={editJobForm.country}
                            onChange={(e) => setEditJobForm(prev => ({ ...prev, country: e.target.value }))}
                            className={`${getInputClassName()} h-12 rounded-xl`}
                            placeholder="e.g., Australia"
                          />
                        </div>
                      </div>

                      {/* Full Address (for on-site) */}
                      {editJobForm.workLocation === 'on-site' && (
                        <div>
                          <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>Full Address</Label>
                          <Input
                            value={editJobForm.address}
                            onChange={(e) => setEditJobForm(prev => ({ ...prev, address: e.target.value }))}
                            className={`${getInputClassName()} h-12 rounded-xl`}
                            placeholder="Full street address"
                          />
                        </div>
                      )}

                      {/* Deadlines */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>Application Deadline</Label>
                          <Input
                            type="date"
                            value={editJobForm.applicationDeadline}
                            onChange={(e) => setEditJobForm(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                            className={`${getInputClassName()} h-12 rounded-xl`}
                          />
                        </div>
                        <div>
                          <Label className={`${getTextClassName()} mb-2 block font-medium text-sm`}>Closing Date</Label>
                          <Input
                            type="date"
                            value={editJobForm.closingDate}
                            onChange={(e) => setEditJobForm(prev => ({ ...prev, closingDate: e.target.value }))}
                            className={`${getInputClassName()} h-12 rounded-xl`}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}">
                {editJobStep > 1 && (
                  <Button
                    onClick={() => setEditJobStep(editJobStep - 1)}
                    disabled={saveLoading}
                    variant="outline"
                    className="h-12 px-6 rounded-xl font-medium"
                  >
                    ← Previous
                  </Button>
                )}
                
                <div className="flex-1" />
                
                {editJobStep < 4 ? (
                  <Button
                    onClick={() => setEditJobStep(editJobStep + 1)}
                    disabled={saveLoading || (editJobStep === 1 && (!editJobForm.jobTitle || !editJobForm.employmentType || !editJobForm.industryType || !editJobForm.minimumExperience))}
                    className="h-12 px-8 bg-[#00EA72] text-black hover:bg-[#00D66C] rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    Continue →
                  </Button>
                ) : (
                  <Button
                    onClick={handleSaveEditJob}
                    disabled={saveLoading || !editJobForm.jobTitle || !editJobForm.employmentType || !editJobForm.industryType || !editJobForm.minimumExperience}
                    className="h-12 px-8 bg-[#00EA72] text-black hover:bg-[#00D66C] rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {saveLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      '✓ Save Changes'
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Job Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            onClick={() => {
              setShowDeleteModal(false);
              setJobToDelete(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`${getCardClassName()} rounded-xl border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} p-8 max-w-md w-full shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center"
              >
                <svg
                  className="w-10 h-10 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`text-2xl font-bold ${getTextClassName()} text-center mb-3`}
              >
                Delete Job Posting?
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`${getSubTextClassName()} text-center mb-8`}
              >
                This action cannot be undone. All applications and data associated with this job will be permanently removed.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setJobToDelete(null);
                  }}
                  className={`flex-1 px-6 py-3 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${getTextClassName()} rounded-lg font-semibold transition-all shadow-md hover:shadow-lg`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmDeleteJob}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Delete Job
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subscription Modal */}
      <AnimatePresence>
        {showSubscriptionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSubscriptionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`${getCardClassName()} rounded-3xl p-8 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${getTextClassName()}`}>Choose Your Plan</h2>
                  <p className={`text-sm ${getSubTextClassName()} mt-1`}>Unlock all features with a subscription</p>
                </div>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${getTextClassName()}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Terms Link */}
              <div className="text-center mb-6">
                <a
                  href="/terms"
                  className={`text-sm ${getSubTextClassName()} hover:text-[#00EA72] underline`}
                >
                  View Terms and Conditions
                </a>
              </div>

              {/* Subscription Packages */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Basic Plan */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`border-2 border-gray-300 rounded-2xl p-6 hover:border-[#00EA72] transition-all ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="text-center mb-6">
                    <h3 className={`text-xl font-bold ${getTextClassName()} mb-2`}>Basic</h3>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-[#00EA72]">$29</span>
                      <span className={`text-sm ${getSubTextClassName()} ml-2`}>per month</span>
                    </div>
                    <p className={`text-xs ${getSubTextClassName()} mt-2`}>Perfect for getting started</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {['Post up to 5 jobs', 'Basic applicant tracking', 'Email notifications', 'Standard support'].map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-[#00EA72] rounded-full flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className={`text-sm ${getTextClassName()}`}>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleSubscribe('basic')}
                    disabled={subscriptionLoading}
                    className="w-full py-3 bg-[#00EA72] hover:bg-[#00D66C] text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {subscriptionLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        Processing...
                      </>
                    ) : (
                      'Get Started'
                    )}
                  </button>
                </motion.div>

                {/* Pro Plan - Featured */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`border-2 border-[#00EA72] rounded-2xl p-6 relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00EA72] text-black px-4 py-1 rounded-full text-xs font-bold">
                    MOST POPULAR
                  </div>
                  
                  <div className="text-center mb-6 mt-2">
                    <h3 className={`text-xl font-bold ${getTextClassName()} mb-2`}>Pro</h3>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-[#00EA72]">$59</span>
                      <span className={`text-sm ${getSubTextClassName()} ml-2`}>per month</span>
                    </div>
                    <p className={`text-xs ${getSubTextClassName()} mt-2`}>For growing businesses</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {['Unlimited job posts', 'Advanced applicant tracking', 'Priority support', 'Analytics dashboard', 'Custom branding', 'API access'].map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-[#00EA72] rounded-full flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className={`text-sm ${getTextClassName()}`}>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleSubscribe('pro')}
                    disabled={subscriptionLoading}
                    className="w-full py-3 bg-[#00EA72] hover:bg-[#00D66C] text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {subscriptionLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        Processing...
                      </>
                    ) : (
                      'Get Started'
                    )}
                  </button>
                </motion.div>

                {/* Enterprise Plan */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`border-2 border-gray-300 rounded-2xl p-6 hover:border-[#00EA72] transition-all ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="text-center mb-6">
                    <h3 className={`text-xl font-bold ${getTextClassName()} mb-2`}>Enterprise</h3>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-[#00EA72]">$99</span>
                      <span className={`text-sm ${getSubTextClassName()} ml-2`}>per month</span>
                    </div>
                    <p className={`text-xs ${getSubTextClassName()} mt-2`}>For large organizations</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {['Everything in Pro', 'Dedicated account manager', 'Custom integrations', 'White-label solution', 'SLA guarantee', '24/7 phone support'].map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-[#00EA72] rounded-full flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className={`text-sm ${getTextClassName()}`}>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleSubscribe('enterprise')}
                    disabled={subscriptionLoading}
                    className="w-full py-3 bg-[#00EA72] hover:bg-[#00D66C] text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {subscriptionLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        Processing...
                      </>
                    ) : (
                      'Get Started'
                    )}
                  </button>
                </motion.div>
              </div>

              {/* Footer Note */}
              <div className={`mt-6 text-center ${getSubTextClassName()} text-sm`}>
                All plans include a 14-day free trial. Cancel anytime.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
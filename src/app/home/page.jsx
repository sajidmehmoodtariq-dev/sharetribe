'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';
import { Bell, User, Menu } from 'lucide-react';

export default function HomePage() {
  const { theme, getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName, getInputClassName } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Search Jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSavedProjects, setShowSavedProjects] = useState(false);
  const [showFavouriteJobs, setShowFavouriteJobs] = useState(false);
  const [showMyNetwork, setShowMyNetwork] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [businessSearchQuery, setBusinessSearchQuery] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [sortBy, setSortBy] = useState('Relevance');
  const [favoriteJobs, setFavoriteJobs] = useState(new Set([1, 2])); // Job IDs 1 and 2 are favorited by default
  const [connectionSearchQuery, setConnectionSearchQuery] = useState('');
  const [sortConnectionsBy, setSortConnectionsBy] = useState('Alphabetical');

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
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

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login/role-selection');
    } catch (error) {
      console.error('Error signing out:', error);
    }
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

  const tabs = ['Search Jobs', 'Future Jobs', 'Networks', 'Corporate'];

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

  const toggleFavorite = (jobId) => {
    setFavoriteJobs(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(jobId)) {
        newFavorites.delete(jobId);
      } else {
        newFavorites.add(jobId);
      }
      return newFavorites;
    });
  };

  const handleLiveChat = () => {
    // Handle live chat functionality
    console.log('Opening live chat...');
    // You can add live chat implementation here
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
                setShowSavedProjects(false);
                setShowFavouriteJobs(false);
                setShowMyNetwork(false);
                setShowLiveChat(false);
                setShowSettings(false);
                setActiveTab('Search Jobs');
              }}
              className="flex items-center"
            >
              <Image
                src="/logo.png"
                alt="Head Huntd Logo"
                width={40}
                height={40}
                className={theme === 'dark' ? 'filter invert' : ''}
              />
            </button>
          </div>
          
          {/* Icons */}
          <div className="flex items-center gap-2">
            {/* Bell Icon */}
            <button className="p-2" onClick={() => {
              setShowLiveChat(true);
              setShowProfile(false);
              setShowSavedProjects(false);
              setShowFavouriteJobs(false);
              setShowMyNetwork(false);
              setShowSettings(false);
            }}>
              <Bell className={`w-6 h-6 ${getTextClassName()}`} />
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
              setShowSavedProjects(false);
              setShowFavouriteJobs(false);
              setShowMyNetwork(false);
              setShowLiveChat(false);
            }}>
              <Menu className={`w-6 h-6 ${getTextClassName()}`} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-2">
          <div className={`${getCardClassName()} rounded-3xl px-4 py-6 shadow-sm w-[97%] mx-auto`}>
            {showLiveChat ? (
              /* Live Chat Page */
              <div className="space-y-4">
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
              </div>
            ) : showSettings ? (
              /* Settings/Drop Down Page */
              <div className="space-y-6">
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
                <div className="space-y-1">
                  <button 
                    onClick={() => {
                      setShowSettings(false);
                      setShowProfile(true);
                    }}
                    className={`w-full text-left p-4 rounded-lg hover:bg-gray-50 ${getTextClassName()}`}
                  >
                    My Profile Card
                  </button>
                  
                  <button 
                    onClick={() => {
                      setShowSettings(false);
                      setShowMyNetwork(true);
                    }}
                    className={`w-full text-left p-4 rounded-lg hover:bg-gray-50 ${getTextClassName()}`}
                  >
                    My Network
                  </button>
                  
                  <button 
                    onClick={() => {
                      setShowSettings(false);
                      setShowFavouriteJobs(true);
                    }}
                    className={`w-full text-left p-4 rounded-lg hover:bg-gray-50 ${getTextClassName()}`}
                  >
                    Favourite Jobs
                  </button>
                  
                  <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} my-2`}></div>
                  
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left p-4 rounded-lg hover:bg-gray-50 text-red-600"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : showProfile ? (
              /* Profile Card Content */
              <div className="space-y-6">
                {/* Profile Header */}
                <h2 className={`text-lg font-semibold ${getTextClassName()}`}>My Profile Card</h2>

                {/* Profile Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${getTextClassName()}`}>Al Dente</h3>
                      <p className={`text-sm ${getSubTextClassName()}`}>Concrete Finisher</p>
                      <p className={`text-xs ${getSubTextClassName()}`}>• Adelaide, Australia</p>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button className="px-4 py-2 text-sm">Edit Profile</Button>
                </div>

                {/* Profile Tabs */}
                <div className="flex space-x-6 border-b border-gray-200 overflow-x-auto">
                  {['Profile', 'Favourite Jobs', 'Saved Projects', 'My Network'].map((tab, index) => (
                    <button
                      key={tab}
                      onClick={() => {
                        if (tab === 'Saved Projects') {
                          setShowProfile(false);
                          setShowFavouriteJobs(false);
                          setShowSavedProjects(true);
                        } else if (tab === 'Favourite Jobs') {
                          setShowProfile(false);
                          setShowSavedProjects(false);
                          setShowMyNetwork(false);
                          setShowFavouriteJobs(true);
                        } else if (tab === 'My Network') {
                          setShowProfile(false);
                          setShowSavedProjects(false);
                          setShowFavouriteJobs(false);
                          setShowMyNetwork(true);
                        }
                      }}
                      className={`pb-2 text-sm font-medium whitespace-nowrap ${
                        index === 0 
                          ? `${getTextClassName()} border-b-2 border-[#00EA72]` 
                          : `${getSubTextClassName()}`
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* About Section */}
                <div>
                  <div className="flex space-x-6 border-b border-gray-200 mb-4">
                    <button className={`pb-2 text-sm font-medium ${getTextClassName()} border-b-2 border-[#00EA72]`}>
                      About
                    </button>
                    <button className={`pb-2 text-sm font-medium ${getSubTextClassName()}`}>
                      References
                    </button>
                  </div>
                  <p className={`text-sm leading-relaxed ${getSubTextClassName()}`}>
                    I am a experienced Concreter skilled in pouring, finishing, and repairing concrete for residential, commercial, and industrial projects. Expert in using various tools and techniques, delivering high-quality finishes with attention to detail and safety. Reliable, hardworking, and committed to producing strong and durable results.
                  </p>
                </div>

                {/* Essential Licenses */}
                <div>
                  <h4 className={`font-semibold mb-3 ${getTextClassName()}`}>Essential Licenses</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Current White Card</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Current Driver's license C class manual</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">MR Class</span>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className={`font-semibold mb-3 ${getTextClassName()}`}>Al Dente's Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Foundations', 'Commercial', 'Decorative', 'Residential', 'Labourer'].map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h4 className={`font-semibold mb-2 ${getTextClassName()}`}>My next available date to work is:</h4>
                  <p className={`text-sm mb-3 ${getSubTextClassName()}`}>Monday August 22 - Friday August 25</p>
                  <p className={`text-sm font-medium mb-3 ${getTextClassName()}`}>August 2025</p>
                  
                  {/* Mini Calendar */}
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                      <div key={day} className={`text-center p-1 font-medium ${getSubTextClassName()}`}>
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
                      const isAvailable = date >= 22 && date <= 25;
                      return (
                        <div
                          key={date}
                          className={`text-center p-1 text-xs ${
                            isAvailable 
                              ? 'bg-green-100 text-green-800 font-semibold rounded' 
                              : getSubTextClassName()
                          }`}
                        >
                          {date}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : showSavedProjects ? (
              /* Saved Projects Content */
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg font-semibold ${getTextClassName()}`}>Saved Projects</h2>
                </div>

                {/* Tabs */}
                <div className="flex space-x-6 border-b border-gray-200 overflow-x-auto">
                  {['Profile', 'Favourite Jobs', 'Saved Projects', 'My Network'].map((tab, index) => (
                    <button
                      key={tab}
                      onClick={() => {
                        if (tab === 'Profile') {
                          setShowSavedProjects(false);
                          setShowFavouriteJobs(false);
                          setShowMyNetwork(false);
                          setShowProfile(true);
                        } else if (tab === 'Favourite Jobs') {
                          setShowSavedProjects(false);
                          setShowProfile(false);
                          setShowMyNetwork(false);
                          setShowFavouriteJobs(true);
                        } else if (tab === 'My Network') {
                          setShowSavedProjects(false);
                          setShowProfile(false);
                          setShowFavouriteJobs(false);
                          setShowMyNetwork(true);
                        }
                      }}
                      className={`pb-2 text-sm font-medium whitespace-nowrap ${
                        index === 2 
                          ? `${getTextClassName()} border-b-2 border-[#00EA72]` 
                          : `${getSubTextClassName()}`
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

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
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-[12px] font-medium flex items-center space-x-1">
                      <span>Industry Type</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-[12px] font-medium flex items-center space-x-1">
                      <span>Main Role</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-[12px] font-medium flex items-center space-x-1">
                      <span>Main Skills</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ) : showFavouriteJobs ? (
              /* Favourite Jobs Content */
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg font-semibold ${getTextClassName()}`}>Favourite Jobs</h2>
                </div>

                {/* Tabs */}
                <div className="flex space-x-6 border-b border-gray-200 overflow-x-auto">
                  {['Profile', 'Favourite Jobs', 'Saved Projects', 'My Network'].map((tab, index) => (
                    <button
                      key={tab}
                      onClick={() => {
                        if (tab === 'Profile') {
                          setShowFavouriteJobs(false);
                          setShowSavedProjects(false);
                          setShowMyNetwork(false);
                          setShowProfile(true);
                        } else if (tab === 'Saved Projects') {
                          setShowFavouriteJobs(false);
                          setShowProfile(false);
                          setShowMyNetwork(false);
                          setShowSavedProjects(true);
                        } else if (tab === 'My Network') {
                          setShowFavouriteJobs(false);
                          setShowProfile(false);
                          setShowSavedProjects(false);
                          setShowMyNetwork(true);
                        }
                      }}
                      className={`pb-2 text-sm font-medium whitespace-nowrap ${
                        index === 1 
                          ? `${getTextClassName()} border-b-2 border-[#00EA72]` 
                          : `${getSubTextClassName()}`
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

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
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-[12px] font-medium flex items-center space-x-1">
                      <span>Industry Type</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-[12px] font-medium flex items-center space-x-1">
                      <span>Main Role</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-[12px] font-medium flex items-center space-x-1">
                      <span>Main Skills</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Job Card Favourited */}
                <div className="bg-[#E8F5E8] p-1 rounded-lg">
                  <div className="flex items-center justify-center py-2">
                    <span className="text-[#00EA72] text-xs font-medium">★ Job Card Favourited</span>
                  </div>
                </div>

                {/* Job Listings */}
                <div className="space-y-3">
                  {jobListings.filter(job => favoriteJobs.has(job.id)).map((job) => (
                    <div key={job.id} className={`${getCardClassName()} rounded-lg p-4 shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                      {/* Job Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className={`font-semibold text-[13px] ${getTextClassName()}`}>{job.title}</h3>
                            <p className={`text-[11px] ${getSubTextClassName()}`}>{job.company}</p>
                            <div className={`flex items-center space-x-2 text-[10px] ${getSubTextClassName()} mt-1`}>
                              <span>{job.address}</span>
                              <span>•</span>
                              <span>{job.schedule}</span>
                              <span>•</span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded-full">{job.type}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleFavorite(job.id)}
                          className="text-[#00EA72] text-xs font-medium"
                        >
                          ★ Favourited
                        </button>
                      </div>

                      {/* Job Description */}
                      <p className={`text-[11px] ${getSubTextClassName()} mb-3 leading-relaxed`}>
                        {job.description}
                      </p>

                      {/* Skills Required */}
                      <div className="mb-3">
                        <h4 className={`font-semibold text-[11px] ${getTextClassName()} mb-2`}>Skills Required</h4>
                        <div className="flex flex-wrap gap-1">
                          {job.skillsRequired.map((skill, index) => (
                            <span key={index} className="bg-[#00EA72] text-white px-2 py-1 rounded-full text-[10px] font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Essential Licenses */}
                      <div className="mb-3">
                        <h4 className={`font-semibold text-[11px] ${getTextClassName()} mb-2`}>Essential Licences</h4>
                        <div className="space-y-1">
                          {job.essentialLicenses.map((license, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-[#00EA72] rounded-full"></div>
                              <span className={`text-[10px] ${getSubTextClassName()}`}>{license}</span>
                            </div>
                          ))}
                        </div>
                        <p className={`text-[9px] ${getSubTextClassName()} mt-2`}>MR Class</p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] ${getSubTextClassName()}`}>Posted {job.postedTime}</span>
                        {job.isLiveChat && (
                          <div className="flex items-center space-x-1">
                            <span className={`text-[10px] ${getSubTextClassName()}`}>Live Chat</span>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center space-x-2 pt-6">
                  <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-400">
                    ←
                  </button>
                  <button className="w-8 h-8 rounded-full bg-[#00EA72] text-white flex items-center justify-center font-medium text-sm">
                    1
                  </button>
                  <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 text-sm">
                    2
                  </button>
                  <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 text-sm">
                    3
                  </button>
                  <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 text-sm">
                    4
                  </button>
                  <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 text-sm">
                    5
                  </button>
                  <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 text-sm">
                    6
                  </button>
                  <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-400">
                    →
                  </button>
                </div>
              </div>
            ) : showMyNetwork ? (
              /* My Network Content */
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg font-semibold ${getTextClassName()}`}>My Network</h2>
                </div>

                {/* Tabs */}
                <div className="flex space-x-6 border-b border-gray-200 overflow-x-auto">
                  {['Profile', 'Favourite Jobs', 'Saved Projects', 'My Network'].map((tab, index) => (
                    <button
                      key={tab}
                      onClick={() => {
                        if (tab === 'Profile') {
                          setShowMyNetwork(false);
                          setShowFavouriteJobs(false);
                          setShowSavedProjects(false);
                          setShowProfile(true);
                        } else if (tab === 'Favourite Jobs') {
                          setShowMyNetwork(false);
                          setShowProfile(false);
                          setShowSavedProjects(false);
                          setShowFavouriteJobs(true);
                        } else if (tab === 'Saved Projects') {
                          setShowMyNetwork(false);
                          setShowProfile(false);
                          setShowFavouriteJobs(false);
                          setShowSavedProjects(true);
                        }
                      }}
                      className={`pb-2 text-sm font-medium whitespace-nowrap ${
                        index === 3 
                          ? `${getTextClassName()} border-b-2 border-[#00EA72]` 
                          : `${getSubTextClassName()}`
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Search Connections */}
                <div>
                  <h3 className={`text-base font-semibold ${getTextClassName()} mb-4`}>Search Connections</h3>
                  
                  {/* Search Input */}
                  <div className="relative mb-4">
                    <Input
                      value={connectionSearchQuery}
                      onChange={(e) => setConnectionSearchQuery(e.target.value)}
                      placeholder="Search connected users"
                      className="h-12 rounded-full border-2 border-[#00EA72] text-[14px] pl-10 pr-4"
                    />
                    <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

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
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-[12px] font-medium flex items-center space-x-1">
                        <span>Industry Type</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-[12px] font-medium flex items-center space-x-1">
                        <span>Main Role</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-[12px] font-medium flex items-center space-x-1">
                        <span>Main Skills</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-[12px] font-medium flex items-center space-x-1">
                        <span>Employment Type</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-[12px] font-medium flex items-center space-x-1">
                        <span>Location</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-4">
                      <p className={`text-sm ${getTextClassName()}`}>120 connected users</p>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        <select 
                          value={sortConnectionsBy}
                          onChange={(e) => setSortConnectionsBy(e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option>Alphabetical</option>
                          <option>Order (A-Z)</option>
                          <option>Relevance</option>
                          <option>Newest</option>
                          <option>Oldest</option>
                        </select>
                      </div>
                    </div>

                    {/* Network Connections List */}
                    <div className="space-y-3">
                      {networkConnections.map((connection) => (
                        <div key={connection.id} className={`${getCardClassName()} rounded-lg p-4 shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              {connection.isOnline && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div>
                              <h4 className={`font-semibold text-[14px] ${getTextClassName()}`}>{connection.name}</h4>
                              <p className={`text-[12px] ${getSubTextClassName()}`}>{connection.jobTitle}</p>
                              <p className={`text-[11px] ${getSubTextClassName()}`}>{connection.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button className={`${getCardClassName()} border ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} text-[11px] px-3 py-1 rounded-full`}>
                              👁 View Profile
                            </Button>
                            <Button className={`${getCardClassName()} border ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} text-[11px] px-3 py-1 rounded-full`}>
                              💬 Message
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Original Job Search Content */
              <>
                {/* Tabs */}
                <div className={`flex space-x-4 mb-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-x-auto`}>
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 text-[14px] font-medium transition-colors relative whitespace-nowrap ${
                        activeTab === tab
                          ? `${getTextClassName()}`
                          : `${getSubTextClassName()} hover:${getTextClassName()}`
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00EA72]"></div>
                      )}
                    </button>
                  ))}
                </div>

                {activeTab === 'Networks' ? (
                  /* Networks Tab Content */
                  <div className="space-y-6">
                    {/* Networks Greeting */}
                    <h2 className={`text-[18px] font-bold ${getTextClassName()} mb-6`}>
                      My Network
                    </h2>

                    {/* Search Connections */}
                    <div className="mb-6">
                      <h3 className={`text-[16px] font-semibold ${getTextClassName()} mb-4`}>
                        Search Connections
                      </h3>
                      
                      {/* Search Input */}
                      <div className="relative mb-4">
                        <Input
                          value={connectionSearchQuery}
                          onChange={(e) => setConnectionSearchQuery(e.target.value)}
                          placeholder="Search connected users"
                          className="h-12 rounded-full border-2 border-[#00EA72] text-[14px] pl-10 pr-4"
                        />
                        <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

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
                        <div className="flex flex-wrap gap-2 mb-4">
                          <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-[12px] font-medium flex items-center space-x-1">
                            <span>Industry Type</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-[12px] font-medium flex items-center space-x-1">
                            <span>Main Role</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-[12px] font-medium flex items-center space-x-1">
                            <span>Main Skills</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-[12px] font-medium flex items-center space-x-1">
                            <span>Employment Type</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-[12px] font-medium flex items-center space-x-1">
                            <span>Location</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>

                        {/* Results Header with Grid Toggle */}
                        <div className="flex items-center justify-between mb-4">
                          <p className={`text-sm ${getTextClassName()}`}>120 connected users</p>
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            <select 
                              value={sortConnectionsBy}
                              onChange={(e) => setSortConnectionsBy(e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option>Alphabetical</option>
                              <option>Order (A-Z)</option>
                              <option>Relevance</option>
                              <option>Newest</option>
                              <option>Oldest</option>
                            </select>
                          </div>
                        </div>

                        {/* Network Connections Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {networkConnections.map((connection) => (
                            <div key={connection.id} className={`${getCardClassName()} rounded-lg p-4 shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} text-center`}>
                              <div className="relative mx-auto mb-3 w-12 h-12">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-gray-400" />
                                </div>
                                {connection.isOnline && (
                                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                )}
                              </div>
                              <h4 className={`font-semibold text-[14px] ${getTextClassName()} mb-1`}>{connection.name}</h4>
                              <p className={`text-[12px] ${getSubTextClassName()} mb-1`}>{connection.jobTitle}</p>
                              <p className={`text-[11px] ${getSubTextClassName()} mb-3`}>{connection.location}</p>
                              <div className="flex flex-col space-y-2">
                                <Button className={`${getCardClassName()} border ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} text-[11px] px-3 py-1 rounded-full`}>
                                  👁 View Profile
                                </Button>
                                <Button className={`${getCardClassName()} border ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} text-[11px] px-3 py-1 rounded-full`}>
                                  💬 Message
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Greeting and Create Job Button */}
                    <div className="flex items-center justify-between mb-6">
                      <h2 className={`text-[18px] font-bold ${getTextClassName()}`}>
                        Good Morning, {user?.fullName || 'User'}
                      </h2>
                      {user?.role === 'employer' && (
                        <Button 
                          onClick={() => {
                            // TODO: Open create job modal or navigate to create job page
                            alert('Create job functionality coming soon!');
                          }}
                          className="bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium text-[13px] px-4 py-2 rounded-full"
                        >
                          + Create Job
                        </Button>
                      )}
                    </div>

                    {/* Search Section */}
                    <div className="mb-6">
                  <h3 className={`text-[16px] font-semibold ${getTextClassName()} mb-4`}>
                    {user?.role === 'employer' ? 'Search Workers' : 'Find jobs'}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={user?.role === 'employer' ? 'Search for workers i.e. Concrete Finisher' : 'Search for jobs i.e. Concrete Finisher'}
                        className={`${getInputClassName()} border-2 border-[#00EA72] text-[14px] pl-10 pr-4`}
                      />
                      <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    {/* Location Input */}
                    <div>
                      <Label className={`text-[14px] font-medium ${getTextClassName()} mb-2 block`}>
                        Where
                      </Label>
                      <div className="relative">
                        <Input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Search Location"
                          className="h-12 rounded-full border-gray-300 text-[14px] pr-10"
                        />
                        <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1011.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Advanced Filters */}
                    <div>
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
                        <button className={`text-[12px] ${getSubTextClassName()} hover:${getTextClassName()}`}>
                          Reset all filters
                        </button>
                      </div>
                      
                      <p className={`text-[12px] ${getSubTextClassName()} mb-3`}>
                        Narrow searches with these additional fields
                      </p>

                      {/* Filter Buttons */}
                      <div className="flex space-x-2 mb-4">
                        <button 
                          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                          className="px-4 py-2 rounded-full bg-[#00EA72] text-white text-[12px] font-medium flex items-center space-x-1"
                        >
                          <span>Industry Type</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-[12px] font-medium flex items-center space-x-1">
                          <span>Main Skills</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Industry Options */}
                      {showAdvancedFilters && (
                        <div className="grid grid-cols-1 gap-2 mb-4 pl-3 border-l-2 border-gray-200">
                          {industries.map((industry) => (
                            <div key={industry} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={industry}
                                name="industry"
                                value={industry}
                                checked={selectedIndustry === industry}
                                onChange={(e) => setSelectedIndustry(e.target.value)}
                                className="w-3 h-3 text-[#00EA72] border-gray-300 focus:ring-[#00EA72]"
                              />
                              <label 
                                htmlFor={industry} 
                                className={`text-[13px] ${getTextClassName()} cursor-pointer`}
                              >
                                {industry}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Search Button */}
                    <Button
                      onClick={handleSearch}
                      className="w-full h-12 bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium text-[14px] rounded-full"
                    >
                      Search
                    </Button>
                  </div>
                </div>

                {/* Job Listing */}
                <div className="space-y-4">
                  {jobListings.map((job) => (
                    <div key={job.id} className={`border rounded-3xl p-4 ${getCardClassName()} shadow-sm ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-[12px] font-bold text-white">K</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-[14px] ${getTextClassName()} mb-1 truncate`}>{job.title}</h4>
                            <p className={`text-[12px] ${getSubTextClassName()} mb-1 truncate`}>{job.company}</p>
                            <div className={`flex items-center space-x-3 text-[10px] ${getSubTextClassName()}`}>
                              <div className="flex items-center space-x-1">
                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                <span className="truncate">{job.address}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{job.schedule}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2M8 6v2a2 2 0 002 2" />
                                </svg>
                                <span>{job.type}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleFavorite(job.id)}
                          className="p-1 shrink-0"
                        >
                          <svg className={`w-5 h-5 ${favoriteJobs.has(job.id) ? 'text-red-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </button>
                      </div>

                      <p className={`text-[12px] ${getSubTextClassName()} mb-3 line-clamp-2`}>
                        {job.description}
                      </p>

                      <div className="mb-3">
                        <p className={`text-[12px] font-medium ${getTextClassName()} mb-2`}>Skills Required</p>
                        <div className="flex flex-wrap gap-1">
                          {job.skillsRequired.map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-[#00EA72] text-white text-[10px] rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className={`text-[12px] font-medium ${getTextClassName()} mb-2`}>Essential Licenses</p>
                        <div className="flex flex-wrap gap-1">
                          {job.essentialLicenses.map((license) => (
                            <span key={license} className="px-2 py-1 bg-[#00EA72] text-white text-[10px] rounded-full">
                              {license}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className={`text-[10px] ${getSubTextClassName()}`}>Posted {job.postedTime}</p>
                        {job.isLiveChat && (
                          <button 
                            onClick={handleLiveChat}
                            className="flex items-center space-x-1 text-[#00EA72] text-[10px] font-medium"
                          >
                            <span>Live Chat</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="px-2 py-4">
          <div className="flex justify-center items-center space-x-1">
            <button className="p-1">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {[1, 2, 3, 4, 5].map((item, index) => (
              <button
                key={item}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium ${
                  index === 0 ? 'bg-[#00EA72] text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item}
              </button>
            ))}
            <button className="p-1">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
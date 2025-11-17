'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function ChatsPage() {
  const { theme, getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName } = useTheme();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUser();
    fetchChats();

    // Start polling for new messages every 2 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchChats(true); // Silent fetch without loading state
    }, 2000);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Handle chatId or jobId from URL query params
  useEffect(() => {
    if (chats.length > 0 && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const chatId = params.get('chatId');
      const jobId = params.get('jobId');
      
      if (chatId) {
        const chat = chats.find(c => c._id === chatId);
        if (chat) {
          selectChat(chat);
        }
      } else if (jobId) {
        // Select first chat for this job
        const chat = chats.find(c => c.jobId?._id === jobId);
        if (chat) {
          selectChat(chat);
        }
      }
    }
  }, [chats]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchChats = async (silent = false) => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if we need to filter by jobId (for employers)
      const params = new URLSearchParams(window.location.search);
      const jobId = params.get('jobId');
      
      let url = `${BACKEND_URL}/api/chats`;
      if (jobId && user?.role === 'employer') {
        // Fetch chats for specific job
        url = `${BACKEND_URL}/api/chats/job/${jobId}/all`;
      }
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data.chats);
        
        // Update selected chat if it exists
        if (selectedChat && data.chats) {
          const updatedSelectedChat = data.chats.find(c => c._id === selectedChat._id);
          if (updatedSelectedChat) {
            setSelectedChat(updatedSelectedChat);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const selectChat = async (chat) => {
    setSelectedChat(chat);
    setShowChatList(false); // Hide chat list on mobile
    
    // Mark messages as read
    try {
      const token = localStorage.getItem('token');
      await fetch(`${BACKEND_URL}/api/chats/${chat._id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local chat state
      setChats(prevChats =>
        prevChats.map(c =>
          c._id === chat._id
            ? {
                ...c,
                unreadCount: {
                  ...c.unreadCount,
                  [user.role === 'employer' ? 'employer' : 'jobSeeker']: 0
                }
              }
            : c
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${BACKEND_URL}/api/chats/${selectedChat._id}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ message })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedChat(data.chat);
        setMessage('');

        // Update chat in list
        setChats(prevChats =>
          prevChats.map(c =>
            c._id === data.chat._id
              ? data.chat
              : c
          ).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const acceptChat = async (chatId) => {
    if (!confirm('Accept this chat request? This will create an application for the job seeker.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/chats/${chatId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Update the chat in list
        setChats(prevChats =>
          prevChats.map(c =>
            c._id === chatId ? data.chat : c
          )
        );
        // Update selected chat if it's the one being accepted
        if (selectedChat?._id === chatId) {
          setSelectedChat(data.chat);
        }
        alert('Chat request accepted! Application created.');
      }
    } catch (error) {
      console.error('Error accepting chat:', error);
      alert('Failed to accept chat request');
    }
  };

  const deleteChat = async (chatId) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/chats/${chatId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setChats(chats.filter(c => c._id !== chatId));
        if (selectedChat?._id === chatId) {
          setSelectedChat(null);
        }
        alert('Chat deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat');
    }
  };

  const closeChat = async (chatId) => {
    if (!confirm('Are you sure you want to close this conversation? The applicant will not be able to send messages anymore.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/chats/${chatId}/close`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Update the chat in list
        setChats(prevChats =>
          prevChats.map(c => c._id === chatId ? data.chat : c)
        );
        // Update selected chat if it's the one being closed
        if (selectedChat?._id === chatId) {
          setSelectedChat(data.chat);
        }
        alert('Chat closed successfully');
      }
    } catch (error) {
      console.error('Error closing chat:', error);
      alert('Failed to close chat');
    }
  };

  const reopenChat = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/chats/${chatId}/reopen`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Update the chat in list
        setChats(prevChats =>
          prevChats.map(c => c._id === chatId ? data.chat : c)
        );
        // Update selected chat if it's the one being reopened
        if (selectedChat?._id === chatId) {
          setSelectedChat(data.chat);
        }
        alert('Chat reopened successfully');
      }
    } catch (error) {
      console.error('Error reopening chat:', error);
      alert('Failed to reopen chat');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getOtherUser = (chat) => {
    if (!user) return null;
    return user.role === 'employer' ? chat.jobSeekerId : chat.employerId;
  };

  const getUnreadCount = (chat) => {
    if (!user) return 0;
    return user.role === 'employer' 
      ? chat.unreadCount?.employer || 0
      : chat.unreadCount?.jobSeeker || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={getBackgroundStyle()}>
        <div className="text-xl" style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={getBackgroundStyle()}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Mobile back button when chat is open */}
        {!showChatList && selectedChat && (
          <button
            onClick={() => {
              setShowChatList(true);
              setSelectedChat(null);
            }}
            className="md:hidden mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to chats
          </button>
        )}
        
        <div className={`${getCardClassName()} rounded-3xl shadow-xl overflow-hidden`} style={{ height: 'calc(100vh - 140px)' }}>
          <div className="flex h-full">
            {/* Chat List - Hidden on mobile when chat is selected */}
            <div className={`${showChatList ? 'flex' : 'hidden'} md:flex w-full md:w-[420px] border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex-col`}>
              {/* Header */}
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h1 className={`text-2xl font-bold ${getTextClassName()}`}>Messages</h1>
                  <button
                    onClick={() => router.push('/home')}
                    className={`p-2 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Active Users Preview */}
                {chats.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    {chats.slice(0, 3).map((chat) => {
                      const otherUser = getOtherUser(chat);
                      return (
                        <div key={chat._id} className="relative">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-500'}`}>
                            {(otherUser?.fullName || otherUser?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Filter Tabs */}
                <div className={`flex gap-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button className={`pb-3 px-1 border-b-2 border-[#00EA72] ${getTextClassName()} font-semibold text-sm`}>
                    All
                  </button>
                  <button className={`pb-3 px-1 ${getSubTextClassName()} font-semibold text-sm hover:${getTextClassName()}`}>
                    Unread
                  </button>
                </div>
              </div>

              {/* Chat List Items */}
              <div className="flex-1 overflow-y-auto">
                {chats.length === 0 ? (
                  <div className={`p-8 text-center ${getSubTextClassName()}`}>
                    <svg
                      className={`mx-auto h-12 w-12 mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">
                      {user?.role === 'jobSeeker'
                        ? 'Start a conversation by applying to a job'
                        : 'Wait for job seekers to message you'}
                    </p>
                  </div>
                ) : (
                  chats.map((chat) => {
                    const otherUser = getOtherUser(chat);
                    const unreadCount = getUnreadCount(chat);
                    const isSelected = selectedChat?._id === chat._id;
                    const isTyping = false;

                    return (
                      <div
                        key={chat._id}
                        onClick={() => selectChat(chat)}
                        className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} cursor-pointer transition-colors ${
                          isSelected 
                            ? theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50' 
                            : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-500'}`}>
                              {(otherUser?.fullName || otherUser?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`font-semibold ${getTextClassName()} truncate`}>
                                {otherUser?.fullName || otherUser?.name || 'Unknown User'}
                              </h3>
                              <span className={`text-xs ${getSubTextClassName()} ml-2 shrink-0`}>
                                {formatTime(chat.lastMessageTime)}
                              </span>
                            </div>
                            <p className={`text-sm truncate ${isTyping ? 'text-green-500 italic' : getSubTextClassName()}`}>
                              {isTyping ? (
                                `${otherUser?.fullName?.split(' ')[0] || 'User'} is typing...`
                              ) : (
                                chat.lastMessage || 'No messages yet'
                              )}
                            </p>
                          </div>

                          {/* Unread Badge */}
                          {unreadCount > 0 && (
                            <div className="shrink-0">
                              <div className="w-5 h-5 bg-[#00EA72] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {unreadCount}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Window - Hidden on mobile when chat list is shown */}
            <div className={`${!showChatList ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Back button for mobile */}
                        <button
                          onClick={() => setShowChatList(true)}
                          className="md:hidden p-2 -ml-2 text-blue-600 dark:text-blue-400"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        {/* Avatar */}
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-500'}`}>
                            {(getOtherUser(selectedChat)?.fullName || getOtherUser(selectedChat)?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        
                        <div>
                          <h2 className={`font-semibold ${getTextClassName()}`}>
                            {getOtherUser(selectedChat)?.fullName || getOtherUser(selectedChat)?.name || 'Unknown User'}
                          </h2>
                          <p className={`text-sm ${getSubTextClassName()}`}>
                            {selectedChat.jobId?.jobDetails?.jobTitle || 'Job Title'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {user?.role === 'employer' && !selectedChat.acceptedByEmployer && (
                          <button
                            onClick={() => acceptChat(selectedChat._id)}
                            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                        )}
                        {user?.role === 'employer' && (
                          selectedChat.closedByEmployer ? (
                            <button
                              onClick={() => reopenChat(selectedChat._id)}
                              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                              <span className="hidden sm:inline">Reopen</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => closeChat(selectedChat._id)}
                              className="px-3 py-1.5 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              <span className="hidden sm:inline">End</span>
                            </button>
                          )
                        )}
                        <button
                          onClick={() => router.push(`/job/${selectedChat.jobId._id}`)}
                          className="hidden sm:block px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          View Job
                        </button>
                        <button
                          onClick={() => deleteChat(selectedChat._id)}
                          className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className={`flex-1 overflow-y-auto p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    {selectedChat.messages.length === 0 ? (
                      <div className={`text-center ${getSubTextClassName()} mt-8`}>
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      selectedChat.messages.map((msg, index) => {
                        const isOwn = msg.senderId === user?._id;
                        return (
                          <div
                            key={index}
                            className={`mb-4 flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                                isOwn
                                  ? 'bg-blue-600 text-white rounded-br-sm'
                                  : theme === 'dark' 
                                    ? 'bg-gray-800 text-white rounded-bl-sm shadow-sm'
                                    : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{msg.message}</p>
                              <span
                                className={`text-xs mt-1.5 block ${
                                  isOwn ? 'text-blue-100' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                }`}
                              >
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={sendMessage} className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    {selectedChat.closedByEmployer && user?.role !== 'employer' && (
                      <div className={`mb-3 p-3 rounded-xl border ${theme === 'dark' ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        <p className="text-sm flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          This conversation has been closed by the employer.
                        </p>
                      </div>
                    )}
                    {selectedChat.closedByEmployer && user?.role === 'employer' && (
                      <div className={`mb-3 p-3 rounded-xl border ${theme === 'dark' ? 'bg-orange-900/20 border-orange-800 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
                        <p className="text-sm flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Chat closed. Only you can send messages.
                        </p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={selectedChat.closedByEmployer && user?.role !== 'employer' ? 'Chat is closed' : 'Type a message...'}
                        className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                          theme === 'dark' 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        disabled={sending || (selectedChat.closedByEmployer && user?.role !== 'employer')}
                      />
                      <button
                        type="submit"
                        disabled={!message.trim() || sending || (selectedChat.closedByEmployer && user?.role !== 'employer')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {sending ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className={`flex-1 flex items-center justify-center ${getSubTextClassName()}`}>
                  <div className="text-center p-8">
                    <svg
                      className={`mx-auto h-16 w-16 mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <p className="hidden md:block">Select a conversation to start messaging</p>
                    <p className="md:hidden">Tap on a conversation to view messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

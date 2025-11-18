'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [closingChat, setClosingChat] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [chatToClose, setChatToClose] = useState(null);
  const [closeAction, setCloseAction] = useState('close'); // 'close' or 'reopen'
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
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

    // Start polling for new messages every 1.5 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchChats(true); // Silent fetch without loading state
    }, 1500);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Handle chatId or jobId from URL query params - only run once
  useEffect(() => {
    if (chats.length > 0 && !hasAutoSelected && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const chatId = params.get('chatId');
      const jobId = params.get('jobId');
      
      if (chatId) {
        const chat = chats.find(c => c._id === chatId);
        if (chat) {
          selectChat(chat);
          setHasAutoSelected(true);
        }
      } else if (jobId) {
        // Select first chat for this job
        const chat = chats.find(c => c.jobId?._id === jobId);
        if (chat) {
          selectChat(chat);
          setHasAutoSelected(true);
        }
      }
    }
  }, [chats, hasAutoSelected]);

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
      
      // Add cache busting timestamp
      url += url.includes('?') ? '&' : '?';
      url += `_t=${Date.now()}`;
      
      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
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
                  [user?.role === 'employer' ? 'employer' : 'jobSeeker']: 0
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

    // Check if job is closed
    if (selectedChat.jobId?.status === 'closed' || !selectedChat.jobId?.isActive) {
      alert('This job has been closed. Chatting is no longer available.');
      return;
    }

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
        
        // Immediately fetch latest messages
        await fetchChats(true);
      } else {
        const errorData = await response.json();
        if (errorData.jobClosed) {
          alert('This job has been closed. Chatting is no longer available.');
        } else if (errorData.chatClosed) {
          alert('This conversation has been closed by the employer.');
        } else {
          alert(errorData.message || 'Failed to send message');
        }
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

  const handleCloseChatClick = (chatId, action) => {
    setChatToClose(chatId);
    setCloseAction(action);
    setShowCloseModal(true);
  };

  const confirmCloseChat = async () => {
    if (!chatToClose) return;

    setClosingChat(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = closeAction === 'close' ? 'close' : 'reopen';
      const response = await fetch(`${BACKEND_URL}/api/chats/${chatToClose}/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Update the chat in list
        setChats(prevChats =>
          prevChats.map(c => c._id === chatToClose ? data.chat : c)
        );
        // Update selected chat if it's the one being closed/reopened
        if (selectedChat?._id === chatToClose) {
          setSelectedChat(data.chat);
        }
        
        // Force immediate refresh
        await fetchChats(true);
      }
    } catch (error) {
      console.error(`Error ${closeAction}ing chat:`, error);
    } finally {
      setClosingChat(false);
      setShowCloseModal(false);
      setChatToClose(null);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    
    // Check if date is invalid
    if (isNaN(date.getTime())) return '';
    
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
    <div className="h-screen flex" style={getBackgroundStyle()}>
      {/* Chat List Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`${showChatList ? 'flex' : 'hidden'} md:flex w-full md:w-96 flex-col border-r ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200'}`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-1">
            <h1 className={`text-2xl font-bold ${getTextClassName()}`}>Messages</h1>
            <button
              onClick={() => {
                // Check if we came from a job page
                const params = new URLSearchParams(window.location.search);
                const jobId = params.get('jobId');
                if (jobId) {
                  router.push(`/job/${jobId}`);
                } else {
                  router.push('/home');
                }
              }}
              className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className={`text-sm ${getSubTextClassName()}`}>{chats.length} conversation{chats.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-[#00EA72]/10 flex items-center justify-center mb-4"
              >
                <svg className="w-10 h-10 text-[#00EA72]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </motion.div>
              <p className={`font-semibold ${getTextClassName()} mb-2`}>No conversations yet</p>
              <p className={`text-sm ${getSubTextClassName()}`}>
                {user?.role === 'jobSeeker' ? 'Apply to jobs to start chatting' : 'Wait for applicants to message you'}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {chats.map((chat, index) => {
                const otherUser = getOtherUser(chat);
                const unreadCount = getUnreadCount(chat);
                const isSelected = selectedChat?._id === chat._id;
                const lastMessage = chat.messages?.[chat.messages.length - 1];

                return (
                  <motion.div
                    key={chat._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => selectChat(chat)}
                    className={`p-4 cursor-pointer transition-all border-b ${
                      theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100'
                    } ${
                      isSelected
                        ? theme === 'dark'
                          ? 'bg-[#00EA72]/10 border-l-4 border-l-[#00EA72]'
                          : 'bg-[#00EA72]/5 border-l-4 border-l-[#00EA72]'
                        : theme === 'dark'
                        ? 'hover:bg-gray-800/50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {otherUser?.role === 'employer' && otherUser?.businessSummary?.companyLogo ? (
                          <img 
                            src={otherUser.businessSummary.companyLogo} 
                            alt={otherUser.fullName}
                            className="w-12 h-12 rounded-full object-cover shadow-lg"
                          />
                        ) : otherUser?.personalDetails?.profileImage ? (
                          <img 
                            src={otherUser.personalDetails.profileImage} 
                            alt={otherUser.fullName}
                            className="w-12 h-12 rounded-full object-cover shadow-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#00EA72] to-[#00D66C] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {(otherUser?.fullName || otherUser?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-1">
                          <h3 className={`font-semibold truncate ${getTextClassName()}`}>
                            {otherUser?.fullName || otherUser?.name || 'Unknown User'}
                          </h3>
                          {lastMessage && (
                            <span className={`text-xs ${getSubTextClassName()} ml-2`}>
                              {formatTime(lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-sm ${getSubTextClassName()} truncate`}>
                            {chat.jobId?.jobDetails?.jobTitle || 'Job Position'}
                          </p>
                          {(chat.jobId?.status === 'closed' || !chat.jobId?.isActive) && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-semibold shrink-0">
                              Closed
                            </span>
                          )}
                        </div>
                        {lastMessage && (
                          <p className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold ' + getTextClassName() : getSubTextClassName()}`}>
                            {lastMessage.senderId === user?._id ? 'You: ' : ''}{lastMessage.message}
                          </p>
                        )}
                      </div>

                      {/* Unread Badge */}
                      {unreadCount > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="shrink-0 w-6 h-6 bg-[#00EA72] rounded-full flex items-center justify-center text-xs font-bold text-black"
                        >
                          {unreadCount}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Chat Window */}
      <div className={`${!showChatList ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
        {selectedChat ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedChat._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* Chat Header */}
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200'} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => {
                      // On mobile, go back to chat list first
                      setShowChatList(true);
                      setSelectedChat(null);
                    }}
                    className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Avatar */}
                  <div className="relative">
                    {getOtherUser(selectedChat)?.role === 'employer' && getOtherUser(selectedChat)?.businessSummary?.companyLogo ? (
                      <img 
                        src={getOtherUser(selectedChat).businessSummary.companyLogo} 
                        alt={getOtherUser(selectedChat).fullName}
                        className="w-10 h-10 rounded-full object-cover shadow-lg"
                      />
                    ) : getOtherUser(selectedChat)?.personalDetails?.profileImage ? (
                      <img 
                        src={getOtherUser(selectedChat).personalDetails.profileImage} 
                        alt={getOtherUser(selectedChat).fullName}
                        className="w-10 h-10 rounded-full object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#00EA72] to-[#00D66C] flex items-center justify-center text-white font-bold shadow-lg">
                        {(getOtherUser(selectedChat)?.fullName || getOtherUser(selectedChat)?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>

                  {/* User Info */}
                  <div>
                    <h2 className={`font-semibold ${getTextClassName()}`}>
                      {getOtherUser(selectedChat)?.fullName || getOtherUser(selectedChat)?.name || 'Unknown User'}
                    </h2>
                    <p className={`text-xs ${getSubTextClassName()}`}>
                      {selectedChat.jobId?.jobDetails?.jobTitle || 'Job Position'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {/* Refresh Button */}
                  <motion.button
                    whileHover={{ rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fetchChats(true)}
                    className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all`}
                    title="Refresh messages"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </motion.button>

                  {user?.role === 'employer' && (
                    <>
                      {selectedChat.closedByEmployer ? (
                        <button
                          onClick={() => handleCloseChatClick(selectedChat._id, 'reopen')}
                          className="px-4 py-2 bg-[#00EA72] hover:bg-[#00D66C] text-black rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
                        >
                          Reopen Chat
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCloseChatClick(selectedChat._id, 'close')}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
                        >
                          Close Chat
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {selectedChat.messages?.map((msg, index) => {
                    const isOwn = msg.senderId === user?._id;
                    const showAvatar = index === 0 || selectedChat.messages[index - 1].senderId !== msg.senderId;

                    return (
                      <motion.div
                        key={msg._id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.02 }}
                        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {/* Avatar */}
                        <div className="shrink-0">
                          {showAvatar ? (
                            isOwn ? (
                              user?.role === 'employer' && user?.businessSummary?.companyLogo ? (
                                <img 
                                  src={user.businessSummary.companyLogo} 
                                  alt={user.fullName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : user?.personalDetails?.profileImage ? (
                                <img 
                                  src={user.personalDetails.profileImage} 
                                  alt={user.fullName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[#00EA72] flex items-center justify-center text-white font-semibold text-sm">
                                  {(user?.fullName || user?.name || 'You').charAt(0).toUpperCase()}
                                </div>
                              )
                            ) : (
                              getOtherUser(selectedChat)?.role === 'employer' && getOtherUser(selectedChat)?.businessSummary?.companyLogo ? (
                                <img 
                                  src={getOtherUser(selectedChat).businessSummary.companyLogo} 
                                  alt={getOtherUser(selectedChat).fullName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : getOtherUser(selectedChat)?.personalDetails?.profileImage ? (
                                <img 
                                  src={getOtherUser(selectedChat).personalDetails.profileImage} 
                                  alt={getOtherUser(selectedChat).fullName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-linear-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold text-sm">
                                  {(getOtherUser(selectedChat)?.fullName || 'U').charAt(0).toUpperCase()}
                                </div>
                              )
                            )
                          ) : (
                            <div className="w-8"></div>
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`px-4 py-2.5 rounded-2xl ${
                              isOwn
                                ? 'bg-[#00EA72] text-black rounded-br-sm'
                                : theme === 'dark'
                                ? 'bg-gray-800 text-white rounded-bl-sm'
                                : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                            } shadow-sm`}
                          >
                            <p className="text-sm whitespace-pre-wrap wrap-break-word">{msg.message}</p>
                          </div>
                          <span className={`text-xs ${getSubTextClassName()} mt-1 px-1`}>
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200'}`}>
                {(selectedChat.jobId?.status === 'closed' || !selectedChat.jobId?.isActive) ? (
                  <div className={`text-center py-4 px-6 rounded-2xl ${theme === 'dark' ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
                    <svg className="w-8 h-8 mx-auto mb-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
                      This job has been closed
                    </p>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
                      Chatting is no longer available for this position
                    </p>
                  </div>
                ) : selectedChat.closedByEmployer && user?.role !== 'employer' ? (
                  <div className={`text-center py-4 px-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${getSubTextClassName()}`}>
                      This conversation has been closed by the employer
                    </p>
                  </div>
                ) : (
                  <form onSubmit={sendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      disabled={sending}
                      className={`flex-1 px-4 py-3 rounded-full border ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      } focus:outline-none focus:ring-2 focus:ring-[#00EA72] focus:border-transparent transition-all`}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={!message.trim() || sending}
                      className="px-6 py-3 bg-[#00EA72] hover:bg-[#00D66C] text-black rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      {sending ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                      <span className="hidden sm:inline">Send</span>
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full p-8 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-full bg-[#00EA72]/10 flex items-center justify-center mb-6"
            >
              <svg className="w-12 h-12 text-[#00EA72]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </motion.div>
            <h2 className={`text-xl font-bold ${getTextClassName()} mb-2`}>Select a conversation</h2>
            <p className={`${getSubTextClassName()} max-w-md`}>
              Choose a conversation from the sidebar to start messaging
            </p>
          </motion.div>
        )}
      </div>

      {/* Close/Reopen Chat Modal */}
      <AnimatePresence>
        {showCloseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !closingChat && setShowCloseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${getCardClassName()} rounded-3xl shadow-2xl p-8 max-w-md w-full`}
            >
              <div className="text-center">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  closeAction === 'close' ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  {closeAction === 'close' ? (
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                
                <h3 className={`text-xl font-bold ${getTextClassName()} mb-2`}>
                  {closeAction === 'close' ? 'Close Conversation?' : 'Reopen Conversation?'}
                </h3>
                
                <p className={`text-sm ${getSubTextClassName()} mb-6`}>
                  {closeAction === 'close' 
                    ? 'The applicant will not be able to send messages anymore. You can reopen this chat later.'
                    : 'The applicant will be able to send messages again.'
                  }
                </p>

                {closingChat ? (
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 animate-spin text-[#00EA72]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className={`text-sm ${getSubTextClassName()}`}>
                      {closeAction === 'close' ? 'Closing...' : 'Reopening...'}
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCloseModal(false)}
                      className={`flex-1 px-4 py-3 rounded-full font-semibold transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmCloseChat}
                      className={`flex-1 px-4 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl ${
                        closeAction === 'close'
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-[#00EA72] hover:bg-[#00D66C] text-black'
                      }`}
                    >
                      {closeAction === 'close' ? 'Close Chat' : 'Reopen Chat'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

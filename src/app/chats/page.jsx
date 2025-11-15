'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function ChatsPage() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
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

  const fetchChats = async () => {
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
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectChat = async (chat) => {
    setSelectedChat(chat);
    
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <button
            onClick={() => router.push('/home')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Back to Home
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Chat List */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
              {chats.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4"
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

                  return (
                    <div
                      key={chat._id}
                      onClick={() => selectChat(chat)}
                      className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        isSelected ? 'bg-blue-50 dark:bg-gray-700' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {otherUser?.name || 'Unknown User'}
                            </h3>
                            {unreadCount > 0 && (
                              <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {chat.jobId?.jobDetails?.jobTitle || 'Job Title'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 truncate mt-1">
                            {chat.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                          {formatTime(chat.lastMessageTime)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">
                          {getOtherUser(selectedChat)?.name || 'Unknown User'}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedChat.jobId?.jobDetails?.jobTitle || 'Job Title'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/job/${selectedChat.jobId._id}`)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          View Job
                        </button>
                        <button
                          onClick={() => deleteChat(selectedChat._id)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                    {selectedChat.messages.length === 0 ? (
                      <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
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
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                isOwn
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                              }`}
                            >
                              <p className="break-words">{msg.message}</p>
                              <span
                                className={`text-xs mt-1 block ${
                                  isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
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
                  <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={!message.trim() || sending}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4"
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
                    <p>Select a conversation to start messaging</p>
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

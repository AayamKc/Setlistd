import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usersAPI } from '../utils/api';
import FollowersList from './FollowersList';
import Toast from './Toast';

const FollowModal = ({ isOpen, onClose, userId, username, initialTab = 'followers' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadData();
    }
  }, [isOpen, userId, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'followers') {
        const response = await usersAPI.getUserFollowers(userId);
        setFollowers(response.data);
      } else {
        const response = await usersAPI.getUserFollowing(userId);
        setFollowing(response.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setToast({ message: 'Failed to load users', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (targetUserId, isCurrentlyFollowing) => {
    try {
      if (isCurrentlyFollowing) {
        await usersAPI.unfollowUser(targetUserId);
      } else {
        await usersAPI.followUser(targetUserId);
      }
      // Reload the current list to reflect changes
      await loadData();
    } catch (error) {
      console.error('Error toggling follow:', error);
      setToast({ 
        message: `Failed to ${isCurrentlyFollowing ? 'unfollow' : 'follow'} user`, 
        type: 'error' 
      });
    }
  };

  const filteredUsers = activeTab === 'followers' 
    ? followers.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.bio && user.bio.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : following.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.bio && user.bio.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-secondary">
                {username}'s Network
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 pb-2 px-1 text-sm font-medium transition-colors ${
                  activeTab === 'followers'
                    ? 'text-primary-dark border-b-2 border-primary-dark'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('followers')}
              >
                Followers ({followers.length})
              </button>
              <button
                className={`flex-1 pb-2 px-1 text-sm font-medium transition-colors ${
                  activeTab === 'following'
                    ? 'text-primary-dark border-b-2 border-primary-dark'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('following')}
              >
                Following ({following.length})
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
            />
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto">
            <FollowersList
              users={filteredUsers}
              loading={loading}
              onFollowToggle={handleFollowToggle}
              emptyMessage={
                searchTerm
                  ? `No ${activeTab} found matching "${searchTerm}"`
                  : `No ${activeTab} yet`
              }
            />
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default FollowModal;
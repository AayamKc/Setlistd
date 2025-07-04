import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';

const FollowersList = ({ users, loading, onFollowToggle, emptyMessage }) => {
  const { user: currentUser } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {users.map((user) => {
        const isCurrentUser = currentUser?.id === user._id;
        const profileUrl = `/user/${user.username}`;

        return (
          <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <Link to={profileUrl} className="flex-shrink-0">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-dark" />
                  </div>
                )}
              </Link>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <Link
                  to={profileUrl}
                  className="font-medium text-secondary hover:text-primary-dark transition-colors"
                >
                  {user.username}
                </Link>
                {user.bio && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {user.bio}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{user.followers?.length || 0} followers</span>
                  <span>{user.following?.length || 0} following</span>
                </div>
              </div>

              {/* Follow Button */}
              {!isCurrentUser && currentUser && (
                <button
                  onClick={() => onFollowToggle(user._id, user.isFollowing)}
                  className={`px-4 py-1.5 rounded-lg font-medium transition-colors ${
                    user.isFollowing
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-primary text-secondary hover:bg-primary-dark'
                  }`}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FollowersList;
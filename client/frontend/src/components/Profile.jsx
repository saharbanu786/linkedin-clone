import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PostCard from './PostCard';
import API from '../api/axios';
import './Profile.css';

const Profile = ({ currentUser = false }) => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [userId, currentUser]);

  const loadUserProfile = async () => {
    try {
      let url;
      if (currentUser) {
        url = '/posts/profile'; // ✅ Logged-in user's profile
      } else {
        if (!userId) {
          console.error('No userId found');
          setLoading(false);
          return;
        }
        url = `/posts/profile/${userId}`; // ✅ Specific user's profile
      }

      const { data } = await API.get(url);

      setProfileUser(data.user);
      setUserPosts(data.posts);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

const handlePostDeleted = async (postId) => {
  setUserPosts(prev => prev.filter(post => post._id !== postId));

  // Optional: Notify Home to refresh posts
  if (window.updateHomeFeed) {
    window.updateHomeFeed();
  }
};
  const handlePostUpdated = () => {
    loadUserProfile();
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="container">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="profile-container">
        <div className="container">
          <div className="error-state">User not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="container">
        <div className="profile-content">
          {/* Profile Header */}
          <div className="profile-header card">
            <div className="card-body">
              <div className="profile-info">
                <div className="profile-avatar">
                  {profileUser.name?.charAt(0).toUpperCase()}
                </div>
                <div className="profile-details">
                  <h1 className="profile-name">{profileUser.name}</h1>
                  <p className="profile-email">{profileUser.email}</p>
                  {profileUser.bio && (
                    <p className="profile-bio">{profileUser.bio}</p>
                  )}
                  <div className="profile-stats">
                    <span className="stat">
                      <strong>{userPosts.length}</strong> posts
                    </span>
                    <span className="stat">
                      Member since{' '}
                      {new Date(profileUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Posts */}
          <div className="profile-posts">
            <h2 className="section-title">
              {currentUser
                ? 'Your Posts'
                : `${profileUser.name?.split(' ')[0]}'s Posts`}
            </h2>

            {userPosts.length === 0 ? (
              <div className="empty-state">
                <p>
                  {currentUser
                    ? "You haven't posted anything yet. Share your first post!"
                    : "This user hasn't posted anything yet."}
                </p>
              </div>
            ) : (
              <div className="posts-list">
                {userPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onDelete={handlePostDeleted}
                    onUpdate={handlePostUpdated}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

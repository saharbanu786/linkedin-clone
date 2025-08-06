import { useState, useEffect } from 'react';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();

    // ✅ Listen for localStorage changes (from Profile or other tabs)
    const handleStorageChange = () => loadPosts();
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadPosts = () => {
    const savedPosts = JSON.parse(localStorage.getItem('posts') || '[]');

    const postsWithUsers = savedPosts
      .map(post => ({
        ...post,
        authorName: post.authorName || 'Unknown User'
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setPosts(postsWithUsers);
    setLoading(false);
  };

  const handlePostCreated = (newPost) => {
    if (!newPost.id && !newPost._id) {
      newPost.id = Date.now().toString();
    }

    const savedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updatedPosts = [newPost, ...savedPosts];
    localStorage.setItem('posts', JSON.stringify(updatedPosts));

    setPosts(updatedPosts); // ✅ Update state immediately
  };

const handlePostDeleted = (postId) => {
  const updatedPosts = posts.filter(
    post => post.id !== postId && post._id !== postId
  );
  setPosts(updatedPosts);
  localStorage.setItem('posts', JSON.stringify(updatedPosts));
};

  const handlePostUpdated = () => {
    loadPosts();
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="container">
          <div className="loading">Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="container">
        <div className="home-content">
          <CreatePost onPostCreated={handlePostCreated} />

          <div className="posts-section">
            <h2 className="section-title">Recent Posts</h2>
            {posts.length === 0 ? (
              <div className="empty-state">
                <p>No posts yet. Be the first to share something!</p>
              </div>
            ) : (
              <div className="posts-list">
                {posts.map((post, index) => (
                  <PostCard
                    key={post._id || post.id || index}
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

export default Home;

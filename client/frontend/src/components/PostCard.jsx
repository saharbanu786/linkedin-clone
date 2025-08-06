import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PostCard.css';

const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];
  const emojiLabels = {
    '👍': 'Like',
    '❤️': 'Love',
    '😂': 'Haha',
    '😮': 'Wow',
    '😢': 'Sad',
    '😡': 'Angry'
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

const handleDelete = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found. User must be logged in to delete posts.');
      return;
    }

    const res = await fetch(`/api/posts/${post._id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token // ✅ Correct backend header
      }
    });

     if (res.ok) {
      // ✅ Update localStorage so Home syncs instantly
      const savedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
      const updatedPosts = savedPosts.filter(
        p => p.id !== post._id && p._id !== post._id
      );
      localStorage.setItem('posts', JSON.stringify(updatedPosts));

      // ✅ Trigger a storage event manually (works in same tab)
      window.dispatchEvent(new Event('storage'));

      // ✅ Also update parent component (Profile)
      onDelete(post._id);
    } else {
      console.warn('Failed to delete post. Status:', res.status);
    }
  } catch (error) {
    console.error('Delete Post Error:', error);
  }
};

  const handleReaction = (emoji) => {
    const savedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    const postIndex = savedPosts.findIndex(p => p.id === post.id);

    if (postIndex !== -1) {
      if (!savedPosts[postIndex].reactions) {
        savedPosts[postIndex].reactions = {};
      }

      if (!savedPosts[postIndex].reactions[emoji]) {
        savedPosts[postIndex].reactions[emoji] = [];
      }

      const userReactionIndex = savedPosts[postIndex].reactions[emoji].indexOf(user.id);

      if (userReactionIndex > -1) {
        savedPosts[postIndex].reactions[emoji].splice(userReactionIndex, 1);
        if (savedPosts[postIndex].reactions[emoji].length === 0) {
          delete savedPosts[postIndex].reactions[emoji];
        }
      } else {
        Object.keys(savedPosts[postIndex].reactions).forEach(reactionEmoji => {
          const index = savedPosts[postIndex].reactions[reactionEmoji].indexOf(user.id);
          if (index > -1) {
            savedPosts[postIndex].reactions[reactionEmoji].splice(index, 1);
            if (savedPosts[postIndex].reactions[reactionEmoji].length === 0) {
              delete savedPosts[postIndex].reactions[reactionEmoji];
            }
          }
        });
        savedPosts[postIndex].reactions[emoji].push(user.id);
      }

      localStorage.setItem('posts', JSON.stringify(savedPosts));
      onUpdate();
    }
    setShowEmojiPicker(false);
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const savedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    const postIndex = savedPosts.findIndex(p => p.id === post.id);

    if (postIndex !== -1) {
      if (!savedPosts[postIndex].comments) {
        savedPosts[postIndex].comments = [];
      }

      const comment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        authorId: user.id,
        authorName: user.name,
        createdAt: new Date().toISOString()
      };

      savedPosts[postIndex].comments.push(comment);
      localStorage.setItem('posts', JSON.stringify(savedPosts));
      setNewComment('');
      onUpdate();
    }
  };

  const getUserReaction = () => {
    if (!post.reactions) return null;
    for (const [emoji, users] of Object.entries(post.reactions)) {
      if (users.includes(user.id)) {
        return emoji;
      }
    }
    return null;
  };

  const getReactionCounts = () => {
    if (!post.reactions) return {};
    const counts = {};
    Object.entries(post.reactions).forEach(([emoji, users]) => {
      if (users.length > 0) {
        counts[emoji] = users.length;
      }
    });
    return counts;
  };

  const getTotalReactions = () => {
    const counts = getReactionCounts();
    return Object.values(counts).reduce((sum, count) => sum + count, 0);
  };

  const userReaction = getUserReaction();
  const reactionCounts = getReactionCounts();
  const totalReactions = getTotalReactions();
  const commentsCount = post.comments ? post.comments.length : 0;

  // Safe author handling
  const authorName = post.authorName || post.author?.name || "Unknown";
  const authorId = post.authorId || post.author?._id || "";
  const authorInitial = authorName?.charAt(0).toUpperCase() || "?";

  return (
    <div className="post-card card">
      <div className="card-body">
        <div className="post-header">
          <div className="post-author">
            <div className="author-avatar">
              {authorInitial}
            </div>
            <div className="author-info">
              <Link to={`/profile/${authorId}`} className="author-name">
                {authorName}
              </Link>
              <div className="post-timestamp">
                {formatDate(post.createdAt)}
              </div>
            </div>
          </div>

          {user.id === authorId && (
            <div className="post-actions">
              <button 
                onClick={handleDelete}
                className="delete-btn"
                title="Delete post"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="post-content">
          <p>{post.content}</p>
        </div>

        {post.image && (
          <div className="post-image-container">
            <img src={post.image} alt="Post content" className="post-image" />
          </div>
        )}

        {totalReactions > 0 && (
          <div className="reaction-summary">
            <div className="reaction-emojis">
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <span key={emoji} className="reaction-emoji" title={`${count} ${emojiLabels[emoji]}`}>
                  {emoji}
                </span>
              ))}
            </div>
            <span className="reaction-count">{totalReactions}</span>
          </div>
        )}

        <div className="post-interactions">
          <div className="interaction-buttons">
            <div className="reaction-container">
              <button 
                className={`interaction-btn ${userReaction ? 'active' : ''}`}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                {userReaction || '👍'} Like
              </button>
              
              {showEmojiPicker && (
                <div className="emoji-picker">
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      className={`emoji-btn ${userReaction === emoji ? 'selected' : ''}`}
                      onClick={() => handleReaction(emoji)}
                      title={emojiLabels[emoji]}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              className="interaction-btn"
              onClick={() => setShowComments(!showComments)}
            >
              💬 Comment {commentsCount > 0 && `(${commentsCount})`}
            </button>
          </div>
        </div>

        {showComments && (
          <div className="comments-section">
            <form onSubmit={handleComment} className="comment-form">
              <div className="comment-input-container">
                <div className="commenter-avatar">
                  {user.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="comment-input"
                  maxLength="200"
                />
                <button 
                  type="submit" 
                  className="comment-submit-btn"
                  disabled={!newComment.trim()}
                >
                  Post
                </button>
              </div>
            </form>
            
            {post.comments && post.comments.length > 0 && (
              <div className="comments-list">
                {post.comments.map(comment => (
                  <div key={comment.id} className="comment">
                    <div className="comment-avatar">
                      {comment.authorName?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <Link to={`/profile/${comment.authorId}`} className="comment-author">
                          {comment.authorName || "Unknown"}
                        </Link>
                        <span className="comment-timestamp">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="comment-text">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;

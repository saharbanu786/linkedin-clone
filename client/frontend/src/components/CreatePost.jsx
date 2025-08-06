import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import './CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      setSelectedImage(file);

      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!user) {
    alert('You must be logged in to create a post');
    return;
  }

  if (!content.trim() && !selectedImage) {
    alert('Please add some content or an image to your post');
    return;
  }

  setIsSubmitting(true);

  try {
    const postData = {
      id: Date.now().toString(),
      authorId: user?._id || 'guest', // ✅ consistent
      authorName: user?.name || 'Unknown User', // ✅ always stored
      content: content.trim(),
      image: imagePreview || null,
      createdAt: new Date().toISOString() // ✅ ensure time
    };

    const { data } = await API.post('/posts/create', postData);

    // ✅ Merge backend data with our local fallback
    const finalPost = {
      ...postData,
      ...(data.post || data) // if backend sends updated post
    };

    onPostCreated(finalPost);

    setContent('');
    removeImage();
  } catch (err) {
    console.error('Create Post Error:', err);
    alert(err.response?.data?.message || 'Something went wrong while creating the post');
  }

  setIsSubmitting(false);
};

  return (
    <div className="create-post-container">
      <div className="card">
        <div className="card-header">
          <div className="post-composer-header">
            <div className="composer-avatar">
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="composer-info">
              <h3>Create a Post</h3>
              <span className="composer-name">{user?.name || 'Guest'}</span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="create-post-form">
            <div className="form-group">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="form-textarea post-textarea"
                placeholder="What do you want to talk about?"
                rows="4"
                maxLength="2000"
              />
              <div className="character-count">
                {content.length}/2000 characters
              </div>
            </div>

            {imagePreview && (
              <div className="image-preview-container">
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" className="preview-image" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={removeImage}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <div className="post-actions">
              <div className="media-options">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="file-input"
                />
                <label htmlFor="image-upload" className="media-btn">
                  📷 Photo
                </label>
                <div className="post-visibility">
                  <span className="visibility-icon">🌍</span>
                  <span className="visibility-text">Anyone</span>
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary post-btn"
                  disabled={(!content.trim() && !selectedImage) || isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;

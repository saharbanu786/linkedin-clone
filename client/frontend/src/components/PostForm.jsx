import { useState } from 'react';
import API from '../api/axios';

const PostForm = ({ refreshFeed }) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/posts/create', { content });
      setContent('');
      refreshFeed();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's on your mind?" required />
      <button type="submit">Post</button>
    </form>
  );
};

export default PostForm;

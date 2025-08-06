const express = require('express');
const router = express.Router();
const {
    createPost,
    getFeed,
    getUserProfile,
    deletePost,
    getOwnProfile
} = require('../controller/postController');
const auth = require('../middleware/authMiddleware');

// Create a new post
router.post('/create', auth, createPost);

// Get the main feed (requires login)
router.get('/feed', auth, getFeed);

// Get a specific user's profile and posts (requires login)
router.get('/profile/:userId', auth, getUserProfile);

router.get('/profile', auth, getOwnProfile);

// Delete a post (requires login and ownership)
router.delete('/:postId', auth, deletePost);

module.exports = router;

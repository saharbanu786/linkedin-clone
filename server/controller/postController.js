const Post = require('../models/post');
const User = require('../models/user');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { content, image } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: 'Post content cannot be empty' });
        }

        const newPost = new Post({
            content: content.trim(),
            image: image || null, // optional image
            author: req.user.id
        });

        await newPost.save();
        await newPost.populate('author', 'name email'); // so frontend gets author info

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            post: newPost
        });
    } catch (err) {
        console.error('Create Post Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all posts for feed
exports.getFeed = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, posts });
    } catch (err) {
        console.error('Get Feed Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get specific user profile + their posts
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const posts = await Post.find({ author: req.params.userId })
            .populate('author', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, user, posts });
    } catch (err) {
        console.error('Get User Profile Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get logged-in user's own profile + their posts
exports.getOwnProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const posts = await Post.find({ author: userId })
            .populate('author', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, user, posts });
    } catch (err) {
        console.error('Get Own Profile Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You are not authorized to delete this post' });
        }

        await post.deleteOne();
        res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } catch (err) {
        console.error('Delete Post Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

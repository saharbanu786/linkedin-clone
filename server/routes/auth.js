const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controller/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);

module.exports = router;
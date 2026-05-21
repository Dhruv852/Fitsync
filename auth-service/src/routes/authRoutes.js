/**
 * Auth API Routes
 * Base path: /api/auth (proxied via nginx)
 */
const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes — require valid JWT
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.post('/streak', authenticateToken, authController.updateStreak);

module.exports = router;

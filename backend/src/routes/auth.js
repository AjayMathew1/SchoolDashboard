const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, generateUUID } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?').run(user.user_id);

        const token = jwt.sign(
            {
                userId: user.user_id,
                email: user.email,
                role: user.role,
                fullName: user.full_name
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            token,
            user: {
                userId: user.user_id,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
                avatarUrl: user.avatar_url
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Register (for admins to create new users)
router.post('/register', authMiddleware, async (req, res) => {
    try {
        const { email, password, fullName, role } = req.body;

        // Only admins can create new users
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create users' });
        }

        if (!email || !password || !fullName || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = generateUUID();

        const stmt = db.prepare(`
      INSERT INTO users (user_id, email, password_hash, full_name, role, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

        stmt.run(userId, email, hashedPassword, fullName, role);

        res.status(201).json({
            message: 'User created successfully',
            user: {
                userId,
                email,
                fullName,
                role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current user
router.get('/me', authMiddleware, (req, res) => {
    try {
        const user = db.prepare('SELECT user_id, email, full_name, role, avatar_url FROM users WHERE user_id = ?')
            .get(req.user.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            userId: user.user_id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            avatarUrl: user.avatar_url
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(req.user.userId);

        const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
            .run(hashedPassword, req.user.userId);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// ── Validation rules ─────────────────────────
const registerRules = [
    body('email')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain at least one number'),
    body('username')
        .trim()
        .isLength({ min: 2, max: 30 }).withMessage('Username must be 2–30 characters')
        .matches(/^[a-zA-Z0-9_ ]+$/).withMessage('Username can only contain letters, numbers, underscores or spaces')
];

const loginRules = [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
];

// Helper to check validation result
const validate = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ msg: errors.array()[0].msg });
        return false;
    }
    return true;
};

// ── POST /api/auth/register ──────────────────
router.post('/register', registerRules, async (req, res) => {
    if (!validate(req, res)) return;

    const { email, password, username, profession } = req.body;
    try {
        // Check duplicate
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ msg: 'An account with this email already exists' });

        // Hash password
        const salt = await bcrypt.genSalt(12); // 12 rounds for production
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            email,
            password: hashedPassword,
            username: username.trim(),
            profession: profession?.trim() || ''
        });

        await user.save();

        // Issue token
        const payload = { user: { id: user.id } };
        const token = await new Promise((resolve, reject) =>
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, t) =>
                err ? reject(err) : resolve(t)
            )
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                profession: user.profession,
                profilePhotoUrl: user.profilePhotoUrl
            }
        });
    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ msg: 'Server error, please try again' });
    }
});

// ── POST /api/auth/login ─────────────────────
router.post('/login', loginRules, async (req, res) => {
    console.log(`🔑 Login attempt for: ${req.body.email}`);
    if (!validate(req, res)) return;

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        // Use consistent timing: always compare hash (prevents user enumeration timing attacks)
        const dummyHash = '$2a$12$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const isMatch = user
            ? await bcrypt.compare(password, user.password)
            : await bcrypt.compare(password, dummyHash);

        if (!user || !isMatch) {
            return res.status(400).json({ msg: 'Invalid email or password' });
        }

        const payload = { user: { id: user.id } };
        const token = await new Promise((resolve, reject) =>
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, t) =>
                err ? reject(err) : resolve(t)
            )
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                profession: user.profession,
                profilePhotoUrl: user.profilePhotoUrl
            }
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ msg: 'Server error, please try again' });
    }
});

module.exports = router;

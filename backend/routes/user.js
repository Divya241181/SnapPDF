const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');

// ── GET /api/user/profile ─────────────────────
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// ── PUT /api/user/profile ─────────────────────
router.put('/profile', [
    auth,
    body('username').optional().trim().isLength({ min: 2, max: 30 }).withMessage('Username must be 2–30 characters'),
    body('profession').optional().trim().isLength({ max: 60 }).withMessage('Profession too long'),
    body('profilePhotoUrl').optional().isURL().withMessage('Invalid photo URL')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ msg: errors.array()[0].msg });
    }

    try {
        const { username, profession, profilePhotoUrl } = req.body;
        const updates = {};
        if (username !== undefined) updates.username = username;
        if (profession !== undefined) updates.profession = profession;
        if (profilePhotoUrl !== undefined) updates.profilePhotoUrl = profilePhotoUrl;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;

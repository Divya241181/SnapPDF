const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, 'profile-' + req.user.id + '-' + Date.now() + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

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
router.put('/profile', auth, (req, res) => {
    upload.single('profilePhoto')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ msg: err.message });
        }

        // Run validation manually because logic is mixed with multer
        await body('username').optional().trim().isLength({ min: 2, max: 30 }).run(req);
        await body('email').optional().isEmail().normalizeEmail().run(req);
        await body('profession').optional().trim().isLength({ max: 60 }).run(req);
        await body('bio').optional().trim().isLength({ max: 200 }).run(req);
        await body('location').optional().trim().isLength({ max: 100 }).run(req);
        await body('password').optional().isLength({ min: 6 }).run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ msg: errors.array()[0].msg });
        }

        try {
            const { username, email, profession, bio, location, password } = req.body;

            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ msg: 'User not found' });

            if (username !== undefined) user.username = username;
            if (profession !== undefined) user.profession = profession;
            if (bio !== undefined) user.bio = bio;
            if (location !== undefined) user.location = location;

            if (email !== undefined && email !== user.email) {
                const existing = await User.findOne({ email });
                if (existing) return res.status(400).json({ msg: 'Email already in use' });
                user.email = email;
            }

            if (password) {
                const salt = await bcrypt.genSalt(12);
                user.password = await bcrypt.hash(password, salt);
            }

            if (req.file) {
                // Delete old photo if it exists and is local
                if (user.profilePhotoUrl && user.profilePhotoUrl.startsWith('/uploads/profile-')) {
                    const oldPath = path.join(__dirname, '../', user.profilePhotoUrl);
                    if (fs.existsSync(oldPath)) {
                        try { fs.unlinkSync(oldPath); } catch { }
                    }
                }
                user.profilePhotoUrl = `/uploads/${req.file.filename}`;
            }

            await user.save();

            const userResponse = user.toObject();
            delete userResponse.password;
            res.json(userResponse);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ msg: 'Server Error' });
        }
    });
});

// ── DELETE /api/user/account ──────────────────
// Permanently deletes the authenticated user's account
// and all PDF records they own.
router.delete('/account', auth, async (req, res) => {
    try {
        const Pdf = require('../models/Pdf');

        // Delete all PDFs owned by this user
        await Pdf.deleteMany({ userId: req.user.id });

        // Delete the user document
        await User.findByIdAndDelete(req.user.id);

        res.json({ msg: 'Account deleted successfully' });
    } catch (err) {
        console.error('Account delete error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;

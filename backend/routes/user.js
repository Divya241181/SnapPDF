const express  = require('express');
const router   = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt   = require('bcryptjs');
const multer   = require('multer');
const auth     = require('../middleware/auth');
const User     = require('../models/User');
const {
    uploadFile,
    deleteFile,
    buildDestPath,
    publicUrlToStoragePath,
    isSupabaseUrl,
} = require('../services/supabaseService');

// ── Multer — memory storage ───────────────────────────────────────────────
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, or WebP images are allowed'));
        }
    },
});

// ── GET /api/user/profile ─────────────────────────────────────────────────
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

// ── PUT /api/user/profile ─────────────────────────────────────────────────
router.put('/profile', auth, (req, res) => {
    upload.single('profilePhoto')(req, res, async (err) => {
        if (err) return res.status(400).json({ msg: err.message });

        // Run validations after multer (multer must handle multipart before validators)
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

            if (username   !== undefined) user.username   = username;
            if (profession !== undefined) user.profession = profession;
            if (bio        !== undefined) user.bio        = bio;
            if (location   !== undefined) user.location   = location;

            if (email !== undefined && email !== user.email) {
                const existing = await User.findOne({ email });
                if (existing) return res.status(400).json({ msg: 'Email already in use' });
                user.email = email;
            }

            if (password) {
                const salt    = await bcrypt.genSalt(12);
                user.password = await bcrypt.hash(password, salt);
            }

            // ── Upload new profile photo to Supabase ──────────────────
            if (req.file) {
                // Delete old photo if it was stored in Supabase
                if (user.profilePhotoUrl && isSupabaseUrl(user.profilePhotoUrl)) {
                    deleteFile(publicUrlToStoragePath(user.profilePhotoUrl)).catch(() => {});
                }

                const destPath        = buildDestPath(req.file, 'profile-photos');
                user.profilePhotoUrl  = await uploadFile(req.file.buffer, destPath, req.file.mimetype);
            }

            await user.save();

            const userResponse = user.toObject();
            delete userResponse.password;
            res.json(userResponse);
        } catch (err) {
            console.error('Profile update error:', err.message);
            res.status(500).json({ msg: 'Server Error: ' + err.message });
        }
    });
});

// ── DELETE /api/user/account ──────────────────────────────────────────────
// Permanently deletes the user's account and all their PDF records.
router.delete('/account', auth, async (req, res) => {
    try {
        const Pdf = require('../models/Pdf');

        // Delete all PDFs owned by this user from the database
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

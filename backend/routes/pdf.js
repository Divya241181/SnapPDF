const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Pdf = require('../models/Pdf');
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
        const ext = path.extname(file.originalname) || '.pdf';
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
    fileFilter: (req, file, cb) => {
        // Allow PDF and common image types
        const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext) || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(null, false); // silently ignore unknown types
        }
    }
});

// ── POST /api/pdfs — save PDF record ──────────
router.post('/', auth, (req, res, next) => {
    // Run multer as a callback to handle errors properly in Express 5
    upload.single('pdfFile')(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ msg: 'File upload error: ' + err.message });
        }
        try {
            const { filename, fileSize, pageCount, thumbnailUrl } = req.body;

            let fileUrl = '';
            if (req.file) {
                fileUrl = `/uploads/${req.file.filename}`;
            } else if (req.body.fileUrl) {
                fileUrl = req.body.fileUrl;
            }

            const newPdf = new Pdf({
                userId: req.user.id,
                filename: filename || 'Untitled.pdf',
                fileUrl,
                fileSize: fileSize ? Number(fileSize) : (req.file ? req.file.size : 0),
                pageCount: pageCount ? Number(pageCount) : 1,
                thumbnailUrl: thumbnailUrl || ''
            });

            const pdf = await newPdf.save();
            res.json(pdf);
        } catch (saveErr) {
            console.error('Save error:', saveErr.message);
            res.status(500).json({ msg: 'Server Error: ' + saveErr.message });
        }
    });
});

// ── GET /api/pdfs — list user's PDFs ─────────
router.get('/', auth, async (req, res) => {
    try {
        const pdfs = await Pdf.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(pdfs);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// ── DELETE /api/pdfs/:id ──────────────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        const pdf = await Pdf.findById(req.params.id);
        if (!pdf) return res.status(404).json({ msg: 'PDF not found' });
        if (pdf.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Delete file from disk silently
        const filePath = path.join(__dirname, '../', pdf.fileUrl);
        if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch { }
        }

        await Pdf.findByIdAndDelete(req.params.id);
        res.json({ msg: 'PDF removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;

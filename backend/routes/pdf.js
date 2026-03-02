const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const auth    = require('../middleware/auth');
const Pdf     = require('../models/Pdf');
const {
    uploadFile,
    deleteFile,
    buildDestPath,
    publicUrlToStoragePath,
} = require('../services/supabaseService');

// ── Multer — memory storage (no disk writes, buffer → Supabase) ───────────
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false); // silently reject unknown types
        }
    },
});

// ── POST /api/pdfs — upload PDF + thumbnail, save record ─────────────────
router.post('/', auth, (req, res) => {
    upload.fields([
        { name: 'pdfFile',   maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
    ])(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ msg: 'File upload error: ' + err.message });
        }
        try {
            const { filename, fileSize, pageCount } = req.body;

            // Upload PDF to Supabase Storage
            let fileUrl   = '';
            let fileSize_ = fileSize ? Number(fileSize) : 0;

            if (req.files?.pdfFile?.[0]) {
                const f        = req.files.pdfFile[0];
                const destPath = buildDestPath(f, 'pdfs');
                fileUrl        = await uploadFile(f.buffer, destPath, f.mimetype);
                fileSize_      = fileSize_ || f.size;
            }

            // Upload thumbnail to Supabase Storage
            let thumbnailUrl = req.body.thumbnailUrl || '';
            if (req.files?.thumbnail?.[0]) {
                const t        = req.files.thumbnail[0];
                const destPath = buildDestPath(t, 'thumbnails');
                thumbnailUrl   = await uploadFile(t.buffer, destPath, t.mimetype);
            }

            const newPdf = new Pdf({
                userId:   req.user.id,
                filename: filename || 'Untitled.pdf',
                fileUrl,
                fileSize:     fileSize_,
                pageCount:    pageCount ? Number(pageCount) : 1,
                thumbnailUrl,
            });

            const pdf = await newPdf.save();
            res.json(pdf);
        } catch (saveErr) {
            console.error('Save error:', saveErr.message);
            res.status(500).json({ msg: 'Server Error: ' + saveErr.message });
        }
    });
});

// ── GET /api/pdfs — list user's PDFs ─────────────────────────────────────
router.get('/', auth, async (req, res) => {
    try {
        const pdfs = await Pdf.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(pdfs);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// ── GET /api/pdfs/:id — get single PDF ───────────────────────────────────
router.get('/:id', auth, async (req, res) => {
    try {
        const pdf = await Pdf.findById(req.params.id);
        if (!pdf)                                  return res.status(404).json({ msg: 'PDF not found' });
        if (pdf.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
        res.json(pdf);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// ── PUT /api/pdfs/:id — update PDF ───────────────────────────────────────
router.put('/:id', auth, (req, res) => {
    upload.fields([
        { name: 'pdfFile',   maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
    ])(req, res, async (err) => {
        if (err) return res.status(400).json({ msg: 'File upload error: ' + err.message });
        try {
            let pdf = await Pdf.findById(req.params.id);
            if (!pdf)                                  return res.status(404).json({ msg: 'PDF not found' });
            if (pdf.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

            const { filename, fileSize, pageCount } = req.body;

            // Replace PDF — delete old file, upload new one
            if (req.files?.pdfFile?.[0]) {
                if (pdf.fileUrl) deleteFile(publicUrlToStoragePath(pdf.fileUrl)).catch(() => {});
                const f = req.files.pdfFile[0];
                pdf.fileUrl  = await uploadFile(f.buffer, buildDestPath(f, 'pdfs'), f.mimetype);
                pdf.fileSize = fileSize ? Number(fileSize) : f.size;
            }

            // Replace thumbnail — delete old, upload new
            if (req.files?.thumbnail?.[0]) {
                if (pdf.thumbnailUrl) deleteFile(publicUrlToStoragePath(pdf.thumbnailUrl)).catch(() => {});
                const t = req.files.thumbnail[0];
                pdf.thumbnailUrl = await uploadFile(t.buffer, buildDestPath(t, 'thumbnails'), t.mimetype);
            }

            if (filename)  pdf.filename  = filename;
            if (pageCount) pdf.pageCount = Number(pageCount);

            await pdf.save();
            res.json(pdf);
        } catch (saveErr) {
            console.error('Update error:', saveErr.message);
            res.status(500).json({ msg: 'Server Error: ' + saveErr.message });
        }
    });
});

// ── DELETE /api/pdfs/:id ──────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        const pdf = await Pdf.findById(req.params.id);
        if (!pdf)                                  return res.status(404).json({ msg: 'PDF not found' });
        if (pdf.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        // Delete files from Supabase Storage (fire-and-forget)
        if (pdf.fileUrl)      deleteFile(publicUrlToStoragePath(pdf.fileUrl)).catch(() => {});
        if (pdf.thumbnailUrl) deleteFile(publicUrlToStoragePath(pdf.thumbnailUrl)).catch(() => {});

        await Pdf.findByIdAndDelete(req.params.id);
        res.json({ msg: 'PDF removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;

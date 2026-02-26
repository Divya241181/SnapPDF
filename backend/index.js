const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ─────────────────────────────────────────────
// 1. SECURITY HEADERS (helmet)
//    Adds X-Content-Type-Options, X-Frame-Options,
//    Content-Security-Policy, etc. automatically
// ─────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' } // needed for /uploads static files
}));

// ─────────────────────────────────────────────
// 2. CORS — only allow your frontend origin
//    In dev: localhost:5173 (Vite)
//    In prod: your real domain
// ─────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.FRONTEND_URL  // set this in .env for production
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.some(pattern => {
            if (pattern.includes('^')) { // It's a regex string
                return new RegExp(pattern).test(origin);
            }
            return pattern === origin;
        });

        if (isAllowed || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }

        callback(new Error('CORS: Origin not allowed'));
    },
    credentials: true
}));

// ─────────────────────────────────────────────
// 3. BODY SIZE LIMITS
//    Prevents large JSON payloads from crashing server
// ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─────────────────────────────────────────────
// 4. RATE LIMITING
// ─────────────────────────────────────────────

// Auth endpoints: strict (prevents brute-force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 20,                    // 20 requests per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { msg: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// General API: more lenient
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 300,                   // 300 requests per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { msg: 'Too many requests, please slow down.' }
});

// ─────────────────────────────────────────────
// 5. STATIC FILES (uploads)
// ─────────────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ─────────────────────────────────────────────
// 6. DATABASE
// ─────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Error:', err));

// ─────────────────────────────────────────────
// 7. ROUTES
// ─────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/user', apiLimiter, require('./routes/user'));
app.use('/api/pdfs', apiLimiter, require('./routes/pdf'));

// ─────────────────────────────────────────────
// 8. GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
    if (err.message && err.message.includes('CORS')) {
        return res.status(403).json({ msg: err.message });
    }
    console.error('Unhandled error:', err.message);
    res.status(500).json({ msg: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server started on port ${PORT}`));

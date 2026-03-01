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
        if (!origin) return callback(null, true);

        // Check if origin is localhost or private IP range
        const isLocal = origin.includes('localhost') ||
            origin.includes('127.0.0.1') ||
            /^http:\/\/(192\.168|10|172\.(1[6-9]|2[0-9]|3[0-1]))/.test(origin);

        const isAllowed = allowedOrigins.some(pattern => {
            if (pattern.includes('^')) return new RegExp(pattern).test(origin);
            return pattern === origin;
        });

        if (isAllowed || isLocal) {
            return callback(null, true);
        }

        console.log(`⚠️ CORS Rejected: ${origin}`);
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
    .then(() => console.log('✅ MongoDB Connected successfully'))
    .catch(err => {
        console.error('❌ MongoDB Connection FAILED!');
        console.error('URI used:', process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@') : 'NOT SET');
        console.error('Error:', err.message);
    });

// ─────────────────────────────────────────────
// 7. ROUTES
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// Health Check — visit /health or / to diagnose
// ─────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: '🚀 SnapPDF API is running' }));

app.get('/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }[dbState];
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        env: {
            MONGODB_URI:         process.env.MONGODB_URI         ? '✅ set' : '❌ MISSING',
            JWT_SECRET:          process.env.JWT_SECRET          ? '✅ set' : '❌ MISSING',
            FRONTEND_URL:        process.env.FRONTEND_URL        ? '✅ set' : '❌ MISSING',
            GOOGLE_CLIENT_ID:    process.env.GOOGLE_CLIENT_ID    ? '✅ set' : '❌ MISSING',
            GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET? '✅ set' : '❌ MISSING',
        }
    });
});

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
    console.error('❌ Unhandled error:', err.message);
    console.error(err.stack);
    res.status(500).json({ msg: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server started on port ${PORT}`));

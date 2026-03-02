'use strict';

/**
 * supabaseService.js
 * ──────────────────────────────────────────────────────────────────────────
 * Supabase Storage helpers for SnapPDF backend.
 *
 * Required environment variables (.env):
 *   SUPABASE_URL       – e.g. https://xyzxyz.supabase.co
 *   SUPABASE_SERVICE_KEY – Service Role secret key (NOT the anon key)
 *
 * Storage bucket: 'documents'  (create it in Supabase dashboard)
 * Folders used:
 *   documents/pdfs/            – PDF files
 *   documents/thumbnails/      – thumbnail images
 *   documents/profile-photos/  – user profile photos
 * ──────────────────────────────────────────────────────────────────────────
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// ── Allowed types ─────────────────────────────────────────────────────────
const ALLOWED_MIME = new Set([
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
]);

const ALLOWED_EXT = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp']);

// ── Supabase client (singleton) ───────────────────────────────────────────
let _supabase = null;

function getClient() {
    if (_supabase) return _supabase;

    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        throw new Error(
            '[supabaseService] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables.\n' +
            'Get these from: Supabase Dashboard → Project Settings → API'
        );
    }

    _supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: { persistSession: false },
    });

    return _supabase;
}

// ── Bucket name ───────────────────────────────────────────────────────────
const BUCKET = 'documents';

/**
 * uploadFile
 * ----------
 * Uploads a buffer to Supabase Storage and returns the public URL.
 *
 * @param {Buffer}  buffer    – Raw file data (from multer memoryStorage)
 * @param {string}  destPath  – Path inside the bucket, e.g. 'pdfs/abc123.pdf'
 * @param {string}  mimeType  – MIME type, e.g. 'application/pdf'
 * @returns {Promise<string>} – Public HTTPS URL of the uploaded file
 */
async function uploadFile(buffer, destPath, mimeType) {
    // ── Input validation ─────────────────────────────────────────────────
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw new Error('uploadFile: buffer must be a non-empty Buffer');
    }

    const ext = path.extname(destPath).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
        throw new Error(`uploadFile: disallowed file extension "${ext}"`);
    }
    if (!ALLOWED_MIME.has(mimeType)) {
        throw new Error(`uploadFile: disallowed MIME type "${mimeType}"`);
    }

    const supabase = getClient();

    // ── Upload ───────────────────────────────────────────────────────────
    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(destPath, buffer, {
            contentType: mimeType,
            upsert: true,           // overwrite if same path (safe for updates)
            cacheControl: '3600',
        });

    if (error) {
        throw new Error(`uploadFile: Supabase upload failed — ${error.message}`);
    }

    // ── Return public URL ─────────────────────────────────────────────────
    return getPublicUrl(destPath);
}

/**
 * getPublicUrl
 * ------------
 * Returns the permanent public URL for a file already in the bucket.
 *
 * @param {string}  storagePath – e.g. 'pdfs/abc123.pdf'
 * @returns {string}            – Public HTTPS URL
 */
function getPublicUrl(storagePath) {
    const supabase = getClient();
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    if (!data?.publicUrl) {
        throw new Error(`getPublicUrl: could not derive public URL for "${storagePath}"`);
    }
    return data.publicUrl;
}

/**
 * deleteFile
 * ----------
 * Deletes a file from Supabase Storage.
 * Accepts either a storage path or a full public URL.
 * Silently succeeds if the file does not exist.
 *
 * @param {string} pathOrUrl – e.g. 'pdfs/abc.pdf'  or full https://…
 */
async function deleteFile(pathOrUrl) {
    if (!pathOrUrl) return;

    const storagePath = publicUrlToStoragePath(pathOrUrl);
    if (!storagePath) return;

    const supabase = getClient();

    const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);

    if (error && !error.message?.includes('Not Found')) {
        // Log but don't throw — deletion failures shouldn't crash the request
        console.warn('[supabaseService] deleteFile warning:', error.message);
    }
}

/**
 * publicUrlToStoragePath
 * ----------------------
 * Extracts the Supabase storage path from a public URL.
 * Returns the input unchanged if it is not a Supabase URL.
 *
 * @param {string} url
 * @returns {string}
 */
function publicUrlToStoragePath(url) {
    if (!url) return '';
    // Supabase public URL pattern:
    // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const marker = `/object/public/${BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx !== -1) {
        return decodeURIComponent(url.slice(idx + marker.length));
    }
    // Could be a relative or local path — return as-is
    return url;
}

/**
 * isSupabaseUrl
 * -------------
 * Returns true if the URL is a Supabase storage URL (vs. a legacy local path).
 *
 * @param {string} url
 * @returns {boolean}
 */
function isSupabaseUrl(url) {
    return typeof url === 'string' && url.includes('.supabase.co/storage/');
}

// ── Build a destination path from a multer file ───────────────────────────
/**
 * buildDestPath
 * -------------
 * Constructs a unique storage path for a multer file.
 *
 * @param {object} multerFile – req.file / req.files[x][0]
 * @param {string} folder     – e.g. 'pdfs', 'thumbnails', 'profile-photos'
 * @returns {string}          – e.g. 'pdfs/1709403212000-834521.pdf'
 */
function buildDestPath(multerFile, folder) {
    const timestamp = Date.now();
    const rand = Math.floor(Math.random() * 1e6);
    const ext = path.extname(multerFile.originalname).toLowerCase() || '.bin';
    return `${folder}/${timestamp}-${rand}${ext}`;
}

module.exports = {
    BUCKET,
    uploadFile,
    getPublicUrl,
    deleteFile,
    publicUrlToStoragePath,
    isSupabaseUrl,
    buildDestPath,
};

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import imageCompression from 'browser-image-compression';
import axios from 'axios';
import { 
    UploadCloud, Camera, X, FilePlus, AlertCircle, CheckCircle, 
    ChevronLeft, ChevronRight, Sparkles, Wand2, Contrast, 
    Hash, Maximize, Sun, Layers, Crop, Palette, Eraser
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Webcam from "react-webcam";
import ManualCropModal from '../components/ManualCropModal';
import { autoDetectBoundary } from '../utils/cropUtils';
import watermarkImg from '../assets/SnapPDF Watermark.png';

// ─────────────────────────────────────────────
// Converts any image (blob/file/dataURL) to a
// clean JPEG Uint8Array via the Canvas API.
// ─────────────────────────────────────────────
const toJpegBytes = (src, filter = 'none') =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Could not get canvas context');

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                // Apply Filters if any
                if (filter !== 'none') {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    if (filter === 'grayscale') {
                        for (let i = 0; i < data.length; i += 4) {
                            const avg = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11);
                            data[i] = data[i + 1] = data[i + 2] = avg;
                        }
                    } else if (filter === 'high-contrast') {
                        const factor = (259 * (128 + 255)) / (255 * (259 - 128));
                        for (let i = 0; i < data.length; i += 4) {
                            data[i] = factor * (data[i] - 128) + 128;
                            data[i + 1] = factor * (data[i + 1] - 128) + 128;
                            data[i + 2] = factor * (data[i + 2] - 128) + 128;
                        }
                    } else if (filter === 'threshold') {
                        for (let i = 0; i < data.length; i += 4) {
                            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                            const val = avg > 128 ? 255 : 0;
                            data[i] = data[i + 1] = data[i + 2] = val;
                        }
                    } else if (filter === 'brighten') {
                        for (let i = 0; i < data.length; i += 4) {
                            data[i] += 40; data[i + 1] += 40; data[i + 2] += 40;
                        }
                    } else if (filter === 'magic-color') {
                        // Step 1: Boost contrast
                        const contrastFactor = (259 * (60 + 255)) / (255 * (259 - 60));
                        for (let i = 0; i < data.length; i += 4) {
                            data[i]     = Math.min(255, Math.max(0, contrastFactor * (data[i]     - 128) + 128));
                            data[i + 1] = Math.min(255, Math.max(0, contrastFactor * (data[i + 1] - 128) + 128));
                            data[i + 2] = Math.min(255, Math.max(0, contrastFactor * (data[i + 2] - 128) + 128));
                        }
                        // Step 2: Boost saturation (push each channel away from its grayscale average)
                        const satBoost = 1.6;
                        for (let i = 0; i < data.length; i += 4) {
                            const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
                            data[i]     = Math.min(255, Math.max(0, gray + satBoost * (data[i]     - gray)));
                            data[i + 1] = Math.min(255, Math.max(0, gray + satBoost * (data[i + 1] - gray)));
                            data[i + 2] = Math.min(255, Math.max(0, gray + satBoost * (data[i + 2] - gray)));
                        }
                        // Step 3: Slight brightness lift
                        for (let i = 0; i < data.length; i += 4) {
                            data[i]     = Math.min(255, data[i]     + 15);
                            data[i + 1] = Math.min(255, data[i + 1] + 15);
                            data[i + 2] = Math.min(255, data[i + 2] + 15);
                        }
                    } else if (filter === 'no-shadow') {
                        // Shadow removal via background normalization:
                        // Compute a blurred (low-frequency) estimate of the background brightness
                        // using a simple box-blur on the luminance channel, then divide out.
                        const w = canvas.width, h = canvas.height;
                        const lum = new Float32Array(w * h);
                        for (let i = 0; i < data.length; i += 4) {
                            lum[i >> 2] = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
                        }
                        // Box-blur the luminance with a large radius to estimate background
                        const radius = Math.max(20, Math.floor(Math.min(w, h) / 20));
                        const blurred = new Float32Array(w * h);
                        // Horizontal pass
                        for (let y = 0; y < h; y++) {
                            let sum = 0, count = 0;
                            for (let x = 0; x < radius; x++) { sum += lum[y * w + x]; count++; }
                            for (let x = 0; x < w; x++) {
                                if (x + radius < w) { sum += lum[y * w + x + radius]; count++; }
                                if (x - radius - 1 >= 0) { sum -= lum[y * w + x - radius - 1]; count--; }
                                blurred[y * w + x] = sum / count;
                            }
                        }
                        // Vertical pass into a second buffer
                        const bg = new Float32Array(w * h);
                        for (let x = 0; x < w; x++) {
                            let sum = 0, count = 0;
                            for (let y = 0; y < radius; y++) { sum += blurred[y * w + x]; count++; }
                            for (let y = 0; y < h; y++) {
                                if (y + radius < h) { sum += blurred[(y + radius) * w + x]; count++; }
                                if (y - radius - 1 >= 0) { sum -= blurred[(y - radius - 1) * w + x]; count--; }
                                bg[y * w + x] = sum / count;
                            }
                        }
                        // Normalize: pixel / background * 255, clamp
                        for (let i = 0; i < data.length; i += 4) {
                            const bgVal = Math.max(1, bg[i >> 2]);
                            data[i]     = Math.min(255, (data[i]     / bgVal) * 240);
                            data[i + 1] = Math.min(255, (data[i + 1] / bgVal) * 240);
                            data[i + 2] = Math.min(255, (data[i + 2] / bgVal) * 240);
                        }
                    }

                    ctx.putImageData(imageData, 0, 0);

                    if (filter === 'sharpen') {
                        const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
                        const side = Math.round(Math.sqrt(weights.length));
                        const halfSide = Math.floor(side / 2);
                        const src = imageData.data;
                        const sw = canvas.width, sh = canvas.height;
                        const output = ctx.createImageData(sw, sh);
                        const dst = output.data;
                        for (let y = 0; y < sh; y++) {
                            for (let x = 0; x < sw; x++) {
                                let r = 0, g = 0, b = 0;
                                for (let cy = 0; cy < side; cy++) {
                                    for (let cx = 0; cx < side; cx++) {
                                        const scy = y + cy - halfSide;
                                        const scx = x + cx - halfSide;
                                        if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                                            const srcOff = (scy * sw + scx) * 4;
                                            const wt = weights[cy * side + cx];
                                            r += src[srcOff] * wt;
                                            g += src[srcOff + 1] * wt;
                                            b += src[srcOff + 2] * wt;
                                        }
                                    }
                                }
                                const dstOff = (y * sw + x) * 4;
                                dst[dstOff] = r; dst[dstOff + 1] = g; dst[dstOff + 2] = b; dst[dstOff + 3] = 255;
                            }
                        }
                        ctx.putImageData(output, 0, 0);
                    }
                }

                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Canvas toBlob failed'));
                        return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(new Uint8Array(reader.result));
                    };
                    reader.readAsArrayBuffer(blob);
                }, 'image/jpeg', 0.9);
            } catch (err) {
                reject(err);
            }
        };
        img.onerror = () => reject(new Error('Failed to load image for PDF embedding. The image source might be corrupted or revoked.'));
        img.src = src;
    });

const CreatePDF = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [mode, setMode] = useState('upload');
    const [isDragging, setIsDragging] = useState(false);
    const [filename, setFilename] = useState('New_Document.pdf');
    const [generatedBlob, setGeneratedBlob] = useState(null);
    const [isGenerated, setIsGenerated] = useState(false);
    const [selectedPageIndex, setSelectedPageIndex] = useState(0);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [isAutoCropping, setIsAutoCropping] = useState(false);
    const [isFlashing, setIsFlashing] = useState(false);  // shutter flash

    const VISION_FILTERS = [
        { id: 'none',         label: 'Original',     icon: <Wand2    className="w-4 h-4" /> },
        { id: 'grayscale',    label: 'Black & White', icon: <Layers   className="w-4 h-4" /> },
        { id: 'high-contrast',label: 'High Contrast', icon: <Contrast className="w-4 h-4" /> },
        { id: 'threshold',    label: 'Scanner Look',  icon: <Hash     className="w-4 h-4" /> },
        { id: 'sharpen',      label: 'Sharpen Text',  icon: <Maximize className="w-4 h-4" /> },
        { id: 'brighten',     label: 'Brighten',      icon: <Sun      className="w-4 h-4" /> },
        { id: 'magic-color',  label: 'Magic Color',   icon: <Palette  className="w-4 h-4" /> },
        { id: 'no-shadow',    label: 'No Shadow',     icon: <Eraser   className="w-4 h-4" /> },
    ];

    const fileInputRef = useRef(null);
    const webcamRef = useRef(null);
    const audioCtxRef = useRef(null);  // Web Audio context for shutter sound

    // Use a ref to track the latest images for the unmount cleanup
    const imagesRef = useRef(images);
    useEffect(() => {
        imagesRef.current = images;
    }, [images]);

    useEffect(() => {
        return () => {
            // Only revoke on unmount to prevent premature revocation during edits
            imagesRef.current.forEach(img => {
                if (img.preview && typeof img.preview === 'string' && img.preview.startsWith('blob:')) {
                    URL.revokeObjectURL(img.preview);
                }
            });
        };
    }, []);

    // ── Shared file processor ──────────────────
    const processFiles = async (files) => {
        if (!files || files.length === 0) return;
        setError('');
        setLoading(true);

        const processedImages = [];
        try {
            const options = {
                maxSizeMB: 1.0,
                maxWidthOrHeight: 1920,
                useWebWorker: false,
                fileType: 'image/jpeg'
            };

            for (let i = 0; i < files.length; i++) {
                setStatus(`Processing image ${i + 1} of ${files.length}…`);
                const file = files[i];

                if (!file.type.startsWith('image/')) {
                    console.warn(`Skipping non-image file: ${file.name}`);
                    continue;
                }

                try {
                    const compressed = await imageCompression(file, options);
                    const preview = URL.createObjectURL(compressed);
                    processedImages.push({
                        id: Math.random().toString(36).substr(2, 9),
                        preview,
                        filter: 'none'
                    });
                } catch (compErr) {
                    console.error(`Compression failed for ${file.name}:`, compErr);
                    const preview = URL.createObjectURL(file);
                    processedImages.push({
                        id: Math.random().toString(36).substr(2, 9),
                        preview,
                        filter: 'none'
                    });
                }
            }

            if (processedImages.length > 0) {
                setImages((prev) => [...prev, ...processedImages]);
            }
        } catch (err) {
            console.error('File process error:', err);
            setError('Failed to process images: ' + (err?.message || 'Check file format or size'));
        } finally {
            setLoading(false);
            setStatus('');
        }
    };

    // ── Interaction handlers ────────────────────
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        processFiles(files);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    };

    // ── Shutter sound via Web Audio API (no file dependency) ──
    const playShutterSound = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            audioCtxRef.current = ctx;

            // Click transient  — short burst of noise
            const bufferSize = ctx.sampleRate * 0.06; // 60 ms
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                // Decaying white noise — classic camera click
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 8);
            }

            const source = ctx.createBufferSource();
            source.buffer = buffer;

            // Slight bandpass to make it punchier
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1200;
            filter.Q.value = 0.8;

            // Gain envelope
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.7, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

            source.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            source.start(ctx.currentTime);
            source.stop(ctx.currentTime + 0.07);
            source.onended = () => ctx.close();
        } catch {
            // Silently fail if audio is blocked (e.g. Safari requires user gesture)
        }
    }, []);

    // ── Camera capture ─────────────────────────
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            // 1. Shutter flash overlay
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 160);

            // 2. Camera click sound
            playShutterSound();

            // 3. Add captured image
            setImages((prev) => [...prev, {
                id: 'cam-' + Date.now(),
                preview: imageSrc,
                filter: 'none'
            }]);
        }
    }, [playShutterSound]);

    const handleWebcamError = useCallback((err) => {
        let errorMsg = 'Camera access denied or not available.';

        // Check for insecure context (Standard browsers block camera over HTTP)
        if (!window.isSecureContext) {
            errorMsg = '🔴 Camera requires a SECURE connection (HTTPS). Browsers block camera access over plain HTTP (192.168.x.x).';
            if (/Android/i.test(navigator.userAgent)) {
                errorMsg += ' TIP: On Android Chrome, you can bypass this in chrome://flags under "Unsafely treat insecure origin as secure".';
            }
        } else {
            errorMsg += ' Please ensure you have granted camera permissions in your browser settings.';
        }

        setError(errorMsg);
        setMode('upload');
        console.error('Webcam Error:', err);
    }, []);

    const removeImage = (id) => {
        const imgToRemove = images.find(img => img.id === id);
        if (imgToRemove && imgToRemove.preview.startsWith('blob:')) {
            URL.revokeObjectURL(imgToRemove.preview);
        }
        setImages(images.filter((img) => img.id !== id));
    };

    const movePage = (index, direction) => {
        const newImages = [...images];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newImages.length) return;
        [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
        setImages(newImages);
        if (selectedPageIndex === index) setSelectedPageIndex(targetIndex);
        else if (selectedPageIndex === targetIndex) setSelectedPageIndex(index);
    };

    const applyFilter = (filterId, all = false) => {
        setImages(prev => prev.map((img, idx) => {
            if (all || idx === selectedPageIndex) {
                return { ...img, filter: filterId };
            }
            return img;
        }));
    };

    // ── Cropping Logic ──────────────────────────
    const handleAutoCrop = async () => {
        if (images.length === 0) return;
        setIsAutoCropping(true);
        setStatus('Scanning for document boundaries...');
        try {
            const currentImg = images[selectedPageIndex];
            const croppedPreview = await autoDetectBoundary(currentImg.preview);
            
            setImages(prev => prev.map((img, idx) => {
                if (idx === selectedPageIndex) {
                    return { ...img, preview: croppedPreview };
                }
                return img;
            }));
            setStatus('Auto-crop applied successfully!');
            setTimeout(() => setStatus(''), 2000);
        } catch (err) {
            console.error('Auto-crop failed:', err);
            setError('Auto-crop failed to detect edges.');
        } finally {
            setIsAutoCropping(false);
        }
    };

    const handleManualCropSave = (newPreview) => {
        setImages(prev => prev.map((img, idx) => {
            if (idx === selectedPageIndex) {
                return { ...img, preview: newPreview };
            }
            return img;
        }));
        setIsCropModalOpen(false);
        setStatus('Manual crop applied.');
        setTimeout(() => setStatus(''), 2000);
    };

    // ── Generate PDF ───────────────────────────
    const handleGenerate = async () => {
        if (images.length === 0) return;
        setError('');
        setLoading(true);
        setGeneratedBlob(null);
        setIsGenerated(false);

        try {
            const pdfDoc = await PDFDocument.create();
            const A4_W = 595.28, A4_H = 841.89;

            for (let i = 0; i < images.length; i++) {
                setStatus(`Enhancing and embedding page ${i + 1} of ${images.length}…`);
                const img = images[i];
                const jpegBytes = await toJpegBytes(img.preview, img.filter);
                const embeddedImage = await pdfDoc.embedJpg(jpegBytes);

                const { width, height } = embeddedImage.scale(1);
                const page = pdfDoc.addPage([A4_W, A4_H]);
                const scale = Math.min(A4_W / width, A4_H / height);
                page.drawImage(embeddedImage, {
                    x: (A4_W - width * scale) / 2,
                    y: (A4_H - height * scale) / 2,
                    width: width * scale,
                    height: height * scale,
                });
            }

            // ── Add Watermark ──────────────────────────
            try {
                const watermarkRes = await fetch(watermarkImg);
                const watermarkBytes = await watermarkRes.arrayBuffer();
                const watermarkEmbed = await pdfDoc.embedPng(watermarkBytes);
                const { width: wmOriginalWidth, height: wmOriginalHeight } = watermarkEmbed.scale(1);
                
                const wmFinalWidth = 150; 
                const wmFinalHeight = (wmOriginalHeight / wmOriginalWidth) * wmFinalWidth;

                pdfDoc.getPages().forEach(page => {
                    page.drawImage(watermarkEmbed, {
                        x: A4_W - wmFinalWidth - 10,
                        y: 3,
                        width: wmFinalWidth,
                        height: wmFinalHeight,
                        opacity: 1.0,
                    });
                });
            } catch (wmError) {
                console.warn('Could not add watermark:', wmError);
            }

            setStatus('Finalizing PDF…');
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            setGeneratedBlob(blob);
            setIsGenerated(true);

            setStatus('Saving to your library…');
            let pdfFilename = filename.trim() || 'Document';
            if (!pdfFilename.toLowerCase().endsWith('.pdf')) pdfFilename += '.pdf';

            try {
                const file = new File([blob], pdfFilename, { type: 'application/pdf' });
                const formData = new FormData();
                formData.append('pdfFile', file);
                formData.append('filename', pdfFilename);
                formData.append('pageCount', String(images.length));
                formData.append('fileSize', String(blob.size));

                if (images.length > 0) {
                    try {
                        const firstImageRes = await fetch(images[0].preview);
                        const thumbnailBlob = await firstImageRes.blob();
                        const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' });
                        formData.append('thumbnail', thumbnailFile);
                    } catch (thumbErr) {
                        console.warn('Could not generate thumbnail:', thumbErr);
                    }
                }

                await axios.post('/api/pdfs', formData);
                setStatus('✨ Success! PDF is ready and saved to your dashboard.');
                setIsGenerated(true);
            } catch (backendErr) {
                console.warn('Backend save failed:', backendErr.message);
                setStatus('✅ PDF generated! (Note: Failed to save in library, but you can download it now)');
            }
        } catch (err) {
            console.error('PDF generation failed:', err);
            setError('PDF generation failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!generatedBlob) return;

        let pdfFilename = filename.trim() || 'Document';
        if (!pdfFilename.toLowerCase().endsWith('.pdf')) pdfFilename += '.pdf';

        const downloadUrl = URL.createObjectURL(generatedBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = pdfFilename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
    };

    return (
        <div className="w-full">

            {/* ── Page Header ────────────────────────────────── */}
            <div style={{ marginBottom: 24 }}>
                <span className="app-eyebrow" style={{ display: 'block', marginBottom: 4 }}>Document Studio</span>
                <h1 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                    Create PDF
                </h1>
                <p style={{ fontSize: 13, color: 'var(--app-text-muted)', marginTop: 4 }}>
                    Upload images or scan pages with your camera to build high-quality PDF documents.
                </p>
            </div>

            {/* ── Error Banner ──────────────────────────────── */}
            {error && (
                <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    background: 'var(--app-danger-soft)',
                    border: '1px solid rgba(239,68,68,0.28)',
                    borderRadius: 'var(--app-radius)', padding: '12px 16px',
                    marginBottom: 20, fontSize: 13, color: 'var(--app-danger)',
                }}>
                    <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
                    <span>{error}</span>
                </div>
            )}

            {/* ── Progress Toast ────────────────────────────── */}
            {loading && status && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--app-primary-soft)',
                    border: '1px solid var(--app-border-strong)',
                    borderRadius: 'var(--app-radius)', padding: '12px 16px',
                    marginBottom: 20, fontSize: 13, color: 'var(--app-primary)',
                }}>
                    <div className="animate-spin rounded-full border-b-2 border-blue-500" style={{ width: 16, height: 16, flexShrink: 0 }} />
                    <span style={{ fontWeight: 500 }}>{status}</span>
                </div>
            )}

            {/* ── Success Card ──────────────────────────────── */}
            {isGenerated && !loading && status && (
                <div style={{
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14,
                    background: 'var(--app-success-soft)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    borderRadius: 'var(--app-radius)', padding: '16px 20px', marginBottom: 20,
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--app-success)', display: 'grid', placeItems: 'center', flexShrink: 0,
                    }}>
                        <CheckCircle style={{ width: 18, height: 18, color: '#fff' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--app-success)' }}>{status}</p>
                        <p style={{ fontSize: 11, color: 'var(--app-text-muted)', marginTop: 2 }}>Saved to your dashboard library.</p>
                    </div>
                    <Link
                        to="/dashboard"
                        style={{
                            padding: '9px 18px', borderRadius: 'var(--app-radius-sm)',
                            background: 'var(--app-success)', color: '#fff',
                            fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap',
                            boxShadow: '0 4px 14px rgba(16,185,129,0.30)',
                        }}
                    >
                        Go to Dashboard →
                    </Link>
                </div>
            )}

            {/* ── Main 2-Column Grid ───────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6" style={{ alignItems: 'flex-start' }}>

                {/* ── LEFT: Upload Zone or Camera Workspace ────────────── */}
                <div
                    className="glass-panel p-5 transition-all duration-300"
                    style={isDragging ? {
                        boxShadow: '0 0 0 3px var(--app-primary-soft), var(--app-shadow-lg)',
                        borderColor: 'var(--app-primary)',
                        transform: 'scale(1.005)',
                    } : {}}
                >
                    {/* Workspace Panel Header with Integrated Mode Switcher */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        paddingBottom: 14, marginBottom: 16,
                        borderBottom: '1px solid var(--app-border-strong)', gap: 12, flexWrap: 'wrap',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 'var(--app-radius-sm)',
                                background: 'linear-gradient(135deg, var(--app-primary-soft), var(--app-accent-soft))',
                                border: '1px solid var(--app-border-strong)',
                                display: 'grid', placeItems: 'center',
                            }}>
                                {mode === 'upload' ? <UploadCloud style={{ width: 14, height: 14, color: 'var(--app-primary)' }} /> : <Camera style={{ width: 14, height: 14, color: 'var(--app-primary)' }} />}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.01em' }}>
                                {mode === 'upload' ? 'Upload Files' : 'Camera Scanner'}
                            </span>
                        </div>

                        {/* Mode Toggle Switcher Pill */}
                        <div style={{
                            display: 'flex',
                            background: 'var(--app-bg-elevated)',
                            border: '1px solid var(--app-border-strong)',
                            borderRadius: 'var(--app-radius-sm)',
                            padding: 3, gap: 3,
                        }}>
                            {[
                                { id: 'upload', label: 'Upload',  Icon: UploadCloud },
                                { id: 'camera', label: 'Scan',    Icon: Camera      },
                            ].map(({ id, label, Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setMode(id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 5,
                                        padding: '5px 12px',
                                        borderRadius: 'calc(var(--app-radius-sm) - 2px)',
                                        fontSize: 12, fontWeight: 600,
                                        background: mode === id
                                            ? 'linear-gradient(135deg, var(--app-primary), var(--app-accent))'
                                            : 'transparent',
                                        color: mode === id ? '#fff' : 'var(--app-text-muted)',
                                        boxShadow: mode === id ? '0 2px 10px var(--app-primary-glow)' : 'none',
                                        border: 'none', cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <Icon style={{ width: 13, height: 13 }} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {mode === 'upload' ? (
                        /* ── Upload Drop Zone ── */
                        <div
                            style={{
                                border: `2px dashed ${isDragging ? 'var(--app-primary)' : 'var(--app-border-strong)'}`,
                                borderRadius: 'var(--app-radius)',
                                minHeight: 340,
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                padding: '40px 28px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                userSelect: 'none',
                                background: isDragging ? 'var(--app-primary-soft)' : 'var(--app-bg-elevated)',
                                transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                                transform: isDragging ? 'scale(0.98)' : 'scale(1)',
                                position: 'relative',
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {/* Dragging overlay */}
                            {isDragging && (
                                <div style={{
                                    position: 'absolute', inset: 0, borderRadius: 'inherit',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    background: 'var(--app-primary-soft)', backdropFilter: 'blur(6px)',
                                    pointerEvents: 'none', zIndex: 10,
                                }}>
                                    <UploadCloud style={{ width: 60, height: 60, color: 'var(--app-primary)' }} />
                                    <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--app-primary)', marginTop: 12 }}>Drop to Upload</p>
                                </div>
                            )}

                            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />

                            {/* Icon */}
                            <div style={{
                                width: 76, height: 76, borderRadius: 'var(--app-radius-lg)',
                                background: 'linear-gradient(135deg, var(--app-primary-soft), var(--app-accent-soft))',
                                border: '1px solid var(--app-border-strong)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px auto',
                            }}>
                                <UploadCloud style={{ width: 32, height: 32, color: 'var(--app-primary)' }} />
                            </div>

                            <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--app-text)', marginBottom: 6, letterSpacing: '-0.01em' }}>
                                {loading ? 'Processing images…' : 'Tap or Drag & Drop images'}
                            </h3>
                            <p style={{ fontSize: 13, color: 'var(--app-text-muted)', marginBottom: 24 }}>
                                JPG, PNG, WebP — all supported
                            </p>

                            <button
                                className="btn-primary"
                                onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                style={{ fontSize: 13, margin: '0 auto' }}
                            >
                                <FilePlus style={{ width: 15, height: 15 }} /> Browse Files
                            </button>
                        </div>
                    ) : (
                        /* ── Camera / Scan Mode ── */
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>

                            {/* Viewfinder */}
                            <div style={{
                                position: 'relative', borderRadius: 'var(--app-radius-lg)',
                                overflow: 'hidden', background: '#000',
                                border: '2px solid var(--app-border-strong)',
                                width: '100%', aspectRatio: '3/4', maxWidth: 400,
                                boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
                            }}>
                                <Webcam
                                    audio={false} ref={webcamRef}
                                    screenshotFormat="image/jpeg" screenshotQuality={1.00}
                                    videoConstraints={{ facingMode: "environment" }}
                                    onUserMediaError={handleWebcamError}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />

                                {/* Corner guide markers */}
                                {[[0,0,'tl'],[0,1,'tr'],[1,0,'bl'],[1,1,'br']].map(([row,col,k]) => (
                                    <div key={k} style={{
                                        position: 'absolute',
                                        top: row === 0 ? 16 : undefined, bottom: row === 1 ? 16 : undefined,
                                        left: col === 0 ? 16 : undefined, right: col === 1 ? 16 : undefined,
                                        width: 22, height: 22,
                                        borderTop:    row === 0 ? '2px solid rgba(255,255,255,0.65)' : undefined,
                                        borderBottom: row === 1 ? '2px solid rgba(255,255,255,0.65)' : undefined,
                                        borderLeft:   col === 0 ? '2px solid rgba(255,255,255,0.65)' : undefined,
                                        borderRight:  col === 1 ? '2px solid rgba(255,255,255,0.65)' : undefined,
                                        borderTopLeftRadius:     k === 'tl' ? 5 : undefined,
                                        borderTopRightRadius:    k === 'tr' ? 5 : undefined,
                                        borderBottomLeftRadius:  k === 'bl' ? 5 : undefined,
                                        borderBottomRightRadius: k === 'br' ? 5 : undefined,
                                        pointerEvents: 'none',
                                    }} />
                                ))}

                                {/* Flash overlay */}
                                <div style={{
                                    position: 'absolute', inset: 0, background: '#fff',
                                    opacity: isFlashing ? 0.85 : 0, transition: 'opacity 0.15s', pointerEvents: 'none',
                                }} />

                                {/* Page count badge */}
                                {images.length > 0 && (
                                    <div style={{
                                        position: 'absolute', top: 12, left: 12,
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(8px)',
                                        color: '#fff', fontSize: 11, fontWeight: 700,
                                        padding: '5px 10px', borderRadius: 100,
                                    }}>
                                        <span style={{
                                            width: 6, height: 6, borderRadius: '50%',
                                            background: 'var(--app-primary-light)', display: 'inline-block',
                                            animation: 'pulse 2s ease-in-out infinite',
                                        }} />
                                        {images.length} {images.length === 1 ? 'page' : 'pages'}
                                    </div>
                                )}
                            </div>

                            {/* Capture controls */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36 }}>
                                {/* Count display */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 44 }}>
                                    <span style={{
                                        fontSize: 30, fontWeight: 900, lineHeight: 1,
                                        background: 'linear-gradient(135deg, var(--app-primary), var(--app-accent))',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                        transition: 'transform 0.15s',
                                        transform: isFlashing ? 'scale(1.3)' : 'scale(1)',
                                    }}>{images.length}</span>
                                    <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--app-text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {images.length === 1 ? 'PAGE' : 'PAGES'}
                                    </span>
                                </div>

                                {/* Shutter button */}
                                <button
                                    onClick={capture}
                                    aria-label="Capture photo"
                                    style={{
                                        width: 74, height: 74, borderRadius: '50%',
                                        background: 'var(--app-bg-elevated)',
                                        border: '3px solid var(--app-border-strong)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: isFlashing
                                            ? '0 0 0 8px var(--app-primary-soft), 0 20px 40px rgba(0,0,0,0.4)'
                                            : '0 8px 32px rgba(0,0,0,0.30)',
                                        cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                                    }}
                                >
                                    <div style={{
                                        width: 54, height: 54, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--app-primary), var(--app-accent))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 16px var(--app-primary-glow)',
                                        transition: 'transform 0.15s',
                                        transform: isFlashing ? 'scale(0.87)' : 'scale(1)',
                                    }}>
                                        <Camera style={{ width: 22, height: 22, color: '#fff' }} />
                                    </div>
                                </button>

                                <div style={{ minWidth: 44 }} />
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Tap the button to capture a page</p>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Vision Lab + PDF Actions ────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Vision Lab — only when images exist */}
                    {images.length > 0 && (
                        <div className="glass-panel p-4">
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 'var(--app-radius-sm)',
                                    background: 'linear-gradient(135deg, var(--app-primary-soft), var(--app-accent-soft))',
                                    display: 'grid', placeItems: 'center', flexShrink: 0,
                                }}>
                                    <Sparkles style={{ width: 13, height: 13, color: 'var(--app-primary)' }} />
                                </div>
                                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.01em', flex: 1 }}>
                                    Vision Lab
                                </h3>
                                <span style={{ fontSize: 11, color: 'var(--app-text-faint)' }}>
                                    {selectedPageIndex + 1} / {images.length}
                                </span>
                            </div>

                            {/* Page Preview */}
                            <div style={{
                                position: 'relative', aspectRatio: '4/5', borderRadius: 'var(--app-radius)',
                                background: '#09090f', overflow: 'hidden',
                                border: '1px solid var(--app-border)', marginBottom: 12,
                            }}>
                                <img
                                    src={images[selectedPageIndex].preview}
                                    alt={`Page ${selectedPageIndex + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
                                    className={
                                        images[selectedPageIndex].filter === 'grayscale'     ? 'grayscale' :
                                        images[selectedPageIndex].filter === 'high-contrast' ? 'contrast-150 grayscale' :
                                        images[selectedPageIndex].filter === 'threshold'     ? 'contrast-[200] grayscale' :
                                        images[selectedPageIndex].filter === 'brighten'      ? 'brightness-125' :
                                        images[selectedPageIndex].filter === 'sharpen'       ? 'contrast-125 saturate-0' :
                                        images[selectedPageIndex].filter === 'magic-color'   ? 'saturate-[1.8] contrast-[1.2] brightness-110' :
                                        images[selectedPageIndex].filter === 'no-shadow'     ? 'contrast-[1.15] brightness-110' : ''
                                    }
                                />

                                {/* Apply All */}
                                <button
                                    onClick={() => applyFilter(images[selectedPageIndex].filter, true)}
                                    style={{
                                        position: 'absolute', top: 8, right: 8,
                                        padding: '3px 8px', borderRadius: 6,
                                        background: 'var(--app-primary)', color: '#fff',
                                        fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer',
                                        boxShadow: '0 2px 8px var(--app-primary-glow)',
                                    }}
                                >
                                    Apply All
                                </button>

                                {/* Prev/Next nav */}
                                <div style={{
                                    position: 'absolute', bottom: 8, left: 0, right: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}>
                                    {[
                                        { dir: -1, Icon: ChevronLeft,  disabled: selectedPageIndex === 0 },
                                        { dir:  1, Icon: ChevronRight, disabled: selectedPageIndex === images.length - 1 },
                                    ].map(({ dir, Icon, disabled }, i) => (
                                        <React.Fragment key={i}>
                                            {i === 1 && (
                                                <span style={{
                                                    fontSize: 10, fontWeight: 700, color: '#fff',
                                                    background: 'rgba(0,0,0,0.6)', padding: '3px 8px', borderRadius: 100,
                                                }}>
                                                    {selectedPageIndex + 1}/{images.length}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => setSelectedPageIndex(p => Math.max(0, Math.min(images.length - 1, p + dir)))}
                                                disabled={disabled}
                                                style={{
                                                    padding: '3px 8px', borderRadius: 100, border: 'none', cursor: 'pointer',
                                                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                                                    color: '#fff', opacity: disabled ? 0.3 : 1,
                                                    display: 'flex', alignItems: 'center',
                                                }}
                                            >
                                                <Icon style={{ width: 13, height: 13 }} />
                                            </button>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            {/* Filters Grid */}
                            <p className="app-eyebrow" style={{ marginBottom: 8 }}>Filters</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
                                {VISION_FILTERS.map(f => {
                                    const active = images[selectedPageIndex].filter === f.id;
                                    return (
                                        <button
                                            key={f.id}
                                            onClick={() => applyFilter(f.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 7,
                                                padding: '8px 10px', borderRadius: 'var(--app-radius-sm)',
                                                background: active
                                                    ? 'linear-gradient(135deg, var(--app-primary), var(--app-accent))'
                                                    : 'var(--app-bg-elevated)',
                                                border: `1px solid ${active ? 'transparent' : 'var(--app-border-strong)'}`,
                                                color: active ? '#fff' : 'var(--app-text-muted)',
                                                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                                boxShadow: active ? '0 4px 12px var(--app-primary-glow)' : 'none',
                                                transition: 'all 0.2s ease',
                                                textAlign: 'left',
                                            }}
                                        >
                                            <div style={{
                                                padding: 4, borderRadius: 6, flexShrink: 0,
                                                background: active ? 'rgba(255,255,255,0.18)' : 'var(--app-primary-soft)',
                                            }}>
                                                {React.cloneElement(f.icon, {
                                                    style: { width: 11, height: 11, color: active ? '#fff' : 'var(--app-primary)' }
                                                })}
                                            </div>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {f.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Smart Tools */}
                            <p className="app-eyebrow" style={{ marginBottom: 8 }}>Smart Tools</p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    onClick={handleAutoCrop}
                                    disabled={isAutoCropping}
                                    className="btn-primary"
                                    style={{ flex: 1, fontSize: 11, padding: '9px 10px', justifyContent: 'center' }}
                                >
                                    <Sparkles style={{
                                        width: 13, height: 13,
                                        ...(isAutoCropping ? { animation: 'spin 1s linear infinite' } : {}),
                                    }} />
                                    Auto-Clean
                                </button>
                                <button
                                    onClick={() => setIsCropModalOpen(true)}
                                    className="btn-secondary"
                                    style={{ flex: 1, fontSize: 11, padding: '9px 10px', justifyContent: 'center' }}
                                >
                                    <Crop style={{ width: 13, height: 13 }} />
                                    Manual Crop
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PDF Settings Card */}
                    <div className="glass-panel p-4">
                        {/* Card header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 'var(--app-radius-sm)',
                                background: 'linear-gradient(135deg, var(--app-primary-soft), var(--app-accent-soft))',
                                display: 'grid', placeItems: 'center', flexShrink: 0,
                            }}>
                                <FilePlus style={{ width: 13, height: 13, color: 'var(--app-primary)' }} />
                            </div>
                            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.01em' }}>
                                PDF Settings
                            </h3>
                        </div>

                        {/* File name */}
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--app-text-muted)', marginBottom: 6 }}>
                            File Name
                        </label>
                        <input
                            type="text"
                            value={filename}
                            onChange={e => setFilename(e.target.value)}
                            className="input-field"
                            placeholder="My_Document.pdf"
                            style={{ marginBottom: 14, fontSize: 13 }}
                        />

                        {/* Pages count pill */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px', borderRadius: 'var(--app-radius-sm)',
                            background: 'var(--app-bg-elevated)', border: '1px solid var(--app-border)',
                            marginBottom: 16,
                        }}>
                            <span style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Pages</span>
                            <span style={{
                                fontSize: 14, fontWeight: 700,
                                color: images.length > 0 ? 'var(--app-primary)' : 'var(--app-text-faint)',
                            }}>
                                {images.length === 0 ? 'None added yet' : `${images.length} page${images.length !== 1 ? 's' : ''}`}
                            </span>
                        </div>

                        {/* Action buttons */}
                        <button
                            onClick={handleGenerate}
                            disabled={loading || images.length === 0}
                            className="btn-primary"
                            style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}
                        >
                            {loading
                                ? <><div className="animate-spin rounded-full border-b-2 border-white/50" style={{ width: 14, height: 14, borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff' }} /> Generating…</>
                                : <><FilePlus style={{ width: 15, height: 15 }} /> Generate PDF</>
                            }
                        </button>

                        <button
                            onClick={handleDownload}
                            disabled={!isGenerated || loading}
                            className="btn-secondary"
                            style={{
                                width: '100%', justifyContent: 'center',
                                opacity: (!isGenerated || loading) ? 0.4 : 1,
                                cursor: (!isGenerated || loading) ? 'not-allowed' : 'pointer',
                            }}
                        >
                            <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Pages Filmstrip ─────────────────────────── */}
            {images.length > 0 && (
                <div className="glass-panel mt-5 p-4">
                    {/* Strip header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                minWidth: 28, height: 28, borderRadius: 'var(--app-radius-sm)', padding: '0 8px',
                                background: 'linear-gradient(135deg, var(--app-primary), var(--app-accent))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 800, color: '#fff',
                            }}>
                                {images.length}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-text)' }}>Pages</span>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="btn-secondary"
                            style={{ fontSize: 11, padding: '6px 14px' }}
                        >
                            <FilePlus style={{ width: 13, height: 13 }} /> Add More
                        </button>
                    </div>

                    {/* Scrollable filmstrip */}
                    <div style={{
                        display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6,
                        scrollbarWidth: 'thin', scrollbarColor: 'var(--app-border-strong) transparent',
                    }}>
                        {images.map((img, index) => {
                            const isSelected = selectedPageIndex === index;
                            return (
                                <div
                                    key={img.id}
                                    onClick={() => setSelectedPageIndex(index)}
                                    style={{
                                        flexShrink: 0, width: 86, aspectRatio: '3/4',
                                        borderRadius: 'var(--app-radius-sm)', overflow: 'hidden', cursor: 'pointer',
                                        position: 'relative',
                                        border: `2px solid ${isSelected ? 'var(--app-primary)' : 'var(--app-border-strong)'}`,
                                        boxShadow: isSelected
                                            ? '0 0 0 3px var(--app-primary-soft), var(--app-shadow)'
                                            : 'var(--app-shadow-sm)',
                                        background: 'var(--app-bg-elevated)',
                                        transform: isSelected ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)',
                                        transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
                                    }}
                                >
                                    <img
                                        src={img.preview} alt={`Page ${index + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    />

                                    {/* Page number badge */}
                                    <div style={{
                                        position: 'absolute', top: 5, left: 5,
                                        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
                                        color: '#fff', fontSize: 10, fontWeight: 800,
                                        padding: '2px 6px', borderRadius: 5,
                                    }}>
                                        {index + 1}
                                    </div>

                                    {/* Filter badge */}
                                    {img.filter !== 'none' && (
                                        <div style={{
                                            position: 'absolute', top: 5, right: 5,
                                            background: 'var(--app-primary)', color: '#fff',
                                            padding: '2px 4px', borderRadius: 4,
                                            display: 'flex', alignItems: 'center',
                                        }}>
                                            <Sparkles style={{ width: 8, height: 8 }} />
                                        </div>
                                    )}

                                    {/* Hover/selected controls overlay */}
                                    <div style={{
                                        position: 'absolute', bottom: 0, left: 0, right: 0,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
                                        padding: '14px 4px 5px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
                                        opacity: isSelected ? 1 : 0,
                                        transition: 'opacity 0.2s',
                                    }}>
                                        <button
                                            onClick={e => { e.stopPropagation(); movePage(index, -1); }}
                                            disabled={index === 0}
                                            style={{
                                                background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
                                                opacity: index === 0 ? 0.3 : 1, padding: 2, display: 'flex',
                                            }}
                                        >
                                            <ChevronLeft style={{ width: 13, height: 13 }} />
                                        </button>
                                        <button
                                            onClick={e => { e.stopPropagation(); removeImage(img.id); }}
                                            style={{
                                                width: 18, height: 18, borderRadius: '50%', border: 'none',
                                                background: 'var(--app-danger)', color: '#fff', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                        >
                                            <X style={{ width: 10, height: 10 }} />
                                        </button>
                                        <button
                                            onClick={e => { e.stopPropagation(); movePage(index, 1); }}
                                            disabled={index === images.length - 1}
                                            style={{
                                                background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
                                                opacity: index === images.length - 1 ? 0.3 : 1, padding: 2, display: 'flex',
                                            }}
                                        >
                                            <ChevronRight style={{ width: 13, height: 13 }} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* "Add page" placeholder card */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                flexShrink: 0, width: 86, aspectRatio: '3/4',
                                borderRadius: 'var(--app-radius-sm)',
                                border: '2px dashed var(--app-border-strong)',
                                background: 'var(--app-bg-elevated)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: 'var(--app-text-faint)', gap: 4,
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--app-primary)'; e.currentTarget.style.color = 'var(--app-primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--app-border-strong)'; e.currentTarget.style.color = 'var(--app-text-faint)'; }}
                        >
                            <FilePlus style={{ width: 20, height: 20 }} />
                            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Add</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Crop Modal ───────────────────────────────── */}
            {isCropModalOpen && images[selectedPageIndex] && (
                <ManualCropModal
                    isOpen={isCropModalOpen}
                    image={images[selectedPageIndex].preview}
                    onCropComplete={handleManualCropSave}
                    onClose={() => setIsCropModalOpen(false)}
                />
            )}
        </div>
    );
};

export default CreatePDF;

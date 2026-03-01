import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
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

    // ── Camera capture  ────────────────────────
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImages((prev) => [...prev, {
                id: 'cam-' + Date.now(),
                preview: imageSrc,
                filter: 'none'
            }]);
        }
    }, []);

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
        <div className="max-w-4xl mx-auto py-4 sm:py-8 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white transition-colors">Create New PDF</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">Upload images or use your camera.</p>
                </div>
                <div className="flex w-full sm:w-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 transition-colors">
                    <button
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${mode === 'upload' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                        onClick={() => setMode('upload')}
                    >
                        <UploadCloud className="w-4 h-4" /> Upload
                    </button>
                    <button
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${mode === 'camera' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                        onClick={() => setMode('camera')}
                    >
                        <Camera className="w-4 h-4" /> Scan
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 flex items-start gap-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-xl text-sm font-medium transition-colors">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {loading && status && (
                <div className="mb-4 flex items-center gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-xl text-sm font-medium transition-all">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 flex-shrink-0"></div>
                    <span>{status}</span>
                </div>
            )}

            {isGenerated && !loading && status && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 px-4 py-4 rounded-xl text-sm font-medium transition-all"
                >
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500" />
                        <div>
                            <p className="font-bold">{status}</p>
                            <p className="text-[10px] opacity-80 uppercase tracking-wider mt-0.5">You can now view it in your dashboard library.</p>
                        </div>
                    </div>
                    <Link to="/dashboard" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 text-center whitespace-nowrap">
                        Go to Dashboard →
                    </Link>
                </motion.div>
            )}

            <div className={`glass-panel p-4 sm:p-6 mb-6 transition-all duration-300 relative overflow-hidden ${isDragging ? 'ring-4 ring-blue-500/50 border-blue-500 scale-[1.01] shadow-2xl' : ''}`}>
                {mode === 'upload' ? (
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 sm:p-14 text-center transition-all cursor-pointer select-none relative ${isDragging
                            ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/40 scale-95'
                            : 'border-blue-300 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/10 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                            }`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {isDragging && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-500/10 backdrop-blur-[2px] rounded-xl pointer-events-none z-10">
                                <UploadCloud className="w-20 h-20 text-blue-600 animate-bounce" />
                                <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-2">Drop to Upload</h2>
                            </div>
                        )}
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                        <UploadCloud className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 transition-transform duration-300 ${isDragging ? 'scale-110 opacity-0' : 'text-blue-400 dark:text-blue-600'}`} />
                        <h3 className={`text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1 transition-opacity ${isDragging ? 'opacity-0' : ''}`}>
                            {loading ? 'Processing…' : 'Tap or Drag & Drop images'}
                        </h3>
                        <p className={`text-sm text-slate-500 dark:text-slate-400 transition-opacity ${isDragging ? 'opacity-0' : ''}`}>JPG, PNG, WebP — all supported</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-slate-800 dark:border-slate-700 bg-black w-full max-w-sm aspect-[3/4]">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                screenshotQuality={0.92}
                                videoConstraints={{ facingMode: "environment" }}
                                onUserMediaError={handleWebcamError}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-4 border-2 border-white/30 rounded-lg pointer-events-none" />
                        </div>
                        <button
                            onClick={capture}
                            className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full border-4 border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-2xl active:scale-90 transition-all"
                            aria-label="Capture photo"
                        >
                            <div className="w-14 h-14 bg-blue-600 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </button>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Tap to capture a page</p>
                    </div>
                )}
            </div>

            {images.length > 0 && (
                <div className="glass-panel py-3 px-4 sm:p-5 transition-colors">
                    <div className="flex flex-col gap-3 mb-5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 h-10">
                                <div className="bg-blue-600 text-white min-w-[32px] h-8 rounded-lg flex items-center justify-center text-[11px] font-black shadow-lg shadow-blue-600/20">
                                    {images.length}
                                </div>
                                <div className="hidden xs:block">
                                    <h2 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Pages</h2>
                                </div>
                            </div>
                            <div className="flex-1 flex items-center justify-end gap-1.5 h-10">
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="flex-1 sm:flex-none btn-primary py-2 px-3 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 h-8 min-w-[90px]"
                                >
                                    {loading
                                        ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                        : <><div className="hidden sm:block"><FilePlus className="w-3.5 h-3.5" /></div> Generate</>
                                    }
                                </button>
                                <button
                                    onClick={handleDownload}
                                    disabled={!isGenerated || loading}
                                    className={`flex-1 sm:flex-none py-2 px-3 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 h-8 min-w-[70px] ${isGenerated
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg active:scale-95'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-100 dark:border-slate-800'
                                        }`}
                                >
                                    <div className="hidden sm:block">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    </div>
                                    Save
                                </button>
                            </div>
                        </div>
                        <input
                            type="text"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            className="input-field py-2 text-sm"
                            placeholder="Enter PDF filename…"
                        />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {images.map((img, index) => (
                            <div key={img.id} className="group relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[3/4] bg-slate-100 dark:bg-slate-800 transition-colors">
                                <img src={img.preview} alt={`Page ${index + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute top-1 left-1 bg-black/60 text-white text-xs font-bold px-1.5 py-0.5 rounded backdrop-blur-md">
                                    {index + 1}
                                </div>
                                <div
                                    className="absolute inset-0 cursor-pointer z-10"
                                    onClick={() => setSelectedPageIndex(index)}
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(img.id);
                                    }}
                                    className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 active:scale-90 transition-all shadow-md opacity-0 group-hover:opacity-100 z-30"
                                    aria-label="Remove page"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>

                                {/* Reordering Controls */}
                                <div className="absolute bottom-0 inset-x-0 h-8 bg-black/40 backdrop-blur-sm flex items-center justify-around opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                    <button
                                        disabled={index === 0}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            movePage(index, -1);
                                        }}
                                        className="text-white hover:text-blue-300 disabled:opacity-30"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        disabled={index === images.length - 1}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            movePage(index, 1);
                                        }}
                                        className="text-white hover:text-blue-300 disabled:opacity-30"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                                {selectedPageIndex === index && (
                                    <div className="absolute inset-0 ring-4 ring-blue-500 ring-inset pointer-events-none z-20" />
                                )}
                                {img.filter !== 'none' && (
                                    <div className="absolute top-1 right-8 bg-blue-600 text-white text-[8px] font-bold px-1 rounded flex items-center gap-1 backdrop-blur-sm z-30">
                                        <Sparkles className="w-2 h-2" /> ENHANCED
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Vision Lab Control Panel */}
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 premium-typography">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Vision Lab</h3>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Preview Area - Compact but clear */}
                            <div className="md:w-1/2 lg:w-2/5">
                                <div className="relative group aspect-[4/5] w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
                                    <img
                                        src={images[selectedPageIndex].preview}
                                        alt="Current Page"
                                        className={`w-full h-full object-contain p-2 sm:p-4 transition-all duration-300 ${
                                            images[selectedPageIndex].filter === 'grayscale'     ? 'grayscale' :
                                            images[selectedPageIndex].filter === 'high-contrast' ? 'contrast-150 grayscale' :
                                            images[selectedPageIndex].filter === 'threshold'     ? 'contrast-[200] grayscale' :
                                            images[selectedPageIndex].filter === 'brighten'      ? 'brightness-125' :
                                            images[selectedPageIndex].filter === 'sharpen'       ? 'contrast-125 saturate-0' :
                                            images[selectedPageIndex].filter === 'magic-color'   ? 'saturate-[1.8] contrast-[1.2] brightness-110' :
                                            images[selectedPageIndex].filter === 'no-shadow'     ? 'contrast-[1.15] brightness-110' : ''
                                        }`}
                                    />
                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                                        Page {selectedPageIndex + 1}
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => applyFilter(images[selectedPageIndex].filter, true)}
                                        className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter transition-colors shadow-lg"
                                    >
                                        Apply All
                                    </motion.button>
                                </div>
                            </div>

                            {/* Controls Area - Highly Compact Grid */}
                            <div className="flex-1 flex flex-col gap-4">
                                {/* Enhancement Filters Grid */}
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Filters</p>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                        {VISION_FILTERS.map((f) => (
                                            <motion.button
                                                key={f.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => applyFilter(f.id)}
                                                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                                    images[selectedPageIndex].filter === f.id
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                }`}
                                            >
                                                <div className={`p-1.5 rounded-lg ${images[selectedPageIndex].filter === f.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                                    {React.cloneElement(f.icon, { className: "w-3 h-3" })}
                                                </div>
                                                <span className="text-[10px] font-black uppercase leading-none truncate">{f.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Smart Formatting Tools */}
                                <div className="mt-auto">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Smart Tools</p>
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleAutoCrop}
                                            disabled={isAutoCropping}
                                            className="flex-1 flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50"
                                        >
                                            <Sparkles className={`w-3.5 h-3.5 ${isAutoCropping ? 'animate-spin' : ''}`} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Auto-Clean</span>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setIsCropModalOpen(true)}
                                            className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl shadow-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-all border border-slate-700 dark:border-slate-600"
                                        >
                                            <Crop className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Manual Crop</span>
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl flex items-center gap-2">
                                    <div className="p-1 bg-emerald-500 rounded-full">
                                        <CheckCircle className="w-2.5 h-2.5 text-white" />
                                    </div>
                                    <p className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">Ready for PDF</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import imageCompression from 'browser-image-compression';
import axios from 'axios';
import {
    UploadCloud, Camera, X, FilePlus, AlertCircle,
    CheckCircle, ChevronLeft, ChevronRight, Save, Trash2, ArrowLeft, Loader2,
    Sparkles, Wand2, Contrast, Hash, Maximize, Sun, Layers, Crop, Palette, Eraser
} from 'lucide-react';
import Webcam from "react-webcam";
import ManualCropModal from '../components/ManualCropModal';
import { autoDetectBoundary } from '../utils/cropUtils';
// pdfjs worker setup
import * as pdfjs from 'pdfjs-dist';
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

// ─────────────────────────────────────────────
// Converts any image (blob/file/dataURL) to a
// clean JPEG Uint8Array via the Canvas API,
// applying vision filters on the way.
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

                // Apply Filters
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
                        // Estimate background via 2-pass box-blur on luminance, then divide.
                        const w = canvas.width, h = canvas.height;
                        const lum = new Float32Array(w * h);
                        for (let i = 0; i < data.length; i += 4) {
                            lum[i >> 2] = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
                        }
                        const radius = Math.max(20, Math.floor(Math.min(w, h) / 20));
                        const blurred = new Float32Array(w * h);
                        for (let y = 0; y < h; y++) {
                            let sum = 0, count = 0;
                            for (let x = 0; x < radius; x++) { sum += lum[y * w + x]; count++; }
                            for (let x = 0; x < w; x++) {
                                if (x + radius < w) { sum += lum[y * w + x + radius]; count++; }
                                if (x - radius - 1 >= 0) { sum -= lum[y * w + x - radius - 1]; count--; }
                                blurred[y * w + x] = sum / count;
                            }
                        }
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
                        const dataSrc = imageData.data;
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
                                            r += dataSrc[srcOff] * wt;
                                            g += dataSrc[srcOff + 1] * wt;
                                            b += dataSrc[srcOff + 2] * wt;
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
                    if (!blob) { reject(new Error('Canvas toBlob failed')); return; }
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(new Uint8Array(reader.result));
                    reader.readAsArrayBuffer(blob);
                }, 'image/jpeg', 0.9);
            } catch (err) { reject(err); }
        };
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.src = src;
    });

// ─────────────────────────────────────────────
// PlusCircle inline SVG (no extra import needed)
// ─────────────────────────────────────────────
const PlusCircle = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

const EditPDF = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [mode, setMode] = useState('edit'); // edit | camera | upload
    const [filename, setFilename] = useState('');
    const [pdfDetails, setPdfDetails] = useState(null);
    const [selectedPageIndex, setSelectedPageIndex] = useState(0);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [isAutoCropping, setIsAutoCropping] = useState(false);

    const VISION_FILTERS = [
        { id: 'none',          label: 'Original',     icon: <Wand2    className="w-4 h-4" /> },
        { id: 'grayscale',     label: 'Black & White', icon: <Layers   className="w-4 h-4" /> },
        { id: 'high-contrast', label: 'High Contrast', icon: <Contrast className="w-4 h-4" /> },
        { id: 'threshold',     label: 'Scanner Look',  icon: <Hash     className="w-4 h-4" /> },
        { id: 'sharpen',       label: 'Sharpen Text',  icon: <Maximize className="w-4 h-4" /> },
        { id: 'brighten',      label: 'Brighten',      icon: <Sun      className="w-4 h-4" /> },
        { id: 'magic-color',   label: 'Magic Color',   icon: <Palette  className="w-4 h-4" /> },
        { id: 'no-shadow',     label: 'No Shadow',     icon: <Eraser   className="w-4 h-4" /> },
    ];

    const fileInputRef = useRef(null);
    const webcamRef    = useRef(null);
    const imagesRef    = useRef([]);

    useEffect(() => { imagesRef.current = images; }, [images]);

    // ── Load PDF and extract pages ──────────────────────
    useEffect(() => {
        const fetchPdf = async () => {
            try {
                setStatus('Loading PDF data…');
                const res = await axios.get(`/api/pdfs/${id}`);
                setPdfDetails(res.data);
                setFilename(res.data.filename);

                const pdfRes = await axios.get(res.data.fileUrl, { responseType: 'arraybuffer' });
                const pdfData = new Uint8Array(pdfRes.data);

                setStatus('Extracting pages…');
                const loadingTask = pdfjs.getDocument({ data: pdfData });
                const pdf = await loadingTask.promise;

                const loadedImages = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width  = viewport.width;
                    await page.render({ canvasContext: context, viewport }).promise;
                    const preview = canvas.toDataURL('image/jpeg', 0.8);
                    loadedImages.push({ id: `page-${i}-${Date.now()}`, preview, filter: 'none' });
                }
                setImages(loadedImages);
                setLoading(false);
                setStatus('');
            } catch (err) {
                console.error(err);
                setError('Failed to load PDF for editing.');
                setLoading(false);
                setStatus('');
            }
        };
        fetchPdf();

        return () => {
            imagesRef.current.forEach(img => {
                if (img.preview?.startsWith('blob:')) URL.revokeObjectURL(img.preview);
            });
        };
    }, [id]);

    // ── Add images ──────────────────────────────────────
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setError('');
        setStatus('Processing images…');
        try {
            const options = { maxSizeMB: 1.0, maxWidthOrHeight: 1920, useWebWorker: false, fileType: 'image/jpeg' };
            const newProcessed = [];
            for (const file of files) {
                const compressed = await imageCompression(file, options);
                const preview = URL.createObjectURL(compressed);
                newProcessed.push({ id: Math.random().toString(36).substr(2, 9), preview, filter: 'none' });
            }
            setImages(prev => [...prev, ...newProcessed]);
            setMode('edit');
        } catch (err) {
            setError('Upload failed: ' + err.message);
        } finally { setStatus(''); }
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImages(prev => [...prev, { id: 'cam-' + Date.now(), preview: imageSrc, filter: 'none' }]);
            setMode('edit');
        }
    }, []);

    const removePage = (imgId) => {
        const img = images.find(i => i.id === imgId);
        if (img?.preview?.startsWith('blob:')) URL.revokeObjectURL(img.preview);
        setImages(images.filter(i => i.id !== imgId));
    };

    const movePage = (index, direction) => {
        const newImages = [...images];
        const target = index + direction;
        if (target < 0 || target >= newImages.length) return;
        [newImages[index], newImages[target]] = [newImages[target], newImages[index]];
        setImages(newImages);
        if (selectedPageIndex === index) setSelectedPageIndex(target);
        else if (selectedPageIndex === target) setSelectedPageIndex(index);
    };

    // ── Filters ─────────────────────────────────────────
    const applyFilter = (filterId, all = false) => {
        setImages(prev => prev.map((img, idx) => {
            if (all || idx === selectedPageIndex) return { ...img, filter: filterId };
            return img;
        }));
    };

    // ── Cropping ─────────────────────────────────────────
    const handleAutoCrop = async () => {
        if (images.length === 0) return;
        setIsAutoCropping(true);
        setStatus('Scanning for document boundaries...');
        try {
            const currentImg = images[selectedPageIndex];
            const croppedPreview = await autoDetectBoundary(currentImg.preview);
            setImages(prev => prev.map((img, idx) =>
                idx === selectedPageIndex ? { ...img, preview: croppedPreview } : img
            ));
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
        setImages(prev => prev.map((img, idx) =>
            idx === selectedPageIndex ? { ...img, preview: newPreview } : img
        ));
        setIsCropModalOpen(false);
        setStatus('Manual crop applied.');
        setTimeout(() => setStatus(''), 2000);
    };

    // ── Save changes ─────────────────────────────────────
    const saveChanges = async () => {
        if (images.length === 0) return setError('PDF cannot be empty');
        setLoading(true);
        setError('');

        try {
            const pdfDoc = await PDFDocument.create();
            const width = 595.28, height = 841.89;

            for (let i = 0; i < images.length; i++) {
                setStatus(`Enhancing and rebuilding page ${i + 1} of ${images.length}…`);
                const bytes    = await toJpegBytes(images[i].preview, images[i].filter);
                const embedded = await pdfDoc.embedJpg(bytes);
                const page     = pdfDoc.addPage([width, height]);
                const scale    = Math.min(width / embedded.width, height / embedded.height);
                page.drawImage(embedded, {
                    x: (width  - embedded.width  * scale) / 2,
                    y: (height - embedded.height * scale) / 2,
                    width:  embedded.width  * scale,
                    height: embedded.height * scale,
                });
            }

            setStatus('Finalizing PDF…');
            const pdfBytes  = await pdfDoc.save();
            const blob      = new Blob([pdfBytes], { type: 'application/pdf' });
            let finalName   = filename.trim() || 'Updated_Document.pdf';
            if (!finalName.toLowerCase().endsWith('.pdf')) finalName += '.pdf';

            const formData = new FormData();
            formData.append('pdfFile',   new File([blob], finalName, { type: 'application/pdf' }));
            formData.append('filename',  finalName);
            formData.append('pageCount', String(images.length));
            formData.append('fileSize',  String(blob.size));

            setStatus('Updating thumbnail…');
            const firstImgRes = await fetch(images[0].preview);
            const thumbBlob   = await firstImgRes.blob();
            formData.append('thumbnail', new File([thumbBlob], 'thumb.jpg', { type: 'image/jpeg' }));

            await axios.put(`/api/pdfs/${id}`, formData);
            setStatus('Done!');
            setTimeout(() => navigate('/dashboard'), 800);
        } catch (err) {
            console.error(err);
            setError('Save failed: ' + err.message);
            setLoading(false);
        }
    };

    // ── CSS filter class helper (live preview via CSS) ──
    const filterClass = (f) =>
        f === 'grayscale'     ? 'grayscale' :
        f === 'high-contrast' ? 'contrast-150 grayscale' :
        f === 'threshold'     ? 'contrast-[200] grayscale' :
        f === 'brighten'      ? 'brightness-125' :
        f === 'sharpen'       ? 'contrast-125 saturate-0' :
        f === 'magic-color'   ? 'saturate-[1.8] contrast-[1.2] brightness-110' :
        f === 'no-shadow'     ? 'contrast-[1.15] brightness-110' : '';

    if (loading && !status) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="mt-4 text-slate-500">Initializing editor…</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-6">
            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit PDF</h1>
                        <p className="text-sm text-slate-500">{pdfDetails?.filename}</p>
                    </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => setMode('upload')} className="flex-1 sm:flex-none btn-secondary">
                        <UploadCloud className="w-4 h-4" /> Add Images
                    </button>
                    <button onClick={() => setMode('camera')} className="flex-1 sm:flex-none btn-secondary">
                        <Camera className="w-4 h-4" /> Scan New
                    </button>
                    <button onClick={saveChanges} disabled={loading} className="flex-1 sm:flex-none btn-primary px-6">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save
                    </button>
                </div>
            </div>

            {/* ── Error / Status Banners ── */}
            {error && (
                <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-xl flex items-center gap-3 border border-rose-100 dark:border-rose-900/30">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
            )}
            {status && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl flex items-center gap-3 border border-blue-100 dark:border-blue-900/30">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 flex-shrink-0" /> {status}
                </div>
            )}

            {/* ── Camera Mode ── */}
            {mode === 'camera' && (
                <div className="bg-black rounded-3xl overflow-hidden relative mb-8 aspect-video max-w-2xl mx-auto border-4 border-slate-800 shadow-2xl">
                    <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" />
                    <button onClick={capture} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                    </button>
                    <button onClick={() => setMode('edit')} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            )}

            {/* ── Upload Mode ── */}
            {mode === 'upload' && (
                <div className="border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center mb-8 bg-slate-50/50 dark:bg-slate-900/30">
                    <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                    <UploadCloud className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Select new images</h3>
                    <p className="text-slate-500 mb-6 text-sm">Add more pages from your files</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => fileInputRef.current?.click()} className="btn-primary"><FilePlus className="w-4 h-4" />Choose Files</button>
                        <button onClick={() => setMode('edit')} className="btn-secondary">Cancel</button>
                    </div>
                </div>
            )}

            {/* ── Main Editor Panel ── */}
            <div className="glass-panel p-4 sm:p-6">
                {/* Document Name */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Document Name</label>
                    <input
                        type="text"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        className="input-field max-w-md"
                        placeholder="Enter filename…"
                    />
                </div>

                {/* Page Grid header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-black">{images.length}</span>
                        Total Pages
                    </h3>
                </div>

                {/* ── Page Grid ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {images.map((img, idx) => (
                        <div key={img.id} className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[3/4] bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300">
                            <img
                                src={img.preview}
                                alt={`Page ${idx + 1}`}
                                className={`w-full h-full object-cover transition-all duration-300 ${filterClass(img.filter)}`}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

                            {/* Page number badge */}
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-800 shadow-sm z-30">
                                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{idx + 1}</span>
                            </div>

                            {/* Filter badge */}
                            {img.filter !== 'none' && (
                                <div className="absolute top-2 right-10 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md z-30 flex items-center gap-1">
                                    <Sparkles className="w-2 h-2" /> ENHANCED
                                </div>
                            )}

                            {/* Click overlay to select */}
                            <div className="absolute inset-0 cursor-pointer z-10" onClick={() => setSelectedPageIndex(idx)} />

                            {/* Selected ring */}
                            {selectedPageIndex === idx && (
                                <div className="absolute inset-0 ring-4 ring-blue-500 ring-inset pointer-events-none z-20" />
                            )}

                            {/* Delete button */}
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 z-40">
                                <button
                                    onClick={(e) => { e.stopPropagation(); removePage(img.id); }}
                                    className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors"
                                    title="Delete Page"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Reorder controls */}
                            <div className="absolute bottom-3 inset-x-3 flex justify-between gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-40">
                                <button
                                    disabled={idx === 0}
                                    onClick={(e) => { e.stopPropagation(); movePage(idx, -1); }}
                                    className="flex-1 h-7 rounded-lg bg-white/95 dark:bg-slate-900/95 shadow-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    disabled={idx === images.length - 1}
                                    onClick={(e) => { e.stopPropagation(); movePage(idx, 1); }}
                                    className="flex-1 h-7 rounded-lg bg-white/95 dark:bg-slate-900/95 shadow-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add More */}
                    <button
                        onClick={() => setMode('upload')}
                        className="rounded-2xl border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 aspect-[3/4] hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                            <PlusCircle className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-blue-600">Add Page</span>
                    </button>
                </div>

                {/* ──────────────────────────────────────────────────────────────
                    VISION LAB — identical layout to CreatePDF's Vision Lab
                    ────────────────────────────────────────────────────────────── */}
                {images.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 premium-typography">
                        {/* Section header */}
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Vision Lab</h3>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            {/* ── Large Preview ── */}
                            <div className="md:w-1/2 lg:w-2/5">
                                <div className="relative group aspect-[4/5] w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
                                    <img
                                        src={images[selectedPageIndex]?.preview}
                                        alt="Current Page"
                                        className={`w-full h-full object-contain p-2 sm:p-4 transition-all duration-300 ${filterClass(images[selectedPageIndex]?.filter)}`}
                                    />
                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                                        Page {selectedPageIndex + 1}
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => applyFilter(images[selectedPageIndex]?.filter, true)}
                                        className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter transition-colors shadow-lg"
                                    >
                                        Apply All
                                    </motion.button>
                                </div>
                            </div>

                            {/* ── Controls ── */}
                            <div className="flex-1 flex flex-col gap-4">
                                {/* Filters grid */}
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
                                                    images[selectedPageIndex]?.filter === f.id
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                }`}
                                            >
                                                <div className={`p-1.5 rounded-lg ${images[selectedPageIndex]?.filter === f.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                                    {React.cloneElement(f.icon, { className: "w-3 h-3" })}
                                                </div>
                                                <span className="text-[10px] font-black uppercase leading-none truncate">{f.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Smart Tools */}
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

                                {/* Ready strip */}
                                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl flex items-center gap-2">
                                    <div className="p-1 bg-emerald-500 rounded-full">
                                        <CheckCircle className="w-2.5 h-2.5 text-white" />
                                    </div>
                                    <p className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">Ready to Save</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Save notice ── */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">Any changes you save will automatically update your PDF library and regenerate the file.</p>
                    </div>
                </div>
            </div>

            {/* ── Manual Crop Modal ── */}
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

export default EditPDF;

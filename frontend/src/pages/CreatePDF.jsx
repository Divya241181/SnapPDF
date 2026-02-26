import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import imageCompression from 'browser-image-compression';
import axios from 'axios';
import { UploadCloud, Camera, X, FilePlus, AlertCircle, CheckCircle } from 'lucide-react';
import Webcam from "react-webcam";

// ─────────────────────────────────────────────
// Converts any image (blob/file/dataURL) to a
// clean JPEG Uint8Array via the Canvas API.
// This handles WebP, HEIC-after-decompress, PNG,
// JPEG etc. — guarantees pdf-lib compatibility.
// ─────────────────────────────────────────────
const toJpegBytes = (src) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            // White background (in case of transparent PNGs)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(async (blob) => {
                if (!blob) return reject(new Error('Canvas toBlob failed'));
                const arrayBuffer = await blob.arrayBuffer();
                resolve(new Uint8Array(arrayBuffer));
            }, 'image/jpeg', 0.92);
        };
        img.onerror = reject;
        // src can be an object URL or a data URI
        img.src = src;
    });

const CreatePDF = () => {
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(''); // progress message
    const [error, setError] = useState('');
    const [mode, setMode] = useState('upload');
    const [filename, setFilename] = useState('New_Document.pdf');

    const fileInputRef = useRef(null);
    const webcamRef = useRef(null);

    // ── Upload handler ─────────────────────────
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setError('');
        setLoading(true);
        setStatus(`Compressing ${files.length} image(s)…`);
        try {
            const options = { maxSizeMB: 1.5, maxWidthOrHeight: 1920, useWebWorker: true, fileType: 'image/jpeg' };
            const processedImages = await Promise.all(
                files.map(async (file) => {
                    const compressed = await imageCompression(file, options);
                    const preview = URL.createObjectURL(compressed);
                    return { id: Date.now() + Math.random(), preview };
                })
            );
            setImages((prev) => [...prev, ...processedImages]);
        } catch (err) {
            setError('Failed to process images: ' + err.message);
        } finally {
            setLoading(false);
            setStatus('');
        }
    };

    // ── Camera capture  ────────────────────────
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImages((prev) => [...prev, { id: Date.now(), preview: imageSrc }]);
        }
    }, []);

    const removeImage = (id) => setImages(images.filter((img) => img.id !== id));

    // ── Generate PDF ───────────────────────────
    const generatePDF = async () => {
        if (images.length === 0) return;
        setError('');
        setLoading(true);

        try {
            const pdfDoc = await PDFDocument.create();
            const A4_W = 595.28, A4_H = 841.89;

            for (let i = 0; i < images.length; i++) {
                setStatus(`Embedding page ${i + 1} of ${images.length}…`);
                const img = images[i];

                // Convert to clean JPEG bytes via canvas – handles any format
                const jpegBytes = await toJpegBytes(img.preview);
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

            setStatus('Saving PDF…');
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const pdfFilename = filename.endsWith('.pdf') ? filename : filename + '.pdf';

            // ── Trigger download locally (always works) ──
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = pdfFilename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(downloadUrl);

            // ── Save metadata to backend ──
            setStatus('Saving to your library…');
            try {
                const file = new File([blob], pdfFilename, { type: 'application/pdf' });
                const formData = new FormData();
                formData.append('pdfFile', file);
                formData.append('filename', pdfFilename);
                formData.append('pageCount', String(images.length));
                formData.append('fileSize', String(blob.size));
                await axios.post('http://localhost:5000/api/pdfs', formData);
            } catch (backendErr) {
                // Don't block the user — PDF already downloaded
                console.warn('Backend save failed (PDF still downloaded):', backendErr.message);
            }

            setStatus('Done!');
            setTimeout(() => navigate('/dashboard'), 800);
        } catch (err) {
            console.error('PDF generation failed:', err);
            setError('PDF generation failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-4 sm:py-8">

            {/* Header + Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Create New PDF</h1>
                    <p className="text-slate-600 mt-1 text-sm sm:text-base">Upload images or use your camera.</p>
                </div>
                <div className="flex w-full sm:w-auto bg-slate-100 p-1 rounded-xl gap-1">
                    <button
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${mode === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        onClick={() => setMode('upload')}
                    >
                        <UploadCloud className="w-4 h-4" /> Upload
                    </button>
                    <button
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${mode === 'camera' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        onClick={() => setMode('camera')}
                    >
                        <Camera className="w-4 h-4" /> Scan
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-4 flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Status Banner */}
            {loading && status && (
                <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm font-medium">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 flex-shrink-0"></div>
                    <span>{status}</span>
                </div>
            )}

            {/* Upload / Camera Panel */}
            <div className="glass-panel p-4 sm:p-6 mb-6">
                {mode === 'upload' ? (
                    <div
                        className="border-2 border-dashed border-blue-300 rounded-xl p-8 sm:p-14 text-center bg-blue-50/50 hover:bg-blue-50 active:bg-blue-100 transition-colors cursor-pointer select-none"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                        <UploadCloud className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">
                            {loading ? 'Processing…' : 'Tap to select images'}
                        </h3>
                        <p className="text-sm text-slate-500">JPG, PNG, WebP — all supported</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-slate-800 bg-black w-full max-w-sm aspect-[3/4]">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                screenshotQuality={0.92}
                                videoConstraints={{ facingMode: "environment" }}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-4 border-2 border-white/30 rounded-lg pointer-events-none" />
                        </div>
                        <button
                            onClick={capture}
                            className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
                            aria-label="Capture photo"
                        >
                            <div className="w-14 h-14 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </button>
                        <p className="text-sm text-slate-500">Tap to capture a page</p>
                    </div>
                )}
            </div>

            {/* Selected Pages */}
            {images.length > 0 && (
                <div className="glass-panel p-4 sm:p-6">
                    <div className="flex flex-col gap-3 mb-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                                    {images.length}
                                </span>
                                Pages Selected
                            </h2>
                            <button
                                onClick={generatePDF}
                                disabled={loading}
                                className="btn-primary py-2 px-4 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading
                                    ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Working…</>
                                    : <><FilePlus className="w-4 h-4" /> Generate &amp; Download</>
                                }
                            </button>
                        </div>
                        <input
                            type="text"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            className="input-field py-2 text-sm"
                            placeholder="Enter PDF filename…"
                        />
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {images.map((img, index) => (
                            <div key={img.id} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-[3/4] bg-slate-100">
                                <img src={img.preview} alt={`Page ${index + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute top-1 left-1 bg-black/60 text-white text-xs font-bold px-1.5 py-0.5 rounded backdrop-blur-md">
                                    {index + 1}
                                </div>
                                <button
                                    onClick={() => removeImage(img.id)}
                                    className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 active:scale-90 transition-all shadow"
                                    aria-label="Remove page"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <p className="mt-4 text-xs text-slate-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        PDF will download automatically, then save to your library.
                    </p>
                </div>
            )}
        </div>
    );
};

export default CreatePDF;

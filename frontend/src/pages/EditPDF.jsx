import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import imageCompression from 'browser-image-compression';
import axios from 'axios';
import {
    UploadCloud, Camera, X, FilePlus, AlertCircle,
    CheckCircle, ChevronLeft, ChevronRight, Save, Trash2, ArrowLeft, Loader2
} from 'lucide-react';
import Webcam from "react-webcam";
// pdfjs worker setup
import * as pdfjs from 'pdfjs-dist';
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const toJpegBytes = (src) =>
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
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Canvas toBlob failed'));
                        return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(new Uint8Array(reader.result));
                    reader.onerror = () => reject(new Error('FileReader failed'));
                    reader.readAsArrayBuffer(blob);
                }, 'image/jpeg', 0.9);
            } catch (err) { reject(err); }
        };
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.src = src;
    });

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

    const fileInputRef = useRef(null);
    const webcamRef = useRef(null);
    const imagesRef = useRef([]);

    useEffect(() => {
        imagesRef.current = images;
    }, [images]);

    useEffect(() => {
        const fetchPdf = async () => {
            try {
                setStatus('Loading PDF data…');
                const res = await axios.get(`/api/pdfs/${id}`);
                setPdfDetails(res.data);
                setFilename(res.data.filename);

                // Fetch the actual PDF file to extract pages
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
                    canvas.width = viewport.width;

                    await page.render({ canvasContext: context, viewport }).promise;
                    const preview = canvas.toDataURL('image/jpeg', 0.8);
                    loadedImages.push({ id: `page-${i}-${Date.now()}`, preview });
                }
                setImages(loadedImages);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load PDF for editing.');
                setLoading(false);
            }
        };
        fetchPdf();

        return () => {
            imagesRef.current.forEach(img => {
                if (img.preview?.startsWith('blob:')) URL.revokeObjectURL(img.preview);
            });
        };
    }, [id]);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setError('');
        setStatus(`Processing images…`);

        try {
            const options = { maxSizeMB: 1.0, maxWidthOrHeight: 1920, useWebWorker: false, fileType: 'image/jpeg' };
            const newProcessed = [];
            for (let file of files) {
                const compressed = await imageCompression(file, options);
                const preview = URL.createObjectURL(compressed);
                newProcessed.push({ id: Math.random().toString(36).substr(2, 9), preview });
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
            setImages(prev => [...prev, { id: 'cam-' + Date.now(), preview: imageSrc }]);
            setMode('edit');
        }
    }, []);

    const removePage = (id) => {
        const img = images.find(i => i.id === id);
        if (img?.preview?.startsWith('blob:')) URL.revokeObjectURL(img.preview);
        setImages(images.filter(i => i.id !== id));
    };

    const movePage = (index, direction) => {
        const newImages = [...images];
        const target = index + direction;
        if (target < 0 || target >= newImages.length) return;
        [newImages[index], newImages[target]] = [newImages[target], newImages[index]];
        setImages(newImages);
    };

    const saveChanges = async () => {
        if (images.length === 0) return setError('PDF cannot be empty');
        setLoading(true);
        setError('');

        try {
            const pdfDoc = await PDFDocument.create();
            const width = 595.28, height = 841.89;

            for (let i = 0; i < images.length; i++) {
                setStatus(`Rebuilding page ${i + 1} of ${images.length}…`);
                const bytes = await toJpegBytes(images[i].preview);
                const embedded = await pdfDoc.embedJpg(bytes);
                const page = pdfDoc.addPage([width, height]);
                const scale = Math.min(width / embedded.width, height / embedded.height);
                page.drawImage(embedded, {
                    x: (width - embedded.width * scale) / 2,
                    y: (height - embedded.height * scale) / 2,
                    width: embedded.width * scale,
                    height: embedded.height * scale,
                });
            }

            setStatus('Finalizing PDF…');
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            let finalName = filename.trim() || 'Updated_Document.pdf';
            if (!finalName.toLowerCase().endsWith('.pdf')) finalName += '.pdf';

            const formData = new FormData();
            formData.append('pdfFile', new File([blob], finalName, { type: 'application/pdf' }));
            formData.append('filename', finalName);
            formData.append('pageCount', String(images.length));
            formData.append('fileSize', String(blob.size));

            // Generate new thumbnail
            setStatus('Updating thumbnail…');
            const firstImgRes = await fetch(images[0].preview);
            const thumbBlob = await firstImgRes.blob();
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

    if (loading && !status) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="mt-4 text-slate-500">Initializing editor…</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-6">
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

            {error && <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-xl flex items-center gap-3 border border-rose-100 dark:border-rose-900/30">
                <AlertCircle className="w-5 h-5" /> {error}
            </div>}

            {status && <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl flex items-center gap-3 border border-blue-100 dark:border-blue-900/30">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" /> {status}
            </div>}

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

            {mode === 'upload' && (
                <div className="border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center mb-8 bg-slate-50/50 dark:bg-slate-900/30">
                    <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                    <UploadCloud className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Select new images</h3>
                    <p className="text-slate-500 mb-6 text-sm">Add more pages from your files</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => fileInputRef.current?.click()} className="btn-primary">Choose Files</button>
                        <button onClick={() => setMode('edit')} className="btn-secondary">Cancel</button>
                    </div>
                </div>
            )}

            <div className="glass-panel p-6">
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

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">{images.length}</span>
                        Total Pages
                    </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {images.map((img, idx) => (
                        <div key={img.id} className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[3/4] bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300">
                            <img src={img.preview} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-800 shadow-sm">
                                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{idx + 1}</span>
                            </div>

                            {/* Actions */}
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                <button
                                    onClick={() => removePage(img.id)}
                                    className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors"
                                    title="Delete Page"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="absolute bottom-4 inset-x-4 flex justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0">
                                <button
                                    disabled={idx === 0}
                                    onClick={() => movePage(idx, -1)}
                                    className="flex-1 h-8 rounded-lg bg-white/95 dark:bg-slate-900/95 shadow-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    disabled={idx === images.length - 1}
                                    onClick={() => movePage(idx, 1)}
                                    className="flex-1 h-8 rounded-lg bg-white/95 dark:bg-slate-900/95 shadow-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add More Button */}
                    <button
                        onClick={() => setMode('upload')}
                        className="rounded-2xl border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                            <PlusCircle className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-blue-600">Add Page</span>
                    </button>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                        <CheckCircle className="w-5 h-5" />
                        <p className="text-sm font-medium">Any changes you save will automatically update your PDF library and regenerate the file.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Re-importing missing icons
const PlusCircle = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
);

export default EditPDF;

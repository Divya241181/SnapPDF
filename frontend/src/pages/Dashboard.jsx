import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { FileText, Download, Trash2, Eye, Plus, Search, Share2, Edit2 } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuthStore();
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedPdfId, setSelectedPdfId] = useState(null); // ← which card is selected

    // Deselect when clicking outside any card
    const gridRef = useRef(null);
    const clickTimerRef = useRef(null); // for single vs double click
    const handleOutsideClick = useCallback((e) => {
        if (gridRef.current && !gridRef.current.contains(e.target)) {
            setSelectedPdfId(null);
        }
    }, []);
    useEffect(() => {
        document.addEventListener('pointerdown', handleOutsideClick);
        return () => document.removeEventListener('pointerdown', handleOutsideClick);
    }, [handleOutsideClick]);

    // ── URL helper — handles both Cloudinary (https) and legacy /uploads paths ─
    const getFullUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${axios.defaults.baseURL}${url}`;
    };

    // Single click = select/deselect  |  Double click/tap = open PDF in new tab
    const handleCardClick = useCallback((pdf, e) => {
        if (e.detail === 2) {
            // Double click / double tap
            clearTimeout(clickTimerRef.current);
            const url = getFullUrl(pdf.fileUrl);
            if (url) window.open(url, '_blank', 'noopener,noreferrer');
            return;
        }
        // Single click — short timer so it doesn't race with double click
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = setTimeout(() => {
            setSelectedPdfId(prev => prev === pdf._id ? null : pdf._id);
        }, 220);
    }, []);

    const fetchPdfs = async () => {
        try {
            const res = await axios.get('/api/pdfs');
            setPdfs(res.data);
        } catch {
            console.error('Fetch failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPdfs(); }, []);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this PDF?')) {
            try {
                await axios.delete(`/api/pdfs/${id}`);
                setPdfs(pdfs.filter(pdf => pdf._id !== id));
                setSelectedPdfId(null);
            } catch {
                console.error('Delete failed');
            }
        }
    };

    const handleShare = async (pdf, e) => {
        e.stopPropagation();
        const fullUrl = getFullUrl(pdf.fileUrl);
        const shareData = {
            title: pdf.filename,
            text: `Check out this PDF: ${pdf.filename}`,
            url: fullUrl,
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try { await navigator.share(shareData); return; }
            catch (err) { if (err.name !== 'AbortError') console.error('Share failed:', err); else return; }
        }

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(fullUrl);
                alert('Share link copied! 📋');
            } else {
                const ta = document.createElement('textarea');
                ta.value = fullUrl;
                ta.style.cssText = 'position:fixed;left:-9999px;top:0';
                document.body.appendChild(ta);
                ta.focus(); ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                alert('Link copied to clipboard! 📋');
            }
        } catch { prompt('Copy this link to share:', fullUrl); }
    };

    const filteredPdfs = pdfs.filter(pdf =>
        pdf.filename.toLowerCase().includes(search.toLowerCase())
    );

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <div className="py-4 sm:py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white transition-colors">Welcome, {user?.username} 👋</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-xs sm:text-sm">Manage all your generated PDFs here.</p>
                </div>
                <Link to="/create" className="btn-primary w-full sm:w-auto justify-center py-2 text-sm">
                    <Plus className="w-5 h-5" /> Create New PDF
                </Link>
            </div>

            <div className="glass-panel p-2.5 sm:p-5 transition-colors">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-4 sm:mb-6 gap-3">
                    <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                        <FileText className="text-blue-500 w-5 h-5" /> My Documents
                    </h2>
                    <div className="relative w-full sm:w-60">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search PDFs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white text-xs sm:text-sm transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : filteredPdfs.length === 0 ? (
                    <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                        <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No PDFs found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                            {search ? 'Try adjusting your search.' : "You haven't created any PDFs yet. Get started now!"}
                        </p>
                        {!search && (
                            <Link to="/create" className="btn-primary inline-flex">
                                <Plus className="w-4 h-4" /> Create First PDF
                            </Link>
                        )}
                    </div>
                ) : (
                    <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                        {filteredPdfs.map(pdf => {
                            const isSelected = selectedPdfId === pdf._id;
                            return (
                                <div
                                    key={pdf._id}
                                    onClick={(e) => handleCardClick(pdf, e)}
                                    className={`relative rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 cursor-pointer select-none
                                        ${isSelected
                                            ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]'
                                            : 'border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700'
                                        }`}
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-square sm:aspect-[4/3] bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden group/thumb">
                                        {pdf.thumbnailUrl ? (
                                            <>
                                                <img
                                                    src={getFullUrl(pdf.thumbnailUrl)}
                                                    alt={pdf.filename}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                                                />
                                                {/* Open overlay — only when NOT selected */}
                                                {!isSelected && (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity bg-black/10">
                                                        <div className="bg-white/90 dark:bg-slate-900/90 p-2 rounded-full shadow-lg">
                                                            <Eye className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-slate-300 dark:text-slate-600" />
                                                <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">No Preview</span>
                                            </div>
                                        )}

                                        {/* Page count badge */}
                                        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-1 pointer-events-none">
                                            <FileText className="w-2.5 h-2.5 text-blue-500" />
                                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 dark:text-slate-300">{pdf.pageCount} pg</span>
                                        </div>

                                        {/* Selection tick */}
                                        {isSelected && (
                                            <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                        {/* Double-tap hint overlay when selected */}
                                        {isSelected && (
                                            <div className="absolute inset-0 flex items-end justify-center pb-2 pointer-events-none">
                                                <span className="text-[9px] font-semibold text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                                                    Double-tap to open
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info section */}
                                    <div className="p-2 sm:p-3 border-t border-slate-100 dark:border-slate-800">
                                        <h4 className="font-semibold text-slate-900 dark:text-white truncate text-xs sm:text-sm" title={pdf.filename}>
                                            {pdf.filename}
                                        </h4>
                                        <div className="flex justify-between items-center text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            <span className="truncate mr-1">{new Date(pdf.createdAt).toLocaleDateString()}</span>
                                            <span className="shrink-0">{pdf.pageCount} pg • {formatBytes(pdf.fileSize)}</span>
                                        </div>

                                        {/* ── Action buttons — slide in only when selected ── */}
                                        <div
                                            className="overflow-hidden transition-all duration-300 ease-in-out"
                                            style={{
                                                maxHeight: isSelected ? '56px' : '0px',
                                                opacity: isSelected ? 1 : 0,
                                                marginTop: isSelected ? '8px' : '0px',
                                            }}
                                        >
                                            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                                {/* Open / View */}
                                                <a
                                                    href={getFullUrl(pdf.fileUrl)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={e => e.stopPropagation()}
                                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] sm:text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm active:scale-95"
                                                    title="Open PDF"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Save</span>
                                                </a>
                                                {/* Edit */}
                                                <Link
                                                    to={`/edit/${pdf._id}`}
                                                    onClick={e => e.stopPropagation()}
                                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all"
                                                    title="Edit PDF"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </Link>
                                                {/* Share */}
                                                <button
                                                    onClick={(e) => handleShare(pdf, e)}
                                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all"
                                                    title="Share"
                                                >
                                                    <Share2 className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Share</span>
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    onClick={(e) => handleDelete(pdf._id, e)}
                                                    className="flex items-center justify-center p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { FileText, Download, Trash2, Eye, Plus, Search, Share2, Edit2 } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuthStore();
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this PDF?')) {
            try {
                await axios.delete(`/api/pdfs/${id}`);
                setPdfs(pdfs.filter(pdf => pdf._id !== id));
            } catch {
                console.error('Delete failed');
            }
        }
    };

    const handleShare = async (pdf) => {
        const baseUrl = axios.defaults.baseURL;
        const fullUrl = `${baseUrl}${pdf.fileUrl}`;

        const shareData = {
            title: pdf.filename,
            text: `Check out this PDF: ${pdf.filename}`,
            url: fullUrl,
        };

        // Try Native Share (Requires HTTPS/Localhost)
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                if (err.name !== 'AbortError') console.error('Share failed:', err);
                else return; // User cancelled
            }
        }

        // Fallback for HTTP/Local Network testing
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(fullUrl);
                alert('Success! Share link copied. 📋\n\nNote: Native mobile sharing usually requires a secure (HTTPS) connection.');
            } else {
                // Secondary Fallback for insecure contexts (HTTP mobile)
                const textArea = document.createElement("textarea");
                textArea.value = fullUrl;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    alert('Link copied to clipboard! 📋');
                } else {
                    prompt('Sharing link (Manual Copy):', fullUrl);
                }
            }
        } catch {
            prompt('Copy this link to share:', fullUrl);
        }
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
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                        {filteredPdfs.map(pdf => (
                            <div key={pdf._id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300">
                                {/* Thumbnail / PDF Preview Container */}
                                <a
                                    href={`${axios.defaults.baseURL}${pdf.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="aspect-square sm:aspect-[4/3] bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden group/thumb cursor-pointer block"
                                >
                                    {pdf.thumbnailUrl ? (
                                        <>
                                            <img
                                                src={`${axios.defaults.baseURL}${pdf.thumbnailUrl}`}
                                                alt={pdf.filename}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/10 transition-colors" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                                <div className="bg-white/90 dark:bg-slate-900/90 p-2 rounded-full shadow-lg">
                                                    <Eye className="w-5 h-5 text-blue-600" />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-slate-300 dark:text-slate-600" />
                                            <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">No Preview</span>
                                        </div>
                                    )}

                                    {/* Page Count Badge */}
                                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-1 sm:gap-1.5 transition-transform group-hover/thumb:-translate-y-1">
                                        <FileText className="w-2.5 h-2.5 sm:w-3 h-3 text-blue-500" />
                                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 dark:text-slate-300">{pdf.pageCount} pg</span>
                                    </div>
                                </a>

                                {/* Info */}
                                <div className="p-2 sm:p-3 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="font-semibold text-slate-900 dark:text-white truncate mb-0.5 sm:mb-1 text-xs sm:text-sm" title={pdf.filename}>
                                        {pdf.filename}
                                    </h4>
                                    <div className="flex justify-between items-center text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-2 sm:mb-3">
                                        <span className="truncate mr-1">{new Date(pdf.createdAt).toLocaleDateString()}</span>
                                        <span className="shrink-0">{pdf.pageCount} pg • {formatBytes(pdf.fileSize)}</span>
                                    </div>

                                    {/* Actions — optimized for mobile */}
                                    <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-2.5 sm:pt-3">
                                        <a
                                            href={`${axios.defaults.baseURL}${pdf.fileUrl}`}
                                            download
                                            className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] sm:text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm active:scale-95"
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Save</span>
                                        </a>
                                        <Link
                                            to={`/edit/${pdf._id}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all border border-transparent hover:border-blue-500/30"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" /> <span className="hidden sm:inline">Edit</span>
                                        </Link>
                                        <button
                                            onClick={() => handleShare(pdf)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all border border-transparent hover:border-blue-500/30"
                                            title="Share"
                                        >
                                            <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Share</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(pdf._id)}
                                            className="flex items-center justify-center p-2 text-rose-500 dark:text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors ml-1"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { FileText, Download, Trash2, Eye, Plus, Search } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuthStore();
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchPdfs = async () => {
        try {
            const res = await axios.get('/api/pdfs');
            setPdfs(res.data);
        } catch (err) {
            console.error(err);
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
            } catch (err) {
                console.error(err);
            }
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome, {user?.username} 👋</h1>
                    <p className="text-slate-600 mt-1 text-sm sm:text-base">Manage all your generated PDFs here.</p>
                </div>
                <Link to="/create" className="btn-primary w-full sm:w-auto justify-center">
                    <Plus className="w-5 h-5" /> Create New PDF
                </Link>
            </div>

            <div className="glass-panel p-4 sm:p-6">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-3">
                    <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        <FileText className="text-blue-500 w-5 h-5" /> My Documents
                    </h2>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search PDFs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : filteredPdfs.length === 0 ? (
                    <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No PDFs found</h3>
                        <p className="text-slate-500 mb-6 text-sm">
                            {search ? 'Try adjusting your search.' : "You haven't created any PDFs yet. Get started now!"}
                        </p>
                        {!search && (
                            <Link to="/create" className="btn-primary inline-flex">
                                <Plus className="w-4 h-4" /> Create First PDF
                            </Link>
                        )}
                    </div>
                ) : (
                    /* Mobile: 1 col list cards. sm: 2 col. lg: 3 col. xl: 4 col */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredPdfs.map(pdf => (
                            <div key={pdf._id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                                {/* Thumbnail */}
                                <div className="h-36 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                                    {pdf.thumbnailUrl ? (
                                        <img src={`${axios.defaults.baseURL}${pdf.thumbnailUrl}`} alt={pdf.filename} className="w-full h-full object-cover" />
                                    ) : (
                                        <FileText className="w-14 h-14 text-slate-300" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-3 border-t border-slate-100">
                                    <h4 className="font-semibold text-slate-900 truncate mb-1 text-sm" title={pdf.filename}>
                                        {pdf.filename}
                                    </h4>
                                    <div className="flex justify-between items-center text-xs text-slate-500 mb-3">
                                        <span>{new Date(pdf.createdAt).toLocaleDateString()}</span>
                                        <span>{formatBytes(pdf.fileSize)} · {pdf.pageCount} pg</span>
                                    </div>

                                    {/* Actions — always visible (mobile-friendly) */}
                                    <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                                        <a
                                            href={`${axios.defaults.baseURL}${pdf.fileUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                            title="View"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> View
                                        </a>
                                        <a
                                            href={`${axios.defaults.baseURL}${pdf.fileUrl}`}
                                            download
                                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                            title="Download"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Download
                                        </a>
                                        <button
                                            onClick={() => handleDelete(pdf._id)}
                                            className="flex items-center justify-center p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

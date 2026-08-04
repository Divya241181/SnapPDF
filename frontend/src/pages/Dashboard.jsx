import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { FileText, Download, Trash2, Plus, Search, Share2, Edit2, FilePlus, LayoutGrid, Clock } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuthStore();
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedPdfId, setSelectedPdfId] = useState(null);

    // Deselect when clicking outside any card
    const gridRef = useRef(null);
    const clickTimerRef = useRef(null);
    const handleOutsideClick = useCallback((e) => {
        if (gridRef.current && !gridRef.current.contains(e.target)) {
            setSelectedPdfId(null);
        }
    }, []);
    useEffect(() => {
        document.addEventListener('pointerdown', handleOutsideClick);
        return () => document.removeEventListener('pointerdown', handleOutsideClick);
    }, [handleOutsideClick]);

    // URL helper
    const getFullUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${axios.defaults.baseURL}${url}`;
    };

    // Single click = select/deselect | Double click = open PDF
    const handleCardClick = useCallback((pdf, e) => {
        if (e.detail === 2) {
            clearTimeout(clickTimerRef.current);
            const url = getFullUrl(pdf.fileUrl);
            if (url) window.open(url, '_blank', 'noopener,noreferrer');
            return;
        }
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
        const shareData = { title: pdf.filename, text: `Check out this PDF: ${pdf.filename}`, url: fullUrl };
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

    const handleDownload = async (pdf, e) => {
        e.stopPropagation();
        const url = getFullUrl(pdf.fileUrl);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = pdf.filename.toLowerCase().endsWith('.pdf') ? pdf.filename : `${pdf.filename}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const filteredPdfs = pdfs.filter(pdf =>
        pdf.filename.toLowerCase().includes(search.toLowerCase())
    );

    const formatBytes = (bytes, decimals = 1) => {
        if (!+bytes) return '0 B';
        const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const totalPages = pdfs.reduce((sum, p) => sum + (p.pageCount || 0), 0);
    const totalSize = pdfs.reduce((sum, p) => sum + (p.fileSize || 0), 0);

    // ─── Greeting based on time of day ───────────────────────────────────────────
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="pb-8">

            {/* ── Welcome Header ────────────────────────────── */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                justifyContent: 'space-between', gap: 16, marginBottom: 24,
            }}>
                <div>
                    <span className="app-eyebrow" style={{ display: 'block', marginBottom: 4 }}>
                        {greeting}
                    </span>
                    <h1 style={{
                        fontSize: 'clamp(22px,4vw,30px)', fontWeight: 700,
                        color: 'var(--app-text)', letterSpacing: '-0.03em', lineHeight: 1.1,
                    }}>
                        {user?.username || 'Welcome back'}
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--app-text-muted)', marginTop: 4 }}>
                        Manage all your generated PDFs here.
                    </p>
                </div>
                <Link
                    to="/create"
                    className="btn-primary"
                    style={{ fontSize: 13, textDecoration: 'none' }}
                >
                    <Plus style={{ width: 16, height: 16 }} />
                    Create New PDF
                </Link>
            </div>

            {/* ── Stats Row ─────────────────────────────────── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12, marginBottom: 24,
            }}>
                {[
                    { Icon: LayoutGrid, label: 'Total PDFs',   value: pdfs.length,        color: 'var(--app-primary)'  },
                    { Icon: FileText,   label: 'Total Pages',  value: totalPages,           color: 'var(--app-accent)'   },
                    { Icon: Clock,      label: 'Storage Used', value: formatBytes(totalSize), color: 'var(--app-success)' },
                ].map(({ Icon, label, value, color }) => (
                    <div key={label} className="glass-panel" style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 'var(--app-radius-sm)',
                                background: `color-mix(in srgb, ${color} 12%, transparent)`,
                                display: 'grid', placeItems: 'center', flexShrink: 0,
                            }}>
                                <Icon style={{ width: 16, height: 16, color }} />
                            </div>
                            <div>
                                <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--app-text)', lineHeight: 1 }}>
                                    {loading ? '—' : value}
                                </p>
                                <p style={{ fontSize: 11, color: 'var(--app-text-faint)', marginTop: 2 }}>{label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Documents Panel ───────────────────────────── */}
            <div className="glass-panel" style={{ padding: '16px 16px 20px' }}>

                {/* Toolbar */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                    justifyContent: 'space-between', gap: 12, marginBottom: 20,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: 'var(--app-radius-sm)',
                            background: 'linear-gradient(135deg, var(--app-primary-soft), var(--app-accent-soft))',
                            display: 'grid', placeItems: 'center',
                        }}>
                            <FileText style={{ width: 13, height: 13, color: 'var(--app-primary)' }} />
                        </div>
                        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.01em' }}>
                            My Documents
                        </h2>
                        {!loading && pdfs.length > 0 && (
                            <span style={{
                                fontSize: 11, fontWeight: 700, color: 'var(--app-primary)',
                                background: 'var(--app-primary-soft)',
                                padding: '2px 8px', borderRadius: 100,
                            }}>{pdfs.length}</span>
                        )}
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative', width: '100%', maxWidth: 240 }}>
                        <Search style={{
                            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                            width: 14, height: 14, color: 'var(--app-text-faint)', pointerEvents: 'none',
                        }} />
                        <input
                            type="text"
                            placeholder="Search PDFs…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="input-field"
                            style={{ paddingLeft: 32, fontSize: 12, height: 36 }}
                        />
                    </div>
                </div>

                {/* ── Content states ── */}
                {loading ? (
                    /* Loading spinner */
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                        <div
                            className="animate-spin"
                            style={{
                                width: 36, height: 36, borderRadius: '50%',
                                border: '3px solid var(--app-border-strong)',
                                borderTopColor: 'var(--app-primary)',
                            }}
                        />
                    </div>
                ) : filteredPdfs.length === 0 ? (
                    /* Empty state */
                    <div style={{
                        textAlign: 'center', padding: '52px 24px',
                        border: '2px dashed var(--app-border-strong)',
                        borderRadius: 'var(--app-radius)', background: 'var(--app-bg-elevated)',
                    }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: 'var(--app-radius-lg)',
                            background: 'linear-gradient(135deg, var(--app-primary-soft), var(--app-accent-soft))',
                            border: '1px solid var(--app-border-strong)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px auto',
                        }}>
                            <FilePlus style={{ width: 30, height: 30, color: 'var(--app-primary)' }} />
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--app-text)', marginBottom: 6 }}>
                            {search ? 'No results found' : 'No PDFs yet'}
                        </h3>
                        <p style={{ fontSize: 13, color: 'var(--app-text-muted)', marginBottom: 24 }}>
                            {search
                                ? `No documents match "${search}". Try a different keyword.`
                                : "You haven't created any PDFs yet. Get started now!"
                            }
                        </p>
                        {!search && (
                            <Link
                                to="/create"
                                className="btn-primary"
                                style={{ textDecoration: 'none', display: 'inline-flex', margin: '0 auto' }}
                            >
                                <Plus style={{ width: 15, height: 15 }} /> Create First PDF
                            </Link>
                        )}
                    </div>
                ) : (
                    /* PDF Grid */
                    <div
                        ref={gridRef}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
                            gap: 14,
                        }}
                    >
                        {filteredPdfs.map(pdf => {
                            const isSelected = selectedPdfId === pdf._id;
                            return (
                                <div
                                    key={pdf._id}
                                    onClick={e => handleCardClick(pdf, e)}
                                    style={{
                                        position: 'relative', borderRadius: 'var(--app-radius)',
                                        overflow: 'hidden', cursor: 'pointer', userSelect: 'none',
                                        background: 'var(--app-bg-elevated)',
                                        border: `1.5px solid ${isSelected ? 'var(--app-primary)' : 'var(--app-border-strong)'}`,
                                        boxShadow: isSelected
                                            ? '0 0 0 3px var(--app-primary-soft), var(--app-shadow)'
                                            : 'var(--app-shadow-sm)',
                                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                        transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <div style={{
                                        aspectRatio: '3/4', background: '#09090f',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        position: 'relative', overflow: 'hidden',
                                    }}>
                                        {pdf.thumbnailUrl ? (
                                            <img
                                                src={getFullUrl(pdf.thumbnailUrl)}
                                                alt={pdf.filename}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                            />
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                                <FileText style={{ width: 32, height: 32, color: 'var(--app-text-faint)' }} />
                                                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--app-text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No Preview</span>
                                            </div>
                                        )}

                                        {/* Page count badge */}
                                        <div style={{
                                            position: 'absolute', top: 8, right: 8,
                                            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
                                            color: '#fff', fontSize: 9, fontWeight: 700,
                                            padding: '3px 7px', borderRadius: 100,
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            pointerEvents: 'none',
                                        }}>
                                            <FileText style={{ width: 9, height: 9 }} />
                                            {pdf.pageCount}p
                                        </div>

                                        {/* Selection tick */}
                                        {isSelected && (
                                            <div style={{
                                                position: 'absolute', top: 8, left: 8,
                                                width: 20, height: 20, borderRadius: '50%',
                                                background: 'var(--app-primary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 2px 8px var(--app-primary-glow)',
                                            }}>
                                                <svg style={{ width: 10, height: 10 }} fill="none" stroke="#fff" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Double-tap hint */}
                                        {isSelected && (
                                            <div style={{
                                                position: 'absolute', bottom: 6, left: 0, right: 0,
                                                display: 'flex', justifyContent: 'center',
                                                pointerEvents: 'none',
                                            }}>
                                                <span style={{
                                                    fontSize: 9, fontWeight: 600, color: '#fff',
                                                    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                                                    padding: '2px 8px', borderRadius: 100,
                                                }}>
                                                    Double-tap to open
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info row */}
                                    <div style={{
                                        padding: '10px 10px 8px',
                                        borderTop: '1px solid var(--app-border)',
                                    }}>
                                        <h4 style={{
                                            fontSize: 12, fontWeight: 600,
                                            color: 'var(--app-text)', overflow: 'hidden',
                                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            marginBottom: 3,
                                        }} title={pdf.filename}>
                                            {pdf.filename}
                                        </h4>
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            fontSize: 10, color: 'var(--app-text-faint)',
                                        }}>
                                            <span>{new Date(pdf.createdAt).toLocaleDateString()}</span>
                                            <span>{formatBytes(pdf.fileSize)}</span>
                                        </div>

                                        {/* Action buttons — expand when selected */}
                                        <div style={{
                                            overflow: 'hidden', transition: 'all 0.28s cubic-bezier(0.16,1,0.3,1)',
                                            maxHeight: isSelected ? 52 : 0,
                                            opacity: isSelected ? 1 : 0,
                                            marginTop: isSelected ? 10 : 0,
                                        }}>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: 5,
                                                paddingTop: 8,
                                                borderTop: '1px solid var(--app-border)',
                                            }}>
                                                {/* Download */}
                                                <button
                                                    onClick={e => handleDownload(pdf, e)}
                                                    title="Download PDF"
                                                    style={{
                                                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                                                        padding: '6px 4px', borderRadius: 'var(--app-radius-sm)', border: 'none',
                                                        background: 'linear-gradient(135deg, var(--app-primary), var(--app-accent))',
                                                        color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                                                        boxShadow: '0 2px 8px var(--app-primary-glow)',
                                                    }}
                                                >
                                                    <Download style={{ width: 11, height: 11 }} />
                                                    <span className="hidden sm:inline">Save</span>
                                                </button>
                                                {/* Edit */}
                                                <Link
                                                    to={`/edit/${pdf._id}`}
                                                    onClick={e => e.stopPropagation()}
                                                    title="Edit PDF"
                                                    style={{
                                                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                                                        padding: '6px 4px', borderRadius: 'var(--app-radius-sm)',
                                                        background: 'var(--app-bg-elevated)', border: '1px solid var(--app-border-strong)',
                                                        color: 'var(--app-text-muted)', fontSize: 10, fontWeight: 700,
                                                        textDecoration: 'none', cursor: 'pointer',
                                                    }}
                                                >
                                                    <Edit2 style={{ width: 11, height: 11 }} />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </Link>
                                                {/* Share */}
                                                <button
                                                    onClick={e => handleShare(pdf, e)}
                                                    title="Share"
                                                    style={{
                                                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                                                        padding: '6px 4px', borderRadius: 'var(--app-radius-sm)', border: 'none',
                                                        background: 'var(--app-bg-elevated)', border: '1px solid var(--app-border-strong)',
                                                        color: 'var(--app-text-muted)', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                                                    }}
                                                >
                                                    <Share2 style={{ width: 11, height: 11 }} />
                                                    <span className="hidden sm:inline">Share</span>
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    onClick={e => handleDelete(pdf._id, e)}
                                                    title="Delete"
                                                    style={{
                                                        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        borderRadius: 'var(--app-radius-sm)', border: 'none',
                                                        background: 'var(--app-danger-soft)', color: 'var(--app-danger)', cursor: 'pointer',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <Trash2 style={{ width: 11, height: 11 }} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* "Create new" tile at the end of the grid */}
                        <Link
                            to="/create"
                            style={{
                                borderRadius: 'var(--app-radius)', aspectRatio: '3/4',
                                border: '2px dashed var(--app-border-strong)',
                                background: 'var(--app-bg-elevated)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                gap: 8, textDecoration: 'none', color: 'var(--app-text-faint)',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--app-primary)'; e.currentTarget.style.color = 'var(--app-primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--app-border-strong)'; e.currentTarget.style.color = 'var(--app-text-faint)'; }}
                        >
                            <FilePlus style={{ width: 24, height: 24 }} />
                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>New PDF</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

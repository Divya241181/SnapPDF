import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Globe, Cpu, Users, ArrowRight, BarChart3, CheckCircle2, Target, Rocket, LayoutDashboard, FilePlus, ChevronLeft, ChevronRight } from 'lucide-react';
import useAuthStore from '../store/authStore';

/* ============================================================
   KEY FEATURES — Mobile Horizontal Scroll Carousel
   Special effects:
   · Per-card scroll-driven opacity (0.4 → 1) + scale (0.88 → 1)
   · Neon top-border that shifts colour per card
   · Animated radial glow orb tracks the active card
   · Smooth fill-progress bar + live counter badge
   · Prev / Next buttons with ripple disabled state
   ============================================================ */
const featureCards = [
    {
        icon: <Zap className="w-7 h-7" />,
        title: 'Real-time Capture',
        desc: 'Proprietary camera algorithms optimize image clarity for text-heavy documents.',
        glow: 'rgba(37,99,235,0.55)',        // blue
        border: '#2563eb',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        label: 'Speed',
    },
    {
        icon: <ShieldCheck className="w-7 h-7" />,
        title: 'Secure Encryption',
        desc: 'All files are encrypted at rest and in transit, ensuring your data remains private.',
        glow: 'rgba(124,58,237,0.55)',       // violet
        border: '#7c3aed',
        iconBg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
        label: 'Security',
    },
    {
        icon: <Globe className="w-7 h-7" />,
        title: 'LAN Sync',
        desc: 'Advanced network protocols allow for cross-device synchronization without cloud delays.',
        glow: 'rgba(6,182,212,0.55)',        // cyan
        border: '#06b6d4',
        iconBg: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
        label: 'Network',
    },
    {
        icon: <Cpu className="w-7 h-7" />,
        title: 'Smart Compression',
        desc: 'Generate compact PDFs that maintain 100% legibility for professional use.',
        glow: 'rgba(5,150,105,0.55)',        // emerald
        border: '#059669',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        label: 'Efficiency',
    },
];

const FeaturesCarousel = () => {
    const trackRef = useRef(null);
    const [activeIdx, setActiveIdx] = useState(0);
    const TOTAL = featureCards.length;
    const [cardStyles, setCardStyles] = useState(
        featureCards.map((_, i) => ({ opacity: i === 0 ? 1 : 0.4, scale: i === 0 ? 1 : 0.88 }))
    );

    const onScroll = useCallback(() => {
        const el = trackRef.current;
        if (!el || el.scrollWidth === 0) return;
        const cardW = el.scrollWidth / TOTAL;
        const scrollX = el.scrollLeft;
        const maxScroll = el.scrollWidth - el.clientWidth; // eslint-disable-line no-unused-vars

        // Per-card opacity + scale
        const styles = featureCards.map((_, i) => {
            const cardCenter = cardW * i + cardW / 2;
            const viewCenter = scrollX + el.clientWidth / 2;
            const dist = Math.abs(viewCenter - cardCenter);
            const ratio = Math.max(0, 1 - dist / cardW);
            return {
                opacity: 0.4 + ratio * 0.6,    // 0.40 → 1.0
                scale:   0.88 + ratio * 0.12,   // 0.88 → 1.0
            };
        });
        setCardStyles(styles);
        setActiveIdx(Math.min(Math.max(Math.round(scrollX / cardW), 0), TOTAL - 1));
    }, [TOTAL]);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        el.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => el.removeEventListener('scroll', onScroll);
    }, [onScroll]);

    const scrollTo = useCallback((idx) => {
        const el = trackRef.current;
        if (!el) return;
        const cardW = el.scrollWidth / TOTAL;
        el.scrollTo({ left: cardW * idx, behavior: 'smooth' });
    }, [TOTAL]);

    const activeCard = featureCards[activeIdx];

    return (
        <div className="md:hidden relative">
            {/* Ambient glow orb — tracks active card colour */}
            <div
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-64 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${activeCard.glow}, transparent)`,
                    filter: 'blur(40px)',
                    transition: 'background 0.5s ease',
                    zIndex: 0,
                }}
            />

            {/* Scroll track */}
            <div
                ref={trackRef}
                className="relative z-10 flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-4 px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {featureCards.map((card, i) => (
                    <div
                        key={i}
                        className="snap-center shrink-0 w-[78vw] max-w-xs glass-panel p-6 relative overflow-hidden"
                        style={{
                            opacity: cardStyles[i].opacity,
                            transform: `scale(${cardStyles[i].scale})`,
                            transformOrigin: 'center center',
                            transition: 'opacity 0.12s ease, transform 0.12s ease',
                            borderTop: `3px solid ${card.border}`,
                        }}
                    >
                        {/* Subtle inner shine on active card */}
                        {i === activeIdx && (
                            <div
                                className="absolute inset-0 pointer-events-none rounded-2xl"
                                style={{
                                    background: `linear-gradient(135deg, ${card.glow?.replace('0.55','0.08')} 0%, transparent 60%)`,
                                }}
                            />
                        )}

                        {/* Label badge */}
                        <span
                            className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{
                                color: card.border,
                                background: `${card.glow?.replace('0.55','0.12')}`,
                                border: `1px solid ${card.border}40`,
                            }}
                        >
                            {card.label}
                        </span>

                        {/* Icon */}
                        <div className={`w-14 h-14 ${card.iconBg} rounded-2xl flex items-center justify-center mb-5 relative z-10`}>
                            {card.icon}
                        </div>

                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 relative z-10">{card.title}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed relative z-10">{card.desc}</p>
                    </div>
                ))}
            </div>

            {/* Controls row */}
            <div className="relative z-10 mt-6 flex flex-col items-center gap-4">

                {/* Progress bar */}
                <div className="w-full max-w-xs h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-200 ease-out"
                        style={{
                            width: `${(activeIdx / (TOTAL - 1)) * 100}%`,
                            minWidth: activeIdx === 0 ? '0%' : '8%',
                            background: `linear-gradient(90deg, ${featureCards[0].border}, ${activeCard.border})`,
                        }}
                    />
                </div>

                {/* Prev · Counter · Next */}
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => scrollTo(Math.max(activeIdx - 1, 0))}
                        disabled={activeIdx === 0}
                        aria-label="Previous feature"
                        className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all disabled:opacity-25 disabled:cursor-not-allowed bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Live counter badge */}
                    <div
                        className="px-4 py-1.5 rounded-full text-sm font-bold tabular-nums transition-all duration-300"
                        style={{
                            color: activeCard.border,
                            background: activeCard.glow?.replace('0.55', '0.1'),
                            border: `1px solid ${activeCard.border}40`,
                            minWidth: '4.5rem',
                            textAlign: 'center',
                        }}
                    >
                        {activeIdx + 1} / {TOTAL}
                    </div>

                    <button
                        onClick={() => scrollTo(Math.min(activeIdx + 1, TOTAL - 1))}
                        disabled={activeIdx === TOTAL - 1}
                        aria-label="Next feature"
                        className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all disabled:opacity-25 disabled:cursor-not-allowed bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ============================================================

   PROJECT OVERVIEW — Mobile Horizontal Scroll Carousel
   ============================================================ */
const overviewCards = [
    {
        icon: <Target className="w-6 h-6" />,
        iconBg: 'bg-blue-600 shadow-blue-500/30',
        title: 'Our Mission',
        gradient: 'from-blue-600/10',
        content: (
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                SnapPDF was founded on a simple yet powerful mission: to bridge the gap between physical
                documentation and digital efficiency. We recognize that in an increasingly paperless world,
                the transition from physical to digital should be instantaneous, secure, and accessible to everyone.
            </p>
        ),
    },
    {
        icon: <Rocket className="w-6 h-6" />,
        iconBg: 'bg-indigo-600 shadow-indigo-500/30',
        title: 'Our Vision',
        gradient: 'from-indigo-600/10',
        content: (
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                Our vision is to become the primary global utility for on-the-go document transformation,
                providing a seamless ecosystem where users can capture, organize, and store information
                without the need for bulky hardware or complex software.
            </p>
        ),
    },
    {
        icon: <BarChart3 className="w-6 h-6" />,
        iconBg: 'bg-emerald-600 shadow-emerald-500/30',
        title: 'Core Objectives',
        gradient: 'from-emerald-600/10',
        content: (
            <ul className="space-y-3">
                {[
                    'Enable high-fidelity document scanning across all mobile device platforms.',
                    'Implement zero-friction workflows for image-to-PDF conversion.',
                    'Guarantee enterprise-grade security for document storage and retrieval.',
                    'Optimize the digital footprint of generated files for easy sharing.',
                ].map((obj, i) => (
                    <li key={i} className="flex gap-2 text-slate-700 dark:text-slate-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                    </li>
                ))}
            </ul>
        ),
    },
];

const ProjectOverviewCarousel = () => {
    const trackRef = useRef(null);
    const [activeIdx, setActiveIdx] = useState(0);
    const TOTAL = overviewCards.length;
    const [cardStyles, setCardStyles] = useState(
        overviewCards.map((_, i) => ({ opacity: i === 0 ? 1 : 0.45, scale: i === 0 ? 1 : 0.92 }))
    );

    const onScroll = useCallback(() => {
        const el = trackRef.current;
        if (!el || el.scrollWidth === 0) return;
        const cardW = el.scrollWidth / TOTAL;
        const scrollX = el.scrollLeft;

        const styles = overviewCards.map((_, i) => {
            const cardCenter = cardW * i + cardW / 2;
            const viewCenter = scrollX + el.clientWidth / 2;
            const dist = Math.abs(viewCenter - cardCenter);
            const ratio = Math.max(0, 1 - dist / cardW);
            return {
                opacity: 0.45 + ratio * 0.55,   // 0.45 → 1.0
                scale: 0.92 + ratio * 0.08,      // 0.92 → 1.0
            };
        });
        setCardStyles(styles);
        setActiveIdx(Math.min(Math.max(Math.round(scrollX / cardW), 0), TOTAL - 1));
    }, [TOTAL]);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        el.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => el.removeEventListener('scroll', onScroll);
    }, [onScroll]);

    const scrollTo = useCallback((idx) => {
        const el = trackRef.current;
        if (!el) return;
        const cardW = el.scrollWidth / TOTAL;
        el.scrollTo({ left: cardW * idx, behavior: 'smooth' });
    }, [TOTAL]);

    return (
        <div className="lg:hidden relative">
            {/* Scroll track — hidden scrollbar */}
            <div
                ref={trackRef}
                className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-4 px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {overviewCards.map((card, i) => (
                    <div
                        key={i}
                        className={`snap-center shrink-0 w-[82vw] max-w-sm glass-panel p-7 bg-gradient-to-br ${card.gradient} to-transparent border-blue-500/20`}
                        style={{
                            opacity: cardStyles[i].opacity,
                            transform: `scale(${cardStyles[i].scale})`,
                            transformOrigin: 'center center',
                            transition: 'opacity 0.15s ease, transform 0.15s ease',
                        }}
                    >
                        <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center text-white mb-5 shadow-lg`}>
                            {card.icon}
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{card.title}</h4>
                        {card.content}
                    </div>
                ))}
            </div>

            {/* Nav row: Prev · dots · Next */}
            <div className="flex items-center justify-center gap-4 mt-6">
                <button
                    onClick={() => scrollTo(Math.max(activeIdx - 1, 0))}
                    disabled={activeIdx === 0}
                    aria-label="Previous card"
                    className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                    {overviewCards.map((_, i) => (
                        <button key={i} onClick={() => scrollTo(i)} aria-label={`Card ${i + 1}`}>
                            <span
                                className={`block rounded-full transition-all duration-300 ${
                                    i === activeIdx
                                        ? 'bg-blue-600'
                                        : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                                style={{
                                    width: i === activeIdx ? '24px' : '10px',
                                    height: '10px',
                                }}
                            />
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => scrollTo(Math.min(activeIdx + 1, TOTAL - 1))}
                    disabled={activeIdx === TOTAL - 1}
                    aria-label="Next card"
                    className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const Landing = () => {

    // Animation Variants
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true },
        transition: { staggerChildren: 0.2 }
    };

    return (
        <div className="flex flex-col items-center py-20 px-4 transition-colors duration-300 overflow-x-hidden">
            {/* HERO SECTION - UNMODIFIED LAYOUT */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center justify-center text-center relative z-10"
            >
                {/* <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#60a5fa] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] dark:opacity-10"></div>
                </div> */}

                <div className="relative w-full flex justify-center">
                    {/* Atmospheric Glow behind the text */}
                    <div 
                        className="absolute inset-0 bg-transparent z-0 pointer-events-none"
                        style={{
                            boxShadow: '0 0 40px 20px rgba(0, 180, 216, 0.15), 0 0 80px 40px rgba(0, 119, 182, 0.1)',
                            borderRadius: '50%',
                            filter: 'blur(30px)',
                            transform: 'scale(1.1)',
                        }}
                    ></div>
                    
                    <h1 
                        className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 transition-colors relative z-10"
                        style={{
                            textShadow: '0 0 10px rgba(0, 180, 216, 0.4), 0 0 20px rgba(0, 180, 216, 0.2), 0 0 30px rgba(0, 119, 182, 0.1)'
                        }}
                    >
                        Create PDFs on the <span 
                            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 inline-block"
                            style={{ filter: 'drop-shadow(0 0 15px rgba(0, 180, 216, 0.6)) drop-shadow(0 0 30px rgba(0, 119, 182, 0.4))' }}
                        >
                            Go
                        </span>
                    </h1>
                </div>

                <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-12 transition-colors">
                    Upload images or scan documents directly from your camera to generate professional PDF files in seconds. Securely stored and easily accessible.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    {useAuthStore.getState().isAuthenticated ? (
                        <>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                                    <LayoutDashboard className="w-5 h-5" /> Go to Dashboard
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link to="/create" className="btn-secondary text-lg px-8 py-4 flex items-center gap-2">
                                    <FilePlus className="w-5 h-5" /> Create New PDF
                                </Link>
                            </motion.div>
                        </>
                    ) : (
                        <>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link to="/register" className="btn-primary text-lg px-8 py-4 inline-block">
                                    Get Started for Free
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link to="/login" className="btn-secondary text-lg px-8 py-4 inline-block">
                                    Log in to Dashboard
                                </Link>
                            </motion.div>
                        </>
                    )}
                </div>

                {/* Primary Feature Cards */}
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: true }}
                    className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-5xl"
                >
                    {[
                        {
                            icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
                            title: "Upload Images",
                            desc: "Select multiple images and arrange them effortlessly to create a single PDF document."
                        },
                        {
                            icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
                            title: "Scan Documents",
                            desc: "Use your mobile camera to scan physical documents instantly into digital PDFs."
                        },
                        {
                            icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>,
                            title: "Secure Storage",
                            desc: "Access your PDF library anytime. Your files are securely stored on our cloud infrastructure."
                        }
                    ].map((card, idx) => (
                        <motion.div
                            key={idx}
                            variants={fadeIn}
                            whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                            className="glass-panel p-8 flex flex-col items-center text-center transition-all duration-300 group"
                        >
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-6">
                                {card.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{card.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400">{card.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            {/* 1. Project Overview */}
            <section className="mt-40 w-full max-w-6xl">
                <motion.div {...fadeIn} className="text-center mb-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Project Overview</h2>
                    <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full"></div>
                </motion.div>

                {/* ── Desktop: 3-column grid (unchanged) ── */}
                <div className="hidden lg:grid grid-cols-3 gap-8">
                    <motion.div
                        whileInView={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: -30 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="glass-panel p-8 bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/20"
                    >
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/30">
                            <Target className="w-6 h-6" />
                        </div>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Mission</h4>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            SnapPDF was founded on a simple yet powerful mission: to bridge the gap between physical documentation and digital efficiency. We recognize that in an increasingly paperless world, the transition from physical to digital should be instantaneous, secure, and accessible to everyone.
                        </p>
                    </motion.div>

                    <motion.div
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 30 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="glass-panel p-8 bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/20"
                    >
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/30">
                            <Rocket className="w-6 h-6" />
                        </div>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Vision</h4>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Our vision is to become the primary global utility for on-the-go document transformation, providing a seamless ecosystem where users can capture, organize, and store information without the need for bulky hardware or complex software.
                        </p>
                    </motion.div>

                    <motion.div
                        whileInView={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: 30 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="glass-panel p-8 bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/20"
                    >
                        <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/30">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Core Objectives</h4>
                        <ul className="space-y-4">
                            {[
                                "Enable high-fidelity document scanning across all mobile device platforms.",
                                "Implement zero-friction workflows for image-to-PDF conversion.",
                                "Guarantee enterprise-grade security for document storage and retrieval.",
                                "Optimize the digital footprint of generated files for easy sharing."
                            ].map((obj, i) => (
                                <li key={i} className="flex gap-3 text-slate-700 dark:text-slate-300 text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{obj}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* ── Mobile: horizontal scroll carousel ── */}
                <ProjectOverviewCarousel />
            </section>

            {/* 2. Key Features & Capabilities */}
            <section className="mt-40 w-full max-w-7xl px-4">
                <motion.div {...fadeIn} className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Key Features &amp; Capabilities</h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Explore the sophisticated tools designed to streamline your document management experience.</p>
                </motion.div>

                {/* ── Desktop: 4-column grid (unchanged) ── */}
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: true }}
                    className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {[
                        { icon: <Zap />, title: "Real-time Capture", desc: "Proprietary camera algorithms optimize image clarity for text-heavy documents." },
                        { icon: <ShieldCheck />, title: "Secure Encryption", desc: "All files are encrypted at rest and in transit, ensuring your data remains private." },
                        { icon: <Globe />, title: "LAN Sync", desc: "Advanced network protocols allow for cross-device synchronization without cloud delays." },
                        { icon: <Cpu />, title: "Smart Compression", desc: "Generate compact PDFs that maintain 100% legibility for professional use." }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            variants={fadeIn}
                            whileHover={{ scale: 1.05, borderColor: "rgb(37 99 235)" }}
                            className="glass-panel p-6 border-t-4 border-t-blue-600 transition-colors"
                        >
                            <div className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4">{feature.icon}</div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ── Mobile: special effects carousel ── */}
                <FeaturesCarousel />
            </section>


            {/* 3. Value Proposition - WITH GESTURES */}
            <section className="mt-40 w-full bg-slate-900 dark:bg-slate-800/60 rounded-[2.5rem] p-12 overflow-hidden relative">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-blue-600/30 blur-[100px] rounded-full"
                ></motion.div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div {...fadeIn}>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tight">Why hundreds of professionals trust SnapPDF</h2>
                        <div className="space-y-6">
                            {[
                                { t: "Time Efficiency", d: "Reduce document turnaround time by up to 70% with our automated processing." },
                                { t: "Cost Reduction", d: "Eliminate the need for expensive physical scanners and cloud storage subscriptions." },
                                { t: "Universal Access", d: "Your document hub is available on any device, anywhere in the world, 24/7." }
                            ].map((v, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ x: 10 }}
                                    className="flex gap-4 group cursor-default"
                                >
                                    <div className="w-1.5 h-auto bg-blue-500 rounded-full group-hover:bg-blue-400 transition-colors"></div>
                                    <div>
                                        <h5 className="font-bold text-blue-400 text-lg mb-1">{v.t}</h5>
                                        <p className="text-slate-300 text-lg leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{v.d}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                    <div className="hidden lg:flex justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                        >
                            <BarChart3 className="w-80 h-80 text-blue-500/10" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 4. Development Process - WITH FADE BLOCKS */}
            <section className="mt-40 w-full max-w-5xl text-center">
                <motion.div
                    {...fadeIn}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-8"
                >
                    <Users className="w-4 h-4" /> The SnapPDF Story
                </motion.div>
                <motion.h2
                    {...fadeIn}
                    className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8 text-center px-4"
                >
                    Engineered for Reliability
                </motion.h2>
                <motion.div {...fadeIn} className="max-w-3xl mx-auto">
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 font-medium italic opacity-80">
                        "We didn't just want to build another PDF converter. We wanted to build a reliable companion for the modern worker."
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-lg">
                        SnapPDF was developed using an Agile-driven methodology, focusing on extreme performance and user interface clarity. Our development stack—leveraging React for UI fluidity and Node.js for backend stability—ensures that the application remains robust under heavy workloads. We conduct rigorous security audits to ensure that your private documents stay private.
                    </p>
                </motion.div>
            </section>

            {/* 5. Call to Action (CTA) - WITH GLOW EFFECT */}
            <section className="mt-40 mb-20 w-full max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="glass-panel p-12 md:p-16 text-center bg-gradient-to-r from-blue-600 to-cyan-500 border-none shadow-2xl shadow-blue-500/20 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <h2 className="text-3xl md:text-6xl font-extrabold text-white mb-6 relative z-10">Ready to Digitalize?</h2>
                    <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto relative z-10 opacity-90">Join the premium tier of productivity. Create your first professional PDF document today.</p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
                        {useAuthStore.getState().isAuthenticated ? (
                            <>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link to="/dashboard" className="bg-white text-blue-600 hover:bg-slate-100 font-extrabold px-12 py-5 rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-xl hover:shadow-2xl">
                                        Back to Dashboard <LayoutDashboard className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link to="/create" className="bg-white/10 text-white hover:bg-white/20 border-2 border-white/20 backdrop-blur-md font-extrabold px-12 py-5 rounded-2xl transition-all flex items-center justify-center gap-3">
                                        New Document
                                    </Link>
                                </motion.div>
                            </>
                        ) : (
                            <>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link to="/register" className="bg-white text-blue-600 hover:bg-slate-100 font-extrabold px-12 py-5 rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-xl hover:shadow-2xl">
                                        Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link to="/login" className="bg-white/10 text-white hover:bg-white/20 border-2 border-white/20 backdrop-blur-md font-extrabold px-12 py-5 rounded-2xl transition-all flex items-center justify-center gap-3">
                                        Access Dashboard
                                    </Link>
                                </motion.div>
                            </>
                        )}
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default Landing;

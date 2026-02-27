import React from 'react';
import { LayoutGrid, Camera, Image as ImageIcon, Shield, Globe, Cpu, Smartphone, Zap, CheckCircle, Download, Layout, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Features = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const mainFeatures = [
        {
            icon: <Camera className="w-8 h-8" />,
            title: "Intelligent Scanner",
            desc: "Turn your smartphone into a high-performance document scanner with automatic edge detection and perspective correction.",
            points: ["Mobile-first capture", "Smart perspective fix", "Automatic contrast boost"]
        },
        {
            icon: <ImageIcon className="w-8 h-8" />,
            title: "Multi-Image Tool",
            desc: "Select dozens of images at once and arrange them into a single, cohesive PDF file with perfect margins.",
            points: ["Bulk upload support", "Drag & Drop sorting", "Preview before saving"]
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Privacy Hub",
            desc: "Manage your documents with the peace of mind that everything is encrypted and only accessible to you.",
            points: ["User-only access", "Auto-clear cache", "Encrypted storage"]
        }
    ];

    const techFeatures = [
        { icon: <Zap />, title: "Hyper-Speed", d: "Files optimized for instant uploads." },
        { icon: <Globe />, title: "Remote Sync", d: "Access docs on any device." },
        { icon: <Cpu />, title: "AI Enhance", d: "Text sharpening for low light." },
        { icon: <Smartphone />, title: "Responsive", d: "Optimized for all screens." },
        { icon: <Download />, title: "One-Tap Export", d: "Share directly to social/mail." },
        { icon: <Layout />, title: "Grid View", d: "Intuitive library management." },
        { icon: <Clock />, title: "History", d: "Track created PDFs easily." },
        { icon: <Shield />, title: "Vault", d: "Secure archive secondary backup." }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-20 overflow-hidden">
            {/* Features Hero */}
            <motion.div {...fadeIn} className="text-center mb-32">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-8">
                    <LayoutGrid className="w-4 h-4" /> Power at your fingertips
                </div>
                <h1 className="text-4xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6">Explore the <span className="text-blue-600">Capabilities</span></h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                    SnapPDF combines cutting-edge engineering with user-centric design to deliver a document toolkit that works as hard as you do.
                </p>
            </motion.div>

            {/* In-Depth Features */}
            <section className="mb-40 space-y-20">
                {mainFeatures.map((f, i) => (
                    <motion.div
                        key={i}
                        {...fadeIn}
                        className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center`}
                    >
                        <div className="w-full lg:w-1/2">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center mb-8 shadow-xl">
                                {f.icon}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">{f.title}</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                                {f.desc}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {f.points.map((p, pi) => (
                                    <div key={pi} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                        <span className="font-medium text-sm">{p}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <div className="glass-panel aspect-video rounded-[2.5rem] bg-gradient-to-br from-blue-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 flex items-center justify-center relative group opacity-50">
                                <div className="absolute inset-0 bg-blue-600/5 blur-3xl group-hover:bg-blue-600/10 transition-colors"></div>
                                <LayoutGrid className="w-24 h-24 text-blue-300 dark:text-slate-700 transition-transform group-hover:scale-110" />
                                <span className="absolute bottom-6 text-xs text-slate-400 font-bold tracking-widest uppercase italic">Feature Visual Placeholder</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* Technical Capability Grid */}
            <section className="mb-20">
                <motion.div {...fadeIn} className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Technical Advantage</h2>
                    <p className="text-slate-600 dark:text-slate-400">Smaller details that make a massive difference in efficiency.</p>
                </motion.div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {techFeatures.map((t, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5, borderColor: "rgba(59, 130, 246, 0.5)" }}
                            className="glass-panel p-6 rounded-[2rem] bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/20 text-center flex flex-col items-center group transition-all duration-300"
                        >
                            <div className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-4 transition-transform duration-300 group-hover:scale-110">{t.icon}</div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-1 text-sm">{t.title}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{t.d}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Features;

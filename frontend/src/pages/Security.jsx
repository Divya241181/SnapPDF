import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server, Key, FileWarning, CheckCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const Security = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const standards = [
        { icon: <Lock />, title: "AES-256 Encryption", desc: "All files at rest are encrypted using the same standards used by government agencies and banks." },
        { icon: <ShieldCheck />, title: "TLS/SSL Transit", desc: "Data moving between your device and our servers is protected by high-grade 256-bit encryption." },
        { icon: <EyeOff />, title: "Zero-Knowledge", desc: "Our team cannot view your documents. Encryption happens client-side before storage." },
        { icon: <Key />, title: "JWT Auth", desc: "Secure token-based authentication ensures that only you can access your profile and files." }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-20 overflow-hidden">
            {/* Security Hero */}
            <motion.div {...fadeIn} className="text-center mb-32">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
                    <ShieldCheck className="w-12 h-12" />
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6">Security & <span className="text-blue-600">Privacy</span></h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Your trust is our most valuable asset. We use enterprise-grade security to ensure your documents never fall into the wrong hands.
                </p>
            </motion.div>

            {/* Core Infrastructure Section */}
            <section className="mb-40 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-8"
                >
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Built-in Protective Layers</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                        Security isn't a feature we added later; it's the foundation we built SnapPDF upon. We implement a multi-layered defense strategy to protect your sensitive documentation.
                    </p>
                    <div className="space-y-4">
                        {[
                            "Automatic virus and malware scanning on all uploads.",
                            "Redundant storage across multiple geographically diverse centers.",
                            "24/7 infrastructure monitoring for suspicious activity.",
                            "Regular third-party security audits and penetration tests."
                        ].map((item, i) => (
                            <div key={i} className="flex gap-3 items-center">
                                <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />
                                <span className="text-slate-700 dark:text-slate-300">{item}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {standards.map((std, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -10, borderColor: "rgb(37 99 235)" }}
                            className="glass-panel p-8 text-center sm:text-left transition-all"
                        >
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl w-fit sm:mb-6 mb-4 mx-auto sm:mx-0">
                                {std.icon}
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">{std.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{std.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Compliance Section */}
            <section className="mb-40 bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12">Global Compliance Standards</h2>
                    <div className="flex flex-wrap justify-center gap-12 sm:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                        {/* Fake Compliance Badges */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full border-4 border-slate-400 flex items-center justify-center font-black text-xl">SOC2</div>
                            <span className="text-xs font-bold uppercase tracking-tighter">Certified</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full border-4 border-slate-400 flex items-center justify-center font-black text-xl">GDPR</div>
                            <span className="text-xs font-bold uppercase tracking-tighter">Compliant</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full border-4 border-slate-400 flex items-center justify-center font-black text-xl">HIPAA</div>
                            <span className="text-xs font-bold uppercase tracking-tighter">Ready</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Emergency & Recovery */}
            <motion.div {...fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                <div className="glass-panel p-10 flex gap-6 items-start bg-rose-50/50 dark:bg-rose-900/10 border-rose-200/50 dark:border-rose-900/30">
                    <FileWarning className="w-12 h-12 text-rose-500 shrink-0" />
                    <div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Lost Account?</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                            For security purposes, we cannot recover forgotten master keys. Please ensure your recovery phrase is stored in a safe, offline location.
                        </p>
                    </div>
                </div>
                <div className="glass-panel p-10 flex gap-6 items-start bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-900/30">
                    <RefreshCcw className="w-12 h-12 text-emerald-500 shrink-0" />
                    <div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Backup Systems</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                            All document databases are backed up every 4 hours to an encrypted, isolated secondary network to prevent total data loss in catastrophic events.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Security;

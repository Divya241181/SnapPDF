import React from 'react';
import { Target, Eye, Heart, Zap, Shield, Globe, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Mission = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-20 overflow-hidden">
            {/* Mission Hero */}
            <motion.div {...fadeIn} className="text-center mb-32">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-8">
                    <Target className="w-4 h-4" /> Driven by purpose
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-8">
                    Our Mission & <span className="text-blue-600">Values</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed italic">
                    "To redefine document accessibility by creating the world's most intuitive and secure digital scanning ecosystem."
                </p>
            </motion.div>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-40">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <Eye className="w-8 h-8 text-blue-600" /> Our Vision
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                        We envision a world where physical paper is no longer a bottleneck for productivity. A future where every professional can capture and share information instantly, without compromising on security or environmental sustainability.
                    </p>
                    <div className="space-y-4">
                        {[
                            "Empower 10 million professionals by 2030",
                            "Reduce global paper dependency by 40%",
                            "Set the gold standard for document encryption"
                        ].map((goal, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                <span>{goal}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    <div className="absolute -inset-4 bg-blue-600/10 blur-3xl rounded-full"></div>
                    <div className="glass-panel p-12 bg-white/40 dark:bg-slate-800/20 relative z-10 text-center">
                        <Heart className="w-20 h-20 text-rose-500 mx-auto mb-6 animate-pulse" />
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Built with Integrity</h4>
                        <p className="text-slate-500 dark:text-slate-400">Our commitment to transparency and user trust is at the heart of everything we do.</p>
                    </div>
                </motion.div>
            </div>

            {/* Cultural Values Grid */}
            <section className="mb-40">
                <motion.div {...fadeIn} className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">What We Stand For</h2>
                    <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full"></div>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: <Zap />, c: "text-amber-500", t: "Speed over Perfection", d: "We value rapid iteration and solving problems as they occur, ensuring our users never wait for critical features." },
                        { icon: <Shield />, c: "text-emerald-500", t: "Uncompromising Privacy", d: "We believe privacy is a fundamental human right. Our zero-knowledge architecture reflects this belief." },
                        { icon: <Globe />, c: "text-indigo-500", t: "Global Scale", d: "We design for everyone, everywhere. Our tools are optimized for low-bandwidth networks and diverse device types." }
                    ].map((v, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -10 }}
                            className="glass-panel p-10 flex flex-col items-center text-center group"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-6 flex items-center justify-center ${v.c} transition-transform group-hover:rotate-12`}>
                                {v.icon}
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{v.t}</h4>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">{v.d}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Final */}
            <motion.div
                {...fadeIn}
                className="glass-panel p-12 text-center bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Users className="w-32 h-32" />
                </div>
                <h3 className="text-3xl font-bold mb-6">Join our movement</h3>
                <p className="text-slate-300 max-w-2xl mx-auto mb-10 text-lg">
                    We're not just building an app; we're building a community of empowered professionals. Be part of the change.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/register" className="btn-primary px-10 py-4 flex items-center gap-2">
                        Get Started <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Mission;

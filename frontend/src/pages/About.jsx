import React from 'react';
import { Users, Target, Award, History, CheckCircle2, Cpu, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const values = [
        { title: 'User Centricity', desc: 'Every feature we build starts with a simple question: How does this make our users lives easier?' },
        { title: 'Security First', desc: 'We treat your documents like our own, implementing enterprise-grade encryption at every layer.' },
        { title: 'Technical Excellence', desc: 'Our team of engineers is dedicated to push the boundaries of document processing technology.' },
        { title: 'Global Accessibility', desc: 'We believe premium tools should be available to everyone, regardless of their location or device.' }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 overflow-hidden">
            {/* Mission Section */}
            <motion.section {...fadeIn} className="text-center mb-24">
                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-8">
                    Our Mission
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                    To bridge the digital divide by providing an instantaneous, secure, and intuitive ecosystem for document transformation. We empower professionals to handle physical documentation with digital speed.
                </p>
                <div className="mt-12 group inline-block">
                    <div className="p-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <Target className="w-12 h-12" />
                    </div>
                </div>
            </motion.section>

            {/* History Section */}
            <section className="mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                            <History className="w-8 h-8 text-blue-600" /> Company History
                        </h2>
                        <div className="space-y-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                            <p>
                                SnapPDF began as a small research project in 2024, born out of the frustration of managing physical paperwork in a remote-first world. Our founders saw the need for a tool that combined the high-fidelity scanning of a flatbed scanner with the portability of a smartphone.
                            </p>
                            <p>
                                What started as a simple mobile-to-PDF utility quickly evolved into a comprehensive document management platform. Today, we serve thousands of professionals across legal, medical, and administrative sectors who rely on SnapPDF for their daily workflows.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="glass-panel p-8 md:p-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-2xl shadow-blue-500/20"
                    >
                        <h3 className="text-2xl font-bold mb-6">Milestones</h3>
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="text-xl font-black opacity-30">2024</div>
                                <div>
                                    <h5 className="font-bold">Alpha Launch</h5>
                                    <p className="text-blue-100 text-sm">Initial release of the mobile scanning engine.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-xl font-black opacity-30">2025</div>
                                <div>
                                    <h5 className="font-bold">Global Presence</h5>
                                    <p className="text-blue-100 text-sm">Reached 100k+ active monthly users across 50 countries.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-xl font-black opacity-30">2026</div>
                                <div>
                                    <h5 className="font-bold">AI Integration</h5>
                                    <p className="text-blue-100 text-sm">Launched smart-edge detection and automatic text enhancement.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Core Values */}
            <section className="mb-32">
                <motion.div {...fadeIn} className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Core Values</h2>
                    <p className="text-slate-600 dark:text-slate-400">The principles that guide every decision we make.</p>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {values.map((v, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -10 }}
                            className="glass-panel p-8 text-center"
                        >
                            <div className="inline-flex p-3 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">{v.title}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{v.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Leadership Section */}
            <section className="mb-20">
                <motion.div {...fadeIn} className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" /> Leadership & Team
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        SnapPDF is built by a global team of specialists dedicated to document processing, cybersecurity, and UX design.
                    </p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { name: 'Dr. Jane Smith', role: 'Chief Technical Officer', icon: <Cpu className="w-12 h-12" /> },
                        { name: 'Alex Rivera', role: 'Head of Operations', icon: <Award className="w-12 h-12" /> },
                        { name: 'Marcus Chen', role: 'Lead Architect', icon: <Terminal className="w-12 h-12" /> }
                    ].map((person, i) => (
                        <div key={i} className="glass-panel p-8 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-6">
                                {person.icon}
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{person.name}</h4>
                            <p className="text-blue-600 dark:text-blue-400 font-medium text-sm uppercase tracking-wider">{person.role}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default About;

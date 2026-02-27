import React from 'react';
import { Users, Target, Award, History, CheckCircle2, Cpu, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import PrathamImg from '../assets/Pratham.jpeg';
import DivyaImg from '../assets/Divya.jpg';

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
                            whileHover={{ y: -10, borderColor: "rgba(59, 130, 246, 0.5)" }}
                            className="glass-panel p-8 text-center bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/20 group transition-all duration-300"
                        >
                            <div className="inline-flex p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6 transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-blue-500/10">
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
                        SnapPDF is built by a dedicated team of experts focused on creating the best document management experience.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {[
                        {
                            name: 'Prathamsinh Parmar',
                            dept: 'Information Technology',
                            role: 'Full Stack Developer',
                            avatar: PrathamImg
                        },
                        {
                            name: 'Divya Patel',
                            dept: 'Cyber Security',
                            role: 'Security Engineer',
                            avatar: DivyaImg
                        }
                    ].map((person, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="glass-panel p-6 sm:p-8 flex flex-col items-center text-center group"
                        >
                            <div className="relative mb-4">
                                <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                <img
                                    src={person.avatar}
                                    alt={person.name}
                                    className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-xl relative z-10 object-cover"
                                />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {person.name}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 font-medium italic">
                                {person.dept}
                            </p>
                            <div className="px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                                {person.role}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default About;

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Globe, Cpu, Users, ArrowRight, BarChart3, CheckCircle2, Target, Rocket } from 'lucide-react';

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

                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 transition-colors">
                    Create PDFs on the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Go</span>
                </h1>

                <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-12 transition-colors">
                    Upload images or scan documents directly from your camera to generate professional PDF files in seconds. Securely stored and easily accessible.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
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

            {/* 1. Project Overview - RESTRUCTURED */}
            <section className="mt-40 w-full max-w-6xl">
                <motion.div
                    {...fadeIn}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Project Overview</h2>
                    <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full"></div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Mission Card */}
                    <motion.div
                        whileInView={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: -30 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="glass-panel p-8 bg-white/40 dark:bg-slate-800/20"
                    >
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/30">
                            <Target className="w-6 h-6" />
                        </div>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Mission</h4>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            SnapPDF was founded on a simple yet powerful mission: to bridge the gap between physical documentation and digital efficiency. We recognize that in an increasingly paperless world, the transition from physical to digital should be instantaneous, secure, and accessible to everyone.
                        </p>
                    </motion.div>

                    {/* Vision Card */}
                    <motion.div
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 30 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="glass-panel p-8 bg-white/40 dark:bg-slate-800/20"
                    >
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/30">
                            <Rocket className="w-6 h-6" />
                        </div>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Vision</h4>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Our vision is to become the primary global utility for on-the-go document transformation, providing a seamless ecosystem where users can capture, organize, and store information without the need for bulky hardware or complex software.
                        </p>
                    </motion.div>

                    {/* Objectives Card */}
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
            </section>

            {/* 2. Key Features & Capabilities - WITH HOVER SCALE */}
            <section className="mt-40 w-full max-w-7xl px-4">
                <motion.div {...fadeIn} className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Key Features & Capabilities</h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Explore the sophisticated tools designed to streamline your document management experience.</p>
                </motion.div>
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
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
                    className="glass-panel p-12 md:p-16 text-center bg-gradient-to-r from-blue-600 to-indigo-700 border-none shadow-2xl shadow-blue-500/20 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <h2 className="text-3xl md:text-6xl font-extrabold text-white mb-6 relative z-10">Ready to Digitalize?</h2>
                    <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto relative z-10 opacity-90">Join the premium tier of productivity. Create your first professional PDF document today.</p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
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
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default Landing;

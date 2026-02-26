import React from 'react';
import { Book, Code, Rocket, Camera, FileText, Settings, HelpCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Documentation = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const guides = [
        {
            icon: <Rocket className="w-6 h-6" />,
            title: "Getting Started",
            steps: ["Create your account", "Verify your email", "Explore the dashboard"]
        },
        {
            icon: <Camera className="w-6 h-6" />,
            title: "Scanning Documents",
            steps: ["Open the camera", "Align the document", "Capture high-fidelity scans"]
        },
        {
            icon: <FileText className="w-6 h-6" />,
            title: "Managing PDFs",
            steps: ["Rename your files", "Reorder images", "Download or store securely"]
        },
        {
            icon: <Settings className="w-6 h-6" />,
            title: "Account Settings",
            steps: ["Update your profile", "Change theme", "Manage security keys"]
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-20">
            <motion.div {...fadeIn} className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6">Documentation</h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Everything you need to know about using SnapPDF to its full potential.
                </p>
                <div className="h-1.5 w-24 bg-blue-600 mx-auto mt-6 rounded-full"></div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar - Desktop */}
                <aside className="hidden lg:block space-y-2">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 px-4">Guides</h3>
                    {guides.map((g, i) => (
                        <button key={i} className="w-full text-left px-4 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-between group">
                            <span className="flex items-center gap-3">{g.icon} {g.title}</span>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                    <div className="pt-8 border-t border-slate-200 dark:border-slate-800 mt-8 px-4">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">API Reference</h3>
                        <div className="p-4 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs">
                            GET /api/pdfs<br />
                            POST /api/pdfs
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-12">
                    {guides.map((guide, i) => (
                        <motion.section
                            key={i}
                            {...fadeIn}
                            transition={{ delay: i * 0.1 }}
                            className="glass-panel p-8 md:p-12 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                {guide.icon}
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-4">
                                <span className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">{guide.icon}</span>
                                {guide.title}
                            </h2>
                            <div className="space-y-4">
                                {guide.steps.map((step, si) => (
                                    <div key={si} className="flex gap-4 items-start">
                                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-1">
                                            {si + 1}
                                        </div>
                                        <p className="text-lg text-slate-600 dark:text-slate-400">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    ))}

                    {/* FAQ Quick Link */}
                    <div className="bg-blue-600 rounded-[2.5rem] p-12 text-center text-white">
                        <HelpCircle className="w-16 h-16 mx-auto mb-6 opacity-50" />
                        <h3 className="text-3xl font-bold mb-4">Need more help?</h3>
                        <p className="text-blue-100 mb-8 max-w-xl mx-auto text-lg">
                            If you can't find the answer you're looking for, our technical support team is available 24/7 to assist with your specific workflow needs.
                        </p>
                        <button className="bg-white text-blue-600 font-bold px-10 py-4 rounded-2xl hover:bg-slate-100 transition-all">
                            Visit Help Center
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Documentation;

import React from 'react';
import { ShieldAlert, Cookie, Lock, Eye, FileText, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const sections = [
        {
            icon: <Eye className="w-6 h-6 text-blue-600" />,
            title: "Data Collection",
            content: "We collect information you provide directly to us, such as when you create an account, upload a document, or contact support. This includes your email, name, and the metadata of documents processed. We also collect technical data like IP addresses and browser types to ensure system security."
        },
        {
            icon: <FileText className="w-6 h-6 text-emerald-600" />,
            title: "Use of Information",
            content: "Your data is primarily used to provide, maintain, and improve our services. This includes processing your PDF conversions, managing your document storage, and sending account-related notifications. We do not sell your personal data to third parties."
        },
        {
            icon: <Lock className="w-6 h-6 text-indigo-600" />,
            title: "Storage & Security",
            content: "SnapPDF uses industry-standard encryption protocols (AES-256) at rest and in transit. Document storage is handled by secure cloud infrastructure with strictly controlled access. Temporary processing files are cleared regularly to minimize data footprints."
        },
        {
            icon: <Cookie className="w-6 h-6 text-amber-600" />,
            title: "Cookie Policy",
            content: "We use essential cookies to maintain your login session and remember your preferences (like Dark Mode). Analytics cookies are used in an anonymized fashion to help us understand how users interact with our platform."
        },
        {
            icon: <ShieldAlert className="w-6 h-6 text-rose-600" />,
            title: "Your Rights",
            content: "Users have the right to access, correct, or delete their personal information at any time. You can export your document library or request a full account deletion through your dashboard settings."
        }
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <motion.div {...fadeIn} className="text-center mb-16">
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">Privacy Policy</h1>
                <p className="text-slate-600 dark:text-slate-400">Last Updated: February 27, 2026</p>
                <div className="h-1 w-20 bg-blue-600 mx-auto mt-6 rounded-full"></div>
            </motion.div>

            <div className="space-y-8">
                {sections.map((section, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="glass-panel p-8"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                {section.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{section.title}</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-16">
                            {section.content}
                        </p>
                    </motion.div>
                ))}
            </div>

            <motion.div
                {...fadeIn}
                className="mt-16 p-8 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-center"
            >
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Questions about your privacy?</h4>
                <p className="text-slate-600 dark:text-slate-400 mb-6 italic">Our dedicated privacy team is ready to assist you with any inquiries.</p>
                <a
                    href="mailto:privacy@snappdf.com"
                    className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
                >
                    <Mail className="w-5 h-5" /> privacy@snappdf.com
                </a>
            </motion.div>
        </div>
    );
};

export default PrivacyPolicy;

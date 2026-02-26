import React from 'react';
import { Gavel, Scale, AlertTriangle, ShieldCheck, XCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsOfService = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const clauses = [
        {
            icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
            title: "Acceptance of Terms",
            body: "By accessing and using SnapPDF, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please refrain from using our platform."
        },
        {
            icon: <Scale className="w-5 h-5 text-indigo-600" />,
            title: "User Responsibilities",
            body: "Users are responsible for maintaining the confidentiality of their account credentials. You agree to use the service only for lawful purposes and comply with all documentation laws regarding privacy and consent."
        },
        {
            icon: <Gavel className="w-5 h-5 text-emerald-600" />,
            title: "Intellectual Property",
            body: "SnapPDF and its original content, features, and functionality are owned by SnapPDF and are protected by international copyright and trademark laws. User-uploaded content remains the property of the user."
        },
        {
            icon: <XCircle className="w-5 h-5 text-rose-600" />,
            title: "Account Termination",
            body: "We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including breach of terms."
        },
        {
            icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
            title: "Limitation of Liability",
            body: "In no event shall SnapPDF be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services."
        }
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 py-20">
            <motion.div {...fadeIn} className="text-center mb-16">
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">Terms of Service</h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Please read these terms carefully before using our platform. Your use of the service constitutes acceptance of these conditions.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {clauses.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="glass-panel p-8 hover:border-blue-500/50 transition-colors"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            {item.icon}
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{item.title}</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                            {item.body}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Disclaimer Box */}
            <motion.div
                {...fadeIn}
                className="mt-12 p-10 bg-slate-900 dark:bg-slate-800/80 rounded-3xl text-white relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Info className="w-40 h-40" />
                </div>
                <div className="relative z-10">
                    <h4 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Scale className="w-6 h-6 text-blue-400" /> General Disclaimers
                    </h4>
                    <p className="text-slate-300 leading-relaxed mb-8 italic">
                        "SnapPDF provides the service on an 'as is' and 'as available' basis. We make no warranties of any kind regarding the accuracy or reliability of documents processed."
                    </p>
                    <p className="text-slate-400 text-sm">
                        For detailed legal inquiries, please contact our legal counsel at <span className="text-blue-400 font-bold">legal@snappdf.com</span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default TermsOfService;

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus({ type: 'success', msg: 'Message sent successfully! We will get back to you soon.' });
        // Reset after 3s
        setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-20">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">Contact Us</h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Have questions or need technical support? Our team is dedicated to providing you with the assistance you need. Reach out through any of the channels below.
                </p>
                <div className="h-1.5 w-24 bg-blue-600 mx-auto mt-6 rounded-full"></div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Contact Information Cards */}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <motion.div whileHover={{ y: -5 }} className="glass-panel p-8 text-center">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Email Us</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">support@snappdf.com</p>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className="glass-panel p-8 text-center">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Phone className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Call Us</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">+91 8238075291</p>
                        </motion.div>
                    </div>

                    <div className="glass-panel p-8">
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-rose-500" /> Our Headquarters
                        </h4>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="text-slate-400 mt-1"><Globe className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-slate-900 dark:text-white font-semibold">KPGU</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Emerging Technologies Department<br />Vadodara, Gujarat, India</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-slate-400 mt-1"><Clock className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-slate-900 dark:text-white font-semibold">Business Hours</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Mon–Fri: 9AM – 6PM PST<br />Weekend: Closed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inquiry Form */}
                <div className="glass-panel p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-8">
                        <MessageSquare className="w-8 h-8 text-blue-600" />
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Send an Inquiry</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Name</label>
                                <input type="text" required className="input-field" placeholder="John Doe" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
                                <input type="email" required className="input-field" placeholder="john@example.com" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Subject</label>
                            <select className="input-field">
                                <option>General Inquiry</option>
                                <option>Technical Support</option>
                                <option>Billing Issue</option>
                                <option>Partnership</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Message</label>
                            <textarea rows="4" required className="input-field pt-3 resize-none" placeholder="How can we help you?"></textarea>
                        </div>

                        <button type="submit" className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-3 text-lg group">
                            Send Message <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>

                        {status.msg && (
                            <div className={`p-4 rounded-xl text-center text-sm font-semibold transition-all ${status.type === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                }`}>
                                {status.msg}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;

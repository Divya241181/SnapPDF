import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Github, Heart, Globe, Shield, Terminal } from 'lucide-react';
import logo from '../assets/SnapPDF Logo.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { name: 'Dashboard', path: '/dashboard' },
            { name: 'Create PDF', path: '/create' },
            { name: 'Features', path: '/features' },
            { name: 'Security', path: '/security' },
        ],
        company: [
            { name: 'About Us', path: '/about' },
            { name: 'Our Mission', path: '/mission' },
            { name: 'Contact Us', path: '/contact' },
        ],
        support: [
            { name: 'Privacy Policy', path: '/privacy' },
            { name: 'Terms of Service', path: '/terms' },
            { name: 'Documentation', path: '/docs' },
        ]
    };

    return (
        <footer className="relative mt-20 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">

                    {/* Brand Section */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link to="/" className="flex items-center gap-2 group w-fit">
                            <img
                                src={logo}
                                alt="SnapPDF"
                                className="h-10 w-auto object-contain transition-transform group-hover:scale-105 dark:brightness-110"
                            />
                        </Link>
                        <p className="text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
                            Empowering professionals worldwide with seamless document digitilization and PDF management tools. Create, scan, and store with confidence.
                        </p>
                        <div className="flex items-center gap-4">
                            {[
                                { icon: <Twitter className="w-5 h-5" />, href: '#' },
                                { icon: <Github className="w-5 h-5" />, href: '#' },
                                { icon: <Linkedin className="w-5 h-5" />, href: '#' },
                                { icon: <Instagram className="w-5 h-5" />, href: '#' },
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all duration-300"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="lg:col-span-2">
                        <h4 className="text-slate-900 dark:text-white font-bold mb-6">Product</h4>
                        <ul className="space-y-4">
                            {footerLinks.product.map((link, i) => (
                                <li key={i}>
                                    <Link to={link.path} className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="text-slate-900 dark:text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4">
                            {footerLinks.company.map((link, i) => (
                                <li key={i}>
                                    <Link to={link.path} className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="text-slate-900 dark:text-white font-bold mb-6">Support</h4>
                        <ul className="space-y-4">
                            {footerLinks.support.map((link, i) => (
                                <li key={i}>
                                    <Link to={link.path} className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter / Contact Section */}
                    <div className="lg:col-span-2">
                        <h4 className="text-slate-900 dark:text-white font-bold mb-6">Contact</h4>
                        <div className="space-y-4">
                            <a href="mailto:support@snappdf.com" className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
                                <Mail className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                                <span className="text-sm">support@snappdf.com</span>
                            </a>
                            <div className="pt-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                    <Shield className="w-3 h-3" /> System Operational
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                        © {currentYear} SnapPDF. All rights reserved. Made with <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> by Advanced Agentic Team.
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                            <Terminal className="w-4 h-4" />
                            <span>v1.2.0-stable</span>
                        </div>
                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                        <select className="bg-transparent border-none text-slate-500 dark:text-slate-400 text-sm focus:ring-0 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                            <option>English (US)</option>
                            <option>Hindi</option>
                            <option>Spanish</option>
                        </select>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

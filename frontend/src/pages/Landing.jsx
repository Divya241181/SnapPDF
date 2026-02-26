import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 transition-colors duration-300">
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] dark:opacity-10"></div>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 transition-colors">
                Create PDFs on the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Go</span>
            </h1>

            <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-12 transition-colors">
                Upload images or scan documents directly from your camera to generate professional PDF files in seconds. Securely stored and easily accessible.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary text-lg px-8 py-4">
                    Get Started for Free
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                    Log in to Dashboard
                </Link>
            </div>

            <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-5xl">
                <div className="glass-panel p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Upload Images</h3>
                    <p className="text-slate-600 dark:text-slate-400">Select multiple images and arrange them effortlessly to create a single PDF document.</p>
                </div>
                <div className="glass-panel p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Scan Documents</h3>
                    <p className="text-slate-600 dark:text-slate-400">Use your mobile camera to scan physical documents instantly into digital PDFs.</p>
                </div>
                <div className="glass-panel p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Secure Storage</h3>
                    <p className="text-slate-600 dark:text-slate-400">Access your PDF library anytime. Your files are securely stored on our cloud infrastructure.</p>
                </div>
            </div>
        </div>
    );
};

export default Landing;

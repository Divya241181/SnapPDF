import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          {/* Decorative background element */}
          <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
          
          {/* Main Error Illustration */}
          <div className="relative">
            <h1 className="text-9xl font-black text-slate-200 dark:text-slate-800 tracking-tighter select-none premium-typography">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800"
              >
                <AlertCircle className="w-16 h-16 text-blue-600" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 premium-typography">
            Page Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            Oops! The page you're looking for seems to have vanished into thin air. 
            It might have been moved, deleted, or perhaps it never existed in the first place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/" 
              className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base shadow-lg shadow-blue-600/20"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="btn-secondary w-full sm:w-auto px-8 py-3.5 text-base border border-slate-200 dark:border-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-500 flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              Looking for something else? Try our 
              <Link to="/docs" className="text-blue-600 hover:underline font-medium">Documentation</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;

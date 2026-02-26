import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuthStore();
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        const result = await login({ email, password });
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.msg);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 transition-colors duration-300">
            <div className="glass-panel w-full max-w-md p-8 md:p-10 transition-colors">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white transition-colors">Welcome Back</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2 transition-colors">Log in to access your PDFs</p>
                </div>

                {error && (
                    <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 p-3 rounded-lg mb-6 border border-rose-100 dark:border-rose-900/50 flex items-center font-medium transition-colors text-sm">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                            className="input-field"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                            className="input-field"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <Link to="#" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-50 dark:hover:text-blue-300 font-medium transition-colors">Forgot password?</Link>
                    </div>

                    <button type="submit" className="w-full btn-primary py-3 text-lg mt-8" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-600 dark:text-slate-400 transition-colors">
                    Don't have an account? <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold transition-colors">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

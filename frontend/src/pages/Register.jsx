import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', profession: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuthStore();
    const navigate = useNavigate();

    const { username, email, password, profession } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        const result = await register({ username, email, password, profession });
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.msg);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="glass-panel w-full max-w-md p-8 md:p-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900">Create Account</h2>
                    <p className="text-slate-600 mt-2">Sign up to start creating PDFs</p>
                </div>

                {error && (
                    <div className="bg-rose-50 text-rose-500 p-3 rounded-lg mb-6 border border-rose-100 flex items-center font-medium">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Username <span className="text-rose-500">*</span></label>
                        <input
                            type="text"
                            name="username"
                            value={username}
                            onChange={onChange}
                            required
                            className="input-field"
                            placeholder="johndoe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address <span className="text-rose-500">*</span></label>
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
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password <span className="text-rose-500">*</span></label>
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
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Profession (Optional)</label>
                        <input
                            type="text"
                            name="profession"
                            value={profession}
                            onChange={onChange}
                            className="input-field"
                            placeholder="e.g. Student, Designer"
                        />
                    </div>

                    <button type="submit" className="w-full btn-primary py-3 text-lg mt-8" disabled={loading}>
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-600">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-500 font-semibold">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;

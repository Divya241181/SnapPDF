import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../store/authStore';
import { User, Mail, Lock, Briefcase, MapPin, AlignLeft, Camera, Eye, EyeOff, Save, CheckCircle2, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, updateProfile, logout } = useAuthStore();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        profession: '',
        bio: '',
        location: '',
        password: ''
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                profession: user.profession || '',
                bio: user.bio || '',
                location: user.location || '',
                password: ''
            });
            if (user.profilePhotoUrl) {
                // Ensure URL is complete if it's a relative path
                const baseUrl = axios.defaults.baseURL || '';
                setPreview(user.profilePhotoUrl.startsWith('http') ? user.profilePhotoUrl : `${baseUrl}${user.profilePhotoUrl}`);
            }
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });
        if (file) data.append('profilePhoto', file);

        const result = await updateProfile(data);
        if (result.success) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setFormData(prev => ({ ...prev, password: '' })); // clear password field
            setFile(null);
        } else {
            setMessage({ type: 'error', text: result.msg || 'Failed to update profile' });
        }
        setLoading(false);

        // Clear message after 3 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;
        setDeleteLoading(true);
        try {
            await axios.delete('/api/user/account');
            logout();
            navigate('/');
        } catch (err) {
            setDeleteLoading(false);
            setShowDeleteModal(false);
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to delete account' });
            setTimeout(() => setMessage({ type: '', text: '' }), 4000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-6 px-4">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Side - Profile Photo Card */}
                <div className="w-full md:w-1/3">
                    <div className="glass-panel p-6 flex flex-col items-center text-center">
                        <div className="relative group cursor-pointer mb-6" onClick={triggerFileInput}>
                            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-blue-500/30 bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all group-hover:border-blue-500">
                                {preview ? (
                                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-slate-400" />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{formData.username}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{formData.profession || 'Designation not set'}</p>

                        <div className="w-full pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <Mail className="w-4 h-4 text-blue-500" />
                                <span className="truncate">{formData.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <span>{formData.location || 'Location not set'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Profile Edit Form */}
                <div className="w-full md:w-2/3">
                    <div className="glass-panel p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
                            {message.text && (
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                    } animate-fade-in`}>
                                    {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    {message.text}
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Username */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Username</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                            className="input-field pl-10"
                                            placeholder="Your name"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="input-field pl-10"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Profession */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Profession</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            name="profession"
                                            value={formData.profession}
                                            onChange={handleChange}
                                            className="input-field pl-10"
                                            placeholder="e.g. Graphic Designer"
                                        />
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="input-field pl-10"
                                            placeholder="e.g. New York, USA"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Bio</label>
                                <div className="relative">
                                    <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows="3"
                                        className="input-field pl-10 pt-2.5 resize-none"
                                        placeholder="Tell us a little about yourself..."
                                    ></textarea>
                                </div>
                            </div>

                            {/* Password Update */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">New Password (leave blank to keep current)</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input-field pl-10 pr-10"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Save button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 text-lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* ── Danger Zone ── */}
                            <div className="pt-2 border-t border-rose-200 dark:border-rose-900/40 mt-2">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                    ⚠️ Danger Zone — this action is permanent and cannot be undone.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); }}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 border-2 border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all active:scale-95"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete My Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* ── Delete Account Confirmation Modal ── */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}
                >
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-rose-200 dark:border-rose-900 animate-fade-in">
                        {/* Modal header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Account</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">This will permanently delete your account and all your PDFs.</p>
                            </div>
                        </div>

                        {/* Confirmation input */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Type <span className="font-black text-rose-600 tracking-wider">DELETE</span> to confirm
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="Type DELETE here"
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors text-sm font-mono tracking-widest"
                                autoFocus
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                {deleteLoading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                                ) : (
                                    <><Trash2 className="w-4 h-4" /> Delete Forever</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;

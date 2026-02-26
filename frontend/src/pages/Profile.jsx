import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../store/authStore';
import { User, Mail, Lock, Briefcase, MapPin, AlignLeft, Camera, Eye, EyeOff, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
    const { user, updateProfile } = useAuthStore();
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
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

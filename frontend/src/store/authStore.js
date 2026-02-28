import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: true,

    loadUser: async () => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }

        try {
            const res = await axios.get('/api/user/profile');
            set({ user: res.data, isAuthenticated: true, loading: false });
        } catch {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            set({ user: null, token: null, isAuthenticated: false, loading: false });
        }
    },

    register: async ({ email, password, username, profession }) => {
        try {
            const res = await axios.post('/api/auth/register', { email, password, username, profession });
            const token = res.data.token;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            set({ token, user: res.data.user, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (err) {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            set({ token: null, user: null, isAuthenticated: false, loading: false });
            return { success: false, msg: err.response?.data?.msg || 'Registration failed' };
        }
    },

    login: async ({ email, password }) => {
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            const token = res.data.token;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            set({ token, user: res.data.user, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (err) {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            set({ token: null, user: null, isAuthenticated: false, loading: false });
            return { success: false, msg: err.response?.data?.msg || 'Login failed' };
        }
    },

    googleLogin: async (idToken) => {
        try {
            const res = await axios.post('/api/auth/google', { idToken });
            const token = res.data.token;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            set({ token, user: res.data.user, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (err) {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            set({ token: null, user: null, isAuthenticated: false, loading: false });
            return { success: false, msg: err.response?.data?.msg || 'Google login failed' };
        }
    },

    updateProfile: async (formData) => {
        try {
            // formData should be a FormData object for file upload
            const res = await axios.put('/api/user/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            set({ user: res.data });
            return { success: true, user: res.data };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Profile update failed' };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        set({ token: null, user: null, isAuthenticated: false, loading: false });
    }
}));

export default useAuthStore;

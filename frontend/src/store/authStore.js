import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: true,

    loadUser: async () => {
        if (localStorage.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }

        try {
            const res = await axios.get('http://localhost:5000/api/user/profile');
            set({ user: res.data, isAuthenticated: true, loading: false });
        } catch (err) {
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false, loading: false });
        }
    },

    register: async ({ email, password, username }) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', { email, password, username });
            localStorage.setItem('token', res.data.token);
            set({ token: res.data.token, user: res.data.user, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (err) {
            localStorage.removeItem('token');
            set({ token: null, isAuthenticated: false, loading: false });
            return { success: false, msg: err.response?.data?.msg || 'Registration failed' };
        }
    },

    login: async ({ email, password }) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            set({ token: res.data.token, user: res.data.user, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (err) {
            localStorage.removeItem('token');
            set({ token: null, isAuthenticated: false, loading: false });
            return { success: false, msg: err.response?.data?.msg || 'Login failed' };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        set({ token: null, user: null, isAuthenticated: false, loading: false });
    }
}));

export default useAuthStore;

import { create } from 'zustand';
import axios from 'axios';
import API_URL from '../config';

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
            set({ user: null, token: null, isAuthenticated: false, loading: false });
            return;
        }

        try {
            const res = await axios.get(`${API_URL}/api/user/profile`);
            set({ user: res.data, isAuthenticated: true, loading: false });
        } catch (err) {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            set({ user: null, token: null, isAuthenticated: false, loading: false });
        }
    },

    register: async ({ email, password, username, profession }) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/register`, { email, password, username, profession });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            set({ token, user, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Registration failed' };
        }
    },

    login: async ({ email, password }) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            set({ token, user, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (err) {
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

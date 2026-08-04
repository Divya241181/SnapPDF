import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreatePDF from './pages/CreatePDF';
import EditPDF from './pages/EditPDF';
import Profile from './pages/Profile';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Contact from './pages/Contact';
import Documentation from './pages/Documentation';
import Mission from './pages/Mission';
import Security from './pages/Security';
import Features from './pages/Features';
import NotFound from './pages/NotFound';

// Components
import NewNavbar from './components/NewNavbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-bg-light dark:bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

/** AuthLayout — for Login & Register (centered form, hero-bg contained) */
const AuthLayout = () => (
  <div style={{ position: 'relative', overflow: 'hidden' }}>
    <Outlet />
  </div>
);

/** AppLayout — for authenticated pages: Dashboard, CreatePDF, Profile, EditPDF */
const AppLayout = () => (
  <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-24 sm:pb-8">
    <Outlet />
  </div>
);

function App() {
  const { loadUser } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col transition-colors duration-300">
        <NewNavbar />

        {/* pb-20 on mobile to avoid bottom nav overlap */}
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/security" element={<Security />} />
            <Route path="/features" element={<Features />} />

            {/* Auth pages — self-contained full-screen layouts (hero-bg isolated) */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Authenticated app pages — shared constrained-width layout */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/create" element={
                <ProtectedRoute><CreatePDF /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
              <Route path="/edit/:id" element={
                <ProtectedRoute><EditPDF /></ProtectedRoute>
              } />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </main>

        <Footer />

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;

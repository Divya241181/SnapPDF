import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, googleLogin } = useAuthStore();
    const { theme } = useThemeStore();
    const navigate = useNavigate();
    const [googleWidth, setGoogleWidth] = useState(384);

    useEffect(() => {
        const handleResize = () => {
            const width = Math.min(window.innerWidth - 64, 320); // 368 - 48 padding = 320
            setGoogleWidth(Math.max(width, 200)); 
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        const result = await googleLogin(credentialResponse.credential);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.msg);
        }
        setLoading(false);
    };

    const handleGoogleError = () => {
        setError('Google authentication failed. Please try again.');
    };

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
        <section style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            padding: '12px',
            background: 'var(--bg)'
        }}>
            <div className="hero-bg">
              <div className="hero-mesh"></div>
              <div className="grid-lines"></div>
              <div className="hero-orb hero-orb-1"></div>
              <div className="hero-orb hero-orb-2"></div>
            </div>

            <div style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '368px',
                background: 'var(--surface)',
                backdropFilter: 'saturate(180%) blur(24px)',
                WebkitBackdropFilter: 'saturate(180%) blur(24px)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <div style={{ 
                        width: '32px', height: '32px', margin: '0 auto 8px auto', borderRadius: '8px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, #8B7FFF 100%)',
                        display: 'grid', placeItems: 'center', color: '#fff', fontSize: '16px', fontWeight: '700',
                        boxShadow: '0 4px 16px rgba(91,78,232,0.3)'
                    }}>S</div>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '2px' }}>Welcome back</h2>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Log in to your SnapPDF account</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E', padding: '6px 10px', borderRadius: '6px', marginBottom: '12px', fontSize: '11px', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" style={{ marginRight: '4px', flexShrink: 0 }}>
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '2px', color: 'var(--text-muted)' }}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                            placeholder="you@example.com"
                            style={{
                                width: '100%', padding: '6px 10px', fontSize: '12px',
                                background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
                                borderRadius: '6px', color: 'var(--text)', outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 500, marginBottom: '2px', color: 'var(--text-muted)' }}>
                            Password
                            <Link to="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Forgot?</Link>
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                            placeholder="••••••••"
                            style={{
                                width: '100%', padding: '6px 10px', fontSize: '12px',
                                background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
                                borderRadius: '6px', color: 'var(--text)', outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
                        />
                    </div>

                    <button type="submit" className="btn btn-glow" style={{ width: '100%', justifyContent: 'center', marginTop: '4px', padding: '6px 10px', fontSize: '13px', borderRadius: '6px' }} disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                        {!loading && <svg className="btn-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0', opacity: 0.6 }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--text-faint)' }}></div>
                    <span style={{ margin: '0 8px', fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-faint)' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--text-faint)' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <GoogleLogin 
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme={theme === 'dark' ? 'filled_black' : 'outline'}
                        shape="rectangular"
                        size="large"
                        text="signin_with"
                        width={googleWidth}
                        ux_mode="popup"
                    />
                </div>

                <p style={{ marginTop: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--text)', fontWeight: 600 }}>Sign up</Link>
                </p>
            </div>
        </section>
    );
};

export default Login;

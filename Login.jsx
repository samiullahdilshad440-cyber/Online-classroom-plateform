import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const headlineRef = useRef(null);

  // GSAP animation
  useEffect(() => {
    if (headlineRef.current) {
      const chars = headlineRef.current.querySelectorAll('.char');
      gsap.fromTo(
        chars,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: 'power3.out', delay: 0.2 }
      );
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log('User detected, redirecting to dashboard...');
      navigate('/student/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log('🔵 Login attempt started');
    
    try {
      await login(formData.email, formData.password);
      console.log('🟢 Login API call successful');
      // Navigation will happen via the useEffect above
    } catch (err) {
      console.error('🔴 Login failed:', err);
      alert(err.response?.data?.error || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-surface backdrop-blur-md shadow-[0_0_30px_rgba(210,255,0,0.05)]">
        <h1 ref={headlineRef} className="font-display text-4xl text-text mb-2 tracking-tight">
          {'SYSTEM ONLINE'.split('').map((char, i) => (
            <span key={i} className="char inline-block" style={{ opacity: 0 }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
        <p className="text-text-muted font-mono text-sm mb-8 uppercase tracking-widest">
          // Initialize driver session
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-text-muted text-xs font-mono uppercase mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text font-mono focus:outline-none focus:border-accent transition-colors"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@test.com"
            />
          </div>
          <div>
            <label className="block text-text-muted text-xs font-mono uppercase mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text font-mono focus:outline-none focus:border-accent transition-colors"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="password123"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-accent text-bg font-display text-xl py-3 rounded-lg hover:shadow-[0_0_20px_rgba(210,255,0,0.4)] transition-all duration-300 uppercase tracking-wider"
          >
            Ignition
          </button>
        </form>

        <p className="text-center text-text-muted text-sm mt-8 font-mono">
          Test: student@test.com / password123
        </p>
      </div>
    </div>
  );
};

export default Login;
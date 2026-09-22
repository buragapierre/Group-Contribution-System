import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { useUser } from '../../data/UserContext';
import supabase from '../../lib/supabase';
import showIcon from '../../assets/show.png';
import hideIcon from '../../assets/hide.png';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [lockoutTimer, setLockoutTimer] = useState('');
  const navigate = useNavigate();
  const { login } = useUser();

  useEffect(() => {
    const saved = localStorage.getItem('loginAttempts');
    const savedLockout = localStorage.getItem('lockedUntil');
    
    if (saved) setAttempts(parseInt(saved));
    if (savedLockout) {
      const lockTime = parseInt(savedLockout);
      if (Date.now() < lockTime) {
        setLockedUntil(lockTime);
      } else {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockedUntil');
      }
    }
  }, []);

  useEffect(() => {
    if (!lockedUntil) return;

    const updateTimer = () => {
      const remaining = lockedUntil - Date.now();
      if (remaining <= 0) {
        setLockedUntil(null);
        setAttempts(0);
        setLockoutTimer('');
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockedUntil');
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setLockoutTimer(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (lockedUntil && Date.now() < lockedUntil) {
      setError(`Too many failed attempts. Try again in ${lockoutTimer}.`);
      return;
    }

    setSubmitting(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setSubmitting(false);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockTime = Date.now() + LOCKOUT_DURATION;
        setLockedUntil(lockTime);
        localStorage.setItem('lockedUntil', lockTime.toString());
        setError(`Too many failed attempts. Account locked for 15 minutes.`);
      } else {
        const remaining = MAX_ATTEMPTS - newAttempts;
        setError(`Invalid email or password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
      }
      return;
    }

    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockedUntil');
    setAttempts(0);
    setLockedUntil(null);

    await login(data.user);

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    setSubmitting(false);

    switch (profile?.role) {
      case 'admin': navigate('/admin'); break;
      case 'professor': navigate('/professor'); break;
      case 'student': navigate('/student'); break;
      default: navigate('/student');
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="logo">
          <span className="logo-box">▦</span>
          <span>SYNORA.</span>
        </div>
        <h1>Welcome Back<span>.</span></h1>
        <p className="subtitle">Sign in to your account to continue.</p>

        {error && <div className="auth-error">{error}</div>}
        {lockedUntil && (
          <div className="auth-lockout">
            Account locked. Try again in <strong>{lockoutTimer}</strong>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={lockedUntil && Date.now() < lockedUntil}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={lockedUntil && Date.now() < lockedUntil}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                <img src={showPassword ? hideIcon : showIcon} alt={showPassword ? 'Hide password' : 'Show password'} />
              </button>
            </div>
          </div>
          <div className="form-row" style={{ justifyContent: 'flex-end', marginBottom: 20 }}>
            <a href="#" style={{ fontSize: 11, color: 'var(--primary)' }}>Forgot password?</a>
          </div>
          <Button type="submit" variant="primary" className="full-width" disabled={submitting || (lockedUntil && Date.now() < lockedUntil)}>
            {submitting ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="auth-link" style={{ marginTop: 16 }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>

        <style>{`
          .auth-error { background: var(--danger-bg); color: var(--danger); padding: 10px 14px; border-radius: var(--radius-md); font-size: 11px; font-weight: 500; margin-bottom: 16px; }
          .auth-lockout { background: #fef3c7; color: #92400e; padding: 10px 14px; border-radius: var(--radius-md); font-size: 11px; font-weight: 500; margin-bottom: 16px; }
          .form-group { margin-bottom: 16px; }
          .form-group label { display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
          .form-group input { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 12px; outline: none; transition: 0.2s; }
          .form-group input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-bg); }
          .form-group input:disabled { background: var(--bg-light); cursor: not-allowed; }
          .password-wrapper { position: relative; }
          .password-wrapper input { padding-right: 50px; }
          .password-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; }
          .password-toggle img { width: 18px; height: 18px; opacity: 0.5; }
          .password-toggle:hover img { opacity: 1; }
          .form-row { display: flex; align-items: center; }
          .full-width { width: 100%; justify-content: center; }
        `}</style>
      </div>
    </div>
  );
}

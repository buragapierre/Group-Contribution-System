import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { useUser } from '../../data/UserContext';
import supabase from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setSubmitting(false);
      if (authError.message.includes('Invalid login')) {
        setError('Invalid email or password.');
      } else {
        setError(authError.message);
      }
      return;
    }

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
          <span>CONTRITRACK.</span>
        </div>
        <h1>Welcome Back<span>.</span></h1>
        <p className="subtitle">Sign in to your account to continue.</p>

        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-row" style={{ justifyContent: 'flex-end', marginBottom: 20 }}>
            <a href="#" style={{ fontSize: 11, color: 'var(--primary)' }}>Forgot password?</a>
          </div>
          <Button type="submit" variant="primary" className="full-width" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="auth-link" style={{ marginTop: 16 }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>

        <style>{`
          .auth-error { background: var(--danger-bg); color: var(--danger); padding: 10px 14px; border-radius: var(--radius-md); font-size: 11px; font-weight: 500; margin-bottom: 16px; }
          .form-group { margin-bottom: 16px; }
          .form-group label { display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
          .form-group input { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 12px; outline: none; transition: 0.2s; }
          .form-group input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-bg); }
          .form-row { display: flex; align-items: center; }
          .full-width { width: 100%; justify-content: center; }
        `}</style>
      </div>
    </div>
  );
}

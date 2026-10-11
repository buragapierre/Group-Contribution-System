import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import supabase from '../../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess('Reset link sent. Check your email inbox (and spam folder).');
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="logo">
          <span className="logo-box">▦</span>
          <span>SYNORA</span>
        </div>
        <h1>Forgot Password</h1>
        <p className="subtitle">Enter your account email to receive a reset link</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

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
          <Button type="submit" variant="primary" className="full-width" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <p className="auth-link" style={{ marginTop: 16 }}>
          <Link to="/login">Back to login</Link>
        </p>

        <style>{`
          .auth-error { background: var(--danger-bg); color: var(--danger); padding: 10px 14px; border-radius: var(--radius-md); font-size: 11px; font-weight: 500; margin-bottom: 16px; }
          .auth-success { background: #d1fae5; color: #065f46; padding: 10px 14px; border-radius: var(--radius-md); font-size: 11px; font-weight: 500; margin-bottom: 16px; }
          .form-group { margin-bottom: 16px; }
          .form-group label { display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
          .form-group input { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 12px; outline: none; transition: 0.2s; }
          .form-group input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-bg); }
          .full-width { width: 100%; justify-content: center; }
        `}</style>
      </div>
    </div>
  );
}

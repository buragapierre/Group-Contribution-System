import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import supabase from '../../lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      } else {
        setError('This reset link is invalid or expired. Request a new one.');
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }
    setSuccess('Password updated. Redirecting to login...');
    await supabase.auth.signOut();
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="logo">
          <span className="logo-box">▦</span>
          <span>SYNORA</span>
        </div>
        <h1>Reset Password</h1>
        <p className="subtitle">Choose a new password for your account</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {ready && !success && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="primary" className="full-width" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        )}

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

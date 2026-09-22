import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import supabase from '../../lib/supabase';
import showIcon from '../../assets/show.png';
import hideIcon from '../../assets/hide.png';

export default function SignUp() {
  const [form, setForm] = useState({ name: '', email: '', idNumber: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validatePassword = (password) => {
    const checks = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*]/.test(password),
    };
    return checks;
  };

  const passwordChecks = validatePassword(form.password);
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet requirements.');
      return;
    }

    setSubmitting(true);

    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          id_number: form.idNumber,
        },
      },
    });

    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setSuccess('Account created! You can now log in.');
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="logo">
          <span className="logo-box">▦</span>
          <span>SYNORA.</span>
        </div>
        <h1>Create Account<span>.</span></h1>
        <p className="subtitle">Fill in your details to get started.</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" placeholder="Juan Mendoza" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="you@university.edu" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>ID Number</label>
            <input type="text" name="idNumber" placeholder="e.g. 2024-00001" value={form.idNumber} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Create a password" value={form.password} onChange={handleChange} required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                <img src={showPassword ? hideIcon : showIcon} alt={showPassword ? 'Hide password' : 'Show password'} />
              </button>
            </div>
            {form.password && (
              <div className="password-requirements">
                <div className={passwordChecks.minLength ? 'req met' : 'req'}>✓ At least 8 characters</div>
                <div className={passwordChecks.hasUppercase ? 'req met' : 'req'}>✓ One uppercase letter</div>
                <div className={passwordChecks.hasNumber ? 'req met' : 'req'}>✓ One number</div>
                <div className={passwordChecks.hasSpecial ? 'req met' : 'req'}>✓ One special character (!@#$%^&*)</div>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Re-enter Password</label>
            <div className="password-wrapper">
              <input type={showPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange} required />
            </div>
          </div>
          <Button type="submit" variant="primary" className="full-width" disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <style>{`
          .auth-error { background: var(--danger-bg); color: var(--danger); padding: 10px 14px; border-radius: var(--radius-md); font-size: 11px; font-weight: 500; margin-bottom: 16px; }
          .auth-success { background: #d1fae5; color: #065f46; padding: 10px 14px; border-radius: var(--radius-md); font-size: 11px; font-weight: 500; margin-bottom: 16px; }
          .form-group { margin-bottom: 14px; }
          .form-group label { display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
          .form-group input { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 12px; outline: none; transition: 0.2s; }
          .form-group input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-bg); }
          .password-wrapper { position: relative; }
          .password-wrapper input { padding-right: 50px; }
          .password-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; }
          .password-toggle img { width: 18px; height: 18px; opacity: 0.5; }
          .password-toggle:hover img { opacity: 1; }
          .full-width { width: 100%; justify-content: center; margin-top: 8px; }
          .password-requirements { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
          .password-requirements .req { font-size: 10px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
          .password-requirements .req.met { color: var(--success); }
        `}</style>
      </div>
    </div>
  );
}

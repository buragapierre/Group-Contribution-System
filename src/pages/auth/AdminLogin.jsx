import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { useUser } from '../../data/UserContext';
import supabase from '../../lib/supabase';
import showIcon from '../../assets/show.png';
import hideIcon from '../../assets/hide.png';
import Captcha, { isCaptchaEnabled, verifyCaptchaToken } from '../../components/Turnstile';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);
  const [mfaRequired, setMfaRequired] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const navigate = useNavigate();
  const { login } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isCaptchaEnabled() && !captchaToken) {
      setError('Please complete the captcha.');
      return;
    }

    setSubmitting(true);

    try {
      await verifyCaptchaToken(captchaToken);
    } catch (captchaErr) {
      setSubmitting(false);
      setCaptchaKey(k => k + 1);
      setCaptchaToken('');
      setError(captchaErr.message);
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setSubmitting(false);
      setError('Invalid email or password.');
      return;
    }

    if (data.session) {
      try {
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2') {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const totp = factors?.totp?.[0];
          if (!totp) throw new Error('no-mfa');
          const { data: challenge, error: chError } = await supabase.auth.mfa.challenge({ factorId: totp.id });
          if (chError) throw chError;
          setMfaRequired({ factorId: totp.id, challengeId: challenge.id });
          setSubmitting(false);
          return;
        }
      } catch (mfaErr) {
        if (mfaErr.message === 'no-mfa') {
          setSubmitting(false);
          setError('Login needs extra verification. Try again.');
          return;
        }
      }
      await finishAdminLogin(data.user);
      return;
    }

    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.[0];
      if (!totp) throw new Error('no-mfa');
      const { data: challenge, error: chError } = await supabase.auth.mfa.challenge({ factorId: totp.id });
      if (chError) throw chError;
      setMfaRequired({ factorId: totp.id, challengeId: challenge.id });
      setSubmitting(false);
    } catch {
      setSubmitting(false);
      setError('Login needs extra verification. Try again.');
    }
  };

  const handleMfaVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { data, error } = await supabase.auth.mfa.verify({
      factorId: mfaRequired.factorId,
      challengeId: mfaRequired.challengeId,
      code: mfaCode.trim(),
    });
    if (error) {
      setSubmitting(false);
      setError('Wrong code. Try again.');
      return;
    }
    await finishAdminLogin(data.user);
  };

  const finishAdminLogin = async (authUser) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single();

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      setSubmitting(false);
      setError('This portal is for administrators only.');
      return;
    }

    await login(authUser);
    setSubmitting(false);
    navigate('/admin');
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="logo">
          <span className="logo-box">▦</span>
          <span>SYNORA</span>
        </div>
        <h1>Admin Login</h1>
        <p className="subtitle">Restricted to system administrators</p>

        {error && <div className="auth-error">{error}</div>}
        {mfaRequired ? (
          <form onSubmit={handleMfaVerify}>
            <div className="form-group">
              <label>Authenticator Code</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="6-digit code"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="primary" className="full-width" disabled={submitting}>
              {submitting ? 'Verifying...' : 'Verify'}
            </Button>
          </form>
        ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                <img src={showPassword ? hideIcon : showIcon} alt={showPassword ? 'Hide password' : 'Show password'} />
              </button>
            </div>
          </div>
          <Captcha onToken={setCaptchaToken} resetKey={captchaKey} />
          <Button type="submit" variant="primary" className="full-width" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Login as Admin'}
          </Button>
        </form>
        )}

        <p className="auth-link" style={{ marginTop: 16 }}>
          Not an admin? <Link to="/login">User login</Link>
        </p>

        <style>{`
          .auth-error { background: var(--danger-bg); color: var(--danger); padding: 10px 14px; border-radius: var(--radius-md); font-size: 11px; font-weight: 500; margin-bottom: 16px; }
          .form-group { margin-bottom: 16px; }
          .form-group label { display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
          .form-group input { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 12px; outline: none; transition: 0.2s; }
          .form-group input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-bg); }
          .password-wrapper { position: relative; }
          .password-wrapper input { padding-right: 50px; }
          .password-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; }
          .password-toggle img { width: 18px; height: 18px; opacity: 0.5; }
          .password-toggle:hover img { opacity: 1; }
          .full-width { width: 100%; justify-content: center; }
        `}</style>
      </div>
    </div>
  );
}

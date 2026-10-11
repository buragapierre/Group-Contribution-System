import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { useUser } from '../../data/UserContext';
import supabase from '../../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import './Security.css';

export default function Security() {
  const { currentUser } = useUser();
  const user = { name: currentUser?.name || 'Admin', avatar: currentUser?.avatar || 'AU', role: 'Admin' };

  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      setFactors(data?.totp || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startEnroll = async () => {
    setError('');
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      setEnrolling({ id: data.id, uri: data.totp.uri, secret: data.totp.secret });
    } catch (err) {
      setError(err.message || 'Could not start setup.');
    }
    setBusy(false);
  };

  const confirmEnroll = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: enrolling.id });
      if (challenge.error) throw challenge.error;
      const { error } = await supabase.auth.mfa.verify({
        factorId: enrolling.id,
        challengeId: challenge.data.id,
        code: code.trim(),
      });
      if (error) throw error;
      setEnrolling(null);
      setCode('');
      await load();
    } catch (err) {
      setError(err.message || 'Wrong code. Try again.');
    }
    setBusy(false);
  };

  const removeFactor = async (factorId) => {
    if (!confirm('Turn off two-factor authentication?')) return;
    setError('');
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      await load();
    } catch (err) {
      setError(err.message || 'Could not remove.');
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <Navbar title="Security" subtitle="Two-factor authentication for your admin account" user={user} />

      <div className="sec-card">
        <h3>Authenticator App (2FA)</h3>
        <p className="sec-desc">
          After your password, you will be asked for a 6-digit code from
          Google Authenticator, Authy, or any compatible app.
        </p>
        {error && <div className="auth-error">{error}</div>}

        {factors.length > 0 && !enrolling && (
          <div className="sec-active">
            <span className="sec-status-on">● ON</span>
            <span>{factors.length} authenticator{factors.length !== 1 ? 's' : ''} linked</span>
            {factors.map(f => (
              <Button key={f.id} variant="danger" size="sm" onClick={() => removeFactor(f.id)}>
                Turn Off
              </Button>
            ))}
          </div>
        )}

        {factors.length === 0 && !enrolling && (
          <Button variant="primary" disabled={busy} onClick={startEnroll}>
            {busy ? 'Starting...' : 'Set Up 2FA'}
          </Button>
        )}

        {enrolling && (
          <form onSubmit={confirmEnroll} className="sec-enroll">
            <p className="sec-step"><strong>Step 1.</strong> Scan this QR code with your authenticator app:</p>
            <div className="sec-qr"><QRCodeSVG value={enrolling.uri} size={180} /></div>
            <p className="sec-step"><strong>Step 2.</strong> Enter the 6-digit code it shows:</p>
            <div className="sec-code-row">
              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? 'Verifying...' : 'Confirm'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

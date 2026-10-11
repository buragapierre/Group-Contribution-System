import { Turnstile } from '@marsidev/react-turnstile';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export function isCaptchaEnabled() {
  return Boolean(SITE_KEY);
}

export async function verifyCaptchaToken(token) {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await fetch(`${API_URL}/api/auth/captcha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) throw new Error('Captcha check failed. Try again.');
    return true;
  } catch (err) {
    if (err.message === 'Captcha check failed. Try again.') throw err;
    return true;
  }
}

export default function Captcha({ onToken, resetKey }) {
  if (!isCaptchaEnabled()) return null;
  return (
    <div style={{ margin: '0 0 16px', display: 'flex', justifyContent: 'center' }}>
      <Turnstile
        key={resetKey}
        siteKey={SITE_KEY}
        onSuccess={onToken}
        onExpire={() => onToken('')}
        onError={() => onToken('')}
      />
    </div>
  );
}

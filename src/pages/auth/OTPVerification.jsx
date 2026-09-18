import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { users } from '../../data/mockData';
import { useUser } from '../../data/UserContext';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const pendingEmail = sessionStorage.getItem('otp_pending_email');
    const found = pendingEmail ? users.find(u => u.email === pendingEmail) : null;

    if (found) {
      login(found);
      switch (found.role) {
        case 'admin': navigate('/admin'); break;
        case 'professor': navigate('/professor'); break;
        case 'student': navigate('/student'); break;
        default: navigate('/student');
      }
    } else {
      navigate('/login');
    }
    sessionStorage.removeItem('otp_pending_email');
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="logo">
          <span className="logo-box">▦</span>
          <span>CONTRITRACK.</span>
        </div>
        <h1>Verify OTP<span>.</span></h1>
        <p className="subtitle">Enter the 6-digit code sent to your email.</p>

        <form onSubmit={handleSubmit}>
          <div className="otp-inputs">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                required
              />
            ))}
          </div>
          <Button type="submit" variant="primary" className="full-width" style={{ marginTop: 24 }}>Verify</Button>
        </form>

        <p className="auth-link" style={{ marginTop: 16 }}>
          Didn't receive the code?{' '}
          <button onClick={handleResend} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Resend OTP
          </button>
        </p>

        <style>{`
          .otp-inputs { display: flex; gap: 10px; justify-content: center; margin: 20px 0; }
          .otp-inputs input { width: 46px; height: 50px; text-align: center; font-size: 20px; font-weight: 700; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none; transition: 0.2s; }
          .otp-inputs input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-bg); }
          .full-width { width: 100%; justify-content: center; }
        `}</style>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';

export default function SignUp() {
  const [form, setForm] = useState({ name: '', email: '', idNumber: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/otp-verification');
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="logo">
          <span className="logo-box">▦</span>
          <span>CONTRITRACK.</span>
        </div>
        <h1>Create Account<span>.</span></h1>
        <p className="subtitle">Fill in your details to get started.</p>

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
            <input type="text" name="idNumber" placeholder="STU-001" value={form.idNumber} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Create a password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Re-enter Password</label>
            <input type="password" name="confirmPassword" placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange} required />
          </div>
          <Button type="submit" variant="primary" className="full-width">Sign Up</Button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <style>{`
          .form-group { margin-bottom: 14px; }
          .form-group label { display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
          .form-group input { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 12px; outline: none; transition: 0.2s; }
          .form-group input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-bg); }
          .full-width { width: 100%; justify-content: center; margin-top: 8px; }
        `}</style>
      </div>
    </div>
  );
}

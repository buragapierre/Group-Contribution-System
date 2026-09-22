import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { useUser } from '../../data/UserContext';
import { updateProfile } from '../../services/profiles';
import { PROGRAMS } from '../../lib/constants';

const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

export default function ProfileCompletion() {
  const { currentUser } = useUser();
  const [form, setForm] = useState({ course: '', yearLevel: '', section: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await updateProfile(currentUser.id, {
        course: form.course,
        year_level: form.yearLevel,
        section: form.section,
      });
      window.location.href = '/student';
    } catch (err) {
      setError(err.message || 'Failed to save profile.');
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar title="Complete Your Profile" subtitle="Please fill in your academic details to continue." user={user} />

      <div className="profile-completion-card">
        <div className="pc-welcome">
          <span className="pc-icon">◎</span>
          <h2>Welcome, {currentUser?.name}!</h2>
          <p>Complete your profile so we can set up your student experience.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course</label>
            <select name="course" value={form.course} onChange={handleChange} required>
              <option value="">Select your course...</option>
              {PROGRAMS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Year Level</label>
            <select name="yearLevel" value={form.yearLevel} onChange={handleChange} required>
              <option value="">Select year level...</option>
              {YEAR_LEVELS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Section</label>
            <input
              type="text"
              name="section"
              placeholder="e.g. A"
              value={form.section}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" variant="primary" className="full-width" disabled={submitting}>
            {submitting ? 'Saving...' : 'Continue'}
          </Button>
        </form>
      </div>

      <style>{`
        .profile-completion-card {
          background: var(--bg-white);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 32px;
          max-width: 420px;
        }
        .pc-welcome { text-align: center; margin-bottom: 28px; }
        .pc-icon { font-size: 36px; display: block; margin-bottom: 12px; }
        .pc-welcome h2 { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .pc-welcome p { font-size: 12px; color: var(--text-muted); }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
        .form-group input, .form-group select { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 12px; outline: none; transition: 0.2s; font-family: inherit; }
        .form-group input:focus, .form-group select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-bg); }
        .full-width { width: 100%; justify-content: center; }
        .auth-error { background: var(--danger-bg); color: var(--danger); padding: 10px 14px; border-radius: var(--radius-md); font-size: 11px; font-weight: 500; margin-bottom: 16px; }
      `}</style>
    </div>
  );
}

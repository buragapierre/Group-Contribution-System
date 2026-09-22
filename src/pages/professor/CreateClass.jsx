import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { useUser } from '../../data/UserContext';
import { createClass } from '../../services/classes';
import { PROGRAMS } from '../../lib/constants';
import './CreateClass.css';

const SEMESTERS = [
  "1st Semester",
  "2nd Semester",
  "Summer",
];

const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

const COLORS = ['lavender', 'blue', 'peach', 'green', 'pink'];

export default function CreateClass() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [form, setForm] = useState({
    subject: '',
    program: '',
    yearLevel: '',
    academicYear: 'AY 2026-2027',
    semester: '',
    section: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createClass({
        subject: form.subject,
        program: form.program,
        year_level: form.yearLevel || null,
        academic_year: form.academicYear,
        semester: form.semester,
        section: form.section || null,
        professor_id: currentUser.id,
        professor_name: currentUser.name,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
      navigate('/professor/classes');
    } catch (err) {
      setError(err.message || 'Failed to create class.');
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar title="Create Class" subtitle="Set up a new class for your students." user={user} />

      <div className="create-class-form">
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="e.g. Web Systems and Technologies"
              required
            />
          </div>

          <div className="form-group">
            <label>Program / Course</label>
            <select
              name="program"
              value={form.program}
              onChange={handleChange}
              required
            >
              <option value="">Select a program...</option>
              {PROGRAMS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <p className="form-hint">Used for organizing and filtering students.</p>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Year Level <span className="optional-label">(Optional)</span></label>
              <select name="yearLevel" value={form.yearLevel} onChange={handleChange}>
                <option value="">All year levels</option>
                {YEAR_LEVELS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <p className="form-hint">Leave blank to include all year levels.</p>
            </div>
            <div className="form-group">
              <label>Academic Year</label>
              <input type="text" name="academicYear" value={form.academicYear} onChange={handleChange} placeholder="e.g. AY 2026-2027" required />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Semester</label>
              <select name="semester" value={form.semester} onChange={handleChange} required>
                <option value="">Select semester</option>
                {SEMESTERS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Section <span className="optional-label">(Optional)</span></label>
              <input
                type="text"
                name="section"
                value={form.section}
                onChange={handleChange}
                placeholder="e.g. A"
              />
            </div>
          </div>
          <p className="form-hint">Students join using the class code shown after creation.</p>

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Class'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { useUser } from '../../data/UserContext';
import './CreateClass.css';

const COURSES = [
  "Web Systems and Technologies",
  "Database Systems",
  "Research Methods",
  "Software Engineering",
  "Data Structures and Algorithms",
  "Operating Systems",
  "Computer Networks",
  "Object-Oriented Programming",
  "Systems Analysis and Design",
  "IT Capstone Project",
];

const SEMESTERS = [
  "1st Semester",
  "2nd Semester",
  "Summer",
];

const SECTIONS = [
  "BSIT 1-A", "BSIT 1-B",
  "BSIT 2-A", "BSIT 2-B",
  "BSIT 3-A", "BSIT 3-B",
  "BSIT 4-A", "BSIT 4-B",
  "No Section / General Class",
];

export default function CreateClass() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [form, setForm] = useState({
    course: '',
    academicYear: 'AY 2026-2027',
    semester: '',
    section: '',
  });

  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'section' && value === 'No Section / General Class' ? { section: null } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/professor/classes');
  };

  return (
    <div>
      <Navbar title="Create Class" subtitle="Set up a new class for your students." user={user} />

      <div className="create-class-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course</label>
            <select name="course" value={form.course} onChange={handleChange} required>
              <option value="">Select a course</option>
              {COURSES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Academic Year</label>
              <input type="text" name="academicYear" value={form.academicYear} onChange={handleChange} placeholder="e.g. AY 2026-2027" required />
            </div>
            <div className="form-group">
              <label>Semester</label>
              <select name="semester" value={form.semester} onChange={handleChange} required>
                <option value="">Select semester</option>
                {SEMESTERS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Section <span className="optional-label">(Optional)</span></label>
            <select name="section" value={form.section || 'No Section / General Class'} onChange={handleChange}>
              <option value="No Section / General Class">No Section / General Class</option>
              {SECTIONS.filter(s => s !== 'No Section / General Class').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <p className="form-hint">Leave as "No Section / General Class" if you handle students without a specific section.</p>
          </div>

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Class</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

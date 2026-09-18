import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { useUser } from '../../data/UserContext';
import { fetchClasses } from '../../services/classes';
import { createProject } from '../../services/projects';
import './CreateProject.css';

const COLORS = ['lavender', 'blue', 'peach', 'green', 'pink'];
const ICONS = ['✦', '◇', '◌', '◆', '◎'];

export default function CreateProject() {
  const { classId } = useParams();
  const { currentUser } = useUser();
  const [form, setForm] = useState({ title: '', description: '', requirements: '', deadline: '', selectedClassId: classId || '' });
  const [professorClasses, setProfessorClasses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };

  useEffect(() => {
    if (!currentUser) return;
    fetchClasses(currentUser.id).then(setProfessorClasses).catch(() => {});
  }, [currentUser]);

  const selectedClass = professorClasses.find(c => c.id === parseInt(classId || form.selectedClassId));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetClassId = classId || form.selectedClassId;
    if (!targetClassId) return;

    setSubmitting(true);
    setError('');
    try {
      await createProject({
        title: form.title,
        description: form.description,
        requirements: form.requirements,
        deadline: form.deadline,
        class_id: parseInt(targetClassId),
        professor_id: currentUser.id,
        professor_name: currentUser.name,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        icon: ICONS[Math.floor(Math.random() * ICONS.length)],
        overall_progress: 0,
        status: 'active',
      });
      navigate(`/professor/classes/${targetClassId}`);
    } catch (err) {
      setError(err.message || 'Failed to create project.');
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar title="Create Project" subtitle={selectedClass ? `Add a project to ${selectedClass.course}` : "Set up a new project for your students."} user={user} />

      {selectedClass && (
        <div className="class-context-bar">
          <span className="class-context-label">Creating project for:</span>
          <span className="class-context-name">{selectedClass.course}</span>
          <span className="class-context-meta">{selectedClass.section || 'General Class'} · {selectedClass.semester} · {selectedClass.academic_year}</span>
        </div>
      )}

      <div className="create-project-form">
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!classId && professorClasses.length > 0 && (
            <div className="form-group">
              <label>Select Class</label>
              <select name="selectedClassId" value={form.selectedClassId} onChange={handleChange} required>
                <option value="">Choose a class...</option>
                {professorClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.course} - {c.section || 'General'} ({c.semester})</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Project Title</label>
            <input type="text" name="title" placeholder="e.g. Capstone Documentation" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows={4} placeholder="Describe the project objectives and scope..." value={form.description} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Requirements</label>
            <textarea name="requirements" rows={3} placeholder="List the project requirements..." value={form.requirements} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Overall Deadline</label>
            <input type="date" name="deadline" value={form.deadline} onChange={handleChange} required />
          </div>
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

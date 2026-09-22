import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { useUser } from '../../data/UserContext';
import { fetchClassById, fetchClassStudentIds } from '../../services/classes';
import { fetchProjectsByClass } from '../../services/projects';
import { createGroup } from '../../services/groups';
import { fetchAllProfiles } from '../../services/profiles';
import memberIcon from '../../assets/member.png';
import './CreateGroup.css';

export default function CreateGroup() {
  const { classId } = useParams();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [cls, setCls] = useState(null);
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: '', projectId: '', leaderId: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };

  useEffect(() => {
    if (!classId) return;
    Promise.all([
      fetchClassById(classId),
      fetchProjectsByClass(classId),
      fetchClassStudentIds(classId),
    ]).then(([classData, classProjects, studentIds]) => {
      setCls(classData);
      setProjects(classProjects);
      if (studentIds.length > 0) {
        fetchAllProfiles().then(allProfiles => {
          const classStudents = allProfiles.filter(p => studentIds.includes(p.id));
          setStudents(classStudents);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, [classId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Enter a group name.');
      return;
    }
    if (!form.projectId) {
      setError('Select a project.');
      return;
    }
    if (!form.leaderId) {
      setError('Select a leader for this group.');
      return;
    }

    setSubmitting(true);
    setError('');

    const leader = students.find(s => s.id === form.leaderId);
    const selectedProject = projects.find(p => p.id === parseInt(form.projectId));

    try {
      await createGroup({
        name: form.name,
        project_id: parseInt(form.projectId),
        project_name: selectedProject?.title || '',
        class_id: parseInt(classId),
        leader_id: form.leaderId,
        leader_name: leader?.name || '',
        progress: 0,
        status: 'active',
      });

      navigate(`/professor/classes/${classId}`);
    } catch (err) {
      setError(err.message || 'Failed to create group.');
      setSubmitting(false);
    }
  };

  const selectedLeader = students.find(s => s.id === form.leaderId);
  const selectedProject = projects.find(p => p.id === parseInt(form.projectId));

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  if (!cls) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Class not found.</div>;

  return (
    <div>
      <Navbar title="Create Group" subtitle={`Add a new group to ${cls.subject}`} user={user} />

      <div className="class-context-bar">
        <span className="class-context-label">Creating group for:</span>
        <span className="class-context-name">{cls.subject}</span>
        <span className="class-context-meta">{cls.section || 'General Class'} · {cls.semester}</span>
      </div>

      <div className="cg-layout">
        <div className="cg-form-card">
          <h3>Group Details</h3>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="cg-form-group">
              <label>Group Name</label>
              <input type="text" name="name" placeholder="e.g. Group 1" value={form.name} onChange={handleChange} required />
            </div>

            <div className="cg-form-group">
              <label>Project</label>
              <select name="projectId" value={form.projectId} onChange={handleChange} required>
                <option value="">Select a project...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              {projects.length === 0 && (
                <p className="cg-form-hint">No projects available. Create a project first.</p>
              )}
            </div>

            <div className="cg-form-group">
              <label>Select Leader</label>
              {students.length === 0 ? (
              <div className="cg-empty">
                <div className="cg-empty-icon"><img src={memberIcon} alt="Members" /></div>
                <div>No students enrolled in this class yet.</div>
              </div>
              ) : (
                <div className="cg-leader-grid">
                  {students.map(s => (
                    <div
                      key={s.id}
                      className={`cg-leader-card ${form.leaderId === s.id ? 'selected' : ''}`}
                      onClick={() => setForm(prev => ({ ...prev, leaderId: s.id }))}
                    >
                      <div className="cg-leader-avatar">{s.avatar}</div>
                      <div className="cg-leader-info">
                        <span className="cg-leader-name">{s.name}</span>
                        <span className="cg-leader-id">{s.id_number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="cg-form-hint">The leader will add members to the group after creation.</p>
            </div>

            <div className="cg-form-actions">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </form>
        </div>

        <div className="cg-sidebar">
          <div className="cg-info-card">
            <h4>Summary</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="cg-stat-row">
                <span className="cg-stat-label">Class</span>
                <span className="cg-stat-value">{cls.subject}</span>
              </div>
              <div className="cg-stat-row">
                <span className="cg-stat-label">Section</span>
                <span className="cg-stat-value">{cls.section || 'General'}</span>
              </div>
              <div className="cg-stat-row">
                <span className="cg-stat-label">Available Students</span>
                <span className="cg-stat-value">{students.length}</span>
              </div>
              <div className="cg-stat-row">
                <span className="cg-stat-label">Available Projects</span>
                <span className="cg-stat-value">{projects.length}</span>
              </div>
              {selectedProject && (
                <>
                  <div className="cg-divider" />
                  <div className="cg-stat-row">
                    <span className="cg-stat-label">Selected Project</span>
                    <span className="cg-stat-value" style={{ color: 'var(--primary)' }}>{selectedProject.title}</span>
                  </div>
                </>
              )}
              {selectedLeader && (
                <div className="cg-stat-row">
                  <span className="cg-stat-label">Selected Leader</span>
                  <span className="cg-stat-value" style={{ color: 'var(--primary)' }}>{selectedLeader.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

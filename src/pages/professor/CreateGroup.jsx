import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { useUser } from '../../data/UserContext';
import { fetchClassById, fetchClassStudentIds } from '../../services/classes';
import { fetchProjectsByClass } from '../../services/projects';
import { createGroup, addGroupMember } from '../../services/groups';
import { fetchAllProfiles } from '../../services/profiles';
import './CreateProject.css';

export default function CreateGroup() {
  const { classId } = useParams();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [cls, setCls] = useState(null);
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: '', projectId: '', leaderId: '', members: [] });
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

  const toggleMember = (studentId) => {
    setForm(prev => {
      const members = prev.members.includes(studentId)
        ? prev.members.filter(id => id !== studentId)
        : [...prev.members, studentId];
      const leaderId = members.includes(prev.leaderId) ? prev.leaderId : '';
      return { ...prev, members, leaderId };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.members.length === 0) {
      setError('Add at least one member.');
      return;
    }
    if (!form.leaderId) {
      setError('Select a leader from the members.');
      return;
    }

    setSubmitting(true);
    setError('');

    const leader = students.find(s => s.id === form.leaderId);
    const selectedProject = projects.find(p => p.id === parseInt(form.projectId));

    try {
      const group = await createGroup({
        name: form.name,
        project_id: parseInt(form.projectId),
        project_name: selectedProject?.title || '',
        class_id: parseInt(classId),
        leader_id: form.leaderId,
        leader_name: leader?.name || '',
        progress: 0,
        status: 'active',
      });

      await Promise.all(form.members.map(memberId => addGroupMember(group.id, memberId)));

      navigate(`/professor/classes/${classId}`);
    } catch (err) {
      setError(err.message || 'Failed to create group.');
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  if (!cls) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Class not found.</div>;

  return (
    <div>
      <Navbar title="Create Group" subtitle={`Add a group to ${cls.course}`} user={user} />

      <div className="class-context-bar">
        <span className="class-context-label">Creating group for:</span>
        <span className="class-context-name">{cls.course}</span>
        <span className="class-context-meta">{cls.section || 'General Class'} · {cls.semester}</span>
      </div>

      <div className="create-project-form">
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Group Name</label>
            <input type="text" name="name" placeholder="e.g. Group 1" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Project</label>
            <select name="projectId" value={form.projectId} onChange={handleChange} required>
              <option value="">Select a project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Members</label>
            {students.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>No students enrolled in this class yet.</p>
            ) : (
              <div className="member-select-grid">
                {students.map(s => (
                  <label key={s.id} className={`member-select-card ${form.members.includes(s.id) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={form.members.includes(s.id)}
                      onChange={() => toggleMember(s.id)}
                    />
                    <div className="member-select-avatar">{s.avatar}</div>
                    <div className="member-select-info">
                      <span className="member-select-name">{s.name}</span>
                      <span className="member-select-id">{s.id_number}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {form.members.length > 0 && (
            <div className="form-group">
              <label>Assign Leader</label>
              <select name="leaderId" value={form.leaderId} onChange={handleChange} required>
                <option value="">Select a leader...</option>
                {form.members.map(memberId => {
                  const member = students.find(s => s.id === memberId);
                  return member ? (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ) : null;
                })}
              </select>
              <p className="form-hint">Leader can manage tasks and review submissions for this group.</p>
            </div>
          )}

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

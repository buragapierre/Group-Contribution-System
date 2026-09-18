import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { useUser } from '../../data/UserContext';
import { useLeaderGroup } from '../../data/useLeaderGroup';
import { fetchGroupMembers } from '../../services/groups';
import { createTask } from '../../services/tasks';
import './CreateTask.css';

const COLORS = ['lavender', 'blue', 'peach', 'green', 'pink', 'yellow'];

export default function CreateTask() {
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', deadline: '', priority: 'medium' });
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useUser();
  const group = useLeaderGroup(currentUser);
  const user = { name: currentUser?.name || 'Leader', avatar: currentUser?.avatar || 'LD', role: 'Group Leader' };

  const [groupMembers, setGroupMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!group) return;
    fetchGroupMembers(group.id)
      .then(members => {
        setGroupMembers(members);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [group]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createTask({
        title: form.title,
        description: form.description,
        group_id: group.id,
        project_id: group.project_id,
        class_id: group.class_id,
        assigned_to: form.assignedTo,
        assigned_by: currentUser.id,
        deadline: form.deadline,
        priority: form.priority,
        status: 'assigned',
        progress: 0,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
      navigate(`/leader/tasks${location.search}`);
    } catch (err) {
      setError(err.message || 'Failed to create task.');
      setSubmitting(false);
    }
  };

  if (!group) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No group selected.</div>;
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <Navbar title="Create Task" subtitle={`Assign to ${group.name} · ${group.project_name}`} user={user} />

      <div className="create-task-context">
        <span className="ctc-label">Creating task for:</span>
        <span className="ctc-group">{group.name}</span>
        <span className="ctc-project">{group.project_name}</span>
      </div>

      <div className="create-task-form">
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title</label>
            <input type="text" name="title" placeholder="e.g. Chapter 2 Documentation" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows={3} placeholder="Describe the task requirements and deliverables..." value={form.description} onChange={handleChange} required />
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label>Assigned To</label>
              <select name="assignedTo" value={form.assignedTo} onChange={handleChange} required>
                <option value="">Select a member...</option>
                {groupMembers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Deadline</label>
            <input type="date" name="deadline" value={form.deadline} onChange={handleChange} required />
          </div>
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import CustomSelect from '../../components/CustomSelect';
import CustomDateInput from '../../components/CustomDateInput';
import { useUser } from '../../data/UserContext';
import { useLeaderGroup } from '../../data/useLeaderGroup';
import { fetchGroupMembers } from '../../services/groups';
import { createTask } from '../../services/tasks';
import { logActivity } from '../../services/activities';
import './CreateTask.css';

const COLORS = ['lavender', 'blue', 'peach', 'green', 'pink', 'yellow'];
const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

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

  const daysLeft = (() => {
    if (!form.deadline) return null;
    const diff = Math.round((new Date(form.deadline) - new Date(todayStr())) / (24 * 60 * 60 * 1000));
    return diff;
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assignedTo) {
      setError('Select a member to assign this task to.');
      return;
    }
    if (!form.deadline) {
      setError('Pick a deadline for this task.');
      return;
    }
    if (form.deadline && form.deadline < todayStr()) {
      setError('Deadline cannot be in the past.');
      return;
    }
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
      const assignee = groupMembers.find(m => m.id === form.assignedTo);
      await logActivity({
        user_id: currentUser.id,
        type: 'task_assigned',
        message: `You assigned "${form.title}" to ${assignee?.name || 'a member'}`,
        timestamp: new Date().toISOString(),
      });
      await logActivity({
        user_id: form.assignedTo,
        type: 'task_assigned',
        message: `You were assigned "${form.title}"`,
        timestamp: new Date().toISOString(),
      });
      navigate(`/leader/tasks${location.search}`);
    } catch (err) {
      setError(err.message || 'Failed to create task.');
      setSubmitting(false);
    }
  };

  if (!group) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No group selected.</div>;
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  const assignee = groupMembers.find(m => m.id === form.assignedTo);

  return (
    <div>
      <Navbar title="Create Task" subtitle={`Assign to ${group.name} · ${group.project_name}`} user={user} />

      <div className="ct-layout">
        <div className="ct-form-card">
          <h3>Task Details</h3>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="ct-form-group">
              <label>Task Title</label>
              <input type="text" name="title" placeholder="e.g. Chapter 2 Documentation" value={form.title} onChange={handleChange} required />
            </div>
            <div className="ct-form-group">
              <label>Description</label>
              <textarea name="description" rows={3} placeholder="Describe the task requirements and deliverables..." value={form.description} onChange={handleChange} required />
            </div>
            <div className="ct-form-group">
              <label>Assigned To</label>
              <CustomSelect
                value={form.assignedTo}
                onChange={(v) => setForm({ ...form, assignedTo: v })}
                placeholder="Select a member..."
                options={groupMembers.map(u => ({
                  value: u.id,
                  label: u.name,
                  avatar: u.avatar,
                  hint: u.id_number || '',
                }))}
              />
            </div>
            <div className="ct-form-row-2">
              <div className="ct-form-group">
                <label>Priority</label>
                <div className="ct-priority-pills">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      className={`ct-pill ct-pill-${p.value} ${form.priority === p.value ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, priority: p.value })}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ct-form-group">
                <label>Deadline</label>
                <CustomDateInput
                  value={form.deadline}
                  min={todayStr()}
                  onChange={(v) => setForm({ ...form, deadline: v })}
                />
                {daysLeft !== null && daysLeft >= 0 && (
                  <p className="ct-form-hint">
                    {daysLeft === 0 ? 'Due today' : daysLeft === 1 ? 'Due tomorrow' : `Due in ${daysLeft} days`}
                  </p>
                )}
              </div>
            </div>

            <div className="ct-form-actions">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </form>
        </div>

        <div className="ct-sidebar">
          <div className="ct-info-card">
            <h4>Summary</h4>
            <div className="ct-summary">
              <div className="ct-stat-row">
                <span className="ct-stat-label">Group</span>
                <span className="ct-stat-value">{group.name}</span>
              </div>
              <div className="ct-stat-row">
                <span className="ct-stat-label">Title</span>
                <span className="ct-stat-value">{form.title || '—'}</span>
              </div>
              <div className="ct-stat-row">
                <span className="ct-stat-label">Assignee</span>
                <span className="ct-stat-value" style={assignee ? { color: 'var(--primary)' } : undefined}>
                  {assignee?.name || '—'}
                </span>
              </div>
              <div className="ct-stat-row">
                <span className="ct-stat-label">Priority</span>
                <span className="ct-stat-value ct-capitalize">{form.priority}</span>
              </div>
              <div className="ct-stat-row">
                <span className="ct-stat-label">Deadline</span>
                <span className="ct-stat-value">
                  {form.deadline
                    ? new Date(`${form.deadline}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

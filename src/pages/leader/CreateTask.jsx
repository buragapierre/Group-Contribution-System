import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { users } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import './CreateTask.css';

export default function CreateTask() {
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', deadline: '', priority: 'medium' });
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const user = { name: currentUser?.name || 'Leader', avatar: currentUser?.avatar || 'LD', role: 'Group Leader' };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/leader/tasks');
  };

  return (
    <div>
      <Navbar title="Create Task" subtitle="Assign a new task to a group member." user={user} />

      <div className="create-task-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title</label>
            <input type="text" name="title" placeholder="e.g. Chapter 2 Documentation" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows={3} placeholder="Describe the task requirements..." value={form.description} onChange={handleChange} required />
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label>Assigned Student</label>
              <select name="assignedTo" value={form.assignedTo} onChange={handleChange} required>
                <option value="">Select member...</option>
                {users.filter(u => u.role === 'student').map(u => (
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
            <Button type="submit" variant="primary">Create Task</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

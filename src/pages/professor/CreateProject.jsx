import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import './CreateProject.css';

export default function CreateProject() {
  const [form, setForm] = useState({ title: '', description: '', requirements: '', deadline: '' });
  const navigate = useNavigate();
  const user = { name: 'Dr. Maria Santos', avatar: 'MS', role: 'Professor' };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/professor/projects');
  };

  return (
    <div>
      <Navbar title="Create Project" subtitle="Set up a new project for your students." user={user} />

      <div className="create-project-form">
        <form onSubmit={handleSubmit}>
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
            <Button type="submit" variant="primary">Create Project</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

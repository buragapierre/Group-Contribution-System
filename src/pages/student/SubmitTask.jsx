import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { useUser } from '../../data/UserContext';
import { fetchTaskById, updateTaskStatus } from '../../services/tasks';
import { createSubmission } from '../../services/submissions';
import './SubmitTask.css';

export default function SubmitTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState([]);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

  useEffect(() => {
    if (!id) return;
    fetchTaskById(parseInt(id)).then(result => {
      setTask(result);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const fileNames = files.map(f => f.name);
      await createSubmission({
        task_id: parseInt(id),
        user_id: currentUser.id,
        files: fileNames,
        comment,
        status: 'submitted',
      });
      await updateTaskStatus(parseInt(id), 'submitted');
      navigate(`/student/tasks/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit task.');
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  if (!task) {
    return (
      <div>
        <Navbar title="Task Not Found" subtitle="" user={user} />
        <p>Task not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Submit Task" subtitle="Upload your work and submit for review." user={user} />

      <Link to={`/student/tasks/${id}`} className="back-link">← Back to Task</Link>

      <div className="submit-task-form">
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title</label>
            <input type="text" value={task.title} disabled />
          </div>
          <div className="form-group">
            <label>Requirements</label>
            <textarea value={task.description || ''} disabled rows={3} />
          </div>
          <div className="form-group">
            <label>Attach Files</label>
            <div className="file-upload">
              <input type="file" multiple onChange={handleFileChange} id="file-input" />
              <label htmlFor="file-input" className="file-label">
                Choose Files
              </label>
              {files.length > 0 && (
                <div className="file-list">
                  {files.map((f, i) => <span key={i} className="file-tag">{f.name}</span>)}
                </div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>Comment</label>
            <textarea
              rows={4}
              placeholder="Add any comments about your submission..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

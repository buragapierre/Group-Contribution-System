import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
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

      <div className="submit-task-grid">
        <div className="submit-task-form">
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Comment</label>
              <textarea
                rows={4}
                placeholder="Add any comments about your submission..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Attach Files</label>
              <div className="file-upload">
                <input type="file" multiple onChange={handleFileChange} id="file-input" />
                <label htmlFor="file-input" className="file-label">
                  <span className="file-icon">📎</span>
                  <span className="file-text">Choose Files</span>
                  <span className="file-hint">PDF, DOCX, PNG, JPG (Max 10MB each)</span>
                </label>
                {files.length > 0 && (
                  <div className="file-list">
                    {files.map((f, i) => (
                      <div key={i} className="file-item">
                        <span className="file-name">📄 {f.name}</span>
                        <button type="button" className="file-remove" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Task'}
              </Button>
            </div>
          </form>
        </div>

        <div className="submit-sidebar">
          <div className="submit-info-card">
            <h3>Task Details</h3>
            <div className="submit-info-item">
              <span className="label">Title</span>
              <span className="value">{task.title}</span>
            </div>
            <div className="submit-info-item">
              <span className="label">Status</span>
              <StatusBadge status={task.status} />
            </div>
            <div className="submit-info-item">
              <span className="label">Priority</span>
              <span className="value">{task.priority}</span>
            </div>
            <div className="submit-info-item">
              <span className="label">Deadline</span>
              <span className="value">{new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="submit-info-card">
            <h3>Requirements</h3>
            <p className="submit-requirements">{task.description || 'No requirements specified.'}</p>
          </div>

          <div className="submit-info-card">
            <h3>Submission Tips</h3>
            <ul className="submit-tips">
              <li>Make sure all files are included</li>
              <li>Add a comment explaining your work</li>
              <li>Check the deadline before submitting</li>
              <li>You can resubmit if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

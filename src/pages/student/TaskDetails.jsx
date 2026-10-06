import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import TimingBadge from '../../components/TimingBadge';
import { getSubmissionFileUrl, startTaskViaApi } from '../../lib/api';
import { useUser } from '../../data/UserContext';
import { fetchTaskById, updateTaskStatus } from '../../services/tasks';
import { logActivity } from '../../services/activities';
import { fetchAllProfiles } from '../../services/profiles';
import { fetchSubmissionsByTask } from '../../services/submissions';
import './TaskDetails.css';

export default function TaskDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { currentUser } = useUser();
  const isLeader = location.pathname.startsWith('/leader');

  const [task, setTask] = useState(null);
  const [assigner, setAssigner] = useState(null);
  const [taskSubmissions, setTaskSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let taskResult;

    fetchTaskById(parseInt(id)).then(result => {
      taskResult = result;
      setTask(result);
      return Promise.all([
        fetchAllProfiles(),
        fetchSubmissionsByTask(result.id)
      ]);
    }).then(([profiles, subs]) => {
      const foundAssigner = profiles.find(u => u.id === taskResult.assigned_by);
      setAssigner(foundAssigner || null);
      setTaskSubmissions(subs || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const openFile = async (submissionId, file) => {
    if (typeof file === 'string' || !file?.path) return;
    try {
      const url = await getSubmissionFileUrl(submissionId, file.path);
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      alert(err.message || 'Could not open file.');
    }
  };

  const handleStart = async () => {
    try {
      try {
        const { task: updated } = await startTaskViaApi(task.id);
        setTask(updated);
      } catch {
        await updateTaskStatus(task.id, 'in_progress');
        setTask({ ...task, status: 'in_progress' });
      }
      await logActivity({
        user_id: currentUser.id,
        type: 'task_started',
        message: `You started task "${task.title}"`,
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    } catch (err) {
      alert(err.message || 'Could not start task.');
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  if (!task) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Task not found.</div>;

  const user = { name: currentUser?.name || (isLeader ? 'Leader' : 'Student'), avatar: currentUser?.avatar || (isLeader ? 'LD' : 'ST'), role: isLeader ? 'Group Leader' : 'Student' };
  const backLink = isLeader ? '/leader/tasks' : '/student/tasks';
  const submitLink = isLeader ? `/leader/tasks/${task.id}` : `/student/tasks/${task.id}/submit`;

  return (
    <div>
      <Navbar title={task.title} subtitle={`Assigned by ${assigner?.name || 'Leader'}`} user={user} />

      <Link to={backLink} className="back-link">← Back to Tasks</Link>

      <div className="task-detail-grid">
        <div className="td-main">
          <div className="td-card">
            <div className="td-header">
              <h2>{task.title}</h2>
              <StatusBadge status={task.status} />
            </div>
            <div className="td-description">
              <h4>Description</h4>
              <p>{task.description}</p>
            </div>
            <div className="td-progress-section">
              <h4>Progress</h4>
              <div className="td-progress-bar">
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: `${task.progress}%` }}></div>
                </div>
                <span>{task.progress}%</span>
              </div>
            </div>
          </div>

          {taskSubmissions.length > 0 && (
            <div className="td-card">
              <h3>Submission History</h3>
              <div className="td-submissions">
                {taskSubmissions.map(s => (
                  <div key={s.id} className="td-submission-row">
                    <div className="td-sub-info">
                      <p><strong>{new Date(s.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong></p>
                      <p>{s.comment}</p>
                      <div className="td-sub-files">
                        {(s.files || []).map((f, i) => {
                          const name = typeof f === 'string' ? f : f?.name || 'File';
                          const viewable = typeof f !== 'string' && f?.path;
                          return (
                            <span key={i} className="file-tag">
                              📄 {name}
                              {viewable && (
                                <button type="button" className="file-tag-view" onClick={() => openFile(s.id, f)}>
                                  View
                                </button>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <StatusBadge status={s.status} />
                      {task.deadline && (
                        <TimingBadge submittedAt={s.submitted_at} deadline={task.deadline} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="td-sidebar">
          <div className="td-info-card">
            <h3>Task Info</h3>
            <div className="td-info-item">
              <span className="label">Status</span>
              <StatusBadge status={task.status} />
            </div>
            <div className="td-info-item">
              <span className="label">Priority</span>
              <span className="value">{task.priority}</span>
            </div>
            <div className="td-info-item">
              <span className="label">Deadline</span>
              <span className="value">{new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="td-info-item">
              <span className="label">Assigned By</span>
              <span className="value">{assigner?.name || 'Leader'}</span>
            </div>
            <div className="td-info-item">
              <span className="label">Progress</span>
              <span className="value">{task.progress}%</span>
            </div>
          </div>

          {!isLeader && task.status !== 'verified' && (
            <Link to={submitLink}>
              <Button variant="primary" className="full-width">Submit Task</Button>
            </Link>
          )}
          {!isLeader && task.status === 'assigned' && task.assigned_to === currentUser?.id && (
            <Button variant="secondary" className="full-width" onClick={handleStart}>
              Start Task
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

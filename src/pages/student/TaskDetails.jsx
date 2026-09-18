import { useParams, Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { tasks, users, submissions } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import './TaskDetails.css';

export default function TaskDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { currentUser } = useUser();
  const isLeader = location.pathname.startsWith('/leader');
  const task = tasks.find(t => t.id === parseInt(id)) || tasks[0];
  const assigner = users.find(u => u.id === task.assignedBy);
  const taskSubmissions = submissions.filter(s => s.taskId === task.id);
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
            <div className="td-meta">
              <span>Due: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>Priority: {task.priority}</span>
              <span>Assigned by: {assigner?.name}</span>
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
                      <p><strong>{new Date(s.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong></p>
                      <p>{s.comment}</p>
                      <div className="td-sub-files">
                        {s.files.map((f, i) => <span key={i} className="file-tag">📄 {f}</span>)}
                      </div>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="td-sidebar">
          {!isLeader && (
            <Link to={submitLink}>
              <Button variant="primary" className="full-width">Submit Task</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

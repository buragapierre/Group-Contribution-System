import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { submissions, tasks, users } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import { useLeaderGroup } from '../../data/useLeaderGroup';
import './SubmissionReview.css';

export default function SubmissionReview() {
  const { currentUser } = useUser();
  const group = useLeaderGroup(currentUser);
  const user = { name: currentUser?.name || 'Leader', avatar: currentUser?.avatar || 'LD', role: 'Group Leader' };
  const [reviewedIds, setReviewedIds] = useState({});

  const enrichedSubmissions = submissions
    .filter(s => tasks.find(task => task.id === s.taskId)?.groupId === group.id)
    .map(s => ({
      ...s,
      task: tasks.find(t => t.id === s.taskId),
      student: users.find(u => u.id === s.userId),
    }));

  const handleAction = (id, action) => {
    setReviewedIds(prev => ({ ...prev, [id]: action }));
  };

  return (
    <div>
      <Navbar title="Submission Review" subtitle={`${group.name} · ${group.projectName}`} user={user} />

      <div className="sr-header">
        <h2>Submissions</h2>
        <span className="sr-badge">{enrichedSubmissions.length} submission{enrichedSubmissions.length !== 1 ? 's' : ''}</span>
      </div>

      {enrichedSubmissions.length === 0 ? (
        <div className="sr-empty">
          <span className="sr-empty-icon">📤</span>
          <h3>No submissions yet</h3>
          <p>When group members submit their tasks, they will appear here for review.</p>
        </div>
      ) : (
        <div className="sr-list">
          {enrichedSubmissions.map(s => (
            <div key={s.id} className={`sr-card ${reviewedIds[s.id] ? 'sr-card-reviewed' : ''}`}>
              <div className="sr-card-header">
                <div className="sr-submitter">
                  <div className="sr-avatar">{s.student?.avatar}</div>
                  <div>
                    <strong>{s.student?.name}</strong>
                    <span className="sr-date">
                      Submitted {new Date(s.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' · '}
                      {new Date(s.submittedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                </div>
                <StatusBadge status={reviewedIds[s.id] || s.status} />
              </div>

              <div className="sr-task-section">
                <h4>{s.task?.title}</h4>
                <p>{s.comment}</p>
              </div>

              <div className="sr-files">
                <span className="sr-files-label">Attached Files</span>
                <div className="sr-files-list">
                  {s.files.map((f, i) => (
                    <div key={i} className="sr-file">
                      <span className="sr-file-icon">📄</span>
                      <span className="sr-file-name">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {(s.status === 'submitted' || s.status === 'under_review') && !reviewedIds[s.id] && (
                <div className="sr-actions">
                  <Button variant="success" size="sm" onClick={() => handleAction(s.id, 'verified')}>✓ Verify</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleAction(s.id, 'needs_revision')}>↻ Needs Revision</Button>
                  <Button variant="danger" size="sm" onClick={() => handleAction(s.id, 'rejected')}>✕ Reject</Button>
                </div>
              )}

              {reviewedIds[s.id] && (
                <div className="sr-action-done">
                  <span className={`sr-action-badge sr-action-${reviewedIds[s.id]}`}>
                    {reviewedIds[s.id] === 'verified' && '✓ Verified'}
                    {reviewedIds[s.id] === 'needs_revision' && '↻ Revision Requested'}
                    {reviewedIds[s.id] === 'rejected' && '✕ Rejected'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

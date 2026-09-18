import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { submissions, tasks, users } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import './SubmissionReview.css';

export default function SubmissionReview() {
  const { currentUser } = useUser();
  const user = { name: currentUser?.name || 'Leader', avatar: currentUser?.avatar || 'LD', role: 'Group Leader' };

  const enrichedSubmissions = submissions.map(s => ({
    ...s,
    task: tasks.find(t => t.id === s.taskId),
    student: users.find(u => u.id === s.userId),
  }));

  return (
    <div>
      <Navbar title="Submission Review" subtitle="Review and verify task submissions from members." user={user} />

      <div className="submission-list">
        {enrichedSubmissions.map(s => (
          <div key={s.id} className="submission-card">
            <div className="sub-header">
              <div className="user-cell">
                <div className="cell-avatar student">{s.student?.avatar}</div>
                <div>
                  <strong>{s.student?.name}</strong>
                  <p>Submitted: {new Date(s.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <StatusBadge status={s.status} />
            </div>
            <div className="sub-task">
              <h4>{s.task?.title}</h4>
              <p>{s.comment}</p>
            </div>
            <div className="sub-files">
              <span className="files-label">Files:</span>
              {s.files.map((f, i) => (
                <span key={i} className="file-tag">📄 {f}</span>
              ))}
            </div>
            {s.status === 'submitted' || s.status === 'under_review' ? (
              <div className="sub-actions">
                <Button variant="success" size="sm">Verify</Button>
                <Button variant="secondary" size="sm">Needs Revision</Button>
                <Button variant="danger" size="sm">Reject</Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

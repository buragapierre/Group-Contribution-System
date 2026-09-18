import Navbar from '../../components/Navbar';
import { users } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import './ProfessorVerification.css';

export default function ProfessorVerification() {
  const { currentUser } = useUser();
  const pendingUsers = users.filter(u => u.status === 'pending' && u.role === 'professor');
  const user = { name: currentUser?.name || 'Admin', avatar: currentUser?.avatar || 'AU', role: 'Admin' };

  return (
    <div>
      <Navbar title="Professor Verification" subtitle="Review and verify professor account requests." user={user} />

      {pendingUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <h3>All caught up!</h3>
          <p>No pending professor verification requests.</p>
        </div>
      ) : (
        <div className="verification-list">
          {pendingUsers.map(u => (
            <div key={u.id} className="verification-card">
              <div className="verification-header">
                <div className={`cell-avatar ${u.role}`}>{u.avatar}</div>
                <div>
                  <h3>{u.name}</h3>
                  <p>{u.email}</p>
                </div>
              </div>
              <div className="verification-details">
                <div className="detail-item">
                  <label>ID Number</label>
                  <span>{u.idNumber}</span>
                </div>
                <div className="detail-item">
                  <label>Current Role</label>
                  <span className={`role-badge role-${u.role}`}>{u.role}</span>
                </div>
                <div className="detail-item">
                  <label>Verification Status</label>
                  <span className="status-pill status-pending">{u.status}</span>
                </div>
              </div>
              <div className="verification-actions">
                <button className="btn btn-success btn-md">Verify as Professor</button>
                <button className="btn btn-secondary btn-md">Keep as Student</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

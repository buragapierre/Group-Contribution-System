import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useUser } from '../../data/UserContext';
import { fetchProfilesByRole, updateProfile } from '../../services/profiles';
import './ProfessorVerification.css';

export default function ProfessorVerification() {
  const { currentUser } = useUser();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const user = { name: currentUser?.name || 'Admin', avatar: currentUser?.avatar || 'AU', role: 'Admin' };

  const loadPending = () => {
    fetchProfilesByRole('professor').then(profiles => {
      setPendingUsers(profiles.filter(p => p.status === 'pending'));
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadPending(); }, []);

  const handleVerify = async (userId) => {
    setUpdatingId(userId);
    try {
      await updateProfile(userId, { status: 'active' });
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch {
      alert('Failed to verify professor.');
    }
    setUpdatingId(null);
  };

  const handleReject = async (userId) => {
    if (!confirm('Revert this user back to student?')) return;
    setUpdatingId(userId);
    try {
      await updateProfile(userId, { role: 'student', status: 'active' });
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch {
      alert('Failed to update user.');
    }
    setUpdatingId(null);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

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
                  <span>{u.id_number}</span>
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
                <button
                  className="btn btn-success btn-md"
                  onClick={() => handleVerify(u.id)}
                  disabled={updatingId === u.id}
                >
                  {updatingId === u.id ? 'Updating...' : 'Verify as Professor'}
                </button>
                <button
                  className="btn btn-secondary btn-md"
                  onClick={() => handleReject(u.id)}
                  disabled={updatingId === u.id}
                >
                  Keep as Student
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

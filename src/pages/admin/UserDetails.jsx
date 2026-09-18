import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useUser } from '../../data/UserContext';
import { fetchProfileById, updateProfile } from '../../services/profiles';
import './UserDetails.css';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const admin = { name: currentUser?.name || 'Admin', avatar: currentUser?.avatar || 'AU', role: 'Admin' };

  useEffect(() => {
    fetchProfileById(id).then(setProfileUser).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleToggleStatus = async () => {
    if (!profileUser) return;
    setUpdating(true);
    const newStatus = profileUser.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await updateProfile(profileUser.id, { status: newStatus });
      setProfileUser(updated);
    } catch {
      alert('Failed to update status.');
    }
    setUpdating(false);
  };

  const handlePromote = async () => {
    if (!profileUser) return;
    if (!confirm(`Promote ${profileUser.name} to Professor?`)) return;
    setUpdating(true);
    try {
      const updated = await updateProfile(profileUser.id, { role: 'professor', status: 'active' });
      setProfileUser(updated);
    } catch {
      alert('Failed to promote user.');
    }
    setUpdating(false);
  };

  const handleDemote = async () => {
    if (!profileUser) return;
    if (!confirm(`Demote ${profileUser.name} back to Student?`)) return;
    setUpdating(true);
    try {
      const updated = await updateProfile(profileUser.id, { role: 'student' });
      setProfileUser(updated);
    } catch {
      alert('Failed to demote user.');
    }
    setUpdating(false);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  if (!profileUser) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>User not found.</div>;

  return (
    <div>
      <Navbar title="User Details" subtitle="View user account information." user={admin} />

      <Link to="/admin/users" className="back-link">← Back to Users</Link>

      <div className="user-detail-card">
        <div className="user-detail-header">
          <div className={`detail-avatar ${profileUser.role}`}>{profileUser.avatar}</div>
          <div>
            <h2>{profileUser.name}</h2>
            <p>{profileUser.email}</p>
          </div>
        </div>

        <div className="user-detail-grid">
          <div className="detail-item">
            <label>ID Number</label>
            <span>{profileUser.id_number}</span>
          </div>
          <div className="detail-item">
            <label>Role</label>
            <span className={`role-badge role-${profileUser.role}`}>{profileUser.role}</span>
          </div>
          <div className="detail-item">
            <label>Status</label>
            <span className={`status-pill status-${profileUser.status}`}>{profileUser.status}</span>
          </div>
          <div className="detail-item">
            <label>Email</label>
            <span>{profileUser.email}</span>
          </div>
        </div>

        <div className="detail-actions">
          <button className="btn btn-primary btn-md" onClick={handleToggleStatus} disabled={updating}>
            {updating ? 'Updating...' : profileUser.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
          </button>
          {profileUser.role === 'student' && (
            <button className="btn btn-outline btn-md" onClick={handlePromote} disabled={updating}>
              Promote to Professor
            </button>
          )}
          {profileUser.role === 'professor' && (
            <button className="btn btn-secondary btn-md" onClick={handleDemote} disabled={updating}>
              Demote to Student
            </button>
          )}
          <button className="btn btn-secondary btn-md" onClick={() => navigate(-1)}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

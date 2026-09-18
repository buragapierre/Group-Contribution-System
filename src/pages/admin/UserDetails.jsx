import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { users } from '../../data/mockData';
import './UserDetails.css';

export default function UserDetails() {
  const { id } = useParams();
  const user = users.find(u => u.id === parseInt(id)) || users[0];

  const admin = { name: 'Admin User', avatar: 'AU', role: 'Admin' };

  return (
    <div>
      <Navbar title="User Details" subtitle="View user account information." user={admin} />

      <Link to="/admin/users" className="back-link">← Back to Users</Link>

      <div className="user-detail-card">
        <div className="user-detail-header">
          <div className={`detail-avatar ${user.role}`}>{user.avatar}</div>
          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="user-detail-grid">
          <div className="detail-item">
            <label>ID Number</label>
            <span>{user.idNumber}</span>
          </div>
          <div className="detail-item">
            <label>Role</label>
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
          </div>
          <div className="detail-item">
            <label>Status</label>
            <span className={`status-pill status-${user.status}`}>{user.status}</span>
          </div>
          <div className="detail-item">
            <label>Email</label>
            <span>{user.email}</span>
          </div>
        </div>

        <div className="detail-actions">
          <button className="btn btn-primary btn-md">
            {user.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
          </button>
          {user.role === 'student' && (
            <button className="btn btn-outline btn-md">Promote to Professor</button>
          )}
        </div>
      </div>
    </div>
  );
}

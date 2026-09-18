import Navbar from '../../components/Navbar';
import { users } from '../../data/mockData';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const totalUsers = users.length;
  const pendingVerification = users.filter(u => u.status === 'pending').length;
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalProfessors = users.filter(u => u.role === 'professor').length;
  const activeAccounts = users.filter(u => u.status === 'active').length;

  const user = { name: 'Admin User', avatar: 'AU', role: 'Admin' };

  return (
    <div>
      <Navbar title="Admin Dashboard" subtitle="Manage users, projects, and system settings." user={user} />

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon blue">☰</div>
          <div>
            <strong>{totalUsers}</strong>
            <span>Total Users</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">⏳</div>
          <div>
            <strong>{pendingVerification}</strong>
            <span>Pending Verification</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">🎓</div>
          <div>
            <strong>{totalStudents}</strong>
            <span>Students</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">👨‍🏫</div>
          <div>
            <strong>{totalProfessors}</strong>
            <span>Professors</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal">✓</div>
          <div>
            <strong>{activeAccounts}</strong>
            <span>Active Accounts</span>
          </div>
        </div>
      </div>

      <div className="admin-section">
        <div className="section-title">
          <h2>Recent Users</h2>
          <a href="/admin/users" className="view-btn">View all →</a>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>ID Number</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <div className={`cell-avatar ${u.role}`}>{u.avatar}</div>
                      {u.name}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.idNumber}</td>
                  <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                  <td><span className={`status-pill status-${u.status}`}>{u.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

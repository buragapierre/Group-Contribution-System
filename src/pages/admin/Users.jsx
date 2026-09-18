import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { users } from '../../data/mockData';
import './Users.css';

export default function Users() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const user = { name: 'Admin User', avatar: 'AU', role: 'Admin' };

  return (
    <div>
      <Navbar title="User Management" subtitle="View and manage all system users." user={user} />

      <div className="users-toolbar">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="filter-select">
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="professor">Professor</option>
          <option value="student">Student</option>
        </select>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
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
                <td>
                  <div className="action-btns">
                    <Link to={`/admin/users/${u.id}`} className="action-btn view">View</Link>
                    <button className="action-btn deactivate">{u.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

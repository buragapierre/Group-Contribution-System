import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { groups, users, contributions } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import './Members.css';

export default function Members() {
  const { currentUser } = useUser();
  const leaderGroupId = currentUser?.leaderGroupId;
  const group = groups.find(g => g.id === leaderGroupId) || groups[0];
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState('');
  const user = { name: currentUser?.name || 'Leader', avatar: currentUser?.avatar || 'LD', role: 'Group Leader' };

  const memberData = group.members.map(mId => {
    const u = users.find(u => u.id === mId);
    const c = contributions.find(c => c.userId === mId);
    return { ...u, ...c };
  });

  return (
    <div>
      <Navbar title="Members" subtitle="Manage your group members." user={user} />

      <div className="section-title" style={{ marginBottom: 20 }}>
        <h2>Group Members ({memberData.length})</h2>
        <Button variant="primary" onClick={() => setShowAdd(true)}>+ Add Member</Button>
      </div>

      <div className="members-table">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Tasks Assigned</th>
              <th>Tasks Completed</th>
              <th>Contribution</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {memberData.map((m, i) => (
              <tr key={m.id || i}>
                <td>
                  <div className="user-cell">
                    <div className="cell-avatar student">{m.avatar}</div>
                    {m.name}
                  </div>
                </td>
                <td>{m.email}</td>
                <td>{m.tasksAssigned || 0}</td>
                <td>{m.tasksCompleted || 0}</td>
                <td>
                  <div className="contribution-cell">
                    <div className="progress-bar" style={{ width: 60 }}>
                      <div className="progress-fill" style={{ width: `${m.contributionPercent || 0}%` }}></div>
                    </div>
                    <span>{m.contributionPercent || 0}%</span>
                  </div>
                </td>
                <td>
                  {i > 0 && <button className="action-btn deactivate">Remove</button>}
                  {i === 0 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Leader</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Member">
        <div className="add-member-form">
          <div className="form-group">
            <label>Select Student</label>
            <select value={newMember} onChange={(e) => setNewMember(e.target.value)}>
              <option value="">Choose a student...</option>
              {users.filter(u => u.role === 'student' && !group.members.includes(u.id)).map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.idNumber})</option>
              ))}
            </select>
          </div>
          <Button variant="primary" className="full-width">Add to Group</Button>
        </div>
      </Modal>

      <style>{`
        .add-member-form .form-group { margin-bottom: 16px; }
        .add-member-form label { display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
        .add-member-form select { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 12px; outline: none; }
        .full-width { width: 100%; justify-content: center; }
      `}</style>
    </div>
  );
}

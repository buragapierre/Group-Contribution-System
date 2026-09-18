import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { users, contributions } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import { useLeaderGroup } from '../../data/useLeaderGroup';
import './Members.css';

export default function Members() {
  const { currentUser } = useUser();
  const group = useLeaderGroup(currentUser);
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState('');
  const user = { name: currentUser?.name || 'Leader', avatar: currentUser?.avatar || 'LD', role: 'Group Leader' };

  const memberData = group.members.map((mId, i) => {
    const u = users.find(u => u.id === mId);
    const c = contributions.find(c => c.userId === mId && c.classId === group.classId);
    return { ...u, ...c, isLeader: mId === group.leaderId, index: i };
  });

  const availableStudents = users.filter(u => u.role === 'student' && !group.members.includes(u.id));

  return (
    <div>
      <Navbar title="Members" subtitle={`${group.name} · ${group.projectName}`} user={user} />

      <div className="members-header">
        <div className="members-count">
          <h2>Group Members</h2>
          <span className="members-badge">{memberData.length} member{memberData.length !== 1 ? 's' : ''}</span>
        </div>
        <Button variant="primary" onClick={() => setShowAdd(true)}>+ Add Member</Button>
      </div>

      <div className="members-grid">
        {memberData.map((m) => (
          <div key={m.id || m.index} className={`member-card ${m.isLeader ? 'member-card-leader' : ''}`}>
            <div className="member-card-header">
              <div className="member-avatar" style={{ background: ['#dce9ef', '#e8dff5', '#d1fae5', '#fce7f3', '#fef3c7'][m.index % 5] }}>
                {m.avatar}
              </div>
              {m.isLeader && <span className="member-leader-tag">Leader</span>}
            </div>
            <div className="member-card-body">
              <h3>{m.name}</h3>
              <p className="member-email">{m.email}</p>
              <p className="member-id">{m.idNumber}</p>
            </div>
            <div className="member-card-stats">
              <div className="member-stat">
                <strong>{m.tasksAssigned || 0}</strong>
                <span>Assigned</span>
              </div>
              <div className="member-stat">
                <strong>{m.tasksCompleted || 0}</strong>
                <span>Completed</span>
              </div>
              <div className="member-stat">
                <strong>{m.contributionPercent || 0}%</strong>
                <span>Contribution</span>
              </div>
            </div>
            <div className="member-card-progress">
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${m.contributionPercent || 0}%`, background: m.contributionPercent >= 80 ? 'var(--success)' : m.contributionPercent >= 50 ? 'var(--warning)' : 'var(--danger)' }}></div></div>
            </div>
            {!m.isLeader && (
              <div className="member-card-actions">
                <button className="member-remove-btn">Remove</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Member">
        <div className="add-member-form">
          <div className="form-group">
            <label>Select Student</label>
            <select value={newMember} onChange={(e) => setNewMember(e.target.value)}>
              <option value="">Choose a student...</option>
              {availableStudents.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.idNumber})</option>
              ))}
            </select>
          </div>
          {availableStudents.length === 0 && (
            <p className="add-member-empty">No available students to add.</p>
          )}
          <div className="add-member-actions">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" disabled={!newMember}>Add to Group</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

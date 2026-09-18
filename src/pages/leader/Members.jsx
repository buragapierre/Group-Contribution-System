import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { useUser } from '../../data/UserContext';
import { useLeaderGroup } from '../../data/useLeaderGroup';
import { fetchGroupMembers, fetchGroupMemberIds } from '../../services/groups';
import { fetchContributionsByClass } from '../../services/contributions';
import { fetchAllProfiles } from '../../services/profiles';
import './Members.css';

export default function Members() {
  const { currentUser } = useUser();
  const group = useLeaderGroup(currentUser);
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState('');
  const user = { name: currentUser?.name || 'Leader', avatar: currentUser?.avatar || 'LD', role: 'Group Leader' };

  const [memberData, setMemberData] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!group) return;
    Promise.all([
      fetchGroupMembers(group.id),
      fetchContributionsByClass(group.class_id),
    ])
      .then(([members, contributions]) => {
        const enriched = members.map((m, i) => {
          const c = contributions.find(c => c.user_id === m.id);
          return { ...m, ...c, isLeader: m.id === group.leader_id, index: i };
        });
        setMemberData(enriched);
        return fetchGroupMemberIds(group.id).then(ids =>
          fetchAllProfiles().then(profiles => {
            const available = profiles.filter(p => p.role === 'student' && !ids.includes(p.id));
            setAvailableStudents(available);
          })
        );
      })
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, [group]);

  if (!group) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No group selected.</div>;
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <Navbar title="Members" subtitle={`${group.name} · ${group.project_name}`} user={user} />

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
              <p className="member-id">{m.id_number}</p>
            </div>
            <div className="member-card-stats">
              <div className="member-stat">
                <strong>{m.tasks_assigned || 0}</strong>
                <span>Assigned</span>
              </div>
              <div className="member-stat">
                <strong>{m.tasks_completed || 0}</strong>
                <span>Completed</span>
              </div>
              <div className="member-stat">
                <strong>{m.contribution_percent || 0}%</strong>
                <span>Contribution</span>
              </div>
            </div>
            <div className="member-card-progress">
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${m.contribution_percent || 0}%`, background: m.contribution_percent >= 80 ? 'var(--success)' : m.contribution_percent >= 50 ? 'var(--warning)' : 'var(--danger)' }}></div></div>
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
                <option key={u.id} value={u.id}>{u.name} ({u.id_number})</option>
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

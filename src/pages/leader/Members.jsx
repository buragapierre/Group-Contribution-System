import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { useUser } from '../../data/UserContext';
import { useLeaderGroup } from '../../data/useLeaderGroup';
import { fetchGroupMembers, fetchGroupMemberIds, addGroupMember, removeGroupMember } from '../../services/groups';
import { fetchContributionsByClass } from '../../services/contributions';
import { fetchAllProfiles } from '../../services/profiles';
import { logActivity } from '../../services/activities';
import { fetchRatings, saveRating } from '../../lib/api';
import './Members.css';

export default function Members() {
  const { currentUser } = useUser();
  const group = useLeaderGroup(currentUser);
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState('');
  const user = { name: currentUser?.name || 'Leader', avatar: currentUser?.avatar || 'LD', role: 'Group Leader' };

  const [memberData, setMemberData] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [ratings, setRatings] = useState({});
  const [ratingInputs, setRatingInputs] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMembers = () => {
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
  };

  useEffect(() => {
    if (!group) return;
    refreshMembers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  useEffect(() => {
    if (!group) return;
    fetchRatings(group.id)
      .then(result => {
        const map = {};
        const inputs = {};
        for (const r of result.ratings || []) {
          map[r.rated_user_id] = r;
          inputs[r.rated_user_id] = r.score;
        }
        setRatings(map);
        setRatingInputs(inputs);
      })
      .catch(() => {});
  }, [group]);

  const handleSaveRating = async (userId) => {
    const score = Number(ratingInputs[userId]);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      alert('Score must be 0-100.');
      return;
    }
    setSavingId(userId);
    try {
      const { rating } = await saveRating(group.id, userId, Math.round(score));
      setRatings(prev => ({ ...prev, [userId]: rating }));
    } catch (err) {
      alert(err.message || 'Failed to save rating.');
    }
    setSavingId(null);
  };

  const handleAddMember = async () => {
    if (!newMember) return;
    try {
      await addGroupMember(group.id, newMember);
      const student = availableStudents.find(s => s.id === newMember);
      await logActivity({
        user_id: currentUser.id,
        type: 'member_added',
        message: `You added ${student?.name || 'a member'} to the group`,
        timestamp: new Date().toISOString(),
      });
      setNewMember('');
      setShowAdd(false);
      setLoading(true);
      refreshMembers();
    } catch (err) {
      alert(err.message || 'Failed to add member.');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the group?')) return;
    try {
      await removeGroupMember(group.id, userId);
      const member = memberData.find(m => m.id === userId);
      await logActivity({
        user_id: currentUser.id,
        type: 'member_removed',
        message: `You removed ${member?.name || 'a member'} from the group`,
        timestamp: new Date().toISOString(),
      });
      setLoading(true);
      refreshMembers();
    } catch (err) {
      alert(err.message || 'Failed to remove member.');
    }
  };

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
                <div className="member-rating-row">
                  <label>Grade</label>
                  <div className="member-rating-input">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={ratingInputs[m.id] ?? ''}
                      onChange={(e) => setRatingInputs(prev => ({ ...prev, [m.id]: e.target.value }))}
                    />
                    <button
                      className="member-save-btn"
                      disabled={savingId === m.id}
                      onClick={() => handleSaveRating(m.id)}
                    >
                      {savingId === m.id ? '...' : ratings[m.id] ? 'Update' : 'Save'}
                    </button>
                  </div>
                  {ratings[m.id] && (
                    <span className="member-rating-saved">Saved: {ratings[m.id].score}</span>
                  )}
                </div>
                <button className="member-remove-btn" onClick={() => handleRemoveMember(m.id)}>Remove</button>
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
            <Button variant="primary" disabled={!newMember} onClick={handleAddMember}>Add to Group</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { fetchProfessorGroups, fetchGroupMemberIds } from '../../services/groups';
import { fetchClasses } from '../../services/classes';
import { fetchAllProfiles } from '../../services/profiles';
import { useUser } from '../../data/UserContext';
import groupIcon from '../../assets/group.png';
import memberIcon from '../../assets/member.png';
import averageIcon from '../../assets/average.png';
import classesIcon from '../../assets/classes.png';
import './Groups.css';

export default function Groups() {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [professorGroups, setProfessorGroups] = useState([]);
  const [professorClasses, setProfessorClasses] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      fetchProfessorGroups(currentUser.id),
      fetchClasses(currentUser.id),
      fetchAllProfiles(),
    ]).then(async ([groups, classes, profiles]) => {
      const enriched = await Promise.all(groups.map(async (g) => {
        const memberIds = await fetchGroupMemberIds(g.id);
        return { ...g, members: memberIds };
      }));
      setProfessorGroups(enriched);
      setProfessorClasses(classes);
      setAllProfiles(profiles);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser]);

  const totalMembers = professorGroups.reduce((sum, g) => sum + (g.members?.length || 0), 0);
  const avgProgress = professorGroups.length > 0
    ? Math.round(professorGroups.reduce((sum, g) => sum + (g.progress || 0), 0) / professorGroups.length)
    : 0;

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <Navbar title="Groups" subtitle="Manage student groups across all classes" user={user} />

      <div className="groups-stats">
        <div className="groups-stat-card">
          <div className="groups-stat-icon groups-stat-icon--purple">
            <img src={groupIcon} alt="Groups" />
          </div>
          <div className="groups-stat-info">
            <strong>{professorGroups.length}</strong>
            <span>Total Groups</span>
          </div>
        </div>
        <div className="groups-stat-card">
          <div className="groups-stat-icon groups-stat-icon--blue">
            <img src={memberIcon} alt="Members" />
          </div>
          <div className="groups-stat-info">
            <strong>{totalMembers}</strong>
            <span>Total Members</span>
          </div>
        </div>
        <div className="groups-stat-card">
          <div className="groups-stat-icon groups-stat-icon--green">
            <img src={averageIcon} alt="Average" />
          </div>
          <div className="groups-stat-info">
            <strong>{avgProgress}%</strong>
            <span>Avg Progress</span>
          </div>
        </div>
        <div className="groups-stat-card">
          <div className="groups-stat-icon groups-stat-icon--yellow">
            <img src={classesIcon} alt="Classes" />
          </div>
          <div className="groups-stat-info">
            <strong>{professorClasses.length}</strong>
            <span>Classes</span>
          </div>
        </div>
      </div>

      {professorGroups.length === 0 ? (
        <div className="groups-empty">
          <div className="groups-empty-icon">
            <img src={groupIcon} alt="Groups" />
          </div>
          <h3>No groups yet</h3>
          <p>Groups will appear here once you create them in your classes.</p>
        </div>
      ) : (
        <div className="groups-grid">
          {professorGroups.map(g => {
            const cls = professorClasses.find(c => c.id === g.class_id);
            const memberUsers = (g.members || []).map(mId => allProfiles.find(u => u.id === mId)).filter(Boolean);
            const leader = allProfiles.find(u => u.id === g.leader_id);
            return (
              <div key={g.id} className="group-card">
                <div className="gcd-header">
                  <div className="group-icon">
                    <img src={groupIcon} alt="Group" />
                  </div>
                  <div className="gcd-header-text">
                    <h3>{g.name}</h3>
                    <p>{g.project_name || 'No project assigned'}</p>
                  </div>
                  {cls && <span className="gcd-class-badge">{cls.subject}</span>}
                </div>

                <div className="gcd-meta-row">
                  <div className="gcd-meta-item">
                    <span className="gcd-meta-label">Section</span>
                    <span className="gcd-meta-value">{cls?.section || 'General'}</span>
                  </div>
                  <div className="gcd-meta-item">
                    <span className="gcd-meta-label">Leader</span>
                    <span className="gcd-meta-value">{g.leader_name || '—'}</span>
                  </div>
                  <div className="gcd-meta-item">
                    <span className="gcd-meta-label">Members</span>
                    <span className="gcd-meta-value">{memberUsers.length}</span>
                  </div>
                </div>

                <div className="gcd-members-section">
                  <span className="gcd-meta-label">Members ({memberUsers.length})</span>
                  <div className="gcd-members-list">
                    {leader && (
                      <div className="gcd-member-row">
                        <div className="mini-avatar mini-avatar--leader">{leader.avatar}</div>
                        <span className="gcd-member-name">{leader.name}</span>
                        <span className="gcd-member-role-badge">Leader</span>
                      </div>
                    )}
                    {memberUsers.filter(m => m.id !== g.leader_id).map((m, i) => (
                      <div key={m.id} className="gcd-member-row">
                        <div className="mini-avatar" style={{ background: ['#dce9ef', '#e8dff5', '#d1fae5', '#fef3c7', '#fce7f3'][i % 5] }}>{m.avatar}</div>
                        <span className="gcd-member-name">{m.name}</span>
                      </div>
                    ))}
                    {memberUsers.length === 0 && (
                      <p className="gcd-no-members">No members yet — leader will add them.</p>
                    )}
                  </div>
                </div>

                <div className="gcd-progress">
                  <div className="gcd-progress-header">
                    <span className="gcd-progress-label">Progress</span>
                    <span className="gcd-progress-value">{g.progress || 0}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${g.progress || 0}%`,
                      background: (g.progress || 0) === 100 ? 'var(--success)' : 'var(--primary)'
                    }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

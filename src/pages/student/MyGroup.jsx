import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useUser } from '../../data/UserContext';
import { fetchGroupMembers, fetchGroupById } from '../../services/groups';
import { fetchContributionsByClass } from '../../services/contributions';
import { fetchClassById } from '../../services/classes';
import groupIcon from '../../assets/group.png';
import './MyGroup.css';

export default function MyGroup() {
  const { currentUser } = useUser();
  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

  const leaderGroups = currentUser?.leaderGroups || [];
  const memberGroup = currentUser?.group;
  const allGroupIds = [...new Set([...leaderGroups.map(g => g.id), memberGroup ? memberGroup.id : null].filter(Boolean))];

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (allGroupIds.length === 0) return;

    const fetchAll = allGroupIds.map(gId =>
      Promise.all([
        fetchGroupById(gId),
        fetchGroupMembers(gId),
        fetchContributionsByClass(0),
      ]).then(async ([groupData, members, allContributions]) => {
        const cls = await fetchClassById(groupData.class_id).catch(() => null);
        const enriched = members.map((m, i) => {
          const c = allContributions.find(c => c.user_id === m.id && c.class_id === groupData.class_id);
          return {
            ...m,
            contribution_percent: c?.contribution_percent || 0,
            tasks_completed: c?.tasks_completed || 0,
            tasks_assigned: c?.tasks_assigned || 0,
            isLeader: m.id === groupData.leader_id,
            index: i,
          };
        });
        return {
          ...groupData,
          subject: cls?.subject || 'Unknown Subject',
          section: cls?.section || '',
          members: enriched,
        };
      })
    );

    Promise.all(fetchAll)
      .then(setGroups)
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allGroupIds.length]);

  if (!loading && groups.length === 0) {
    return (
      <div>
        <Navbar title="My Groups" subtitle="All groups you are part of." user={user} />
        <div className="my-group-empty">
          <span className="mg-empty-icon"><img src={groupIcon} alt="Group" /></span>
          <h3>No Groups Yet</h3>
          <p>You are not assigned to any group. Ask your group leader or professor to add you.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="My Groups" subtitle={`${groups.length} group(s) across your classes.`} user={user} />

      {groups.map((g) => {
        const myContribution = g.members.find(m => m.id === currentUser?.id);
        const isLeader = currentUser?.id === g.leader_id;

        return (
          <div key={g.id} className="my-group-section">
            <div className="mg-group-header">
              <div className="mg-group-icon"><img src={groupIcon} alt="Group" /></div>
              <div className="mg-group-header-info">
                <h2>{g.name}</h2>
                <p>{g.subject} {g.section ? `· ${g.section}` : ''} · {g.project_name}</p>
              </div>
              {isLeader && <span className="mg-leader-badge">Leader</span>}
            </div>

            {myContribution && (
              <div className="mg-my-stat-grid">
                <div className="mg-my-stat">
                  <strong>{myContribution.tasks_assigned}</strong>
                  <span>Assigned</span>
                </div>
                <div className="mg-my-stat">
                  <strong>{myContribution.tasks_completed}</strong>
                  <span>Completed</span>
                </div>
                <div className="mg-my-stat">
                  <strong style={{
                    color: myContribution.contribution_percent >= 80 ? 'var(--success)' : myContribution.contribution_percent >= 50 ? 'var(--warning)' : 'var(--danger)'
                  }}>{myContribution.contribution_percent}%</strong>
                  <span>Contribution</span>
                </div>
              </div>
            )}

            <div className="mg-members-grid">
              {g.members.map((m) => (
                <div key={m.id} className={`mg-member-card ${m.isLeader ? 'mg-member-leader' : ''} ${m.id === currentUser?.id ? 'mg-member-me' : ''}`}>
                  <div className="mg-member-top">
                    <div className="mg-member-avatar" style={{ background: ['#dce9ef', '#e8dff5', '#d1fae5', '#fce7f3', '#fef3c7'][m.index % 5] }}>
                      {m.avatar}
                    </div>
                    {m.isLeader && <span className="mg-leader-badge">Leader</span>}
                    {m.id === currentUser?.id && <span className="mg-you-badge">You</span>}
                  </div>
                  <div className="mg-member-info">
                    <h4>{m.name}</h4>
                    <p>{m.email}</p>
                  </div>
                  <div className="mg-member-bar">
                    <div className="progress-bar" style={{ height: 4 }}>
                      <div className="progress-fill" style={{
                        width: `${m.contribution_percent}%`,
                        background: m.contribution_percent >= 80 ? 'var(--success)' : m.contribution_percent >= 50 ? 'var(--warning)' : 'var(--danger)'
                      }}></div>
                    </div>
                    <span className="mg-member-pct">{m.contribution_percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

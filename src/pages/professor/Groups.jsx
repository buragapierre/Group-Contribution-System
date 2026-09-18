import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { fetchProfessorGroups, fetchGroupMemberIds } from '../../services/groups';
import { fetchClasses } from '../../services/classes';
import { fetchAllProfiles } from '../../services/profiles';
import { useUser } from '../../data/UserContext';
import './Groups.css';

export default function Groups() {
  const { currentUser } = useUser();
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

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <Navbar title="Groups" subtitle="Manage student groups across all classes." user={user} />

      <div className="groups-grid">
        {professorGroups.map(g => {
          const cls = professorClasses.find(c => c.id === g.class_id);
          const memberUsers = (g.members || []).map(mId => allProfiles.find(u => u.id === mId)).filter(Boolean);
          return (
            <div key={g.id} className="group-card-detail">
              <div className="gcd-header">
                <div className="group-icon">♧</div>
                <div>
                  <h3>{g.name}</h3>
                  <p>{g.project_name}</p>
                  {cls && <small className="gcd-class-tag">{cls.course} · {cls.section || 'General'}</small>}
                </div>
              </div>
              <div className="gcd-leader">
                <span className="label">Leader</span>
                <span className="value">{g.leader_name}</span>
              </div>
              <div className="gcd-members">
                <span className="label">Members ({memberUsers.length})</span>
                <div className="member-avatars">
                  {memberUsers.map((m, i) => (
                    <div key={m.id} className="mini-avatar" style={{ background: ['#dce9ef', '#e8dff5', '#d1fae5', '#fef3c7', '#fce7f3'][i % 5] }}>
                      {m.avatar}
                    </div>
                  ))}
                </div>
              </div>
              <div className="gcd-progress">
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${g.progress}%` }}></div></div>
                <span>{g.progress}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

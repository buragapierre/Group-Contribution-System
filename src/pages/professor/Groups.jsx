import Navbar from '../../components/Navbar';
import { groups, classes, users } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import './Groups.css';

export default function Groups() {
  const { currentUser } = useUser();
  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };

  const professorClasses = classes.filter(c => c.professorId === currentUser?.id);
  const professorGroups = groups.filter(g => g.classId && professorClasses.some(c => c.id === g.classId));

  return (
    <div>
      <Navbar title="Groups" subtitle="Manage student groups across all classes." user={user} />

      <div className="groups-grid">
        {professorGroups.map(g => {
          const cls = classes.find(c => c.id === g.classId);
          const memberUsers = g.members.map(mId => users.find(u => u.id === mId)).filter(Boolean);
          return (
            <div key={g.id} className="group-card-detail">
              <div className="gcd-header">
                <div className="group-icon">♧</div>
                <div>
                  <h3>{g.name}</h3>
                  <p>{g.projectName}</p>
                  {cls && <small className="gcd-class-tag">{cls.course} · {cls.section || 'General'}</small>}
                </div>
              </div>
              <div className="gcd-leader">
                <span className="label">Leader</span>
                <span className="value">{g.leaderName}</span>
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

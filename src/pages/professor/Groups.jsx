import Navbar from '../../components/Navbar';
import { groups } from '../../data/mockData';
import './Groups.css';

export default function Groups() {
  const user = { name: 'Dr. Maria Santos', avatar: 'MS', role: 'Professor' };

  return (
    <div>
      <Navbar title="Groups" subtitle="Manage student groups across all projects." user={user} />

      <div className="groups-grid">
        {groups.map(g => (
          <div key={g.id} className="group-card-detail">
            <div className="gcd-header">
              <div className="group-icon">♧</div>
              <div>
                <h3>{g.name}</h3>
                <p>{g.projectName}</p>
              </div>
            </div>
            <div className="gcd-leader">
              <span className="label">Leader</span>
              <span className="value">{g.leaderName}</span>
            </div>
            <div className="gcd-members">
              <span className="label">Members ({g.members.length})</span>
              <div className="member-avatars">
                {g.members.map((_, i) => (
                  <div key={i} className="mini-avatar" style={{ background: ['#dce9ef', '#e8dff5', '#d1fae5', '#fef3c7', '#fce7f3'][i % 5] }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
            <div className="gcd-progress">
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${g.progress}%` }}></div></div>
              <span>{g.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

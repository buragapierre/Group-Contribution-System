import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { fetchProfessorContributions } from '../../services/contributions';
import { fetchClasses } from '../../services/classes';
import { fetchGroupsByClass } from '../../services/groups';
import { useUser } from '../../data/UserContext';
import './ContributionMonitoring.css';

export default function ContributionMonitoring() {
  const { currentUser } = useUser();
  const [professorContributions, setProfessorContributions] = useState([]);
  const [professorClasses, setProfessorClasses] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      fetchProfessorContributions(currentUser.id),
      fetchClasses(currentUser.id),
    ]).then(async ([contributions, classes]) => {
      let groups = [];
      for (const cls of classes) {
        const classGroups = await fetchGroupsByClass(cls.id);
        groups = groups.concat(classGroups);
      }
      setProfessorContributions(contributions);
      setProfessorClasses(classes);
      setAllGroups(groups);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <Navbar title="Contribution Monitoring" subtitle="Track student task completion and contribution percentages." user={user} />

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Group</th>
              <th>Class</th>
              <th>Tasks Assigned</th>
              <th>Tasks Completed</th>
              <th>On-Time</th>
              <th>Contribution</th>
            </tr>
          </thead>
          <tbody>
            {professorContributions.map(c => {
              const grp = allGroups.find(g => g.id === c.group_id);
              const cls = professorClasses.find(cl => cl.id === c.class_id);
              return (
                <tr key={c.user_id}>
                  <td>
                    <div className="user-cell">
                      <div className="cell-avatar student">{c.avatar}</div>
                      {c.user_name}
                    </div>
                  </td>
                  <td>{grp?.name || '-'}</td>
                  <td>{cls?.course || '-'}<br /><small style={{ color: 'var(--text-muted)', fontSize: 10 }}>{cls?.section || 'General'}</small></td>
                  <td>{c.tasks_assigned}</td>
                  <td>{c.tasks_completed}</td>
                  <td>{c.on_time_completions}</td>
                  <td>
                    <div className="contribution-cell">
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div className="progress-fill" style={{ width: `${c.contribution_percent}%`, background: c.contribution_percent >= 80 ? 'var(--success)' : c.contribution_percent >= 50 ? 'var(--warning)' : 'var(--danger)' }}></div>
                      </div>
                      <span style={{ color: c.contribution_percent >= 80 ? 'var(--success)' : c.contribution_percent >= 50 ? 'var(--warning)' : 'var(--danger)' }}>{c.contribution_percent}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

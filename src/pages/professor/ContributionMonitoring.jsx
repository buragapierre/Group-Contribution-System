import Navbar from '../../components/Navbar';
import { contributions, groups, classes } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import './ContributionMonitoring.css';

export default function ContributionMonitoring() {
  const { currentUser } = useUser();
  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };

  const professorClasses = classes.filter(c => c.professorId === currentUser?.id);
  const professorContributions = contributions.filter(c => c.classId && professorClasses.some(cls => cls.id === c.classId));

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
              const grp = groups.find(g => g.id === c.groupId);
              const cls = classes.find(cl => cl.id === c.classId);
              return (
                <tr key={c.userId}>
                  <td>
                    <div className="user-cell">
                      <div className="cell-avatar student">{c.avatar}</div>
                      {c.userName}
                    </div>
                  </td>
                  <td>{grp?.name || '-'}</td>
                  <td>{cls?.course || '-'}<br /><small style={{ color: 'var(--text-muted)', fontSize: 10 }}>{cls?.section || 'General'}</small></td>
                  <td>{c.tasksAssigned}</td>
                  <td>{c.tasksCompleted}</td>
                  <td>{c.onTimeCompletions}</td>
                  <td>
                    <div className="contribution-cell">
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div className="progress-fill" style={{ width: `${c.contributionPercent}%`, background: c.contributionPercent >= 80 ? 'var(--success)' : c.contributionPercent >= 50 ? 'var(--warning)' : 'var(--danger)' }}></div>
                      </div>
                      <span style={{ color: c.contributionPercent >= 80 ? 'var(--success)' : c.contributionPercent >= 50 ? 'var(--warning)' : 'var(--danger)' }}>{c.contributionPercent}%</span>
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

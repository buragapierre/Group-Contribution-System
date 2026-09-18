import Navbar from '../../components/Navbar';
import { contributions, groups } from '../../data/mockData';
import './ContributionMonitoring.css';

export default function ContributionMonitoring() {
  const user = { name: 'Dr. Maria Santos', avatar: 'MS', role: 'Professor' };

  return (
    <div>
      <Navbar title="Contribution Monitoring" subtitle="Track student task completion and contribution percentages." user={user} />

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Group</th>
              <th>Tasks Assigned</th>
              <th>Tasks Completed</th>
              <th>On-Time</th>
              <th>Contribution</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map(c => (
              <tr key={c.userId}>
                <td>
                  <div className="user-cell">
                    <div className="cell-avatar student">{c.avatar}</div>
                    {c.userName}
                  </div>
                </td>
                <td>{groups.find(g => g.id === c.groupId)?.name || '-'}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

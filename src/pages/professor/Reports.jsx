import Navbar from '../../components/Navbar';
import { contributions, projects, tasks } from '../../data/mockData';
import './Reports.css';

export default function Reports() {
  const user = { name: 'Dr. Maria Santos', avatar: 'MS', role: 'Professor' };
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'verified').length;
  const avgContribution = Math.round(contributions.reduce((a, c) => a + c.contributionPercent, 0) / contributions.length);

  return (
    <div>
      <Navbar title="Reports" subtitle="View overall project statistics and reports." user={user} />

      <div className="reports-stats">
        <div className="report-stat">
          <strong>{projects.length}</strong>
          <span>Total Projects</span>
        </div>
        <div className="report-stat">
          <strong>{totalTasks}</strong>
          <span>Total Tasks</span>
        </div>
        <div className="report-stat">
          <strong>{completedTasks}</strong>
          <span>Completed Tasks</span>
        </div>
        <div className="report-stat">
          <strong>{avgContribution}%</strong>
          <span>Avg. Contribution</span>
        </div>
      </div>

      <div className="reports-section">
        <h3>Project Progress</h3>
        {projects.map(p => (
          <div key={p.id} className="report-row">
            <div className="report-project-info">
              <h4>{p.title}</h4>
              <p>{p.groups?.length} groups</p>
            </div>
            <div className="report-progress">
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.overallProgress}%` }}></div></div>
              <span>{p.overallProgress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

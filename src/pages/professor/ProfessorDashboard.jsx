import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { projects, groups, tasks } from '../../data/mockData';
import './ProfessorDashboard.css';

export default function ProfessorDashboard() {
  const activeProjects = projects.length;
  const totalGroups = groups.length;
  const totalStudents = new Set(groups.flatMap(g => g.members)).size;
  const pendingTasks = tasks.filter(t => t.status === 'submitted' || t.status === 'under_review').length;

  const user = { name: 'Dr. Maria Santos', avatar: 'MS', role: 'Professor' };

  return (
    <div>
      <Navbar title="Professor Dashboard" subtitle="Manage your projects, groups, and monitor student progress." user={user} />

      <div className="prof-stats">
        <div className="stat-card"><div className="stat-icon blue">▤</div><div><strong>{activeProjects}</strong><span>Active Projects</span></div></div>
        <div className="stat-card"><div className="stat-icon purple">♧</div><div><strong>{totalGroups}</strong><span>Groups</span></div></div>
        <div className="stat-card"><div className="stat-icon green">🎓</div><div><strong>{totalStudents}</strong><span>Total Students</span></div></div>
        <div className="stat-card"><div className="stat-icon yellow">⏳</div><div><strong>{pendingTasks}</strong><span>Pending Activities</span></div></div>
      </div>

      <div className="prof-grid">
        <div className="prof-left">
          <div className="section-title">
            <h2>Projects</h2>
            <Link to="/professor/projects" className="view-btn">View all →</Link>
          </div>
          <div className="project-list">
            {projects.map(p => (
              <Link to={`/professor/projects/${p.id}`} key={p.id} className="prof-project-row">
                <div className={`project-color ${p.color}`}>
                  <span>{p.icon}</span>
                </div>
                <div className="prof-project-info">
                  <h4>{p.title}</h4>
                  <p>{p.groups?.length} groups · Due: {new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="prof-project-progress">
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.overallProgress}%` }}></div></div>
                  <span>{p.overallProgress}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="prof-right">
          <div className="section-title">
            <h2>Groups</h2>
            <Link to="/professor/groups" className="view-btn">View all →</Link>
          </div>
          <div className="prof-group-list">
            {groups.slice(0, 3).map(g => (
              <div key={g.id} className="prof-group-row">
                <div className="group-icon-sm">♧</div>
                <div>
                  <h4>{g.name}</h4>
                  <p>{g.projectName} · {g.members.length} members</p>
                </div>
                <span>{g.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

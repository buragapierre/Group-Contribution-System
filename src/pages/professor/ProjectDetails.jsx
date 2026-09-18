import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { projects, groups, tasks } from '../../data/mockData';
import './ProjectDetails.css';

export default function ProjectDetails() {
  const { id } = useParams();
  const project = projects.find(p => p.id === parseInt(id)) || projects[0];
  const projectGroups = groups.filter(g => g.projectId === project.id);
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const user = { name: 'Dr. Maria Santos', avatar: 'MS', role: 'Professor' };

  return (
    <div>
      <Navbar title={project.title} subtitle={project.description} user={user} />

      <Link to="/professor/projects" className="back-link">← Back to Projects</Link>

      <div className="project-detail-grid">
        <div className="pd-main">
          <div className="pd-info-card">
            <div className="pd-info-header">
              <div className={`project-color ${project.color}`} style={{ width: 48, height: 48, borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 22 }}>
                {project.icon}
              </div>
              <div>
                <h2>{project.title}</h2>
                <p>{project.professorName} · Due: {new Date(project.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="pd-progress">
              <label>Overall Progress</label>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: `${project.overallProgress}%` }}></div>
              </div>
              <span>{project.overallProgress}%</span>
            </div>
            <div className="pd-desc">
              <h4>Description</h4>
              <p>{project.description}</p>
              <h4>Requirements</h4>
              <p>{project.requirements}</p>
            </div>
          </div>

          <div className="pd-section">
            <h3>Tasks ({projectTasks.length})</h3>
            <div className="pd-task-list">
              {projectTasks.map(t => (
                <div key={t.id} className="pd-task-row">
                  <div className={`task-color ${t.color}`} style={{ width: 3 }}></div>
                  <div className="pd-task-info">
                    <h4>{t.title}</h4>
                    <p>Assigned to: {t.assignedTo} · Due: {new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <span className={`status-pill status-${t.status.replace('_', '-')}`}>{t.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pd-sidebar">
          <h3>Groups ({projectGroups.length})</h3>
          {projectGroups.map(g => (
            <div key={g.id} className="pd-group-card">
              <h4>{g.name}</h4>
              <p>{g.members.length} members · Leader: {g.leaderName}</p>
              <div className="progress-bar" style={{ height: 4, marginTop: 8 }}>
                <div className="progress-fill" style={{ width: `${g.progress}%` }}></div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--primary)' }}>{g.progress}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

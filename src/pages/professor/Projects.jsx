import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { projects } from '../../data/mockData';
import './Projects.css';

export default function Projects() {
  const user = { name: 'Dr. Maria Santos', avatar: 'MS', role: 'Professor' };

  return (
    <div>
      <Navbar title="Projects" subtitle="Manage your course projects." user={user} />

      <div className="section-title" style={{ marginBottom: 20 }}>
        <h2>All Projects</h2>
        <Link to="/professor/projects/create">
          <Button variant="primary">+ Create Project</Button>
        </Link>
      </div>

      <div className="projects-grid">
        {projects.map(p => (
          <Link to={`/professor/projects/${p.id}`} key={p.id} className="project-card-link">
            <div className={`project-color ${p.color}`}>
              <span className="project-symbol">{p.icon}</span>
              <small>PROJECT #{String(p.id).padStart(2, '0')}</small>
              <b>{p.overallProgress}%</b>
            </div>
            <div className="project-info">
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <div className="meta">
                <span>Due: {new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>{p.groups?.length || 0} groups</span>
              </div>
              <div className="project-progress-bar">
                <div className="project-progress-fill" style={{ width: `${p.overallProgress}%` }}></div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

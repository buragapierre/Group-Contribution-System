import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { projects, classes } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import './Projects.css';

export default function Projects() {
  const { currentUser } = useUser();
  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };

  const professorClasses = classes.filter(c => c.professorId === currentUser?.id);
  const professorProjects = projects.filter(p => p.classId && professorClasses.some(c => c.id === p.classId));

  return (
    <div>
      <Navbar title="Projects" subtitle="Manage your course projects." user={user} />

      <div className="section-title" style={{ marginBottom: 20 }}>
        <h2>All Projects</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {professorClasses.length > 0 && (
            <Link to={`/professor/classes/${professorClasses[0].id}/projects/create`}>
              <Button variant="primary">+ Create Project</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="projects-grid">
        {professorProjects.map(p => {
          const cls = classes.find(c => c.id === p.classId);
          return (
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
                  <span>{cls?.course || 'Unknown Class'}</span>
                  <span>Due: {new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>{p.groups?.length || 0} groups</span>
                </div>
                <div className="project-progress-bar">
                  <div className="project-progress-fill" style={{ width: `${p.overallProgress}%` }}></div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

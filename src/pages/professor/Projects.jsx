import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { fetchProfessorProjects } from '../../services/projects';
import { fetchClasses } from '../../services/classes';
import { useUser } from '../../data/UserContext';
import './Projects.css';

export default function Projects() {
  const { currentUser } = useUser();
  const [professorProjects, setProfessorProjects] = useState([]);
  const [professorClasses, setProfessorClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      fetchProfessorProjects(currentUser.id),
      fetchClasses(currentUser.id),
    ]).then(([projects, classes]) => {
      setProfessorProjects(projects);
      setProfessorClasses(classes);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

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
          const cls = professorClasses.find(c => c.id === p.class_id);
          return (
            <Link to={`/professor/projects/${p.id}`} key={p.id} className="project-card-link">
              <div className={`project-color ${p.color}`}>
                <span className="project-symbol">{p.icon}</span>
                <small>PROJECT #{String(p.id).padStart(2, '0')}</small>
                <b>{p.overall_progress}%</b>
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
                  <div className="project-progress-fill" style={{ width: `${p.overall_progress}%` }}></div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

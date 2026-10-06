import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { fetchProfessorProjects } from '../../services/projects';
import { fetchClasses } from '../../services/classes';
import { fetchGroupsByClass } from '../../services/groups';
import { fetchTasksByProject } from '../../services/tasks';
import { useUser } from '../../data/UserContext';
import './Projects.css';

export default function Projects() {
  const { currentUser } = useUser();
  const [professorProjects, setProfessorProjects] = useState([]);
  const [professorClasses, setProfessorClasses] = useState([]);
  const [projectCounts, setProjectCounts] = useState({});
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

      const counts = {};
      const promises = projects.map(p =>
        Promise.all([
          fetchTasksByProject(p.id),
          fetchGroupsByClass(p.class_id),
        ]).then(([tasks, groups]) => {
          counts[p.id] = {
            taskCount: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'verified').length,
            groupCount: groups.length,
          };
        })
      );

      Promise.all(promises).then(() => {
        setProjectCounts(counts);
        setLoading(false);
      });
    }).catch(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <Navbar title="Projects" subtitle="Manage your course projects" user={user} />

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
          const counts = projectCounts[p.id] || { taskCount: 0, completedTasks: 0, groupCount: 0 };
          return (
            <Link to={`/professor/projects/${p.id}`} key={p.id} className="project-card-link">
              <div className={`project-color ${p.color}`}>
                <span className="project-symbol">{p.icon}</span>
                <b>{p.overall_progress}%</b>
              </div>
              <div className="project-info">
                <div className="project-info-top">
                  <h3>{p.title}</h3>
                  <span className={`project-status project-status-${p.status}`}>{p.status}</span>
                </div>
                <p className="project-desc">{p.description}</p>
                <div className="meta">
                  <span>{cls?.subject || 'Unknown Class'}</span>
                  <span>Due: {new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>{counts.groupCount} group{counts.groupCount !== 1 ? 's' : ''}</span>
                  <span>{counts.completedTasks}/{counts.taskCount} tasks</span>
                </div>
                <div className="project-progress-bar">
                  <div className="project-progress-fill" style={{ width: `${p.overall_progress}%` }}></div>
                </div>
              </div>
            </Link>
          );
        })}
        {professorProjects.length === 0 && (
          <div className="cd-empty">No projects yet. Create one to get started.</div>
        )}
      </div>
    </div>
  );
}

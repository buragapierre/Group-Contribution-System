import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { fetchProfessorContributions } from '../../services/contributions';
import { fetchProfessorProjects } from '../../services/projects';
import { fetchProfessorTasks } from '../../services/tasks';
import { fetchClasses } from '../../services/classes';
import { useUser } from '../../data/UserContext';
import './Reports.css';

export default function Reports() {
  const { currentUser } = useUser();
  const [professorClasses, setProfessorClasses] = useState([]);
  const [professorProjects, setProfessorProjects] = useState([]);
  const [professorTasks, setProfessorTasks] = useState([]);
  const [professorContributions, setProfessorContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      fetchClasses(currentUser.id),
      fetchProfessorProjects(currentUser.id),
      fetchProfessorTasks(currentUser.id),
      fetchProfessorContributions(currentUser.id),
    ]).then(([classes, projects, tasks, contributions]) => {
      setProfessorClasses(classes);
      setProfessorProjects(projects);
      setProfessorTasks(tasks);
      setProfessorContributions(contributions);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  const totalTasks = professorTasks.length;
  const completedTasks = professorTasks.filter(t => t.status === 'verified').length;
  const avgContribution = professorContributions.length > 0
    ? Math.round(professorContributions.reduce((a, c) => a + c.contribution_percent, 0) / professorContributions.length)
    : 0;

  return (
    <div>
      <Navbar title="Reports" subtitle="View overall project statistics and reports." user={user} />

      <div className="reports-stats">
        <div className="report-stat">
          <strong>{professorProjects.length}</strong>
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
        <h3>Project Progress by Class</h3>
        {professorClasses.map(cls => {
          const classProjects = professorProjects.filter(p => p.class_id === cls.id);
          if (classProjects.length === 0) return null;
          return (
            <div key={cls.id} className="report-class-group">
              <h4 className="report-class-title">{cls.course} <span>{cls.section || 'General'} · {cls.semester}</span></h4>
              {classProjects.map(p => (
                <div key={p.id} className="report-row">
                  <div className="report-project-info">
                    <h4>{p.title}</h4>
                    <p>{p.groups?.length || 0} groups</p>
                  </div>
                  <div className="report-progress">
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.overall_progress}%` }}></div></div>
                    <span>{p.overall_progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

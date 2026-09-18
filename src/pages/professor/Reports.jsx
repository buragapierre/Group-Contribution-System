import Navbar from '../../components/Navbar';
import { contributions, projects, tasks, classes } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import './Reports.css';

export default function Reports() {
  const { currentUser } = useUser();
  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };

  const professorClasses = classes.filter(c => c.professorId === currentUser?.id);
  const professorProjects = projects.filter(p => p.classId && professorClasses.some(c => c.id === p.classId));
  const professorTasks = tasks.filter(t => t.classId && professorClasses.some(c => c.id === t.classId));
  const professorContributions = contributions.filter(c => c.classId && professorClasses.some(cls => cls.id === c.classId));

  const totalTasks = professorTasks.length;
  const completedTasks = professorTasks.filter(t => t.status === 'verified').length;
  const avgContribution = professorContributions.length > 0
    ? Math.round(professorContributions.reduce((a, c) => a + c.contributionPercent, 0) / professorContributions.length)
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
          const classProjects = professorProjects.filter(p => p.classId === cls.id);
          if (classProjects.length === 0) return null;
          return (
            <div key={cls.id} className="report-class-group">
              <h4 className="report-class-title">{cls.course} <span>{cls.section || 'General'} · {cls.semester}</span></h4>
              {classProjects.map(p => (
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
          );
        })}
      </div>
    </div>
  );
}

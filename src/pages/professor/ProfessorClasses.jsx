import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { classes, projects, groups } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import './ProfessorClasses.css';

export default function ProfessorClasses() {
  const { currentUser } = useUser();
  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };

  const professorClasses = classes.filter(c => c.professorId === currentUser?.id);

  const getClassStats = (classId) => {
    const classProjects = projects.filter(p => p.classId === classId);
    const classGroups = groups.filter(g => g.classId === classId);
    const totalStudents = classGroups.reduce((sum, g) => sum + g.members.length, 0);
    const avgProgress = classProjects.length > 0
      ? Math.round(classProjects.reduce((sum, p) => sum + p.overallProgress, 0) / classProjects.length)
      : 0;
    return { projectCount: classProjects.length, groupCount: classGroups.length, studentCount: totalStudents, avgProgress };
  };

  return (
    <div>
      <Navbar title="My Classes" subtitle="Manage your classes, projects, and groups." user={user} />

      <div className="section-title" style={{ marginBottom: 20 }}>
        <h2>All Classes</h2>
        <Link to="/professor/classes/create">
          <Button variant="primary">+ Create Class</Button>
        </Link>
      </div>

      <div className="classes-grid">
        {professorClasses.map(cls => {
          const stats = getClassStats(cls.id);
          return (
            <Link to={`/professor/classes/${cls.id}`} key={cls.id} className="class-card-link">
              <div className={`class-color ${cls.color}`}>
                <span className="class-icon">▣</span>
              </div>
              <div className="class-info">
                <h3>{cls.course}</h3>
                <p className="class-meta">
                  {cls.section || 'General Class'} · {cls.semester} · {cls.academicYear}
                </p>
                <div className="class-stats-row">
                  <span><strong>{stats.projectCount}</strong> Projects</span>
                  <span><strong>{stats.groupCount}</strong> Groups</span>
                  <span><strong>{stats.studentCount}</strong> Students</span>
                </div>
                <div className="class-progress-bar">
                  <div className="class-progress-fill" style={{ width: `${stats.avgProgress}%` }}></div>
                </div>
                <span className="class-progress-label">{stats.avgProgress}% avg progress</span>
              </div>
            </Link>
          );
        })}
        {professorClasses.length === 0 && (
          <div className="empty-state">
            <p>No classes yet. Create your first class to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

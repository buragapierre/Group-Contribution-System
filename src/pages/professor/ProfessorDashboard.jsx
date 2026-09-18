import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { projects, groups, tasks } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import './ProfessorDashboard.css';

export default function ProfessorDashboard() {
  const { currentUser } = useUser();
  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };
  const professorProjects = projects.filter(project => project.professorId === (currentUser?.id || 2));
  const professorGroups = groups.filter(group => professorProjects.some(project => project.id === group.projectId));
  const totalStudents = new Set(professorGroups.flatMap(group => group.members)).size;
  const pendingTasks = tasks.filter(task => (task.status === 'submitted' || task.status === 'under_review') && professorGroups.some(group => group.id === task.groupId)).length;

  return (
    <div>
      <Navbar title="Professor Dashboard" subtitle="Create projects, organize groups, and monitor progress." user={user} />
      <div className="prof-stats">
        <div className="stat-card"><div className="stat-icon purple">▤</div><div><strong>{professorProjects.length}</strong><span>Active Projects</span></div></div>
        <div className="stat-card"><div className="stat-icon blue">♧</div><div><strong>{professorGroups.length}</strong><span>Groups</span></div></div>
        <div className="stat-card"><div className="stat-icon green">◎</div><div><strong>{totalStudents}</strong><span>Students</span></div></div>
        <div className="stat-card"><div className="stat-icon yellow">◷</div><div><strong>{pendingTasks}</strong><span>Pending Reviews</span></div></div>
      </div>

      <div className="prof-grid">
        <div className="prof-left">
          <div className="section-title"><h2>My Projects</h2><Link to="/professor/projects" className="view-btn">View all →</Link></div>
          <div className="project-list">
            {professorProjects.map(project => (
              <Link to={`/professor/projects/${project.id}`} key={project.id} className="prof-project-row">
                <div className={`project-color ${project.color}`}><span>{project.icon}</span></div>
                <div className="prof-project-info"><h4>{project.title}</h4><p>Due: {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {project.overallProgress}% complete</p></div>
              </Link>
            ))}
            {professorProjects.length === 0 && <div className="empty-state-sm">No projects yet. <Link to="/professor/projects/create">Create one</Link></div>}
          </div>
        </div>
        <div className="prof-right">
          <div className="section-title"><h2>Next Steps</h2></div>
          <div className="prof-group-list">
            <Link to="/professor/classes/create" className="prof-group-row"><div className="group-icon-sm">+</div><div><h4>Create a class</h4><p>Start by setting up your course and section.</p></div></Link>
            <Link to="/professor/projects/create" className="prof-group-row"><div className="group-icon-sm">▤</div><div><h4>Create a project</h4><p>Set the project brief and deadline.</p></div></Link>
            <Link to="/professor/groups" className="prof-group-row"><div className="group-icon-sm">♧</div><div><h4>Organize groups</h4><p>Assign members and review group progress.</p></div></Link>
            <Link to="/professor/contribution" className="prof-group-row"><div className="group-icon-sm">◉</div><div><h4>Review contributions</h4><p>See each student’s task performance.</p></div></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

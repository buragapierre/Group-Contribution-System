import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { classes, projects, groups, tasks, contributions } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import './StudentClassDetail.css';

export default function StudentClassDetail() {
  const { id } = useParams();
  const { currentUser } = useUser();
  const userId = currentUser?.id;
  const cls = classes.find(c => c.id === parseInt(id));

  if (!cls) {
    return (
      <div>
        <Navbar title="Class Not Found" subtitle="" user={{ name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' }} />
        <p>Class not found.</p>
      </div>
    );
  }

  const classProjects = projects.filter(p => p.classId === cls.id);
  const classGroups = groups.filter(g => g.classId === cls.id);
  const myGroup = classGroups.find(g => g.members.includes(userId));
  const classTasks = tasks.filter(t => t.classId === cls.id);
  const myTasks = classTasks.filter(t => t.assignedTo === userId);
  const myContributions = contributions.filter(c => c.userId === userId && c.classId === cls.id);
  const myContribution = myContributions[0];

  const completedTasks = myTasks.filter(t => t.status === 'verified').length;
  const dueSoon = myTasks
    .filter(t => t.status !== 'verified')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

  return (
    <div>
      <Navbar title={cls.course} subtitle={`${cls.section || 'General Class'} · ${cls.semester} · ${cls.academicYear}`} user={user} />

      <Link to="/student/classes" className="back-link">← Back to My Classes</Link>

      <div className="scd-class-info">
        <div className="scd-info-row">
          <span className="scd-label">Professor</span>
          <span className="scd-value">{cls.professorName}</span>
        </div>
        <div className="scd-info-row">
          <span className="scd-label">Section</span>
          <span className="scd-value">{cls.section || 'General Class'}</span>
        </div>
        <div className="scd-info-row">
          <span className="scd-label">Semester</span>
          <span className="scd-value">{cls.semester} · {cls.academicYear}</span>
        </div>
      </div>

      {myGroup && (
        <div className="scd-my-group">
          <div className="scd-mg-header">
            <span className="group-icon">♧</span>
            <div>
              <h3>{myGroup.name}</h3>
              <p>{myGroup.projectName} · {myGroup.leaderName === currentUser?.name ? 'You are the Leader' : `Leader: ${myGroup.leaderName}`}</p>
            </div>
            <div className="scd-mg-progress">
              <div className="progress-bar" style={{ width: 80 }}><div className="progress-fill" style={{ width: `${myGroup.progress}%` }}></div></div>
              <span>{myGroup.progress}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="scd-stats">
        <div className="stat-card"><div className="stat-icon blue">✓</div><div><strong>{completedTasks}/{myTasks.length}</strong><span>My Tasks Done</span></div></div>
        <div className="stat-card"><div className="stat-icon yellow">⏳</div><div><strong>{dueSoon.length}</strong><span>Due Soon</span></div></div>
        <div className="stat-card"><div className="stat-icon green">◉</div><div><strong>{myContribution?.contributionPercent || 0}%</strong><span>My Contribution</span></div></div>
        <div className="stat-card"><div className="stat-icon purple">▤</div><div><strong>{classProjects.length}</strong><span>Projects</span></div></div>
      </div>

      <div className="scd-grid">
        <div className="scd-main">
          <div className="section-title">
            <h2>My Tasks in This Class</h2>
          </div>
          <div className="scd-tasks-list">
            {myTasks.map(t => (
              <Link to={`/student/tasks/${t.id}`} key={t.id} className="scd-task-row">
                <div className={`task-color ${t.color}`} style={{ width: 3 }}></div>
                <div className="scd-task-info">
                  <div className="scd-task-header">
                    <h4>{t.title}</h4>
                    <span className={`status-pill status-${t.status.replace('_', '-')}`}>{t.status.replace('_', ' ')}</span>
                  </div>
                  <p>Due: {new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  <div className="scd-task-progress">
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${t.progress}%` }}></div></div>
                    <span>{t.progress}%</span>
                  </div>
                </div>
              </Link>
            ))}
            {myTasks.length === 0 && (
              <p className="scd-empty">No tasks assigned to you in this class yet.</p>
            )}
          </div>

          <div className="section-title" style={{ marginTop: 28 }}>
            <h2>Projects</h2>
          </div>
          <div className="scd-projects-list">
            {classProjects.map(p => (
              <div key={p.id} className="scd-project-row">
                <div className={`project-color ${p.color}`} style={{ width: 40, height: 40, borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 16 }}>
                  {p.icon}
                </div>
                <div className="scd-project-info">
                  <h4>{p.title}</h4>
                  <p>{p.groups?.length || 0} groups · Due: {new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="scd-project-progress">
                  <div className="progress-bar" style={{ width: 60 }}><div className="progress-fill" style={{ width: `${p.overallProgress}%` }}></div></div>
                  <span>{p.overallProgress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="scd-sidebar">
          <div className="scd-sidebar-card">
            <h3>Groups in This Class</h3>
            {classGroups.map(g => (
              <div key={g.id} className="scd-group-row">
                <div className="group-icon-sm">♧</div>
                <div>
                  <h4>{g.name}</h4>
                  <p>{g.members.length} members · Leader: {g.leaderName}</p>
                </div>
                <span className="scd-group-progress">{g.progress}%</span>
              </div>
            ))}
          </div>

          {myContribution && (
            <div className="scd-sidebar-card">
              <h3>My Contribution</h3>
              <div className="scd-contrib-ring">
                <svg viewBox="0 0 36 36">
                  <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="ring-fill" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    strokeDasharray={`${myContribution.contributionPercent}, 100`} />
                </svg>
                <span>{myContribution.contributionPercent}%</span>
              </div>
              <div className="scd-contrib-details">
                <p><strong>{myContribution.tasksCompleted}</strong> / {myContribution.tasksAssigned} tasks completed</p>
                <p><strong>{myContribution.onTimeCompletions}</strong> on-time submissions</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

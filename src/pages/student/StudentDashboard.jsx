import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { tasks, contributions } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { currentUser } = useUser();
  const userId = currentUser?.id || 4;
  const profile = currentUser?.profile;
  const enrolledClasses = currentUser?.classes || [];

  const allMyTasks = tasks.filter(t => t.assignedTo === userId);
  const completedTasks = allMyTasks.filter(t => t.status === 'verified').length;
  const allMyContributions = contributions.filter(c => c.userId === userId);
  const avgContribution = allMyContributions.length > 0
    ? Math.round(allMyContributions.reduce((sum, c) => sum + c.contributionPercent, 0) / allMyContributions.length)
    : 0;

  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

  return (
    <div>
      <Navbar title="Student Dashboard" subtitle="Your academic overview and enrolled classes." user={user} />

      <div className="sdb-welcome">
        <div className="sdb-welcome-avatar">{currentUser?.avatar}</div>
        <div className="sdb-welcome-info">
          <h2>Welcome, {currentUser?.name}</h2>
          <p>{profile?.course} · {profile?.yearLevel} · Section {profile?.section}</p>
        </div>
      </div>

      <div className="sdb-stats">
        <div className="stat-card"><div className="stat-icon blue">▦</div><div><strong>{enrolledClasses.length}</strong><span>Enrolled Classes</span></div></div>
        <div className="stat-card"><div className="stat-icon purple">✓</div><div><strong>{completedTasks}/{allMyTasks.length}</strong><span>Total Tasks Done</span></div></div>
        <div className="stat-card"><div className="stat-icon green">◉</div><div><strong>{avgContribution}%</strong><span>Avg. Contribution</span></div></div>
        <div className="stat-card"><div className="stat-icon yellow">♧</div><div><strong>{currentUser?.group ? 1 : 0}</strong><span>My Groups</span></div></div>
      </div>

      <div className="sdb-grid">
        <div className="sdb-left">
          <div className="section-title">
            <h2>My Classes</h2>
            <Link to="/student/classes" className="view-btn">View all →</Link>
          </div>
          <div className="sdb-classes-list">
            {enrolledClasses.map(cls => (
              <Link to={`/student/classes/${cls.id}`} key={cls.id} className="sdb-class-row">
                <div className={`sdb-class-color ${cls.color}`}></div>
                <div className="sdb-class-info">
                  <h4>{cls.course}</h4>
                  <p>Prof. {cls.professorName} · {cls.section || 'General'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="sdb-right">
          <div className="sdb-card">
            <div className="card-head"><h2>Quick Profile</h2></div>
            <div className="sdb-profile-mini">
              <div className="sdb-profile-field">
                <span className="label">Student ID</span>
                <span className="value">{profile?.studentId || currentUser?.idNumber}</span>
              </div>
              <div className="sdb-profile-field">
                <span className="label">Course</span>
                <span className="value">{profile?.course || '-'}</span>
              </div>
              <div className="sdb-profile-field">
                <span className="label">Year Level</span>
                <span className="value">{profile?.yearLevel || '-'}</span>
              </div>
              <div className="sdb-profile-field">
                <span className="label">Section</span>
                <span className="value">{profile?.section || '-'}</span>
              </div>
            </div>
          </div>

          <div className="sdb-card">
            <div className="card-head"><h2>Recent Tasks</h2></div>
            {allMyTasks.slice(0, 3).map(t => (
              <div key={t.id} className="sdb-task-mini">
                <div className={`task-color ${t.color}`} style={{ width: 3 }}></div>
                <div>
                  <strong>{t.title}</strong>
                  <small>{t.status.replace('_', ' ')} · Due: {new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

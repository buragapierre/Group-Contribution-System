import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { tasks, groups, contributions } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import DeadlineCalendar from '../../components/DeadlineCalendar';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { currentUser } = useUser();
  const userId = currentUser?.id || 4;
  const groupId = currentUser?.groupId;

  const myTasks = tasks.filter(t => t.assignedTo === userId);
  const group = groups.find(g => g.id === groupId) || groups[0];
  const myContribution = contributions.find(c => c.userId === userId);
  const completedTasks = myTasks.filter(t => t.status === 'verified').length;
  const dueSoon = myTasks.filter(t => t.status !== 'verified').sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 3);

  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

  return (
    <div>
      <Navbar title="Student Dashboard" subtitle="Track your tasks, contributions, and group progress." user={user} />

      <div className="student-stats">
        <div className="stat-card"><div className="stat-icon purple">♧</div><div><strong>{group.name}</strong><span>My Group</span></div></div>
        <div className="stat-card"><div className="stat-icon blue">✓</div><div><strong>{completedTasks}/{myTasks.length}</strong><span>Tasks Completed</span></div></div>
        <div className="stat-card"><div className="stat-icon yellow">⏳</div><div><strong>{dueSoon.length}</strong><span>Due Soon</span></div></div>
        <div className="stat-card"><div className="stat-icon green">◉</div><div><strong>{myContribution?.contributionPercent || 0}%</strong><span>My Contribution</span></div></div>
      </div>

      <div className="student-grid">
        <div className="st-left">
          <div className="section-title">
            <h2>Assigned Tasks</h2>
            <Link to="/student/tasks" className="view-btn">View all →</Link>
          </div>
          <div className="st-task-list">
            {myTasks.map(t => (
              <Link to={`/student/tasks/${t.id}`} key={t.id} className="st-task-row">
                <div className={`task-color ${t.color}`} style={{ width: 3 }}></div>
                <div className="st-task-info">
                  <div className="st-task-header">
                    <h4>{t.title}</h4>
                    <span className={`status-pill status-${t.status.replace('_', '-')}`}>{t.status.replace('_', ' ')}</span>
                  </div>
                  <p>Due: {new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  <div className="st-task-progress">
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${t.progress}%` }}></div></div>
                    <span>{t.progress}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="st-right">
          <DeadlineCalendar tasks={myTasks} />

          <div className="st-card">
            <div className="card-head"><h2>Upcoming Deadlines</h2></div>
            {dueSoon.map(t => (
              <div key={t.id} className="deadline-row">
                <div className="date-box">
                  <b>{new Date(t.deadline).getDate()}</b>
                  <span>{new Date(t.deadline).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
                </div>
                <div>
                  <strong>{t.title}</strong>
                  <small>{t.progress}% complete</small>
                </div>
              </div>
            ))}
          </div>

          <div className="st-card">
            <div className="card-head"><h2>My Contribution</h2></div>
            <div className="contribution-summary">
              <div className="cs-ring">
                <svg viewBox="0 0 36 36">
                  <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="ring-fill" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    strokeDasharray={`${myContribution?.contributionPercent || 0}, 100`} />
                </svg>
                <span>{myContribution?.contributionPercent || 0}%</span>
              </div>
              <div className="cs-details">
                <p><strong>{myContribution?.tasksCompleted || 0}</strong> tasks completed</p>
                <p><strong>{myContribution?.onTimeCompletions || 0}</strong> on-time submissions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

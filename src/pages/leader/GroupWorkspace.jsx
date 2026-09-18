import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { groups, tasks, contributions } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import './GroupWorkspace.css';

export default function GroupWorkspace() {
  const { currentUser } = useUser();
  const leaderGroupId = currentUser?.leaderGroupId;
  const group = groups.find(g => g.id === leaderGroupId) || groups[0];
  const groupTasks = tasks.filter(t => t.groupId === group.id);
  const completedCount = groupTasks.filter(t => t.status === 'verified').length;

  const user = { name: currentUser?.name || 'Leader', avatar: currentUser?.avatar || 'LD', role: 'Group Leader' };

  return (
    <div>
      <Navbar title={group.name} subtitle={`${group.projectName} · ${group.members.length} members`} user={user} />

      <div className="workspace-stats">
        <div className="stat-card"><div className="stat-icon blue">✓</div><div><strong>{completedCount}/{groupTasks.length}</strong><span>Tasks Completed</span></div></div>
        <div className="stat-card"><div className="stat-icon green">◉</div><div><strong>{group.progress}%</strong><span>Group Progress</span></div></div>
        <div className="stat-card"><div className="stat-icon purple">👥</div><div><strong>{group.members.length}</strong><span>Members</span></div></div>
        <div className="stat-card"><div className="stat-icon yellow">⏳</div><div><strong>{groupTasks.filter(t => t.status === 'in_progress').length}</strong><span>In Progress</span></div></div>
      </div>

      <div className="workspace-grid">
        <div className="ws-left">
          <div className="section-title">
            <h2>Recent Tasks</h2>
            <Link to="/leader/tasks" className="view-btn">View all →</Link>
          </div>
          <div className="ws-task-list">
            {groupTasks.slice(0, 4).map(t => (
              <Link to={`/leader/tasks/${t.id}`} key={t.id} className="ws-task-row">
                <div className={`task-color ${t.color}`} style={{ width: 3 }}></div>
                <div className="ws-task-info">
                  <h4>{t.title}</h4>
                  <p>Due: {new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <span className={`status-pill status-${t.status.replace('_', '-')}`}>{t.status.replace('_', ' ')}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="ws-right">
          <div className="section-title">
            <h2>Members</h2>
            <Link to="/leader/members" className="view-btn">Manage →</Link>
          </div>
          <div className="ws-member-list">
            {group.members.map((mId, i) => {
              const c = contributions.find(c => c.userId === mId);
              return (
                <div key={mId} className="ws-member-row">
                  <div className={`mini-avatar`} style={{ background: ['#dce9ef', '#e8dff5', '#d1fae5', '#fce7f3'][i % 4] }}>{c?.avatar || String(i+1).padStart(2,'0')}</div>
                  <div>
                    <h4>{c?.userName || `Member ${i+1}`}</h4>
                    <p>{c?.tasksAssigned || 0} tasks · {c?.contributionPercent || 0}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

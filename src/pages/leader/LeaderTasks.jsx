import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { tasks, groups } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import './LeaderTasks.css';

export default function LeaderTasks() {
  const { currentUser } = useUser();
  const leaderGroupId = currentUser?.leaderGroupId;
  const group = groups.find(g => g.id === leaderGroupId) || groups[0];
  const groupTasks = tasks.filter(t => t.groupId === group.id);
  const user = { name: currentUser?.name || 'Leader', avatar: currentUser?.avatar || 'LD', role: 'Group Leader' };

  return (
    <div>
      <Navbar title="Task Management" subtitle="Create, assign, and track group tasks." user={user} />

      <div className="section-title" style={{ marginBottom: 20 }}>
        <h2>Group Tasks</h2>
        <Link to="/leader/tasks/create">
          <Button variant="primary">+ Create Task</Button>
        </Link>
      </div>

      <div className="leader-tasks-grid">
        {groupTasks.map(t => (
          <Link to={`/leader/tasks/${t.id}`} key={t.id} className="leader-task-card">
            <div className={`task-color ${t.color}`}></div>
            <div className="ltc-content">
              <div className="ltc-header">
                <h4>{t.title}</h4>
                <StatusBadge status={t.status} />
              </div>
              <p>{t.description}</p>
              <div className="ltc-meta">
                <span>Due: {new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span>Priority: {t.priority}</span>
              </div>
              <div className="ltc-progress">
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${t.progress}%` }}></div></div>
                <span>{t.progress}%</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

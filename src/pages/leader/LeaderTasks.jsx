import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { tasks, users } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import { useLeaderGroup } from '../../data/useLeaderGroup';
import './LeaderTasks.css';

export default function LeaderTasks() {
  const { currentUser } = useUser();
  const group = useLeaderGroup(currentUser);
  const groupTasks = tasks.filter(t => t.groupId === group.id);
  const user = { name: currentUser?.name || 'Leader', avatar: currentUser?.avatar || 'LD', role: 'Group Leader' };

  return (
    <div>
      <Navbar title="Task Management" subtitle={`${group.name} · ${group.projectName}`} user={user} />

      <div className="lt-header">
        <div className="lt-count">
          <h2>Group Tasks</h2>
          <span className="lt-badge">{groupTasks.length} task{groupTasks.length !== 1 ? 's' : ''}</span>
        </div>
        <Link to={`/leader/tasks/create?group=${group.id}`}>
          <Button variant="primary">+ Create Task</Button>
        </Link>
      </div>

      {groupTasks.length === 0 ? (
        <div className="lt-empty">
          <span className="lt-empty-icon">✓</span>
          <h3>No tasks yet</h3>
          <p>Create your first task and assign it to a group member.</p>
          <Link to={`/leader/tasks/create?group=${group.id}`}>
            <Button variant="primary">+ Create Task</Button>
          </Link>
        </div>
      ) : (
        <div className="lt-list">
          {groupTasks.map(t => {
            const assignedUser = users.find(u => u.id === t.assignedTo);
            return (
              <Link to={`/leader/tasks/${t.id}`} key={t.id} className="lt-card">
                <div className={`lt-card-color ${t.color}`}></div>
                <div className="lt-card-body">
                  <div className="lt-card-top">
                    <h4>{t.title}</h4>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="lt-card-desc">{t.description}</p>
                  <div className="lt-card-meta">
                    <span className="lt-assignee">
                      {assignedUser?.avatar && (
                        <span className="lt-mini-avatar">{assignedUser.avatar}</span>
                      )}
                      {assignedUser?.name || 'Unassigned'}
                    </span>
                    <span className="lt-due">
                      <span className="lt-meta-icon">📅</span>
                      {new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className={`lt-priority lt-priority-${t.priority}`}>
                      {t.priority}
                    </span>
                  </div>
                  <div className="lt-card-progress">
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${t.progress}%` }}></div></div>
                    <span>{t.progress}%</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

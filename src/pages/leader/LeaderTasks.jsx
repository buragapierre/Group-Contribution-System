import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { useUser } from '../../data/UserContext';
import { useLeaderGroup } from '../../data/useLeaderGroup';
import { fetchTasksByGroup } from '../../services/tasks';
import { fetchGroupMembers } from '../../services/groups';
import './LeaderTasks.css';

export default function LeaderTasks() {
  const { currentUser } = useUser();
  const group = useLeaderGroup(currentUser);
  const [groupTasks, setGroupTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!group) return;
    Promise.all([
      fetchTasksByGroup(group.id),
      fetchGroupMembers(group.id),
    ])
      .then(([tasks, mems]) => {
        setGroupTasks(tasks);
        setMembers(mems);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [group]);

  const user = { name: currentUser?.name || 'Leader', avatar: currentUser?.avatar || 'LD', role: 'Group Leader' };

  if (!group) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No group selected.</div>;
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <Navbar title="Task Management" subtitle={`${group.name} · ${group.project_name}`} user={user} />

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
            const assignedUser = members.find(u => u.id === t.assigned_to);
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

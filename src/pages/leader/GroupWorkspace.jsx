import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useUser } from '../../data/UserContext';
import { useLeaderGroup } from '../../data/useLeaderGroup';
import { fetchTasksByGroup } from '../../services/tasks';
import { fetchGroupMembers } from '../../services/groups';
import { fetchContributionsByClass } from '../../services/contributions';
import { fetchClassById } from '../../services/classes';
import './GroupWorkspace.css';

export default function GroupWorkspace() {
  const { currentUser, setSelectedLeaderGroupId } = useUser();
  const navigate = useNavigate();
  const group = useLeaderGroup(currentUser);

  const [groupTasks, setGroupTasks] = useState([]);
  const [cls, setCls] = useState(null);
  const [memberDetails, setMemberDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!group) return;
    Promise.all([
      fetchTasksByGroup(group.id),
      fetchClassById(group.class_id),
      fetchGroupMembers(group.id).then(members =>
        fetchContributionsByClass(group.class_id).then(contributions =>
          members.map(m => {
            const c = contributions.find(c => c.user_id === m.id);
            return { ...m, ...c, isLeader: m.id === group.leader_id };
          })
        )
      ),
    ])
      .then(([tasks, cls, members]) => {
        setGroupTasks(tasks);
        setCls(cls);
        setMemberDetails(members);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [group]);

  const completedCount = groupTasks.filter(t => t.status === 'verified').length;
  const inProgressCount = groupTasks.filter(t => t.status === 'in_progress').length;
  const pendingCount = groupTasks.filter(t => t.status === 'submitted' || t.status === 'under_review').length;

  const user = { name: currentUser?.name || 'Leader', avatar: currentUser?.avatar || 'LD', role: 'Group Leader' };

  if (!group) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No group selected.</div>;
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <Navbar title={group.name} subtitle={`${group.project_name} · ${memberDetails.length} members`} user={user} />

      {cls && (
        <div className="ws-context-bar">
          <span className="ws-ctx-icon">▣</span>
          <div className="ws-ctx-info">
            <span className="ws-ctx-class">{cls.course}</span>
            <span className="ws-ctx-meta">{cls.section || 'General Class'} · {cls.semester} · {cls.professor_name}</span>
          </div>
        </div>
      )}

      {currentUser?.leaderGroups?.length > 1 && (
        <div className="ws-group-selector">
          <span className="ws-gs-label">Your Groups</span>
          <div className="ws-gs-cards">
            {currentUser.leaderGroups.map(lg => {
              const isActive = lg.id === group.id;
              return (
                <button
                  key={lg.id}
                  className={`ws-gs-card ${isActive ? 'ws-gs-card-active' : ''}`}
                  onClick={() => {
                    setSelectedLeaderGroupId(lg.id);
                    navigate(`/leader?group=${lg.id}`);
                  }}
                >
                  <div className="ws-gs-card-top">
                    <span className="ws-gs-project">{lg.project_name || lg.projectName}</span>
                    <span className="ws-gs-group-name">{lg.name}</span>
                  </div>
                  <div className="ws-gs-card-bottom">
                    <span className="ws-gs-members">{lg.member_count || 0} members</span>
                    <span className="ws-gs-progress">{lg.progress}%</span>
                  </div>
                  {isActive && <div className="ws-gs-active-indicator"></div>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="ws-stats">
        <div className="ws-stat-card">
          <div className="ws-stat-icon blue">✓</div>
          <div className="ws-stat-body">
            <strong>{completedCount}/{groupTasks.length}</strong>
            <span>Tasks Completed</span>
          </div>
        </div>
        <div className="ws-stat-card">
          <div className="ws-stat-icon green">◉</div>
          <div className="ws-stat-body">
            <strong>{group.progress}%</strong>
            <span>Group Progress</span>
          </div>
        </div>
        <div className="ws-stat-card">
          <div className="ws-stat-icon purple">♧</div>
          <div className="ws-stat-body">
            <strong>{memberDetails.length}</strong>
            <span>Members</span>
          </div>
        </div>
        <div className="ws-stat-card">
          <div className="ws-stat-icon yellow">⏳</div>
          <div className="ws-stat-body">
            <strong>{inProgressCount + pendingCount}</strong>
            <span>Active Tasks</span>
          </div>
        </div>
      </div>

      <div className="ws-grid">
        <div className="ws-main">
          <div className="ws-section">
            <div className="ws-section-header">
              <h2>Recent Tasks</h2>
              <Link to={`/leader/tasks?group=${group.id}`} className="ws-view-all">View all →</Link>
            </div>
            {groupTasks.length === 0 ? (
              <div className="ws-empty">
                <span className="ws-empty-icon">✓</span>
                <p>No tasks yet. Create your first task to get started.</p>
                <Link to={`/leader/tasks/create?group=${group.id}`} className="ws-empty-btn">+ Create Task</Link>
              </div>
            ) : (
              <div className="ws-task-list">
                {groupTasks.slice(0, 4).map(t => {
                  const assignedUser = memberDetails.find(u => u.id === t.assigned_to);
                  return (
                    <Link to={`/leader/tasks/${t.id}`} key={t.id} className="ws-task-row">
                      <div className={`task-color ${t.color}`} style={{ width: 4 }}></div>
                      <div className="ws-task-body">
                        <div className="ws-task-top">
                          <h4>{t.title}</h4>
                          <span className={`status-pill status-${t.status.replace('_', '-')}`}>{t.status.replace('_', ' ')}</span>
                        </div>
                        <div className="ws-task-meta">
                          <span className="ws-task-assignee">
                            {assignedUser?.avatar && (
                              <span className="ws-mini-avatar">{assignedUser.avatar}</span>
                            )}
                            {assignedUser?.name || 'Unassigned'}
                          </span>
                          <span className="ws-task-due">Due: {new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className={`ws-priority ws-priority-${t.priority}`}>{t.priority}</span>
                        </div>
                        <div className="ws-task-progress">
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
        </div>

        <div className="ws-side">
          <div className="ws-section">
            <div className="ws-section-header">
              <h2>Members</h2>
              <Link to={`/leader/members?group=${group.id}`} className="ws-view-all">Manage →</Link>
            </div>
            <div className="ws-member-list">
              {memberDetails.map((m, i) => (
                <div key={m.id || i} className="ws-member-card">
                  <div className="ws-member-avatar" style={{ background: ['#dce9ef', '#e8dff5', '#d1fae5', '#fce7f3', '#fef3c7'][i % 5] }}>
                    {m.avatar || String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="ws-member-info">
                    <div className="ws-member-name-row">
                      <h4>{m.name || `Member ${i + 1}`}</h4>
                      {m.isLeader && <span className="ws-leader-badge">Leader</span>}
                    </div>
                    <p>{m.tasks_completed || 0} tasks done · {m.contribution_percent || 0}%</p>
                  </div>
                  <div className="ws-member-progress">
                    <div className="ws-mini-progress">
                      <div className="ws-mini-progress-fill" style={{ width: `${m.contribution_percent || 0}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

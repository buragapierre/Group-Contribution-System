import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useUser } from '../../data/UserContext';
import { fetchUserActivities } from '../../services/activities';
import activityIcon from '../../assets/activity.png';
import taskIcon from '../../assets/task.png';
import submissionIcon from '../../assets/submission.png';
import './ActivityHistory.css';

const TYPE_META = {
  task_assigned: { icon: '📋', label: 'Task Assigned', color: 'blue' },
  task_started: { icon: '▶', label: 'Task Started', color: 'purple' },
  progress_update: { icon: '📊', label: 'Progress Update', color: 'yellow' },
  task_submitted: { icon: '📤', label: 'Task Submitted', color: 'green' },
  task_verified: { icon: '✅', label: 'Task Verified', color: 'green' },
  revision_requested: { icon: '🔄', label: 'Revision Requested', color: 'red' },
  member_added: { icon: '+', label: 'Member Added', color: 'blue' },
  member_removed: { icon: '−', label: 'Member Removed', color: 'red' },
};

export default function ActivityHistory() {
  const { currentUser } = useUser();
  const [myActivities, setMyActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [weekAgo] = useState(() => Date.now() - 7 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    if (!currentUser) return;
    fetchUserActivities(currentUser.id).then(result => {
      setMyActivities(result);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

  const filtered = filter === 'all' ? myActivities : myActivities.filter(a => a.type === filter);

  const groupedByDate = filtered.reduce((acc, a) => {
    const date = new Date(a.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(a);
    return acc;
  }, {});

  const thisWeek = myActivities.filter(a => new Date(a.timestamp).getTime() >= weekAgo).length;
  const submitted = myActivities.filter(a => a.type === 'task_submitted').length;
  const verified = myActivities.filter(a => a.type === 'task_verified').length;

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'task_submitted', label: 'Submissions' },
    { key: 'task_verified', label: 'Verified' },
    { key: 'task_assigned', label: 'Assigned' },
    { key: 'revision_requested', label: 'Revisions' },
  ];

  return (
    <div>
      <Navbar title="Activity History" subtitle="Your recorded activities and timeline" user={user} />

      <div className="ah-stats">
        <div className="stat-card">
          <div className="stat-icon purple"><img src={activityIcon} alt="Activities" style={{ width: 16, height: 16 }} /></div>
          <div><strong>{myActivities.length}</strong><span>Total Activities</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><img src={activityIcon} alt="Recent" style={{ width: 16, height: 16 }} /></div>
          <div><strong>{thisWeek}</strong><span>This Week</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><img src={submissionIcon} alt="Submissions" style={{ width: 16, height: 16 }} /></div>
          <div><strong>{submitted}</strong><span>Submissions</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><img src={taskIcon} alt="Verified" style={{ width: 16, height: 16 }} /></div>
          <div><strong>{verified}</strong><span>Verified Tasks</span></div>
        </div>
      </div>

      <div className="ah-grid">
        <div className="ah-main">
          <div className="ah-toolbar">
            <h2>Timeline</h2>
            <div className="ah-filters">
              {filters.map(f => (
                <button
                  key={f.key}
                  className={`ah-filter-btn ${filter === f.key ? 'active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="ah-empty">
              <img src={activityIcon} alt="" className="ah-empty-icon" />
              <h3>No activities yet</h3>
              <p>When you submit tasks, get verified, or update progress, your activities will appear here.</p>
            </div>
          ) : (
            <div className="activity-timeline">
              {Object.entries(groupedByDate).map(([date, items]) => (
                <div key={date} className="activity-date-group">
                  <h3 className="activity-date">{date}</h3>
                  <div className="activity-entries">
                    {items.map(a => {
                      const meta = TYPE_META[a.type] || { icon: '•', label: a.type, color: 'purple' };
                      return (
                        <div key={a.id} className="activity-entry">
                          <div className={`activity-icon ah-${meta.color}`}>{meta.icon}</div>
                          <div className="activity-content">
                            <div className="activity-entry-top">
                              <p>{a.message}</p>
                              <span className={`ah-type-tag ah-tag-${meta.color}`}>{meta.label}</span>
                            </div>
                            <span className="activity-time">
                              {new Date(a.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ah-side">
          <div className="ah-card">
            <div className="ah-card-head"><h2>Activity Breakdown</h2></div>
            {myActivities.length === 0 ? (
              <p className="ah-card-empty">No data yet.</p>
            ) : (
              Object.entries(TYPE_META)
                .map(([type, meta]) => ({
                  type,
                  meta,
                  count: myActivities.filter(a => a.type === type).length,
                }))
                .filter(row => row.count > 0)
                .map(row => (
                  <div key={row.type} className="ah-breakdown-row">
                    <span className={`ah-breakdown-dot ah-${row.meta.color}`}>{row.meta.icon}</span>
                    <span className="ah-breakdown-label">{row.meta.label}</span>
                    <div className="ah-breakdown-bar">
                      <div
                        className={`ah-breakdown-fill ah-bg-${row.meta.color}`}
                        style={{ width: `${Math.round((row.count / myActivities.length) * 100)}%` }}
                      ></div>
                    </div>
                    <strong>{row.count}</strong>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

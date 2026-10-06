import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import TaskCard from '../../components/TaskCard';
import taskIcon from '../../assets/task.png';
import { useUser } from '../../data/UserContext';
import { fetchUserTasks } from '../../services/tasks';
import { fetchReminders } from '../../lib/api';
import './MyTasks.css';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Verified', value: 'verified' },
  { label: 'Needs Revision', value: 'needs_revision' },
];

export default function MyTasks() {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [myTasks, setMyTasks] = useState([]);
  const [reminders, setReminders] = useState({ overdue: [], due_soon: [] });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (!currentUser) return;
    fetchUserTasks(currentUser.id).then(result => {
      setMyTasks(result);
      setLoading(false);
    }).catch(() => setLoading(false));
    fetchReminders()
      .then(setReminders)
      .catch(() => {});
  }, [currentUser]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

  const filteredTasks = activeFilter === 'all'
    ? myTasks
    : myTasks.filter(t => t.status === activeFilter);

  return (
    <div>
      <Navbar title="My Tasks" subtitle="View and manage your assigned tasks" user={user} />

      {reminders.overdue.length > 0 && (
        <div className="mt-reminder mt-reminder-overdue">
          <div className="mt-reminder-head">
            <span className="mt-reminder-icon">!</span>
            <h3>Overdue</h3>
            <span className="mt-reminder-count">{reminders.overdue.length}</span>
          </div>
          <div className="mt-reminder-list">
            {reminders.overdue.map(t => (
              <div key={t.id} className="mt-reminder-row" onClick={() => navigate(`/student/tasks/${t.id}`)}>
                <span className="mt-reminder-dot overdue"></span>
                <div className="mt-reminder-info">
                  <span className="mt-reminder-title">{t.title}</span>
                  <span className="mt-reminder-meta">
                    Due {new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {t.priority} priority
                  </span>
                </div>
                <span className="mt-reminder-pill overdue">
                  {Math.abs(t.days_left) <= 1 ? 'Yesterday' : `${Math.abs(t.days_left)}d late`}
                </span>
                <span className="mt-reminder-go">→</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reminders.due_soon.length > 0 && (
        <div className="mt-reminder mt-reminder-soon">
          <div className="mt-reminder-head">
            <span className="mt-reminder-icon"><img src={taskIcon} alt="" style={{ width: 15, height: 15 }} /></span>
            <h3>Due soon</h3>
            <span className="mt-reminder-count">{reminders.due_soon.length}</span>
          </div>
          <div className="mt-reminder-list">
            {reminders.due_soon.map(t => (
              <div key={t.id} className="mt-reminder-row" onClick={() => navigate(`/student/tasks/${t.id}`)}>
                <span className="mt-reminder-dot soon"></span>
                <div className="mt-reminder-info">
                  <span className="mt-reminder-title">{t.title}</span>
                  <span className="mt-reminder-meta">
                    Due {new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {t.priority} priority
                  </span>
                </div>
                <span className="mt-reminder-pill soon">
                  {t.days_left === 0 ? 'Today' : t.days_left === 1 ? 'Tomorrow' : `${t.days_left}d left`}
                </span>
                <span className="mt-reminder-go">→</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-filters">
        {FILTERS.map(f => (
          <button
            key={f.value}
            className={`mt-filter-btn ${activeFilter === f.value ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.value)}
          >
            {f.label}
            {f.value === 'all' && <span className="mt-filter-count">{myTasks.length}</span>}
            {f.value !== 'all' && (
              <span className="mt-filter-count">
                {myTasks.filter(t => t.status === f.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="mt-empty">
          <div className="mt-empty-icon">✓</div>
          <h3>No tasks found</h3>
          <p>
            {activeFilter === 'all'
              ? "You don't have any tasks assigned yet."
              : `No tasks with status "${FILTERS.find(f => f.value === activeFilter)?.label}".`}
          </p>
        </div>
      ) : (
        <div className="my-tasks-grid">
          {filteredTasks.map(t => (
            <TaskCard key={t.id} task={t} onClick={() => navigate(`/student/tasks/${t.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

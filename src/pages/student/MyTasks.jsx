import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import TaskCard from '../../components/TaskCard';
import { useUser } from '../../data/UserContext';
import { fetchUserTasks } from '../../services/tasks';
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
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (!currentUser) return;
    fetchUserTasks(currentUser.id).then(result => {
      setMyTasks(result);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

  const filteredTasks = activeFilter === 'all'
    ? myTasks
    : myTasks.filter(t => t.status === activeFilter);

  return (
    <div>
      <Navbar title="My Tasks" subtitle="View and manage your assigned tasks." user={user} />

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

import Navbar from '../../components/Navbar';
import { activities } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import './ActivityHistory.css';

export default function ActivityHistory() {
  const { currentUser } = useUser();
  const userId = currentUser?.id || 4;
  const myActivities = activities.filter(a => a.userId === userId);
  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

  const groupedByDate = myActivities.reduce((acc, a) => {
    const date = new Date(a.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(a);
    return acc;
  }, {});

  const typeIcons = {
    task_assigned: '📋',
    task_started: '▶',
    progress_update: '📊',
    task_submitted: '📤',
    task_verified: '✅',
    revision_requested: '🔄',
  };

  return (
    <div>
      <Navbar title="Activity History" subtitle="Your recorded activities and timeline." user={user} />

      <div className="activity-timeline">
        {Object.entries(groupedByDate).map(([date, items]) => (
          <div key={date} className="activity-date-group">
            <h3 className="activity-date">{date}</h3>
            <div className="activity-entries">
              {items.map(a => (
                <div key={a.id} className="activity-entry">
                  <div className="activity-icon">{typeIcons[a.type] || '•'}</div>
                  <div className="activity-content">
                    <p>{a.message}</p>
                    <span className="activity-time">
                      {new Date(a.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

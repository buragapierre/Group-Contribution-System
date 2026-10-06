import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useUser } from '../../data/UserContext';
import { fetchNotifications } from '../../lib/api';
import './Notifications.css';

const KIND_META = {
  overdue: { label: 'Overdue', color: 'red' },
  due: { label: 'Due soon', color: 'yellow' },
  review: { label: 'Review', color: 'blue' },
  verified: { label: 'Verified', color: 'green' },
  revision: { label: 'Revision', color: 'purple' },
  verify: { label: 'Verify', color: 'blue' },
};

export default function Notifications() {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = { name: currentUser?.name || 'User', avatar: currentUser?.avatar || 'U', role: currentUser?.role || 'User' };

  useEffect(() => {
    if (!currentUser) return;
    fetchNotifications()
      .then(result => {
        setItems(result.items || []);
        const read = [...new Set([
          ...JSON.parse(localStorage.getItem(`notif-read-${currentUser.id}`) || '[]'),
          ...(result.items || []).map(i => i.id),
        ])];
        localStorage.setItem(`notif-read-${currentUser.id}`, JSON.stringify(read));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <Navbar title="Notifications" subtitle="Updates about your tasks and reviews" user={user} />

      {items.length === 0 ? (
        <div className="notif-empty">
          <div className="notif-empty-icon">✓</div>
          <h3>All caught up</h3>
          <p>You have no new notifications.</p>
        </div>
      ) : (
        <div className="notif-list">
          {items.map(n => {
            const meta = KIND_META[n.kind] || { label: n.kind, color: 'blue' };
            return (
              <div key={n.id} className="notif-card" onClick={() => n.link && navigate(n.link)}>
                <span className={`notif-dot notif-${meta.color}`}></span>
                <div className="notif-info">
                  <div className="notif-top">
                    <strong>{n.title}</strong>
                    <span className={`notif-tag notif-tag-${meta.color}`}>{meta.label}</span>
                  </div>
                  <p>{n.message}</p>
                  {n.time && (
                    <span className="notif-time">
                      {new Date(n.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                {n.link && <span className="notif-go">→</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

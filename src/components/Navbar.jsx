import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import notificationIcon from '../assets/notification.png';
import { useUser } from '../data/UserContext';
import { fetchNotifications } from '../lib/api';
import './Navbar.css';

export default function Navbar({ title, subtitle, user, onNotify }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useUser();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    fetchNotifications()
      .then(result => {
        const read = JSON.parse(localStorage.getItem(`notif-read-${currentUser.id}`) || '[]');
        setUnread((result.items || []).filter(i => !read.includes(i.id)).length);
      })
      .catch(() => {});
  }, [currentUser, location.pathname]);

  const goNotifications = () => {
    if (onNotify) {
      onNotify();
      return;
    }
    const path = location.pathname;
    if (path.startsWith('/professor')) navigate('/professor/notifications');
    else if (path.startsWith('/leader')) navigate('/leader/notifications');
    else if (path.startsWith('/admin')) navigate('/admin/notifications');
    else navigate('/student/notifications');
  };

  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="user-area">
        <button className="notification" onClick={goNotifications} aria-label="Notifications">
          <img src={notificationIcon} alt="Notifications" />
          {unread > 0 ? <span className="notif-badge">{unread > 9 ? '9+' : unread}</span> : <i></i>}
        </button>
        <div className="user">
          <div className="avatar">{user?.avatar || 'U'}</div>
          <div>
            <strong>{user?.name || 'User'}</strong>
            <small>{user?.role || 'Role'}</small>
          </div>
        </div>
      </div>
    </header>
  );
}

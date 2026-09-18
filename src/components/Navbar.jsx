import './Navbar.css';

export default function Navbar({ title, subtitle, user, onNotify }) {
  return (
    <header className="topbar">
      <div>
        <h1>
          {title}
          <span>.</span>
        </h1>
        <p>{subtitle}</p>
      </div>
      <div className="user-area">
        <button className="notification" onClick={() => onNotify?.('You have 3 new notifications')}>
          ♧<i></i>
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

import { NavLink } from 'react-router-dom';
import { useUser } from '../data/UserContext';
import './Sidebar.css';

function NavigationLinks({ links, label }) {
  return (
    <nav aria-label={label}>
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.end} onClick={link.onClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span>{link.icon}</span>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Sidebar({ links, role, leadershipLinks = [], leadershipTools = [], leadershipLabel, leadershipContext }) {
  const { logout } = useUser();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-box">▦</span>
        <span>CONTRITRACK.</span>
      </div>
      <p className="sidebar-role">{role === 'leader' ? 'Group management' : role === 'professor' ? 'Teaching workspace' : role === 'admin' ? 'Administration' : 'My workspace'}</p>
      <NavigationLinks links={links} label="Main navigation" />
      {leadershipLinks.length > 0 && (
        <div className="sidebar-section">
          <p className="sidebar-role">{leadershipLabel || 'Leading'}</p>
          <NavigationLinks links={leadershipLinks} label="Leadership navigation" />
          {leadershipTools.length > 0 && (
            <>
              <p className="sidebar-context">Managing now: <strong>{leadershipContext}</strong></p>
              <NavigationLinks links={leadershipTools} label="Selected group tools" />
            </>
          )}
        </div>
      )}
      <NavLink to="/login" className="logout nav-link" onClick={handleLogout}>
        <span>↪</span> Log out
      </NavLink>
    </aside>
  );
}

import { NavLink } from 'react-router-dom';
import { useUser } from '../data/UserContext';
import './Sidebar.css';

function NavigationLinks({ links, label }) {
  return (
    <nav aria-label={label}>
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.end} onClick={link.onClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">{typeof link.icon === 'string' && link.icon.endsWith('.png') ? <img src={link.icon} alt="" /> : link.icon}</span>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Sidebar({ links, role, moreLinks = [], leadershipLinks = [], leadershipTools = [], leadershipLabel, leadershipContext }) {
  const { logout } = useUser();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-box">▦</span>
        <span>SYNORA.</span>
      </div>
      <p className="sidebar-role">{role === 'leader' ? 'Group management' : role === 'professor' ? 'Teaching workspace' : role === 'admin' ? 'Administration' : 'My workspace'}</p>
      <NavigationLinks links={links} label="Main navigation" />
      {moreLinks.length > 0 && (
        <details className="sidebar-more">
          <summary>More</summary>
          <NavigationLinks links={moreLinks} label="More navigation" />
        </details>
      )}
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

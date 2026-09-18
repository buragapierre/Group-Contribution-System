import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar({ links }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-box">▦</span>
        <span>CONTRITRACK.</span>
      </div>
      <nav>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <NavLink to="/login" className="logout nav-link">
        <span>↪</span> Log out
      </NavLink>
    </aside>
  );
}

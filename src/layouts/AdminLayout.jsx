import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const adminLinks = [
  { to: '/admin', icon: '▣', label: 'Dashboard' },
  { to: '/admin/users', icon: '☰', label: 'Users' },
  { to: '/admin/professor-verification', icon: '✓', label: 'Professor Verification' },
  { to: '/admin/settings', icon: '⚙', label: 'Settings' },
];

export default function AdminLayout() {
  return (
    <div className="app">
      <Sidebar links={adminLinks} role="admin" />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useUser } from '../data/UserContext';

const adminLinks = [
  { to: '/admin', icon: '▣', label: 'Dashboard', end: true },
  { to: '/admin/users', icon: '☰', label: 'Users' },
];

export default function AdminLayout() {
  const { currentUser, loading } = useUser();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" />;
  return <div className="app"><Sidebar links={adminLinks} role="admin" /><main className="content"><Outlet /></main></div>;
}

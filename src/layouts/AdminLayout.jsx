import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useUser } from '../data/UserContext';
import dashboardIcon from '../assets/dashboard.png';
import userIcon from '../assets/user.png';

const adminLinks = [
  { to: '/admin', icon: dashboardIcon, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: userIcon, label: 'Users' },
];

export default function AdminLayout() {
  const { currentUser, loading } = useUser();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.role === 'professor') return <Navigate to="/professor" />;
  if (currentUser.role === 'student') return <Navigate to="/student" />;
  if (currentUser.role !== 'admin') return <Navigate to="/login" />;
  return <div className="app"><Sidebar links={adminLinks} role="admin" /><main className="content"><Outlet /></main></div>;
}

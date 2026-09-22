import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useUser } from '../data/UserContext';
import groupIcon from '../assets/group.png';
import dashboardIcon from '../assets/dashboard.png';
import classesIcon from '../assets/classes.png';

const professorLinks = [
  { to: '/professor', icon: dashboardIcon, label: 'Dashboard', end: true },
  { to: '/professor/classes', icon: classesIcon, label: 'Classes' },
  { to: '/professor/groups', icon: groupIcon, label: 'Groups' },
  { to: '/professor/contribution', icon: '◉', label: 'Contribution' },
  { to: '/professor/reports', icon: '▥', label: 'Reports' },
];

export default function ProfessorLayout() {
  const { currentUser, loading } = useUser();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.role === 'admin') return <Navigate to="/admin" />;
  if (currentUser.role === 'student') return <Navigate to="/student" />;
  if (currentUser.role !== 'professor') return <Navigate to="/login" />;
  return <div className="app"><Sidebar links={professorLinks} role="professor" /><main className="content"><Outlet /></main></div>;
}

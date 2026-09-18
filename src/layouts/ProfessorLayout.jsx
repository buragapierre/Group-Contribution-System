import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useUser } from '../data/UserContext';

const professorLinks = [
  { to: '/professor', icon: '▣', label: 'Dashboard', end: true },
  { to: '/professor/classes', icon: '▤', label: 'Classes' },
  { to: '/professor/projects', icon: '▤', label: 'Projects' },
  { to: '/professor/groups', icon: '♧', label: 'Groups' },
  { to: '/professor/contribution', icon: '◉', label: 'Contribution' },
  { to: '/professor/reports', icon: '▥', label: 'Reports' },
];

export default function ProfessorLayout() {
  const { currentUser, loading } = useUser();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" />;
  return <div className="app"><Sidebar links={professorLinks} role="professor" /><main className="content"><Outlet /></main></div>;
}

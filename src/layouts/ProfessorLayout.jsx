import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const professorLinks = [
  { to: '/professor', icon: '▣', label: 'Dashboard' },
  { to: '/professor/projects', icon: '▤', label: 'Projects' },
  { to: '/professor/groups', icon: '♧', label: 'Groups' },
  { to: '/professor/contribution', icon: '◉', label: 'Contribution' },
  { to: '/professor/reports', icon: '▥', label: 'Reports' },
];

export default function ProfessorLayout() {
  return (
    <div className="app">
      <Sidebar links={professorLinks} role="professor" />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

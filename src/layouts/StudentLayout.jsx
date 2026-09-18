import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const studentLinks = [
  { to: '/student', icon: '▣', label: 'Dashboard' },
  { to: '/student/tasks', icon: '✓', label: 'My Tasks' },
  { to: '/student/activity', icon: '◎', label: 'Activity' },
  { to: '/student/contribution', icon: '◉', label: 'Contribution' },
  { to: '/student/peer-evaluation', icon: '♡', label: 'Peer Evaluation' },
];

const leaderLinks = [
  { to: '/leader', icon: '▣', label: 'Workspace' },
  { to: '/leader/tasks', icon: '✓', label: 'Tasks' },
  { to: '/leader/submissions', icon: '◎', label: 'Submissions' },
  { to: '/leader/members', icon: '◉', label: 'Members' },
  { to: '/student/contribution', icon: '📈', label: 'My Contribution' },
];

export default function StudentLayout() {
  const location = useLocation();
  const isLeader = location.pathname.startsWith('/leader');
  const links = isLeader ? leaderLinks : studentLinks;

  return (
    <div className="app">
      <Sidebar links={links} role={isLeader ? 'leader' : 'student'} />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

import { Outlet, useSearchParams, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useUser } from '../data/UserContext';

const studentLinks = [
  { to: '/student', icon: '▣', label: 'Dashboard', end: true },
  { to: '/student/classes', icon: '▦', label: 'My Classes' },
  { to: '/student/tasks', icon: '✓', label: 'My Tasks' },
  { to: '/student/activity', icon: '◷', label: 'Activity' },
  { to: '/student/peer-evaluation', icon: '☆', label: 'Peer Evaluation' },
  { to: '/student/profile', icon: '◎', label: 'My Profile' },
];

export default function StudentLayout() {
  const [searchParams] = useSearchParams();
  const { currentUser, loading, selectedLeaderGroupId } = useUser();

  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" />;

  const leaderGroups = currentUser?.leaderGroups || [];
  const requestedGroupId = Number(searchParams.get('group'));
  const activeGroupId = leaderGroups.some(g => g.id === requestedGroupId)
    ? requestedGroupId
    : selectedLeaderGroupId || leaderGroups[0]?.id;
  const activeGroup = leaderGroups.find(g => g.id === activeGroupId);

  const leaderLinks = [{
    to: `/leader?group=${activeGroupId || ''}`,
    icon: '♧',
    label: activeGroup ? activeGroup.name : 'My Group',
  }];

  const leaderTools = activeGroup ? [
    { to: `/leader?group=${activeGroupId}`, icon: '▣', label: 'Overview' },
    { to: `/leader/tasks?group=${activeGroupId}`, icon: '✓', label: 'Tasks' },
    { to: `/leader/submissions?group=${activeGroupId}`, icon: '◎', label: 'Submissions' },
    { to: `/leader/members?group=${activeGroupId}`, icon: '◉', label: 'Members' },
  ] : [];

  const leadershipContext = activeGroup
    ? `${activeGroup.projectName} · ${activeGroup.name}`
    : '';

  return (
    <div className="app">
      <Sidebar
        links={studentLinks}
        role="student"
        leadershipLinks={leaderLinks}
        leadershipTools={leaderTools}
        leadershipLabel="Group Leadership"
        leadershipContext={leadershipContext}
      />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

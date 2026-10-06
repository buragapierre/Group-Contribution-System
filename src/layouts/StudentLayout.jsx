import { Outlet, useSearchParams, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useUser } from '../data/UserContext';
import groupIcon from '../assets/group.png';
import memberIcon from '../assets/member.png';
import dashboardIcon from '../assets/dashboard.png';
import classesIcon from '../assets/classes.png';
import taskIcon from '../assets/task.png';
import evaluationIcon from '../assets/evaluation.png';
import userIcon from '../assets/user.png';
import submissionIcon from '../assets/submission.png';
import activityIcon from '../assets/activity.png';

const studentLinks = [
  { to: '/student', icon: dashboardIcon, label: 'Dashboard', end: true },
  { to: '/student/classes', icon: classesIcon, label: 'My Classes' },
  { to: '/student/group', icon: groupIcon, label: 'My Group' },
  { to: '/student/tasks', icon: taskIcon, label: 'My Tasks' },
];

const studentMoreLinks = [
  { to: '/student/activity', icon: activityIcon, label: 'Activity' },
  { to: '/student/peer-evaluation', icon: evaluationIcon, label: 'Peer Evaluation' },
  { to: '/student/profile', icon: userIcon, label: 'My Profile' },
];

export default function StudentLayout() {
  const [searchParams] = useSearchParams();
  const { currentUser, loading, selectedLeaderGroupId } = useUser();
  const location = useLocation();

  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.role === 'admin') return <Navigate to="/admin" />;
  if (currentUser.role === 'professor') return <Navigate to="/professor" />;
  if (currentUser.role !== 'student') return <Navigate to="/login" />;

  const profileIncomplete = !currentUser.course || !currentUser.year_level || !currentUser.section;
  const onCompletionPage = location.pathname === '/student/complete-profile';

  if (profileIncomplete && !onCompletionPage) {
    return <Navigate to="/student/complete-profile" />;
  }

  const leaderGroups = currentUser?.leaderGroups || [];
  const requestedGroupId = Number(searchParams.get('group'));
  const activeGroupId = leaderGroups.some(g => g.id === requestedGroupId)
    ? requestedGroupId
    : selectedLeaderGroupId || leaderGroups[0]?.id;
  const activeGroup = leaderGroups.find(g => g.id === activeGroupId);

  const leaderLinks = [{
    to: `/leader?group=${activeGroupId || ''}`,
    icon: groupIcon,
    label: activeGroup ? activeGroup.name : 'My Group',
  }];

  const leaderTools = activeGroup ? [
    { to: `/leader?group=${activeGroupId}`, icon: dashboardIcon, label: 'Overview' },
    { to: `/leader/tasks?group=${activeGroupId}`, icon: taskIcon, label: 'Tasks' },
    { to: `/leader/submissions?group=${activeGroupId}`, icon: submissionIcon, label: 'Submissions' },
    { to: `/leader/members?group=${activeGroupId}`, icon: memberIcon, label: 'Members' },
  ] : [];

  const leadershipContext = activeGroup
    ? `${activeGroup.projectName} · ${activeGroup.name}`
    : '';

  return (
    <div className="app">
      <Sidebar
        links={studentLinks}
        moreLinks={studentMoreLinks}
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

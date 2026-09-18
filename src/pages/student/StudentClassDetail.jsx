import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useUser } from '../../data/UserContext';
import { fetchStudentClasses } from '../../services/classes';
import { fetchProjectsByClass } from '../../services/projects';
import { fetchGroupsByClass, fetchGroupMemberIds } from '../../services/groups';
import { fetchTasksByClass } from '../../services/tasks';
import { fetchContributionsByClass } from '../../services/contributions';
import './StudentClassDetail.css';

export default function StudentClassDetail() {
  const { id } = useParams();
  const { currentUser } = useUser();
  const userId = currentUser?.id;

  const [cls, setCls] = useState(null);
  const [classProjects, setClassProjects] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [myGroup, setMyGroup] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [myContribution, setMyContribution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !id) return;

    fetchStudentClasses(currentUser.id).then(allClasses => {
      const foundCls = allClasses.find(c => c.id === parseInt(id));
      if (!foundCls) {
        setCls(null);
        setLoading(false);
        return;
      }
      setCls(foundCls);

      return Promise.all([
        fetchProjectsByClass(foundCls.id),
        fetchGroupsByClass(foundCls.id),
        fetchTasksByClass(foundCls.id),
        fetchContributionsByClass(foundCls.id)
      ]);
    }).then(([projectsResult, groupsResult, tasksResult, contributionsResult]) => {
      setClassProjects(projectsResult || []);
      setClassGroups(groupsResult || []);
      setMyTasks((tasksResult || []).filter(t => t.assigned_to === userId));

      const userContrib = (contributionsResult || []).find(c => c.user_id === userId);
      setMyContribution(userContrib || null);

      return Promise.all(
        (groupsResult || []).map(g =>
          fetchGroupMemberIds(g.id).then(memberIds => ({ group: g, memberIds }))
        )
      );
    }).then(groupsData => {
      const found = (groupsData || []).find(({ memberIds }) => memberIds.includes(userId));
      setMyGroup(found ? found.group : null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser, id, userId]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  if (!cls) {
    return (
      <div>
        <Navbar title="Class Not Found" subtitle="" user={{ name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' }} />
        <p>Class not found.</p>
      </div>
    );
  }

  const completedTasks = myTasks.filter(t => t.status === 'verified').length;
  const dueSoon = myTasks
    .filter(t => t.status !== 'verified')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

  return (
    <div>
      <Navbar title={cls.course} subtitle={`${cls.section || 'General Class'} · ${cls.semester} · ${cls.academic_year}`} user={user} />

      <Link to="/student/classes" className="back-link">← Back to My Classes</Link>

      <div className="scd-class-info">
        <div className="scd-info-row">
          <span className="scd-label">Professor</span>
          <span className="scd-value">{cls.professor_name}</span>
        </div>
        <div className="scd-info-row">
          <span className="scd-label">Section</span>
          <span className="scd-value">{cls.section || 'General Class'}</span>
        </div>
        <div className="scd-info-row">
          <span className="scd-label">Semester</span>
          <span className="scd-value">{cls.semester} · {cls.academic_year}</span>
        </div>
      </div>

      {myGroup && (
        <div className="scd-my-group">
          <div className="scd-mg-header">
            <span className="group-icon">♧</span>
            <div>
              <h3>{myGroup.name}</h3>
              <p>{myGroup.project_name} · {myGroup.leader_name === currentUser?.name ? 'You are the Leader' : `Leader: ${myGroup.leader_name}`}</p>
            </div>
            <div className="scd-mg-progress">
              <div className="progress-bar" style={{ width: 80 }}><div className="progress-fill" style={{ width: `${myGroup.overall_progress}%` }}></div></div>
              <span>{myGroup.overall_progress}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="scd-stats">
        <div className="stat-card"><div className="stat-icon blue">✓</div><div><strong>{completedTasks}/{myTasks.length}</strong><span>My Tasks Done</span></div></div>
        <div className="stat-card"><div className="stat-icon yellow">⏳</div><div><strong>{dueSoon.length}</strong><span>Due Soon</span></div></div>
        <div className="stat-card"><div className="stat-icon green">◉</div><div><strong>{myContribution?.contribution_percent || 0}%</strong><span>My Contribution</span></div></div>
        <div className="stat-card"><div className="stat-icon purple">▤</div><div><strong>{classProjects.length}</strong><span>Projects</span></div></div>
      </div>

      <div className="scd-grid">
        <div className="scd-main">
          <div className="section-title">
            <h2>My Tasks in This Class</h2>
          </div>
          <div className="scd-tasks-list">
            {myTasks.map(t => (
              <Link to={`/student/tasks/${t.id}`} key={t.id} className="scd-task-row">
                <div className={`task-color ${t.color}`} style={{ width: 3 }}></div>
                <div className="scd-task-info">
                  <div className="scd-task-header">
                    <h4>{t.title}</h4>
                    <span className={`status-pill status-${t.status.replace('_', '-')}`}>{t.status.replace('_', ' ')}</span>
                  </div>
                  <p>Due: {new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  <div className="scd-task-progress">
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${t.progress}%` }}></div></div>
                    <span>{t.progress}%</span>
                  </div>
                </div>
              </Link>
            ))}
            {myTasks.length === 0 && (
              <p className="scd-empty">No tasks assigned to you in this class yet.</p>
            )}
          </div>

          <div className="section-title" style={{ marginTop: 28 }}>
            <h2>Projects</h2>
          </div>
          <div className="scd-projects-list">
            {classProjects.map(p => (
              <div key={p.id} className="scd-project-row">
                <div className={`project-color ${p.color}`} style={{ width: 40, height: 40, borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 16 }}>
                  {p.icon}
                </div>
                <div className="scd-project-info">
                  <h4>{p.title}</h4>
                  <p>{p.groups?.length || 0} groups · Due: {new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="scd-project-progress">
                  <div className="progress-bar" style={{ width: 60 }}><div className="progress-fill" style={{ width: `${p.overall_progress}%` }}></div></div>
                  <span>{p.overall_progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="scd-sidebar">
          <div className="scd-sidebar-card">
            <h3>Groups in This Class</h3>
            {classGroups.map(g => (
              <div key={g.id} className="scd-group-row">
                <div className="group-icon-sm">♧</div>
                <div>
                  <h4>{g.name}</h4>
                  <p>{g.member_count || g.members?.length || 0} members · Leader: {g.leader_name}</p>
                </div>
                <span className="scd-group-progress">{g.overall_progress}%</span>
              </div>
            ))}
          </div>

          {myContribution && (
            <div className="scd-sidebar-card">
              <h3>My Contribution</h3>
              <div className="scd-contrib-ring">
                <svg viewBox="0 0 36 36">
                  <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="ring-fill" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    strokeDasharray={`${myContribution.contribution_percent}, 100`} />
                </svg>
                <span>{myContribution.contribution_percent}%</span>
              </div>
              <div className="scd-contrib-details">
                <p><strong>{myContribution.tasks_completed}</strong> / {myContribution.tasks_assigned} tasks completed</p>
                <p><strong>{myContribution.on_time_completions}</strong> on-time submissions</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

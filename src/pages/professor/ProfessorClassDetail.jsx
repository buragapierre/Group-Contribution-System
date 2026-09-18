import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { fetchClassById, fetchClassStudentIds } from '../../services/classes';
import { fetchProjectsByClass } from '../../services/projects';
import { fetchGroupsByClass } from '../../services/groups';
import { fetchTasksByClass } from '../../services/tasks';
import { fetchContributionsByClass } from '../../services/contributions';
import { useUser } from '../../data/UserContext';
import './ProfessorClassDetail.css';

export default function ProfessorClassDetail() {
  const { id } = useParams();
  const { currentUser } = useUser();
  const [cls, setCls] = useState(null);
  const [classProjects, setClassProjects] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [classTasks, setClassTasks] = useState([]);
  const [classContributions, setClassContributions] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetchClassById(id),
      fetchProjectsByClass(id),
      fetchGroupsByClass(id),
      fetchTasksByClass(id),
      fetchContributionsByClass(id),
      fetchClassStudentIds(id),
    ]).then(([classData, projects, groups, tasks, contributions, studentIds]) => {
      setCls(classData);
      setClassProjects(projects);
      setClassGroups(groups);
      setClassTasks(tasks);
      setClassContributions(contributions);
      setStudentCount(studentIds.length);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  if (!cls) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Class not found.</div>;

  const pendingTasks = classTasks.filter(t => t.status === 'submitted' || t.status === 'under_review').length;
  const completedTasks = classTasks.filter(t => t.status === 'verified').length;
  const avgProgress = classProjects.length > 0
    ? Math.round(classProjects.reduce((sum, p) => sum + (p.overall_progress || 0), 0) / classProjects.length)
    : 0;

  const copyJoinCode = () => {
    if (cls?.join_code) {
      navigator.clipboard.writeText(cls.join_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <Navbar title={cls.course} subtitle={`${cls.section || 'General Class'} · ${cls.semester} · ${cls.academic_year}`} user={user} />

      <Link to="/professor/classes" className="back-link">← Back to Classes</Link>

      <div className="class-detail-stats">
        <div className="stat-card"><div className="stat-icon blue">▤</div><div><strong>{classProjects.length}</strong><span>Projects</span></div></div>
        <div className="stat-card"><div className="stat-icon purple">♧</div><div><strong>{classGroups.length}</strong><span>Groups</span></div></div>
        <div className="stat-card"><div className="stat-icon green">🎓</div><div><strong>{studentCount}</strong><span>Students</span></div></div>
        <div className="stat-card"><div className="stat-icon yellow">⏳</div><div><strong>{pendingTasks}</strong><span>Pending</span></div></div>
      </div>

      <div className="class-detail-grid">
        <div className="cd-main">
          <div className="section-title">
            <h2>Projects in this Class</h2>
            <Link to={`/professor/classes/${cls.id}/projects/create`}>
              <Button variant="primary">+ Create Project</Button>
            </Link>
          </div>

          <div className="cd-projects-list">
            {classProjects.map(p => (
              <Link to={`/professor/projects/${p.id}`} key={p.id} className="cd-project-row">
                <div className={`project-color ${p.color}`} style={{ width: 44, height: 44, borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 18 }}>
                  {p.icon}
                </div>
                <div className="cd-project-info">
                  <h4>{p.title}</h4>
                  <p>{p.groups?.length || 0} groups · Due: {new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="cd-project-progress">
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.overall_progress}%` }}></div></div>
                  <span>{p.overall_progress}%</span>
                </div>
              </Link>
            ))}
            {classProjects.length === 0 && (
              <div className="cd-empty">No projects yet. Create one to get started.</div>
            )}
          </div>

          <div className="section-title" style={{ marginTop: 32 }}>
            <h2>Groups</h2>
            <Link to={`/professor/classes/${cls.id}/groups/create`}>
              <Button variant="primary">+ Create Group</Button>
            </Link>
          </div>
          <div className="cd-groups-list">
            {classGroups.map(g => (
              <div key={g.id} className="cd-group-row">
                <div className="group-icon-sm">♧</div>
                <div>
                  <h4>{g.name}</h4>
                  <p>{g.project_name} · Leader: {g.leader_name} · {g.member_count || 0} members</p>
                </div>
                <div className="cd-group-progress">
                  <div className="progress-bar" style={{ width: 80 }}><div className="progress-fill" style={{ width: `${g.progress}%` }}></div></div>
                  <span>{g.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cd-sidebar">
          <div className="cd-sidebar-card join-code-card">
            <h3>Class Code</h3>
            <p className="join-code-subtitle">Share this code with students to join</p>
            <div className="join-code-display" onClick={copyJoinCode} title="Click to copy">
              <span className="join-code">{cls.join_code || '------'}</span>
              <span className="join-code-copy">{copied ? 'Copied!' : 'Copy'}</span>
            </div>
          </div>

          <div className="cd-sidebar-card">
            <h3>Class Overview</h3>
            <div className="cd-overview-item">
              <span className="label">Course</span>
              <span className="value">{cls.course}</span>
            </div>
            <div className="cd-overview-item">
              <span className="label">Section</span>
              <span className="value">{cls.section || 'General Class'}</span>
            </div>
            <div className="cd-overview-item">
              <span className="label">Semester</span>
              <span className="value">{cls.semester}</span>
            </div>
            <div className="cd-overview-item">
              <span className="label">Academic Year</span>
              <span className="value">{cls.academic_year}</span>
            </div>
            <div className="cd-overview-item">
              <span className="label">Avg. Progress</span>
              <span className="value">{avgProgress}%</span>
            </div>
            <div className="cd-overview-item">
              <span className="label">Completed Tasks</span>
              <span className="value">{completedTasks} / {classTasks.length}</span>
            </div>
          </div>

          <div className="cd-sidebar-card">
            <h3>Student Contributions</h3>
            {classContributions.map(c => (
              <div key={c.user_id} className="cd-contribution-row">
                <div className="cell-avatar student" style={{ width: 28, height: 28, fontSize: 10 }}>{c.avatar}</div>
                <div className="cd-contrib-info">
                  <span className="cd-contrib-name">{c.user_name}</span>
                  <div className="cd-contrib-bar">
                    <div className="progress-bar" style={{ width: 60 }}><div className="progress-fill" style={{ width: `${c.contribution_percent}%`, background: c.contribution_percent >= 80 ? 'var(--success)' : c.contribution_percent >= 50 ? 'var(--warning)' : 'var(--danger)' }}></div></div>
                    <span style={{ color: c.contribution_percent >= 80 ? 'var(--success)' : c.contribution_percent >= 50 ? 'var(--warning)' : 'var(--danger)' }}>{c.contribution_percent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

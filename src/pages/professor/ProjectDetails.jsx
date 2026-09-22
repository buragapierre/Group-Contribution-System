import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { fetchProjectById } from '../../services/projects';
import { fetchGroupsByProject, fetchGroupMembers } from '../../services/groups';
import { fetchTasksByGroup } from '../../services/tasks';
import { fetchClassById } from '../../services/classes';
import { useUser } from '../../data/UserContext';
import './ProjectDetails.css';

export default function ProjectDetails() {
  const { id } = useParams();
  const { currentUser } = useUser();
  const [project, setProject] = useState(null);
  const [projectGroups, setProjectGroups] = useState([]);
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };

  useEffect(() => {
    if (!id) return;
    fetchProjectById(id).then(async (proj) => {
      setProject(proj);
      const groups = await fetchGroupsByProject(proj.id);

      const groupsData = await Promise.all(groups.map(async (g) => {
        const [tasks, members] = await Promise.all([
          fetchTasksByGroup(g.id),
          fetchGroupMembers(g.id),
        ]);
        const completed = tasks.filter(t => t.status === 'verified').length;
        return {
          ...g,
          taskCount: tasks.length,
          completedTasks: completed,
          progress: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
          memberCount: members.length,
        };
      }));

      setProjectGroups(groupsData);
      if (proj.class_id) {
        const classData = await fetchClassById(proj.class_id);
        setCls(classData);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  if (!project) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Project not found.</div>;

  return (
    <div>
      <Navbar title={project.title} subtitle={project.description} user={user} />

      <div className="project-detail-nav">
        <Link to={cls ? `/professor/classes/${cls.id}` : "/professor/classes"} className="back-link">
          ← Back to {cls ? cls.subject : 'Classes'}
        </Link>
        {cls && (
          <div className="project-class-badge">
            <span className="class-badge-label">Class:</span>
            <span className="class-badge-name">{cls.subject}</span>
            <span className="class-badge-meta">{cls.section || 'General'} · {cls.semester}</span>
          </div>
        )}
      </div>

      <div className="project-detail-grid">
        <div className="pd-main">
          <div className="pd-info-card">
            <div className="pd-info-header">
              <div className={`project-color ${project.color}`} style={{ width: 48, height: 48, borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 22 }}>
                {project.icon}
              </div>
              <div>
                <h2>{project.title}</h2>
                <p>{project.professor_name} · Due: {new Date(project.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="pd-progress">
              <label>Overall Progress</label>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: `${project.overall_progress}%` }}></div>
              </div>
              <span>{project.overall_progress}%</span>
            </div>
            <div className="pd-desc">
              <h4>Description</h4>
              <p>{project.description}</p>
              <h4>Requirements</h4>
              <p>{project.requirements}</p>
            </div>
          </div>

          <div className="pd-section">
            <h3>Group Progress ({projectGroups.length})</h3>
            {projectGroups.length === 0 ? (
              <div className="cd-empty">No groups assigned to this project yet.</div>
            ) : (
              <div className="pd-group-progress-list">
                {projectGroups.map(g => (
                  <div key={g.id} className="pd-group-progress-card">
                    <div className="pd-gp-header">
                      <div className="pd-gp-info">
                        <h4>{g.name}</h4>
                        <p>Leader: {g.leader_name} · {g.memberCount} member{g.memberCount !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="pd-gp-stat">
                        <strong>{g.completedTasks}/{g.taskCount}</strong>
                        <span>tasks</span>
                      </div>
                    </div>
                    <div className="pd-gp-progress">
                      <div className="progress-bar" style={{ height: 6 }}>
                        <div className="progress-fill" style={{
                          width: `${g.progress}%`,
                          background: g.progress >= 80 ? 'var(--success)' : g.progress >= 50 ? 'var(--warning)' : 'var(--primary)'
                        }}></div>
                      </div>
                      <span className="pd-gp-pct">{g.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pd-sidebar">
          <div className="pd-sidebar-card">
            <h3>Project Info</h3>
            <div className="pd-overview-item">
              <span className="label">Total Groups</span>
              <span className="value">{projectGroups.length}</span>
            </div>
            <div className="pd-overview-item">
              <span className="label">Total Tasks</span>
              <span className="value">{projectGroups.reduce((sum, g) => sum + g.taskCount, 0)}</span>
            </div>
            <div className="pd-overview-item">
              <span className="label">Completed</span>
              <span className="value">{projectGroups.reduce((sum, g) => sum + g.completedTasks, 0)}</span>
            </div>
            <div className="pd-overview-item">
              <span className="label">Deadline</span>
              <span className="value">{new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

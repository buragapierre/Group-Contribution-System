import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { fetchProjectById } from '../../services/projects';
import { fetchGroupsByProject } from '../../services/groups';
import { fetchTasksByProject } from '../../services/tasks';
import { fetchClassById } from '../../services/classes';
import { fetchAllProfiles } from '../../services/profiles';
import { useUser } from '../../data/UserContext';
import './ProjectDetails.css';

export default function ProjectDetails() {
  const { id } = useParams();
  const { currentUser } = useUser();
  const [project, setProject] = useState(null);
  const [projectGroups, setProjectGroups] = useState([]);
  const [projectTasks, setProjectTasks] = useState([]);
  const [cls, setCls] = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };

  useEffect(() => {
    if (!id) return;
    fetchProjectById(id).then(async (proj) => {
      setProject(proj);
      const [groups, tasks, profiles] = await Promise.all([
        fetchGroupsByProject(proj.id),
        fetchTasksByProject(proj.id),
        fetchAllProfiles(),
      ]);
      setProjectGroups(groups);
      setProjectTasks(tasks);
      setAllProfiles(profiles);
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
        <Link to={cls ? `/professor/classes/${cls.id}` : "/professor/projects"} className="back-link">
          ← Back to {cls ? cls.course : 'Projects'}
        </Link>
        {cls && (
          <div className="project-class-badge">
            <span className="class-badge-label">Class:</span>
            <span className="class-badge-name">{cls.course}</span>
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
            <h3>Tasks ({projectTasks.length})</h3>
            <div className="pd-task-list">
              {projectTasks.map(t => {
                const assignee = allProfiles.find(u => u.id === t.assigned_to);
                return (
                  <div key={t.id} className="pd-task-row">
                    <div className={`task-color ${t.color}`} style={{ width: 3 }}></div>
                    <div className="pd-task-info">
                      <h4>{t.title}</h4>
                      <p>Assigned to: {assignee?.name || 'Unassigned'} · Due: {new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <span className={`status-pill status-${t.status.replace('_', '-')}`}>{t.status.replace('_', ' ')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pd-sidebar">
          <h3>Groups ({projectGroups.length})</h3>
          {projectGroups.map(g => (
            <div key={g.id} className="pd-group-card">
              <h4>{g.name}</h4>
              <p>Leader: {g.leader_name}</p>
              <div className="progress-bar" style={{ height: 4, marginTop: 8 }}>
                <div className="progress-fill" style={{ width: `${g.progress}%` }}></div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--primary)' }}>{g.progress}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

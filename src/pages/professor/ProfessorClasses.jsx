import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { fetchClasses } from '../../services/classes';
import { fetchProjectsByClass } from '../../services/projects';
import { fetchGroupsByClass, fetchGroupMemberIds } from '../../services/groups';
import { useUser } from '../../data/UserContext';
import './ProfessorClasses.css';

export default function ProfessorClasses() {
  const { currentUser } = useUser();
  const [professorClasses, setProfessorClasses] = useState([]);
  const [classStatsMap, setClassStatsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const user = { name: currentUser?.name || 'Professor', avatar: currentUser?.avatar || 'PR', role: 'Professor' };

  useEffect(() => {
    if (!currentUser) return;
    fetchClasses(currentUser.id).then(async (classes) => {
      setProfessorClasses(classes);
      const statsMap = {};
      for (const cls of classes) {
        const [projects, groups] = await Promise.all([
          fetchProjectsByClass(cls.id),
          fetchGroupsByClass(cls.id),
        ]);
        let studentCount = 0;
        for (const g of groups) {
          const ids = await fetchGroupMemberIds(g.id);
          studentCount += ids.length;
        }
        const avgProgress = projects.length > 0
          ? Math.round(projects.reduce((sum, p) => sum + (p.overall_progress || 0), 0) / projects.length)
          : 0;
        statsMap[cls.id] = {
          projectCount: projects.length,
          groupCount: groups.length,
          studentCount,
          avgProgress,
        };
      }
      setClassStatsMap(statsMap);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <Navbar title="My Classes" subtitle="Manage your classes, projects, and groups." user={user} />

      <div className="section-title" style={{ marginBottom: 20 }}>
        <h2>All Classes</h2>
        <Link to="/professor/classes/create">
          <Button variant="primary">+ Create Class</Button>
        </Link>
      </div>

      <div className="classes-grid">
        {professorClasses.map(cls => {
          const stats = classStatsMap[cls.id] || { projectCount: 0, groupCount: 0, studentCount: 0, avgProgress: 0 };
          return (
            <Link to={`/professor/classes/${cls.id}`} key={cls.id} className="class-card-link">
              <div className={`class-color ${cls.color}`}>
                <span className="class-icon">▣</span>
              </div>
              <div className="class-info">
                <h3>{cls.course}</h3>
                <p className="class-meta">
                  {cls.section || 'General Class'} · {cls.semester} · {cls.academic_year}
                </p>
                <div className="class-stats-row">
                  <span><strong>{stats.projectCount}</strong> Projects</span>
                  <span><strong>{stats.groupCount}</strong> Groups</span>
                  <span><strong>{stats.studentCount}</strong> Students</span>
                </div>
                <div className="class-progress-bar">
                  <div className="class-progress-fill" style={{ width: `${stats.avgProgress}%` }}></div>
                </div>
                <span className="class-progress-label">{stats.avgProgress}% avg progress</span>
              </div>
            </Link>
          );
        })}
        {professorClasses.length === 0 && (
          <div className="empty-state">
            <p>No classes yet. Create your first class to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

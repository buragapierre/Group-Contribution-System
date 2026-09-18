import './ProjectCard.css';

export default function ProjectCard({ project, onClick }) {
  return (
    <div className="project-card" onClick={() => onClick?.(project)}>
      <div className={`project-color ${project.color}`}>
        <span className="project-symbol">{project.icon}</span>
        <small>PROJECT #{String(project.id).padStart(2, '0')}</small>
        <b>{project.overallProgress}%</b>
      </div>
      <div className="project-info">
        <h3>{project.title}</h3>
        <p>{project.professorName} · {project.groups?.length || 0} groups</p>
        <div className="meta">
          <span>Due: {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="project-progress-bar">
          <div className="project-progress-fill" style={{ width: `${project.overallProgress}%` }}></div>
        </div>
      </div>
    </div>
  );
}

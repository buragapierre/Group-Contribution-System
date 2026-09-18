import './TaskCard.css';
import StatusBadge from './StatusBadge';

export default function TaskCard({ task, onClick }) {
  return (
    <div className="task-card" onClick={() => onClick?.(task)}>
      <div className={`task-color ${task.color || 'lavender'}`}></div>
      <div className="task-content">
        <div className="task-header">
          <h4>{task.title}</h4>
          <StatusBadge status={task.status} />
        </div>
        <p className="task-desc">{task.description}</p>
        <div className="task-meta">
          <span>Due: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span>Priority: {task.priority}</span>
        </div>
        <div className="task-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${task.progress}%` }}></div>
          </div>
          <span className="progress-text">{task.progress}%</span>
        </div>
      </div>
    </div>
  );
}

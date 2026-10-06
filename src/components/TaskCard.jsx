import './TaskCard.css';
import StatusBadge from './StatusBadge';
import { taskTiming } from '../lib/lateness';

export default function TaskCard({ task, onClick }) {
  const timing = taskTiming(task.deadline, task.status);
  return (
    <div className={`task-card${timing.show && timing.overdue ? ' task-card-overdue' : ''}`} onClick={() => onClick?.(task)}>
      <div className={`task-color ${task.color || 'lavender'}`}></div>
      <div className="task-content">
        <div className="task-header">
          <h4>{task.title}</h4>
          <div className="task-badges">
            {timing.show && (
              <span className={`task-timing ${timing.overdue ? 'timing-overdue' : 'timing-soon'}`}>
                {timing.label}
              </span>
            )}
            <StatusBadge status={task.status} />
          </div>
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

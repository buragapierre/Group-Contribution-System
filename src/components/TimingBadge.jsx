import { submissionTiming } from '../lib/lateness';
import './StatusBadge.css';

export default function TimingBadge({ submittedAt, deadline }) {
  const timing = submissionTiming(submittedAt, deadline);
  return (
    <span className={`status-badge ${timing.late ? 'status-rejected' : 'status-verified'}`}>
      {timing.late ? `Late${timing.daysLate > 1 ? ` · ${timing.daysLate}d` : ''}` : 'On time'}
    </span>
  );
}

import './StatusBadge.css';

const statusConfig = {
  assigned: { label: 'Assigned', className: 'status-assigned' },
  in_progress: { label: 'In Progress', className: 'status-in-progress' },
  submitted: { label: 'Submitted', className: 'status-submitted' },
  under_review: { label: 'Under Review', className: 'status-under-review' },
  verified: { label: 'Verified', className: 'status-verified' },
  needs_revision: { label: 'Needs Revision', className: 'status-needs-revision' },
  rejected: { label: 'Rejected', className: 'status-rejected' },
  active: { label: 'Active', className: 'status-active' },
  inactive: { label: 'Inactive', className: 'status-inactive' },
  pending: { label: 'Pending', className: 'status-pending' },
  completed: { label: 'Completed', className: 'status-verified' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: '' };
  return <span className={`status-badge ${config.className}`}>{config.label}</span>;
}

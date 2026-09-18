import './ProgressBar.css';

export default function ProgressBar({ value, label, showPercent = true, size = 'md' }) {
  return (
    <div className={`progress-container progress-${size}`}>
      {label && <span className="progress-label">{label}</span>}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${value}%` }}></div>
      </div>
      {showPercent && <span className="progress-percent">{value}%</span>}
    </div>
  );
}

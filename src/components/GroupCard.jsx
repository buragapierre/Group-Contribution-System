import './GroupCard.css';

export default function GroupCard({ group, onClick }) {
  return (
    <div className="group-card" onClick={() => onClick?.(group)}>
      <div className="group-header">
        <div className="group-icon">♧</div>
        <div>
          <h3>{group.name}</h3>
          <p>{group.projectName}</p>
        </div>
      </div>
      <div className="group-members">
        <div className="member-avatars">
          {group.members?.slice(0, 3).map((_, i) => (
            <div key={i} className="mini-avatar" style={{ background: ['#dce9ef', '#e8dff5', '#d1fae5'][i] }}>
              {String(i + 1).padStart(2, '0')}
            </div>
          ))}
          {group.members?.length > 3 && (
            <div className="mini-avatar more">+{group.members.length - 3}</div>
          )}
        </div>
        <span className="member-count">{group.members?.length} members</span>
      </div>
      <div className="group-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${group.progress}%` }}></div>
        </div>
        <span>{group.progress}%</span>
      </div>
      <div className="group-leader">
        <span>Leader: {group.leaderName}</span>
      </div>
    </div>
  );
}

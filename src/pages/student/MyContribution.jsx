import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useUser } from '../../data/UserContext';
import { fetchUserContributions } from '../../services/contributions';
import './MyContribution.css';

export default function MyContribution() {
  const { currentUser } = useUser();
  const isLeader = useLocation().pathname.startsWith('/leader');
  const [myContrib, setMyContrib] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    fetchUserContributions(currentUser.id).then(result => {
      setMyContrib(result.length > 0 ? result[0] : null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  const user = { name: currentUser?.name || (isLeader ? 'Leader' : 'Student'), avatar: currentUser?.avatar || (isLeader ? 'LD' : 'ST'), role: isLeader ? 'Group Leader' : 'Student' };

  return (
    <div>
      <Navbar title="My Contribution" subtitle="Your task completion and contribution statistics." user={user} />

      <div className="contribution-page">
        <div className="cp-overview">
          <div className="cp-ring-section">
            <div className="cp-ring">
              <svg viewBox="0 0 36 36">
                <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="ring-fill" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  strokeDasharray={`${myContrib?.contribution_percent || 0}, 100`} />
              </svg>
              <span>{myContrib?.contribution_percent || 0}%</span>
            </div>
            <p>Overall Contribution</p>
          </div>
          <div className="cp-stats-grid">
            <div className="cp-stat"><strong>{myContrib?.tasks_assigned || 0}</strong><span>Tasks Assigned</span></div>
            <div className="cp-stat"><strong>{myContrib?.tasks_completed || 0}</strong><span>Tasks Completed</span></div>
            <div className="cp-stat"><strong>{myContrib?.on_time_completions || 0}</strong><span>On-Time Submissions</span></div>
            <div className="cp-stat"><strong>{Math.round((myContrib?.on_time_completions / myContrib?.tasks_completed) * 100) || 0}%</strong><span>On-Time Rate</span></div>
          </div>
        </div>

        <div className="cp-formula">
          <h3>Contribution Formula</h3>
          <p>Your contribution is calculated based on: <strong>Task Completion</strong> + <strong>On-Time Completion</strong> + <strong>Recorded Participation</strong></p>
          <div className="cp-formula-breakdown">
            <div className="formula-item"><span className="formula-label">Task Completion</span><span className="formula-value">50%</span></div>
            <div className="formula-item"><span className="formula-label">On-Time Completion</span><span className="formula-value">30%</span></div>
            <div className="formula-item"><span className="formula-label">Participation</span><span className="formula-value">20%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

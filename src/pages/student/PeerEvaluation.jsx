import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { useUser } from '../../data/UserContext';
import { fetchGroupMembers } from '../../services/groups';
import './PeerEvaluation.css';

export default function PeerEvaluation() {
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [peerOptions, setPeerOptions] = useState([]);
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(!!currentUser?.group?.id);
  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

  useEffect(() => {
    if (!currentUser?.group?.id) return;
    fetchGroupMembers(currentUser.group.id).then(members => {
      const peers = members.filter(m => m.user_id !== currentUser.id);
      setPeerOptions(peers);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  const handleRating = (peerId, value) => {
    setRatings({ ...ratings, [peerId]: value });
  };

  const handleComment = (peerId, value) => {
    setComments({ ...comments, [peerId]: value });
  };

  const handleSubmit = () => {
    alert('Peer evaluation submitted!');
  };

  return (
    <div>
      <Navbar title="Peer Evaluation" subtitle="Rate your group members' contributions." user={user} />

      {peerOptions.length === 0 ? (
        <div className="peer-empty">
          <p>You are not in a group yet, or have no group members to evaluate.</p>
        </div>
      ) : (
        <div className="peer-eval-grid">
          {peerOptions.map(p => (
            <div key={p.id} className="peer-card">
              <div className="peer-header">
                <div className="cell-avatar student">{p.avatar_color || p.avatar}</div>
                <h3>{p.user_name || p.name}</h3>
              </div>
              <div className="peer-rating">
                <label>Contribution Rating</label>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      className={`star ${ratings[p.id] >= s ? 'active' : ''}`}
                      onClick={() => handleRating(p.id, s)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="peer-comment">
                <label>Comments</label>
                <textarea
                  rows={3}
                  placeholder="Share your feedback..."
                  value={comments[p.id] || ''}
                  onChange={(e) => handleComment(p.id, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <Button variant="primary" onClick={handleSubmit} disabled={peerOptions.length === 0}>Submit Evaluation</Button>
      </div>
    </div>
  );
}

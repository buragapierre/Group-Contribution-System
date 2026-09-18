import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { useUser } from '../../data/UserContext';
import './PeerEvaluation.css';

const peerOptions = [
  { id: 5, name: 'Maria Santos', avatar: 'MS' },
  { id: 6, name: 'Pedro Cruz', avatar: 'PC' },
  { id: 7, name: 'Ana Lopez', avatar: 'AL' },
];

export default function PeerEvaluation() {
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const { currentUser } = useUser();
  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

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

      <div className="peer-eval-grid">
        {peerOptions.map(p => (
          <div key={p.id} className="peer-card">
            <div className="peer-header">
              <div className="cell-avatar student">{p.avatar}</div>
              <h3>{p.name}</h3>
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

      <div style={{ marginTop: 20 }}>
        <Button variant="primary" onClick={handleSubmit}>Submit Evaluation</Button>
      </div>
    </div>
  );
}

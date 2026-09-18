import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { useUser } from '../../data/UserContext';
import { joinClassByCode } from '../../services/classes';
import './StudentMyClasses.css';

export default function StudentMyClasses() {
  const { currentUser } = useUser();
  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };
  const enrolledClasses = currentUser?.classes || [];

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoining(true);
    setJoinError('');
    setJoinSuccess('');
    try {
      const cls = await joinClassByCode(joinCode, currentUser.id);
      setJoinSuccess(`Joined ${cls.course} successfully!`);
      setJoinCode('');
      setTimeout(() => {
        setShowJoinModal(false);
        setJoinSuccess('');
        window.location.reload();
      }, 1500);
    } catch (err) {
      setJoinError(err.message || 'Failed to join class.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div>
      <Navbar title="My Classes" subtitle="All subjects you are enrolled in this semester." user={user} />

      <div className="my-classes-header">
        <Button variant="primary" onClick={() => setShowJoinModal(true)}>+ Join Class</Button>
      </div>

      <div className="my-classes-grid">
        {enrolledClasses.map(cls => (
          <Link to={`/student/classes/${cls.id}`} key={cls.id} className="my-class-card">
            <div className={`mcc-color ${cls.color || 'blue'}`}></div>
            <div className="mcc-content">
              <h3>{cls.course}</h3>
              <p className="mcc-professor">Prof. {cls.professor_name}</p>
              <div className="mcc-meta">
                <span>{cls.section || 'General Class'}</span>
                <span>{cls.semester}</span>
                <span>{cls.academic_year}</span>
              </div>
            </div>
          </Link>
        ))}
        {enrolledClasses.length === 0 && (
          <div className="empty-state">
            You are not enrolled in any classes yet. Click "Join Class" to get started.
          </div>
        )}
      </div>

      <Modal isOpen={showJoinModal} onClose={() => { setShowJoinModal(false); setJoinError(''); setJoinSuccess(''); }} title="Join a Class">
        <form onSubmit={handleJoin} className="join-class-form">
          <p className="join-class-desc">Enter the 6-character code shared by your professor.</p>
          {joinError && <div className="auth-error">{joinError}</div>}
          {joinSuccess && <div className="join-success">{joinSuccess}</div>}
          <div className="form-group">
            <label>Class Code</label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={6}
              required
              className="join-code-input"
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setShowJoinModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={joining}>
              {joining ? 'Joining...' : 'Join Class'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

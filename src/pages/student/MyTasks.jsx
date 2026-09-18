import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import TaskCard from '../../components/TaskCard';
import { useUser } from '../../data/UserContext';
import { fetchUserTasks } from '../../services/tasks';
import './MyTasks.css';

export default function MyTasks() {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    fetchUserTasks(currentUser.id).then(result => {
      setMyTasks(result);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

  return (
    <div>
      <Navbar title="My Tasks" subtitle="View and manage your assigned tasks." user={user} />

      <div className="my-tasks-grid">
        {myTasks.map(t => (
          <TaskCard key={t.id} task={t} onClick={() => navigate(`/student/tasks/${t.id}`)} />
        ))}
      </div>
    </div>
  );
}

import Navbar from '../../components/Navbar';
import TaskCard from '../../components/TaskCard';
import { tasks } from '../../data/mockData';
import { useUser } from '../../data/UserContext';
import './MyTasks.css';

export default function MyTasks() {
  const { currentUser } = useUser();
  const userId = currentUser?.id || 4;
  const myTasks = tasks.filter(t => t.assignedTo === userId);
  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

  return (
    <div>
      <Navbar title="My Tasks" subtitle="View and manage your assigned tasks." user={user} />

      <div className="my-tasks-grid">
        {myTasks.map(t => (
          <TaskCard key={t.id} task={t} onClick={() => {}} />
        ))}
      </div>
    </div>
  );
}

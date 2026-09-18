import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useUser } from '../../data/UserContext';
import './StudentMyClasses.css';

export default function StudentMyClasses() {
  const { currentUser } = useUser();
  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };
  const enrolledClasses = currentUser?.classes || [];

  return (
    <div>
      <Navbar title="My Classes" subtitle="All subjects you are enrolled in this semester." user={user} />

      <div className="my-classes-grid">
        {enrolledClasses.map(cls => (
          <Link to={`/student/classes/${cls.id}`} key={cls.id} className="my-class-card">
            <div className={`mcc-color ${cls.color}`}></div>
            <div className="mcc-content">
              <h3>{cls.course}</h3>
              <p className="mcc-professor">Prof. {cls.professorName}</p>
              <div className="mcc-meta">
                <span>{cls.section || 'General Class'}</span>
                <span>{cls.semester}</span>
                <span>{cls.academicYear}</span>
              </div>
            </div>
          </Link>
        ))}
        {enrolledClasses.length === 0 && (
          <div className="empty-state">You are not enrolled in any classes yet.</div>
        )}
      </div>
    </div>
  );
}

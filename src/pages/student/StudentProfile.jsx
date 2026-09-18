import Navbar from '../../components/Navbar';
import { useUser } from '../../data/UserContext';
import './StudentProfile.css';

export default function StudentProfile() {
  const { currentUser } = useUser();
  const profile = currentUser?.profile;
  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

  return (
    <div>
      <Navbar title="My Profile" subtitle="Your student information and academic details." user={user} />

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">{currentUser?.avatar}</div>
            <div className="profile-name-section">
              <h2>{currentUser?.name}</h2>
              <p className="profile-role">Student</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-field">
              <label>Student ID</label>
              <span>{profile?.studentId || currentUser?.idNumber || '-'}</span>
            </div>
            <div className="profile-field">
              <label>Email</label>
              <span>{currentUser?.email}</span>
            </div>
            <div className="profile-field">
              <label>ID Number</label>
              <span>{currentUser?.idNumber}</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3>Academic Information</h3>
          <div className="profile-details">
            <div className="profile-field">
              <label>Course</label>
              <span>{profile?.course || '-'}</span>
            </div>
            <div className="profile-field">
              <label>Year Level</label>
              <span>{profile?.yearLevel || '-'}</span>
            </div>
            <div className="profile-field">
              <label>Section</label>
              <span>{profile?.section || '-'}</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3>Enrolled Classes</h3>
          <p className="profile-note">{currentUser?.classes?.length || 0} class(es) enrolled this semester</p>
        </div>
      </div>
    </div>
  );
}

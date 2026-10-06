import Navbar from '../../components/Navbar';
import { useUser } from '../../data/UserContext';
import './StudentProfile.css';

export default function StudentProfile() {
  const { currentUser } = useUser();
  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

  return (
    <div>
      <Navbar title="My Profile" subtitle="Your student information and academic details" user={user} />

      <div className="profile-container">
        <div className="profile-card full-width">
          <div className="profile-avatar-section">
            <div className="profile-avatar">{currentUser?.avatar}</div>
            <div className="profile-name-section">
              <h2>{currentUser?.name}</h2>
              <p className="profile-role">Student</p>
            </div>
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-value">{currentUser?.classes?.length || 0}</span>
              <span className="profile-stat-label">Classes</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{currentUser?.group ? '1' : '0'}</span>
              <span className="profile-stat-label">Group</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{currentUser?.isLeader ? 'Yes' : 'No'}</span>
              <span className="profile-stat-label">Leader</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3>Personal Information</h3>
          <div className="profile-details">
            <div className="profile-field">
              <label>ID Number</label>
              <span>{currentUser?.id_number || '-'}</span>
            </div>
            <div className="profile-field">
              <label>Email</label>
              <span>{currentUser?.email}</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3>Academic Information</h3>
          <div className="profile-details">
            <div className="profile-field">
              <label>Course</label>
              <span>{currentUser?.course || '-'}</span>
            </div>
            <div className="profile-field">
              <label>Year Level</label>
              <span>{currentUser?.year_level || '-'}</span>
            </div>
            <div className="profile-field">
              <label>Section</label>
              <span>{currentUser?.section || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

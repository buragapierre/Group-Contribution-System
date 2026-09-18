import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import { useUser } from '../../data/UserContext';
import './SubmitTask.css';

export default function SubmitTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState([]);
  const user = { name: currentUser?.name || 'Student', avatar: currentUser?.avatar || 'ST', role: 'Student' };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/student/tasks/${id}`);
  };

  return (
    <div>
      <Navbar title="Submit Task" subtitle="Upload your work and submit for review." user={user} />

      <div className="submit-task-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title</label>
            <input type="text" value="Chapter 1 Documentation" disabled />
          </div>
          <div className="form-group">
            <label>Requirements</label>
            <textarea value="Follow university thesis format. Include all sections." disabled rows={3} />
          </div>
          <div className="form-group">
            <label>Attach Files</label>
            <div className="file-upload">
              <input type="file" multiple onChange={handleFileChange} id="file-input" />
              <label htmlFor="file-input" className="file-label">
                📎 Choose Files
              </label>
              {files.length > 0 && (
                <div className="file-list">
                  {files.map((f, i) => <span key={i} className="file-tag">📄 {f.name}</span>)}
                </div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>Comment</label>
            <textarea
              rows={4}
              placeholder="Add any comments about your submission..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="primary">Submit Task</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

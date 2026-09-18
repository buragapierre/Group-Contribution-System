import { Link } from 'react-router-dom';
import Button from '../../components/Button';

export default function NotFound() {
  return (
    <div className="auth-layout">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="logo">
          <span className="logo-box">▦</span>
          <span>CONTRITRACK.</span>
        </div>
        <h1 style={{ fontSize: 48, margin: '20px 0 8px' }}>404</h1>
        <p className="subtitle">Page not found. The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/login" style={{ marginTop: 20, display: 'inline-block' }}>
          <Button variant="primary">Back to Login</Button>
        </Link>
      </div>
    </div>
  );
}

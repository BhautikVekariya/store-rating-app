import { Link, useNavigate } from 'react-router-dom';
import { clearSession, getUser } from '../api';

export default function Navbar() {
  const user = getUser();
  const navigate = useNavigate();

  const logout = () => {
    clearSession();
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Store Rating</Link>
      {user && (
        <div className="nav-right">
          <span>{user.name} ({user.role})</span>
          {user.role !== 'admin' && <Link to="/password">Change Password</Link>}
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </nav>
  );
}

import { Navigate, Route, Routes } from 'react-router-dom';
import { getUser } from './api';
import Navbar from './components/Navbar';
import { Login, Signup } from './pages/Auth';
import Password from './pages/Password';
import Admin from './pages/Admin';
import Stores from './pages/Stores';
import Owner from './pages/Owner';

const home = { admin: '/admin', user: '/stores', owner: '/owner' };

function Protected({ roles, children }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={home[user.role]} replace />;
  return children;
}

export default function App() {
  const user = getUser();
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to={user ? home[user.role] : '/login'} replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<Protected roles={['admin']}><Admin /></Protected>} />
          <Route path="/stores" element={<Protected roles={['user']}><Stores /></Protected>} />
          <Route path="/owner" element={<Protected roles={['owner']}><Owner /></Protected>} />
          <Route
            path="/password"
            element={<Protected roles={['admin', 'user', 'owner']}><Password /></Protected>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

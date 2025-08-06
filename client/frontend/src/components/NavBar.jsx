import { Link, useNavigate } from 'react-router-dom';

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/feed">Home</Link>
      <Link to="/profile/me">My Profile</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default NavBar;
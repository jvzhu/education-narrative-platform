import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FaBook, FaUser, FaSignOutAlt, FaPlus } from 'react-icons/fa';

function Header() {
  const { token, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600 hover:text-blue-700">
          <FaBook /> æè²åäº
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
            é¦é¡µ
          </Link>
          {token ? (
            <>
              <Link to="/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <FaPlus /> åå¸æäº
              </Link>
              <div className="flex items-center gap-4">
                <Link to={`/profile/${user?.id}`} className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                  <FaUser /> {user?.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 flex items-center gap-2"
                >
                  <FaSignOutAlt /> éåº
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600">
                ç»å½
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                æ³¨å
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;

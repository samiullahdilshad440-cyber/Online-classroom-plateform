import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  // Role-based navigation links
  const navLinks = {
    student: [
      { path: '/student/dashboard', label: 'Dashboard' },
      { path: '/student/catalog', label: 'Catalog' },
      { path: '/student/leaderboard', label: 'Leaderboard' },
      { path: '/student/certificates', label: 'Certificates' },
    ],
    teacher: [
      { path: '/teacher/dashboard', label: 'Dashboard' },
      { path: '/teacher/courses/new', label: 'Build Course' },
    ],
    admin: [
      { path: '/admin/dashboard', label: 'Command Center' },
      { path: '/admin/users', label: 'Users' },
      { path: '/admin/coupons', label: 'Coupons' },
    ],
  };

  const links = navLinks[user.role] || [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-bg/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to={`/${user.role}/dashboard`} className="flex items-center gap-2">
          <span className="font-display text-xl text-accent tracking-tight">CLASSROOM</span>
          <span className="font-mono text-xs text-text-muted uppercase tracking-widest">
            // {user.role}
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="font-mono text-xs text-text-muted uppercase tracking-wider hover:text-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/messages"
            className="font-mono text-xs text-text-muted uppercase tracking-wider hover:text-accent transition-colors"
          >
            Messages
          </Link>
        </div>

        {/* User Info + Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="font-mono text-sm text-text">{user.name}</p>
            <p className="font-mono text-xs text-text-muted uppercase">{user.email}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-red-500/50 text-red-500 font-mono text-xs rounded hover:bg-red-500 hover:text-bg transition-all uppercase tracking-wider"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
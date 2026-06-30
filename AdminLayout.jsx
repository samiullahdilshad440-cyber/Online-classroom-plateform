import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/dashboard', label: 'Command Center', icon: '📊' },
    { path: '/admin/departments', label: 'Departments', icon: '🏛️' },
    { path: '/admin/batches', label: 'Batches', icon: '📅' },
    { path: '/admin/sections', label: 'Sections', icon: '👥' },
    { path: '/admin/users', label: 'Users', icon: '👤' },
    { path: '/admin/coupons', label: 'Coupons', icon: '🎟️' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-bg p-6 flex flex-col sticky top-0 h-screen">
        <div className="mb-8">
          <h1 className="font-display text-2xl text-accent tracking-tight">ADMIN</h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest mt-1">
            // Pit Wall
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm transition-all ${
                  isActive
                    ? 'bg-accent text-bg'
                    : 'text-text-muted hover:text-text hover:bg-surface'
                }`
              }
            >
              <span>{item.icon}</span>
              <span className="uppercase tracking-wider">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="pt-6 border-t border-border space-y-3">
          <div className="text-text-muted font-mono text-xs">
            <p className="text-text">{user?.name}</p>
            <p className="uppercase tracking-widest">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 border border-border text-text-muted font-mono text-xs rounded hover:border-red-500 hover:text-red-500 transition-all uppercase tracking-wider"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative">
        <div className="absolute top-4 right-4 z-50">
          <NotificationBell />
        </div>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
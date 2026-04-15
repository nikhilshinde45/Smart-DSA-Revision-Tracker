import { Moon, Sun, LogOut, Menu, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import useAuthStore from '../../store/authStore';
import useProblemStore from '../../store/problemStore';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { todayRevisions } = useProblemStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg border-b border-light-border dark:border-dark-border">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Page title area */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Revision notification */}
          <button
            onClick={() => navigate('/')}
            className="relative p-2.5 rounded-xl hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors"
          >
            <Bell size={18} />
            {todayRevisions.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white gradient-bg rounded-full animate-pulse-glow">
                {todayRevisions.length}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-light-elevated dark:hover:bg-dark-elevated transition-all duration-300"
          >
            {isDark ? (
              <Sun size={18} className="text-amber-400" />
            ) : (
              <Moon size={18} />
            )}
          </button>

          {/* User */}
          <div className="flex items-center gap-3 ml-2 pl-3 border-l border-light-border dark:border-dark-border">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold leading-tight">{user?.name}</p>
              <p className="text-xs text-light-muted dark:text-dark-muted">
                {user?.email}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-light-muted dark:text-dark-muted hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-500 transition-all duration-200"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

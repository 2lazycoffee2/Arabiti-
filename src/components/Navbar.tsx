import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  Languages, 
  Book, 
  BookOpen, 
  Brain, 
  Type, 
  Sun, 
  Moon, 
  User
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { theme, setTheme } = useAppContext();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  const navItems = [
    { path: '/lessons', icon: Book, label: 'Cours' },
    { path: '/stories', icon: BookOpen, label: 'Histoires' },
    { path: '/vocabulary', icon: Brain, label: 'Vocab' },
    { path: '/alphabet', icon: Type, label: 'Alphabet' },
  ];

  return (
    <>
      <header className="mobile-header">
        <Link to="/" className="nav-logo">
          <Languages className="logo-icon" />
          <span className="logo-text">Arabiti</span>
        </Link>
        <button 
          className="theme-toggle-mobile" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="nav-logo desktop-only">
            <Languages className="logo-icon" />
            <span className="logo-text">Arabiti</span>
          </Link>
          
          <div className="nav-links">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className={`nav-link ${isActive(item.path)}`}>
                <item.icon size={22} />
                <span>{item.label}</span>
              </Link>
            ))}
            <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
              <User size={22} />
              <span>Profil</span>
            </Link>
          </div>

          <div className="nav-actions desktop-only">
            <button 
              className="action-btn" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              <span>{theme === 'dark' ? 'Clair' : 'Sombre'}</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;

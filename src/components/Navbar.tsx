import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, User, Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';


export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    checkUser();
    // Re-check on every navigation since login/logout involve navigation
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
    setMobileOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/apply', label: 'Apply' },
    { to: '/track', label: 'Track Status' },
    { to: '/claim', label: 'Claim' },
  ];

  const showPortalLink = !!user;

  return (
    <nav className="fixed w-full z-40 border-b border-border glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Dimataling Seal" className="h-10 w-10 object-contain" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-emerald-950">DAAIPS</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Municipality of Dimataling</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${location.pathname === link.to ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            {showPortalLink && (
              <Link
                to={user.role === 'farmer' ? "/dashboard" : "/admin"}
                className={`text-sm font-medium transition-colors ${location.pathname === '/admin' || location.pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
              >
                Portal
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <span className="text-xs font-medium text-muted-foreground">
                  Hi, <span className="text-foreground">{user.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <User size={20} />
                Portal Login
              </Link>
            )}
            <Link
              to="/apply"
              className="bg-primary hover:bg-emerald-800 text-primary-foreground text-xs font-medium py-2 px-4 rounded-full transition-all shadow-primary-glow"
            >
              Get Insured
            </Link>
            <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                to={user.role === 'farmer' ? "/dashboard" : "/admin"}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-accent transition-colors"
              >
                Portal
              </Link>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut size={18} />
                Logout ({user.name})
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Portal Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

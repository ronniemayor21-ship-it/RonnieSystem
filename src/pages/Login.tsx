import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { findFarmerByIdentifier, loginFarmer } from '@/lib/store';
import logo from '@/assets/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'farmer' | 'staff'>('farmer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (activeTab === 'staff') {
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('currentUser', JSON.stringify({ username: 'admin', role: 'admin', name: 'Admin' }));
        toast.success('Welcome, Admin');
        navigate('/admin');
      } else if (username === 'staff' && password === 'staff123') {
        localStorage.setItem('currentUser', JSON.stringify({ username: 'staff', role: 'staff', name: 'Staff' }));
        toast.success('Welcome, Staff');
        navigate('/admin');
      } else {
        toast.error('Invalid Staff/Admin credentials');
      }
    } else {
      // Farmer login using backend with fallback
      try {
        const farmer = await loginFarmer(username, password);
        localStorage.setItem('currentUser', JSON.stringify({ username: farmer.username, role: 'farmer', name: farmer.name }));
        toast.success(`Welcome, ${farmer.name}`);
        navigate('/dashboard');
      } catch (error: any) {
        // Fallback to client-side auth if backend login fails (e.g. backend not restarted yet)
        const fallbackFarmer = findFarmerByIdentifier(username);
        
        if (fallbackFarmer && (!fallbackFarmer.password || fallbackFarmer.password === password)) {
           localStorage.setItem('currentUser', JSON.stringify({ username: fallbackFarmer.username, role: 'farmer', name: fallbackFarmer.name }));
           toast.success(`Welcome, ${fallbackFarmer.name}`);
           navigate('/dashboard');
           return;
        }

        // Default to showing the server error or a generic one
        if (error.message.includes('fetch') || error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
          toast.error('Cannot connect to backend server. Please run "npm run dev:all" instead of "npm run dev".');
        } else {
          toast.error(error.message || 'Login failed');
        }
      }
    }
  };

  return (
    <div className="animate-fade-in min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-card/40 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-950/5 border border-white/20 p-8 sm:p-10 relative overflow-hidden group">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500" />

          <div className="relative text-center">
            <div className="mb-6 transform transition-transform duration-500 hover:scale-105">
              <img src={logo} alt="Dimataling Seal" className="w-20 h-20 mx-auto object-contain drop-shadow-xl" />
            </div>

            <h2 className="text-2xl font-bold text-emerald-950 tracking-tight mb-2">Portal Access</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Sign in to manage your <span className="text-primary font-medium">Agricultural Insurance</span>
            </p>

            {/* Role Tabs */}
            <div className="grid grid-cols-2 p-1 bg-secondary/50 rounded-2xl mb-8">
              <button
                onClick={() => setActiveTab('farmer')}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'farmer'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-900/40 hover:text-emerald-900'
                  }`}
              >
                <User size={14} />
                FARMER
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'staff'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-900/40 hover:text-emerald-900'
                  }`}
              >
                <ShieldCheck size={14} />
                STAFF / ADMIN 
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-1">
                  Username
                </label>
                <div className="relative group/input">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/50 border border-border focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm transition-all outline-none"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-1">Password</label>
                <div className="relative group/input">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/50 border border-border focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-semibold py-4 rounded-2xl transition-all shadow-xl shadow-emerald-900/20 active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
              >
                Sign In
                <ArrowRight size={18} className="opacity-70" />
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-emerald-100 flex flex-col gap-4">
              {activeTab === 'farmer' && (
                <Link to="/register" className="text-sm text-primary font-semibold hover:text-emerald-800 transition-colors flex items-center justify-center gap-1">
                  Don't have an account? <span className="underline decoration-2 underline-offset-4">Register here</span>
                </Link>
              )}
              <Link to="/" className="text-xs text-muted-foreground hover:text-emerald-950 transition-colors">
                Return to Public Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CustomArrowRight = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

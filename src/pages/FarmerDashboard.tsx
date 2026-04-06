import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    LayoutGrid,
    Clock,
    CheckCircle,
    Plus,
    ClipboardList,
    LogOut,
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    Search,
    Loader2,
    AlertTriangle,
    WifiOff,
    Image as ImageIcon,
    X
} from 'lucide-react';
import { useApplications } from '@/hooks/useApplications';
import { useClaims } from '@/hooks/useClaims';
import { useFarmers } from '@/hooks/useFarmers';
import StatusBadge from '@/components/StatusBadge';
import { toast } from 'sonner';

export default function FarmerDashboard() {
    const navigate = useNavigate();
    const applications = useApplications();
    const claims = useClaims();
    const farmers = useFarmers();
    const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'claims'>('overview');
    const [loadTimeout, setLoadTimeout] = useState(false);

    const storedUser = localStorage.getItem('currentUser');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    // Find the current farmer from the reactive farmers list
    const farmer = farmers.find(f => f.username === parsedUser?.username);

    useEffect(() => {
        if (!storedUser) {
            toast.error('Please login to access your portal');
            navigate('/login');
            return;
        }
        if (parsedUser?.role !== 'farmer') {
            toast.error('Unauthorized access');
            navigate('/');
            return;
        }
        // Set a 6-second timeout before showing connection error
        const timer = setTimeout(() => setLoadTimeout(true), 6000);
        return () => clearTimeout(timer);
    }, [storedUser, parsedUser, navigate]);

    if (!farmer) {
        if (loadTimeout) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center px-4">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                        <WifiOff size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-emerald-950">Cannot connect to server</h2>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        The backend server is not running. Please start the server and refresh the page.
                    </p>
                    <code className="text-xs bg-secondary px-4 py-2 rounded-lg font-mono text-emerald-900">
                        cd server &amp;&amp; node index.js
                    </code>
                    <button onClick={() => window.location.reload()} className="text-sm text-primary font-bold hover:underline">
                        Refresh page
                    </button>
                </div>
            );
        }
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (farmer.status === 'Rejected') {
        return (
            <div className="animate-fade-in w-full px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-2xl mx-auto bg-card rounded-3xl border border-destructive/10 p-8 sm:p-12 text-center shadow-xl shadow-destructive/5">
                    <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <ShieldCheck size={40} className="opacity-50" />
                    </div>
                    <h1 className="text-3xl font-bold text-destructive mb-4 tracking-tight">Registration Rejected</h1>
                    <p className="text-muted-foreground mb-8 text-lg">
                        We're sorry, <span className="font-bold">{farmer.name}</span>. Your registration request has been rejected.
                    </p>
                    <p className="text-sm text-muted-foreground mb-8 text-center italic">
                        Please contact the Municipal Agriculture Office for more information regarding your application.
                    </p>
                    <button
                        onClick={() => {
                            localStorage.removeItem('currentUser');
                            navigate('/');
                        }}
                        className="flex items-center gap-2 mx-auto text-sm font-bold text-emerald-900 hover:underline"
                    >
                        <ArrowRight size={16} />
                        Return to Homepage
                    </button>
                </div>
            </div>
        );
    }

    const myApplications = applications.filter(a => a.farmerId === farmer.id);
    const myClaims = claims.filter(c => c.farmerId === farmer.id || c.farmerName === farmer.name);

    const approvedApps = myApplications.filter(a => a.status === 'Approved').length;
    const pendingApps = myApplications.filter(a => a.status === 'Pending').length;

    return (
        <div className="animate-fade-in w-full px-4 sm:px-6 lg:px-8">
            {/* Pending banner — shown at top of full dashboard */}
            {farmer.status === 'Pending' && (
                <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                    <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-amber-800">Account Pending Verification</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                            Your account is awaiting admin approval. Some features may be restricted until verification is complete.
                        </p>
                    </div>
                </div>
            )}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-card rounded-2xl border border-border p-5 sticky top-24 shadow-sm">
                        <div className="mb-8 px-2">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Navigation</p>
                            <h2 className="text-sm font-bold text-emerald-950">Farmer Portal</h2>
                        </div>
                        <nav className="space-y-1.5">
                            <SidebarLink
                                icon={<LayoutGrid size={18} />}
                                label="Overview"
                                active={activeTab === 'overview'}
                                onClick={() => setActiveTab('overview')}
                            />
                            <SidebarLink
                                icon={<Clock size={18} />}
                                label="Applications"
                                active={activeTab === 'applications'}
                                onClick={() => setActiveTab('applications')}
                            />
                            <SidebarLink
                                icon={<ClipboardList size={18} />}
                                label="My Claims"
                                active={activeTab === 'claims'}
                                onClick={() => setActiveTab('claims')}
                            />
                            <div className="pt-4 mt-4 border-t border-border">
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('currentUser');
                                        toast.success('Logged out successfully');
                                        navigate('/');
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-destructive hover:bg-destructive/10 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-emerald-950 tracking-tight">Welcome back, {farmer.name}</h1>
                            <p className="text-sm text-muted-foreground">Manage your livestock insurance and claims here.</p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                to="/apply"
                                className="flex items-center gap-2 bg-emerald-900 hover:bg-emerald-950 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/10 active:scale-[0.98]"
                            >
                                <Plus size={18} />
                                New Application
                            </Link>
                        </div>
                    </header>

                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <StatCard
                                    label="Total Applications"
                                    value={myApplications.length}
                                    icon={<ClipboardList size={20} />}
                                    iconBg="bg-emerald-50 text-emerald-600"
                                />
                                <StatCard
                                    label="Approved"
                                    value={approvedApps}
                                    icon={<CheckCircle size={20} />}
                                    iconBg="bg-blue-50 text-blue-600"
                                    valueColor="text-emerald-700"
                                />
                                <StatCard
                                    label="Pending"
                                    value={pendingApps}
                                    icon={<Clock size={20} />}
                                    iconBg="bg-amber-50 text-amber-600"
                                    valueColor="text-amber-600"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Recent Applications */}
                                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">Recent Applications</h3>
                                        <button onClick={() => setActiveTab('applications')} className="text-xs font-bold text-primary hover:underline">View All</button>
                                    </div>
                                    <div className="space-y-4">
                                        {myApplications.slice(0, 3).map(app => (
                                            <div key={app.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-transparent hover:border-emerald-100 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-emerald-600 shadow-sm font-bold">
                                                        {app.type[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-emerald-950">{app.type}</p>
                                                        <p className="text-[10px] font-mono text-muted-foreground uppercase">{app.id}</p>
                                                    </div>
                                                </div>
                                                <StatusBadge status={app.status} />
                                            </div>
                                        ))}
                                        {myApplications.length === 0 && (
                                            <div className="text-center py-10">
                                                <p className="text-sm text-muted-foreground italic">No applications found.</p>
                                                <Link to="/apply" className="text-xs text-primary font-bold hover:underline mt-2 inline-block">Start your first application</Link>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions / Tips */}
                                <div className="space-y-6">
                                    <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden group">
                                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                                        <ShieldCheck className="mb-4 opacity-80" size={32} />
                                        <h3 className="text-lg font-bold mb-2">Need to file a claim?</h3>
                                        <p className="text-sm text-emerald-50 mb-6 opacity-80">If your insured livestock has been affected, you can easily file a claim through our online portal.</p>
                                        <Link to="/claim" className="inline-flex items-center gap-2 bg-white text-emerald-900 px-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-emerald-50 active:scale-95">
                                            File a Claim
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>

                                    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                                        <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider mb-4">Tracking</h3>
                                        <p className="text-xs text-muted-foreground mb-4">Quickly check the status of any application using your reference number.</p>
                                        <Link
                                            to="/track"
                                            className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border hover:border-emerald-200 transition-all text-sm font-semibold text-emerald-900"
                                        >
                                            Track Application
                                            <Search size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'applications' && (
                        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-fade-in">
                            <div className="px-6 py-5 border-b border-border flex justify-between items-center">
                                <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">My Applications ({myApplications.length})</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-secondary/50">
                                        <tr>
                                            {['Ref ID', 'Type', 'Date', 'Status'].map(h => (
                                                <th key={h} className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {myApplications.map((app) => (
                                            <tr key={app.id} className="hover:bg-secondary/30 transition-colors">
                                                <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{app.id}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-emerald-950">{app.type}</td>
                                                <td className="px-6 py-4 text-xs text-muted-foreground">{app.date}</td>
                                                <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
                                            </tr>
                                        ))}
                                        {myApplications.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground italic">
                                                    You haven't submitted any applications yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'claims' && (
                        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-fade-in">
                            <div className="px-6 py-5 border-b border-border flex justify-between items-center">
                                <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">My Claims ({myClaims.length})</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-secondary/50">
                                        <tr>
                                            {['Claim ID', 'App ID', 'Date', 'Status'].map(h => (
                                                <th key={h} className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {myClaims.map((claim) => (
                                            <tr key={claim.id} className="hover:bg-secondary/30 transition-colors">
                                                <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{claim.id}</td>
                                                <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{claim.applicationId}</td>
                                                <td className="px-6 py-4 text-xs text-muted-foreground">{claim.date}</td>
                                                <td className="px-6 py-4"><StatusBadge status={claim.status} /></td>
                                            </tr>
                                        ))}
                                        {myClaims.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground italic">
                                                    No claims submitted yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 bg-emerald-50/50 border-t border-border">
                                <Link
                                    to="/claim"
                                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-emerald-200 text-emerald-900 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-all active:scale-[0.99]"
                                >
                                    <Plus size={18} />
                                    Submit a New Claim
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SidebarLink({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${active
                ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20'
                : 'text-emerald-950/60 hover:text-emerald-950 hover:bg-secondary'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

function StatCard({ label, value, icon, iconBg, valueColor }: { label: string; value: number; icon: React.ReactNode; iconBg: string; valueColor?: string }) {
    return (
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
                    <h3 className={`text-2xl font-bold mt-1 tracking-tight ${valueColor || 'text-emerald-950'}`}>{value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${iconBg} shadow-sm`}>{icon}</div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600/60">
                <TrendingUp size={12} />
                <span>LIFETIME ACTIVITY</span>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { CheckCircle, Clock, XCircle, Search, ChevronRight } from 'lucide-react';
import { findApplication } from '@/lib/store';
import type { Application } from '@/lib/store';
import { useFarmers } from '@/hooks/useFarmers';
import { useApplications } from '@/hooks/useApplications';
import StatusBadge from '@/components/StatusBadge';
import { toast } from 'sonner';

export default function Track() {
  const [refInput, setRefInput] = useState('');
  const [result, setResult] = useState<Application | null>(null);
  const [searched, setSearched] = useState(false);

  const farmers = useFarmers();
  const applications = useApplications();

  // Derive logged-in farmer reactively
  const storedUser = localStorage.getItem('currentUser');
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const user = farmers.find(f => f.username === parsedUser?.username) ?? null;
  const myApps = user ? applications.filter(a => a.farmerId === user.id) : [];


  const handleTrack = () => {
    if (!refInput.trim()) {
      toast.error('Please enter a Reference Number');
      return;
    }
    const found = findApplication(refInput.trim());
    setSearched(true);
    if (found) {
      setResult(found);
    } else {
      setResult(null);
      toast.error('Application not found');
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-emerald-950 tracking-tight">Track Application</h2>
        <p className="text-sm text-muted-foreground mt-2">Monitor the progress of your insurance requests.</p>
      </div>

      {user && myApps.length > 0 && !searched && (
        <div className="space-y-6 mb-12 animate-fade-in">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-900/60">My Applications</h3>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">{myApps.length} Total</span>
          </div>
          <div className="grid gap-3">
            {myApps.map(app => (
              <button
                key={app.id}
                onClick={() => { setResult(app); setSearched(true); }}
                className="group w-full flex items-center justify-between p-5 bg-card/60 backdrop-blur-sm border border-border hover:border-primary/50 rounded-2xl transition-all shadow-sm hover:shadow-md text-left active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${app.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                    app.status === 'Rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                    {app.status === 'Approved' ? <CheckCircle size={20} /> :
                      app.status === 'Rejected' ? <XCircle size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-950">{app.type}</p>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{app.id} • {app.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-muted-foreground font-medium">Or search by Reference #</span></div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-xl shadow-emerald-950/5 rounded-2xl border border-border p-2 flex gap-2 group focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300">
        <div className="flex items-center pl-3 text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={refInput}
          onChange={e => setRefInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleTrack()}
          placeholder="Enter Ref # (e.g. DAA-8821)"
          className="flex-1 px-2 py-3 bg-transparent text-sm focus:outline-none text-card-foreground placeholder:text-muted-foreground font-medium"
        />
        <button
          onClick={handleTrack}
          className="bg-emerald-900 hover:bg-emerald-950 text-white px-8 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/10 active:scale-95"
        >
          Track
        </button>
      </div>

      {result && searched && (
        <div className="mt-6 bg-card rounded-2xl border border-border p-6 shadow-sm animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Application Status</p>
              <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                <CheckCircle size={20} />
                <StatusBadge status={result.status} />
              </h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Ref: <span className="font-mono text-foreground">{result.id}</span></p>
              <p className="text-xs text-muted-foreground mt-1">Date: {result.date}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Farmer</p>
              <p className="text-sm font-medium text-card-foreground">{result.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Asset</p>
              <p className="text-sm font-medium text-card-foreground">{result.type}</p>
            </div>
          </div>
          {result.status === 'Approved' && (
            <div className="mt-4 bg-accent text-accent-foreground text-xs p-3 rounded-lg">
              Your application has been verified. Please visit the Municipal Agriculture Office on Monday for final signing.
            </div>
          )}
          {result.status === 'Pending' && (
            <div className="mt-4 bg-warning/10 text-warning-foreground text-xs p-3 rounded-lg">
              Your application is currently being reviewed. Please check back later.
            </div>
          )}
          {result.status === 'Rejected' && (
            <div className="mt-4 bg-destructive/10 text-destructive text-xs p-3 rounded-lg">
              Your application was not approved. Please visit the Municipal Agriculture Office for details.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

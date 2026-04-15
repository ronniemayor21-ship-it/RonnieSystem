import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Bell, Database, ShieldCheck } from 'lucide-react';
import logo from '@/assets/logo.png';
export default function Home() {
  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="grid lg:grid-cols-2 gap-12 items-center py-16 relative overflow-hidden">

        <div className="space-y-8 relative">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Dimataling Seal" className="h-20 w-20 object-contain drop-shadow-xl transform transition-transform hover:scale-110 duration-500" />
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest leading-none">
                <ShieldCheck size={12} />
                Official LGU Portal
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter ml-1">Municipality of Dimataling</p>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-emerald-950 tracking-tight leading-[1.1]">
              Dimataling Agriculture Animals Insurance Processing System
            </h1>
            <p className="text-lg text-emerald-900/60 font-medium max-w-md leading-relaxed border-l-4 border-primary/20 pl-4">
              Secure Your Future
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/apply"
              className="flex items-center gap-2 bg-primary hover:bg-emerald-800 text-primary-foreground px-6 py-3 rounded-xl font-medium shadow-primary-glow transition-all transform hover:-translate-y-0.5"
            >
              Start Application
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/track"
              className="flex items-center gap-2 bg-card border border-border hover:border-primary/30 text-foreground px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Check Status
            </Link>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="relative hidden lg:block">
          <img src={logo} alt="Municipality of Dimataling Seal" className="rounded-full shadow-2xl border-4 border-white object-contain w-full max-w-sm mx-auto bg-white/80" />
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mt-12 border-t border-border pt-12">
        <FeatureCard
          icon={<FileText size={24} />}
          iconBg="bg-accent text-accent-foreground"
          title="Paperless Submission"
          desc="Upload required documents and photos directly through our secure portal without visiting the office."
        />
        <FeatureCard
          icon={<Bell size={24} />}
          iconBg="bg-blue-50 text-blue-600"
          title="Real-time Updates"
          desc="Track your application status via reference number. System ready for SMS integration."
        />
        <FeatureCard
          icon={<Database size={24} />}
          iconBg="bg-secondary text-foreground"
          title="Centralized Database"
          desc="Secure storage of livestock assets data helping the LGU in planning and assistance distribution."
        />
      </div>
    </div>
  );
}


function FeatureCard({ icon, iconBg, title, desc }: { icon: React.ReactNode; iconBg: string; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${iconBg}`}>
        {icon}
      </div>
      <h3 className="text-base font-semibold text-card-foreground mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

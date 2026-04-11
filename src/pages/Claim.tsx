import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Loader2, Camera, AlertCircle, ChevronRight } from 'lucide-react';
import { addClaim, findApplication } from '@/lib/store';
import { useFarmers } from '@/hooks/useFarmers';
import { useApplications } from '@/hooks/useApplications';
import { toast } from 'sonner';

export default function Claim() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [refId, setRefId] = useState('');
    const [application, setApplication] = useState<any>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    const farmers = useFarmers();
    const applications = useApplications();

    // Derive logged-in farmer reactively
    const storedUser = localStorage.getItem('currentUser');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const user = farmers.find(f => f.username === parsedUser?.username) ?? null;
    const myApprovedApps = user
        ? applications.filter(a => a.farmerId === user.id && a.status === 'Approved')
        : [];


    const handleVerify = () => {
        const found = findApplication(refId);
        if (found) {
            if (found.status !== 'Approved') {
                toast.error('Only approved applications can file a claim.');
                setApplication(null);
            } else {
                setApplication(found);
                toast.success('Application verified.');
            }
        } else {
            toast.error('Application not found.');
            setApplication(null);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData(e.currentTarget);

        const claimData = {
            applicationId: application.id,
            farmerId: application.farmerId,
            farmerName: application.name,
            animalType: application.type,
            reason: data.get('reason') as string,
        };

        const submit = async () => {
            try {
                let photoUrl;
                if (photoFile) {
                    const { uploadFile } = await import('@/lib/store');
                    photoUrl = await uploadFile(photoFile);
                }

                await addClaim({
                    ...claimData,
                    ...(photoUrl && { photoUrl })
                });
                toast.success('Claim submitted successfully!');
                setLoading(false);
                navigate('/');
            } catch (error) {
                toast.error('Failed to submit claim. Please try again.');
                setLoading(false);
            }
        };

        submit();
    };

    return (
        <div className="animate-fade-in max-w-2xl mx-auto px-4">
            <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
                <div className="bg-accent/50 px-8 py-6 border-b border-emerald-100/50">
                    <h2 className="text-xl font-semibold text-emerald-950 tracking-tight">Insurance Claim</h2>
                    <p className="text-sm text-muted-foreground mt-1">File a claim for your insured livestock.</p>
                </div>

                <div className="p-8 space-y-6">
                    {!application ? (
                        <div className="space-y-6">
                            {user && myApprovedApps.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-emerald-950 uppercase tracking-wider">Your Approved Applications</p>
                                    <div className="grid gap-2">
                                        {myApprovedApps.map(app => (
                                            <button
                                                key={app.id}
                                                onClick={() => setApplication(app)}
                                                className="flex items-center justify-between p-4 bg-secondary/50 hover:bg-accent/50 border border-border rounded-xl transition-all group text-left"
                                            >
                                                <div>
                                                    <p className="text-sm font-bold text-emerald-950">{app.type}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{app.id}</p>
                                                </div>
                                                <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or verify different Ref #</span></div>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-secondary/30 rounded-2xl border border-border">
                                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                                    <AlertCircle size={16} className="text-primary" />
                                    Please verify your Insurance Application Reference Number first.
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={refId}
                                        onChange={(e) => setRefId(e.target.value)}
                                        placeholder="Enter Ref # (e.g. DAA-8821)"
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/50 border border-border focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm transition-all outline-none"
                                    />
                                    <button
                                        onClick={handleVerify}
                                        className="bg-emerald-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-950 transition-all shadow-lg shadow-emerald-900/10 active:scale-95"
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4 p-4 bg-accent/30 rounded-xl border border-accent">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Farmer</p>
                                    <p className="text-sm font-medium">{application.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Livestock</p>
                                    <p className="text-sm font-medium">{application.type}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Ref ID</p>
                                    <p className="text-sm font-mono">{application.id}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setApplication(null)}
                                    className="text-xs text-primary font-medium hover:underline text-left mt-auto"
                                >
                                    Change Application
                                </button>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-card-foreground">Reason for Claim</label>
                                <textarea
                                    name="reason"
                                    required
                                    rows={4}
                                    placeholder="Describe what happened to the livestock..."
                                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-card-foreground">Supporting Evidence (Photos)</label>
                                <label className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-secondary transition-colors cursor-pointer group">
                                    <Camera size={24} className="text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                                    <span className="text-xs text-muted-foreground">
                                        {photoFile ? photoFile.name : 'Upload photo of the incident or livestock state'}
                                    </span>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setPhotoFile(e.target.files[0]);
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-emerald-800 text-primary-foreground font-medium py-3 rounded-xl shadow-primary-glow transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Submitting Claim...
                                    </>
                                ) : (
                                    <>
                                        Submit Claim
                                        <ClipboardCheck size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

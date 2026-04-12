import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { addFarmer } from '@/lib/store';
import logo from '@/assets/logo.png';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        mobile: '',
        address: '',
        district: '',
        dob: '',
        gender: '',
        civilStatus: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();

        try {
            await addFarmer(formData);
            toast.success('Registration successful. Your account is pending verification by an administrator.');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.message || 'Failed to register. Please try again.');
        }
    };

    return (
        <div className="animate-fade-in min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-lg">
                <div className="bg-card/40 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-950/5 border border-white/20 p-8 sm:p-10 relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500" />

                    <div className="relative text-center">
                        <div className="mb-6 transform transition-transform duration-500 hover:scale-105">
                            <img src={logo} alt="Dimataling Seal" className="w-20 h-20 mx-auto object-contain drop-shadow-xl" />
                        </div>

                        <h2 className="text-2xl font-bold text-emerald-950 tracking-tight mb-2 flex items-center justify-center gap-2">
                            <UserPlus className="w-6 h-6 text-primary" />
                            Farmer Registration
                        </h2>
                        <p className="text-sm text-muted-foreground mb-8">
                            Create an account to manage your <span className="text-primary font-medium">Agricultural Insurance</span>
                        </p>

                        <form onSubmit={handleRegister} className="space-y-4 text-left">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm transition-all outline-none"
                                        placeholder="Enter full name"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-1">Mobile Number</label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        required
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm transition-all outline-none"
                                        placeholder="e.g. 09123456789"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-1">Address (Barangay)</label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm transition-all outline-none"
                                        placeholder="Enter barangay"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-1">District</label>
                                    <input
                                        type="text"
                                        name="district"
                                        required
                                        value={formData.district}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm transition-all outline-none"
                                        placeholder="Enter district"
                                    />  
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-1">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm transition-all outline-none"
                                        placeholder="Choose a username"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-1">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        required
                                        value={formData.dob}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-1">Gender</label>
                                    <select
                                        name="gender"
                                        required
                                        value={formData.gender}
                                        onChange={handleChange as any}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm transition-all outline-none appearance-none"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-1">Civil Status</label>
                                <select
                                    name="civilStatus"
                                    required
                                    value={formData.civilStatus}
                                    onChange={handleChange as any}
                                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm transition-all outline-none appearance-none"
                                >
                                    <option value="">Select Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Widowed">Widowed</option>
                                    <option value="Separated">Separated</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-semibold py-4 rounded-xl transition-all shadow-xl shadow-emerald-900/20 active:scale-[0.98] mt-6 flex items-center justify-center gap-2"
                            >
                                Create Account
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-emerald-100 flex flex-col gap-4">
                            <Link to="/login" className="text-sm text-primary font-semibold hover:text-emerald-800 transition-colors flex items-center justify-center gap-1">
                                Already have an account? <span className="underline decoration-2 underline-offset-4">Sign in</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

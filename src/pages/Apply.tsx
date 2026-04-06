import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Camera, FileCheck, Loader2 } from 'lucide-react';
import { addApplication, uploadFile } from '@/lib/store';
import { useFarmers } from '@/hooks/useFarmers';
import { toast } from 'sonner';

export default function Apply() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const farmers = useFarmers();

  const [animalPhoto, setAnimalPhoto] = useState<File | null>(null);
  const [ownershipProof, setOwnershipProof] = useState<File | null>(null);

  // Derive the logged-in farmer reactively from the live farmers list
  const storedUser = localStorage.getItem('currentUser');
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const user = farmers.find(f => f.username === parsedUser?.username) ?? null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    const startDateStr = data.get('startDate') as string;
    const endDateStr = data.get('endDate') as string;

    if (startDateStr && endDateStr) {
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      if (end < start) {
        setError('Invalid date: End date cannot be before start date.');
        setLoading(false);
        return;
      }
    }
    setError('');

    const submit = async () => {
      try {
        let photoUrl = undefined;
        let ownershipProofUrl = undefined;

        if (animalPhoto) {
          toast.info('Uploading animal photo...');
          photoUrl = await uploadFile(animalPhoto);
        }

        if (ownershipProof) {
          toast.info('Uploading ownership proof...');
          ownershipProofUrl = await uploadFile(ownershipProof);
        }

        const refID = await addApplication({
          farmerId: user?.id,
          name: data.get('fullName') as string,
          type: `${data.get('animalType')} (${data.get('heads')})`,
          mobile: data.get('mobile') as string,
          address: data.get('address') as string,
          district: data.get('district') as string,
          value: Number(data.get('value')),
          startDate: startDateStr,
          endDate: endDateStr,
          photoUrl,
          ownershipProofUrl,
        });
        toast.success(`Application submitted! Ref: ${refID}`);
        setLoading(false);
        navigate('/dashboard');
      } catch (error) {
        console.error(error);
        toast.error('Failed to submit application. Please try again.');
        setLoading(false);
      }
    };

    submit();
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto px-4 pb-12">
      <div className="bg-card rounded-2xl shadow-lg shadow-stone-200/50 border border-border overflow-hidden">
        <div className="bg-accent/50 px-8 py-6 border-b border-emerald-100/50">
          <h2 className="text-xl font-semibold text-emerald-950 tracking-tight">Insurance Application</h2>
          <p className="text-sm text-muted-foreground mt-1">Please fill in the details of the farmer and the livestock.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Farmer Info */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Farmer Information</legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <InputField label="Full Name" name="fullName" placeholder="e.g. Pedro Penduko" defaultValue={user?.name} required />
              <InputField label="Mobile Number" name="mobile" type="tel" placeholder="0912 345 6789" defaultValue={(user as any)?.mobile} required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <InputField label="Barangay Address" name="address" placeholder="Complete Address in Dimataling" defaultValue={(user as any)?.address} required />
              <InputField label="District" name="district" placeholder="e.g. District 1" defaultValue={(user as any)?.district} required />
            </div>
          </fieldset>

          <hr className="border-border" />

          {/* Livestock */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Livestock Details</legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-card-foreground">Type of Animal</label>
                <select
                  name="animalType"
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm appearance-none cursor-pointer"
                >
                  <option>Carabao</option>
                  <option>Cattle</option>
                  <option>Swine</option>
                  <option>Goat</option>
                  <option>Poultry</option>
                </select>
              </div>
              <InputField label="Number of Heads" name="heads" type="number" placeholder="1" required min={1} />
            </div>
            <InputField label="Estimated Total Value (PHP)" name="value" type="number" placeholder="0.00" required />
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <InputField label="Start Date" name="startDate" type="date" required />
              <InputField label="End Date" name="endDate" type="date" required />
            </div>
            {error && <p className="text-destructive text-sm font-medium">{error}</p>}
          </fieldset>

          <hr className="border-border" />

          {/* Uploads */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Documentation</legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <UploadBox 
                icon={<Camera size={24} />} 
                label="Upload Animal Photo" 
                onFileSelect={setAnimalPhoto}
              />
              <UploadBox 
                icon={<FileCheck size={24} />} 
                label="Ownership Proof (Cert)" 
                onFileSelect={setOwnershipProof}
              />
            </div>
          </fieldset>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
            />
            <label htmlFor="terms" className="text-xs text-muted-foreground">
              I certify that the information provided is true and correct.
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
                Processing...
              </>
            ) : (
              <>
                Submit Application
                <Send size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-card-foreground">{label}</label>
      <input
        {...props}
        className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
      />
    </div>
  );
}

function UploadBox({ icon, label, onFileSelect }: { icon: React.ReactNode; label: string; onFileSelect: (file: File) => void }) {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <label className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-secondary transition-colors cursor-pointer group">
      <div className="text-muted-foreground group-hover:text-primary mb-2 transition-colors">{icon}</div>
      <span className="text-xs text-muted-foreground">{fileName || label}</span>
      <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
    </label>
  );
}

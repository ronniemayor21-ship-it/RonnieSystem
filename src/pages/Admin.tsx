import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, LogOut, Folder, Clock, CheckCircle, Plus, Edit, Trash2, X, BarChart3, ClipboardList, Image as ImageIcon } from 'lucide-react';
import { useApplications } from '@/hooks/useApplications';
import { useFarmers } from '@/hooks/useFarmers';
import { useClaims } from '@/hooks/useClaims';
import { updateApplicationStatus, updateClaimStatus, addFarmer, updateFarmer, updateFarmerStatus, deleteFarmer, type Farmer, type Application } from '@/lib/store';
import StatusBadge from '@/components/StatusBadge';
import { toast } from 'sonner';

export default function Admin() {
  const navigate = useNavigate();
  const applications = useApplications();
  const farmers = useFarmers();
  const claims = useClaims();
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'farmers' | 'claims'>('overview');

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      toast.error('Please login to access the portal');
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== 'admin' && user.role !== 'staff') {
      toast.error('Unauthorized access');
      navigate('/');
    }
  }, [navigate]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const totalApplications = applications.length;
  const pendingApplications = applications.filter(a => a.status === 'Pending').length;
  const approvedApplications = applications.filter(a => a.status === 'Approved').length;

  const totalClaims = claims.length;
  const pendingClaims = claims.filter(c => c.status === 'Pending').length;

  const handleStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await updateApplicationStatus(id, status);
      toast.success(`Application ${status}`);
    } catch (error) {
      toast.error('Failed to update application');
    }
  };

  const handleClaimStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await updateClaimStatus(id, status);
      toast.success(`Claim ${status}`);
    } catch (error) {
      toast.error('Failed to update claim');
    }
  };

  const handleFarmerStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await updateFarmerStatus(id, status);
      toast.success(`Farmer ${status}`);
    } catch (error) {
      toast.error('Failed to update farmer status');
    }
  };

  const handleFarmerSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const farmerData: any = {
      name: data.get('name') as string,
      username: data.get('username') as string,
      password: data.get('password') as string,
      mobile: data.get('mobile') as string,
      address: data.get('address') as string,
      district: data.get('district') as string,
    };

    try {
      if (editingId) {
        await updateFarmer(editingId, farmerData);
        toast.success('Farmer updated');
      } else {
        await addFarmer(farmerData);
        toast.success('Farmer added. They can now log in using their Mobile Number.');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || (editingId ? 'Failed to update farmer' : 'Failed to add farmer'));
    }
  };

  const openEditModal = (farmer: Farmer) => {
    setEditingId(farmer.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this farmer?')) {
      try {
        await deleteFarmer(id);
        toast.success('Farmer deleted');
      } catch (error) {
        toast.error('Failed to delete farmer');
      }
    }
  };

  const editingFarmer = editingId ? farmers.find(f => f.id === editingId) : null;

  return (
    <div className="animate-fade-in w-full px-4 sm:px-6 lg:px-8 pb-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-card rounded-xl border border-border p-4 sticky top-24">
            <div className="mb-6 px-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Dashboard</p>
            </div>
            <nav className="space-y-1">
              <SidebarLink
                icon={<BarChart3 size={16} />}
                label="Overview"
                active={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
              />
              <SidebarLink
                icon={<LayoutGrid size={16} />}
                label="Applications"
                active={activeTab === 'applications'}
                onClick={() => setActiveTab('applications')}
              />
              <SidebarLink
                icon={<ClipboardList size={16} />}
                label="Claims"
                active={activeTab === 'claims'}
                onClick={() => setActiveTab('claims')}
              />
              <SidebarLink
                icon={<Users size={16} />}
                label="Farmers"
                active={activeTab === 'farmers'}
                onClick={() => setActiveTab('farmers')}
              />
              <hr className="my-2 border-border" />
              <button
                onClick={() => {
                  localStorage.removeItem('currentUser');
                  toast.success('Logged out successfully');
                  navigate('/');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg text-sm font-medium transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Farmers" value={farmers.length} icon={<Users size={20} />} iconBg="bg-primary/10 text-primary" />
                <StatCard label="Applications" value={totalApplications} icon={<Folder size={20} />} iconBg="bg-blue-50 text-blue-600" />
                <StatCard label="Pending Claims" value={pendingClaims} icon={<Clock size={20} />} iconBg="bg-warning/10 text-warning" valueColor="text-warning" />
                <StatCard label="Total Claims" value={totalClaims} icon={<ClipboardList size={20} />} iconBg="bg-accent text-accent-foreground" />
              </div>

              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="text-sm font-semibold mb-4">Application Statistics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Approved</p>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0}%` }}></div>
                    </div>
                    <p className="text-sm font-medium">{approvedApplications} / {totalApplications}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-warning" style={{ width: `${totalApplications > 0 ? (pendingApplications / totalApplications) * 100 : 0}%` }}></div>
                    </div>
                    <p className="text-sm font-medium">{pendingApplications} / {totalApplications}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Staff Activity</p>
                    <p className="text-sm font-medium">Daily average: 12.4</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Total Applications" value={totalApplications} icon={<Folder size={20} />} iconBg="bg-secondary text-muted-foreground" />
                <StatCard label="Pending Review" value={pendingApplications} icon={<Clock size={20} />} iconBg="bg-warning/10 text-warning" valueColor="text-warning" />
                <StatCard label="Approved" value={approvedApplications} icon={<CheckCircle size={20} />} iconBg="bg-accent text-accent-foreground" valueColor="text-primary" />
              </div>

              {/* Table */}
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-card-foreground">Insurance Applications</h3>
                  <button className="text-xs text-primary font-medium hover:underline">Export CSV</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-secondary">
                      <tr>
                        {['Ref ID', 'Farmer', 'Animal', 'Docs', 'Date', 'Status', 'Actions'].map(h => (
                          <th key={h} className={`px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {applications.map((app, index) => (
                        <tr key={app.id} className="hover:bg-secondary transition-colors group">
                          <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{app.id}</td>
                          <td className="px-6 py-4 text-sm font-medium text-card-foreground">{app.name}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{app.type}</td>
                          <td className="px-6 py-4">
                            {(app.photoUrl || app.ownershipProofUrl) ? (
                              <button 
                                onClick={() => setSelectedApp(app)}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center gap-1 text-[10px] font-bold"
                              >
                                <ImageIcon size={14} /> VIEW
                              </button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">No Photos</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground">{app.date}</td>
                          <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
                          <td className="px-6 py-4 text-right">
                            {app.status === 'Pending' && (
                              <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleStatus(app.id, 'Approved')}
                                  className="p-1 rounded hover:bg-accent text-primary"
                                  title="Approve"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => handleStatus(app.id, 'Rejected')}
                                  className="p-1 rounded hover:bg-destructive/10 text-destructive"
                                  title="Reject"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'claims' && (
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                <h3 className="text-sm font-semibold text-card-foreground">Claims Management</h3>
                <button className="text-xs text-primary font-medium hover:underline">Export PDF</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-secondary">
                    <tr>
                      {['ID', 'App ID', 'Farmer', 'Animal', 'Reason', 'Date', 'Status', 'Actions'].map(h => (
                        <th key={h} className={`px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {claims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-secondary transition-colors group">
                        <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{claim.id}</td>
                        <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{claim.applicationId}</td>
                        <td className="px-6 py-4 text-sm font-medium text-card-foreground">{claim.farmerName}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{claim.animalType}</td>
                        <td className="px-6 py-4 text-sm text-foreground max-w-xs truncate">{claim.reason}</td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">{claim.date}</td>
                        <td className="px-6 py-4"><StatusBadge status={claim.status} /></td>
                        <td className="px-6 py-4 text-right">
                          {claim.status === 'Pending' && (
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleClaimStatus(claim.id, 'Approved')}
                                className="p-1 rounded hover:bg-accent text-primary"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleClaimStatus(claim.id, 'Rejected')}
                                className="p-1 rounded hover:bg-destructive/10 text-destructive"
                                title="Reject"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {claims.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-sm text-muted-foreground italic">
                          No claims submitted yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'farmers' && (
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                <h3 className="text-sm font-semibold text-card-foreground">Farmers Management</h3>
                <button
                  onClick={() => { setEditingId(null); setIsModalOpen(true); }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus size={14} /> Add Farmer
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-secondary">
                    <tr>
                      {['ID', 'Name', 'Username', 'Mobile', 'Address', 'District', 'Docs', 'Status', 'Actions'].map(h => (
                        <th key={h} className={`px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {farmers.map((farmer) => (
                      <tr key={farmer.id} className="hover:bg-secondary transition-colors group">
                        <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{farmer.id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-card-foreground">{farmer.name}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{farmer.username}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{farmer.mobile}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{farmer.address}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{farmer.district}</td>
                        <td className="px-6 py-4">
                          {(() => {
                            const farmerApps = applications.filter(a => a.farmerId === farmer.id);
                            const latestAppWithDocs = [...farmerApps].reverse().find(a => a.photoUrl || a.ownershipProofUrl);
                            return latestAppWithDocs ? (
                              <button
                                onClick={() => setSelectedApp(latestAppWithDocs)}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center gap-1 text-[10px] font-bold"
                              >
                                <ImageIcon size={14} /> VIEW
                              </button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">No Docs</span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={farmer.status as any || 'Pending'} /></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {farmer.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleFarmerStatus(farmer.id, 'Approved')}
                                  className="p-1 rounded hover:bg-accent text-primary"
                                  title="Approve"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleFarmerStatus(farmer.id, 'Rejected')}
                                  className="p-1 rounded hover:bg-destructive/10 text-destructive"
                                  title="Reject"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => openEditModal(farmer)}
                              className="p-1 rounded hover:bg-accent text-primary"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(farmer.id)}
                              className="p-1 rounded hover:bg-destructive/10 text-destructive"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Farmer Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6 animate-zoom-in relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Farmer' : 'Add Farmer'}
            </h3>
            <form onSubmit={handleFarmerSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Full Name</label>
                  <input
                    name="name"
                    defaultValue={editingFarmer?.name}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Mobile</label>
                  <input
                    name="mobile"
                    defaultValue={editingFarmer?.mobile}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Username</label>
                  <input
                    name="username"
                    defaultValue={editingFarmer?.username}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm outline-none transition-all"
                    placeholder="e.g. juan_cruz"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Password</label>
                  <input
                    name="password"
                    type="text"
                    defaultValue={editingFarmer?.password || 'password123'}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Address</label>
                <input
                  name="address"
                  defaultValue={editingFarmer?.address}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">District</label>
                <input
                  name="district"
                  defaultValue={editingFarmer?.district}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm outline-none transition-all"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-secondary text-foreground hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-fade-in">
          <div className="bg-card w-full max-w-4xl rounded-3xl shadow-2xl border border-border overflow-hidden animate-zoom-in relative">
            <div className="p-6 border-b border-border flex justify-between items-center bg-accent/20">
              <div>
                <h3 className="font-bold text-lg text-emerald-950">Application Documents</h3>
                <p className="text-xs text-muted-foreground">ID: {selectedApp.id} | Farmer: {selectedApp.name}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-full bg-secondary hover:bg-accent text-foreground transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 grid md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
              {/* Photo */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Animal Photo</h4>
                {selectedApp.photoUrl ? (
                  <div className="rounded-2xl border border-border overflow-hidden bg-stone-100 aspect-video flex items-center justify-center">
                    <img 
                      src={selectedApp.photoUrl} 
                      alt="Animal" 
                      className="w-full h-full object-contain"
                      onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Error+Loading+Image')}
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-border aspect-video flex items-center justify-center text-muted-foreground italic text-sm bg-stone-50">
                    No animal photo uploaded
                  </div>
                )}
              </div>

              {/* Ownership Proof */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ownership Proof</h4>
                {selectedApp.ownershipProofUrl ? (
                  <div className="rounded-2xl border border-border overflow-hidden bg-stone-100 aspect-video flex items-center justify-center">
                    <img 
                      src={selectedApp.ownershipProofUrl} 
                      alt="Proof" 
                      className="w-full h-full object-contain"
                      onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Error+Loading+Image')}
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-border aspect-video flex items-center justify-center text-muted-foreground italic text-sm bg-stone-50">
                    No proof document uploaded
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-secondary/50 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-primary-glow hover:bg-emerald-800 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-secondary'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ label, value, icon, iconBg, valueColor }: { label: string; value: number; icon: React.ReactNode; iconBg: string; valueColor?: string }) {
  return (
    <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <h3 className={`text-2xl font-semibold mt-1 tracking-tight ${valueColor || 'text-card-foreground'}`}>{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
      </div>
    </div>
  );
}

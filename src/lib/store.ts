export interface Farmer {
  id: string;
  name: string;
  username: string;
  password?: string;
  mobile: string;
  address: string;
  district: string;
  dob?: string;
  gender?: string;
  civilStatus?: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
}

import { toast } from 'sonner';

export interface Application {
  id: string;
  farmerId?: string;
  name: string;
  type: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  mobile?: string;
  address?: string;
  district?: string;
  value?: number;
  startDate?: string;
  endDate?: string;
  purpose?: string;
  breed?: string;
  sex?: string;
  age?: string;
  photoUrl?: string;
  ownershipProofUrl?: string;
}

export interface Claim {
  id: string;
  applicationId: string;
  farmerId?: string;
  farmerName: string;
  animalType: string;
  reason: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  photoUrl?: string;
}

const isDevelopment = import.meta.env.MODE === 'development';
const API_URL = '/api';
const UPLOADS_URL = '';

let applications: Application[] = [];
let farmers: Farmer[] = [];
let claims: Claim[] = [];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach(fn => fn());
}

// Fetch all data from the Express backend
export async function loadData() {
  try {
    const [appsRes, farmersRes, claimsRes] = await Promise.all([
      fetch(`${API_URL}/applications`),
      fetch(`${API_URL}/farmers`),
      fetch(`${API_URL}/claims`)
    ]);

    const appsDump = await appsRes.json();
    const farmersDump = await farmersRes.json();
    const claimsDump = await claimsRes.json();

    // Map DB underscore_case to JS camelCase
    applications = appsDump.map((app: any) => ({
      ...app,
      farmerId: app.farmer_id,
      startDate: app.start_date ? app.start_date.split('T')[0] : undefined,
      endDate: app.end_date ? app.end_date.split('T')[0] : undefined,
      photoUrl: app.photo_url ? (app.photo_url.startsWith('http') ? app.photo_url : `${UPLOADS_URL}${app.photo_url}`) : undefined,
      ownershipProofUrl: app.ownership_proof_url ? (app.ownership_proof_url.startsWith('http') ? app.ownership_proof_url : `${UPLOADS_URL}${app.ownership_proof_url}`) : undefined,
      date: new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }));

    farmers = farmersDump;

    claims = claimsDump.map((cl: any) => ({
      ...cl,
      applicationId: cl.application_id,
      farmerId: cl.farmer_id,
      farmerName: cl.farmer_name,
      animalType: cl.animal_type,
      photoUrl: cl.photo_url ? (cl.photo_url.startsWith('http') ? cl.photo_url : `${UPLOADS_URL}${cl.photo_url}`) : undefined,
      date: new Date(cl.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }));

    console.log(`📦 [Store] Loaded ${applications.length} applications and ${claims.length} claims.`);
    if (applications.length > 0) {
      console.log('   - Sample application photoUrl:', applications[0].photoUrl);
    }

    notify();
  } catch (error) {
    console.warn(
      '⚠️ Could not load data from backend. Is the server running?',
      error
    );
    // Notify the user via a toast if we are in the browser
    if (typeof window !== 'undefined') {
       toast.error('The application is having trouble connecting to the server. Please check your connection or refresh the page.', {
         id: 'backend-connection-error', // Prevent duplicate toasts
       });
    }
  }
}

// Initial load
loadData();

export function getApplications() {
  return applications;
}

export function subscribe(fn: () => void) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorText = 'File upload failed';
    try {
      const errorData = await response.json();
      errorText = errorData.error || errorData.details || errorText;
      if (errorData.path) errorText += ` (Path: ${errorData.path})`;
    } catch (e) {
      try {
        errorText = await response.text();
      } catch (inner) { /* fallback */ }
    }
    
    console.error('Upload failed with status:', response.status, errorText);
    throw new Error(`File upload failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  console.log('Upload successful. URL:', result.url);
  return result.url;
}

export async function addApplication(app: Omit<Application, 'id' | 'date' | 'status'>) {
  const refID = 'DAA-' + Math.floor(1000 + Math.random() * 9000);
  
  const payload = {
    id: refID,
    farmer_id: app.farmerId,
    name: app.name,
    type: app.type,
    mobile: app.mobile,
    address: app.address,
    district: app.district,
    value: app.value,
    start_date: app.startDate,
    end_date: app.endDate,
    purpose: app.purpose,
    breed: app.breed,
    sex: app.sex,
    age: app.age,
    photo_url: app.photoUrl,
    ownership_proof_url: app.ownershipProofUrl,
    status: 'Pending'
  };

  const response = await fetch(`${API_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let errorMsg = 'Failed to submit application';
    try {
      const data = await response.json();
      errorMsg = data.error || data.message || errorMsg;
    } catch (e) {
      errorMsg = await response.text() || errorMsg;
    }
    throw new Error(errorMsg);
  }

  await loadData();
  return refID;
}

export async function updateApplicationStatus(id: string, status: Application['status']) {
  const response = await fetch(`${API_URL}/applications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update status: ${response.statusText}`);
  }
  await loadData();
}

export function findApplication(refId: string) {
  return applications.find(app => app.id === refId);
}

export function getFarmers() {
  return farmers;
}

export function findFarmerByUsername(username: string) {
  return farmers.find(f => f.username === username);
}

export function findFarmerByIdentifier(identifier: string) {
  if (!identifier) return undefined;
  const lowerId = identifier.toLowerCase();
  return farmers.find(f =>
    (f.id && f.id.toLowerCase() === lowerId) ||
    (f.username && f.username.toLowerCase() === lowerId) ||
    (f.mobile === identifier)
  );
}

export async function loginFarmer(identifier: string, password?: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });

  if (!response.ok) {
    let errorMessage = 'Login failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // Fallback
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function addFarmer(farmer: Omit<Farmer, 'id'>) {
  const id = 'FMR-' + Math.floor(1000 + Math.random() * 9000);
  
  const payload = {
    id,
    ...farmer,
    password: farmer.password || 'password123',
    dob: farmer.dob,
    gender: farmer.gender,
    civil_status: farmer.civilStatus,
    status: 'Pending'
  };

  const response = await fetch(`${API_URL}/farmers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let errorMessage = 'Failed to register';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // Fallback if response is not JSON
    }
    throw new Error(errorMessage);
  }

  await loadData();
  return id;
}

export async function updateFarmer(id: string, updates: Partial<Omit<Farmer, 'id'>>) {
  const response = await fetch(`${API_URL}/farmers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    throw new Error(`Failed to update farmer: ${response.statusText}`);
  }
  await loadData();
}

export async function updateFarmerStatus(id: string, status: Farmer['status']) {
  const response = await fetch(`${API_URL}/farmers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    throw new Error(`Failed to update status: ${response.statusText}`);
  }
  await loadData();
}

export async function deleteFarmer(id: string) {
  const response = await fetch(`${API_URL}/farmers/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error(`Failed to delete farmer: ${response.statusText}`);
  }
  await loadData();
}

export function getClaims() {
  return claims;
}

export async function addClaim(claim: Omit<Claim, 'id' | 'date' | 'status'>) {
  const id = 'CLM-' + Math.floor(1000 + Math.random() * 9000);
  
  const payload = {
    id,
    application_id: claim.applicationId,
    farmer_id: claim.farmerId,
    farmer_name: claim.farmerName,
    animal_type: claim.animalType,
    reason: claim.reason,
    photo_url: claim.photoUrl,
    status: 'Pending'
  };

  const response = await fetch(`${API_URL}/claims`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let errorMsg = 'Failed to submit claim';
    try {
      const data = await response.json();
      errorMsg = data.error || errorMsg;
    } catch (e) { /* fallback */ }
    throw new Error(errorMsg);
  }

  await loadData();
  return id;
}

export async function updateClaimStatus(id: string, status: Claim['status']) {
  const response = await fetch(`${API_URL}/claims/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    throw new Error(`Failed to update claim status: ${response.statusText}`);
  }
  await loadData();
}

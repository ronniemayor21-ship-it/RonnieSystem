import { useSyncExternalStore } from 'react';
import { getApplications, subscribe } from '@/lib/store';

export function useApplications() {
  return useSyncExternalStore(subscribe, getApplications);
}

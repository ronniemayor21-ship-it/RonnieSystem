import { useSyncExternalStore } from 'react';
import { getClaims, subscribe } from '@/lib/store';

export function useClaims() {
    return useSyncExternalStore(subscribe, getClaims);
}

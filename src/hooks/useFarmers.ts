import { useSyncExternalStore } from 'react';
import { getFarmers, subscribe } from '@/lib/store';

export function useFarmers() {
    return useSyncExternalStore(subscribe, getFarmers);
}

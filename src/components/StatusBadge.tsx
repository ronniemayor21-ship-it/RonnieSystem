import type { Application } from '@/lib/store';

const statusStyles: Record<Application['status'], string> = {
  Approved: 'bg-accent text-accent-foreground border border-emerald-100',
  Pending: 'bg-warning/10 text-warning-foreground border border-warning/20',
  Rejected: 'bg-destructive/10 text-destructive border border-destructive/20',
};

export default function StatusBadge({ status }: { status: Application['status'] }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

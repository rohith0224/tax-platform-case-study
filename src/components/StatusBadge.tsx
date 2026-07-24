import type { ReturnStatus } from '@/types';
import { STATUS_META } from '@/lib/status';

const TONE_CLASS: Record<string, string> = {
  neutral: 'bg-slate-100 text-slate-600',
  progress: 'bg-blue-50 text-blue-700',
  attention: 'bg-amber-50 text-amber-800',
  success: 'bg-emerald-50 text-emerald-700',
};

export function StatusBadge({ status, audience = 'staff' }: { status: ReturnStatus; audience?: 'staff' | 'client' }) {
  const meta = STATUS_META[status];
  const label = audience === 'client' ? meta.clientLabel : meta.staffLabel;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASS[meta.tone]}`}>
      {label}
    </span>
  );
}

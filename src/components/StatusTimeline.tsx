import { CLIENT_STAGES, STATUS_META } from '@/lib/status';
import type { ReturnStatus } from '@/types';
import { Check } from 'lucide-react';

/** Client-facing 5-stage progress bar — deliberately coarser than the staff status field. */
export function StatusTimeline({ status }: { status: ReturnStatus }) {
  const currentStep = STATUS_META[status].clientStep;

  return (
    <ol className="flex items-center w-full">
      {CLIENT_STAGES.map((stage, i) => {
        const step = i + 1;
        const done = step < currentStep;
        const current = step === currentStep;
        return (
          <li key={stage} className="flex-1 flex items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                  done
                    ? 'border-teal-700 bg-teal-700 text-white'
                    : current
                    ? 'border-teal-700 bg-white text-teal-700'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step}
              </div>
              <span className={`text-[11px] text-center max-w-20 ${current ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                {stage}
              </span>
            </div>
            {i < CLIENT_STAGES.length - 1 && (
              <div className={`mx-1.5 h-0.5 flex-1 rounded ${done ? 'bg-teal-700' : 'bg-slate-200'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

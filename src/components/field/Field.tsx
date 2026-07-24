'use client';

import { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Lock, Clock3, Pencil } from 'lucide-react';

export type FieldState = 'editable' | 'ai_unverified' | 'verified' | 'flagged' | 'locked' | 'pending_approval';

const STATE_META: Record<
  FieldState,
  { badge: string; icon: typeof Sparkles; badgeClass: string; borderClass: string; lockedReason?: string }
> = {
  editable: {
    badge: 'Editable',
    icon: Pencil,
    badgeClass: 'bg-slate-100 text-slate-600',
    borderClass: 'border-slate-200 hover:border-teal-400',
  },
  ai_unverified: {
    badge: 'AI-extracted · unverified',
    icon: Sparkles,
    badgeClass: 'bg-violet-50 text-violet-700',
    borderClass: 'border-violet-200 hover:border-violet-400',
  },
  verified: {
    badge: 'Verified',
    icon: CheckCircle2,
    badgeClass: 'bg-emerald-50 text-emerald-700',
    borderClass: 'border-emerald-200',
    lockedReason: 'This value has been verified by a preparer and is locked from editing. Ask your preparer to request a change.',
  },
  flagged: {
    badge: 'Needs review',
    icon: AlertTriangle,
    badgeClass: 'bg-amber-50 text-amber-800',
    borderClass: 'border-amber-300 hover:border-amber-500',
  },
  locked: {
    badge: 'Locked',
    icon: Lock,
    badgeClass: 'bg-slate-100 text-slate-500',
    borderClass: 'border-slate-200',
    lockedReason: 'This value is calculated automatically from other fields and cannot be edited directly.',
  },
  pending_approval: {
    badge: 'Pending approval',
    icon: Clock3,
    badgeClass: 'bg-blue-50 text-blue-700',
    borderClass: 'border-blue-200',
    lockedReason: 'A change to this field has been submitted and is waiting on reviewer approval.',
  },
};

export interface FieldProps {
  label: string;
  value: string;
  state: FieldState;
  meta?: string;
  onValueChange?: (next: string) => void;
  onClick?: () => void;
}

/**
 * The one interaction-affordance system used everywhere a value is shown:
 * dashboard cards, the traceability review screen, and the design-system
 * gallery. Same visual language, same click behavior, in every context.
 */
export function Field({ label, value, state, meta, onValueChange, onClick }: FieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [showReason, setShowReason] = useState(false);
  const config = STATE_META[state];
  const Icon = config.icon;
  const isEditable = state === 'editable' || state === 'ai_unverified' || state === 'flagged';

  const handleClick = () => {
    if (onClick) return onClick();
    if (isEditable) {
      setEditing(true);
      return;
    }
    setShowReason((s) => !s);
  };

  return (
    <div className={`rounded-lg border bg-white p-3 transition-colors ${config.borderClass}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${config.badgeClass}`}>
          <Icon className="h-3 w-3" aria-hidden />
          {config.badge}
        </span>
      </div>

      {editing ? (
        <div className="mt-1.5 flex items-center gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onValueChange?.(draft);
                setEditing(false);
              }
              if (e.key === 'Escape') {
                setDraft(value);
                setEditing(false);
              }
            }}
            className="w-full rounded-md border border-teal-400 px-2 py-1 text-lg font-semibold text-slate-900 outline-none ring-2 ring-teal-100"
          />
          <button
            onClick={() => {
              onValueChange?.(draft);
              setEditing(false);
            }}
            className="rounded-md bg-teal-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-teal-800"
          >
            Save
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={`mt-1 flex w-full items-center justify-between gap-2 text-left ${
            isEditable || onClick ? 'cursor-pointer' : 'cursor-default'
          }`}
        >
          <span className="text-lg font-semibold text-slate-900">{value}</span>
          {isEditable && <Pencil className="h-3.5 w-3.5 text-slate-300" aria-hidden />}
        </button>
      )}

      {meta && <p className="mt-1 text-xs text-slate-500">{meta}</p>}

      {showReason && config.lockedReason && (
        <p className="mt-2 rounded-md bg-slate-50 px-2 py-1.5 text-xs text-slate-600">{config.lockedReason}</p>
      )}
    </div>
  );
}

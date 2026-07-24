import type { TaxReturn, ActionOwner } from '@/types';
import { daysUntil } from './status';

export interface PrioritizedReturn {
  taxReturn: TaxReturn;
  score: number;
  bucket: 'Overdue' | 'Needs your action' | 'Due this week' | 'On track' | 'Filed';
  reason: string;
}

/**
 * Ranks returns for a staff member's dashboard. Not a report — the ordering
 * itself is the product: overdue and "the ball is in your court" items float
 * to the top regardless of raw due date.
 */
export function prioritizeReturns(returns: TaxReturn[], viewerOwnerRole: ActionOwner | null): PrioritizedReturn[] {
  return returns
    .filter((r) => r.status !== 'filed' && r.status !== 'complete')
    .map((r) => {
      const due = daysUntil(r.dueDate);
      let score = 0;
      let bucket: PrioritizedReturn['bucket'] = 'On track';
      let reason = `Due ${due >= 0 ? `in ${due} days` : `${Math.abs(due)} days ago`}`;

      if (due < 0) {
        score += 1000 + Math.abs(due) * 10;
        bucket = 'Overdue';
        reason = `${Math.abs(due)} day${Math.abs(due) === 1 ? '' : 's'} overdue`;
      } else if (due <= 7) {
        score += 400 + (7 - due) * 10;
        bucket = 'Due this week';
      } else {
        score += Math.max(0, 100 - due);
      }

      if (r.blockingIssue) {
        score += 60;
        reason = r.blockingIssue;
      }

      if (viewerOwnerRole && r.nextAction.owner === viewerOwnerRole) {
        score += 250;
        if (bucket !== 'Overdue') bucket = 'Needs your action';
        reason = r.nextAction.label;
      }

      return { taxReturn: r, score, bucket, reason };
    })
    .sort((a, b) => b.score - a.score);
}

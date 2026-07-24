import type { ReturnStatus } from '@/types';

export interface StatusMeta {
  staffLabel: string;
  clientLabel: string;
  clientDescription: string;
  /** 1-indexed step in the 5-stage client timeline */
  clientStep: number;
  tone: 'neutral' | 'progress' | 'attention' | 'success';
}

export const CLIENT_STAGES = ['Gathering Documents', 'In Preparation', 'Under Review', 'Ready to Sign', 'Filed'];

export const STATUS_META: Record<ReturnStatus, StatusMeta> = {
  not_started: {
    staffLabel: 'Not Started',
    clientLabel: 'Getting Started',
    clientDescription: "We haven't started collecting your documents yet.",
    clientStep: 1,
    tone: 'neutral',
  },
  gathering_documents: {
    staffLabel: 'Gathering Documents',
    clientLabel: 'Gathering Documents',
    clientDescription: "We're waiting on a few documents from you.",
    clientStep: 1,
    tone: 'attention',
  },
  in_preparation: {
    staffLabel: 'In Preparation',
    clientLabel: 'In Preparation',
    clientDescription: 'Your preparer is drafting your return.',
    clientStep: 2,
    tone: 'progress',
  },
  in_review: {
    staffLabel: 'In Review',
    clientLabel: 'Under Review',
    clientDescription: 'A second reviewer is checking your return for accuracy.',
    clientStep: 3,
    tone: 'progress',
  },
  ready_to_sign: {
    staffLabel: 'Ready to Sign',
    clientLabel: 'Ready to Sign',
    clientDescription: 'Your return is ready — we need your signature to file.',
    clientStep: 4,
    tone: 'attention',
  },
  filed: {
    staffLabel: 'Filed',
    clientLabel: 'Filed',
    clientDescription: 'Your return has been filed with the IRS.',
    clientStep: 5,
    tone: 'success',
  },
  complete: {
    staffLabel: 'Complete',
    clientLabel: 'Complete',
    clientDescription: 'Your return is complete.',
    clientStep: 5,
    tone: 'success',
  },
};

export function daysUntil(dueDate: string): number {
  const ms = new Date(dueDate + 'T00:00:00').getTime() - new Date('2026-07-24T00:00:00').getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

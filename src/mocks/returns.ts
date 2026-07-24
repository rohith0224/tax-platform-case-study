export type ReturnStatus = 'gathering_docs' | 'under_review' | 'ready_to_sign' | 'complete';
export type Urgency = 'high' | 'medium' | 'low';

export interface TaxReturn {
  id: string;
  clientName: string;
  status: ReturnStatus;
  urgency: Urgency;
  dueDate: string;
  daysUntilDue: number;
  ownedBy: string;
  nextAction: string;
  blockingIssue: string | null;
  progress: number;
  year: number;
}

export const mockReturns = [
  {
    id: 'R001',
    clientName: 'Jane Smith',
    status: 'gathering_docs' as ReturnStatus,
    urgency: 'high' as Urgency,
    dueDate: '2026-08-15',
    daysUntilDue: 3,
    ownedBy: 'Alex Chen',
    nextAction: 'Client must provide W-2s',
    blockingIssue: 'Missing W-2 documents',
    progress: 30,
    year: 2025,
  },
  {
    id: 'R002',
    clientName: 'Bob Johnson',
    status: 'under_review' as ReturnStatus,
    urgency: 'high' as Urgency,
    dueDate: '2026-08-18',
    daysUntilDue: 6,
    ownedBy: 'Alex Chen',
    nextAction: 'Review Schedule C calculations',
    blockingIssue: null,
    progress: 65,
    year: 2025,
  },
  {
    id: 'R003',
    clientName: 'Carol Davis',
    status: 'ready_to_sign' as ReturnStatus,
    urgency: 'medium' as Urgency,
    dueDate: '2026-08-25',
    daysUntilDue: 13,
    ownedBy: 'Sarah Johnson',
    nextAction: 'Send for signature',
    blockingIssue: null,
    progress: 95,
    year: 2025,
  },
];

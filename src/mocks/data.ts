import { mulberry32, pick, randInt } from '@/lib/rng';
import type {
  DemoUser,
  TaxReturn,
  TaxDocument,
  ExtractedField,
  Task,
  MessageThread,
  QuestionnaireItem,
  DocumentType,
  UserRole,
} from '@/types';

// ---------------------------------------------------------------------------
// Demo users — deliberately covers all six roles plus a dual-role staffer
// (Alex is both a Preparer AND has a personal return in the system) and a
// brand-new, first-login client (Sam) for the onboarding flow.
// ---------------------------------------------------------------------------
export const demoUsers: DemoUser[] = [
  { id: 'U_JANE', name: 'Jane Smith', roles: ['client'] },
  { id: 'U_CAROL', name: 'Carol Davis', roles: ['business_owner'] },
  { id: 'U_ALEX', name: 'Alex Chen', roles: ['preparer', 'client'], team: 'Prep Team', personalReturnId: 'R_ALEX' },
  { id: 'U_SARAH', name: 'Sarah Johnson', roles: ['reviewer'], team: 'Review Team' },
  { id: 'U_MIKE', name: 'Mike Davis', roles: ['admin'], team: 'Admin Team' },
  { id: 'U_PRIYA', name: 'Priya Patel', roles: ['employee'] },
  { id: 'U_SAM', name: 'Sam Rivera', roles: ['client'], isFirstLogin: true },
];

/** Preparers an admin can assign a client/return to. Employees may already own returns from seed data but aren't offered as a new assignment target. */
export function getAssignablePreparers(): DemoUser[] {
  return demoUsers.filter((u) => u.roles.includes('preparer'));
}

export function getUserById(id: string): DemoUser | undefined {
  return demoUsers.find((u) => u.id === id);
}

// ---------------------------------------------------------------------------
// Hand-authored "hero" returns with realistic, traceable detail. These carry
// the weight of Challenges 01, 02, 04, 06, 08, 10.
// ---------------------------------------------------------------------------

const heroReturns: TaxReturn[] = [
  {
    id: 'R001',
    clientId: 'U_JANE',
    clientName: 'Jane Smith',
    entityType: 'individual',
    taxYear: 2025,
    status: 'gathering_documents',
    preparerId: 'U_ALEX',
    preparerName: 'Alex Chen',
    dueDate: '2026-08-15',
    progress: 30,
    blockingIssue: 'Missing W-2 from second employer',
    nextAction: { label: 'Upload W-2 from Meridian Retail', owner: 'client' },
    documentIds: ['D001', 'D002'],
    taskIds: ['TSK001', 'TSK002'],
    threadIds: ['T001'],
  },
  {
    id: 'R002',
    clientId: 'U_BOB',
    clientName: 'Bob Johnson',
    entityType: 'individual',
    taxYear: 2025,
    status: 'in_review',
    preparerId: 'U_ALEX',
    preparerName: 'Alex Chen',
    reviewerId: 'U_SARAH',
    reviewerName: 'Sarah Johnson',
    dueDate: '2026-07-28',
    progress: 65,
    blockingIssue: null,
    nextAction: { label: 'Reviewer to confirm Schedule C total', owner: 'reviewer' },
    documentIds: ['D003', 'D004', 'D005'],
    taskIds: ['TSK003'],
    threadIds: ['T002'],
  },
  {
    id: 'R003',
    clientId: 'U_CAROL',
    clientName: 'Carol Davis',
    entityType: 'business',
    taxYear: 2025,
    status: 'ready_to_sign',
    preparerId: 'U_SARAH',
    preparerName: 'Sarah Johnson',
    reviewerId: 'U_SARAH',
    reviewerName: 'Sarah Johnson',
    dueDate: '2026-08-25',
    progress: 95,
    blockingIssue: null,
    nextAction: { label: 'Client signature required', owner: 'client' },
    documentIds: ['D006'],
    taskIds: ['TSK004'],
    threadIds: [],
  },
  {
    id: 'R_ALEX',
    clientId: 'U_ALEX',
    clientName: 'Alex Chen',
    entityType: 'individual',
    taxYear: 2025,
    status: 'in_preparation',
    preparerId: 'U_ALEX',
    preparerName: 'Alex Chen',
    dueDate: '2026-09-10',
    progress: 55,
    blockingIssue: null,
    nextAction: { label: 'Self-prepare remaining schedules', owner: 'preparer' },
    documentIds: ['D007'],
    taskIds: [],
    threadIds: [],
  },
];

const heroDocuments: TaxDocument[] = [
  {
    id: 'D001',
    returnId: 'R001',
    clientName: 'Jane Smith',
    name: 'W-2_Contoso_2025.pdf',
    type: 'W-2',
    uploadedAt: '2026-07-10',
    pageCount: 1,
    status: 'processed',
    linkedFieldIds: ['F001', 'F002'],
    linkedTaskIds: [],
  },
  {
    id: 'D002',
    returnId: 'R001',
    clientName: 'Jane Smith',
    name: '1099-INT_FirstNational.pdf',
    type: '1099-INT',
    uploadedAt: '2026-07-10',
    pageCount: 1,
    status: 'processed',
    linkedFieldIds: ['F003'],
    linkedTaskIds: [],
  },
  {
    id: 'D003',
    returnId: 'R002',
    clientName: 'Bob Johnson',
    name: '1099-NEC_Acme_Consulting.pdf',
    type: '1099-NEC',
    uploadedAt: '2026-07-05',
    pageCount: 1,
    status: 'processed',
    linkedFieldIds: ['F004'],
    linkedTaskIds: [],
  },
  {
    id: 'D004',
    returnId: 'R002',
    clientName: 'Bob Johnson',
    name: '1099-NEC_Bright_Path.pdf',
    type: '1099-NEC',
    uploadedAt: '2026-07-05',
    pageCount: 1,
    status: 'processed',
    linkedFieldIds: ['F004'],
    linkedTaskIds: [],
  },
  {
    id: 'D005',
    returnId: 'R002',
    clientName: 'Bob Johnson',
    name: 'Business_Bank_Statement_Q4.pdf',
    type: 'Bank Statement',
    uploadedAt: '2026-07-06',
    pageCount: 4,
    status: 'needs_review',
    linkedFieldIds: ['F005'],
    linkedTaskIds: ['TSK003'],
  },
  {
    id: 'D006',
    returnId: 'R003',
    clientName: 'Carol Davis',
    name: 'K-1_Davis_Consulting_LLC.pdf',
    type: 'K-1',
    uploadedAt: '2026-07-01',
    pageCount: 2,
    status: 'processed',
    linkedFieldIds: ['F006'],
    linkedTaskIds: [],
  },
  {
    id: 'D007',
    returnId: 'R_ALEX',
    clientName: 'Alex Chen',
    name: 'W-2_GreenGrowth_Firm.pdf',
    type: 'W-2',
    uploadedAt: '2026-07-02',
    pageCount: 1,
    status: 'processed',
    linkedFieldIds: ['F007'],
    linkedTaskIds: [],
  },
];

export const heroExtractedFields: ExtractedField[] = [
  {
    id: 'F001',
    returnId: 'R001',
    formField: 'Wages, salaries, tips',
    formLine: 'Form 1040, Line 1a',
    value: '$45,000.00',
    sourceDocumentId: 'D001',
    sourceRegion: { page: 1, x: 62, y: 22, w: 30, h: 6 },
    calculation: null,
    confidence: 0.92,
    status: 'unverified',
    editable: true,
    aiGenerated: true,
  },
  {
    id: 'F002',
    returnId: 'R001',
    formField: 'Federal income tax withheld',
    formLine: 'Form 1040, Line 25a',
    value: '$5,200.00',
    sourceDocumentId: 'D001',
    sourceRegion: { page: 1, x: 62, y: 30, w: 30, h: 6 },
    calculation: null,
    confidence: 0.95,
    status: 'verified',
    editable: false,
    aiGenerated: true,
  },
  {
    id: 'F003',
    returnId: 'R001',
    formField: 'Taxable interest',
    formLine: 'Form 1040, Line 2b',
    value: '$340.00',
    sourceDocumentId: 'D002',
    sourceRegion: { page: 1, x: 55, y: 40, w: 25, h: 6 },
    calculation: null,
    confidence: 0.97,
    status: 'verified',
    editable: false,
    aiGenerated: true,
  },
  {
    id: 'F004',
    returnId: 'R002',
    formField: 'Gross receipts',
    formLine: 'Schedule C, Line 1',
    value: '$38,450.00',
    sourceDocumentId: 'D003',
    sourceRegion: { page: 1, x: 58, y: 25, w: 28, h: 6 },
    calculation: 'Box 1 (Acme Consulting, $21,200) + Box 1 (Bright Path, $17,250)',
    confidence: 0.88,
    status: 'unverified',
    editable: true,
    aiGenerated: true,
  },
  {
    id: 'F005',
    returnId: 'R002',
    formField: 'Business expenses (supplies)',
    formLine: 'Schedule C, Line 22',
    value: '$4,180.00',
    sourceDocumentId: 'D005',
    sourceRegion: { page: 2, x: 12, y: 55, w: 35, h: 30 },
    calculation: 'Sum of 14 transactions tagged "office supplies" across Q4 bank statement',
    confidence: 0.61,
    status: 'flagged',
    editable: true,
    aiGenerated: true,
  },
  {
    id: 'F006',
    returnId: 'R003',
    formField: 'Ordinary business income',
    formLine: 'Schedule E, Part II',
    value: '$112,300.00',
    sourceDocumentId: 'D006',
    sourceRegion: { page: 1, x: 50, y: 60, w: 30, h: 6 },
    calculation: null,
    confidence: 0.99,
    status: 'verified',
    editable: false,
    aiGenerated: true,
  },
  {
    id: 'F007',
    returnId: 'R_ALEX',
    formField: 'Wages, salaries, tips',
    formLine: 'Form 1040, Line 1a',
    value: '$96,000.00',
    sourceDocumentId: 'D007',
    sourceRegion: { page: 1, x: 62, y: 22, w: 30, h: 6 },
    calculation: null,
    confidence: 0.98,
    status: 'verified',
    editable: false,
    aiGenerated: true,
  },
];

export const heroTasks: Task[] = [
  {
    id: 'TSK001',
    returnId: 'R001',
    title: 'Upload W-2 from Meridian Retail (second employer)',
    owner: 'client',
    status: 'open',
    linkedThreadId: 'T001',
    dueDate: '2026-07-27',
  },
  {
    id: 'TSK002',
    returnId: 'R001',
    title: 'Confirm mailing address for filing copy',
    owner: 'client',
    status: 'open',
  },
  {
    id: 'TSK003',
    returnId: 'R002',
    title: 'Review Schedule C supply expense calculation',
    owner: 'reviewer',
    status: 'open',
    linkedDocumentId: 'D005',
  },
  {
    id: 'TSK004',
    returnId: 'R003',
    title: 'Send return for e-signature',
    owner: 'preparer',
    status: 'open',
  },
];

export const heroThreads: MessageThread[] = [
  {
    id: 'T001',
    returnId: 'R001',
    subject: 'Missing W-2 — second employer',
    linkedDocumentId: undefined,
    linkedTaskId: 'TSK001',
    status: 'open',
    ownerAction: 'client',
    messages: [
      {
        id: 'M001',
        threadId: 'T001',
        authorId: 'U_ALEX',
        authorName: 'Alex Chen',
        authorRole: 'preparer',
        body: "Hi Jane — I see wages from Contoso, but your prior-year return also had a W-2 from Meridian Retail. Could you upload that one when you get a chance? It's the last document I need to finish your draft.",
        timestamp: '2026-07-12T15:04:00Z',
        internal: false,
      },
      {
        id: 'M002',
        threadId: 'T001',
        authorId: 'U_JANE',
        authorName: 'Jane Smith',
        authorRole: 'client',
        body: "Oh right, I left Meridian in March. I'll dig it up this weekend, sorry for the delay!",
        timestamp: '2026-07-12T19:41:00Z',
        internal: false,
      },
    ],
  },
  {
    id: 'T002',
    returnId: 'R002',
    subject: 'Internal: Schedule C expense confidence is low',
    linkedDocumentId: 'D005',
    linkedTaskId: 'TSK003',
    status: 'open',
    ownerAction: 'preparer',
    messages: [
      {
        id: 'M003',
        threadId: 'T002',
        authorId: 'U_SARAH',
        authorName: 'Sarah Johnson',
        authorRole: 'reviewer',
        body: 'The AI only tagged 14 of what look like ~20 candidate transactions on the Q4 statement as "office supplies" — confidence is 61%. Can you eyeball the statement before we lock this in? Not client-visible, just flagging internally.',
        timestamp: '2026-07-14T10:12:00Z',
        internal: true,
      },
      {
        id: 'M004',
        threadId: 'T002',
        authorId: 'U_ALEX',
        authorName: 'Alex Chen',
        authorRole: 'preparer',
        body: "Good catch, I'll go through the statement manually today and adjust the field before it moves back to you.",
        timestamp: '2026-07-14T11:30:00Z',
        internal: true,
      },
    ],
  },
];

export const onboardingQuestionnaire: QuestionnaireItem[] = [
  { id: 'Q1', question: 'What is your filing status?', helpText: 'Single, married filing jointly, etc.', status: 'answered' },
  { id: 'Q2', question: 'Do you have any dependents?', helpText: 'Children or other qualifying dependents.', status: 'answered' },
  { id: 'Q3', question: 'Did you receive unemployment income in 2025?', helpText: 'Reported on Form 1099-G.', status: 'pending' },
  { id: 'Q4', question: 'Did you sell any stocks, crypto, or property in 2025?', helpText: 'Triggers capital gains reporting.', status: 'pending' },
  { id: 'Q5', question: 'Do you rent or own your home?', helpText: 'Affects deduction eligibility.', status: 'pending' },
];

// ---------------------------------------------------------------------------
// Bulk-generated filler data — gives Challenges 07 and 09 real volume to be
// tested against (dozens of returns, ~200 documents) rather than a handful
// of demo rows. Deterministic seed keeps it stable across reloads.
// ---------------------------------------------------------------------------

const rand = mulberry32(20260724);

const firstNames = ['Maria', 'James', 'Linda', 'Robert', 'Patricia', 'Michael', 'Susan', 'David', 'Karen', 'John', 'Nancy', 'Daniel', 'Lisa', 'Paul', 'Betty', 'Mark', 'Sandra', 'Steven', 'Ashley', 'Kevin'];
const lastNames = ['Nguyen', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'White', 'Harris', 'Clark', 'Lewis', 'Young', 'Walker'];
const docTypes: DocumentType[] = ['W-2', '1099-NEC', '1099-INT', '1099-DIV', '1098', 'K-1', 'Receipt', 'Prior Return', 'Bank Statement', 'Other'];
const statuses: TaxReturn['status'][] = ['not_started', 'gathering_documents', 'in_preparation', 'in_review', 'ready_to_sign', 'filed'];
const staffPool = [
  { id: 'U_ALEX', name: 'Alex Chen' },
  { id: 'U_SARAH', name: 'Sarah Johnson' },
  { id: 'U_PRIYA', name: 'Priya Patel' },
];

const bulkReturns: TaxReturn[] = [];
const bulkDocuments: TaxDocument[] = [];

const BULK_COUNT = 58;
for (let i = 0; i < BULK_COUNT; i++) {
  const id = `R${100 + i}`;
  const clientName = `${pick(rand, firstNames)} ${pick(rand, lastNames)}`;
  const status = pick(rand, statuses);
  const staff = pick(rand, staffPool);
  const daysOut = randInt(rand, -5, 45);
  const due = new Date('2026-07-24');
  due.setDate(due.getDate() + daysOut);
  const progress =
    status === 'not_started' ? 0 :
    status === 'gathering_documents' ? randInt(rand, 5, 35) :
    status === 'in_preparation' ? randInt(rand, 35, 65) :
    status === 'in_review' ? randInt(rand, 65, 90) :
    status === 'ready_to_sign' ? randInt(rand, 90, 99) : 100;
  const blocked = status === 'gathering_documents' && rand() > 0.5;

  bulkReturns.push({
    id,
    clientId: `UB${i}`,
    clientName,
    entityType: rand() > 0.8 ? 'business' : 'individual',
    taxYear: 2025,
    status,
    preparerId: staff.id,
    preparerName: staff.name,
    reviewerId: status === 'in_review' || status === 'ready_to_sign' ? 'U_SARAH' : undefined,
    reviewerName: status === 'in_review' || status === 'ready_to_sign' ? 'Sarah Johnson' : undefined,
    dueDate: due.toISOString().slice(0, 10),
    progress,
    blockingIssue: blocked ? 'Awaiting client documents' : null,
    nextAction: {
      label:
        status === 'gathering_documents' ? 'Client to upload remaining documents' :
        status === 'in_preparation' ? 'Preparer to finish draft' :
        status === 'in_review' ? 'Reviewer to sign off' :
        status === 'ready_to_sign' ? 'Client signature required' :
        status === 'filed' ? 'No action — filed' : 'Kick off document collection',
      owner:
        status === 'gathering_documents' || status === 'ready_to_sign' ? 'client' :
        status === 'in_review' ? 'reviewer' : 'preparer',
    },
    documentIds: [],
    taskIds: [],
    threadIds: [],
  });

  const docCount = randInt(rand, 2, 6);
  for (let d = 0; d < docCount; d++) {
    const docId = `DB${i}_${d}`;
    bulkDocuments.push({
      id: docId,
      returnId: id,
      clientName,
      name: `${pick(rand, docTypes)}_${clientName.replace(' ', '_')}_${d + 1}.pdf`,
      type: pick(rand, docTypes),
      uploadedAt: '2026-07-' + String(randInt(rand, 1, 22)).padStart(2, '0'),
      pageCount: randInt(rand, 1, 6),
      status: pick(rand, ['processed', 'processed', 'processed', 'processing', 'needs_review'] as const),
      linkedFieldIds: [],
      linkedTaskIds: [],
    });
  }
}

export const allReturns: TaxReturn[] = [...heroReturns, ...bulkReturns];
export const allDocuments: TaxDocument[] = [...heroDocuments, ...bulkDocuments];
export const allTasks: Task[] = [...heroTasks];
export const allThreads: MessageThread[] = [...heroThreads];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getReturnById(id: string): TaxReturn | undefined {
  return allReturns.find((r) => r.id === id);
}

export function getDocumentsByReturn(returnId: string): TaxDocument[] {
  return allDocuments.filter((d) => d.returnId === returnId);
}

export function getDocumentById(id: string): TaxDocument | undefined {
  return allDocuments.find((d) => d.id === id);
}

export function getFieldsByReturn(returnId: string): ExtractedField[] {
  return heroExtractedFields.filter((f) => f.returnId === returnId);
}

export function getTasksByReturn(returnId: string): Task[] {
  return allTasks.filter((t) => t.returnId === returnId);
}

export function getThreadsByReturn(returnId: string): MessageThread[] {
  return allThreads.filter((t) => t.returnId === returnId);
}

export interface AssignmentOverride {
  preparerId: string;
  preparerName: string;
}

/** Merges an admin's in-session reassignment (if any) over the base mock preparer for a return. */
export function effectivePreparer(taxReturn: TaxReturn, overrides: Record<string, AssignmentOverride>): { id: string; name: string } {
  const override = overrides[taxReturn.id];
  return override ? { id: override.preparerId, name: override.preparerName } : { id: taxReturn.preparerId, name: taxReturn.preparerName };
}

export function getReturnsForRole(
  user: DemoUser,
  role: UserRole,
  overrides: Record<string, AssignmentOverride> = {}
): TaxReturn[] {
  if (role === 'client' || role === 'business_owner') {
    return allReturns.filter((r) => r.clientId === user.id);
  }
  if (role === 'admin') return allReturns;
  if (role === 'reviewer') return allReturns.filter((r) => r.reviewerId === user.id);
  // preparer / employee: both see what they're currently assigned to prepare
  // (including reassignments) — only Preparer shows up as a *new* assignment
  // target in the Admin's picker, see getAssignablePreparers() above.
  return allReturns.filter((r) => effectivePreparer(r, overrides).id === user.id);
}

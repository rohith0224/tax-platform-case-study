/**
 * Six roles: Client and Business Owner cover the two kinds of taxpayers;
 * Preparer is staff formally responsible for preparing returns (the only
 * role offered as a new assignment target in the Admin's reassign picker);
 * Employee is general firm staff — may already own returns from existing
 * data, but isn't offered as a *new* assignment target; Reviewer stays
 * distinct since second-review is a meaningfully different function;
 * Admin sees everything.
 */
export type UserRole = 'client' | 'business_owner' | 'preparer' | 'employee' | 'reviewer' | 'admin';

export const ROLE_LABELS: Record<UserRole, string> = {
  client: 'Client',
  business_owner: 'Business Owner',
  preparer: 'Preparer',
  employee: 'Employee',
  reviewer: 'Reviewer',
  admin: 'Firm Admin',
};

export const STAFF_ROLES: UserRole[] = ['preparer', 'employee', 'reviewer', 'admin'];
export const CLIENT_ROLES: UserRole[] = ['client', 'business_owner'];

export type Team = 'Prep Team' | 'Review Team' | 'Admin Team';

export interface DemoUser {
  id: string;
  name: string;
  roles: UserRole[];
  /** cosmetic team label shown next to staff, e.g. in the assign-to-preparer picker */
  team?: Team;
  /** returnId owned personally by this user, even if their primary role is staff */
  personalReturnId?: string;
  isFirstLogin?: boolean;
}

export type ReturnStatus =
  | 'not_started'
  | 'gathering_documents'
  | 'in_preparation'
  | 'in_review'
  | 'ready_to_sign'
  | 'filed'
  | 'complete';

export const STATUS_ORDER: ReturnStatus[] = [
  'not_started',
  'gathering_documents',
  'in_preparation',
  'in_review',
  'ready_to_sign',
  'filed',
  'complete',
];

export type ActionOwner = 'client' | 'preparer' | 'reviewer';

export interface TaxReturn {
  id: string;
  clientId: string;
  clientName: string;
  entityType: 'individual' | 'business';
  taxYear: number;
  status: ReturnStatus;
  preparerId: string;
  preparerName: string;
  reviewerId?: string;
  reviewerName?: string;
  dueDate: string;
  progress: number;
  blockingIssue: string | null;
  nextAction: { label: string; owner: ActionOwner };
  documentIds: string[];
  taskIds: string[];
  threadIds: string[];
}

export type DocumentType =
  | 'W-2'
  | '1099-NEC'
  | '1099-INT'
  | '1099-DIV'
  | '1098'
  | 'K-1'
  | 'Receipt'
  | 'Prior Return'
  | 'Bank Statement'
  | 'Other';

export interface TaxDocument {
  id: string;
  returnId: string;
  clientName: string;
  name: string;
  type: DocumentType;
  uploadedAt: string;
  pageCount: number;
  status: 'processed' | 'processing' | 'needs_review';
  linkedFieldIds: string[];
  linkedTaskIds: string[];
}

export interface SourceRegion {
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export type FieldStatus = 'unverified' | 'verified' | 'flagged';

export interface ExtractedField {
  id: string;
  returnId: string;
  formField: string;
  formLine: string;
  value: string;
  sourceDocumentId: string;
  sourceRegion: SourceRegion;
  calculation: string | null;
  confidence: number;
  status: FieldStatus;
  editable: boolean;
  aiGenerated: boolean;
}

export interface Task {
  id: string;
  returnId: string;
  title: string;
  owner: ActionOwner;
  status: 'open' | 'done';
  linkedDocumentId?: string;
  linkedThreadId?: string;
  dueDate?: string;
}

export interface Message {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  body: string;
  timestamp: string;
  internal: boolean;
}

export interface MessageThread {
  id: string;
  returnId: string;
  subject: string;
  linkedDocumentId?: string;
  linkedTaskId?: string;
  status: 'open' | 'resolved';
  ownerAction: 'client' | 'preparer';
  messages: Message[];
}

export interface QuestionnaireItem {
  id: string;
  question: string;
  helpText: string;
  status: 'answered' | 'pending';
}

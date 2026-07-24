export interface Message {
  id: string;
  threadId: string;
  author: string;
  authorRole: 'preparer' | 'client' | 'admin';
  text: string;
  timestamp: string;
  isInternal: boolean;
}

export interface MessageThread {
  id: string;
  returnId: string;
  subject: string;
  messages: Message[];
  outstandingRequest?: string;
  status: 'open' | 'resolved';
}

export const mockMessageThreads = {
  R001: [
    {
      id: 'T001',
      returnId: 'R001',
      subject: 'Missing W-2 Documents',
      messages: [
        {
          id: 'M001',
          threadId: 'T001',
          author: 'Alex Chen',
          authorRole: 'preparer' as const,
          text: 'Hi Jane, I need your W-2 from your employer to complete your return.',
          timestamp: '2026-08-12 10:30 AM',
          isInternal: false,
        },
      ],
      outstandingRequest: 'W-2 from employer',
      status: 'open' as const,
    },
  ],
};

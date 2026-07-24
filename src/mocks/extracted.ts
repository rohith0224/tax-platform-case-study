export type ExtractedStatus = 'unverified' | 'verified' | 'disputed';

export interface ExtractedField {
  id: string;
  field: string;
  value: number;
  confidence: number;
  source: string;
  sourceDocument: string;
  page: number;
  status: ExtractedStatus;
  aiGenerated: boolean;
  warning?: string;
}

export const mockExtractedData = {
  R001: [
    {
      id: 'ext_001',
      field: 'Wages, salaries, tips',
      value: 45000,
      confidence: 0.92,
      source: 'W-2 Form, Box 1',
      sourceDocument: 'W-2_2025.pdf',
      page: 1,
      status: 'unverified' as ExtractedStatus,
      aiGenerated: true,
    },
  ],
  R002: [
    {
      id: 'ext_002',
      field: 'Wages, salaries, tips',
      value: 62000,
      confidence: 0.95,
      source: 'W-2 Form, Box 1',
      sourceDocument: 'W-2_2025.pdf',
      page: 1,
      status: 'verified' as ExtractedStatus,
      aiGenerated: true,
    },
  ],
};

import type { TaxDocument } from '@/types';
import { heroExtractedFields } from '@/mocks/data';

const GENERIC_CONTENT_BY_TYPE: Record<string, string> = {
  'W-2': 'Standard W-2 wage and tax statement. Box 1 (wages), Box 2 (federal withholding), Box 3-6 (Social Security/Medicare wages and tax) are populated. Employer and employee identifying information present.',
  '1099-NEC': 'Form 1099-NEC reporting nonemployee compensation in Box 1. Payer and recipient TINs present. No tax withheld (Box 4 blank).',
  '1099-INT': 'Form 1099-INT reporting interest income in Box 1. Payer is a financial institution.',
  '1099-DIV': 'Form 1099-DIV reporting ordinary and qualified dividends in Boxes 1a/1b.',
  '1098': 'Form 1098 mortgage interest statement, reporting mortgage interest paid and outstanding principal balance.',
  'K-1': 'Schedule K-1 reporting the recipient\'s share of partnership/S-corp income, deductions, and credits.',
  Receipt: 'Scanned receipt showing a vendor name, date, line items, and a total amount.',
  'Prior Return': 'Prior-year tax return copy, used for reference and carryover items (e.g. prior AGI, carryover losses).',
  'Bank Statement': 'Multi-page bank statement showing a list of transactions with dates, descriptions, and amounts across the statement period.',
  Other: 'Supporting document without a more specific category.',
};

/**
 * Fabricates plausible "document content" for the summarize feature to
 * reason over, since there's no real OCR/parsing behind this prototype. Hero
 * documents get content grounded in their actual linked extracted fields so
 * the summary stays consistent with what the review screen shows; generated
 * filler documents get a generic per-type description.
 */
export function getDocumentContent(doc: TaxDocument): string {
  const linkedFields = heroExtractedFields.filter((f) => f.sourceDocumentId === doc.id);
  if (linkedFields.length > 0) {
    const fieldLines = linkedFields
      .map((f) => `- ${f.formField}: ${f.value}${f.calculation ? ` (derived: ${f.calculation})` : ''}`)
      .join('\n');
    return `${GENERIC_CONTENT_BY_TYPE[doc.type] ?? ''}\n\nValues extracted from this document:\n${fieldLines}`;
  }
  return `${GENERIC_CONTENT_BY_TYPE[doc.type] ?? GENERIC_CONTENT_BY_TYPE.Other} Uploaded ${doc.uploadedAt}, ${doc.pageCount} page(s), status: ${doc.status.replace('_', ' ')}. Client: ${doc.clientName}.`;
}

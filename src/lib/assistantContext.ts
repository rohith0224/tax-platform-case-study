import { getReturnById, getFieldsByReturn, getDocumentById } from '@/mocks/data';
import { STATUS_META } from './status';

/** Turns the current route into a short natural-language brief for the chat assistant's system prompt. */
export function describeContext(pathname: string): string {
  const returnMatch = pathname.match(/^\/returns\/([^/]+)(\/(review|messages))?/);
  if (returnMatch) {
    const taxReturn = getReturnById(returnMatch[1]);
    if (!taxReturn) return 'Viewing a return that could not be found.';
    const base = `Viewing ${taxReturn.clientName}'s ${taxReturn.taxYear} return. Status: ${STATUS_META[taxReturn.status].staffLabel}. ${
      taxReturn.blockingIssue ? `Blocked on: ${taxReturn.blockingIssue}. ` : ''
    }Next action (${taxReturn.nextAction.owner}): ${taxReturn.nextAction.label}.`;

    if (returnMatch[3] === 'review') {
      const fields = getFieldsByReturn(taxReturn.id);
      const fieldSummary = fields
        .map((f) => `${f.formField} = ${f.value} (${Math.round(f.confidence * 100)}% confidence, ${f.status})`)
        .join('; ');
      return `${base} On the source document review screen. Extracted fields: ${fieldSummary || 'none yet'}.`;
    }
    if (returnMatch[3] === 'messages') {
      return `${base} On the messages screen for this return.`;
    }
    return base;
  }

  const docMatch = pathname.match(/^\/documents\/([^/]+)/);
  if (docMatch) {
    const doc = getDocumentById(docMatch[1]);
    return doc ? `Viewing document "${doc.name}" (${doc.type}) for ${doc.clientName}.` : 'Viewing a document.';
  }

  if (pathname === '/') return 'On the dashboard / home screen.';
  if (pathname.startsWith('/returns')) return 'Browsing the list of returns.';
  if (pathname.startsWith('/documents')) return 'Browsing the documents list.';
  if (pathname.startsWith('/messages')) return 'Browsing their message inbox across all returns.';
  if (pathname.startsWith('/design-system')) return 'Looking at the interaction design guide (field affordances).';
  if (pathname.startsWith('/onboarding')) return 'Going through first-time onboarding as a brand-new client.';
  return '';
}

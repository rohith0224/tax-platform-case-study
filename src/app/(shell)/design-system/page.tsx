import Link from 'next/link';
import { Breadcrumbs } from '@/components/shell/Breadcrumbs';
import { Field, type FieldState } from '@/components/field/Field';

const EXAMPLES: { state: FieldState; label: string; value: string; meta: string }[] = [
  { state: 'editable', label: 'Filing status', value: 'Single', meta: 'You can change this at any time.' },
  { state: 'ai_unverified', label: 'Wages, salaries, tips', value: '$45,000.00', meta: '92% confidence · from W-2, page 1' },
  { state: 'flagged', label: 'Business expenses (supplies)', value: '$4,180.00', meta: '61% confidence · needs a second look' },
  { state: 'verified', label: 'Federal income tax withheld', value: '$5,200.00', meta: 'Verified by Alex Chen' },
  { state: 'locked', label: 'Total tax', value: '$8,412.00', meta: 'Calculated automatically from other fields' },
  { state: 'pending_approval', label: 'Home office deduction', value: '$1,200.00', meta: 'Submitted for reviewer approval' },
];

export default function DesignSystemPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'Interaction Guide' }]} />
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Clickable vs. Editable</h1>
      <p className="text-slate-500 mb-6 max-w-2xl">
        One visual language for every value shown on the platform — AI-generated, verified, locked, or awaiting
        approval — so the same badge and border always mean the same thing, no matter which screen you&apos;re on.
        Click any field below the way you would in the product.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {EXAMPLES.map((ex) => (
          <Field key={ex.state} label={ex.label} value={ex.value} state={ex.state} meta={ex.meta} />
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900 mb-3">How to read it</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          <li><strong className="text-slate-900">Editable</strong> — click the value to edit it inline. A pencil icon always means the field accepts input.</li>
          <li><strong className="text-slate-900">AI-extracted · unverified</strong> — the AI read this from a document. It&apos;s still editable, and the confidence score tells you how sure it is.</li>
          <li><strong className="text-slate-900">Needs review</strong> — flagged for a reason (usually low confidence). Still editable; resolving it clears the flag.</li>
          <li><strong className="text-slate-900">Verified</strong> — a human has confirmed this value. It locks to prevent accidental changes; click it to see who verified it and why it&apos;s locked.</li>
          <li><strong className="text-slate-900">Locked</strong> — never directly editable, usually because it&apos;s a calculation derived from other fields.</li>
          <li><strong className="text-slate-900">Pending approval</strong> — someone requested a change; it&apos;s frozen until a reviewer signs off.</li>
        </ul>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        This exact component is what powers the value cards on the{' '}
        <Link href="/returns/R001/review" className="text-teal-700 font-medium hover:underline">
          source document review screen
        </Link>{' '}
        — same states, same interactions, different context.
      </p>
    </div>
  );
}

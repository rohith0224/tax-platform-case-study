'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { getReturnById, getFieldsByReturn, getDocumentById } from '@/mocks/data';
import { Breadcrumbs } from '@/components/shell/Breadcrumbs';
import { Field } from '@/components/field/Field';
import { fieldStateFor } from '@/lib/fieldState';
import { AITrustPanel } from '@/components/AITrustPanel';
import { SourceChips, type SourceRef } from '@/components/SourceChips';
import { FileText, Calculator, Sparkles, Loader2 } from 'lucide-react';

interface ExplainState {
  loading: boolean;
  text?: string;
  sources?: SourceRef[];
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const taxReturn = getReturnById(id);
  const fields = getFieldsByReturn(id);
  const [selectedFieldId, setSelectedFieldId] = useState(fields[0]?.id);
  const [explanations, setExplanations] = useState<Record<string, ExplainState>>({});

  const explain = async (formField: string, formLine: string, value: string, fieldId: string) => {
    setExplanations((prev) => ({ ...prev, [fieldId]: { loading: true } }));
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formField, formLine, value }),
      });
      const data = await res.json();
      setExplanations((prev) => ({ ...prev, [fieldId]: { loading: false, text: data.explanation, sources: data.sources } }));
    } catch {
      setExplanations((prev) => ({ ...prev, [fieldId]: { loading: false, text: 'Could not reach the AI explanation service.' } }));
    }
  };

  if (!taxReturn) return <p className="text-slate-500">Return not found.</p>;
  if (fields.length === 0) return <p className="text-slate-500">No extracted fields for this return yet.</p>;

  const selectedField = fields.find((f) => f.id === selectedFieldId) ?? fields[0];
  const sourceDoc = getDocumentById(selectedField.sourceDocumentId);
  const region = selectedField.sourceRegion;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Returns', href: '/returns' },
          { label: taxReturn.clientName, href: `/returns/${taxReturn.id}` },
          { label: 'Review' },
        ]}
      />
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Source Document Review</h1>
      <p className="text-slate-500 mb-4">
        Click a field to see exactly where its value came from — down to the page and region.
      </p>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: mock document viewer with highlighted source region */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <FileText className="h-4 w-4 text-slate-400" /> {sourceDoc?.name}
            </p>
            <span className="text-xs text-slate-400">Page {region.page} of {sourceDoc?.pageCount}</span>
          </div>

          <div className="relative aspect-[8.5/11] w-full rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
            {/* stylized fake form lines to sell the "document" feel */}
            <div className="absolute inset-0 p-6 space-y-3 opacity-60">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="h-2 rounded bg-slate-200" style={{ width: `${40 + ((i * 13) % 50)}%` }} />
              ))}
            </div>
            <div
              className="absolute rounded-md border-2 border-teal-500 bg-teal-400/20 shadow-[0_0_0_4px_rgba(20,184,166,0.12)] transition-all duration-300"
              style={{
                left: `${region.x}%`,
                top: `${region.y}%`,
                width: `${region.w}%`,
                height: `${region.h}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">Mock document preview — highlighted region shows where this value was read from.</p>
        </div>

        {/* Right: field trace list */}
        <div className="space-y-3">
          {fields.map((field) => {
            const active = field.id === selectedField.id;
            const doc = getDocumentById(field.sourceDocumentId);
            return (
              <div
                key={field.id}
                onClick={() => setSelectedFieldId(field.id)}
                className={`cursor-pointer rounded-xl border-2 p-1 transition-colors ${active ? 'border-teal-500' : 'border-transparent'}`}
              >
                <Field
                  label={field.formLine}
                  value={field.value}
                  state={fieldStateFor(field)}
                  meta={`${Math.round(field.confidence * 100)}% confidence · from ${doc?.name}, page ${field.sourceRegion.page}`}
                />
                {field.calculation && (
                  <p className="mt-1.5 flex items-start gap-1.5 px-1 text-xs text-slate-500">
                    <Calculator className="mt-0.5 h-3 w-3 shrink-0" /> {field.calculation}
                  </p>
                )}

                {explanations[field.id]?.text ? (
                  <div className="mt-1.5 rounded-md bg-violet-50 px-2 py-1.5">
                    <p className="flex items-start gap-1.5 text-xs text-violet-800">
                      <Sparkles className="mt-0.5 h-3 w-3 shrink-0" /> {explanations[field.id].text}
                    </p>
                    <SourceChips sources={explanations[field.id].sources ?? []} />
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      explain(field.formField, field.formLine, field.value, field.id);
                    }}
                    disabled={explanations[field.id]?.loading}
                    className="mt-1.5 flex items-center gap-1.5 px-1 text-xs font-medium text-violet-700 hover:text-violet-900 disabled:opacity-50"
                  >
                    {explanations[field.id]?.loading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    What does this mean?
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <AITrustPanel returnId={taxReturn.id} />
      </div>
    </div>
  );
}

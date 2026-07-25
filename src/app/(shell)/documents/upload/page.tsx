'use client';

import { useRef, useState } from 'react';
import { useRole } from '@/context/RoleContext';
import { Breadcrumbs } from '@/components/shell/Breadcrumbs';
import { SourceChips, type SourceRef } from '@/components/SourceChips';
import type { UserRole } from '@/types';
import { ROLE_LABELS } from '@/types';
import { UploadCloud, FileText, Sparkles, Loader2, AlertTriangle } from 'lucide-react';

const ALLOWED_ROLES: UserRole[] = ['preparer', 'employee', 'admin', 'business_owner'];

interface KeyField {
  label: string;
  value: string;
}
interface ExtractionResult {
  documentType: string;
  keyFields: KeyField[];
  summary: string;
  sources: SourceRef[];
  totalPages: number;
  truncated: boolean;
}

export default function UploadDocumentPage() {
  const { activeRole } = useRole();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  const allowed = ALLOWED_ROLES.includes(activeRole);

  const extract = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/ai/extract-pdf', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong extracting this PDF.');
      } else {
        setResult(data);
      }
    } catch {
      setError('Could not reach the extraction service.');
    }
    setLoading(false);
  };

  if (!allowed) {
    return (
      <div>
        <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'Documents', href: '/documents' }, { label: 'Upload' }]} />
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="font-medium text-slate-900">Not available for this role</p>
          <p className="mt-1 text-sm text-slate-500">
            PDF upload &amp; extraction is available to Preparer, Employee, Admin, and Business Owner. You&apos;re
            currently viewing as {ROLE_LABELS[activeRole]}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'Documents', href: '/documents' }, { label: 'Upload' }]} />
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Upload &amp; Extract</h1>
      <p className="text-slate-500 mb-4 max-w-2xl">
        Upload a real PDF — this actually parses it (no fabricated data here) and asks the AI to pull out only the
        information worth reading, skipping boilerplate and legal text.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setResult(null);
            setError(null);
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-10 text-center hover:border-teal-400 hover:bg-teal-50/30"
        >
          {file ? (
            <>
              <FileText className="h-7 w-7 text-teal-700" />
              <span className="font-medium text-slate-900">{file.name}</span>
              <span className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB — click to choose a different file</span>
            </>
          ) : (
            <>
              <UploadCloud className="h-7 w-7 text-slate-400" />
              <span className="font-medium text-slate-700">Click to choose a PDF</span>
              <span className="text-xs text-slate-400">Max 8MB</span>
            </>
          )}
        </button>

        <button
          onClick={extract}
          disabled={!file || loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? 'Extracting…' : 'Extract with AI'}
        </button>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800">{result.documentType}</span>
            <span className="text-xs text-slate-400">
              {result.totalPages} page{result.totalPages === 1 ? '' : 's'} parsed{result.truncated ? ' (text truncated for length)' : ''}
            </span>
          </div>

          <p className="mt-3 text-sm text-slate-700">{result.summary}</p>
          <SourceChips sources={result.sources} />

          {result.keyFields.length > 0 && (
            <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {result.keyFields.map((f, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-slate-500">{f.label}</span>
                  <span className="font-medium text-slate-900">{f.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

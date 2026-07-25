'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import { useAssignments } from '@/context/AssignmentContext';
import { allDocuments, getReturnsForRole } from '@/mocks/data';
import { Breadcrumbs } from '@/components/shell/Breadcrumbs';
import { CLIENT_ROLES, type DocumentType, type UserRole } from '@/types';
import { Search, FileText, ChevronDown, ChevronRight, UploadCloud } from 'lucide-react';

const UPLOAD_ROLES: UserRole[] = ['preparer', 'employee', 'admin', 'business_owner'];
const PAGE_SIZE = 20;
const STATUS_STYLE: Record<string, string> = {
  processed: 'bg-emerald-50 text-emerald-700',
  processing: 'bg-blue-50 text-blue-700',
  needs_review: 'bg-amber-50 text-amber-800',
};

export default function DocumentsPage() {
  const { currentUser, activeRole } = useRole();
  const { overrides } = useAssignments();
  const isClientAudience = CLIENT_ROLES.includes(activeRole);
  const myReturns = getReturnsForRole(currentUser, activeRole, overrides);
  const myReturnIds = useMemo(() => new Set(myReturns.map((r) => r.id)), [myReturns]);

  const scoped = useMemo(() => allDocuments.filter((d) => myReturnIds.has(d.returnId)), [myReturnIds]);

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
  const [groupByClient, setGroupByClient] = useState(!isClientAudience);
  const [page, setPage] = useState(1);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const types = Array.from(new Set(scoped.map((d) => d.type))).sort();

  const filtered = scoped
    .filter((d) => (typeFilter === 'all' ? true : d.type === typeFilter))
    .filter((d) => `${d.name} ${d.clientName}`.toLowerCase().includes(query.toLowerCase()));

  const grouped = useMemo(() => {
    if (!groupByClient) return null;
    const map = new Map<string, typeof filtered>();
    for (const d of filtered) {
      if (!map.has(d.clientName)) map.set(d.clientName, []);
      map.get(d.clientName)!.push(d);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered, groupByClient]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const row = (d: (typeof filtered)[number]) => (
    <Link
      key={d.id}
      href={`/documents/${d.id}`}
      className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-slate-50"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <FileText className="h-4 w-4 shrink-0 text-slate-400" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{d.name}</p>
          {!groupByClient && <p className="text-xs text-slate-400">{d.clientName}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-slate-400">{d.type}</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[d.status]}`}>
          {d.status.replace('_', ' ')}
        </span>
      </div>
    </Link>
  );

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'Documents' }]} />
      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        {UPLOAD_ROLES.includes(activeRole) && (
          <Link
            href="/documents/upload"
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            <UploadCloud className="h-4 w-4" /> Upload &amp; Extract
          </Link>
        )}
      </div>
      <p className="text-slate-500 mb-4">{filtered.length} of {scoped.length} documents</p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search documents or client"
            className="rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm w-64 focus:border-teal-400 outline-none"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as DocumentType | 'all');
            setPage(1);
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="all">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {!isClientAudience && (
          <button
            onClick={() => setGroupByClient((g) => !g)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${groupByClient ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Group by client
          </button>
        )}
      </div>

      {groupByClient && grouped ? (
        <div className="space-y-3">
          {grouped.map(([client, docs]) => {
            const isCollapsed = collapsed.has(client);
            return (
              <div key={client} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <button
                  onClick={() =>
                    setCollapsed((prev) => {
                      const next = new Set(prev);
                      if (next.has(client)) next.delete(client);
                      else next.add(client);
                      return next;
                    })
                  }
                  className="flex w-full items-center gap-2 bg-slate-50 px-4 py-2 text-left text-sm font-medium text-slate-700"
                >
                  {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {client}
                  <span className="text-slate-400 font-normal">({docs.length})</span>
                </button>
                {!isCollapsed && <div className="divide-y divide-slate-100">{docs.map(row)}</div>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
          {paged.map(row)}
          {paged.length === 0 && <p className="p-6 text-center text-sm text-slate-400">No documents match your filters.</p>}
        </div>
      )}

      {!groupByClient && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-md border border-slate-200 px-3 py-1 disabled:opacity-40">
            Previous
          </button>
          <span className="text-slate-500">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-md border border-slate-200 px-3 py-1 disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { Waypoints, ArrowRight } from 'lucide-react';

interface Stop {
  n: string;
  title: string;
  tagline: string;
  detail: string;
  image: string;
  cta: { label: string; href: string };
  note?: string;
}

const STOPS: Stop[] = [
  {
    n: '01',
    title: 'Source Document Traceability',
    tagline: 'See exactly where every number on the return came from.',
    detail: 'Click any extracted value to see its source document highlighted — down to the exact page and region, plus the calculation trail for anything that isn’t a direct copy.',
    image: '01-traceability.png',
    cta: { label: 'Review Bob Johnson’s return', href: '/returns/R002/review' },
  },
  {
    n: '02',
    title: 'Client & CPA Collaboration',
    tagline: 'Conversations stay attached to the document or issue they’re about.',
    detail: 'Messages are tied to specific documents and tasks. Internal firm notes are visibly marked and structurally excluded from anything a client persona can load — not just hidden with CSS.',
    image: '02-collaboration.png',
    cta: { label: 'Open the internal thread on R002', href: '/returns/R002/messages' },
  },
  {
    n: '03',
    title: 'Where to Start',
    tagline: 'New clients get one clear next step, not a wall of navigation.',
    detail: 'A brand-new client is dropped straight into a focused, three-step flow — no sidebar, no dashboard, one task at a time — instead of the full product on day one.',
    image: '03-onboarding.png',
    cta: { label: 'Switch to Sam Rivera to see it live', href: '/' },
    note: 'Auto-triggers on first login — switch persona in the avatar menu, top right.',
  },
  {
    n: '04',
    title: 'Getting Lost in the App',
    tagline: 'Never lose your place moving between documents, tasks, and messages.',
    detail: 'Breadcrumbs use real names, not IDs, and the Related panel keeps every document, open task, and thread on a return one click away, no matter where you navigated in from.',
    image: '04-navigation.png',
    cta: { label: 'Open Jane Smith’s return', href: '/returns/R001' },
  },
  {
    n: '05',
    title: 'Role-Aware Experiences',
    tagline: 'The same product, reshaped for whoever’s using it.',
    detail: 'Same shell, same components — completely different sidebar, dashboard, and permissions depending on who’s logged in. Compare this client view against the dashboard further down the page.',
    image: '05-roles.png',
    cta: { label: 'Compare personas from the avatar menu', href: '/' },
  },
  {
    n: '06',
    title: 'Return Status & Progress',
    tagline: 'A status everyone reads the same way, client and staff alike.',
    detail: 'One status field, two renderings: a five-stage plain-English timeline for clients, a detailed status badge for staff — always in sync, never two sources of truth.',
    image: '06-status.png',
    cta: { label: 'View as Jane Smith', href: '/returns/R001' },
  },
  {
    n: '07',
    title: 'An Actionable Dashboard',
    tagline: 'Always know what to work on next.',
    detail: 'Returns ranked by a real scoring function — overdue beats blocked beats "it’s your turn" beats due-this-week — not just sorted by date.',
    image: '07-dashboard.png',
    cta: { label: 'View the Preparer dashboard', href: '/' },
  },
  {
    n: '08',
    title: 'Clickable vs. Editable',
    tagline: 'One consistent way to tell what you can touch, and what you can’t.',
    detail: 'One component, six states — editable, AI-extracted, verified, flagged, locked, pending approval — used identically on this legend page and on the live review screen.',
    image: '08-affordances.png',
    cta: { label: 'Open the Interaction Guide', href: '/design-system' },
  },
  {
    n: '09',
    title: 'Complexity Made Navigable',
    tagline: 'Hundreds of documents, still easy to find what you need.',
    detail: 'Around 260 generated documents, with search, a type filter, and collapsible group-by-client — proving the pattern holds at volume, not just against five demo rows.',
    image: '09-scale.png',
    cta: { label: 'Browse all documents', href: '/documents' },
  },
  {
    n: '10',
    title: 'Trustworthy AI',
    tagline: 'AI you can actually verify, not just trust blindly.',
    detail: 'A live Groq call reasons over the return’s data, grounded by a retrieval step over a small knowledge base — sources shown, confidence scored, and nothing applies without a human confirming it.',
    image: '10-trustworthy-ai.png',
    cta: { label: 'Generate live review notes', href: '/returns/R002/review' },
  },
];

export default function TourPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Waypoints className="h-5 w-5 text-teal-700" /> Clearline
          </div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Product Walkthrough</h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            A tour through Clearline&apos;s core screens, one at a time. Screenshots below are captured live from the
            running app — not mockups. Click through to try each one yourself.
          </p>
        </div>
      </header>

      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {STOPS.map((s) => (
            <a key={s.n} href={`#s${s.n}`} className="text-xs font-medium text-slate-500 hover:text-teal-700">
              {s.n} · {s.title}
            </a>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-10 space-y-14">
        {STOPS.map((s) => (
          <section key={s.n} id={`s${s.n}`} className="scroll-mt-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl font-bold text-slate-200 leading-none pt-0.5">{s.n}</span>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-900">{s.title}</h2>
                <p className="text-sm italic text-slate-500 mt-0.5">{s.tagline}</p>
                <p className="mt-3 text-slate-700 max-w-2xl">{s.detail}</p>
                {s.note && <p className="mt-1 text-xs text-slate-400">{s.note}</p>}
                <Link
                  href={s.cta.href}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-900"
                >
                  {s.cta.label} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <Image
                src={`/tour/${s.image}`}
                alt={`${s.title} screenshot`}
                width={1280}
                height={800}
                className="w-full h-auto"
              />
            </div>
          </section>
        ))}
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-400">
        Clearline — AI-Powered Tax Platform
      </footer>
    </div>
  );
}

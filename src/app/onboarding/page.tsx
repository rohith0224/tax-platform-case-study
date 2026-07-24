'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { onboardingQuestionnaire } from '@/mocks/data';
import { Check, Sparkles, Upload, FileCheck2, Waypoints } from 'lucide-react';

const STEPS = ['Quick questions', 'Upload documents', "You're set"];

export default function OnboardingPage() {
  const router = useRouter();
  const { currentUser, completeOnboarding } = useRole();
  const [step, setStep] = useState(0);
  const [answered, setAnswered] = useState(new Set(onboardingQuestionnaire.filter((q) => q.status === 'answered').map((q) => q.id)));
  const [uploaded, setUploaded] = useState<string[]>([]);

  const finish = () => {
    completeOnboarding();
    router.push('/');
  };

  const pendingCount = onboardingQuestionnaire.length - answered.size;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex items-center gap-2 px-6 py-4 font-semibold text-slate-900">
        <Waypoints className="h-5 w-5 text-teal-700" /> Clearline
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pt-8">
        <div className="w-full max-w-xl">
          <div className="mb-6 flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    i < step ? 'bg-teal-700 text-white' : i === step ? 'border-2 border-teal-700 text-teal-700' : 'border border-slate-300 text-slate-400'
                  }`}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={`text-xs ${i === step ? 'font-semibold text-slate-900' : 'text-slate-400'}`}>{label}</span>
                {i < STEPS.length - 1 && <div className="h-px flex-1 bg-slate-200" />}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {step === 0 && (
              <>
                <h1 className="text-2xl font-bold text-slate-900">Welcome, {currentUser.name.split(' ')[0]}</h1>
                <p className="mt-1 text-slate-500">
                  A few quick questions get your return started. Takes about 2 minutes — you can leave the rest for later.
                </p>
                <ul className="mt-6 space-y-2">
                  {onboardingQuestionnaire.map((q) => {
                    const done = answered.has(q.id);
                    return (
                      <li key={q.id}>
                        <button
                          onClick={() => setAnswered((prev) => new Set(prev).add(q.id))}
                          disabled={done}
                          className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left ${
                            done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 hover:border-teal-300'
                          }`}
                        >
                          <span>
                            <span className="block text-sm font-medium text-slate-900">{q.question}</span>
                            <span className="block text-xs text-slate-500">{q.helpText}</span>
                          </span>
                          {done ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : <span className="shrink-0 text-xs font-medium text-teal-700">Answer</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <button
                  onClick={() => setStep(1)}
                  className="mt-6 w-full rounded-lg bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Continue{pendingCount > 0 ? ` — ${pendingCount} left, that's okay` : ''}
                </button>
              </>
            )}

            {step === 1 && (
              <>
                <h1 className="text-2xl font-bold text-slate-900">Upload what you have</h1>
                <p className="mt-1 text-slate-500">Start with whatever&apos;s handy. We&apos;ll ask for anything else as we go.</p>
                <div className="mt-6 space-y-2">
                  {['Prior year tax return', 'W-2 from your employer', 'Any 1099s you received'].map((label) => {
                    const done = uploaded.includes(label);
                    return (
                      <button
                        key={label}
                        onClick={() => setUploaded((prev) => (done ? prev : [...prev, label]))}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left ${
                          done ? 'border-emerald-200 bg-emerald-50' : 'border-dashed border-slate-300 hover:border-teal-300'
                        }`}
                      >
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
                          {done ? <FileCheck2 className="h-4 w-4 text-emerald-600" /> : <Upload className="h-4 w-4 text-slate-400" />}
                          {label}
                        </span>
                        <span className="text-xs font-medium text-teal-700">{done ? 'Uploaded' : 'Simulate upload'}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 flex gap-2">
                  <button onClick={() => setStep(0)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600">
                    Back
                  </button>
                  <button onClick={() => setStep(2)} className="flex-1 rounded-lg bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
                    Continue
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
                  <Sparkles className="h-6 w-6 text-teal-700" />
                </div>
                <h1 className="text-center text-2xl font-bold text-slate-900">You&apos;re all set</h1>
                <p className="mt-1 text-center text-slate-500">
                  Alex Chen has been assigned as your preparer and has been notified. Your dashboard will keep you posted as things move.
                </p>
                <button onClick={finish} className="mt-6 w-full rounded-lg bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
                  Enter Clearline
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

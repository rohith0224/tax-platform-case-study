'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { getUserById } from '@/mocks/data';
import type { AssignmentOverride } from '@/mocks/data';

interface AssignmentContextValue {
  overrides: Record<string, AssignmentOverride>;
  assignReturn: (returnId: string, employeeId: string) => void;
}

const AssignmentContext = createContext<AssignmentContextValue | null>(null);

export function AssignmentProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, AssignmentOverride>>({});

  const value = useMemo<AssignmentContextValue>(
    () => ({
      overrides,
      assignReturn: (returnId: string, employeeId: string) => {
        const employee = getUserById(employeeId);
        if (!employee) return;
        setOverrides((prev) => ({ ...prev, [returnId]: { preparerId: employee.id, preparerName: employee.name } }));
      },
    }),
    [overrides]
  );

  return <AssignmentContext.Provider value={value}>{children}</AssignmentContext.Provider>;
}

export function useAssignments(): AssignmentContextValue {
  const ctx = useContext(AssignmentContext);
  if (!ctx) throw new Error('useAssignments must be used within AssignmentProvider');
  return ctx;
}

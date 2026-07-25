'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { demoUsers, getUserById } from '@/mocks/data';
import type { DemoUser, UserRole } from '@/types';

interface RoleContextValue {
  currentUser: DemoUser;
  activeRole: UserRole;
  allUsers: DemoUser[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  needsOnboarding: boolean;
  completeOnboarding: () => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

const STORAGE_KEY = 'tax-platform-demo-persona';

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState('U_ALEX');
  const [activeRole, setActiveRole] = useState<UserRole>('preparer');
  const [onboarded, setOnboarded] = useState<Set<string>>(new Set());

  useEffect(() => {
    // localStorage isn't available during SSR, so the persisted demo persona
    // can only be restored post-mount (intentionally after the initial
    // hydration pass, to keep server/client markup identical).
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { userId: savedUser, activeRole: savedRole } = JSON.parse(saved);
        if (getUserById(savedUser)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setUserId(savedUser);
          setActiveRole(savedRole);
        }
      } catch {
        /* ignore malformed storage */
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, activeRole }));
  }, [userId, activeRole]);

  const currentUser = getUserById(userId) ?? demoUsers[0];

  const value = useMemo<RoleContextValue>(
    () => ({
      currentUser,
      activeRole,
      allUsers: demoUsers,
      switchUser: (id: string) => {
        const user = getUserById(id);
        if (!user) return;
        setUserId(id);
        setActiveRole(user.roles[0]);
      },
      switchRole: (role: UserRole) => {
        if (currentUser.roles.includes(role)) setActiveRole(role);
      },
      needsOnboarding: Boolean(currentUser.isFirstLogin) && !onboarded.has(currentUser.id),
      completeOnboarding: () => setOnboarded((prev) => new Set(prev).add(currentUser.id)),
    }),
    [currentUser, activeRole, onboarded]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}

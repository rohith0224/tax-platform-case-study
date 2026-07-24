import { CLIENT_ROLES, type UserRole } from '@/types';
import { LayoutDashboard, FileStack, MessagesSquare, FolderOpen, MousePointerClick } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const CLIENT_NAV: NavItem[] = [
  { label: 'Home', href: '/', icon: LayoutDashboard },
  { label: 'Documents', href: '/documents', icon: FolderOpen },
  { label: 'Messages', href: '/messages', icon: MessagesSquare },
];

const STAFF_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Returns', href: '/returns', icon: FileStack },
  { label: 'Documents', href: '/documents', icon: FolderOpen },
  { label: 'Messages', href: '/messages', icon: MessagesSquare },
  { label: 'Interaction Guide', href: '/design-system', icon: MousePointerClick },
];

export function navForRole(role: UserRole): NavItem[] {
  return CLIENT_ROLES.includes(role) ? CLIENT_NAV : STAFF_NAV;
}

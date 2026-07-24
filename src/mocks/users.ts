export type UserRole = 'preparer' | 'reviewer' | 'client' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export const mockUsers = {
  preparer: { id: 'U001', name: 'Alex Chen', role: 'preparer' as UserRole },
  reviewer: { id: 'U002', name: 'Sarah Johnson', role: 'reviewer' as UserRole },
  client: { id: 'U003', name: 'Jane Smith', role: 'client' as UserRole },
  admin: { id: 'U004', name: 'Mike Davis', role: 'admin' as UserRole },
};

export const roleLabels = {
  preparer: 'Tax Preparer',
  reviewer: 'Reviewer',
  client: 'Client',
  admin: 'Firm Admin',
};

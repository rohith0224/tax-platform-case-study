import type { Metadata } from 'next';
import './globals.css';
import { RoleProvider } from '@/context/RoleContext';
import { AssignmentProvider } from '@/context/AssignmentContext';
import { ChatWidget } from '@/components/ChatWidget';

export const metadata: Metadata = {
  title: 'Clearline — Tax Platform',
  description: 'AI-powered tax platform case study prototype',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <RoleProvider>
          <AssignmentProvider>
            {children}
            <ChatWidget />
          </AssignmentProvider>
        </RoleProvider>
      </body>
    </html>
  );
}

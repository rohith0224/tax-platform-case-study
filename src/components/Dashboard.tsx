'use client';

import { useState } from 'react';
import { mockReturns } from '../mocks/returns';

const statusLabels = {
  gathering_docs: 'Gathering Documents',
  under_review: 'Under Review',
  ready_to_sign: 'Ready to Sign',
  complete: 'Complete',
};

function ReturnCard({ taxReturn, userRole }) {
  const showInternalFields = userRole === 'preparer' || userRole === 'admin';

  const handleClick = () => {
    console.log('Card clicked!', taxReturn.id);
    window.location.href = `/return/${taxReturn.id}`;
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '16px',
        borderRadius: '8px',
        cursor: 'pointer',
        backgroundColor: '#f3f4f6',
        border: '2px solid #2563eb',
        marginBottom: '12px',
        width: '100%',
        textAlign: 'left',
        fontFamily: 'inherit',
      }}
    >
      <h3 style={{ fontWeight: 'bold', fontSize: '18px', margin: '0 0 8px 0' }}>{taxReturn.clientName}</h3>
      <p style={{ margin: '4px 0', fontSize: '14px' }}>Status: <strong>{statusLabels[taxReturn.status]}</strong></p>
      <p style={{ margin: '4px 0', fontSize: '14px' }}>Due: {taxReturn.dueDate}</p>
      {showInternalFields && <p style={{ margin: '4px 0', fontSize: '14px' }}>Owned by: {taxReturn.ownedBy}</p>}
      {taxReturn.blockingIssue && (
        <p style={{ margin: '8px 0', fontSize: '14px', color: '#991b1b', backgroundColor: '#fee2e2', padding: '8px', borderRadius: '4px' }}>
          ⚠️ Blocked: {taxReturn.blockingIssue}
        </p>
      )}
      <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>{taxReturn.progress}% complete</p>
    </button>
  );
}

export default function Dashboard() {
  const [userRole, setUserRole] = useState('preparer');

  const sortedReturns = [...mockReturns].sort((a, b) => {
    const urgencyScore = { high: 3, medium: 2, low: 1 };
    if (urgencyScore[a.urgency] !== urgencyScore[b.urgency]) {
      return urgencyScore[b.urgency] - urgencyScore[a.urgency];
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const roles = ['preparer', 'reviewer', 'client', 'admin'];
  const labels = { preparer: 'Tax Preparer', reviewer: 'Reviewer', client: 'Client', admin: 'Firm Admin' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '24px' }}>
      <div style={{ maxWidth: '896px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb', padding: '16px', display: 'flex', gap: '8px', marginBottom: '24px', borderRadius: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>View as: {userRole}</span>
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => {
                console.log('Role switched to:', role);
                setUserRole(role);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                backgroundColor: userRole === role ? '#2563eb' : '#fff',
                color: userRole === role ? '#fff' : '#374151',
                border: userRole === role ? 'none' : '1px solid #d1d5db',
              }}
            >
              {labels[role]}
            </button>
          ))}
        </div>

        <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>
          {userRole === 'preparer' && 'Your Returns to Prepare'}
          {userRole === 'reviewer' && 'Returns to Review'}
          {userRole === 'client' && 'Your Tax Returns'}
          {userRole === 'admin' && 'Firm Overview'}
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>Click a return to view details</p>

        <div>
          {sortedReturns.map((taxReturn) => (
            <ReturnCard
              key={taxReturn.id}
              taxReturn={taxReturn}
              userRole={userRole}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

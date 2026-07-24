'use client';

export function RoleSwitcher({ current, onSwitch }) {
  const roles = ['preparer', 'reviewer', 'client', 'admin'];
  const labels = {
    preparer: 'Tax Preparer',
    reviewer: 'Reviewer',
    client: 'Client',
    admin: 'Firm Admin',
  };

  return (
    <div className="bg-gray-100 border-b p-4 flex gap-2">
      <span className="text-sm font-medium text-gray-700">View as:</span>
      {roles.map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => {
            console.log('Clicked:', role);
            onSwitch(role);
          }}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            border: current === role ? 'none' : '1px solid #ccc',
            backgroundColor: current === role ? '#2563eb' : '#fff',
            color: current === role ? '#fff' : '#374151',
          }}
        >
          {labels[role]}
        </button>
      ))}
    </div>
  );
}

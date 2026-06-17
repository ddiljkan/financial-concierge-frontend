import React from 'react';
import logo from '../assets/Logo-FinCon.png';

export function Sidebar({ currentSection, onNavigate, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'accounts', label: 'Accounts', icon: '💳' },
    { id: 'budget', label: 'Budget', icon: '📉' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[var(--color-border)] glass">
      {/* Brand */}
      <div className="flex h-20 items-center gap-3 px-6">
        <img src={logo} alt="Financial Concierge Logo" className="h-8 w-auto object-contain" />
        <span className="font-display text-lg font-bold tracking-tight text-white">
          Financial Concierge
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
              currentSection === item.id
                ? 'bg-[var(--color-primary-highlight)] text-[var(--color-primary)]'
                : 'text-[var(--color-text-muted)] hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] hover:text-white'
            }`}
          >
            <span className="text-lg opacity-80">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-[var(--color-border)] p-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-[var(--color-primary)] font-semibold">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-white">{user?.name || 'User'}</span>
            <span className="truncate text-xs text-[var(--color-text-faint)]">{user?.email || ''}</span>
          </div>
          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Abmelden"
              className="grid h-8 w-8 place-items-center rounded-lg text-[var(--color-text-faint)] transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

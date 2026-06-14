import React from 'react';
import logo from '../assets/Logo-FinCon.png';

export function Sidebar({ currentSection, onNavigate, user }) {
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
        <div className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-[var(--color-primary)]">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-white">{user?.name || 'User'}</span>
            <span className="truncate text-xs text-[var(--color-text-faint)]">{user?.email || 'user@example.com'}</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-text-faint)]">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </aside>
  );
}

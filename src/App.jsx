import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { SettingsModal } from './components/SettingsModal';
import { Sidebar } from './components/Sidebar';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentMonth, setCurrentMonth] = useState('');
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    // Initialisiere currentMonth mit dem aktuellen Monat
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    setCurrentMonth('2026-06');
    
    // Check if profile is complete
    setIsProfileComplete(!!localStorage.getItem('fc_profession'));
  }, []);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSettingsSave = () => {
    setIsProfileComplete(!!localStorage.getItem('fc_profession'));
    setRefreshTrigger(prev => prev + 1);
  };

  const handleNavigate = (sectionId) => {
    setCurrentSection(sectionId);
    if (sectionId === 'settings') {
      setIsSettingsOpen(true);
      // Optional: don't change section if it's just a modal
      setCurrentSection('dashboard');
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <a href="#main" className="absolute -left-[9999px] top-2 z-50 rounded-md bg-[var(--color-primary)] px-4 py-3 text-[var(--color-text-inverse)] focus:left-2">Skip to content</a>
      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentSection={currentSection} 
        onNavigate={handleNavigate}
        user={{ name: 'Alex R.', email: 'alex@example.com' }}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Optional Top Header for Mobile or extra actions */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-end px-8 glass border-b-0 border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]">
          <div className="flex items-center gap-4">
            <button className="text-[var(--color-text-muted)] hover:text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            </button>
            <div className="flex items-center gap-3">
              <img src="https://ui-avatars.com/api/?name=Alex+R&background=2dd4bf&color=fff" alt="User" className="h-10 w-10 rounded-full" />
              <div className="hidden flex-col md:flex">
                <span className="text-sm font-semibold text-white">Alex R.</span>
                <span className="text-xs text-[var(--color-text-muted)] cursor-pointer hover:text-white" onClick={() => setIsSettingsOpen(true)}>Settings</span>
              </div>
            </div>
          </div>
        </header>

        <main id="main" className="p-8">
          {currentSection === 'dashboard' && (
            <>
              {/* Optional Hero/UploadBox logic can go here or inside dashboard */}
              {/* We keep Hero for now as per original layout */}
              <div className="mb-8">
                 <Hero 
                    onUploadSuccess={handleUploadSuccess} 
                    isProfileComplete={isProfileComplete}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                 />
              </div>
              
              {currentMonth && (
                <Dashboard 
                  currentMonth={currentMonth} 
                  setCurrentMonth={setCurrentMonth} 
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  refreshTrigger={refreshTrigger}
                />
              )}
            </>
          )}
          {currentSection !== 'dashboard' && (
            <div className="flex h-[60vh] items-center justify-center text-[var(--color-text-muted)]">
              <div className="text-center">
                <span className="text-4xl mb-4 block">🚧</span>
                <h2 className="text-xl font-semibold text-white">Work in Progress</h2>
                <p>This section is not implemented yet.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={handleSettingsSave} 
      />
    </div>
  );
}

export default App;


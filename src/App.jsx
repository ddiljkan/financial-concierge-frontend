import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { SettingsModal } from './components/SettingsModal';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentMonth, setCurrentMonth] = useState('');

  useEffect(() => {
    // Initialisiere currentMonth mit dem aktuellen Monat (z.B. "2026-06")
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    // Für Mock-Daten-Demonstration erzwingen wir 2026-06, ansonsten das aktuelle Datum.
    setCurrentMonth('2026-06');
  }, []);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSettingsSave = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <a href="#main" className="absolute -left-[9999px] top-2 rounded-md bg-[var(--color-primary)] px-4 py-3 text-[var(--color-text-inverse)] focus:left-2">Skip to content</a>
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <main id="main">
        <Hero onUploadSuccess={handleUploadSuccess} />
        {currentMonth && (
          <Dashboard 
            currentMonth={currentMonth} 
            setCurrentMonth={setCurrentMonth} 
            onOpenSettings={() => setIsSettingsOpen(true)}
            refreshTrigger={refreshTrigger}
          />
        )}
      </main>

      <footer className="py-8 pb-10 text-[length:var(--text-sm)] text-[var(--color-text-faint)]">
        <div className="container mx-auto w-[min(1120px,calc(100%-2rem))]">
          Financial Concierge static website starter.
        </div>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={handleSettingsSave} 
      />
    </>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { SettingsModal } from './components/SettingsModal';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/LoginPage';
import { getCurrentUser, getIdToken, signOut, isAuthenticated as checkAuth } from './auth';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentMonth, setCurrentMonth] = useState('');
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  // ── Auth State ────────────────────────────────────────────
  const [authChecking, setAuthChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // { sub, email, name, taxInterest, profession }

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    setAuthChecking(true);
    try {
      const authenticated = await checkAuth();
      if (authenticated) {
        const userData = await getCurrentUser();
        setUser(userData);
        setLoggedIn(true);
        await seedProfileIfNeeded(userData);
      } else {
        setLoggedIn(false);
        setUser(null);
      }
    } catch {
      setLoggedIn(false);
      setUser(null);
    } finally {
      setAuthChecking(false);
    }
  };

  /**
   * Nach dem ersten Login: Cognito-Attribute (profession, taxInterest)
   * in das DynamoDB-Profil schreiben, falls noch nicht vorhanden.
   */
  const seedProfileIfNeeded = async (userData) => {
    if (!userData?.profession) return;

    const config = { apiBaseUrl: window.APP_CONFIG?.API_BASE_URL || '' };
    if (!config.apiBaseUrl || config.apiBaseUrl.includes('REPLACE_WITH_API_ID')) return;

    try {
      const token = await getIdToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      };

      // Check if profile already has profession
      const resp = await fetch(`${config.apiBaseUrl}/api/profile`, { headers });
      if (resp.ok) {
        const existing = await resp.json();
        if (existing.profession) return; // Already seeded
      }

      // Seed profile with Cognito attributes
      await fetch(`${config.apiBaseUrl}/api/profile`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          profession: userData.profession,
          taxInterest: userData.taxInterest,
        }),
      });
    } catch (e) {
      console.error('Failed to seed profile:', e);
    }
  };

  useEffect(() => {
    if (!loggedIn) return;

    // Initialisiere currentMonth mit dem aktuellen Monat
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${yyyy}-${mm}`);

    // Check if profile is complete
    setIsProfileComplete(!!localStorage.getItem('fc_profession'));
  }, [loggedIn]);

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

  const handleLoginSuccess = async () => {
    const userData = await getCurrentUser();
    setUser(userData);
    setLoggedIn(true);
    await seedProfileIfNeeded(userData);
  };

  const handleLogout = () => {
    signOut();
    setLoggedIn(false);
    setUser(null);
    setCurrentSection('dashboard');
  };

  // ── Auth Check Loading ────────────────────────────────────
  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"></div>
          <p className="text-sm text-[var(--color-text-muted)]">Wird geladen…</p>
        </div>
      </div>
    );
  }

  // ── Login Page ────────────────────────────────────────────
  if (!loggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // ── Authenticated App ─────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <a href="#main" className="absolute -left-[9999px] top-2 z-50 rounded-md bg-[var(--color-primary)] px-4 py-3 text-[var(--color-text-inverse)] focus:left-2">Skip to content</a>
      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentSection={currentSection} 
        onNavigate={handleNavigate}
        user={user ? { name: user.name, email: user.email } : { name: 'User', email: '' }}
        onLogout={handleLogout}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-end px-8 glass border-b-0 border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]">
          <div className="flex items-center gap-4">
            <button className="text-[var(--color-text-muted)] hover:text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-[var(--color-primary)] font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden flex-col md:flex">
                <span className="text-sm font-semibold text-white">{user?.name || 'User'}</span>
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

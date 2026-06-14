import React, { useState, useEffect } from 'react';

const CATEGORIES_LIST = [
  "Lebensmittel", "Getränke", "Gastronomie", "Drogerie & Hygiene", "Kosmetik & Beauty",
  "Haushaltsbedarf", "Wohnen & Einrichtung", "Transport", "Treibstoff", "Gesundheit",
  "Bekleidung", "Freizeit & Unterhaltung", "Elektronik", "Büro & Arbeitsmittel",
  "Geschenke & Aufmerksamkeiten", "Rabatte & Gutschriften", "Einkommen & Einzahlungen", "Pfand", "Sonstiges"
];

export function SettingsModal({ isOpen, onClose, onSave }) {
  const [monthlyBudget, setMonthlyBudget] = useState(1500);
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [profession, setProfession] = useState('');
  const [employmentType, setEmploymentType] = useState('Angestellt');
  const [country, setCountry] = useState('Österreich');
  const [homeOffice, setHomeOffice] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [hasSeparateWorkspace, setHasSeparateWorkspace] = useState(false);
  const [isSmallBusiness, setIsSmallBusiness] = useState(false);
  const [commutesToWork, setCommutesToWork] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const localMonthlyBudget = localStorage.getItem('fc_monthly_budget');
      const localBudgets = localStorage.getItem('fc_category_budgets');
      
      setMonthlyBudget(localMonthlyBudget ? parseFloat(localMonthlyBudget) : 1500);
      setCategoryBudgets(localBudgets ? JSON.parse(localBudgets) : {});

      // Load profile from API
      const fetchProfile = async () => {
        const config = { apiBaseUrl: window.APP_CONFIG?.API_BASE_URL || '' };
        if (config.apiBaseUrl && !config.apiBaseUrl.includes('REPLACE_WITH_API_ID')) {
          try {
            const resp = await fetch(`${config.apiBaseUrl}/api/profile`);
            if (resp.ok) {
              const data = await resp.json();
              setProfession(data.profession || '');
              setEmploymentType(data.employmentType || 'Angestellt');
              setCountry(data.country || 'Österreich');
              setHomeOffice(data.homeOffice || false);
              setIsStudent(data.isStudent || false);
              setHasSeparateWorkspace(data.hasSeparateWorkspace || false);
              setIsSmallBusiness(data.isSmallBusiness || false);
              setCommutesToWork(data.commutesToWork || false);
              setHasChildren(data.hasChildren || false);
            }
          } catch(e) { console.error("Failed to fetch profile", e); }
        } else {
            // Local fallback
            setProfession(localStorage.getItem('fc_profession') || '');
            setEmploymentType(localStorage.getItem('fc_employment') || 'Angestellt');
            setCountry(localStorage.getItem('fc_country') || 'Österreich');
            setHomeOffice(localStorage.getItem('fc_home_office') === 'true');
            setIsStudent(localStorage.getItem('fc_is_student') === 'true');
            setHasSeparateWorkspace(localStorage.getItem('fc_has_sep_workspace') === 'true');
            setIsSmallBusiness(localStorage.getItem('fc_is_small_business') === 'true');
            setCommutesToWork(localStorage.getItem('fc_commutes') === 'true');
            setHasChildren(localStorage.getItem('fc_has_children') === 'true');
        }
      };
      fetchProfile();
    }
  }, [isOpen]);

  const handleCategoryChange = (cat, val) => {
    setCategoryBudgets(prev => ({ ...prev, [cat]: parseFloat(val) || 0 }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    const config = {
      apiBaseUrl: window.APP_CONFIG?.API_BASE_URL || ''
    };
    const isConfigured = config.apiBaseUrl && !config.apiBaseUrl.includes('REPLACE_WITH_API_ID');
    
    let finalMonthlyBudget = monthlyBudget;
    let finalCategoryBudgets = categoryBudgets;

    if (isConfigured) {
      try {
        const resp = await fetch(`${config.apiBaseUrl}/api/budget`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            monthlyBudget: finalMonthlyBudget,
            categoryBudgets: finalCategoryBudgets
          })
        });

        if (!resp.ok) throw new Error(`Status ${resp.status}`);
        
        const result = await resp.json();
        finalMonthlyBudget = result.monthlyBudget;
        finalCategoryBudgets = result.categoryBudgets;

        // Save Profile
        await fetch(`${config.apiBaseUrl}/api/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            profession, employmentType, country, homeOffice, isStudent,
            hasSeparateWorkspace, isSmallBusiness, commutesToWork, hasChildren
          })
        });
      } catch (e) {
        console.error("Failed to save to API, saving locally", e);
        alert("Fehler beim Speichern in der Cloud. Werte wurden lokal im Browser gesichert.");
      }
    }

    localStorage.setItem('fc_profession', profession);
    localStorage.setItem('fc_employment', employmentType);
    localStorage.setItem('fc_country', country);
    localStorage.setItem('fc_home_office', homeOffice.toString());
    localStorage.setItem('fc_is_student', isStudent.toString());
    localStorage.setItem('fc_has_sep_workspace', hasSeparateWorkspace.toString());
    localStorage.setItem('fc_is_small_business', isSmallBusiness.toString());
    localStorage.setItem('fc_commutes', commutesToWork.toString());
    localStorage.setItem('fc_has_children', hasChildren.toString());

    localStorage.setItem('fc_monthly_budget', finalMonthlyBudget);
    localStorage.setItem('fc_category_budgets', JSON.stringify(finalCategoryBudgets));

    setSaving(false);
    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 opacity-100 backdrop-blur-sm transition-opacity duration-180">
      <div className="flex max-h-[85dvh] w-[min(500px,calc(100%-2rem))] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-divider)] px-6 py-4">
          <h3 className="font-display text-lg font-bold">Einstellungen</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-[var(--color-text-muted)] hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] hover:text-[var(--color-text)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex flex-col gap-6 overflow-y-auto px-6 py-6">
          
          <div className="flex flex-col gap-4 border-b border-[var(--color-divider)] pb-6">
            <h4 className="text-xs font-semibold uppercase tracking-[.08em] text-[var(--color-text-muted)]">Steuer-Profil (KI-Kontext)</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-[var(--color-text-muted)]">Beruf / Tätigkeit</label>
                <input
                  type="text"
                  className="min-h-[40px] w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-transparent focus:outline-2 focus:outline-[var(--color-primary)]"
                  placeholder="z.B. Softwareentwickler"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-[var(--color-text-muted)]">Anstellungsart</label>
                <select
                  className="min-h-[40px] w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-transparent focus:outline-2 focus:outline-[var(--color-primary)]"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                >
                  <option value="Angestellt">Angestellt</option>
                  <option value="Selbstständig">Selbstständig</option>
                  <option value="GmbH">GmbH</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-[var(--color-text-muted)]">Land</label>
                <select
                  className="min-h-[40px] w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-transparent focus:outline-2 focus:outline-[var(--color-primary)]"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="Österreich">Österreich</option>
                  <option value="Deutschland">Deutschland</option>
                  <option value="Schweiz">Schweiz</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-[var(--color-text-muted)]">Home-Office</label>
                <label className="flex min-h-[40px] w-full cursor-pointer items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm transition hover:border-[color-mix(in_srgb,var(--color-primary)_50%,transparent)]">
                  <span>Mache ich Home-Office?</span>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:ring-offset-1 focus:ring-offset-[var(--color-bg)]"
                    checked={homeOffice}
                    onChange={(e) => setHomeOffice(e.target.checked)}
                  />
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-[var(--color-text-muted)] flex items-center justify-between">
                  Separates Arbeitszimmer
                  <span className="group relative cursor-help text-[var(--color-primary)]" title="Ein separates, abschließbares Zimmer, das ausschließlich (zu >90%) beruflich genutzt wird. Eine Arbeitsecke im Wohnzimmer zählt nicht!">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  </span>
                </label>
                <label className="flex min-h-[40px] w-full cursor-pointer items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm transition hover:border-[color-mix(in_srgb,var(--color-primary)_50%,transparent)]">
                  <span>Ausschließlich beruflich genutzt?</span>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:ring-offset-1 focus:ring-offset-[var(--color-bg)]"
                    checked={hasSeparateWorkspace}
                    onChange={(e) => setHasSeparateWorkspace(e.target.checked)}
                  />
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-[var(--color-text-muted)]">Pendler</label>
                <label className="flex min-h-[40px] w-full cursor-pointer items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm transition hover:border-[color-mix(in_srgb,var(--color-primary)_50%,transparent)]">
                  <span>Regelmäßiger Fahrtweg?</span>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:ring-offset-1 focus:ring-offset-[var(--color-bg)]"
                    checked={commutesToWork}
                    onChange={(e) => setCommutesToWork(e.target.checked)}
                  />
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-[var(--color-text-muted)]">Kinder</label>
                <label className="flex min-h-[40px] w-full cursor-pointer items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm transition hover:border-[color-mix(in_srgb,var(--color-primary)_50%,transparent)]">
                  <span>Kinder im Haushalt?</span>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:ring-offset-1 focus:ring-offset-[var(--color-bg)]"
                    checked={hasChildren}
                    onChange={(e) => setHasChildren(e.target.checked)}
                  />
                </label>
              </div>
              {employmentType !== 'Angestellt' && (
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold text-[var(--color-text-muted)]">Kleinunternehmer</label>
                  <label className="flex min-h-[40px] w-full cursor-pointer items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm transition hover:border-[color-mix(in_srgb,var(--color-primary)_50%,transparent)]">
                    <span>Kein Vorsteuerabzug?</span>
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:ring-offset-1 focus:ring-offset-[var(--color-bg)]"
                      checked={isSmallBusiness}
                      onChange={(e) => setIsSmallBusiness(e.target.checked)}
                    />
                  </label>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-[var(--color-text-muted)]">Studium</label>
                <label className="flex min-h-[40px] w-full cursor-pointer items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm transition hover:border-[color-mix(in_srgb,var(--color-primary)_50%,transparent)]">
                  <span>Bin ich Student/in?</span>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:ring-offset-1 focus:ring-offset-[var(--color-bg)]"
                    checked={isStudent}
                    onChange={(e) => setIsStudent(e.target.checked)}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-[.08em] text-[var(--color-text-muted)]">Budgets</h4>
            <label htmlFor="inputMonthlyBudget" className="mt-2 text-[11px] font-semibold text-[var(--color-text-muted)]">Gesamtes Monatsbudget (EUR)</label>
            <input
              type="number"
              id="inputMonthlyBudget"
              className="min-h-[40px] w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-transparent focus:outline-2 focus:outline-[var(--color-primary)]"
              placeholder="z.B. 1500"
              min="0"
              step="50"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
            />
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-[.08em] text-[var(--color-text-muted)]">Kategorie-Budgets (EUR)</label>
            <p className="mb-2 text-xs text-[var(--color-text-muted)]">Hier können Sie individuelle Limits für die einzelnen Ausgabenkategorien festlegen.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CATEGORIES_LIST.map(cat => {
                if (cat === "Rabatte & Gutschriften" || cat === "Pfand" || cat === "Einkommen & Einzahlungen") return null;
                const val = categoryBudgets[cat] || 0;
                return (
                  <div key={cat} className="flex flex-col gap-2">
                    <label htmlFor={`budget-${cat}`} className="text-[11px] font-semibold text-[var(--color-text-muted)]">{cat}</label>
                    <input
                      type="number"
                      id={`budget-${cat}`}
                      className="min-h-[40px] w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-transparent focus:outline-2 focus:outline-[var(--color-primary)]"
                      value={val}
                      min="0"
                      step="10"
                      onChange={(e) => handleCategoryChange(cat, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[var(--color-divider)] bg-[var(--color-surface-2)] px-6 py-4">
          <button onClick={onClose} className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-text)_12%,transparent)] bg-[var(--color-surface)] px-4 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]">
            Abbrechen
          </button>
          <button onClick={handleSave} disabled={saving} className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-text-inverse)] shadow-md transition hover:bg-[var(--color-primary-hover)] disabled:opacity-70">
            {saving ? '⏳ Speichern...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const localMonthlyBudget = localStorage.getItem('fc_monthly_budget');
      const localBudgets = localStorage.getItem('fc_category_budgets');
      
      setMonthlyBudget(localMonthlyBudget ? parseFloat(localMonthlyBudget) : 1500);
      setCategoryBudgets(localBudgets ? JSON.parse(localBudgets) : {});
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
      } catch (e) {
        console.error("Failed to save budgets to API, saving locally", e);
        alert("Fehler beim Speichern in der Cloud. Werte wurden lokal im Browser gesichert.");
      }
    }

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
          <h3 className="font-display text-lg font-bold">Budgets verwalten</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-[var(--color-text-muted)] hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] hover:text-[var(--color-text)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="inputMonthlyBudget" className="text-xs font-semibold uppercase tracking-[.08em] text-[var(--color-text-muted)]">Gesamtes Monatsbudget (EUR)</label>
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

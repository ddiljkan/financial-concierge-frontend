import React, { useState, useEffect } from 'react';

const CATEGORY_ICONS = {
  "Lebensmittel": "🛒",
  "Getränke": "🥤",
  "Gastronomie": "🍽️",
  "Drogerie & Hygiene": "🧼",
  "Kosmetik & Beauty": "💄",
  "Haushaltsbedarf": "🧹",
  "Wohnen & Einrichtung": "🛋️",
  "Transport": "🚌",
  "Treibstoff": "⛽",
  "Gesundheit": "💊",
  "Bekleidung": "👕",
  "Freizeit & Unterhaltung": "🎮",
  "Elektronik": "💻",
  "Büro & Arbeitsmittel": "📁",
  "Geschenke & Aufmerksamkeiten": "🎁",
  "Rabatte & Gutschriften": "🏷️",
  "Einkommen & Einzahlungen": "💰",
  "Pfand": "🍾",
  "Sonstiges": "📦"
};

const getProgressClass = (percent) => {
  if (percent >= 100) return 'bg-[#dc2626]';
  if (percent >= 85) return 'bg-[#d97706]';
  return 'bg-[var(--color-primary)]';
};

const formatMonthLabel = (monthStr) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
};

const formatMonthShort = (monthStr) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('de-DE', { month: 'short' });
};

export function Dashboard({ currentMonth, setCurrentMonth, onOpenSettings, refreshTrigger }) {
  const [summaryData, setSummaryData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const config = {
        apiBaseUrl: window.APP_CONFIG?.API_BASE_URL || ''
      };
      const isConfigured = config.apiBaseUrl && !config.apiBaseUrl.includes('REPLACE_WITH_API_ID');
      
      let newSummary = null;
      let newHistory = null;
      let newExpenses = [];

      if (isConfigured) {
        try {
          const expensesResp = await fetch(`${config.apiBaseUrl}/api/expenses?month=${currentMonth}`);
          if (expensesResp.ok) {
            const data = await expensesResp.json();
            newExpenses = data.expenses || [];
          }
        } catch (e) { console.warn("Failed to fetch expenses", e); }
        try {
          const summaryResp = await fetch(`${config.apiBaseUrl}/api/expenses/summary?month=${currentMonth}`);
          if (summaryResp.ok) newSummary = await summaryResp.json();
        } catch (e) { console.warn("Failed to fetch summary", e); }
        
        try {
          const historyResp = await fetch(`${config.apiBaseUrl}/api/expenses/history?months=3`);
          if (historyResp.ok) newHistory = await historyResp.json();
        } catch (e) { console.warn("Failed to fetch history", e); }
      }

      // Mock Fallbacks
      if (!newSummary) {
        let totalSpent = currentMonth === '2026-06' ? 1245.80 : currentMonth === '2026-05' ? 1150.20 : 980.50;
        let categories = [];
        if (currentMonth === '2026-06') {
          categories = [
            { category: "Lebensmittel", total: 540.0 }, { category: "Transport", total: 180.0 },
            { category: "Gastronomie", total: 120.0 }, { category: "Freizeit & Unterhaltung", total: 95.0 },
            { category: "Haushaltsbedarf", total: 80.0 }, { category: "Sonstiges", total: 230.80 }
          ];
        } else if (currentMonth === '2026-05') {
          categories = [
            { category: "Lebensmittel", total: 510.0 }, { category: "Transport", total: 150.0 },
            { category: "Gastronomie", total: 90.0 }, { category: "Sonstiges", total: 400.20 }
          ];
        } else {
          // Fallback for April and others
          categories = [
            { category: "Lebensmittel", total: 450.0 }, { category: "Transport", total: 120.0 },
            { category: "Gastronomie", total: 80.0 }, { category: "Sonstiges", total: 330.50 }
          ];
        }
        
        const localMonthlyBudget = localStorage.getItem('fc_monthly_budget');
        const monthlyBudget = localMonthlyBudget ? parseFloat(localMonthlyBudget) : 1500.0;
        const localBudgets = localStorage.getItem('fc_category_budgets');
        const categoryBudgets = localBudgets ? JSON.parse(localBudgets) : {};
        
        newSummary = {
          totalSpent,
          monthlyBudget,
          budgetRemaining: Math.max(0, monthlyBudget - totalSpent),
          budgetUtilization: monthlyBudget > 0 ? (totalSpent / monthlyBudget * 100) : 0,
          categories: categories.map(cat => ({
            ...cat,
            budget: categoryBudgets[cat.category] || 0,
            budgetUtilization: (categoryBudgets[cat.category] || 0) > 0 ? (cat.total / categoryBudgets[cat.category] * 100) : 0
          }))
        };
      }
      
      if (!newHistory) {
        newHistory = {
          history: [
            { month: "2026-04", totalSpent: 980.50, categories: [{ category: "Lebensmittel", total: 450.0 }, { category: "Transport", total: 120.0 }, { category: "Gastronomie", total: 80.0 }] },
            { month: "2026-05", totalSpent: 1150.20, categories: [{ category: "Lebensmittel", total: 510.0 }, { category: "Transport", total: 150.0 }, { category: "Gastronomie", total: 90.0 }] },
            { month: "2026-06", totalSpent: 1245.80, categories: [{ category: "Lebensmittel", total: 540.0 }, { category: "Transport", total: 180.0 }, { category: "Gastronomie", total: 120.0 }] }
          ]
        };
      }
      
      if (!isConfigured && newExpenses.length === 0) {
         newExpenses = [
             { expenseId: '1', vendor: 'MediaMarkt', description: 'Laptop', category: 'Elektronik', amount: 1200.0, createdAt: '2026-06-10T14:30:00Z', taxDeductibility: 'HIGH_PROBABILITY', taxPercentage: 100, taxReasoning: 'Berufliche Nutzung als Entwickler.' },
             { expenseId: '2', vendor: 'Amazon', description: 'Bürostuhl', category: 'Wohnen & Einrichtung', amount: 350.0, createdAt: '2026-06-12T09:15:00Z', taxDeductibility: 'NEEDS_INFO', taxPercentage: 0, taxReasoning: 'Ist der Stuhl fürs Home-Office oder privat?' },
             { expenseId: '3', vendor: 'Netflix', description: 'Abo', category: 'Freizeit & Unterhaltung', amount: 15.0, createdAt: '2026-06-01T08:00:00Z', taxDeductibility: 'NOT_DEDUCTIBLE', taxPercentage: 0, taxReasoning: 'Privates Abo.' }
         ];
      }
      
      setSummaryData(newSummary);
      setHistoryData(newHistory);
      setExpenses(newExpenses);
      setLoading(false);
    }
    
    fetchData();
  }, [currentMonth, refreshTrigger]);

  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth === 0) { newMonth = 12; newYear -= 1; }
    setCurrentMonth(`${newYear}-${newMonth.toString().padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth === 13) { newMonth = 1; newYear += 1; }
    setCurrentMonth(`${newYear}-${newMonth.toString().padStart(2, '0')}`);
  };

  if (loading || !summaryData) {
    return <div className="py-16 text-center text-[var(--color-text-faint)]">Lade Dashboard...</div>;
  }

  const percent = Math.min(Math.round(summaryData.budgetUtilization), 100);
  const circleColor = percent >= 100 ? '#ef4444' : (percent >= 85 ? '#f59e0b' : 'var(--color-primary)');

  return (
    <section className="py-8 pb-16" id="dashboard">
      <div className="container mx-auto w-[min(1120px,calc(100%-2rem))]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-highlight)] px-3 py-2 text-[length:var(--text-xs)] font-bold uppercase tracking-[.08em] text-[var(--color-primary)]">Dashboard</span>
            <h2 className="mt-1 font-display text-[length:var(--text-lg)] font-bold">Monatsübersicht</h2>
          </div>
          <div className="flex items-center gap-3 rounded-full px-4 py-2 glass">
            <button onClick={handlePrevMonth} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span className="min-w-[120px] text-center text-[length:var(--text-sm)] font-semibold">{formatMonthLabel(currentMonth)}</span>
            <button onClick={handleNextMonth} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <button onClick={onOpenSettings} className="ml-2 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-highlight)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18m-9-9h18"/></svg>
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-4 rounded-2xl p-6 shadow-2xl glass relative overflow-hidden">
            {/* Soft inner glow */}
            <div className="absolute -inset-1 rounded-[inherit] border border-white/5 pointer-events-none"></div>
            <h3 className="text-[length:var(--text-sm)] font-semibold uppercase tracking-[.08em] text-[var(--color-text-muted)]">Monatsbudget</h3>
            <div className="flex flex-wrap items-center justify-around gap-6">
              <div className="relative h-[140px] w-[140px]">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path className="fill-none stroke-[color-mix(in_srgb,var(--color-text)_8%,transparent)] stroke-[3.8]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="fill-none stroke-[3.8] transition-all duration-600" style={{ stroke: circleColor }} strokeDasharray={`${percent}, 100`} strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-[1.1]">
                  <span className="font-display text-[length:var(--text-lg)] font-bold text-[var(--color-text)]">{percent}%</span>
                  <small className="text-[length:var(--text-xs)] text-[var(--color-text-muted)]">ausgegeben</small>
                </div>
              </div>
              <div className="flex min-w-[150px] grow flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[var(--color-divider)] pb-2">
                  <span className="text-[length:var(--text-xs)] text-[var(--color-text-muted)]">Ausgegeben</span>
                  <strong className="text-[length:var(--text-sm)] font-semibold">{(summaryData.totalSpent || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--color-divider)] pb-2">
                  <span className="text-[length:var(--text-xs)] text-[var(--color-text-muted)]">Budget</span>
                  <strong className="text-[length:var(--text-sm)] font-semibold">{(summaryData.monthlyBudget || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--color-divider)] pb-2">
                  <span className="text-[length:var(--text-xs)] text-[var(--color-text-muted)]">Verbleibend</span>
                  <strong className="text-[length:var(--text-sm)] font-semibold">{(summaryData.budgetRemaining || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl p-6 shadow-2xl glass relative overflow-hidden">
            {/* Soft inner glow */}
            <div className="absolute -inset-1 rounded-[inherit] border border-white/5 pointer-events-none"></div>
            <h3 className="text-[length:var(--text-sm)] font-semibold uppercase tracking-[.08em] text-[var(--color-text-muted)]">Kategorien</h3>
            <div className="flex max-h-[320px] flex-col gap-4 overflow-y-auto pr-2">
              {summaryData.categories && summaryData.categories.length > 0 ? (
                summaryData.categories.map((cat, idx) => {
                  const icon = CATEGORY_ICONS[cat.category] || "📦";
                  const percentVal = Math.min(Math.round(cat.budgetUtilization || 0), 100);
                  const progressColorClass = getProgressClass(cat.budgetUtilization);
                  return (
                    <div key={idx} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[length:var(--text-sm)]">
                        <span className="flex items-center gap-2 font-semibold"><span>{icon}</span> {cat.category}</span>
                        <span className="font-semibold">
                          {cat.total.toLocaleString('de-DE', { minimumFractionDigits: 2 })} EUR
                          {cat.budget > 0 && <span className="ml-1 text-[length:var(--text-xs)] font-normal text-[var(--color-text-faint)]"> / {cat.budget} EUR</span>}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                        <div className={`h-full rounded-full transition-all duration-600 ${progressColorClass}`} style={{ width: `${percentVal}%` }}></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-[var(--color-text-faint)]">Keine Ausgaben in diesem Monat.</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl p-6 shadow-2xl glass relative overflow-hidden">
          {/* Soft inner glow */}
          <div className="absolute -inset-1 rounded-[inherit] border border-white/5 pointer-events-none"></div>
          <h3 className="text-[length:var(--text-sm)] font-semibold uppercase tracking-[.08em] text-[var(--color-text-muted)]">Ausgaben-Historie (3 Monate)</h3>
          <div className="relative flex h-[260px] items-end justify-around border-b border-[var(--color-border)] pb-4 pt-8">
            {historyData && historyData.history ? (
              <>
                <div className="flex h-full w-full flex-col">
                  <div className="flex h-[180px] w-full items-end justify-around border-b border-[var(--color-border)] pb-2">
                    {(() => {
                      let maxVal = 100;
                      historyData.history.forEach(h => {
                        if (h.totalSpent > maxVal) maxVal = h.totalSpent;
                        (h.categories || []).forEach(c => { if (c.total > maxVal) maxVal = c.total; });
                      });
                      
                      return historyData.history.map((h, i) => {
                        const getCatVal = (name) => {
                          const found = (h.categories || []).find(c => c.category === name);
                          return found ? found.total : 0;
                        };
                        const valLeb = getCatVal("Lebensmittel");
                        const valTra = getCatVal("Transport");
                        const valGas = getCatVal("Gastronomie");
                        const label = formatMonthShort(h.month);
                        
                        return (
                          <div key={i} className="relative flex h-full max-w-[120px] grow flex-col items-center justify-end">
                            <div className="flex h-full w-full items-end justify-center gap-1.5">
                              <div className="relative min-h-[2px] w-[18px] rounded-t-sm transition-all duration-600 bg-[var(--color-primary)] group" style={{ height: `${(valLeb / maxVal) * 100}%` }}>
                                <div className="absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[var(--color-text)] px-2 py-1 text-[length:var(--text-xs)] text-[var(--color-bg)] shadow-sm group-hover:block z-10">Lebensmittel: {valLeb} EUR</div>
                              </div>
                              <div className="relative min-h-[2px] w-[18px] rounded-t-sm transition-all duration-600 bg-[#14b8a6] group" style={{ height: `${(valTra / maxVal) * 100}%` }}>
                                <div className="absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[var(--color-text)] px-2 py-1 text-[length:var(--text-xs)] text-[var(--color-bg)] shadow-sm group-hover:block z-10">Transport: {valTra} EUR</div>
                              </div>
                              <div className="relative min-h-[2px] w-[18px] rounded-t-sm transition-all duration-600 bg-[#ef4444] group" style={{ height: `${(valGas / maxVal) * 100}%` }}>
                                <div className="absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[var(--color-text)] px-2 py-1 text-[length:var(--text-xs)] text-[var(--color-bg)] shadow-sm group-hover:block z-10">Gastronomie: {valGas} EUR</div>
                              </div>
                            </div>
                            <span className="mt-3 text-[length:var(--text-xs)] font-semibold uppercase text-[var(--color-text-muted)]">{label}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-4">
                    <div className="flex items-center gap-2 text-[length:var(--text-xs)] text-[var(--color-text-muted)]"><div className="h-3 w-3 rounded-sm bg-[var(--color-primary)]"></div><span>Lebensmittel</span></div>
                    <div className="flex items-center gap-2 text-[length:var(--text-xs)] text-[var(--color-text-muted)]"><div className="h-3 w-3 rounded-sm bg-[#14b8a6]"></div><span>Transport</span></div>
                    <div className="flex items-center gap-2 text-[length:var(--text-xs)] text-[var(--color-text-muted)]"><div className="h-3 w-3 rounded-sm bg-[#ef4444]"></div><span>Gastronomie</span></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full py-8 text-center text-[var(--color-text-faint)]">Keine Verlaufsdaten vorhanden.</div>
            )}
          </div>
        </div>

        {/* Letzte Ausgaben Tabelle */}
        <div className="mt-6 flex flex-col gap-4 rounded-2xl p-6 shadow-2xl glass relative overflow-hidden">
          <div className="absolute -inset-1 rounded-[inherit] border border-white/5 pointer-events-none"></div>
          <h3 className="text-[length:var(--text-sm)] font-semibold uppercase tracking-[.08em] text-[var(--color-text-muted)]">Letzte Ausgaben</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--color-divider)] text-[var(--color-text-muted)]">
                <tr>
                  <th className="pb-3 font-semibold">Datum</th>
                  <th className="pb-3 font-semibold">Anbieter</th>
                  <th className="pb-3 font-semibold">Betrag</th>
                  <th className="pb-3 font-semibold">Kategorie</th>
                  <th className="pb-3 font-semibold text-right">Steuer-Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-divider)]">
                {expenses.length > 0 ? expenses.map(exp => (
                  <tr key={exp.expenseId} className="hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]">
                    <td className="py-3 pr-4 whitespace-nowrap">{new Date(exp.createdAt).toLocaleDateString('de-DE')}</td>
                    <td className="py-3 pr-4">
                      <div className="font-medium">{exp.vendor}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{exp.description}</div>
                    </td>
                    <td className="py-3 pr-4 font-semibold">{exp.amount.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}</td>
                    <td className="py-3 pr-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] px-2 py-0.5 text-xs">{CATEGORY_ICONS[exp.category] || "📦"} {exp.category}</span></td>
                    <td className="py-3 text-right">
                      {exp.taxDeductibility === 'HIGH_PROBABILITY' && <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500" title={exp.taxReasoning}>Absetzbar ({exp.taxPercentage}%)</span>}
                      {exp.taxDeductibility === 'NOT_DEDUCTIBLE' && <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-500" title={exp.taxReasoning}>Nicht absetzbar</span>}
                      {exp.taxDeductibility === 'NEEDS_INFO' && <button onClick={() => setSelectedExpense(exp)} className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-500 hover:bg-amber-500/20 transition shadow-sm">Info benötigt</button>}
                      {!exp.taxDeductibility && <span className="text-[var(--color-text-faint)] text-xs">-</span>}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="py-8 text-center text-[var(--color-text-faint)]">Keine Ausgaben in diesem Monat gefunden</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Needs Info Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 opacity-100 backdrop-blur-sm">
          <div className="w-[min(400px,calc(100%-2rem))] flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl p-6">
            <h3 className="font-display text-lg font-bold mb-2">Verwendungszweck angeben</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              <strong>{selectedExpense.vendor}</strong> ({selectedExpense.amount.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})})
              <br/><br/>
              <span className="text-amber-500">KI-Hinweis:</span> {selectedExpense.taxReasoning || "Bitte gib an, wofür dieser Betrag ausgegeben wurde."}
            </p>
            <textarea 
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-transparent focus:outline-2 focus:outline-[var(--color-primary)] mb-4"
              rows="3"
              placeholder="z.B. Zu 100% geschäftlich genutzt für Home Office"
              id="usagePurposeInput"
            ></textarea>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSelectedExpense(null)} className="rounded-full border border-[color-mix(in_srgb,var(--color-text)_12%,transparent)] px-4 py-2 text-sm font-semibold hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]">Abbrechen</button>
              <button onClick={() => {
                alert("Wird im nächsten Schritt an die API gesendet!");
                setSelectedExpense(null);
              }} className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-text-inverse)] hover:bg-[var(--color-primary-hover)]">Speichern</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

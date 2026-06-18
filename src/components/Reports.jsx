import React, { useState, useEffect, useMemo } from 'react';
import { getIdToken } from '../auth';

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

export function Reports() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [taxFilter, setTaxFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: 'receiptDate', direction: 'desc' });

  const [selectedExpense, setSelectedExpense] = useState(null);
  const [usagePurpose, setUsagePurpose] = useState("100% beruflich");
  const [isSavingUsage, setIsSavingUsage] = useState(false);
  const [refreshLocal, setRefreshLocal] = useState(0);

  useEffect(() => {
    async function fetchAllExpenses() {
      setLoading(true);
      const config = { apiBaseUrl: window.APP_CONFIG?.API_BASE_URL || '' };
      const isConfigured = config.apiBaseUrl && !config.apiBaseUrl.includes('REPLACE_WITH_API_ID');
      
      let allExpenses = [];
      
      if (isConfigured) {
        const token = await getIdToken();
        const authHeaders = token ? { Authorization: token } : {};
        
        // Fetch last 3 months for the demo
        const d = new Date();
        const months = [];
        for (let i = 0; i < 3; i++) {
          const date = new Date(d.getFullYear(), d.getMonth() - i, 1);
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          months.push(`${yyyy}-${mm}`);
        }
        
        try {
          const promises = months.map(m => 
            fetch(`${config.apiBaseUrl}/api/expenses?month=${m}`, { headers: authHeaders })
              .then(res => res.ok ? res.json() : { expenses: [] })
          );
          const results = await Promise.all(promises);
          results.forEach(res => {
            if (res.expenses) {
              allExpenses = [...allExpenses, ...res.expenses];
            }
          });
        } catch (e) {
          console.warn("Failed to fetch expenses for reports", e);
        }
      }

      // Mock Fallback
      if (!isConfigured || allExpenses.length === 0) {
        allExpenses = [
          { expenseId: '1', vendor: 'MediaMarkt', description: 'Laptop', category: 'Elektronik', amount: 1200.0, createdAt: '2026-06-10T14:30:00Z', receiptDate: '2026-06-10T14:30:00Z', taxDeductibility: 'HIGH_PROBABILITY', taxPercentage: 100 },
          { expenseId: '2', vendor: 'Amazon', description: 'Bürostuhl', category: 'Wohnen & Einrichtung', amount: 350.0, createdAt: '2026-06-12T09:15:00Z', receiptDate: '2026-06-12T09:15:00Z', taxDeductibility: 'NEEDS_INFO', taxPercentage: 0 },
          { expenseId: '3', vendor: 'Netflix', description: 'Abo', category: 'Freizeit & Unterhaltung', amount: 15.0, createdAt: '2026-06-01T08:00:00Z', receiptDate: '2026-06-01T08:00:00Z', taxDeductibility: 'NOT_DEDUCTIBLE', taxPercentage: 0 },
          { expenseId: '4', vendor: 'Rewe', description: 'Wocheneinkauf', category: 'Lebensmittel', amount: 85.50, createdAt: '2026-05-28T10:00:00Z', receiptDate: '2026-05-28T10:00:00Z', taxDeductibility: 'NOT_DEDUCTIBLE', taxPercentage: 0 },
          { expenseId: '5', vendor: 'Deutsche Bahn', description: 'Ticket Berlin', category: 'Transport', amount: 120.0, createdAt: '2026-05-15T11:00:00Z', receiptDate: '2026-05-15T11:00:00Z', taxDeductibility: 'PARTIAL', taxPercentage: 50 },
        ];
      }
      
      setExpenses(allExpenses);
      setLoading(false);
    }
    
    fetchAllExpenses();
  }, [refreshLocal]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses.filter(exp => {
      const search = filterText.toLowerCase();
      const vendorMatch = (exp.vendor || "").toLowerCase().includes(search);
      const descMatch = (exp.description || "").toLowerCase().includes(search);
      const catMatch = (exp.category || "").toLowerCase().includes(search);
      
      let taxMatch = true;
      if (taxFilter === 'deductible') {
        taxMatch = ['HIGH_PROBABILITY', 'PARTIAL'].includes(exp.taxDeductibility);
      } else if (taxFilter === 'not_rejected') {
        taxMatch = exp.taxDeductibility !== 'NOT_DEDUCTIBLE';
      } else if (taxFilter === 'needs_info') {
        taxMatch = exp.taxDeductibility === 'NEEDS_INFO';
      }

      return (vendorMatch || descMatch || catMatch) && taxMatch;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key] || "";
      let bVal = b[sortConfig.key] || "";
      
      if (sortConfig.key === 'receiptDate' || sortConfig.key === 'createdAt') {
        aVal = new Date(a.receiptDate || a.createdAt).getTime();
        bVal = new Date(b.receiptDate || b.createdAt).getTime();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [expenses, filterText, taxFilter, sortConfig]);

  const handleExportCSV = () => {
    const headers = ["Datum", "Anbieter", "Beschreibung", "Kategorie", "Betrag", "Steuer-Status", "Absetzbar (%)"];
    const rows = filteredAndSortedExpenses.map(exp => {
      const date = new Date(exp.receiptDate || exp.createdAt).toLocaleDateString('de-DE');
      const vendor = `"${(exp.vendor || "").replace(/"/g, '""')}"`;
      const desc = `"${(exp.description || "").replace(/"/g, '""')}"`;
      const category = `"${exp.category || ""}"`;
      const amount = exp.amount;
      const taxStatus = exp.taxDeductibility || "-";
      const taxPerc = exp.taxPercentage || 0;
      return [date, vendor, desc, category, amount, taxStatus, taxPerc].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ausgaben_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="py-16 text-center text-[var(--color-text-faint)]">Lade Ausgaben...</div>;
  }

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <span className="ml-1 opacity-20">↕</span>;
    return sortConfig.direction === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>;
  };

  return (
    <section className="py-8 pb-16" id="reports">
      <div className="container mx-auto w-[min(1120px,calc(100%-2rem))]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-highlight)] px-3 py-2 text-[length:var(--text-xs)] font-bold uppercase tracking-[.08em] text-[var(--color-primary)]">Reports</span>
            <h2 className="mt-1 font-display text-[length:var(--text-lg)] font-bold">Alle Ausgaben</h2>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={taxFilter}
              onChange={(e) => setTaxFilter(e.target.value)}
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-2 px-4 pr-8 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] appearance-none cursor-pointer"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px' }}
            >
              <option value="all">Alle Steuern</option>
              <option value="not_rejected">Potenziell Absetzbar</option>
              <option value="deductible">Sicher Absetzbar</option>
              <option value="needs_info">Info benötigt</option>
            </select>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                placeholder="Suchen..." 
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-10 pr-4 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] px-4 py-2 text-sm font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export CSV
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl p-6 shadow-2xl glass relative overflow-hidden">
          <div className="absolute -inset-1 rounded-[inherit] border border-white/5 pointer-events-none"></div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--color-divider)] text-[var(--color-text-muted)]">
                <tr>
                  <th className="pb-3 pr-4 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('receiptDate')}>
                    Datum <SortIcon columnKey="receiptDate" />
                  </th>
                  <th className="pb-3 pr-4 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('vendor')}>
                    Anbieter <SortIcon columnKey="vendor" />
                  </th>
                  <th className="pb-3 pr-4 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('amount')}>
                    Betrag <SortIcon columnKey="amount" />
                  </th>
                  <th className="pb-3 pr-4 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('category')}>
                    Kategorie <SortIcon columnKey="category" />
                  </th>
                  <th className="pb-3 text-right font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('taxDeductibility')}>
                    Steuer-Status <SortIcon columnKey="taxDeductibility" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-divider)]">
                {filteredAndSortedExpenses.length > 0 ? filteredAndSortedExpenses.map(exp => (
                  <tr key={exp.expenseId} className="hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]">
                    <td className="py-3 pr-4 whitespace-nowrap">{new Date(exp.receiptDate || exp.createdAt).toLocaleDateString('de-DE')}</td>
                    <td className="py-3 pr-4">
                      <div className="font-medium">{exp.vendor}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{exp.description}</div>
                    </td>
                    <td className="py-3 pr-4 font-semibold">{exp.amount.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}</td>
                    <td className="py-3 pr-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] px-2 py-0.5 text-xs">{CATEGORY_ICONS[exp.category] || "📦"} {exp.category}</span></td>
                    <td className="py-3 text-right">
                      {exp.taxDeductibility === 'HIGH_PROBABILITY' && <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500" title={exp.taxReasoning}>Absetzbar ({exp.taxPercentage}%)</span>}
                      {exp.taxDeductibility === 'PARTIAL' && <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-500" title={exp.taxReasoning}>Teilweise ({exp.taxPercentage}%)</span>}
                      {exp.taxDeductibility === 'NOT_DEDUCTIBLE' && <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-500" title={exp.taxReasoning}>Nicht absetzbar</span>}
                      {exp.taxDeductibility === 'NEEDS_INFO' && <button onClick={() => setSelectedExpense(exp)} className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-500 hover:bg-amber-500/20 transition shadow-sm">Info benötigt</button>}
                      {!exp.taxDeductibility && <span className="text-[var(--color-text-faint)] text-xs">-</span>}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="py-8 text-center text-[var(--color-text-faint)]">Keine Ausgaben gefunden</td></tr>
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
            <div className="flex flex-col gap-3 mb-6">
              {[
                "100% beruflich",
                "Überwiegend beruflich",
                "Geringfügig beruflich",
                "Rein privat"
              ].map((option) => (
                <label key={option} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">
                  <input 
                    type="radio" 
                    name="usagePurpose" 
                    value={option} 
                    checked={usagePurpose === option}
                    onChange={(e) => setUsagePurpose(e.target.value)}
                    className="w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300"
                  />
                  <span className="text-sm font-medium">{option}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setSelectedExpense(null);
                  setUsagePurpose("100% beruflich");
                }} 
                disabled={isSavingUsage}
                className="rounded-full border border-[color-mix(in_srgb,var(--color-text)_12%,transparent)] px-4 py-2 text-sm font-semibold hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button 
                onClick={async () => {
                  if (!usagePurpose) return;
                  
                  setIsSavingUsage(true);
                  try {
                    const config = { apiBaseUrl: window.APP_CONFIG?.API_BASE_URL || '' };
                    if (!config.apiBaseUrl || config.apiBaseUrl.includes('REPLACE_WITH_API_ID')) {
                        alert("API nicht konfiguriert (Local Mode). Speichern simuliert.");
                        setSelectedExpense(null);
                        return;
                    }
                    
                    const token = await getIdToken();
                    const resp = await fetch(`${config.apiBaseUrl}/api/expenses/usage-purpose`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          ...(token ? { Authorization: token } : {}),
                        },
                        body: JSON.stringify({
                            SK: selectedExpense.SK,
                            usagePurpose: usagePurpose
                        })
                    });
                    
                    if (!resp.ok) throw new Error("Fehler beim Speichern");
                    
                    setRefreshLocal(prev => prev + 1);
                    setSelectedExpense(null);
                    setUsagePurpose("100% beruflich");
                  } catch (e) {
                    console.error("Save usage error:", e);
                    alert("Konnte Verwendungszweck nicht speichern.");
                  } finally {
                    setIsSavingUsage(false);
                  }
                }} 
                disabled={isSavingUsage}
                className="rounded-full bg-[var(--color-primary)] px-6 py-2 text-sm font-semibold text-[var(--color-text-inverse)] shadow-md transition hover:bg-[var(--color-primary-hover)] disabled:opacity-70 flex items-center gap-2"
              >
                {isSavingUsage ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Lädt...
                  </>
                ) : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

import React, { useState } from 'react';
import { signUp, confirmSignUp, signIn } from '../auth';
import logo from '../assets/Logo-FinCon.png';

const TAB_LOGIN = 'login';
const TAB_REGISTER = 'register';
const VIEW_FORM = 'form';
const VIEW_VERIFY = 'verify';

export function LoginPage({ onLoginSuccess }) {
  const [tab, setTab] = useState(TAB_LOGIN);
  const [view, setView] = useState(VIEW_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [taxInterest, setTaxInterest] = useState(false);
  const [profession, setProfession] = useState('');

  // Verification
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (regPassword !== regPasswordConfirm) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }
    if (regPassword.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }
    if (taxInterest && !profession.trim()) {
      setError('Bitte gib deinen Beruf an, um steuerliche Absetzbarkeit nutzen zu können.');
      return;
    }

    setLoading(true);
    try {
      await signUp(regEmail, regPassword, regName, taxInterest, profession);
      setVerifyEmail(regEmail);
      setView(VIEW_VERIFY);
    } catch (err) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await confirmSignUp(verifyEmail, verifyCode);
      // Auto-login after verification
      await signIn(verifyEmail, regPassword);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  const translateError = (err) => {
    const msg = err?.message || String(err);
    if (msg.includes('User already exists')) return 'Diese E-Mail-Adresse ist bereits registriert.';
    if (msg.includes('Incorrect username or password')) return 'E-Mail oder Passwort falsch.';
    if (msg.includes('User is not confirmed')) return 'E-Mail-Adresse noch nicht verifiziert. Bitte prüfe dein Postfach.';
    if (msg.includes('Password did not conform')) return 'Passwort erfüllt nicht die Anforderungen (min. 8 Zeichen, Groß-/Kleinbuchstaben, Zahl).';
    if (msg.includes('Invalid verification code')) return 'Ungültiger Verifizierungscode.';
    if (msg.includes('User does not exist')) return 'Kein Konto mit dieser E-Mail-Adresse gefunden.';
    return msg;
  };

  // ── Verification View ───────────────────────────────────────
  if (view === VIEW_VERIFY) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <img src={logo} alt="Financial Concierge" className="mx-auto mb-4 h-12 w-auto" />
            <h1 className="font-display text-2xl font-bold text-white">E-Mail verifizieren</h1>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Wir haben einen Verifizierungscode an <strong className="text-white">{verifyEmail}</strong> gesendet.
            </p>
          </div>

          <form onSubmit={handleVerify} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl">
            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2 mb-4">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">Verifizierungscode</label>
              <input
                type="text"
                className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-center text-lg font-mono tracking-[0.5em] focus:border-transparent focus:outline-2 focus:outline-[var(--color-primary)]"
                placeholder="000000"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || verifyCode.length < 6}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-[var(--color-primary)] font-semibold text-[var(--color-text-inverse)] shadow-lg transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
            >
              {loading ? 'Wird geprüft…' : 'Verifizieren & Anmelden'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Login / Register View ───────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <img src={logo} alt="Financial Concierge" className="mx-auto mb-4 h-12 w-auto" />
          <h1 className="font-display text-2xl font-bold text-white">Financial Concierge</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Dein persönlicher Ausgaben-Assistent</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[var(--color-border)]">
            <button
              onClick={() => { setTab(TAB_LOGIN); setError(''); }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                tab === TAB_LOGIN
                  ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-white'
              }`}
            >
              Anmelden
            </button>
            <button
              onClick={() => { setTab(TAB_REGISTER); setError(''); }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                tab === TAB_REGISTER
                  ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-white'
              }`}
            >
              Registrieren
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
                {error}
              </div>
            )}

            {/* ── Login Tab ─────────────────────────────────── */}
            {tab === TAB_LOGIN && (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[var(--color-text-muted)]">E-Mail</label>
                  <input
                    type="email"
                    className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-sm focus:border-transparent focus:outline-2 focus:outline-[var(--color-primary)]"
                    placeholder="dejan@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[var(--color-text-muted)]">Passwort</label>
                  <input
                    type="password"
                    className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-sm focus:border-transparent focus:outline-2 focus:outline-[var(--color-primary)]"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-[var(--color-primary)] font-semibold text-[var(--color-text-inverse)] shadow-lg transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
                >
                  {loading ? 'Anmeldung läuft…' : 'Anmelden'}
                </button>
              </form>
            )}

            {/* ── Register Tab ──────────────────────────────── */}
            {tab === TAB_REGISTER && (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[var(--color-text-muted)]">Name</label>
                  <input
                    type="text"
                    className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-sm focus:border-transparent focus:outline-2 focus:outline-[var(--color-primary)]"
                    placeholder="Max Mustermann"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[var(--color-text-muted)]">E-Mail</label>
                  <input
                    type="email"
                    className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-sm focus:border-transparent focus:outline-2 focus:outline-[var(--color-primary)]"
                    placeholder="max@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[var(--color-text-muted)]">Passwort</label>
                  <input
                    type="password"
                    className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-sm focus:border-transparent focus:outline-2 focus:outline-[var(--color-primary)]"
                    placeholder="Min. 8 Zeichen, Groß-/Kleinbuchstaben, Zahl"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[var(--color-text-muted)]">Passwort bestätigen</label>
                  <input
                    type="password"
                    className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-sm focus:border-transparent focus:outline-2 focus:outline-[var(--color-primary)]"
                    placeholder="Passwort wiederholen"
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    required
                  />
                </div>

                {/* ── Tax Interest Toggle ────────────────────── */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                  <label className="flex cursor-pointer items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-white">Steuerlich absetzbare Posten erfassen?</span>
                      <span className="text-xs text-[var(--color-text-muted)]">Die KI erkennt automatisch absetzbare Ausgaben</span>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={taxInterest}
                        onChange={(e) => {
                          setTaxInterest(e.target.checked);
                          if (!e.target.checked) setProfession('');
                        }}
                      />
                      <div className="h-6 w-11 rounded-full bg-[color-mix(in_srgb,var(--color-text)_20%,transparent)] transition-colors peer-checked:bg-[var(--color-primary)]"></div>
                      <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"></div>
                    </div>
                  </label>

                  {/* ── Profession Field (conditional) ──────── */}
                  {taxInterest && (
                    <div className="mt-4 flex flex-col gap-2 border-t border-[var(--color-border)] pt-4">
                      <label className="text-xs font-semibold text-[var(--color-text-muted)]">Beruf / Tätigkeit</label>
                      <input
                        type="text"
                        className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm focus:border-transparent focus:outline-2 focus:outline-[var(--color-primary)]"
                        placeholder="z.B. Softwareentwickler, Lehrer, Pfleger"
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        required
                      />
                      <p className="text-xs text-[var(--color-text-faint)]">
                        Deine Berufsangabe hilft der KI, relevante steuerliche Absetzbarkeiten zu erkennen.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-[var(--color-primary)] font-semibold text-[var(--color-text-inverse)] shadow-lg transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
                >
                  {loading ? 'Registrierung läuft…' : 'Registrieren'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[var(--color-text-faint)]">
          © 2026 Financial Concierge · Group B · MCCE
        </p>
      </div>
    </div>
  );
}

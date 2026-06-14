import React from 'react';
import { UploadBox } from './UploadBox';

export function Hero({ onUploadSuccess, isProfileComplete, onOpenSettings }) {
  return (
    <section className="mb-8">
      <div className="rounded-2xl p-6 shadow-2xl glass relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <div className="absolute -inset-1 rounded-[inherit] border border-white/5 pointer-events-none"></div>
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-highlight)] px-3 py-2 text-[length:var(--text-xs)] font-bold uppercase tracking-[.08em] text-[var(--color-primary)]">
            Quick Upload
          </div>
          <h2 className="mt-4 font-display text-[length:var(--text-lg)] font-bold">
            Neue Rechnung erfassen
          </h2>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Lade Belege als PDF, PNG oder JPG hoch. Die Kategorisierung erfolgt automatisch.
          </p>
        </div>
        
        <div className="w-full md:w-[400px]">
          <div className="rounded-xl border-2 border-dashed border-[color-mix(in_srgb,var(--color-primary)_35%,var(--color-border))] bg-gradient-to-b from-[color-mix(in_srgb,var(--color-primary)_6%,transparent)] to-transparent p-6 text-center">
            <UploadBox 
              onUploadSuccess={onUploadSuccess} 
              isProfileComplete={isProfileComplete}
              onOpenSettings={onOpenSettings}
            />
          </div>
        </div>
      </div>
    </section>
  );
}


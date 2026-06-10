import React from 'react';
import { UploadBox } from './UploadBox';

export function Hero({ onUploadSuccess }) {
  return (
    <section className="py-16 md:py-28">
      <div className="container mx-auto w-[min(1120px,calc(100%-2rem))]">
        <div className="grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-highlight)] px-3 py-2 text-[length:var(--text-xs)] font-bold uppercase tracking-[.08em] text-[var(--color-primary)]">
              Financial document intake
            </div>
            <h1 className="mt-5 max-w-[12ch] font-display text-[length:var(--text-xl)] leading-[1.02] tracking-tight">
              Upload financial documents through a simple static website.
            </h1>
            <p className="mt-5 max-w-[58ch] text-[var(--color-text-muted)]">
              This frontend is ready for deployment to Amazon S3 or AWS Amplify Hosting. It already includes the upload UI and is prepared to call your future API for presigned S3 URLs.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#upload"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--color-primary)] px-5 text-[length:var(--text-sm)] font-semibold text-[var(--color-text-inverse)] shadow-md transition hover:bg-[var(--color-primary-hover)]"
              >
                Open uploader
              </a>
              <a
                href="#next"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-text)_12%,transparent)] bg-[var(--color-surface)] px-5 text-[length:var(--text-sm)] font-semibold transition"
              >
                View next phase
              </a>
            </div>
          </div>
          
          <div className="rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] bg-[color-mix(in_srgb,var(--color-surface)_92%,transparent)] p-8 shadow-md" id="upload">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-highlight)] px-3 py-2 text-[length:var(--text-xs)] font-bold uppercase tracking-[.08em] text-[var(--color-primary)]">
              Upload
            </div>
            <h2 className="mt-4 font-body text-lg font-semibold">
              Send receipts and statements
            </h2>
            <p className="mt-3 text-[var(--color-text-muted)]">
              Accepted formats: PDF, PNG, JPG, JPEG. When your Lambda is ready, this page can request a presigned URL and upload directly to S3.
            </p>
            <div className="mt-5 rounded-xl border-2 border-dashed border-[color-mix(in_srgb,var(--color-primary)_35%,var(--color-border))] bg-gradient-to-b from-[color-mix(in_srgb,var(--color-primary)_6%,transparent)] to-transparent p-8 text-center">
              <UploadBox onUploadSuccess={onUploadSuccess} />
            </div>
            
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[var(--color-surface-2)] p-4">
                <span className="block text-[length:var(--text-xs)] uppercase tracking-[.08em] text-[var(--color-text-faint)]">Deployment</span>
                <strong className="mt-2 block text-[length:var(--text-sm)]">S3 static hosting or Amplify</strong>
              </div>
              <div className="rounded-lg border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[var(--color-surface-2)] p-4">
                <span className="block text-[length:var(--text-xs)] uppercase tracking-[.08em] text-[var(--color-text-faint)]">Allowed files</span>
                <strong className="mt-2 block text-[length:var(--text-sm)]">pdf, png, jpg, jpeg</strong>
              </div>
              <div className="rounded-lg border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[var(--color-surface-2)] p-4">
                <span className="block text-[length:var(--text-xs)] uppercase tracking-[.08em] text-[var(--color-text-faint)]">Next step</span>
                <strong className="mt-2 block text-[length:var(--text-sm)]">Presigned URL integration</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

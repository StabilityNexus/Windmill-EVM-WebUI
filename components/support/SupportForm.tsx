'use client';

import React, { useState } from 'react';
import { Mail, Loader2, AlertCircle, Clock } from 'lucide-react';

// ── Client-side validation constants (mirror the server limits) ───────────────
const MAX_SUBJECT_LEN = 200;
const MAX_DETAILS_LEN = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── State types ───────────────────────────────────────────────────────────────
type FormStatus = 'idle' | 'loading' | 'success' | 'error' | 'rate-limited';

export default function SupportForm() {

  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; subject?: string; details?: string }>({});

  // ── Client-side validation ────────────────────────────────────────────────
  function validate(): boolean {
    const errors: typeof fieldErrors = {};

    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!subject.trim()) {
      errors.subject = 'Subject is required.';
    } else if (subject.trim().length > MAX_SUBJECT_LEN) {
      errors.subject = `Subject must be at most ${MAX_SUBJECT_LEN} characters.`;
    }
    if (!details.trim()) {
      errors.details = 'Details are required.';
    } else if (details.trim().length > MAX_DETAILS_LEN) {
      errors.details = `Details must be at most ${MAX_DETAILS_LEN} characters.`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Submit handler ────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), subject: subject.trim(), details: details.trim() }),
      });

      const data = (await res.json()) as { ok: boolean; error?: string };

      if (res.status === 429) {
        setStatus('rate-limited');
        return;
      }

      if (!res.ok || !data.ok) {
        setErrorMessage(data.error ?? 'Something went wrong. Please try again later.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setEmail('');
      setSubject('');
      setDetails('');
      setFieldErrors({});
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  }

  // ── Shared input class ────────────────────────────────────────────────────
  const inputClass =
    'rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-black dark:text-white normal-case font-normal focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors';

  // ── Success state ─────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-3xl p-6 transition-colors">
        <h3 className="text-lg font-bold mb-4 text-black dark:text-white">Open Support Ticket</h3>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Mail className="w-8 h-8 text-neutral-600 dark:text-neutral-400" />
          <h4 className="text-sm font-semibold mt-4 text-black dark:text-white">Ticket Submitted!</h4>
          <p className="text-xs mt-2 text-neutral-500 dark:text-neutral-400">
            We&apos;ll get back to you at your email within 24 hours.
          </p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="mt-6 text-xs text-neutral-500 dark:text-neutral-400 underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            Submit another ticket
          </button>
        </div>
      </div>
    );
  }

  // ── Rate-limited state ────────────────────────────────────────────────────
  if (status === 'rate-limited') {
    return (
      <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-3xl p-6 transition-colors">
        <h3 className="text-lg font-bold mb-4 text-black dark:text-white">Open Support Ticket</h3>
        <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
          <Clock className="w-8 h-8 text-amber-500" />
          <h4 className="text-sm font-semibold text-black dark:text-white">Daily Limit Reached</h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs">
            You&apos;ve submitted the maximum of 10 support tickets in the last 24 hours. Please try again tomorrow.
          </p>
        </div>
      </div>
    );
  }

  // ── Form state (idle / loading / error) ───────────────────────────────────
  return (
    <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-3xl p-6 transition-colors">
      <h3 className="text-lg font-bold mb-4 text-black dark:text-white">Open Support Ticket</h3>

      {/* Global error banner */}
      {status === 'error' && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-400">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 text-xs font-semibold uppercase tracking-wider text-[10px] text-neutral-600 dark:text-neutral-400"
      >
        {/* Email field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="support-email" className="text-neutral-400 dark:text-neutral-500">
            Your Email
          </label>
          <input
            id="support-email"
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
            className={inputClass}
            placeholder="you@example.com"
            disabled={status === 'loading'}
          />
          {fieldErrors.email && (
            <span className="text-[10px] text-red-500 normal-case font-normal">{fieldErrors.email}</span>
          )}
        </div>

        {/* Subject field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="support-subject" className="text-neutral-400 dark:text-neutral-500">
            Subject
          </label>
          <input
            id="support-subject"
            type="text"
            required
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setFieldErrors((p) => ({ ...p, subject: undefined })); }}
            className={inputClass}
            placeholder="Curve query, matching issues..."
            disabled={status === 'loading'}
          />
          {fieldErrors.subject && (
            <span className="text-[10px] text-red-500 normal-case font-normal">{fieldErrors.subject}</span>
          )}
        </div>

        {/* Details field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="support-details" className="text-neutral-400 dark:text-neutral-500">
            Details
          </label>
          <textarea
            id="support-details"
            rows={4}
            required
            value={details}
            onChange={(e) => { setDetails(e.target.value); setFieldErrors((p) => ({ ...p, details: undefined })); }}
            className={`${inputClass} resize-none`}
            placeholder="Provide details..."
            disabled={status === 'loading'}
          />
          {fieldErrors.details && (
            <span className="text-[10px] text-red-500 normal-case font-normal">{fieldErrors.details}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="mt-2 w-full rounded-full bg-black dark:bg-white py-3 text-center text-xs font-bold text-white dark:text-black uppercase hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Sending…
            </>
          ) : (
            'Submit Ticket'
          )}
        </button>
      </form>
    </div>
  );
}

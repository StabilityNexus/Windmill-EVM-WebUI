'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';

const SUPPORT_EMAIL = 'aossie.oss@gmail.com';

// ── Client-side validation constants ─────────────────────────────────────────
const MAX_SUBJECT_LEN = 200;
const MAX_DETAILS_LEN = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SupportForm() {

  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [draftOpened, setDraftOpened] = useState(false);
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
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const cleanSubject = subject.replace(/[\r\n]+/g, ' ').trim();
    const body = `From: ${email.trim()}\r\n\r\n${details.trim().replace(/\r?\n/g, '\r\n')}`;
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[Windmill Support] ${cleanSubject}`)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setDraftOpened(true);
  }

  // ── Shared input class ────────────────────────────────────────────────────
  const inputClass =
    'rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-black dark:text-white normal-case font-normal focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors';

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-3xl p-6 transition-colors">
      <h3 className="text-lg font-bold mb-4 text-black dark:text-white">Open Support Ticket</h3>

      <p className="mb-4 text-xs text-neutral-500 dark:text-neutral-400">
        Open a draft in your email app, then send it to AOSSIE. You can also email{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="underline underline-offset-2">
          {SUPPORT_EMAIL}
        </a>{' '}
        directly.
      </p>
      {draftOpened && (
        <p role="status" className="mb-4 text-xs text-neutral-600 dark:text-neutral-400">
          Your email app was requested. Send the draft there to submit your request.
          If no app opened, copy your message and email the address above. Your details remain below.
        </p>
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
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? 'support-email-error' : undefined}
          />
          {fieldErrors.email && (
            <span id="support-email-error" className="text-[10px] text-red-500 normal-case font-normal">{fieldErrors.email}</span>
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
            aria-invalid={fieldErrors.subject ? true : undefined}
            aria-describedby={fieldErrors.subject ? 'support-subject-error' : undefined}
          />
          {fieldErrors.subject && (
            <span id="support-subject-error" className="text-[10px] text-red-500 normal-case font-normal">{fieldErrors.subject}</span>
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
            aria-invalid={fieldErrors.details ? true : undefined}
            aria-describedby={fieldErrors.details ? 'support-details-error' : undefined}
          />
          {fieldErrors.details && (
            <span id="support-details-error" className="text-[10px] text-red-500 normal-case font-normal">{fieldErrors.details}</span>
          )}
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-full bg-black dark:bg-white py-3 text-center text-xs font-bold text-white dark:text-black uppercase hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
        >
          <Mail className="w-3.5 h-3.5" aria-hidden="true" />
          Open Email Draft
        </button>
      </form>
    </div>
  );
}

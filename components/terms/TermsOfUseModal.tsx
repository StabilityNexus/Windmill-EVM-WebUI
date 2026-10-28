'use client';

import React, { useEffect, useState, useRef, useCallback, useId } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const TERMS_URL = 'https://raw.githubusercontent.com/StabilityNexus/Info/main/TermsOfUse.md';
const STORAGE_KEY = 'windmill_terms_accepted_date';

const getTodayUTCDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export default function TermsOfUseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const today = getTodayUTCDateString();
    const accepted = localStorage.getItem(STORAGE_KEY) === today;

    requestAnimationFrame(() => {
      if (!accepted) {
        setIsOpen(true);
      }
    });

    let timer: ReturnType<typeof setTimeout>;

    const scheduleNextMidnight = () => {
      const now = new Date();
      const nextUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
      const msUntilMidnight = nextUTC.getTime() - now.getTime();

      timer = setTimeout(() => {
        setIsOpen(true);
        scheduleNextMidnight();
      }, msUntilMidnight);
    };

    scheduleNextMidnight();

    const handleFocus = () => {
      const currentToday = getTodayUTCDateString();
      const isStillAccepted = localStorage.getItem(STORAGE_KEY) === currentToday;
      if (!isStillAccepted) {
        requestAnimationFrame(() => {
          setIsOpen(true);
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  const fetchTerms = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch(TERMS_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.text();
      })
      .then(async (text) => {
        const rawHtml = await marked.parse(text);
        const cleanHtml = DOMPurify.sanitize(rawHtml);
        setHtmlContent(cleanHtml);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!isOpen || htmlContent) return;
    requestAnimationFrame(() => { fetchTerms(); });
  }, [isOpen, htmlContent, fetchTerms]);

  useEffect(() => {
    if (!isOpen) {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
      return;
    }

    if (!previousFocusRef.current) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
    }
    modalRef.current?.focus();
  }, [isOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;

    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusable || focusable.length === 0) {
      e.preventDefault();
      modalRef.current?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (document.activeElement === modalRef.current) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
      return;
    }

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  const handleAccept = () => {
    const today = getTodayUTCDateString();
    localStorage.setItem(STORAGE_KEY, today);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 text-black dark:text-white shadow-2xl transition-all duration-300 flex flex-col max-h-[85vh]">
        <div className="mb-4 flex items-center justify-between shrink-0">
          <h3 id={titleId} className="text-xl font-bold tracking-tight text-black dark:text-white">
            Terms of Use
          </h3>
        </div>

        <div
          className="my-2 flex-1 overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4 text-xs font-sans text-neutral-700 dark:text-neutral-300 leading-relaxed select-text [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-black dark:[&_h1]:text-white [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:pb-1 [&_h1]:border-b [&_h1]:border-neutral-200 dark:[&_h1]:border-neutral-800 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-black dark:[&_h2]:text-white [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-neutral-800 dark:[&_h3]:text-neutral-200 [&_h3]:mt-4 [&_h3]:mb-1 [&_p]:my-2 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:my-2 [&_ul]:pl-2 [&_li]:my-1 [&_hr]:my-4 [&_hr]:border-neutral-200 dark:[&_hr]:border-neutral-800 [&_strong]:font-semibold [&_strong]:text-black dark:[&_strong]:text-white [&_a]:text-cyan-500 dark:[&_a]:text-cyan-400 [&_a]:underline hover:[&_a]:text-cyan-600 dark:hover:[&_a]:text-cyan-300 [&_a]:transition-colors"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
              <Loader2 className="w-6 h-6 animate-spin mb-2 text-black dark:text-white" />
              <span>Loading Terms of Use...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400">
              <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
              <p className="mb-3">Unable to load Terms of Use content from source.</p>
              <button
                type="button"
                onClick={fetchTerms}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-black dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-4 shrink-0">
          {loading || error ? (
            <div className="text-center text-xs text-neutral-500 py-2">
              Please wait for Terms of Use to load before accepting.
            </div>
          ) : (
            <>
              <label className="flex items-start gap-3 cursor-pointer text-sm text-neutral-800 dark:text-neutral-200 select-none">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 accent-black dark:accent-white cursor-pointer shrink-0"
                />
                <span>I have carefully read and I accept the Terms of Use.</span>
              </label>

              <button
                type="button"
                disabled={!isChecked}
                onClick={handleAccept}
                className="w-full rounded-2xl bg-black py-3 text-center text-sm font-semibold text-white transition-all hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Accept Terms of Use
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

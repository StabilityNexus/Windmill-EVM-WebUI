'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Loader2, AlertCircle } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const TERMS_URL = 'https://raw.githubusercontent.com/StabilityNexus/Info/main/TermsOfUse.md';

export default function TermsOfUsePage() {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

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
    requestAnimationFrame(() => { fetchTerms(); });
  }, [fetchTerms]);

  return (
    <main className="w-full min-h-screen bg-background text-foreground pt-28 pb-20 px-6 md:px-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-700/50 text-cyan-700 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            Legal &amp; Compliance
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black dark:text-white">
            Terms of Use
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg">
            Terms of Use governing access to and interaction with the Windmill Exchange interface.
          </p>
        </div>

        {/* Content Section */}
        <section className="space-y-6 text-neutral-600 dark:text-neutral-300 leading-relaxed text-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-cyan-600 dark:text-cyan-400" />
              <span>Loading Terms of Use...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-400 space-y-4">
              <AlertCircle className="w-10 h-10 text-rose-500" />
              <p>Unable to load Terms of Use content from GitHub source.</p>
              <button
                type="button"
                onClick={fetchTerms}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-black dark:text-white transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <div
              className="space-y-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-black dark:[&_h1]:text-white [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:pb-2 [&_h1]:border-b [&_h1]:border-neutral-200 dark:[&_h1]:border-neutral-800 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-black dark:[&_h2]:text-white [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-neutral-800 dark:[&_h3]:text-neutral-200 [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:my-3 [&_p]:text-neutral-600 dark:[&_p]:text-neutral-300 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-2 [&_ul]:text-neutral-500 dark:[&_ul]:text-neutral-400 [&_ul]:pl-2 [&_li]:my-1 [&_hr]:my-6 [&_hr]:border-neutral-200 dark:[&_hr]:border-neutral-800 [&_strong]:font-semibold [&_strong]:text-black dark:[&_strong]:text-white [&_a]:text-cyan-600 dark:[&_a]:text-cyan-400 hover:[&_a]:text-cyan-500 dark:hover:[&_a]:text-cyan-300 [&_a]:underline [&_a]:transition-colors"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
        </section>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-sm">
          <Link href="/" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors">
            &larr; Back to Windmill Exchange Home
          </Link>
          <Link href="/terms" className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-neutral-200 transition-colors">
            Terms of Service &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}

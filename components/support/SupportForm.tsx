'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';

export default function SupportForm() {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDesc) return;
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketSubject('');
      setTicketDesc('');
    }, 3000);
  };

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-3xl p-6 transition-colors">
      <h3 className="text-lg font-bold mb-4 text-black dark:text-white">
        Open Support Ticket
      </h3>
      {ticketSubmitted ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Mail className="w-8 h-8 text-neutral-600 dark:text-neutral-400" />
          <h4 className="text-sm font-semibold mt-4 text-black dark:text-white">
            Ticket Submitted!
          </h4>
          <p className="text-xs mt-2 text-neutral-500 dark:text-neutral-400">
            We will get back to you within 24 hours.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSupportSubmit}
          className="flex flex-col gap-4 text-xs font-semibold uppercase tracking-wider text-[10px] text-neutral-600 dark:text-neutral-400"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="support-subject" className="text-neutral-400 dark:text-neutral-500">
              Subject
            </label>
            <input
              id="support-subject"
              type="text"
              required
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-black dark:text-white normal-case font-normal focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"
              placeholder="Curve query, matching issues..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="support-details" className="text-neutral-400 dark:text-neutral-500">
              Details
            </label>
            <textarea
              id="support-details"
              rows={4}
              required
              value={ticketDesc}
              onChange={(e) => setTicketDesc(e.target.value)}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-black dark:text-white normal-case font-normal focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-500 resize-none transition-colors"
              placeholder="Provide details..."
            />
          </div>
          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-black dark:bg-white py-3 text-center text-xs font-bold text-white dark:text-black uppercase hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs cursor-pointer"
          >
            Submit Ticket
          </button>
        </form>
      )}
    </div>
  );
}

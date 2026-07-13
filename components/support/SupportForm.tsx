'use client';

import React, { useState } from 'react';

interface SupportFormProps {
  theme?: 'light' | 'dark';
}

export default function SupportForm({ theme = 'light' }: SupportFormProps) {
  const isDark = theme === 'dark';
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
    <div className={isDark ? 'border border-white/5 bg-white/[0.01] rounded-3xl p-6' : 'border border-neutral-200 bg-neutral-50/50 rounded-3xl p-6'}>
      <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
        Open Support Ticket
      </h3>
      {ticketSubmitted ? (
        <div className="text-center py-10">
          <span className="text-3xl">✉️</span>
          <h4 className={`text-sm font-semibold mt-4 ${isDark ? 'text-emerald-400' : 'text-black'}`}>
            Ticket Submitted!
          </h4>
          <p className={`text-xs mt-2 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            We will get back to you within 24 hours.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSupportSubmit}
          className={`flex flex-col gap-4 text-xs font-semibold uppercase tracking-wider ${isDark ? '' : 'text-[10px] text-neutral-600'}`}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="support-subject" className={isDark ? 'text-neutral-500' : 'text-neutral-400'}>
              Subject
            </label>
            <input
              id="support-subject"
              type="text"
              required
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              className={isDark 
                ? 'rounded-xl border border-white/10 bg-white/5 p-3 text-white normal-case font-normal focus:outline-none focus:border-white/35'
                : 'rounded-xl border border-neutral-200 bg-white p-3 text-black normal-case font-normal focus:outline-none focus:border-neutral-400'
              }
              placeholder="Curve query, matching issues..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="support-details" className={isDark ? 'text-neutral-500' : 'text-neutral-400'}>
              Details
            </label>
            <textarea
              id="support-details"
              rows={4}
              required
              value={ticketDesc}
              onChange={(e) => setTicketDesc(e.target.value)}
              className={isDark 
                ? 'rounded-xl border border-white/10 bg-white/5 p-3 text-white normal-case font-normal focus:outline-none focus:border-white/35 resize-none'
                : 'rounded-xl border border-neutral-200 bg-white p-3 text-black normal-case font-normal focus:outline-none focus:border-neutral-400 resize-none'
              }
              placeholder="Provide details..."
            />
          </div>
          <button
            type="submit"
            className={isDark
              ? 'mt-2 w-full rounded-full bg-white py-3 text-center text-xs font-bold text-black uppercase hover:bg-neutral-200 transition-colors'
              : 'mt-2 w-full rounded-full bg-black py-3 text-center text-xs font-bold text-white uppercase hover:bg-neutral-800 transition-colors'
            }
          >
            Submit Ticket
          </button>
        </form>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How are dynamic curves executed?',
    answer:
      'Orders specify starting prices and linear slopes. Buyers decrease bids; sellers increase asks, driving natural price convergence until a compatible match occurs.',
  },
  {
    question: 'Is there a transaction fee?',
    answer:
      'Yes. A flat 0.1% keeper fee is deducted on settlement and rewarded to the solver node to cover gas and incentivize continuous autonomous matching.',
  },
  {
    question: 'Are contracts audited?',
    answer:
      'The protocol architecture has been mathematically verified, and code review is active within Stability Nexus and the open-source community.',
  },
  {
    question: 'Which networks are currently supported?',
    answer:
      'Windmill Exchange is deployed across major EVM networks including Ethereum, Sepolia Testnet, Base, Polygon, BSC, and Ethereum Classic (Mordor).',
  },
];

export default function FAQContent() {
  // Initialize with first question open by default for clear UX
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleItem = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold text-black dark:text-white">
        Frequently Asked Questions
      </h3>

      <div className="flex flex-col gap-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndices.includes(index);
          return (
            <div
              key={item.question}
              className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left font-semibold text-xs sm:text-sm text-black dark:text-white hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-black dark:text-white' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

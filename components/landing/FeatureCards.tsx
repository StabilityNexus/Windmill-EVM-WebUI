'use client';

import { motion } from 'framer-motion';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: Feature[] = [
  {
    title: 'Dynamic Pricing Curves',
    description:
      'Configurable bonding curves ensure optimal liquidity depth and minimal slippage across all token pairs.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M4 15s1-8 4-8 5 12 8 12 4-6 4-6"
        />
      </svg>
    ),
  },
  {
    title: 'Autonomous Keepers',
    description:
      'Decentralized network of keepers automatically match crossed orders and execute limit positions.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M12 4a3 3 0 100 6 3 3 0 000-6zM4 15a3 3 0 100 6 3 3 0 000-6zM20 15a3 3 0 100 6 3 3 0 000-6z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M8.5 8.5l4 4.5M15.5 8.5l-4 4.5M7 18h10"
        />
      </svg>
    ),
  },
  {
    title: 'Gas-Optimized',
    description:
      'Smart contracts engineered for extreme gas efficiency during high-volume trading.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    title: 'Seamless Web3 Integration',
    description:
      'Connect your favorite EVM-compatible wallets to easily and securely interact with the protocol.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function FeatureCards() {
  return (
    <section
      id="feature-cards"
      className="relative bg-white dark:bg-[#0a0a0a] text-foreground section-padding overflow-hidden transition-colors duration-300"
    >
      {/* Subtle ambient background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vw] rounded-full opacity-[0.03] blur-3xl pointer-events-none bg-gradient-to-br from-neutral-400 to-neutral-600" />

      <div className="mx-auto max-w-5xl px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
            Core Capabilities
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight leading-tight">
            Built for Performance, Designed for Scale
          </p>
        </div>

        {/* Bento Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, idx) => {
            /* Items 0 and 3 (1st and 4th) span 2 columns on desktop */
            const isWide = idx === 0 || idx === 3;

            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className={`
                  group relative rounded-2xl p-7 sm:p-8
                  bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md
                  border border-black/[0.06] dark:border-white/[0.08]
                  shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]
                  transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                  hover:border-black/[0.12] dark:hover:border-white/[0.16]
                  hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)]
                  hover:-translate-y-1
                  ${isWide ? 'md:col-span-2' : 'md:col-span-1'}
                `}
              >
                {/* Subtle inner gradient highlight on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-neutral-50/80 via-transparent to-transparent dark:from-neutral-800/40" />

                <div className="relative flex flex-col gap-4">
                  {/* Icon container */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 shadow-xs text-black dark:text-white transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
                    {feature.icon}
                  </div>

                  {/* Text content */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-bold text-black dark:text-white tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PlatformKey = 'macos' | 'linux' | 'windows';

export interface PlatformSnippets {
  macos?: string;
  linux?: string;
  windows?: string;
}

interface CodeBlockProps {
  code?: string;
  className?: string;
  label?: string;
  platforms?: PlatformSnippets;
  defaultPlatform?: PlatformKey;
}

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  macos: 'macOS',
  linux: 'Linux',
  windows: 'Windows',
};

export default function CodeBlock({
  code,
  className,
  label,
  platforms,
  defaultPlatform = 'macos',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const availablePlatforms = platforms
    ? (['macos', 'linux', 'windows'] as PlatformKey[]).filter((k) => Boolean(platforms[k]))
    : [];

  const [activePlatform, setActivePlatform] = useState<PlatformKey>(() => {
    if (platforms) {
      if (platforms[defaultPlatform]) return defaultPlatform;
      return availablePlatforms[0] || 'macos';
    }
    return defaultPlatform;
  });

  const activeCode = platforms ? platforms[activePlatform] ?? '' : (code ?? '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  return (
    <div className={cn('relative group flex flex-col', className)}>
      {(label || availablePlatforms.length > 0) && (
        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
          {label ? (
            <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500" />
              {label}
            </span>
          ) : <div />}

          {/* OS Platform Switcher Tabs */}
          {availablePlatforms.length > 0 && (
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              {availablePlatforms.map((os) => (
                <button
                  key={os}
                  type="button"
                  onClick={() => {
                    setActivePlatform(os);
                    setCopied(false);
                  }}
                  className={cn(
                    'px-2 py-0.5 text-[10px] font-medium rounded-md transition-all cursor-pointer',
                    activePlatform === os
                      ? 'bg-white dark:bg-neutral-900 text-black dark:text-white font-bold shadow-2xs'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  )}
                >
                  {PLATFORM_LABELS[os]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <div className="bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-100 dark:border-neutral-700 rounded-xl p-4 font-mono text-xs text-black dark:text-white overflow-x-auto">
          <pre className="whitespace-pre pr-16">{activeCode}</pre>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied to clipboard' : 'Copy command to clipboard'}
          title={copied ? 'Copied!' : 'Copy command to clipboard'}
          className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-600 text-[11px] font-sans font-medium shadow-2xs backdrop-blur-xs transition-all cursor-pointer opacity-80 group-hover:opacity-100"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

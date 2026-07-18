'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

// ─── Reusable Sub-Components ────────────────────────────────────

interface DashboardCardProps {
  className?: string;
  children: React.ReactNode;
}

/** Reusable glassmorphic card wrapper. Eliminates repeated markup. */
function DashboardCard({ className, children }: DashboardCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 flex flex-col gap-2 transition-colors hover:bg-white/15',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Card header — title + subtitle. */
function CardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-semibold text-neutral-950">{title}</h3>
        <p className="text-xs text-neutral-500">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Sparkline SVG (unique gradient IDs) ────────────────────────

interface SparklineProps {
  /** Unique token appended to SVG gradient IDs to avoid DOM collisions. */
  id: string;
  data: readonly number[];
  color: string;
  height?: number;
}

function Sparkline({ id, data, color, height = 40 }: SparklineProps) {
  const gradientId = `sparkline-grad-${id}`;
  const width = 120;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height * 0.8) - height * 0.1;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Circular Progress ──────────────────────────────────────────

function CircularProgress({
  percent,
  size = 64,
  strokeWidth = 4,
  color = '#16a34a',
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0" aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(0,0,0,0.08)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

// ─── Status Indicator ───────────────────────────────────────────

function StatusDot({ state }: { state: string }) {
  const isActive = state === 'Active';
  return (
    <span
      className={cn(
        'inline-block h-2 w-2 rounded-full',
        isActive ? 'bg-emerald-500' : 'bg-amber-500',
      )}
      aria-label={state}
    />
  );
}

// ─── Main Component ─────────────────────────────────────────────

export default function StatsPanel() {
  const {
    liveAnalytics,
    volumeTrend,
    systemHealth,
    solverUptime,
    tradingStats,
    networkStatus,
    nodeExecution,
    portfolio,
  } = t.stats;

  // Mock sparkline data
  const sparklineA = [12, 18, 14, 22, 19, 26, 24, 30, 28, 35, 32, 38] as const;
  const sparklineB = [8, 12, 10, 16, 14, 20, 18, 24, 22, 26, 30, 28] as const;

  return (
    <div
      className="w-full max-w-5xl mx-auto rounded-3xl bg-white/15 backdrop-blur-[32px] border border-white/30 p-4 sm:p-6"
      role="region"
      aria-label={t.stats.dashboardTitle}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* ── 1. Live Analytics ──────────────────────────────── */}
        <DashboardCard>
          <CardHeader title={liveAnalytics.title} subtitle={liveAnalytics.subtitle} />
          <Sparkline id="live-analytics" data={sparklineA} color="#6366f1" height={48} />
          <div className="flex items-end justify-between mt-1">
            <div>
              <span className="text-xl font-bold text-neutral-950">{liveAnalytics.value}</span>
              <span className="text-xs text-neutral-500 ml-1">{liveAnalytics.unit}</span>
            </div>
            <span className="text-xs font-semibold text-emerald-600">{liveAnalytics.change}</span>
          </div>
        </DashboardCard>

        {/* ── 2. Volume Trend ────────────────────────────────── */}
        <DashboardCard>
          <CardHeader title={volumeTrend.title} subtitle={volumeTrend.subtitle} />
          <Sparkline id="volume-trend" data={sparklineB} color="#f59e0b" height={48} />
          <div className="flex items-end justify-between mt-1">
            <span className="text-xl font-bold text-neutral-950">{volumeTrend.value}</span>
            <span className="text-xs font-semibold text-emerald-600">{volumeTrend.change}</span>
          </div>
        </DashboardCard>

        {/* ── 3. System Health ───────────────────────────────── */}
        <DashboardCard>
          <CardHeader title={systemHealth.title} subtitle={systemHealth.subtitle} />
          <div className="flex-1 flex flex-col justify-end gap-2 mt-2">
            <span className="text-2xl font-bold text-neutral-950">{systemHealth.value}</span>
            <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${systemHealth.barPercent}%` }}
              />
            </div>
          </div>
        </DashboardCard>

        {/* ── 4. Solver Uptime ───────────────────────────────── */}
        <DashboardCard>
          <CardHeader title={solverUptime.title} subtitle={solverUptime.subtitle} />
          <div className="flex-1 flex items-center justify-center gap-3 mt-2">
            <CircularProgress percent={solverUptime.percent} color="#16a34a" size={56} />
            <span className="text-2xl font-bold text-neutral-950">{solverUptime.value}</span>
          </div>
        </DashboardCard>

        {/* ── 5. Trading Statistics ──────────────────────────── */}
        <DashboardCard>
          <CardHeader title={tradingStats.title} subtitle={tradingStats.subtitle} />
          <div className="grid grid-cols-2 gap-2 mt-2">
            {tradingStats.pairs.map((pair) => (
              <div key={pair.label} className="flex flex-col">
                <span className="text-base font-bold text-neutral-950">{pair.value}</span>
                <span className="text-xs text-neutral-500">{pair.label}</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* ── 6. Network Status ─────────────────────────────── */}
        <DashboardCard>
          <CardHeader title={networkStatus.title} subtitle={networkStatus.subtitle} />
          <div className="flex flex-col gap-2 mt-2">
            {networkStatus.entries.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot state={entry.state} />
                  <span className="text-sm font-medium text-neutral-800">{entry.name}</span>
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold',
                    entry.state === 'Active' ? 'text-emerald-600' : 'text-amber-600',
                  )}
                >
                  {entry.state}
                </span>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* ── 7. Node Execution ──────────────────────────────── */}
        <DashboardCard>
          <CardHeader title={nodeExecution.title} subtitle={nodeExecution.subtitle} />
          <div className="grid grid-cols-2 gap-2 mt-2">
            {nodeExecution.metrics.map((metric) => (
              <div key={metric.label} className="flex flex-col">
                <span className="text-base font-bold text-neutral-950">{metric.value}</span>
                <span className="text-xs text-neutral-500">{metric.label}</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* ── 8. Top Pairs / Portfolio ───────────────────────── */}
        <DashboardCard>
          <CardHeader title={portfolio.title} subtitle={portfolio.subtitle} />
          <div className="flex flex-col gap-2 mt-2">
            {portfolio.tokens.map((token) => (
              <div key={token.pair} className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-800">{token.pair}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-600">{token.volume}</span>
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      token.change.startsWith('+') ? 'text-emerald-600' : 'text-red-500',
                    )}
                  >
                    {token.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

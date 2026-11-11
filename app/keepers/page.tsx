'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import WalletModal from '@/components/wallet/WalletModal';
import { useScrollRevealChildren } from '@/hooks/useScrollReveal';
import { useContract } from '@/hooks/useContract';
import { useNetworkPing } from '@/hooks/useNetworkPing';
import { Monitor, Activity, Zap, CheckCircle2, Percent, Fuel, Search, RefreshCw, Play, Square, Terminal, Loader2 } from 'lucide-react';
import CodeBlock from '@/components/ui/CodeBlock';

// ── Keeper telemetry (from GET /api/keeper's `telemetry` field) ─────────
interface KeeperTelemetryData {
  isHealthy?: boolean;
  consecutiveFailures?: number;
  lastError?: unknown;
  uptimeSeconds?: number;
}
interface KeeperTelemetry {
  ok: boolean;
  data: KeeperTelemetryData | null;
}

// ── Keeper Bot Panel (local process control) ────────────────────────────
function KeeperBotPanel() {
  const [running, setRunning] = useState(false);
  const [pid, setPid] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<KeeperTelemetry | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Scroll the log box itself to its bottom whenever new logs arrive.
  // Deliberately NOT scrollIntoView() on an anchor element here — that
  // scrolls every scrollable ancestor (including the page), so with the
  // keeper polling every couple seconds it kept yanking the whole page's
  // scroll position out from under the user while they tried to scroll.
  useEffect(() => {
    const container = logContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [logs]);

  // Poll status + logs
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/keeper');
      if (!res.ok) return;
      const data = await res.json();
      setRunning(data.running);
      setPid(data.pid);
      setStartedAt(data.startedAt);
      setTelemetry(data.telemetry ?? null);
      setLogs(data.logs ?? []);
    } catch {
      // network blip — ignore
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Poll every 2s while running
  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [polling, fetchStatus]);

  // Start polling when running
  useEffect(() => {
    setPolling(running);
  }, [running]);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/keeper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Failed to start keeper.');
        return;
      }
      setRunning(true);
      setPid(data.pid);
      setStartedAt(data.startedAt);
      setPolling(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/keeper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Failed to stop keeper.');
        return;
      }
      setRunning(false);
      setPid(null);
      setTelemetry(null);
      setPolling(false);
      // One final fetch to get the exit log
      setTimeout(fetchStatus, 500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate uptime
  const uptime = startedAt && running
    ? (() => {
        const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        return `${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
      })()
    : null;

  return (
    <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 bg-white dark:bg-neutral-900 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
          <h3 className="text-lg font-bold text-black dark:text-white">Keeper Bot Control</h3>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2">
          {running ? (
            <>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Running
                {pid && <span className="text-emerald-500 dark:text-emerald-400 font-mono ml-1">PID {pid}</span>}
              </span>
              {telemetry?.ok && telemetry.data?.isHealthy === false ? (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Stalled
                  {typeof telemetry.data?.consecutiveFailures === 'number' && telemetry.data.consecutiveFailures > 0 && (
                    <span className="text-amber-500 dark:text-amber-400 font-mono ml-1">
                      {telemetry.data.consecutiveFailures} failures
                    </span>
                  )}
                </span>
              ) : telemetry?.ok && telemetry.data?.isHealthy ? (
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  Healthy
                </span>
              ) : (
                <span
                  title="Set TELEMETRY_PORT in the keeper's .env to enable live health checks"
                  className="text-[10px] font-semibold text-neutral-300 dark:text-neutral-600 uppercase tracking-wider cursor-help"
                >
                  Telemetry Unavailable
                </span>
              )}
            </>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider bg-neutral-50 dark:bg-neutral-800 px-3 py-1.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              Stopped
            </span>
          )}
        </div>
      </div>

      {/* Uptime bar */}
      {running && uptime && (
        <div className="mb-4 text-[10px] text-neutral-400 dark:text-neutral-500 font-mono flex items-center gap-2">
          <Activity className="w-3 h-3" />
          Uptime: {uptime}
          <span className="text-neutral-300 dark:text-neutral-600">·</span>
          Started {new Date(startedAt!).toLocaleTimeString()}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/60 rounded-xl px-4 py-2.5 font-mono">
          {error}
        </div>
      )}

      {/* Start / Stop button */}
      <div className="flex gap-3 mb-5">
        {!running ? (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Start Keeper Bot
          </button>
        ) : (
          <button
            onClick={handleStop}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            Stop Keeper Bot
          </button>
        )}

        <button
          onClick={fetchStatus}
          className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-sm font-medium hover:border-neutral-300 dark:hover:border-neutral-600 hover:text-black dark:hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Live log viewer */}
      <div ref={logContainerRef} className="bg-neutral-950 rounded-xl p-4 max-h-72 overflow-y-auto font-mono text-[11px] text-neutral-300 leading-relaxed">
        {logs.length === 0 ? (
          <div className="text-neutral-600 italic py-6 text-center text-xs">
            No logs yet. Click &ldquo;Start Keeper Bot&rdquo; to begin.
          </div>
        ) : (
          logs.map((line, i) => (
            <div
              key={i}
              className={`py-0.5 ${
                line.includes('[stderr]') || line.includes('error')
                  ? 'text-red-400'
                  : line.includes('[api]')
                  ? 'text-blue-400'
                  : line.includes('warn')
                  ? 'text-amber-400'
                  : 'text-neutral-300'
              }`}
            >
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function KeepersPage() {
  const containerRef = useScrollRevealChildren<HTMLDivElement>({ threshold: 0.1 });
  const [activeSection, setActiveSection] = useState<'monitor' | 'guide'>('monitor');

  // ── Live Keeper State & Contract Events ──────────────────────────────
  const [keeperRunning, setKeeperRunning] = useState(false);
  const [keeperTelemetry, setKeeperTelemetry] = useState<KeeperTelemetry | null>(null);
  const [keeperLogs, setKeeperLogs] = useState<string[]>([]);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [matchedEvents, setMatchedEvents] = useState<Array<{ status: string; detail: string; time: string; keeper: string }>>([]);

  const { readContract, isReady, fetchEvents } = useContract();
  const { latencyMs: pingMs, status: pingStatus } = useNetworkPing();

  // Poll keeper status from API
  useEffect(() => {
    const checkKeeperStatus = async () => {
      try {
        const res = await fetch('/api/keeper');
        if (res.ok) {
          const data = await res.json();
          setKeeperRunning(Boolean(data.running));
          setKeeperTelemetry(data.telemetry ?? null);
          if (data.logs) {
            setKeeperLogs(data.logs);
          }
        }
      } catch {
        // ignore network error
      }
    };
    checkKeeperStatus();
    const timer = setInterval(checkKeeperStatus, 3000);
    return () => clearInterval(timer);
  }, []);

  // Fetch on-chain orders & match events
  useEffect(() => {
    if (!isReady) return;
    const fetchOnChainData = async () => {
      const { data: total } = await readContract('totalOrders');
      if (total !== null) {
        setTotalOrders(Number(total));
      }

      // Fetch OrderMatched events
      const { data: events } = await fetchEvents('OrderMatched');
      if (events && Array.isArray(events)) {
        setMatchCount(events.length);
        const parsed = events.slice(-10).map((ev: unknown) => {
          const e = ev as { args?: { buyOrderId?: bigint; sellOrderId?: bigint; keeper?: string } };
          const buyId = e.args?.buyOrderId?.toString() || '?';
          const sellId = e.args?.sellOrderId?.toString() || '?';
          const keeperAddr = e.args?.keeper ? `${e.args.keeper.slice(0, 6)}...${e.args.keeper.slice(-4)}` : 'Node';
          return {
            status: 'SUCCESS',
            detail: `Buy #${buyId} matched Sell #${sellId} on-chain`,
            time: 'On-Chain Event',
            keeper: keeperAddr,
          };
        });
        setMatchedEvents(parsed.reverse());
      }
    };
    fetchOnChainData();
  }, [isReady, readContract, fetchEvents]);

  // Combine keeper process stdout logs and on-chain match events
  const dynamicLogs = useMemo(() => {
    const combined = [...matchedEvents];

    // Extract match logs from keeper process stdout if available
    keeperLogs.forEach((line) => {
      if (line.includes('Executing match') || line.includes('Matched') || line.includes('Sweep')) {
        combined.push({
          status: line.includes('error') ? 'SKIP' : line.includes('Sweep') ? 'SWEEP' : 'SUCCESS',
          detail: line.replace('[stdout]', '').replace('[stderr]', '').trim(),
          time: 'Live Log',
          keeper: 'Local Keeper',
        });
      }
    });

    return combined;
  }, [matchedEvents, keeperLogs]);

  // Ping status → a short, human label for the stat card
  const pingLabel =
    pingStatus === 'online' && pingMs !== null
      ? `${pingMs}ms`
      : pingStatus === 'pinging'
      ? 'Pinging…'
      : pingStatus === 'timeout'
      ? 'Timeout'
      : pingStatus === 'error'
      ? 'Offline'
      : isReady
      ? 'Connected'
      : 'Ready';

  // Keeper health label, sourced from the keeper's own /health telemetry
  const keeperHealthy = keeperTelemetry?.ok ? keeperTelemetry.data?.isHealthy : null;
  const keeperProcessLabel = !keeperRunning
    ? 'Stopped'
    : keeperHealthy === false
    ? 'Stalled'
    : keeperHealthy === true
    ? 'Healthy'
    : 'Running'; // telemetry disabled/unreachable — fall back to the plain running state

  // Dynamic Statistics
  const dynamicKeeperStats = [
    {
      label: 'Keeper Process',
      value: keeperProcessLabel,
      icon: Monitor,
      highlight: keeperRunning && keeperHealthy !== false,
    },
    { label: 'Network Node', value: pingLabel, icon: Activity, highlight: pingStatus === 'online' },
    { label: 'Sweep Latency', value: '15s Loop', icon: Zap },
    { label: 'Contract Orders', value: totalOrders !== null ? totalOrders.toString() : '0', icon: CheckCircle2 },
    { label: 'Keeper Fee Rate', value: '0.1%', icon: Percent },
    { label: 'Avg Gas Cost', value: '~120k', icon: Fuel },
    { label: 'Matches Settled', value: matchCount.toString(), icon: Search },
    { label: 'Cycle Interval', value: '15s', icon: RefreshCw },
  ];

  return (
    <main className="w-full min-h-screen bg-background text-foreground pt-24 transition-colors duration-300">
      <WalletModal />

      <div ref={containerRef} className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-10">
        {/* Header */}
        <div>
          <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Network Node Monitor</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black dark:text-white mt-2">
            Keeper Dashboard
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-3 max-w-xl">
            Autonomous keepers scan and match compatible orders using the O(N log N) two-pointer sweep algorithm. Run your own keeper node to earn fees.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 bg-neutral-50 dark:bg-neutral-800 p-1 rounded-full border border-neutral-100 dark:border-neutral-700 w-fit">
          <button
            onClick={() => setActiveSection('monitor')}
            className={`px-5 py-2 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
              activeSection === 'monitor' ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs' : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Live Monitor
          </button>
          <button
            onClick={() => setActiveSection('guide')}
            className={`px-5 py-2 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
              activeSection === 'guide' ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs' : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Run a Keeper
          </button>
        </div>

        {activeSection === 'monitor' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {dynamicKeeperStats.map((stat, idx) => {
                const StatIcon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    data-reveal
                    style={{ transitionDelay: `${idx * 60}ms` }}
                    className="reveal-fade-up border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl p-4 text-center hover:-translate-y-1 hover:shadow-md hover:border-neutral-200 dark:hover:border-neutral-700 transition-all duration-300 flex flex-col items-center justify-center"
                  >
                    <span className="text-neutral-600 dark:text-neutral-400 mb-2 block">
                      <StatIcon className="w-5 h-5" />
                    </span>
                    <span className={`text-xl font-bold font-mono ${stat.highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-black dark:text-white'}`}>
                      {stat.value}
                    </span>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-semibold mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Match Logs */}
            <div data-reveal className="reveal-fade-up border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 bg-white dark:bg-neutral-900 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-black dark:text-white">Recent Match Logs</h3>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <span className={`h-1.5 w-1.5 rounded-full ${keeperRunning ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
                  {keeperRunning ? 'Keeper Live' : 'Feed Standing By'}
                </div>
              </div>
              <div className="font-mono text-xs flex flex-col gap-3 max-h-96 overflow-y-auto">
                {dynamicLogs.length === 0 ? (
                  <div className="py-8 text-center text-neutral-400 dark:text-neutral-500 font-sans text-xs italic">
                    No match events recorded on-chain or in active keeper loop yet.
                    <br />
                    Start the Keeper Bot or deploy matching orders to see live execution logs.
                  </div>
                ) : (
                  dynamicLogs.map((log, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-50 dark:border-neutral-800 pb-3 last:border-none last:pb-0">
                      <div className="flex items-start gap-2">
                        <span
                          className={`text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : log.status === 'SWEEP'
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                          }`}
                        >
                          {log.status}
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-300 font-sans text-[11px]">{log.detail}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-sans">{log.keeper}</span>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{log.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Architecture Diagram */}
            <div data-reveal className="reveal-fade-up border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 bg-neutral-50/30 dark:bg-neutral-900/50">
              <h3 className="text-sm font-bold text-black dark:text-white mb-4 uppercase tracking-wider">Keeper Execution Flow</h3>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
                {[
                  { step: '1', title: 'Scan Events', desc: 'Discover pairs from OrderCreated logs' },
                  { step: '2', title: 'Fetch Orders', desc: 'Paginate active orders per pair' },
                  { step: '3', title: 'Price Check', desc: 'Query currentPrice() on-chain' },
                  { step: '4', title: 'Sweep Match', desc: 'Two-pointer O(N log N) matching' },
                  { step: '5', title: 'Execute', desc: 'Call matchOrders() to settle' },
                ].map((item, idx) => (
                  <React.Fragment key={item.step}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm">
                        {item.step}
                      </div>
                      <span className="text-xs font-bold text-black dark:text-white">{item.title}</span>
                      <span className="text-[9px] text-neutral-400 dark:text-neutral-500 max-w-[120px]">{item.desc}</span>
                    </div>
                    {idx < 4 && (
                      <span className="text-neutral-300 dark:text-neutral-700 font-mono hidden sm:block">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </>
        )}

        {activeSection === 'guide' && (
          <div data-reveal className="reveal-fade-up flex flex-col gap-8">
            {/* Local automation control panel */}
            <KeeperBotPanel />

            {/* Setup Guide */}
            <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 bg-white dark:bg-neutral-900 shadow-xs">
              <h3 className="text-lg font-bold text-black dark:text-white mb-4">Run Your Own Keeper</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                Anyone can operate a keeper node to earn matching fees. The keeper scans for compatible orders and executes
                settlement transactions on-chain, earning 0.1% of each matched trade.
              </p>

              <div className="flex flex-col gap-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <h4 className="text-sm font-bold text-black dark:text-white">Clone & Install</h4>
                    <CodeBlock
                      platforms={{
                        macos: `git clone https://github.com/StabilityNexus/Windmill-EVM-Keeper.git && cd Windmill-EVM-Keeper && npm ci`,
                        linux: `git clone https://github.com/StabilityNexus/Windmill-EVM-Keeper.git && cd Windmill-EVM-Keeper && npm ci`,
                        windows: `git clone https://github.com/StabilityNexus/Windmill-EVM-Keeper.git; cd Windmill-EVM-Keeper; npm ci`,
                      }}
                    />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <div className="flex-1 flex flex-col gap-3">
                    <h4 className="text-sm font-bold text-black dark:text-white">Configure Environment</h4>
                    <CodeBlock
                      label="Copy environment template"
                      platforms={{
                        macos: `cp .env.example .env`,
                        linux: `cp .env.example .env`,
                        windows: `Copy-Item .env.example .env`,
                      }}
                    />
                    <CodeBlock
                      label="Sample .env configuration"
                      code={`KEEPER_STRATEGY=windmill
RPC_URL=https://sepolia.base.org
EXPECTED_CHAIN_ID=84532
PRIVATE_KEY=<your-keeper-wallet-private-key>
CONTRACT_ADDRESS=<deployed-windmill-exchange-address>
KEEPER_INTERVAL_MS=15000
DRY_RUN=false`}
                    />
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </div>
                  <div className="flex-1 flex flex-col gap-3">
                    <h4 className="text-sm font-bold text-black dark:text-white">Run the Keeper</h4>
                    <CodeBlock
                      label="1. Dry run test (simulation only, no transactions)"
                      code={`npm run start:dry-run`}
                    />
                    <CodeBlock
                      label="2. Single cycle test"
                      code={`npm run start:once`}
                    />
                    <CodeBlock
                      label="3. Production continuous daemon"
                      code={`npm run start`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Calculator */}
            <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 bg-white dark:bg-neutral-900 shadow-xs">
              <h3 className="text-lg font-bold text-black dark:text-white mb-4">Keeper Economics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 p-4 text-center">
                  <span className="text-2xl font-bold font-mono text-black dark:text-white">0.1%</span>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-semibold mt-1">Fee per Match</p>
                  <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-2">Calculated on the notional amount of each settled trade</p>
                </div>
                <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 p-4 text-center">
                  <span className="text-2xl font-bold font-mono text-black dark:text-white">~120k</span>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-semibold mt-1">Gas per Match</p>
                  <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-2">Average gas units consumed by matchOrders()</p>
                </div>
                <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 p-4 text-center">
                  <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">Profitable</span>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-semibold mt-1">On L2 Chains</p>
                  <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-2">Base, Polygon, BSC offer low gas for high-frequency matching</p>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 bg-white dark:bg-neutral-900 shadow-xs">
              <h3 className="text-lg font-bold text-black dark:text-white mb-3">Requirements</h3>
              <ul className="flex flex-col gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white shrink-0" />
                  Node.js 20+ runtime
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white shrink-0" />
                  Funded wallet for gas (keeper earns 0.1% per match to offset costs)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white shrink-0" />
                  RPC endpoint (free public endpoints available for all supported chains)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white shrink-0" />
                  Deployed WindmillExchange contract address
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

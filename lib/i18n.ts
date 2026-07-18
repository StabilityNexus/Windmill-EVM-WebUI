// ─── Centralized Translation Constants ──────────────────────────
// All user-visible strings are externalized here.
// When a full i18n library (e.g. next-intl) is adopted, this file
// becomes the default-locale message bundle.

export const t = {
  // ── Brand ─────────────────────────────────────────────────────
  brand: {
    name: 'WINDMILL',
    logoAlt: 'Windmill Protocol Logo',
  },

  // ── Navigation ────────────────────────────────────────────────
  nav: {
    mainNavigation: 'Main navigation',
    dex: 'DEX',
    swap: 'Swap',
    pools: 'Pools',
    keepers: 'Keepers',
    docs: 'Docs',
    connectWallet: 'Connect Wallet',
    connected: 'Connected',
    disconnect: 'Disconnect',
    network: 'Network',
    mobileMenuOpen: 'Open navigation menu',
    mobileMenuClose: 'Close navigation menu',
  },

  // ── Network Names ─────────────────────────────────────────────
  networks: {
    ethereum: 'Ethereum',
    base: 'Base',
    polygon: 'Polygon',
    arbitrum: 'Arbitrum',
  },

  // ── Hero Section ──────────────────────────────────────────────
  hero: {
    pill: 'Your multi-chain trading terminal.',
    heading1: 'Dynamic cross-chain swaps.',
    heading2: 'Powered by Keepers.',
    description:
      'Windmill unifies liquidity across all EVM chains, matching orders with unparalleled speed and dynamic optimal pricing, all from one integrated terminal.',
    ctaPrimary: 'Access Terminal',
    ctaSecondary: 'Read Technical Docs',
    tags: [
      'Solver Network',
      'Zero Hidden Fees',
      'Dynamic Pricing',
      'Multi-Chain',
    ] as readonly string[],
  },

  // ── Stats Dashboard ───────────────────────────────────────────
  stats: {
    dashboardTitle: 'Protocol Dashboard',
    liveAnalytics: {
      title: 'Live Analytics',
      subtitle: 'Real-time throughput',
      value: '2,847',
      unit: 'tx/s',
      change: '+12.4%',
    },
    volumeTrend: {
      title: 'Volume Trend',
      subtitle: '24h volume',
      value: '$24.7M',
      change: '+8.2%',
    },
    systemHealth: {
      title: 'System Health',
      subtitle: 'Protocol uptime',
      value: '99.97%',
      barPercent: 99.97,
    },
    solverUptime: {
      title: 'Solver Uptime',
      subtitle: 'Active solvers',
      value: '98.5%',
      percent: 98.5,
    },
    tradingStats: {
      title: 'Trading Statistics',
      subtitle: 'Protocol metrics',
      pairs: [
        { label: 'Total Trades', value: '12,845+' },
        { label: 'Active Traders', value: '3,120+' },
        { label: 'Avg Settlement', value: '1.2s' },
        { label: 'Keeper Fee', value: '0.1%' },
      ] as readonly { label: string; value: string }[],
    },
    networkStatus: {
      title: 'Network Status',
      subtitle: 'Chain connectivity',
      entries: [
        { name: 'Ethereum', state: 'Active' },
        { name: 'Base', state: 'Active' },
        { name: 'Polygon', state: 'Syncing' },
        { name: 'Arbitrum', state: 'Active' },
      ] as readonly { name: string; state: string }[],
    },
    nodeExecution: {
      title: 'Node Execution',
      subtitle: 'Keeper performance',
      metrics: [
        { label: 'Matched', value: '4,291' },
        { label: 'Pending', value: '127' },
        { label: 'Avg Gas', value: '42 gwei' },
        { label: 'Success Rate', value: '99.8%' },
      ] as readonly { label: string; value: string }[],
    },
    portfolio: {
      title: 'Top Pairs',
      subtitle: 'By volume',
      tokens: [
        { pair: 'ETH / USDC', volume: '$8.4M', change: '+5.1%' },
        { pair: 'WBTC / DAI', volume: '$4.2M', change: '+2.8%' },
        { pair: 'ARB / ETH', volume: '$2.1M', change: '-1.3%' },
      ] as readonly { pair: string; volume: string; change: string }[],
    },
  },
} as const;

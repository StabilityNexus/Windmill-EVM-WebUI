// ─── Windmill Exchange — Contract Configuration ──────────────────────
// Central config for ABI, chains, tokens, and deployed addresses.

// ─── ABI (matches WindmillExchange.sol public interface) ─────────────
export const WINDMILL_EXCHANGE_ABI = [
  // ── Order Lifecycle ──
  'function createOrder(address tokenIn, address tokenOut, uint256 amountIn, uint256 startPrice, int256 slope, uint256 minPrice, uint256 maxPrice, uint256 expiry, bool isBuy) external payable returns (uint256 orderId)',
  'function cancelOrder(uint256 orderId) external',
  'function matchOrders(uint256 buyOrderId, uint256 sellOrderId, uint256 deadline) external',
  'function matchOrdersBatch(uint256 orderId, uint256[] calldata counterOrderIds, uint256 deadline) external',

  // ── View Functions ──
  'function getOrder(uint256 orderId) external view returns (tuple(uint256 id, address maker, bool isBuy, bool active, address tokenIn, address tokenOut, uint256 amountIn, uint256 remainingIn, uint256 startPrice, int256 slope, uint256 minPrice, uint256 maxPrice, uint256 createdAt, uint256 expiry))',
  'function getOrdersByPair(address tokenA, address tokenB, uint256 cursor, uint256 limit) external view returns (uint256[])',
  'function currentPrice(uint256 orderId, uint256 timestamp) external view returns (uint256)',
  'function totalOrders() external view returns (uint256)',

  // ── Admin ──
  'function owner() external view returns (address)',
  'function paused() external view returns (bool)',
  'function treasury() external view returns (address)',
  'function protocolFeeBps() external view returns (uint256)',
  'function WETH() external view returns (address)',

  // ── Events ──
  'event OrderCreated(uint256 indexed orderId, address indexed maker, address indexed tokenIn, address tokenOut, uint256 amountIn, bool isBuy)',
  'event OrderCancelled(uint256 indexed orderId, address indexed maker, uint256 refund)',
  'event OrderMatched(uint256 indexed buyOrderId, uint256 indexed sellOrderId, address indexed keeper, uint256 settlementPrice, uint256 executedQuantity)',
  'event OrderFilled(uint256 indexed orderId)',
  'event OrderPartiallyFilled(uint256 indexed orderId, uint256 remainingIn)',
  'event ProtocolFeeUpdated(address treasury, uint256 protocolFeeBps)',
  'event OwnershipTransferred(address oldOwner, address newOwner)',
  'event Paused(address indexed by)',
  'event Unpaused(address indexed by)',
] as const;

// ── ERC-20 ABI (minimal for balance/approve/allowance) ──────────────
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
] as const;

// ─── Chain Configurations ────────────────────────────────────────────

export interface ChainConfig {
  networkType: 'Local' | 'Testnet' | 'Mainnet';
  chainId: number;
  name: string;
  shortName: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  contractAddress: string;
  wethAddress: string;
}

export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  // ── Localhost / Anvil ──
  31337: {
    networkType: 'Local',
    chainId: 31337,
    name: 'Anvil Localhost',
    shortName: 'Localhost',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545',
    explorerUrl: 'http://localhost:8545',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LOCAL || '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    wethAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  },
  // ── Testnets ──
  11155111: {
    networkType: 'Testnet',
    chainId: 11155111,
    name: 'Sepolia Testnet',
    shortName: 'Sepolia',
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || process.env.NEXT_PUBLIC_WINDMILL_EXCHANGE_ADDRESS || '0x96dce657ba9bd3db2533bbee0b2e2dbf334232d2',
    wethAddress: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
  },
  // ── Mainnets ──
  1: {
    networkType: 'Mainnet',
    chainId: 1,
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    rpcUrl: 'https://rpc.ankr.com/eth',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_ETH || '',
    wethAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  137: {
    networkType: 'Mainnet',
    chainId: 137,
    name: 'Polygon PoS',
    shortName: 'Polygon',
    rpcUrl: 'https://rpc.ankr.com/polygon',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_POLYGON || '',
    wethAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  },
  8453: {
    networkType: 'Mainnet',
    chainId: 8453,
    name: 'Base',
    shortName: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_BASE || '',
    wethAddress: '0x4200000000000000000000000000000000000006',
  },
  56: {
    networkType: 'Mainnet',
    chainId: 56,
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    rpcUrl: 'https://bsc-dataseed.bnbchain.org',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_BSC || '',
    wethAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  },
  61: {
    networkType: 'Mainnet',
    chainId: 61,
    name: 'Ethereum Classic',
    shortName: 'ETC',
    rpcUrl: 'https://etc.rivet.link',
    explorerUrl: 'https://blockscout.com/etc/mainnet',
    nativeCurrency: { name: 'ETC', symbol: 'ETC', decimals: 18 },
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_ETC || '',
    wethAddress: '0x1953cab0E5F4e24146bEB505b51e4645Bf227856',
  },
};

export const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || 11155111);

export function getChainConfig(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS[chainId];
}

export function getExplorerTxUrl(chainId: number, txHash: string): string {
  const chain = SUPPORTED_CHAINS[chainId];
  if (!chain) return '#';
  return `${chain.explorerUrl}/tx/${txHash}`;
}

export function getExplorerAddressUrl(chainId: number, address: string): string {
  const chain = SUPPORTED_CHAINS[chainId];
  if (!chain) return '#';
  return `${chain.explorerUrl}/address/${address}`;
}

// ─── Token Metadata ──────────────────────────────────────────────────

export interface TokenMeta {
  symbol: string;
  name: string;
  decimals: number;
  addresses: Record<number, string>; // chainId → address
  logoEmoji: string;
}

export const SUPPORTED_TOKENS: TokenMeta[] = [
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    addresses: {
      31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      11155111: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
      8453: '0x4200000000000000000000000000000000000006',
      137: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    },
    logoEmoji: 'Ξ',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    addresses: {
      31337: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      137: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    },
    logoEmoji: '$',
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    addresses: {
      1: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      8453: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      137: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    },
    logoEmoji: '◈',
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    addresses: {
      1: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      137: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    },
    logoEmoji: '₿',
  },
];

export function getTokenAddress(symbol: string, chainId: number): string | undefined {
  const token = SUPPORTED_TOKENS.find((t) => t.symbol === symbol);
  return token?.addresses[chainId];
}

export function getTokenByAddress(address: string, chainId: number): TokenMeta | undefined {
  const lower = address.toLowerCase();
  return SUPPORTED_TOKENS.find((t) => {
    const addr = t.addresses[chainId];
    return addr && addr.toLowerCase() === lower;
  });
}

// ─── RAY constant (1e27) used in price calculations ─────────────────
export const RAY = BigInt('1000000000000000000000000000');

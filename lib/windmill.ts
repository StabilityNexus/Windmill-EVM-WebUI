import { Contract, EventLog, JsonRpcProvider } from 'ethers';

const RAY = BigInt('1000000000000000000000000000');

export const windmillAbi = [
  'function paused() view returns (bool)',
  'function protocolFeeBps() view returns (uint256)',
  'function totalOrders() view returns (uint256)',
  'function getOrder(uint256 orderId) view returns (tuple(uint256 id,address maker,bool isBuy,bool active,address tokenIn,address tokenOut,uint256 amountIn,uint256 remainingIn,uint256 startPrice,int256 slope,uint256 minPrice,uint256 maxPrice,uint256 createdAt,uint256 expiry))',
  'event OrderMatched(uint256 indexed buyOrderId,uint256 indexed sellOrderId,address indexed keeper,uint256 settlementPrice,uint256 executedQuantity)',
] as const;

function readRequired(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export function getWindmillContract() {
  const rpcUrl = readRequired('WINDMILL_RPC_URL');
  const address = readRequired('WINDMILL_CONTRACT_ADDRESS');
  const provider = new JsonRpcProvider(rpcUrl);
  return { contract: new Contract(address, windmillAbi, provider), provider };
}

export async function getProtocolStats() {
  const { contract, provider } = getWindmillContract();
  const [totalOrdersValue, paused, protocolFeeBps, currentBlock] = await Promise.all([
    contract.totalOrders(),
    contract.paused(),
    contract.protocolFeeBps(),
    provider.getBlockNumber(),
  ]);
  const totalOrders = Number(totalOrdersValue);
  const deploymentBlock = Number(process.env.WINDMILL_DEPLOY_BLOCK ?? 0);
  const lookbackBlocks = Number(process.env.WINDMILL_EVENT_LOOKBACK_BLOCKS ?? 10_000);
  const fromBlock = Math.max(deploymentBlock, currentBlock - lookbackBlocks);
  const matches = (await contract.queryFilter(contract.filters.OrderMatched(), fromBlock, currentBlock)) as EventLog[];

  const orderScanLimit = Number(process.env.WINDMILL_MAX_ORDER_SCAN ?? 500);
  const firstOrderId = Math.max(1, totalOrders - orderScanLimit + 1);
  const orders = await Promise.all(
    Array.from({ length: Math.max(0, totalOrders - firstOrderId + 1) }, (_, index) => contract.getOrder(firstOrderId + index)),
  );
  const activeOrders = orders.filter((order) => order.active).length;
  const totalNotional = matches.reduce((total, log) => {
    const { settlementPrice, executedQuantity } = log.args;
    return total + (executedQuantity * RAY) / settlementPrice;
  }, BigInt(0));

  return {
    updatedAt: new Date().toISOString(),
    network: (await provider.getNetwork()).chainId.toString(),
    currentBlock,
    paused,
    protocolFeeBps: protocolFeeBps.toString(),
    totalOrders,
    activeOrders,
    activeOrdersArePartial: firstOrderId > 1,
    matchedOrders: matches.length,
    totalNotional: totalNotional.toString(),
    recentMatches: matches.slice(-10).reverse().map((log) => ({
      buyOrderId: log.args.buyOrderId.toString(),
      sellOrderId: log.args.sellOrderId.toString(),
      keeper: log.args.keeper,
      settlementPrice: log.args.settlementPrice.toString(),
      executedQuantity: log.args.executedQuantity.toString(),
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
    })),
  };
}

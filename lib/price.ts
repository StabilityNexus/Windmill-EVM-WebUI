import { formatUnits, parseUnits } from 'ethers';

const RAY_DECIMALS = 27;
export const MAX_SLOPE_RAY =
  BigInt('340282366920938463463374607431768211455') / BigInt('315360000');

export interface PriceOrientation {
  baseDecimals: number;
  quoteDecimals: number;
}

export function getOrderPriceOrientation(
  isBuy: boolean,
  tokenInDecimals: number,
  tokenOutDecimals: number
): PriceOrientation {
  return isBuy
    ? { baseDecimals: tokenInDecimals, quoteDecimals: tokenOutDecimals }
    : { baseDecimals: tokenOutDecimals, quoteDecimals: tokenInDecimals };
}

function getPriceScaleDecimals(baseDecimals: number, quoteDecimals: number): number {
  const decimals = RAY_DECIMALS + quoteDecimals - baseDecimals;
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new RangeError('Token decimals cannot be represented as a RAY price');
  }
  return decimals;
}

function expandScientificNotation(value: string): string {
  const match = /^([+-]?)(\d+)(?:\.(\d*))?[eE]([+-]?\d+)$/.exec(value);
  if (!match) return value;
  const [, sign, integer, fraction = '', rawExponent] = match;
  const digits = `${integer}${fraction}`;
  const exponent = Number(rawExponent);
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 1000) {
    throw new RangeError('Price exponent is outside the supported range');
  }
  const decimalIndex = integer.length + exponent;
  if (decimalIndex <= 0) {
    return `${sign}0.${'0'.repeat(-decimalIndex)}${digits}`;
  }
  if (decimalIndex >= digits.length) {
    return `${sign}${digits}${'0'.repeat(decimalIndex - digits.length)}`;
  }
  return `${sign}${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
}

export function priceToRay(
  value: string | number,
  baseDecimals: number,
  quoteDecimals: number
): bigint {
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new RangeError('Price must be finite');
  }
  const decimalValue = expandScientificNotation(String(value).trim());
  if (!decimalValue) throw new RangeError('Price is required');
  return parseUnits(decimalValue, getPriceScaleDecimals(baseDecimals, quoteDecimals));
}

export function priceFromRay(
  raw: unknown,
  baseDecimals: number,
  quoteDecimals: number
): number {
  if (raw === null || raw === undefined) {
    throw new TypeError('RAY price is required');
  }
  const rawValue = typeof raw === 'object' ? raw.toString() : String(raw);
  const decoded = Number(
    formatUnits(BigInt(rawValue), getPriceScaleDecimals(baseDecimals, quoteDecimals))
  );
  if (!Number.isFinite(decoded)) {
    throw new RangeError('RAY price is outside the displayable range');
  }
  return decoded;
}

export function isSlopeWithinContractLimit(slopeRay: bigint): boolean {
  const magnitude = slopeRay < BigInt(0) ? -slopeRay : slopeRay;
  return magnitude <= MAX_SLOPE_RAY;
}

export function currentPriceRay(
  startPrice: bigint,
  slope: bigint,
  minPrice: bigint,
  maxPrice: bigint,
  elapsedSeconds: bigint
): bigint {
  let price = startPrice + slope * elapsedSeconds;
  if (price < BigInt(0)) price = BigInt(0);
  if (minPrice > BigInt(0) && price < minPrice) price = minPrice;
  if (maxPrice > BigInt(0) && price > maxPrice) price = maxPrice;
  return price;
}

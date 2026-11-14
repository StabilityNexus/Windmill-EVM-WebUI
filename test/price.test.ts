import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  currentPriceRay,
  getOrderPriceOrientation,
  isSlopeWithinContractLimit,
  MAX_SLOPE_RAY,
  priceFromRay,
  priceToRay,
} from '../lib/price';

describe('RAY price conversion', () => {
  it('keeps the buy and mirrored sell in the same orientation', () => {
    const buy = getOrderPriceOrientation(true, 18, 6);
    const sell = getOrderPriceOrientation(false, 6, 18);

    assert.deepEqual(buy, { baseDecimals: 18, quoteDecimals: 6 });
    assert.deepEqual(sell, buy);
  });

  it('normalizes a WETH/USDC price using both token decimals', () => {
    assert.equal(priceToRay('3000', 18, 6), BigInt('3000000000000000000'));
    assert.equal(priceFromRay(BigInt('3000000000000000000'), 18, 6), 3000);
  });

  it('uses the same scale for slopes and bounds', () => {
    assert.equal(priceToRay(-0.2, 18, 6), BigInt('-200000000000000'));
    assert.equal(priceToRay(0, 18, 6), BigInt(0));
  });

  it('preserves the standard RAY scale for equal-decimal pairs', () => {
    assert.equal(priceToRay(1, 18, 18), BigInt('1000000000000000000000000000'));
    assert.equal(priceFromRay(BigInt('1000000000000000000000000000'), 18, 18), 1);
  });

  it('rejects values with more precision than the pair can encode', () => {
    assert.throws(() => priceToRay('0.0000000000000001', 18, 6));
  });

  it('accepts scientific notation without converting through floating point', () => {
    assert.equal(priceToRay('1.079e-9', 6, 18), BigInt('1079000000000000000000000000000'));
  });

  it('reproduces a one WETH for 3000 USDC settlement', () => {
    const ray = BigInt('1000000000000000000000000000');
    const price = priceToRay('3000', 18, 6);
    const buyInput = BigInt('1000000000000000000');
    const sellInput = BigInt('3000000000');
    const executableQuote = (buyInput * price) / ray;
    const executedQuote = executableQuote < sellInput ? executableQuote : sellInput;
    const basePayment = (executedQuote * ray) / price;

    assert.equal(executedQuote, sellInput);
    assert.equal(basePayment, buyInput);
  });

  it('enforces the contract slope limit and computes curves in raw units', () => {
    assert.equal(isSlopeWithinContractLimit(MAX_SLOPE_RAY), true);
    assert.equal(isSlopeWithinContractLimit(MAX_SLOPE_RAY + BigInt(1)), false);
    assert.equal(
      currentPriceRay(BigInt(100), BigInt(-2), BigInt(50), BigInt(0), BigInt(30)),
      BigInt(50)
    );
  });
});

import { HERMES_URL, AssetId, ASSET_FEED_IDS } from './constants';

export interface PriceData {
  price: number;       // USD
  conf: number;        // confidence interval USD
  publishTime: number; // unix seconds
  raw: bigint;         // scaled by 10^8 (matches on-chain i64)
}

export interface RoundPrices {
  start: PriceData;
  end: PriceData;
  high: number;
  low: number;
}

export async function fetchLatestPrice(assetId: AssetId): Promise<PriceData> {
  const feedId = ASSET_FEED_IDS[assetId];
  const res = await fetch(
    `${HERMES_URL}/v2/updates/price/latest?ids[]=${feedId}&parsed=true`
  );
  if (!res.ok) throw new Error(`Pyth fetch failed: ${res.status}`);
  const json = await res.json();
  const parsed = json.parsed?.[0];
  if (!parsed) throw new Error('No price data from Pyth');
  const exp = parsed.price.expo; // typically -8
  const priceInt = BigInt(parsed.price.price);
  const priceUsd = Number(priceInt) * Math.pow(10, exp);
  const confUsd = Number(BigInt(parsed.price.conf)) * Math.pow(10, exp);
  // Store as i64 with 8 decimals to match on-chain format
  const raw = priceInt * BigInt(Math.pow(10, 8 + exp));
  return {
    price: priceUsd,
    conf: confUsd,
    publishTime: parsed.price.publish_time,
    raw,
  };
}

// Poll price every N ms and call onTick with latest price
export function streamPrice(
  assetId: AssetId,
  intervalMs: number,
  onTick: (data: PriceData) => void,
  onError?: (err: Error) => void,
): () => void {
  let active = true;
  const poll = async () => {
    if (!active) return;
    try {
      const data = await fetchLatestPrice(assetId);
      if (active) onTick(data);
    } catch (e) {
      onError?.(e as Error);
    }
    if (active) setTimeout(poll, intervalMs);
  };
  poll();
  return () => { active = false; };
}

// Format a raw i64 price (8 decimals) back to USD float
export function rawToUsd(raw: bigint | number, decimals = 8): number {
  return Number(raw) / Math.pow(10, decimals);
}

export function formatUsd(price: number, symbol: string): string {
  if (symbol === 'SOL' || price < 1000) {
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatDelta(delta: number): string {
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${(delta * 100).toFixed(3)}%`;
}

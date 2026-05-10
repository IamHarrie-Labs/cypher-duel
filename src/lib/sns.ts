/**
 * Lightweight Solana Name Service (SNS) reverse-lookup using the Bonfida
 * public proxy — no extra npm package required.
 *
 * Falls back to a shortened wallet address on any error.
 */

const PROXY = 'https://sns-sdk-proxy.bonfida.workers.dev';

// Simple in-process cache — avoids re-fetching the same address in one session.
const cache = new Map<string, string>();

/**
 * Resolve a wallet address to a .sol domain name.
 * Returns the .sol name (e.g. "cryptoKing.sol") or a shortened address
 * (e.g. "AbCd…XyZ9") if no domain is registered.
 */
export async function resolveIdentity(address: string): Promise<string> {
  if (!address) return '';
  if (cache.has(address)) return cache.get(address)!;

  const short = address.slice(0, 4) + '…' + address.slice(-4);

  try {
    const res = await fetch(`${PROXY}/reverse-lookup/${address}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const json = await res.json();
      const name = json?.result ? json.result + '.sol' : short;
      cache.set(address, name);
      return name;
    }
  } catch {
    // network / timeout — fall through to short address
  }

  cache.set(address, short);
  return short;
}

/**
 * Synchronous version — returns whatever is in the cache, or a short address.
 * Use this when you can't await (e.g. inside render without useEffect).
 */
export function resolveIdentitySync(address: string): string {
  if (!address) return '';
  return cache.get(address) ?? address.slice(0, 4) + '…' + address.slice(-4);
}

/**
 * Pre-warm the cache for a list of addresses in parallel.
 */
export async function prefetchIdentities(addresses: string[]): Promise<void> {
  await Promise.allSettled(addresses.map(resolveIdentity));
}

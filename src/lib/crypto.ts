// Mirrors the on-chain SHA256 commit: hash(cards[3] || directions[3] || snipe_target_le8 || salt[32])

export function buildCommitData(
  cards: number[],
  directions: number[],
  snipeTarget: bigint,
  salt: Uint8Array,
): Uint8Array {
  const data = new Uint8Array(46);
  data[0] = cards[0];
  data[1] = cards[1];
  data[2] = cards[2];
  data[3] = directions[0];
  data[4] = directions[1];
  data[5] = directions[2];
  // snipe_target as little-endian i64
  const view = new DataView(data.buffer, 6, 8);
  view.setBigInt64(0, snipeTarget, true);
  data.set(salt.slice(0, 32), 14);
  return data;
}

export async function computeCommitHash(
  cards: number[],
  directions: number[],
  snipeTarget: bigint,
  salt: Uint8Array,
): Promise<Uint8Array> {
  const data = buildCommitData(cards, directions, snipeTarget, salt);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuf);
}

export function randomSalt(): Uint8Array {
  const salt = new Uint8Array(32);
  crypto.getRandomValues(salt);
  return salt;
}

export function saltToHex(salt: Uint8Array): string {
  return Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function hexToSalt(hex: string): Uint8Array {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

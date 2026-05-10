import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { PROGRAM_ID } from './constants';

// IDL from deployed program EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN (slot 461111930)
// types[] added manually — the on-chain IDL omitted them, causing anchor.Program() to throw.
// Field order inferred from the memcmp filter in MatchLobby (state at byte offset 81):
//   discriminator(8) + playerA(32) + playerB(32) + asset(1) + stakeAmount(8) = 81, then state(1)
const IDL: anchor.Idl = {
  address: 'EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN',
  metadata: { name: 'workspace', version: '0.1.0', spec: '0.1.0', description: 'Cypher — deployed on devnet' },
  instructions: [
    {
      name: 'cancel_match',
      discriminator: [142, 136, 247, 45, 92, 112, 180, 83],
      accounts: [
        { name: 'match_account', writable: true, pda: { seeds: [{ kind: 'const', value: [109,97,116,99,104] }, { kind: 'arg', path: 'match_id' }] } },
        { name: 'vault', writable: true, pda: { seeds: [{ kind: 'const', value: [118,97,117,108,116] }, { kind: 'arg', path: 'match_id' }] } },
        { name: 'player', writable: true, signer: true },
        { name: 'system_program', address: '11111111111111111111111111111111' },
      ],
      args: [{ name: '_match_id', type: 'u64' }],
    },
    {
      name: 'claim_forfeit',
      discriminator: [42, 69, 137, 86, 190, 158, 173, 17],
      accounts: [
        { name: 'config', pda: { seeds: [{ kind: 'const', value: [97,114,101,110,97,95,99,111,110,102,105,103] }] } },
        { name: 'match_account', writable: true, pda: { seeds: [{ kind: 'const', value: [109,97,116,99,104] }, { kind: 'arg', path: 'match_id' }] } },
        { name: 'vault', writable: true, pda: { seeds: [{ kind: 'const', value: [118,97,117,108,116] }, { kind: 'arg', path: 'match_id' }] } },
        { name: 'player', writable: true, signer: true },
        { name: 'treasury', writable: true },
        { name: 'system_program', address: '11111111111111111111111111111111' },
      ],
      args: [{ name: '_match_id', type: 'u64' }],
    },
    {
      name: 'commit_plays',
      discriminator: [255, 123, 129, 121, 67, 164, 152, 169],
      accounts: [
        { name: 'match_account', writable: true, pda: { seeds: [{ kind: 'const', value: [109,97,116,99,104] }, { kind: 'arg', path: 'match_id' }] } },
        { name: 'player', signer: true },
      ],
      args: [
        { name: '_match_id', type: 'u64' },
        { name: 'commit_hash', type: { array: ['u8', 32] } },
      ],
    },
    {
      name: 'create_match',
      discriminator: [107, 2, 184, 145, 70, 142, 17, 165],
      accounts: [
        { name: 'config', writable: true, pda: { seeds: [{ kind: 'const', value: [97,114,101,110,97,95,99,111,110,102,105,103] }] } },
        { name: 'match_account', writable: true, pda: { seeds: [{ kind: 'const', value: [109,97,116,99,104] }, { kind: 'arg', path: 'match_id' }] } },
        { name: 'vault', writable: true, pda: { seeds: [{ kind: 'const', value: [118,97,117,108,116] }, { kind: 'arg', path: 'match_id' }] } },
        { name: 'player', writable: true, signer: true },
        { name: 'system_program', address: '11111111111111111111111111111111' },
      ],
      args: [
        { name: 'asset', type: 'u8' },
        { name: 'stake_amount', type: 'u64' },
        { name: 'match_id', type: 'u64' },
      ],
    },
    {
      name: 'initialize_config',
      discriminator: [208, 127, 21, 1, 194, 190, 196, 70],
      accounts: [
        { name: 'config', writable: true, pda: { seeds: [{ kind: 'const', value: [97,114,101,110,97,95,99,111,110,102,105,103] }] } },
        { name: 'authority', writable: true, signer: true },
        { name: 'system_program', address: '11111111111111111111111111111111' },
      ],
      args: [
        { name: 'fee_bps', type: 'u16' },
        { name: 'treasury', type: 'pubkey' },
      ],
    },
    {
      name: 'join_match',
      discriminator: [244, 8, 47, 130, 192, 59, 179, 44],
      accounts: [
        { name: 'config', writable: true, pda: { seeds: [{ kind: 'const', value: [97,114,101,110,97,95,99,111,110,102,105,103] }] } },
        { name: 'match_account', writable: true, pda: { seeds: [{ kind: 'const', value: [109,97,116,99,104] }, { kind: 'arg', path: 'match_id' }] } },
        { name: 'vault', writable: true, pda: { seeds: [{ kind: 'const', value: [118,97,117,108,116] }, { kind: 'arg', path: 'match_id' }] } },
        { name: 'player', writable: true, signer: true },
        { name: 'system_program', address: '11111111111111111111111111111111' },
      ],
      args: [
        { name: '_match_id', type: 'u64' },
        { name: 'start_price', type: 'i64' },
      ],
    },
    {
      name: 'reveal_plays',
      discriminator: [235, 15, 103, 211, 154, 57, 45, 0],
      accounts: [
        { name: 'match_account', writable: true, pda: { seeds: [{ kind: 'const', value: [109,97,116,99,104] }, { kind: 'arg', path: 'match_id' }] } },
        { name: 'player', signer: true },
      ],
      args: [
        { name: '_match_id', type: 'u64' },
        { name: 'cards', type: { array: ['u8', 3] } },
        { name: 'directions', type: { array: ['u8', 3] } },
        { name: 'snipe_target', type: 'i64' },
        { name: 'salt', type: { array: ['u8', 32] } },
      ],
    },
    {
      name: 'settle_match',
      discriminator: [71, 124, 117, 96, 191, 217, 116, 24],
      accounts: [
        { name: 'config', writable: true, pda: { seeds: [{ kind: 'const', value: [97,114,101,110,97,95,99,111,110,102,105,103] }] } },
        { name: 'match_account', writable: true, pda: { seeds: [{ kind: 'const', value: [109,97,116,99,104] }, { kind: 'arg', path: 'match_id' }] } },
        { name: 'vault', writable: true, pda: { seeds: [{ kind: 'const', value: [118,97,117,108,116] }, { kind: 'arg', path: 'match_id' }] } },
        { name: 'caller', signer: true },
        { name: 'player_a', writable: true },
        { name: 'player_b', writable: true },
        { name: 'treasury', writable: true },
        { name: 'system_program', address: '11111111111111111111111111111111' },
      ],
      args: [
        { name: '_match_id', type: 'u64' },
        { name: 'end_price', type: 'i64' },
        { name: 'high_price', type: 'i64' },
        { name: 'low_price', type: 'i64' },
      ],
    },
  ],
  accounts: [
    { name: 'ArenaConfig', discriminator: [9, 186, 181, 145, 197, 50, 33, 38] },
    { name: 'MatchAccount', discriminator: [235, 36, 243, 39, 81, 16, 144, 87] },
  ],
  // Type definitions inferred from on-chain layout so anchor.Program() can construct
  // account namespaces without throwing "Account not found".
  types: [
    {
      name: 'ArenaConfig',
      type: {
        kind: 'struct',
        fields: [
          { name: 'authority', type: 'pubkey' },
          { name: 'treasury', type: 'pubkey' },
          { name: 'fee_bps', type: 'u16' },
          { name: 'total_matches', type: 'u64' },
        ],
      },
    },
    {
      name: 'MatchAccount',
      type: {
        kind: 'struct',
        fields: [
          { name: 'player_a', type: 'pubkey' },
          { name: 'player_b', type: 'pubkey' },
          { name: 'asset', type: 'u8' },
          { name: 'stake_amount', type: 'u64' },
          { name: 'state', type: 'u8' },
          { name: 'match_id', type: 'u64' },
          { name: 'start_price', type: 'i64' },
          { name: 'end_price', type: 'i64' },
          { name: 'high_price', type: 'i64' },
          { name: 'low_price', type: 'i64' },
          { name: 'commit_hash_a', type: { array: ['u8', 32] } },
          { name: 'commit_hash_b', type: { array: ['u8', 32] } },
          { name: 'cards_a', type: { array: ['u8', 3] } },
          { name: 'directions_a', type: { array: ['u8', 3] } },
          { name: 'snipe_target_a', type: 'i64' },
          { name: 'cards_b', type: { array: ['u8', 3] } },
          { name: 'directions_b', type: { array: ['u8', 3] } },
          { name: 'snipe_target_b', type: 'i64' },
          { name: 'score_a', type: 'u8' },
          { name: 'score_b', type: 'u8' },
          { name: 'winner', type: 'pubkey' },
          { name: 'created_at', type: 'i64' },
        ],
      },
    },
  ],
} as unknown as anchor.Idl;

export function getProgram(connection: Connection, wallet: AnchorWallet): anchor.Program | null {
  try {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });
    return new anchor.Program(IDL, provider);
  } catch (e) {
    console.warn('[anchor-client] getProgram failed:', (e as Error)?.message ?? e);
    return null;
  }
}

export function getConfigPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('arena_config')], PROGRAM_ID);
}

export function getMatchPDA(matchId: bigint): [PublicKey, number] {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(matchId);
  return PublicKey.findProgramAddressSync([Buffer.from('match'), buf], PROGRAM_ID);
}

export function getVaultPDA(matchId: bigint): [PublicKey, number] {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(matchId);
  return PublicKey.findProgramAddressSync([Buffer.from('vault'), buf], PROGRAM_ID);
}

export function solToLamports(sol: number): bigint {
  return BigInt(Math.floor(sol * LAMPORTS_PER_SOL));
}

export function lamportsToSol(lamports: bigint | number): number {
  return Number(lamports) / LAMPORTS_PER_SOL;
}

// Raw match account layout (bytes):
// disc(8) playerA(32) playerB(32) asset(1) stakeAmount(8) state(1) matchId(8)
// startPrice(8) endPrice(8) highPrice(8) lowPrice(8)
// commitHashA(32) commitHashB(32) cardsA(3) directionsA(3) snipeTargetA(8)
// cardsB(3) directionsB(3) snipeTargetB(8)
// scoreA(1@214) scoreB(1@215) winner(32@216) createdAt(8@248)

export async function fetchMatchState(
  connection: Connection,
  matchId: bigint,
): Promise<{ playerB: string | null; state: number } | null> {
  try {
    const [matchPDA] = getMatchPDA(matchId);
    const info = await connection.getAccountInfo(matchPDA, 'confirmed');
    if (!info) return null;
    const data = info.data;
    const playerBBytes = data.slice(40, 72);
    const isDefault = playerBBytes.every(b => b === 0);
    const playerB = isDefault ? null : new PublicKey(playerBBytes).toBase58();
    const state = data[81];
    return { playerB, state };
  } catch {
    return null;
  }
}

// Read scores and winner after settle_match has been confirmed.
export async function fetchSettledMatch(
  connection: Connection,
  matchId: bigint,
): Promise<{ scoreA: number; scoreB: number; winner: string | null } | null> {
  try {
    const [matchPDA] = getMatchPDA(matchId);
    const info = await connection.getAccountInfo(matchPDA, 'confirmed');
    if (!info) return null;
    const data = info.data;
    const scoreA = data[214];
    const scoreB = data[215];
    const winnerBytes = data.slice(216, 248);
    const isDefault = winnerBytes.every(b => b === 0);
    const winner = isDefault ? null : new PublicKey(winnerBytes).toBase58();
    return { scoreA, scoreB, winner };
  } catch {
    return null;
  }
}

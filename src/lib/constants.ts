import { PublicKey } from '@solana/web3.js';

// Deployed on Solana devnet — slot 461111930
export const PROGRAM_ID = new PublicKey('EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN');

export const CONFIG_SEEDS = Buffer.from('arena_config');

// Pyth price feed IDs (devnet / mainnet share same IDs via Hermes)
export const PYTH_FEEDS = {
  BTC: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  ETH: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  SOL: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
} as const;

export type AssetId = 0 | 1 | 2;
export const ASSET_NAMES: Record<AssetId, string> = { 0: 'BTC', 1: 'ETH', 2: 'SOL' };
export const ASSET_FEED_IDS: Record<AssetId, string> = {
  0: PYTH_FEEDS.BTC,
  1: PYTH_FEEDS.ETH,
  2: PYTH_FEEDS.SOL,
};

export const MIN_STAKE_LAMPORTS = 10_000_000; // 0.01 SOL
export const PROTOCOL_FEE_BPS = 250; // 2.5%

export const HERMES_URL = 'https://hermes.pyth.network';

// Card definitions mirroring on-chain score_card logic
export const CARDS = [
  {
    id: 0,
    name: 'PULSE',
    emoji: '⚡',
    description: 'Price moves >0.3% in any direction',
    reward: 10,
    risk: 'LOW',
    riskColor: '#8FC600' as const,
    requiresDirection: false,
  },
  {
    id: 1,
    name: 'TILT',
    emoji: '📈',
    description: 'Price closes higher or lower than open',
    reward: 15,
    risk: 'LOW',
    riskColor: '#8FC600' as const,
    requiresDirection: true,
  },
  {
    id: 2,
    name: 'SURGE',
    emoji: '🚀',
    description: 'Price moves >1% in chosen direction',
    reward: 30,
    risk: 'MED',
    riskColor: '#FFE400' as const,
    requiresDirection: true,
  },
  {
    id: 3,
    name: 'SNIPE',
    emoji: '🎯',
    description: 'Price touches your exact target band (±$50)',
    reward: 75,
    risk: 'HIGH',
    riskColor: '#FF3B3B' as const,
    requiresDirection: false,
    requiresTarget: true,
  },
  {
    id: 4,
    name: 'WHIPLASH',
    emoji: '🌀',
    description: 'Price reverses — hits both above and below open',
    reward: 60,
    risk: 'HIGH',
    riskColor: '#FF3B3B' as const,
    requiresDirection: false,
  },
  {
    id: 5,
    name: 'CALM',
    emoji: '🧊',
    description: 'Price stays flat — never moves >0.2% from open',
    reward: 50,
    risk: 'HIGH',
    riskColor: '#FF3B3B' as const,
    requiresDirection: false,
  },
] as const;

export type CardDef = typeof CARDS[number];

export const MATCH_STATES = {
  0: 'WaitingForOpponent',
  1: 'WaitingForCommits',
  2: 'WaitingForReveals',
  3: 'ReadyToSettle',
  4: 'Settled',
  5: 'Cancelled',
  6: 'Forfeited',
} as const;

export type MatchStateName = typeof MATCH_STATES[keyof typeof MATCH_STATES];

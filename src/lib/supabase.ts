import { createClient } from '@supabase/supabase-js';

const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase client — null when env vars are not configured.
 * All callers must guard for null (degrades gracefully to in-memory fallbacks).
 *
 * Add to .env.local:
 *   VITE_SUPABASE_URL=https://<project>.supabase.co
 *   VITE_SUPABASE_ANON_KEY=<anon key>
 *
 * Supabase schema (run once in your project's SQL editor):
 *
 *   CREATE TABLE match_joins (
 *     match_id   TEXT PRIMARY KEY,
 *     player_b   TEXT NOT NULL,
 *     asset      TEXT,
 *     stake_sol  NUMERIC,
 *     joined_at  BIGINT NOT NULL
 *   );
 *
 *   CREATE TABLE match_results (
 *     match_id   TEXT PRIMARY KEY,
 *     winner     TEXT,
 *     player_a   TEXT,
 *     player_b   TEXT,
 *     score_a    INT,
 *     score_b    INT,
 *     stake_sol  NUMERIC,
 *     asset      TEXT,
 *     settled_at BIGINT NOT NULL
 *   );
 */
export const supabase = url && key ? createClient(url, key) : null;

export type MatchJoinRow = {
  matchId: string;
  playerB: string;
  asset: string;
  stakeSOL: number;
  joinedAt: number;
};

export type MatchResultRow = {
  matchId: string;
  winner: string | null;
  playerA: string;
  playerB: string;
  scoreA: number;
  scoreB: number;
  stakeSOL: number;
  asset: string;
  settledAt: number;
};

/** Write a match result from the client side (used by SettleView) */
export async function writeMatchResult(row: MatchResultRow): Promise<void> {
  if (!supabase) return;
  await supabase.from('match_results').upsert({
    match_id:   row.matchId,
    winner:     row.winner,
    player_a:   row.playerA,
    player_b:   row.playerB,
    score_a:    row.scoreA,
    score_b:    row.scoreB,
    stake_sol:  row.stakeSOL,
    asset:      row.asset,
    settled_at: row.settledAt,
  });
}

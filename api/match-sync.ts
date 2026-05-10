/**
 * Match-join registry — Supabase-backed with in-memory fallback.
 *
 * Env vars required (Vercel project settings):
 *   SUPABASE_URL       = https://<project>.supabase.co
 *   SUPABASE_ANON_KEY  = <anon key>
 *
 * Without those vars the handler falls back to an in-memory Map, which works
 * for quick demos on a warm Lambda but doesn't survive cold starts.
 */

import { createClient } from '@supabase/supabase-js';

interface JoinRecord {
  matchId: string;
  playerB: string;
  asset: string;
  stakeSOL: number;
  joinedAt: number;
}

// Module-level fallback — used only when Supabase is not configured.
const fallbackJoins = new Map<string, JoinRecord>();

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getSB() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const sb = getSB();

  // ── POST /api/match-sync  { matchId, playerB, asset, stakeSOL } ──
  if (req.method === 'POST') {
    const { matchId, playerB, asset, stakeSOL } = req.body ?? {};
    if (!matchId || !playerB) {
      return res.status(400).json({ error: 'matchId and playerB required' });
    }
    const record: JoinRecord = {
      matchId:  String(matchId),
      playerB,
      asset:    asset ?? 'BTC',
      stakeSOL: Number(stakeSOL) || 0.05,
      joinedAt: Date.now(),
    };

    if (sb) {
      const { error } = await sb.from('match_joins').upsert({
        match_id:  record.matchId,
        player_b:  record.playerB,
        asset:     record.asset,
        stake_sol: record.stakeSOL,
        joined_at: record.joinedAt,
      });
      if (error) console.error('[match-sync POST] supabase error', error.message);
    } else {
      fallbackJoins.set(record.matchId, record);
    }
    return res.status(200).json({ ok: true });
  }

  // ── GET /api/match-sync?matchId=X ──
  if (req.method === 'GET') {
    const matchId = req.query?.matchId as string | undefined;
    if (!matchId) return res.status(400).json({ error: 'matchId required' });

    if (sb) {
      const { data, error } = await sb
        .from('match_joins')
        .select('*')
        .eq('match_id', matchId)
        .maybeSingle();
      if (error) console.error('[match-sync GET] supabase error', error.message);
      if (!data) return res.status(200).json(null);
      return res.status(200).json({
        matchId:  data.match_id,
        playerB:  data.player_b,
        asset:    data.asset,
        stakeSOL: data.stake_sol,
        joinedAt: data.joined_at,
      });
    } else {
      const record = fallbackJoins.get(matchId) ?? null;
      return res.status(200).json(record);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

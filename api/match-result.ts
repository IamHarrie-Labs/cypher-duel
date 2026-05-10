/**
 * POST /api/match-result
 * Persists a settled match result so the leaderboard can aggregate real data.
 *
 * Body: { matchId, winner, playerA, playerB, scoreA, scoreB, stakeSOL, asset }
 *
 * Env vars required (Vercel project settings):
 *   SUPABASE_URL, SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    // Supabase not configured — silently drop, don't block the game
    return res.status(200).json({ ok: true, stored: false });
  }

  const { matchId, winner, playerA, playerB, scoreA, scoreB, stakeSOL, asset } = req.body ?? {};
  if (!matchId || !playerA) {
    return res.status(400).json({ error: 'matchId and playerA required' });
  }

  const sb = createClient(url, key);
  const { error } = await sb.from('match_results').upsert({
    match_id:   String(matchId),
    winner:     winner ?? null,
    player_a:   playerA,
    player_b:   playerB ?? null,
    score_a:    Number(scoreA) || 0,
    score_b:    Number(scoreB) || 0,
    stake_sol:  Number(stakeSOL) || 0,
    asset:      asset ?? 'BTC',
    settled_at: Date.now(),
  });

  if (error) {
    console.error('[match-result] supabase error', error.message);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true, stored: true });
}

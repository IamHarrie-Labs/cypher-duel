/**
 * GET /api/leaderboard
 * Aggregates match_results from Supabase into a ranked player list.
 * Returns { entries, source } where source is 'supabase' | 'unavailable' | 'error'.
 *
 * Env vars required: SUPABASE_URL, SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

type LeaderboardEntry = {
  rank: number;
  player: string;
  wins: number;
  losses: number;
  winRate: string;
  pts: number;
  streak: number;
  tier: string;
  tierColor: string;
};

function getTier(pts: number): { tier: string; tierColor: string } {
  if (pts >= 10000) return { tier: 'GRANDMASTER', tierColor: '#C8FF00' };
  if (pts >= 6000)  return { tier: 'DIAMOND',     tierColor: '#60C8FF' };
  if (pts >= 3000)  return { tier: 'PLATINUM',    tierColor: '#FFE400' };
  if (pts >= 1000)  return { tier: 'GOLD',        tierColor: '#FFA500' };
  return              { tier: 'SILVER',      tierColor: '#AAAAAA' };
}

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    return res.status(200).json({ entries: [], source: 'unavailable' });
  }

  const sb = createClient(url, key);
  const { data, error } = await sb
    .from('match_results')
    .select('winner,player_a,player_b,score_a,score_b,settled_at')
    .order('settled_at', { ascending: false })
    .limit(1000);

  if (error || !data) {
    console.error('[leaderboard]', error?.message);
    return res.status(200).json({ entries: [], source: 'error' });
  }

  // Aggregate per wallet address
  const map: Record<string, { wins: number; losses: number; pts: number; lastSeen: number }> = {};

  for (const row of data) {
    const pa = row.player_a;
    const pb = row.player_b;
    if (!pa) continue;
    for (const addr of [pa, pb].filter(Boolean)) {
      if (!map[addr]) map[addr] = { wins: 0, losses: 0, pts: 0, lastSeen: 0 };
    }
    const scoreA = Number(row.score_a) || 0;
    const scoreB = Number(row.score_b) || 0;
    const ts = Number(row.settled_at) || 0;

    if (row.winner === pa) {
      map[pa].wins  += 1;
      map[pa].pts   += scoreA;
      if (pb) map[pb].losses += 1;
    } else if (row.winner === pb) {
      if (pb) {
        map[pb].wins  += 1;
        map[pb].pts   += scoreB;
      }
      map[pa].losses += 1;
    } else {
      // draw / unresolved — still count points
      map[pa].pts += scoreA;
      if (pb) map[pb].pts += scoreB;
    }
    map[pa].lastSeen = Math.max(map[pa].lastSeen, ts);
    if (pb) map[pb].lastSeen = Math.max(map[pb].lastSeen, ts);
  }

  const entries: LeaderboardEntry[] = Object.entries(map)
    .filter(([, s]) => s.wins + s.losses > 0)
    .sort((a, b) => b[1].pts - a[1].pts || b[1].wins - a[1].wins)
    .slice(0, 50)
    .map(([player, stats], i) => {
      const total = stats.wins + stats.losses;
      const { tier, tierColor } = getTier(stats.pts);
      return {
        rank:     i + 1,
        player:   player.slice(0, 6) + '…' + player.slice(-4),
        wins:     stats.wins,
        losses:   stats.losses,
        winRate:  total > 0 ? ((stats.wins / total) * 100).toFixed(1) + '%' : '0.0%',
        pts:      stats.pts,
        streak:   0,
        tier,
        tierColor,
      };
    });

  return res.status(200).json({ entries, source: 'supabase' });
}

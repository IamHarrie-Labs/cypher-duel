// Lightweight in-memory match join registry.
// Works for hackathon demos where both players interact within the same
// Vercel instance lifetime. Survives cold starts poorly but is good enough
// for short demo sessions; replace with Supabase/KV for production.

interface JoinRecord {
  matchId: string;
  playerB: string;
  asset: string;
  stakeSOL: number;
  joinedAt: number;
}

// Module-level map persists as long as the Lambda stays warm (~5-10 min idle)
const joins = new Map<string, JoinRecord>();

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  // POST /api/match-sync  { matchId, playerB, asset, stakeSOL }
  if (req.method === 'POST') {
    const { matchId, playerB, asset, stakeSOL } = req.body ?? {};
    if (!matchId || !playerB) {
      return res.status(400).json({ error: 'matchId and playerB required' });
    }
    joins.set(String(matchId), {
      matchId: String(matchId),
      playerB,
      asset: asset ?? 'BTC',
      stakeSOL: Number(stakeSOL) || 0.05,
      joinedAt: Date.now(),
    });
    return res.status(200).json({ ok: true });
  }

  // GET /api/match-sync?matchId=X
  if (req.method === 'GET') {
    const matchId = req.query?.matchId as string | undefined;
    if (!matchId) return res.status(400).json({ error: 'matchId required' });
    const record = joins.get(matchId) ?? null;
    return res.status(200).json(record);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

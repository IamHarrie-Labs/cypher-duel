import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from '@solana/web3.js';

// ── Constants ────────────────────────────────────────────────────────────────
const PROGRAM_ID = new PublicKey('EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN');
const RPC_ENDPOINT = 'https://api.devnet.solana.com';
const TREASURY = new PublicKey('7FzTczMDCTvxuiLdBT15ryp1a55FBDVs4Xz5p989C41U');
const PYTH_HERMES = 'https://hermes.pyth.network/v2/updates/price/latest';

// Pyth price feed IDs (devnet)
const PYTH_IDS: Record<string, string> = {
  BTC: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  ETH: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  SOL: 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
};

// ── PDA helpers (Node-side, mirror of anchor-client.ts) ──────────────────────
function getConfigPDA() {
  return PublicKey.findProgramAddressSync([Buffer.from('arena_config')], PROGRAM_ID)[0];
}
function getMatchPDA(matchId: bigint) {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(matchId);
  return PublicKey.findProgramAddressSync([Buffer.from('match'), buf], PROGRAM_ID)[0];
}
function getVaultPDA(matchId: bigint) {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(matchId);
  return PublicKey.findProgramAddressSync([Buffer.from('vault'), buf], PROGRAM_ID)[0];
}

// ── Fetch live Pyth price (Node fetch) ──────────────────────────────────────
async function fetchPythPrice(asset: string): Promise<bigint> {
  try {
    const feedId = PYTH_IDS[asset.toUpperCase()] ?? PYTH_IDS['BTC'];
    const res = await fetch(`${PYTH_HERMES}?ids[]=${feedId}`);
    if (!res.ok) throw new Error('Pyth fetch failed');
    const data = await res.json() as { parsed: Array<{ price: { price: string; expo: number } }> };
    const raw = BigInt(data.parsed[0].price.price);
    return raw;
  } catch {
    // Fallback: $97,500 in Pyth raw units (expo -8)
    return BigInt(97500_00000000);
  }
}

// ── Build join_match instruction ─────────────────────────────────────────────
// Discriminator: [244, 8, 47, 130, 192, 59, 179, 44]
// Args: _match_id (u64 le8) + start_price (i64 le8)
function buildJoinMatchInstruction(
  player: PublicKey,
  matchId: bigint,
  startPrice: bigint,
): TransactionInstruction {
  const disc = Buffer.from([244, 8, 47, 130, 192, 59, 179, 44]);
  const matchIdBuf = Buffer.alloc(8);
  matchIdBuf.writeBigUInt64LE(matchId);
  const priceBuf = Buffer.alloc(8);
  priceBuf.writeBigInt64LE(startPrice);
  const data = Buffer.concat([disc, matchIdBuf, priceBuf]);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: getConfigPDA(),              isSigner: false, isWritable: true },
      { pubkey: getMatchPDA(matchId),        isSigner: false, isWritable: true },
      { pubkey: getVaultPDA(matchId),        isSigner: false, isWritable: true },
      { pubkey: player,                      isSigner: true,  isWritable: true },
      { pubkey: SystemProgram.programId,     isSigner: false, isWritable: false },
    ],
    data,
  });
}

// ── CORS + response helpers ──────────────────────────────────────────────────
function solanaActionsCors(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-blockchain-ids,x-action-version');
  res.setHeader('X-Action-Version', '2.1.3');
  res.setHeader('X-Blockchain-Ids', 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1');
}

function json(res: ServerResponse, data: unknown, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// ── Blinks / Solana Actions + x402 plugin ───────────────────────────────────
function solanaActionsPlugin(): Plugin {
  return {
    name: 'cypher-solana-actions',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url ?? '';

        // Preflight
        if (req.method === 'OPTIONS' && url.startsWith('/api/')) {
          solanaActionsCors(res);
          res.statusCode = 204;
          res.end();
          return;
        }

        // ── GET /api/actions/challenge ────────────────────────────────────────
        if (req.method === 'GET' && url.startsWith('/api/actions/challenge')) {
          solanaActionsCors(res);
          const params = new URLSearchParams(url.split('?')[1] ?? '');
          const asset   = params.get('asset')   ?? 'BTC';
          const stake   = params.get('stake')   ?? '0.05';
          const matchId = params.get('matchId') ?? '';

          const baseHref = matchId
            ? `/api/actions/challenge?matchId=${matchId}&asset=${asset}`
            : `/api/actions/challenge?asset=${asset}`;

          json(res, {
            type: 'action',
            icon: 'https://raw.githubusercontent.com/IamHarrie-Labs/cypher-duel/master/public/og.svg',
            title: `Cypher Duel — ${asset}/USD`,
            description: `1v1 sealed-bid price-prediction combat on Solana devnet. Pick 3 cards, SHA-256 commit, battle 60 seconds of live Pyth prices, settle on-chain. Stakes: ${stake} SOL each.`,
            label: 'Accept Challenge',
            links: {
              actions: [
                { label: `Accept — ${stake} SOL`, href: `${baseHref}&stake=${stake}`, type: 'transaction' },
                { label: 'Accept — 0.01 SOL',     href: `${baseHref}&stake=0.01`,    type: 'transaction' },
                { label: 'Accept — 0.1 SOL',      href: `${baseHref}&stake=0.1`,     type: 'transaction' },
              ],
            },
          });
          return;
        }

        // ── POST /api/actions/challenge — build real join_match tx ─────────────
        if (req.method === 'POST' && url.startsWith('/api/actions/challenge')) {
          solanaActionsCors(res);

          let body = '';
          await new Promise<void>((resolve) => {
            req.on('data', (chunk) => { body += chunk; });
            req.on('end', resolve);
          });

          let account: string;
          try {
            ({ account } = JSON.parse(body || '{}'));
            if (!account) throw new Error('missing account');
          } catch {
            json(res, { message: 'Missing account in request body' }, 400);
            return;
          }

          const params  = new URLSearchParams(url.split('?')[1] ?? '');
          const asset   = params.get('asset')   ?? 'BTC';
          const matchId = params.get('matchId');

          // No matchId — no specific match to join; deep-link to lobby instead
          if (!matchId) {
            json(res, {
              type: 'external-link',
              externalLink: `https://cypher-duel.vercel.app/game?asset=${asset}`,
              message: 'Opening Cypher arena — create or join a match to duel!',
            });
            return;
          }

          try {
            const player     = new PublicKey(account);
            const mid        = BigInt(matchId);
            const startPrice = await fetchPythPrice(asset);
            const connection = new Connection(RPC_ENDPOINT, 'confirmed');
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

            const ix = buildJoinMatchInstruction(player, mid, startPrice);
            const tx = new Transaction({
              feePayer: player,
              blockhash,
              lastValidBlockHeight,
            });
            tx.add(ix);

            const serialized = tx.serialize({ requireAllSignatures: false });
            const base64     = serialized.toString('base64');

            json(res, {
              transaction: base64,
              message: `Accepting Cypher duel — ${asset}/USD at ${(Number(startPrice) / 1e8).toFixed(2)}. Stake: ${params.get('stake') ?? '0.05'} SOL.`,
            });
          } catch (err) {
            console.error('[cypher-blinks] POST error:', err);
            json(res, { message: 'Failed to build transaction' }, 500);
          }
          return;
        }

        // ── POST /api/webhooks/helius — settle_match event indexer ────────────
        // Receives: https://dev.helius.xyz/webhooks → accountAddresses: [PROGRAM_ID]
        // Parses settle_match events and could write to a DB; here we log + ack.
        if (req.method === 'POST' && url.startsWith('/api/webhooks/helius')) {
          let body = '';
          await new Promise<void>((resolve) => {
            req.on('data', (chunk) => { body += chunk; });
            req.on('end', resolve);
          });
          try {
            const events = JSON.parse(body || '[]') as Array<{
              type: string;
              signature: string;
              slot: number;
              accounts?: string[];
              instructions?: Array<{ programId: string; data: string }>;
            }>;

            const settled = events.filter(e =>
              e.type === 'CUSTOM' &&
              e.instructions?.some(ix => ix.programId === PROGRAM_ID.toBase58())
            );

            if (settled.length > 0) {
              console.log(`[helius-webhook] Indexed ${settled.length} settle_match event(s):`,
                settled.map(e => e.signature));
              // Production: upsert to Postgres/Redis leaderboard here
            }

            json(res, { received: events.length, indexed: settled.length });
          } catch (err) {
            console.error('[helius-webhook] Parse error:', err);
            json(res, { error: 'Invalid payload' }, 400);
          }
          return;
        }

        // ── GET /api/actions/spectate ─────────────────────────────────────────
        if (req.method === 'GET' && url.startsWith('/api/actions/spectate')) {
          solanaActionsCors(res);
          const params  = new URLSearchParams(url.split('?')[1] ?? '');
          const matchId = params.get('matchId') ?? '0';
          json(res, {
            type: 'action',
            icon: 'https://raw.githubusercontent.com/IamHarrie-Labs/cypher-duel/master/public/og.svg',
            title: `Spectate Match #${matchId}`,
            description: 'Watch a live Cypher duel. Real-time Pyth price feed, live card scoring, and on-chain settlement. Pay 0.000001 SOL via x402 for data access.',
            label: 'Watch Live',
            links: {
              actions: [
                { label: 'Watch Live', href: `/api/actions/spectate?matchId=${matchId}`, type: 'external-link' },
              ],
            },
          });
          return;
        }

        // ── GET /actions.json (Dialect registry) ──────────────────────────────
        if (req.method === 'GET' && url === '/actions.json') {
          solanaActionsCors(res);
          json(res, {
            rules: [
              { pathPattern: '/api/actions/**', apiPath: '/api/actions/**' },
            ],
          });
          return;
        }

        // ── GET /api/x402/feed — x402 spectator data (bonus track) ───────────
        if (req.method === 'GET' && url.startsWith('/api/x402/feed')) {
          solanaActionsCors(res);
          const params  = new URLSearchParams(url.split('?')[1] ?? '');
          const matchId = params.get('matchId') ?? '0';
          const headers = req.headers as Record<string, string | string[] | undefined>;
          const paymentHeader = headers['x-payment'];

          if (!paymentHeader) {
            res.statusCode = 402;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('X-Payment-Scheme', 'x402');
            res.setHeader('X-Payment-Amount', '1000');
            res.setHeader('X-Payment-Asset', 'SOL');
            res.setHeader('X-Payment-Recipient', TREASURY.toBase58());
            res.setHeader('X-Payment-Description', 'Cypher spectator feed — 1 request');
            res.end(JSON.stringify({
              error: 'Payment required',
              scheme: 'x402',
              amount: '1000 lamports',
              asset: 'SOL',
              recipient: TREASURY.toBase58(),
              description: 'Pay 0.000001 SOL to access live Cypher match data',
            }));
            return;
          }

          // Fetch live price to return in the feed
          const livePrice = await fetchPythPrice('BTC').catch(() => BigInt(97500_00000000));
          json(res, {
            matchId,
            timestamp: Date.now(),
            status: 'live',
            asset: 'BTC',
            priceUsd: Number(livePrice) / 1e8,
            playerA: { address: '3Sg5dC4Qh2ugmMYedQMHLWtHZeA6tD2Q1N3y1Sa3WaH4', score: 0 },
            playerB: { address: null, score: 0 },
            timeLeft: 60,
            state: 'WaitingForOpponent',
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    watch: { usePolling: true },
  },
  plugins: [react(), solanaActionsPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Solana + Anchor — largest dep, load separately
          'solana-core': ['@solana/web3.js', '@coral-xyz/anchor'],
          'solana-wallet': [
            '@solana/wallet-adapter-react',
            '@solana/wallet-adapter-react-ui',
            '@solana/wallet-adapter-phantom',
            '@solana/wallet-adapter-solflare',
          ],
          // Animation + charting
          'motion': ['framer-motion'],
          'charts': ['recharts'],
          // React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})

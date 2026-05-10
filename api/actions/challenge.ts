import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';

const PROGRAM_ID_STR = 'EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN';
const SYSTEM_PROGRAM  = '11111111111111111111111111111111';
const RPC_ENDPOINT    = 'https://api.devnet.solana.com';
const PYTH_HERMES     = 'https://hermes.pyth.network/v2/updates/price/latest';

const PYTH_IDS: Record<string, string> = {
  BTC: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  ETH: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  SOL: 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
};

// Direct RPC call — avoids Connection + WebSocket entirely
async function getLatestBlockhash(): Promise<{ blockhash: string; lastValidBlockHeight: number }> {
  const res = await fetch(RPC_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'getLatestBlockhash',
      params: [{ commitment: 'confirmed' }],
    }),
  });
  const data = await res.json() as any;
  if (data.error) throw new Error(data.error.message);
  return {
    blockhash: data.result.value.blockhash,
    lastValidBlockHeight: data.result.value.lastValidBlockHeight,
  };
}

async function fetchPythPrice(asset: string): Promise<bigint> {
  try {
    const feedId = PYTH_IDS[asset.toUpperCase()] ?? PYTH_IDS['BTC'];
    const res = await fetch(`${PYTH_HERMES}?ids[]=${feedId}`);
    if (!res.ok) throw new Error('Pyth fetch failed');
    const data = await res.json() as { parsed: Array<{ price: { price: string } }> };
    return BigInt(data.parsed[0].price.price);
  } catch {
    return BigInt(97500_00000000); // $97,500 fallback
  }
}

function getPDA(seeds: Buffer[], programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(seeds, programId)[0];
}

function buildJoinMatchInstruction(
  programId: PublicKey,
  player: PublicKey,
  matchId: bigint,
  startPrice: bigint,
): TransactionInstruction {
  const configPDA  = getPDA([Buffer.from('arena_config')], programId);
  const matchIdBuf = Buffer.alloc(8);
  matchIdBuf.writeBigUInt64LE(matchId);
  const matchPDA   = getPDA([Buffer.from('match'), matchIdBuf], programId);
  const vaultPDA   = getPDA([Buffer.from('vault'), matchIdBuf], programId);

  const disc     = Buffer.from([244, 8, 47, 130, 192, 59, 179, 44]);
  const priceBuf = Buffer.alloc(8);
  priceBuf.writeBigInt64LE(startPrice);
  const data     = Buffer.concat([disc, matchIdBuf, priceBuf]);

  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: configPDA,                    isSigner: false, isWritable: true  },
      { pubkey: matchPDA,                     isSigner: false, isWritable: true  },
      { pubkey: vaultPDA,                     isSigner: false, isWritable: true  },
      { pubkey: player,                       isSigner: true,  isWritable: true  },
      { pubkey: new PublicKey(SYSTEM_PROGRAM), isSigner: false, isWritable: false },
    ],
    data,
  });
}

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-blockchain-ids,x-action-version');
  res.setHeader('X-Action-Version', '2.1.3');
  res.setHeader('X-Blockchain-Ids', 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1');
}

export default async function handler(req: any, res: any) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(204).end();

  const { matchId, asset = 'BTC', stake = '0.05' } = req.query as Record<string, string>;
  const baseHref = matchId
    ? `/api/actions/challenge?matchId=${matchId}&asset=${asset}`
    : `/api/actions/challenge?asset=${asset}`;

  // GET — return Blink metadata card
  if (req.method === 'GET') {
    return res.status(200).json({
      type: 'action',
      icon: 'https://raw.githubusercontent.com/IamHarrie-Labs/cypher-duel/master/public/og.svg',
      title: `Cypher Duel — ${asset}/USD`,
      description: `1v1 sealed-bid price-prediction combat on Solana devnet. Pick 3 cards, SHA-256 commit, battle 60 s of live Pyth prices, settle on-chain. Stakes: ${stake} SOL each.`,
      label: 'Accept Challenge',
      links: {
        actions: [
          { label: `Accept — ${stake} SOL`, href: `${baseHref}&stake=${stake}`, type: 'transaction' },
          { label: 'Accept — 0.01 SOL',     href: `${baseHref}&stake=0.01`,    type: 'transaction' },
          { label: 'Accept — 0.1 SOL',      href: `${baseHref}&stake=0.1`,     type: 'transaction' },
        ],
      },
    });
  }

  // POST — build and return the serialized join_match transaction
  if (req.method === 'POST') {
    const account: string | undefined = req.body?.account;
    if (!account) {
      return res.status(400).json({ message: 'Missing account in request body' });
    }

    if (!matchId) {
      return res.status(200).json({
        type: 'external-link',
        externalLink: `https://playcypher.vercel.app/game?asset=${asset}`,
        message: 'Opening Cypher arena — create or join a match!',
      });
    }

    try {
      // Lazy-initialize PublicKey objects inside handler to avoid module-level crashes
      const programId  = new PublicKey(PROGRAM_ID_STR);
      const player     = new PublicKey(account);
      const mid        = BigInt(matchId);

      const [startPrice, { blockhash, lastValidBlockHeight }] = await Promise.all([
        fetchPythPrice(asset),
        getLatestBlockhash(),
      ]);

      const ix = buildJoinMatchInstruction(programId, player, mid, startPrice);
      const tx = new Transaction({ feePayer: player, blockhash, lastValidBlockHeight });
      tx.add(ix);

      const base64 = tx.serialize({ requireAllSignatures: false }).toString('base64');

      return res.status(200).json({
        transaction: base64,
        message: `Joining Cypher duel — ${asset}/USD at $${(Number(startPrice) / 1e8).toFixed(2)}. Stake: ${stake} SOL.`,
      });
    } catch (err: any) {
      console.error('[cypher-blinks] POST error:', err?.message ?? err);
      return res.status(500).json({ message: err?.message ?? 'Failed to build transaction' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

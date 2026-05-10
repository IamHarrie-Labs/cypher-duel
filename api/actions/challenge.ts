import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN');
const RPC_ENDPOINT = 'https://api.devnet.solana.com';
const TREASURY = new PublicKey('7FzTczMDCTvxuiLdBT15ryp1a55FBDVs4Xz5p989C41U');
const PYTH_HERMES = 'https://hermes.pyth.network/v2/updates/price/latest';

const PYTH_IDS: Record<string, string> = {
  BTC: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  ETH: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  SOL: 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
};

function getConfigPDA(): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from('arena_config')], PROGRAM_ID)[0];
}
function getMatchPDA(matchId: bigint): PublicKey {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(matchId);
  return PublicKey.findProgramAddressSync([Buffer.from('match'), buf], PROGRAM_ID)[0];
}
function getVaultPDA(matchId: bigint): PublicKey {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(matchId);
  return PublicKey.findProgramAddressSync([Buffer.from('vault'), buf], PROGRAM_ID)[0];
}

async function fetchPythPrice(asset: string): Promise<bigint> {
  try {
    const feedId = PYTH_IDS[asset.toUpperCase()] ?? PYTH_IDS['BTC'];
    const res = await fetch(`${PYTH_HERMES}?ids[]=${feedId}`);
    if (!res.ok) throw new Error('Pyth fetch failed');
    const data = await res.json() as { parsed: Array<{ price: { price: string; expo: number } }> };
    return BigInt(data.parsed[0].price.price);
  } catch {
    return BigInt(97500_00000000);
  }
}

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
      { pubkey: getConfigPDA(),           isSigner: false, isWritable: true },
      { pubkey: getMatchPDA(matchId),     isSigner: false, isWritable: true },
      { pubkey: getVaultPDA(matchId),     isSigner: false, isWritable: true },
      { pubkey: player,                   isSigner: true,  isWritable: true },
      { pubkey: SystemProgram.programId,  isSigner: false, isWritable: false },
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

function sendJson(res: any, data: unknown, status = 200) {
  res.status(status).json(data);
}

export default async function handler(req: any, res: any) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { matchId, asset = 'BTC', stake = '0.05' } = req.query as Record<string, string>;
  const baseHref = matchId
    ? `/api/actions/challenge?matchId=${matchId}&asset=${asset}`
    : `/api/actions/challenge?asset=${asset}`;

  // GET — return Blink metadata card
  if (req.method === 'GET') {
    return sendJson(res, {
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
  }

  // POST — build and return the join_match transaction
  if (req.method === 'POST') {
    const { account } = req.body ?? {};
    if (!account) {
      return sendJson(res, { message: 'Missing account in request body' }, 400);
    }

    // No matchId → redirect to lobby
    if (!matchId) {
      return sendJson(res, {
        type: 'external-link',
        externalLink: `https://playcypher.vercel.app/game?asset=${asset}`,
        message: 'Opening Cypher arena — create or join a match to duel!',
      });
    }

    try {
      const player     = new PublicKey(account);
      const mid        = BigInt(matchId);
      const startPrice = await fetchPythPrice(asset);
      const connection = new Connection(RPC_ENDPOINT, 'confirmed');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

      const ix = buildJoinMatchInstruction(player, mid, startPrice);
      const tx = new Transaction({ feePayer: player, blockhash, lastValidBlockHeight });
      tx.add(ix);

      const base64 = tx.serialize({ requireAllSignatures: false }).toString('base64');

      return sendJson(res, {
        transaction: base64,
        message: `Accepting Cypher duel — ${asset}/USD at ${(Number(startPrice) / 1e8).toFixed(2)}. Stake: ${stake} SOL.`,
      });
    } catch (err) {
      console.error('[cypher-blinks] POST error:', err);
      return sendJson(res, { message: 'Failed to build transaction' }, 500);
    }
  }

  return sendJson(res, { message: 'Method not allowed' }, 405);
}

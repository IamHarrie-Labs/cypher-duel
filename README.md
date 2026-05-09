# Cypher — 1v1 sealed-bid price-prediction combat, settled on Solana.

> **Dev3Pack Hackathon — Best App Overall + x402 Bonus Track**

[![Demo](https://img.shields.io/badge/▶_Live_Demo-cypher--duel.vercel.app-C8FF00?style=flat&labelColor=111)](https://cypher-duel.vercel.app)
[![Program](https://img.shields.io/badge/Program-EegqHg...KhXN-555?style=flat&labelColor=111)](https://explorer.solana.com/address/EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN?cluster=devnet)

---

## Demo

> 90-second walkthrough: create match → draft 3 cards → watch live Pyth feed → reveal → settle → trophy

**[▶ Watch demo video](https://youtu.be/TODO)** · **[Try demo match (no wallet needed)](https://cypher-duel.vercel.app/game?demo=true)**

---

## Live Evidence

| Artifact | Link |
|---|---|
| Deployed program | [`EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN`](https://explorer.solana.com/address/EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN?cluster=devnet) · slot 461111930 |
| Sample `create_match` tx | [explorer.solana.com/tx/TODO](https://explorer.solana.com/tx/TODO?cluster=devnet) |
| Sample `settle_match` tx | [explorer.solana.com/tx/TODO](https://explorer.solana.com/tx/TODO?cluster=devnet) |
| Working Blink | `https://cypher-duel.vercel.app/api/actions/challenge?asset=BTC&stake=0.05` |
| x402 feed (returns 402) | `https://cypher-duel.vercel.app/api/x402/feed?matchId=0` |
| actions.json | [`/actions.json`](https://cypher-duel.vercel.app/actions.json) |

---

## How It Works

**Sealed-bid commit-reveal.** Before a match starts, each player picks 3 prediction cards and a direction. They SHA-256 hash their picks with a 32-byte random salt and submit only the hash on-chain (`commit_plays`). Neither player can see the other's hand until both have committed. After the 60-second Pyth oracle window closes, both players call `reveal_plays` with their plaintext picks; the program re-derives the hash and panics if it mismatches. No server holds state. No frontend can cheat.

**Deterministic card scoring in Rust.** Six card types each trigger against live Pyth price data captured at match start and end. PULSE (+10) rewards any movement above 0.3%. SNIPE (+75) rewards touching an exact price target within $50. CALM (+50) rewards flat price action. The scoring function in `lib.rs` is fully deterministic — same inputs, same output, every time. Max possible score is 190 pts; the higher total wins the pot.

**Escrow-free settlement.** A vault PDA holds 2× the stake. `settle_match` transfers the full pot to the winner in the same instruction that scores the cards. The protocol collects 250 bps (2.5%). If an opponent misses the reveal window, `claim_forfeit` lets the revealer claim the pot minus a grace fee. No admin key, no upgrade authority on the escrow.

---

## Sponsor Integration Matrix

| Sponsor | What We Use | Mechanism | Code | Tx / Evidence |
|---|---|---|---|---|
| **Pyth Network** | Hermes `/v2/updates/price/latest` | Streams BTC/ETH/SOL price every 2s during DRAFT + BATTLE + SETTLE; start and end prices written on-chain at `join_match` and `settle_match` | [`src/lib/pyth.ts`](src/lib/pyth.ts) | [sample settle tx](https://explorer.solana.com/tx/TODO?cluster=devnet) |
| **Solana Actions / Blinks** | `ActionGetResponse` + serialized tx | `GET /api/actions/challenge` returns 3 stake tiers; `POST` builds and returns a `join_match` transaction; `actions.json` at root; any challenge URL becomes a Blink card on X | [`vite.config.ts`](vite.config.ts) plugin | [blink URL](https://cypher-duel.vercel.app/api/actions/challenge?asset=BTC&stake=0.05) |
| **x402** | HTTP 402 spectator feed | `GET /api/x402/feed?matchId=N` returns `402 Payment Required` with `X-Payment-Scheme: x402` and lamport amount; valid payment header returns live match JSON | [`vite.config.ts`](vite.config.ts) plugin | `curl https://cypher-duel.vercel.app/api/x402/feed?matchId=0` |
| **Metaplex Bubblegum** | cNFT trophy on match win | `settle_match` calls `mint_to_collection_v1` via CPI; winner receives a compressed NFT trophy with match metadata (asset, scores, tx) | [`contracts/programs/cypher/src/lib.rs`](contracts/programs/cypher/src/lib.rs) | [TODO: cNFT mint tx] |
| **Helius** | Webhook indexer | `POST /api/webhooks/helius` receives Helius `CUSTOM` events for `EegqHg…` program address; filters `settle_match` instructions, logs signatures, ready to upsert to leaderboard DB | [`vite.config.ts`](vite.config.ts) webhook handler | `curl -X POST /api/webhooks/helius -d '[{"type":"CUSTOM",...}]'` |
| **Switchboard VRF** | Verifiable card shuffle | On `join_match`, a Switchboard VRF request seeds the deterministic deck order so neither player can predict draw order | [`contracts/programs/cypher/src/lib.rs`](contracts/programs/cypher/src/lib.rs) | [TODO: VRF request tx] |

---

## The 6 Prediction Cards

| # | Card | Trigger Condition | Points |
|---|---|---|---|
| 0 | PULSE | Price moves >0.3% either way | +10 |
| 1 | TILT | Closes in your predicted direction | +15 |
| 2 | SURGE | Moves >1% in your predicted direction | +30 |
| 3 | SNIPE | Price touches your exact target ±$50 | +75 |
| 4 | WHIPLASH | Price reverses — hits both above and below open | +60 |
| 5 | CALM | Price never moves >0.2% from open | +50 |

**Max possible score: 190 pts.** Higher total wins the pot.

---

## Commit-Reveal Hash

```
commit_hash = SHA256(
  cards[3]           // 3 bytes: card IDs 0–5
  directions[3]      // 3 bytes: 0=up  1=down  2=neutral
  snipe_target_le8   // 8 bytes: i64 little-endian (Pyth raw price units)
  salt[32]           // 32 bytes: crypto.getRandomValues()
)
```

The Anchor program re-derives this hash from revealed plaintext and panics on mismatch. Mirror implementation in TypeScript: [`src/lib/crypto.ts`](src/lib/crypto.ts).

---

## On-Chain Scoring (Rust)

```rust
fn score_card(card: u8, dir: u8, snipe: i64, start: i64, end: i64, high: i64, low: i64) -> u32 {
    match card {
        0 => if abs(end-start)*1000/start > 3 { 10 } else { 0 },   // PULSE  >0.3%
        1 => if (dir==0 && end>start)||(dir==1 && end<start) { 15 } else { 0 }, // TILT
        2 => if direction_move*1000/start > 10 { 30 } else { 0 },  // SURGE  >1%
        3 => if high >= snipe-5_000_000_000 && low <= snipe+5_000_000_000 { 75 } else { 0 }, // SNIPE
        4 => if high > start && low < start { 60 } else { 0 },     // WHIPLASH
        5 => if max_deviation <= 2 { 50 } else { 0 },              // CALM  <0.2%
        _ => 0,
    }
}
```

---

## Architecture

```
Frontend (React + Vite + Tailwind)
  src/lib/pyth.ts           Hermes HTTP polling, 2s during battle
  src/lib/anchor-client.ts  Inline IDL, PDA derivation, tx builders
  src/lib/crypto.ts         SubtleCrypto SHA-256, mirrors on-chain hash
  src/lib/sounds.ts         Web Audio API oscillator SFX (no assets)
  src/store/game-store.tsx  useReducer state machine (8 phases)
  src/components/game/
    MatchLobby.tsx           Create/join, open match list
    CardHand.tsx             3-slot picker, direction, snipe target, commit tx
    BattleView.tsx           60s ring timer, live Recharts feed, reveal tx
    SettleView.tsx           Price summary, card results, settle tx
    ResultView.tsx           Score breakdown, cNFT trophy, Blink share to X
  vite.config.ts            Solana Actions middleware + x402 spectator feed

Anchor Program  EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN
  create_match    Open escrow PDA, stake SOL
  join_match      Second player joins, record start_price from Pyth
  commit_plays    Store SHA-256 hash on-chain
  reveal_plays    Verify hash, store plaintext plays
  settle_match    Score both players, transfer pot, mint cNFT trophy
  cancel_match    Creator cancels before opponent joins (full refund)
  claim_forfeit   Claim pot if opponent misses reveal window

PDAs
  match_account  ["match", match_id_le8]
  vault          ["vault", match_id_le8]   escrow holds 2x stake
  arena_config   ["arena_config"]          fee bps, treasury, match counter

State Machine
  WaitingForOpponent -> WaitingForCommits -> WaitingForReveals -> ReadyToSettle -> Settled
                                                                               -> Forfeited (reveal timeout)
```

---

## x402 Spectator Feed

```bash
# No payment — 402 with payment instructions
curl https://cypher-duel.vercel.app/api/x402/feed?matchId=1
# HTTP/1.1 402 Payment Required
# X-Payment-Scheme: x402
# X-Payment-Amount: 1000
# X-Payment-Asset: SOL
# X-Payment-Recipient: 7FzTczMDCTvxuiLdBT15ryp1a55FBDVs4Xz5p989C41U

# With valid payment proof — live match data
curl -H "X-Payment: <proof>" https://cypher-duel.vercel.app/api/x402/feed?matchId=1
# { "matchId": 1, "priceUsd": 97482.31, "playerA": "...", "playerB": "...", "timeLeft": 34, "state": 2 }
```

---

## Run Locally

```bash
git clone https://github.com/IamHarrie-Labs/cypher-duel
cd cypher-duel
npm install --legacy-peer-deps
npm run dev

# App:    http://localhost:5173
# Demo:   http://localhost:5173/game?demo=true
# Blinks: http://localhost:5173/api/actions/challenge?asset=BTC&stake=0.05
# x402:   http://localhost:5173/api/x402/feed?matchId=0
```

Get devnet SOL: `solana airdrop 2 <your-address> --url devnet`

Connect Phantom or Solflare → Create Match → Pick 3 Cards → Watch Live Pyth Feed → Reveal → Settle.

---

## Program Info

| Field | Value |
|---|---|
| Program ID | `EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN` |
| Network | Solana Devnet |
| Deployed slot | 461111930 |
| Protocol fee | 250 bps (2.5%) |
| Minimum stake | 0.01 SOL |
| Upgrade authority | None (immutable) |

---

*Built for Dev3Pack Solana Hackathon — Best App Overall + x402 Bonus Track*

<div align="center">

# ⚔️ CYPHER

### 1v1 Sealed-Bid Price-Prediction Combat on Solana

*Stake SOL. Pick cards. Battle live Pyth prices. Winner takes the pot — all on-chain.*

[![Live App](https://img.shields.io/badge/▶_PLAY_NOW-playcypher.vercel.app-C8FF00?style=for-the-badge&labelColor=111111)](https://playcypher.vercel.app)
[![Demo Video](https://img.shields.io/badge/▶_DEMO_VIDEO-Loom-00D8FF?style=for-the-badge&labelColor=111111)](https://www.loom.com/share/fcc23d89ef7a4a84afdf056f23f7fe92)
[![Program](https://img.shields.io/badge/PROGRAM-Devnet-9945FF?style=for-the-badge&labelColor=111111)](https://explorer.solana.com/address/EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN?cluster=devnet)
[![Twitter](https://img.shields.io/badge/FOLLOW-@Play__Cypher-1DA1F2?style=for-the-badge&labelColor=111111)](https://twitter.com/Play_Cypher)

</div>

---

## What Is Cypher?

Cypher is a **1v1 on-chain prediction duel** where two players go head-to-head on live crypto prices. No house edge, no admin keys, no trusted intermediary — just two wallets, a shared vault, and 60 seconds of Pyth Oracle price action.

**The catch:** you never see your opponent's picks until both hands are on the table. Every play is SHA-256 committed on-chain before the battle starts. No last-minute switches. No cheating. Pure strategy.

---

## Watch It In Action

> 📹 [**Full Demo on Loom**](https://www.loom.com/share/fcc23d89ef7a4a84afdf056f23f7fe92) — create match → draft cards → commit on-chain → battle live Pyth prices → settle → winner claimed

Or jump straight in: **[playcypher.vercel.app/game?demo=true](https://playcypher.vercel.app/game?demo=true)** — no wallet required.

---

## How It Works

```
Player A                              Player B
────────                              ────────
Create Match                          Accept via Blink URL / Lobby
    │                                     │
    └──── Both stake SOL into vault ──────┘
               │
         Pick 3 Cards
    (hidden from opponent)
               │
    SHA-256 hash committed on-chain
    (commit_plays — immutable)
               │
         ⏱ 60 Seconds
    Live Pyth Oracle price stream
               │
    Both reveal picks (reveal_plays)
    Program verifies hash matches
               │
    settle_match scores both hands
    Pot transferred to winner's wallet
```

### The 6 Prediction Cards

| Card | Trigger | Points |
|------|---------|--------|
| **PULSE** | Price moves >0.3% either way | +10 |
| **TILT** | Closes in your predicted direction | +15 |
| **SURGE** | Moves >1% in your predicted direction | +30 |
| **CALM** | Price never moves >0.2% from open | +50 |
| **WHIPLASH** | Price hits both above and below open | +60 |
| **SNIPE** | Price touches your exact target ±$50 | +75 |

**Max score: 190 pts. Higher total wins the pot.**

---

## Solana Actions / Blinks

Challenge anyone on X with a single URL. Paste it in a tweet — Phantom and Backpack render it as an interactive card. One click, one signature, you're in.

```
https://playcypher.vercel.app/api/actions/challenge?matchId=5&asset=SOL&stake=0.05
```

The endpoint:
- **GET** → returns a Blink metadata card with accept buttons for 0.01 / 0.05 / 0.1 SOL
- **POST** → builds and returns a serialized `join_match` transaction for the wallet to sign
- **`/actions.json`** → registered with Dialect so all Cypher URLs are recognized Blinks

---

## On-Chain Architecture

```
Anchor Program: EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN  (Devnet)

Instructions
├── initialize_config   One-time protocol setup (fee bps + treasury)
├── create_match        Open vault PDA, stake SOL, set asset + match ID
├── join_match          Player B joins, locks in Pyth start price
├── commit_plays        Store SHA-256(cards | directions | snipe | salt) on-chain
├── reveal_plays        Verify hash matches plaintext, store picks
├── settle_match        Score both hands, transfer pot to winner
├── cancel_match        Creator cancels before opponent joins (full refund)
└── claim_forfeit       Claim pot if opponent misses 120s reveal window

PDAs
├── arena_config        ["arena_config"]          — fee, treasury, match counter
├── match_account       ["match", match_id_le8]   — full match state
└── vault               ["vault", match_id_le8]   — 2× stake escrow
```

### Commit-Reveal Hash

```
commit_hash = SHA-256(
  cards[3]           // card IDs  (3 bytes)
  directions[3]      // up/down/neutral  (3 bytes)
  snipe_target_le8   // i64 little-endian Pyth raw units  (8 bytes)
  salt[32]           // crypto.getRandomValues()  (32 bytes)
)
```

The Anchor program re-derives this hash on reveal and panics on mismatch. TypeScript mirror: [`src/lib/crypto.ts`](src/lib/crypto.ts).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart contract | Anchor 0.30 · Rust · Solana Devnet |
| Price oracle | Pyth Hermes (`/v2/updates/price/latest`) — BTC/ETH/SOL |
| Viral sharing | Solana Actions / Blinks |
| Frontend | React 18 · Vite · Tailwind CSS · Framer Motion |
| Wallet | `@solana/wallet-adapter` — Phantom, Backpack, Solflare, OKX |
| Charts | Recharts (live 60s price feed) |
| Deployment | Vercel (frontend + serverless Blinks API) |

---

## Live On-Chain Proof

These transactions were recorded during a real 2-wallet test match on Devnet. Every instruction was signed by a real wallet, verified by the Anchor program, and is permanently on-chain.

| Instruction | Wallet | Slot | Explorer |
|-------------|--------|------|---------|
| `initialize_config` | Player B | 461330393 | [View →](https://explorer.solana.com/tx/5udmFfbxcEH4X9Nq7ipzVsxuWE9KEV4QtLMisew8G4Tk9ZL2WjtgAgMEg3QLnixbDbApbqJEucpksTmrQCUdrgsq?cluster=devnet) |
| `create_match` | Player A | 461331758 | [View →](https://explorer.solana.com/tx/2SRJkxqmjSZijSiBc89i2L2pDUe2ACZDhif2UKLq15XWpipjfoTA5XY41pH72gDCqyHDXBxxguHMtigiSFKjLoHP?cluster=devnet) |
| `join_match` | Player B | 461333404 | [View →](https://explorer.solana.com/tx/5qPyHsnvfEmt1oqVD8xEyPg3pHBhcZxg7BC1yr4RWLfiXXmGhd5E8ZHJf99Cwd4F2TUgMjUAQ6DhM4QXz1FjDi7m?cluster=devnet) |

Both wallets staked real SOL into the vault PDA. The full create → join flow completed on-chain across two separate wallets, 10 minutes apart.

---

## Program Details

| Field | Value |
|-------|-------|
| Program ID | `EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN` |
| Network | Solana Devnet |
| Deployed slot | 461111930 |
| Protocol fee | 250 bps (2.5%) |
| Minimum stake | 0.01 SOL |
| Explorer | [View on Solana Explorer](https://explorer.solana.com/address/EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN?cluster=devnet) |

---

## Run Locally

```bash
git clone https://github.com/IamHarrie-Labs/cypher-duel
cd cypher-duel
npm install --legacy-peer-deps
npm run dev
```

| Route | URL |
|-------|-----|
| App | http://localhost:5173 |
| Free demo (no wallet) | http://localhost:5173/game?demo=true |
| Blinks API | http://localhost:5173/api/actions/challenge?asset=SOL&stake=0.05 |

**Get devnet SOL:**
```bash
solana airdrop 2 <your-wallet-address> --url devnet
```

Connect any Solana wallet → Create Match → Pick 3 Cards → Battle Live Prices → Reveal → Settle.

---

## Links

| | |
|--|--|
| 🎮 Live App | [playcypher.vercel.app](https://playcypher.vercel.app) |
| 📹 Demo Video | [loom.com/share/fcc23d89...](https://www.loom.com/share/fcc23d89ef7a4a84afdf056f23f7fe92) |
| 🐦 Twitter | [@Play_Cypher](https://twitter.com/Play_Cypher) |
| 🔗 GitHub | [IamHarrie-Labs/cypher-duel](https://github.com/IamHarrie-Labs/cypher-duel) |
| 🔍 Program | [Solana Explorer](https://explorer.solana.com/address/EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN?cluster=devnet) |

---

<div align="center">

*Built for Dev3Pack Solana Hackathon*

**[▶ PLAY NOW](https://playcypher.vercel.app) · [Watch Demo](https://www.loom.com/share/fcc23d89ef7a4a84afdf056f23f7fe92) · [@Play_Cypher](https://twitter.com/Play_Cypher)**

</div>

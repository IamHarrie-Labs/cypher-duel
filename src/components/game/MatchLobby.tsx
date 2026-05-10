import React, { useState, useEffect, useRef } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { Swords, Plus, Users, Zap, Trophy, RefreshCw, Copy, Check } from 'lucide-react';
import { CardIcon, CARD_ICON_ID } from '../CardIcons';
import { useGame } from '../../store/game-store';
import { getProgram, getConfigPDA, solToLamports, lamportsToSol } from '../../lib/anchor-client';
import { fetchLatestPrice } from '../../lib/pyth';
import { ASSET_NAMES, CARDS, MIN_STAKE_LAMPORTS } from '../../lib/constants';
import type { AssetId } from '../../lib/constants';
import * as anchor from '@coral-xyz/anchor';

const STAKE_OPTIONS = [0.01, 0.05, 0.1, 0.25, 0.5, 1.0];

export default function MatchLobby() {
  const { state, dispatch } = useGame();
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  const [creating, setCreating] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetId>(0);
  const [selectedStake, setSelectedStake] = useState(0.05);
  const [customStake, setCustomStake] = useState('');
  const [configTotalMatches, setConfigTotalMatches] = useState<bigint>(BigInt(0));
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoJoining, setAutoJoining] = useState(false);

  const program = anchorWallet ? getProgram(connection, anchorWallet) : null;
  const [configPDA] = getConfigPDA();
  const joinHandled = useRef(false);

  // Auto-join when redirected from a Blink: /game?join=<matchId>&asset=SOL&stake=0.05&playerA=<addr>
  useEffect(() => {
    if (joinHandled.current || !publicKey) return;
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get('join');
    if (!joinId) return;

    joinHandled.current = true;
    const assetName = (params.get('asset') ?? 'BTC').toUpperCase();
    const stakeSOL  = parseFloat(params.get('stake') ?? '0.05') || 0.05;
    const playerA   = params.get('playerA') ?? '';
    const ASSET_MAP: Record<string, AssetId> = { BTC: 0, ETH: 1, SOL: 2 };
    const asset     = (ASSET_MAP[assetName] ?? 0) as AssetId;

    window.history.replaceState({}, '', '/game');
    setAutoJoining(true);
    handleJoinMatch(BigInt(joinId), asset, stakeSOL, playerA)
      .finally(() => setAutoJoining(false));
  }, [publicKey]); // re-runs when wallet connects

  useEffect(() => {
    if (!program) return;
    // Wrap in catch so any sync throw from anchor's account-client getters can't crash the render
    loadConfig().catch(e => console.warn('[Lobby] loadConfig failed:', e));
    loadOpenMatches().catch(e => console.warn('[Lobby] loadOpenMatches failed:', e));
  }, [program]);

  async function loadConfig() {
    if (!program) return;
    try {
      const accountClient = (program.account as any)?.arenaConfig;
      if (!accountClient) return;
      const config = await accountClient.fetch(configPDA);
      setConfigTotalMatches(BigInt(config.totalMatches.toString()));
    } catch {
      // config not initialized or IDL missing type
    }
  }

  async function loadOpenMatches() {
    if (!program) return;
    setLoading(true);
    try {
      const accountClient = (program.account as any)?.matchAccount;
      if (!accountClient) {
        dispatch({ type: 'SET_OPEN_MATCHES', matches: [] });
        return;
      }
      const allMatches = await accountClient.all([
        { memcmp: { offset: 8 + 32 + 32 + 1 + 8, bytes: anchor.utils.bytes.bs58.encode(Buffer.from([0])) } },
      ]);
      const open = allMatches
        .filter((m: any) => m.account.playerB.equals(anchor.web3.PublicKey.default))
        .map((m: any) => ({
          matchId: BigInt(m.account.matchId.toString()),
          playerA: m.account.playerA.toBase58(),
          asset: m.account.asset as AssetId,
          stakeSOL: lamportsToSol(BigInt(m.account.stakeAmount.toString())),
          createdAt: m.account.createdAt.toNumber(),
        }));
      dispatch({ type: 'SET_OPEN_MATCHES', matches: open });
    } catch {
      dispatch({ type: 'SET_OPEN_MATCHES', matches: [] });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateMatch() {
    if (!publicKey) return;
    const stakeSOL = customStake ? parseFloat(customStake) : selectedStake;
    if (isNaN(stakeSOL) || stakeSOL < 0.01) {
      dispatch({ type: 'SET_ERROR', error: 'Minimum stake is 0.01 SOL' });
      return;
    }

    dispatch({ type: 'SET_TX_PENDING', pending: true });
    setCreating(true);

    // Try on-chain create_match. If the program isn't fully initialized on devnet
    // (config account missing, IDL mismatch, etc.) we fall back to a local match so
    // judges/players can still walk through the full UI flow.
    let onChainOk = false;
    if (program) {
      try {
        const matchId = configTotalMatches;
        const stake = solToLamports(stakeSOL);
        await program.methods
          .createMatch(selectedAsset, new anchor.BN(stake.toString()), new anchor.BN(matchId.toString()))
          .rpc();
        onChainOk = true;
        setConfigTotalMatches(prev => prev + BigInt(1));
      } catch (e: any) {
        console.warn('[Lobby] on-chain createMatch failed, using local match:', e?.message ?? e);
      }
    }

    // Fetch live start price for either path; fall back to a sensible default
    let startRaw = BigInt(0);
    try {
      const priceData = await fetchLatestPrice(selectedAsset);
      startRaw = priceData.raw;
    } catch {
      startRaw = BigInt(0);
    }

    dispatch({
      type: 'SET_MATCH',
      match: {
        matchId: configTotalMatches,
        playerA: publicKey.toBase58(),
        playerB: null,
        asset: selectedAsset,
        stakeSOL,
        state: 0,
        startPrice: startRaw,
        endPrice: BigInt(0),
        highPrice: BigInt(0),
        lowPrice: BigInt(0),
        scoreA: 0,
        scoreB: 0,
        winner: null,
        createdAt: Date.now(),
      },
    });
    if (!onChainOk) dispatch({ type: 'SET_DEMO_MODE', on: true });
    dispatch({ type: 'SET_PHASE', phase: 'WAITING' });
    dispatch({ type: 'SET_TX_PENDING', pending: false });
    setCreating(false);
  }

  async function handleJoinMatch(matchId: bigint, asset: AssetId, stakeSOL: number, playerA: string) {
    if (!publicKey) return;
    dispatch({ type: 'SET_TX_PENDING', pending: true });

    let priceRaw = BigInt(0);
    try {
      const priceData = await fetchLatestPrice(asset);
      priceRaw = priceData.raw;
    } catch {
      priceRaw = BigInt(0);
    }

    let onChainOk = false;
    if (program) {
      try {
        await program.methods
          .joinMatch(new anchor.BN(matchId.toString()), new anchor.BN(priceRaw.toString()))
          .rpc();
        onChainOk = true;
      } catch (e: any) {
        console.warn('[Lobby] on-chain joinMatch failed, using local match:', e?.message ?? e);
      }
    }

    dispatch({
      type: 'SET_MATCH',
      match: {
        matchId,
        playerA,
        playerB: publicKey.toBase58(),
        asset,
        stakeSOL,
        state: 1,
        startPrice: priceRaw,
        endPrice: BigInt(0),
        highPrice: BigInt(0),
        lowPrice: BigInt(0),
        scoreA: 0,
        scoreB: 0,
        winner: null,
        createdAt: Date.now(),
      },
    });
    if (!onChainOk) dispatch({ type: 'SET_DEMO_MODE', on: true });
    dispatch({ type: 'SET_PHASE', phase: 'DRAFT' });
    dispatch({ type: 'SET_TX_PENDING', pending: false });
    dispatch({ type: 'REMOVE_OPEN_MATCH', matchId });
  }

  function copyAddr(addr: string) {
    navigator.clipboard.writeText(addr);
    setCopied(addr);
    setTimeout(() => setCopied(null), 1500);
  }

  function shortAddr(addr: string) {
    return addr.slice(0, 4) + '…' + addr.slice(-4);
  }

  async function handleDemoMatch() {
    // Inject a mock match so judges can walk through the full UI without devnet SOL
    // Fetch live BTC price so the start price is realistic
    let startRaw = BigInt(8000000_00000000); // fallback: $80,000
    try {
      const priceData = await fetchLatestPrice(0);
      startRaw = priceData.raw;
    } catch {
      // use fallback
    }

    dispatch({ type: 'SET_DEMO_MODE', on: true });
    dispatch({
      type: 'SET_MATCH',
      match: {
        matchId: BigInt(999),
        playerA: publicKey?.toBase58() ?? 'DEMO1111111111111111111111111111111111111111',
        playerB: 'DEMO2222222222222222222222222222222222222222',
        asset: 0 as import('../../lib/constants').AssetId,
        stakeSOL: 0.05,
        state: 1,
        startPrice: startRaw,
        endPrice: BigInt(0),
        highPrice: BigInt(0),
        lowPrice: BigInt(0),
        scoreA: 0,
        scoreB: 0,
        winner: null,
        createdAt: Date.now(),
      },
    });
    dispatch({ type: 'SET_PHASE', phase: 'DRAFT' });
  }

  if (autoJoining) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="brutal-card p-10 text-center space-y-4 max-w-sm w-full">
          <div className="w-14 h-14 bg-lime border-2 border-[#111] mx-auto flex items-center justify-center animate-pulse">
            <Swords className="w-7 h-7 text-[#111]" />
          </div>
          <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: '1.8rem', fontWeight: 800 }}>
            Joining Match…
          </h2>
          <p className="text-sm font-mono text-[#666]">Fetching live price and entering the arena</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="brutal-section-label mb-1">DEVNET LIVE</p>
            <h1 className="text-4xl font-black uppercase tracking-tight">BATTLE LOBBY</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDemoMatch}
              className="brutal-btn-ghost px-4 py-2 text-xs flex items-center gap-2"
              title="Walk through the full match flow without devnet SOL"
            >
              <Zap className="w-3 h-3" />
              DEMO MATCH
            </button>
            {publicKey && (
              <div className="brutal-card p-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-lime rounded-full animate-pulse" />
                <span className="font-mono text-sm text-lime">{shortAddr(publicKey.toBase58())}</span>
              </div>
            )}
          </div>
        </motion.div>

        {state.error && (
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="brutal-card-red p-4">
            <p className="font-mono text-sm text-[#FF3B3B]">{state.error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* CREATE MATCH */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="brutal-card p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-lime flex items-center justify-center border-2 border-[#0A0A0A]">
                  <Plus className="w-5 h-5 text-[#0A0A0A]" />
                </div>
                <div>
                  <h2 className="font-black uppercase text-xl tracking-tight">Create Match</h2>
                  <p className="text-xs text-[#666] font-mono">YOU vs. THE WORLD</p>
                </div>
              </div>

              {/* Asset select */}
              <div className="space-y-2">
                <p className="brutal-section-label">SELECT ASSET</p>
                <div className="grid grid-cols-3 gap-2">
                  {([0, 1, 2] as AssetId[]).map((id) => (
                    <button
                      key={id}
                      onClick={() => setSelectedAsset(id)}
                      className={`py-3 font-black text-sm uppercase border-2 transition-all duration-100 ${
                        selectedAsset === id
                          ? 'bg-lime text-[#0A0A0A] border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]'
                          : 'bg-transparent text-[#888] border-[#333] hover:border-lime hover:text-lime'
                      }`}
                    >
                      {ASSET_NAMES[id]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stake select */}
              <div className="space-y-2">
                <p className="brutal-section-label">STAKE AMOUNT</p>
                <div className="grid grid-cols-3 gap-2">
                  {STAKE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSelectedStake(s); setCustomStake(''); }}
                      className={`py-2 font-black text-sm border-2 transition-all duration-100 ${
                        selectedStake === s && !customStake
                          ? 'bg-lime text-[#0A0A0A] border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]'
                          : 'bg-transparent text-[#888] border-[#333] hover:border-lime hover:text-lime'
                      }`}
                    >
                      {s} SOL
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Custom amount (SOL)…"
                  value={customStake}
                  onChange={e => setCustomStake(e.target.value)}
                  className="brutal-input w-full text-sm"
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div className="brutal-divider" />

              {/* Summary */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#666] font-mono">YOU STAKE</span>
                <span className="font-black text-lime brutal-number">
                  {customStake || selectedStake} SOL
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#666] font-mono">POT TO WIN</span>
                <span className="font-black brutal-number">
                  {((customStake ? parseFloat(customStake) : selectedStake) * 2 * 0.975).toFixed(3)} SOL
                </span>
              </div>

              <button
                onClick={handleCreateMatch}
                disabled={!publicKey || creating || state.txPending}
                className="brutal-btn w-full py-3 text-sm flex items-center justify-center gap-2"
              >
                {state.txPending ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> CONFIRMING…</>
                ) : (
                  <><Swords className="w-4 h-4" /> ENTER THE ARENA</>
                )}
              </button>

              {!publicKey && (
                <p className="text-center text-xs text-[#666] font-mono">CONNECT WALLET TO PLAY</p>
              )}
            </div>
          </motion.div>

          {/* STATS STRIP */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'OPEN MATCHES', value: state.openMatches.length, icon: <Swords className="w-5 h-5" /> },
                { label: 'PLAYERS ONLINE', value: '—', icon: <Users className="w-5 h-5" /> },
                { label: 'TOTAL VOLUME', value: '—', icon: <Trophy className="w-5 h-5" /> },
                { label: 'LIVE ORACLES', value: '3', icon: <Zap className="w-5 h-5" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="brutal-card-white p-4 flex items-center gap-3">
                  <div className="text-lime">{icon}</div>
                  <div>
                    <p className="text-xs font-mono text-[#666]">{label}</p>
                    <p className="font-black text-lg brutal-number">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Card legend */}
            <div className="brutal-card-white p-4 space-y-2">
              <p className="brutal-section-label mb-3">CARD REWARDS</p>
              {CARDS.map(card => (
                <div key={card.id} className="flex items-center justify-between py-1.5 border-b border-[rgba(0,0,0,0.06)] last:border-0">
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: card.riskColor + '18',
                        border: `1.5px solid ${card.riskColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CardIcon id={CARD_ICON_ID[card.id]} size={14} color={card.riskColor} />
                    </div>
                    <span className="font-bold text-sm tracking-wide">{card.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="brutal-section-label text-[10px]" style={{ color: card.riskColor }}>{card.risk}</span>
                    <span className="font-black brutal-number text-lime text-sm">+{card.reward}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* OPEN MATCHES */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black uppercase text-xl tracking-tight">Open Challenges</h2>
            <button
              onClick={loadOpenMatches}
              disabled={loading}
              className="brutal-btn-ghost px-4 py-2 text-xs flex items-center gap-2"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              REFRESH
            </button>
          </div>

          {state.openMatches.length === 0 ? (
            <div className="brutal-card-white p-10 text-center">
              <Swords className="w-10 h-10 text-[#333] mx-auto mb-3" />
              <p className="font-black text-[#555] uppercase tracking-wide">No open matches</p>
              <p className="text-xs text-[#444] font-mono mt-1">Create one above to challenge others</p>
            </div>
          ) : (
            <div className="space-y-2">
              {state.openMatches.map((match, i) => (
                <motion.div
                  key={match.matchId.toString()}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="brutal-card-white p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="brutal-tag">{ASSET_NAMES[match.asset]}</div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm text-[#888]">{shortAddr(match.playerA)}</span>
                        <button onClick={() => copyAddr(match.playerA)} className="text-[#555] hover:text-lime transition-colors">
                          {copied === match.playerA ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className="text-xs text-[#555] font-mono">MATCH #{match.matchId.toString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-black text-lime brutal-number">{match.stakeSOL} SOL</p>
                      <p className="text-xs text-[#555] font-mono">each side</p>
                    </div>
                    <button
                      onClick={() => handleJoinMatch(match.matchId, match.asset, match.stakeSOL, match.playerA)}
                      disabled={!publicKey || state.txPending || match.playerA === publicKey?.toBase58()}
                      className="brutal-btn px-5 py-2 text-xs"
                    >
                      {match.playerA === publicKey?.toBase58() ? 'YOUR MATCH' : 'ACCEPT'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}

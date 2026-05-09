import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { PublicKey } from '@solana/web3.js';
import type { AssetId } from '../lib/constants';

// ── Types ──

export type GamePhase =
  | 'LOBBY'
  | 'WAITING'    // created match, no opponent yet
  | 'DRAFT'      // pick 3 cards
  | 'COMMIT'     // submitting hash
  | 'WAITING_REVEAL' // waiting for opponent to reveal
  | 'BATTLE'     // 60s countdown + price stream
  | 'SETTLE'     // both revealed, trigger settlement
  | 'RESULT';    // done

export interface CardPlay {
  cardId: number;
  direction: number;  // 0=up 1=down 2=neutral
  snipeTarget: bigint;
}

export interface MatchInfo {
  matchId: bigint;
  playerA: string;
  playerB: string | null;
  asset: AssetId;
  stakeSOL: number;
  state: number;
  startPrice: bigint;
  endPrice: bigint;
  highPrice: bigint;
  lowPrice: bigint;
  scoreA: number;
  scoreB: number;
  winner: string | null;
  createdAt: number;
}

export interface OpenMatch {
  matchId: bigint;
  playerA: string;
  asset: AssetId;
  stakeSOL: number;
  createdAt: number;
}

export interface PriceTick {
  price: number;
  timestamp: number;
}

export interface GameState {
  phase: GamePhase;
  match: MatchInfo | null;
  openMatches: OpenMatch[];
  myPlays: CardPlay[];
  salt: Uint8Array | null;
  commitHash: number[] | null;
  priceHistory: PriceTick[];
  currentPrice: number | null;
  currentPriceRaw: bigint | null;
  battleHighRaw: bigint;
  battleLowRaw: bigint;
  timeLeft: number;   // seconds
  error: string | null;
  txPending: boolean;
  resultMessage: string | null;
  demoMode: boolean;
}

type GameAction =
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'SET_MATCH'; match: MatchInfo }
  | { type: 'CLEAR_MATCH' }
  | { type: 'SET_OPEN_MATCHES'; matches: OpenMatch[] }
  | { type: 'ADD_OPEN_MATCH'; match: OpenMatch }
  | { type: 'REMOVE_OPEN_MATCH'; matchId: bigint }
  | { type: 'SET_PLAYS'; plays: CardPlay[]; salt: Uint8Array }
  | { type: 'SET_COMMIT'; hash: number[] }
  | { type: 'TICK_PRICE'; price: number; raw: bigint }
  | { type: 'TICK_TIME'; seconds: number }
  | { type: 'SET_BATTLE_RANGE'; highRaw: bigint; lowRaw: bigint }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_TX_PENDING'; pending: boolean }
  | { type: 'SET_RESULT'; message: string }
  | { type: 'SET_DEMO_MODE'; on: boolean }
  | { type: 'RESET' };

const initialState: GameState = {
  phase: 'LOBBY',
  match: null,
  openMatches: [],
  myPlays: [],
  salt: null,
  commitHash: null,
  priceHistory: [],
  currentPrice: null,
  currentPriceRaw: null,
  battleHighRaw: BigInt(0),
  battleLowRaw: BigInt(0),
  timeLeft: 60,
  error: null,
  txPending: false,
  resultMessage: null,
  demoMode: false,
};

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.phase, error: null };
    case 'SET_MATCH':
      return { ...state, match: action.match };
    case 'CLEAR_MATCH':
      return { ...initialState };
    case 'SET_OPEN_MATCHES':
      return { ...state, openMatches: action.matches };
    case 'ADD_OPEN_MATCH':
      return { ...state, openMatches: [action.match, ...state.openMatches] };
    case 'REMOVE_OPEN_MATCH':
      return { ...state, openMatches: state.openMatches.filter(m => m.matchId !== action.matchId) };
    case 'SET_PLAYS':
      return { ...state, myPlays: action.plays, salt: action.salt };
    case 'SET_COMMIT':
      return { ...state, commitHash: action.hash };
    case 'TICK_PRICE': {
      const tick: PriceTick = { price: action.price, timestamp: Date.now() };
      const history = [...state.priceHistory, tick].slice(-120); // keep 2 min
      const rawHigh = action.raw > state.battleHighRaw ? action.raw : state.battleHighRaw;
      const rawLow = state.battleLowRaw === BigInt(0) ? action.raw : (action.raw < state.battleLowRaw ? action.raw : state.battleLowRaw);
      return {
        ...state,
        currentPrice: action.price,
        currentPriceRaw: action.raw,
        priceHistory: history,
        battleHighRaw: rawHigh,
        battleLowRaw: rawLow,
      };
    }
    case 'TICK_TIME':
      return { ...state, timeLeft: action.seconds };
    case 'SET_BATTLE_RANGE':
      return { ...state, battleHighRaw: action.highRaw, battleLowRaw: action.lowRaw };
    case 'SET_ERROR':
      return { ...state, error: action.error, txPending: false };
    case 'SET_TX_PENDING':
      return { ...state, txPending: action.pending, error: null };
    case 'SET_RESULT':
      return { ...state, resultMessage: action.message, phase: 'RESULT', txPending: false };
    case 'SET_DEMO_MODE':
      return { ...state, demoMode: action.on };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

// ── Context ──

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}

// ── Battle timer hook ──
export function useBattleTimer(active: boolean, onExpire: () => void) {
  const { state, dispatch } = useGame();
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    if (!active) return;
    let remaining = 60;
    dispatch({ type: 'TICK_TIME', seconds: remaining });
    const interval = setInterval(() => {
      remaining -= 1;
      dispatch({ type: 'TICK_TIME', seconds: Math.max(0, remaining) });
      if (remaining <= 0) {
        clearInterval(interval);
        expireRef.current();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [active]);

  return state.timeLeft;
}

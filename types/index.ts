// Core types for Kaspa Brawl game
import { FightStep } from "../utils/simulateFight";

// Alert component props
export interface AlertProps {
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
  onDismiss?: () => void;
}

// Matchmaking interfaces
export interface MatchmakeRequest {
  player: string;
}

export interface MatchmakeResponse {
  opponent: string;
}

// Fight interfaces
export interface FightRequest {
  playerA: string;
  playerB: string;
}

export interface FightResponse {
  fightLogId: string;
  log: FightStep[];
}

// FightLog interfaces
export interface FightLogData {
  id: string;
  playerAId: string;
  playerBId: string;
  log: string; // JSON string of FightStep[]
  createdAt: string;
}

export interface FightLogResponse {
  id: string;
  playerA: {
    id: string;
    address: string;
  };
  playerB: {
    id: string;
    address: string;
  };
  log: FightStep[];
  createdAt: string;
}

export interface FightLogListItem {
  id: string;
  playerA: {
    id: string;
    address: string;
  };
  playerB: {
    id: string;
    address: string;
  };
  winner: string;
  createdAt: string;
}

import { Component } from '../core/ecs';

/**
 * Status effect interface for combat effects (buffs, debuffs, etc.)
 */
export interface StatusEffect {
  type: 'buff' | 'debuff' | 'stun' | 'dot' | 'hot';
  stat?: string;
  value: number;
  duration: number;
  source: string;
}

/**
 * Battle log entry for recording events during combat
 */
export interface BattleLogEntry {
  turn: number;
  type: 'hit' | 'miss' | 'criticalHit' | 'block' | 'dodge' | 'abilityUse' | 'abilityDamage' | 'abilityHeal' | 'abilityBuff' | 'abilityDebuff' | 'abilityStun' | 'stunned' | 'battleStart' | 'battleEnd';
  attackerId?: string;
  defenderId?: string;
  damage?: number;
  healAmount?: number;
  abilityId?: string;
  abilityName?: string;
  stat?: string;
  value?: number;
  duration?: number;
  winnerId?: string;
  loserId?: string;
}

/**
 * BattleStateComponent tracks the current state of a character in battle
 * Used during combat to track health, effects, and other battle-specific data
 */
export class BattleStateComponent implements Component {
  public readonly type = 'battleState';
  
  // Is the entity currently in a battle?
  public inBattle: boolean = false;
  
  // Has the battle completed?
  public battleComplete: boolean = false;
  
  // Is this entity the attacker in the current turn?
  public isAttacker: boolean = false;
  
  // Current and maximum health during the battle
  public currentHealth: number;
  public maxHealth: number;
  
  // Indicates if this battle has been processed by the blockchain system
  public blockchainProcessed: boolean = false;
  
  // Current and maximum energy during the battle
  public currentEnergy: number;
  public maxEnergy: number;
  
  // Entity ID of the opponent
  public opponentId: string | null = null;
  
  // Active status effects during battle
  public activeEffects: StatusEffect[] = [];
  
  // Log of all battle events
  public battleLog: BattleLogEntry[] = [];
  
  // Current turn number
  public currentTurn: number = 0;
  
  // Maximum number of turns before battle ends
  public maxTurns: number = 20;
  
  // Cached original attributes before applying status effects
  public originalAttributes?: Record<string, number>;
  
  constructor(data?: Partial<BattleStateComponent>) {
    this.inBattle = data?.inBattle || false;
    this.battleComplete = data?.battleComplete || false;
    this.isAttacker = data?.isAttacker || false;
    
    // These will be set properly when battle starts based on SimComponent
    this.currentHealth = data?.currentHealth || 100;
    this.maxHealth = data?.maxHealth || 100;
    this.currentEnergy = data?.currentEnergy || 50;
    this.maxEnergy = data?.maxEnergy || 50;
    
    this.opponentId = data?.opponentId || null;
    this.activeEffects = data?.activeEffects || [];
    this.battleLog = data?.battleLog || [];
    this.currentTurn = data?.currentTurn || 0;
    this.maxTurns = data?.maxTurns || 20;
  }
  
  /**
   * Initialize battle state from SimComponent
   */
  public initializeFromSim(maxHealth: number, maxEnergy: number): void {
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.maxEnergy = maxEnergy;
    this.currentEnergy = maxEnergy;
  }
  
  /**
   * Starts a new battle with the given opponent
   */
  public startBattle(opponentId: string, isAttacker: boolean): void {
    this.inBattle = true;
    this.battleComplete = false;
    this.opponentId = opponentId;
    this.isAttacker = isAttacker;
    this.currentTurn = 0;
    this.activeEffects = [];
    this.battleLog = [];
    
    // Log battle start
    this.battleLog.push({
      turn: 0,
      type: 'battleStart',
      attackerId: isAttacker ? 'self' : opponentId,
      defenderId: isAttacker ? opponentId : 'self'
    });
  }
  
  /**
   * Reset battle state after combat
   */
  public resetBattleState(): void {
    this.inBattle = false;
    this.battleComplete = false;
    this.opponentId = null;
    this.activeEffects = [];
    this.originalAttributes = undefined;
  }
}

export default BattleStateComponent;

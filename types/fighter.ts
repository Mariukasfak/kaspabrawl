import { Stats, EquipmentLoadout, calculateTotalStats, EquipmentSlot, Equipment } from './equipment';

export type FighterClass = 'Warrior' | 'Rogue' | 'Mage' | 'Ranger' | 'Cleric';

/**
 * Character level ranges
 */
export enum LevelRange {
  NOVICE = 'novice',      // 1-10
  AMATEUR = 'amateur',    // 11-20
  SKILLED = 'skilled',    // 21-30
  VETERAN = 'veteran',    // 31-40
  MASTER = 'master',      // 41-50
  GRANDMASTER = 'grandmaster', // 51-60
  LEGENDARY = 'legendary',    // 61-70
  MYTHIC = 'mythic'       // 71+
}

/**
 * Skills that fighters can use in combat
 */
export type FighterSkill = {
  id: string;
  name: string;
  description: string;
  type: 'attack' | 'defense' | 'buff' | 'debuff' | 'heal';
  cooldown: number; // Turns until can be used again
  currentCooldown: number; // Current cooldown counter
  energyCost: number; // Energy required to use skill
  damage?: number; // Damage multiplier if attack
  healing?: number; // Healing amount if heal
  stun?: boolean; // Whether skill stuns opponent
  statusEffect?: {
    type: 'bleed' | 'poison' | 'burn' | 'stun' | 'strengthBuff' | 'defenseBuff';
    duration: number; // Turns
    strength: number; // Effect power
  };
};

/**
 * Status effects that can be applied to fighters
 */
export type StatusEffect = {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative';
  duration: number; // Turns remaining
  strength: number; // Effect power/multiplier
  effect: 'damage' | 'heal' | 'statBoost' | 'statReduction';
  stat?: keyof Stats; // Stat affected if applicable
};

/**
 * Main Fighter model representing a combatant
 */
export interface Fighter {
  id: string;
  address: string;
  name: string;
  level: number;
  experience: number;
  class: FighterClass;

  // Base stats (before equipment)
  baseStats: Stats;
  
  // Current values in combat
  currentHp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  
  // Equipment
  equipment: EquipmentLoadout;
  
  // Skills
  skills: FighterSkill[];
  
  // Status effects
  statusEffects: StatusEffect[];
  
  // Fighting record
  wins: number;
  losses: number;
  draws: number;
}

/**
 * Calculate fighter's HP based on level and stats
 */
export function calculateMaxHp(level: number, vitality: number): number {
  return Math.floor(100 + (level * 10) + (vitality * 5));
}

/**
 * Calculate fighter's max energy based on level
 */
export function calculateMaxEnergy(level: number): number {
  return Math.floor(100 + (level * 5));
}

/**
 * Calculate experience needed for next level
 */
export function calculateExpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Get the level range title based on level
 */
export function getLevelRangeTitle(level: number): LevelRange {
  if (level >= 71) return LevelRange.MYTHIC;
  if (level >= 61) return LevelRange.LEGENDARY;
  if (level >= 51) return LevelRange.GRANDMASTER;
  if (level >= 41) return LevelRange.MASTER;
  if (level >= 31) return LevelRange.VETERAN;
  if (level >= 21) return LevelRange.SKILLED;
  if (level >= 11) return LevelRange.AMATEUR;
  return LevelRange.NOVICE;
}

/**
 * Apply an equipment item to a fighter
 */
export function equipItem(fighter: Fighter, item: Equipment): Fighter {
  // Create a properly typed copy of equipment
  const updatedEquipment: EquipmentLoadout = { ...fighter.equipment };
  // Now we can safely assign the item to its slot with proper type assertions
  if (item.slot === EquipmentSlot.WEAPON) {
    updatedEquipment[EquipmentSlot.WEAPON] = item as any; // Using 'as any' to override type check
  } else if ([EquipmentSlot.HEAD, EquipmentSlot.CHEST, EquipmentSlot.HANDS, EquipmentSlot.LEGS, EquipmentSlot.FEET].includes(item.slot)) {
    updatedEquipment[item.slot as EquipmentSlot.HEAD | EquipmentSlot.CHEST | EquipmentSlot.HANDS | EquipmentSlot.LEGS | EquipmentSlot.FEET] = item as any;
  } else {
    updatedEquipment[item.slot as EquipmentSlot.RING_1 | EquipmentSlot.RING_2 | EquipmentSlot.AMULET | EquipmentSlot.TRINKET] = item as any;
  }
  
  // Recalculate stats with new equipment
  const totalStats = calculateTotalStats(fighter.baseStats, updatedEquipment);
  
  // Update HP and Energy if they increase
  const newMaxHp = calculateMaxHp(fighter.level, totalStats.vitality);
  const newMaxEnergy = calculateMaxEnergy(fighter.level);
  
  // Increase current HP/Energy by the difference if it went up
  const hpDiff = newMaxHp - fighter.maxHp;
  const energyDiff = newMaxEnergy - fighter.maxEnergy;
  
  return {
    ...fighter,
    equipment: updatedEquipment,
    maxHp: newMaxHp,
    currentHp: Math.min(fighter.currentHp + Math.max(0, hpDiff), newMaxHp),
    maxEnergy: newMaxEnergy,
    energy: Math.min(fighter.energy + Math.max(0, energyDiff), newMaxEnergy)
  };
}

/**
 * Remove an equipment item from a fighter
 */
export function unequipItem(fighter: Fighter, slot: EquipmentSlot): Fighter {
  const updatedEquipment = { ...fighter.equipment };
  delete updatedEquipment[slot];
  
  // Recalculate stats without the item
  const totalStats = calculateTotalStats(fighter.baseStats, updatedEquipment);
  
  // Update max HP and Energy
  const newMaxHp = calculateMaxHp(fighter.level, totalStats.vitality);
  const newMaxEnergy = calculateMaxEnergy(fighter.level);
  
  return {
    ...fighter,
    equipment: updatedEquipment,
    maxHp: newMaxHp,
    // Reduce current HP if max HP decreased, but never below 1
    currentHp: Math.max(1, Math.min(fighter.currentHp, newMaxHp)),
    maxEnergy: newMaxEnergy,
    // Reduce current energy if max energy decreased, but never below 0
    energy: Math.max(0, Math.min(fighter.energy, newMaxEnergy))
  };
}

/**
 * Get total stats for a fighter including equipment bonuses
 */
export function getFighterTotalStats(fighter: Fighter): Stats {
  return calculateTotalStats(fighter.baseStats, fighter.equipment);
}

/**
 * Calculate damage reduction from defense
 */
export function calculateDamageReduction(defense: number): number {
  // Diminishing returns formula for defense
  const reductionPercent = (defense / (defense + 100)) * 75; // Max 75% reduction
  return reductionPercent / 100;
}

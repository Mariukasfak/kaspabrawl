import prisma from '../lib/prisma';
import { EquipmentLoadout, Stats, calculateTotalStats, EquipmentSlot, Weapon, SpecialEffect } from '../types/equipment';
import { generateEquipmentSet } from './equipmentGenerator';
import { getFighterDesignByAddress, FighterDesign } from './fighterDesigns';
import { ICharacter } from '../types/characterProgression';
import { createCharacterFromFighter, getFighterSpecialAbilities } from './characterProgressionIntegration';
import { SpecialAbility } from '../types/characterAbilities';
import { StatusEffect, Fighter as FighterType } from '../types/fighter';

export type FighterSkill = 'PowerStrike' | 'QuickAttack' | 'Regenerate' | 'Shield' | 'BasicAttack' | 
                           'Whirlwind' | 'Backstab' | 'FireBlast' | 'FrostArrow' | 'DivineSmite' |
                           'Charge' | 'Berserk' | 'Execute' | 'ThunderStrike' | 'DeathGrip';

export interface Fighter {
  id: string;
  address: string;
  name?: string;
  level: number;
  experience: number;
  baseStats: Stats;
  equipment: EquipmentLoadout;
  currentHp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  skills: FighterSkill[];
  class: string;
  statusEffects: StatusEffect[];
  wins: number;
  losses: number;
  draws: number;
  
  // Progression data
  progression?: {
    unallocatedStatPoints: number;
    characterAbilities: SpecialAbility[];
    lastLevelUpTime?: Date;
  };
}

export interface FightStep {
  type: 'attack' | 'skill' | 'block' | 'dodge' | 'special' | 'heal' | 'critical' | 'end' | 'start' | 'levelup' | 'ability';
  attacker: string;
  defender: string;
  damage?: number;
  healing?: number;
  skill?: FighterSkill;
  ability?: SpecialAbility; // Add ability for progression abilities
  text: string;
  remainingHp?: {
    attackerHp: number;
    defenderHp: number;
  };
  specialEffect?: {
    name: string;
    description: string;
  };
  progression?: {
    xpGained?: number;
    levelGained?: boolean;
    leveledUp?: boolean;
    newLevel?: number;
    statGains?: {
      strength?: number;
      agility?: number;
      intelligence?: number;
    };
    unlockedAbilities?: any[];
    abilitiesUnlocked?: SpecialAbility[];
  };
}

// Add a FightResult interface for the simulation result
interface FightResult {
  winner: string;
  loser: string;
  steps: FightStep[];
  progression?: {
    winner: {
      xpGained: number;
      leveledUp?: boolean;
      newLevel?: number;
      unlockedAbilities?: any[];
    };
    loser: {
      xpGained: number;
      leveledUp?: boolean;
      newLevel?: number;
    };
  };
}

/**
 * Generate random stats for a fighter based on their address
 */
function generateFighterStats(address: string): Stats {
  // Use the address as a seed for randomness
  const seed = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Generate stats with values between 5-15
  const rng = (offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return 5 + Math.floor((x - Math.floor(x)) * 11);
  };
  
  return {
    strength: rng(1),
    agility: rng(2),
    vitality: rng(3),
    intelligence: rng(4), // Added intelligence stat
    defense: rng(5),
    critChance: rng(6) / 10,    // 0.5 - 1.5
    critDamage: 1.5 + rng(7) / 10, // 1.5 - 2.5
    blockRate: rng(8) / 10,     // 0.5 - 1.5
    magicFind: rng(9) / 5,      // 1 - 3
  };
}

/**
 * Get fighter skills based on stats
 */
function getFighterSkills(fighter: Fighter): FighterSkill[] {
  const skills: FighterSkill[] = [];
  
  // Calculate total stats including equipment bonuses
  const totalStats = calculateTotalStats(fighter.baseStats, fighter.equipment);
  
  if (totalStats.strength > 10) skills.push('PowerStrike');
  if (totalStats.agility > 10) skills.push('QuickAttack');
  if (totalStats.vitality > 10) skills.push('Regenerate');
  if (totalStats.defense > 10) skills.push('Shield');
  
  // Everyone gets at least one skill
  if (skills.length === 0) {
    skills.push('BasicAttack');
  }
  
  return skills;
}

/**
 * Simulate a fight between two players
 */
export async function simulateFight(playerAId: string, playerBId: string): Promise<FightResult> {
  // Fetch players from database
  const [playerA, playerB] = await Promise.all([
    prisma.user.findUnique({ where: { id: playerAId } }),
    prisma.user.findUnique({ where: { id: playerBId } })
  ]);

  if (!playerA || !playerB) {
    throw new Error('One or both players not found');
  }
  
  // Create fighter objects with base stats
  const baseStatsA = generateFighterStats(playerA.address);
  const baseStatsB = generateFighterStats(playerB.address);
  
  // Generate equipment for both fighters
  const equipmentA = generateEquipmentSet(1, 0) as EquipmentLoadout; // Level 1 equipment
  const equipmentB = generateEquipmentSet(1, 0) as EquipmentLoadout; // Level 1 equipment
  
  // Calculate max HP based on vitality
  const maxHpA = 100 + (baseStatsA.vitality * 5);
  const maxHpB = 100 + (baseStatsB.vitality * 5);
  
  const fighterA: Fighter = {
    id: playerA.id,
    address: playerA.address,
    name: playerA.address.slice(0, 8), // Use address as name if no name available
    level: 1,
    experience: 0,
    baseStats: baseStatsA,
    equipment: equipmentA,
    currentHp: maxHpA,
    maxHp: maxHpA,
    energy: 100,
    maxEnergy: 100,
    skills: [],
    class: 'Warrior', // Default class for progression
    statusEffects: [],
    wins: 0,
    losses: 0,
    draws: 0,
    progression: {
      unallocatedStatPoints: 0,
      characterAbilities: [],
      lastLevelUpTime: undefined
    }
  };
  
  const fighterB: Fighter = {
    id: playerB.id,
    address: playerB.address,
    name: playerB.address.slice(0, 8), // Use address as name if no name available
    level: 1,
    experience: 0,
    baseStats: baseStatsB,
    equipment: equipmentB,
    currentHp: maxHpB,
    maxHp: maxHpB,
    energy: 100,
    maxEnergy: 100,
    skills: [],
    class: 'Mage', // Default class for progression
    statusEffects: [],
    wins: 0,
    losses: 0,
    draws: 0,
    progression: {
      unallocatedStatPoints: 0,
      characterAbilities: [],
      lastLevelUpTime: undefined
    }
  };
  
  // Add skills based on total stats including equipment
  fighterA.skills = getFighterSkills(fighterA);
  fighterB.skills = getFighterSkills(fighterB);
  
  // Simulate the fight
  const fightSteps: FightStep[] = [];
  let currentAttacker = Math.random() > 0.5 ? fighterA : fighterB;
  let currentDefender = currentAttacker === fighterA ? fighterB : fighterA;
  
  // Fight until one fighter is defeated
  while (fighterA.currentHp > 0 && fighterB.currentHp > 0) {
    // Swap roles if needed
    if (currentAttacker !== fighterA && currentAttacker !== fighterB) {
      const temp = currentAttacker;
      currentAttacker = currentDefender;
      currentDefender = temp;
    }
    
    // Determine attack type
    const useSkill = Math.random() > 0.7 && currentAttacker.skills.length > 0;
    const selectedSkill = useSkill 
      ? currentAttacker.skills[Math.floor(Math.random() * currentAttacker.skills.length)] 
      : null;
    
    // Calculate total stats including equipment
    const attackerStats = calculateTotalStats(currentAttacker.baseStats, currentAttacker.equipment);
    const defenderStats = calculateTotalStats(currentDefender.baseStats, currentDefender.equipment);
    
    // Get weapon damage if equipped
    let weaponDamage = 0;
    const weapon = currentAttacker.equipment[EquipmentSlot.WEAPON];
    if (weapon) {
      const typedWeapon = weapon as Weapon;
      weaponDamage = Math.floor(Math.random() * (typedWeapon.damage.max - typedWeapon.damage.min + 1) + typedWeapon.damage.min);
    }
    
    // Base damage calculation
    let baseDamage = attackerStats.strength * (1 + Math.random() * 0.5) + weaponDamage;
    if (selectedSkill === 'PowerStrike') baseDamage *= 1.5;
    if (selectedSkill === 'QuickAttack') baseDamage *= 0.8;
    
    // Apply defense and damage reduction
    const defenseMultiplier = 1 - (defenderStats.defense / 100);
    let finalDamage = Math.floor(baseDamage * defenseMultiplier);
    
    // Critical hit chance
    let stepType: FightStep['type'] = 'attack';
    if (selectedSkill) stepType = 'skill';
    
    if (Math.random() * 100 < attackerStats.critChance) {
      finalDamage = Math.floor(finalDamage * attackerStats.critDamage);
      stepType = 'critical';
    }
    
    // Chance to dodge or block
    const dodgeChance = defenderStats.agility / 100;
    if (Math.random() < dodgeChance) {
      finalDamage = 0;
      stepType = 'dodge';
    } else if (Math.random() * 100 < defenderStats.blockRate) {
      finalDamage = Math.floor(finalDamage * 0.5);
      stepType = 'block';
    }
    
    // Check for special effects that trigger on hit
    let specialEffect: { name: string; description: string } | undefined;
    
    // Look through attacker's equipment for special effects
    if (finalDamage > 0) {
      Object.values(currentAttacker.equipment).forEach(item => {
        if (!item || !item.specialEffects) return;
        
        item.specialEffects.forEach((effect: SpecialEffect) => {
          if (effect.effectType === 'onHit' && 
              Math.random() < (effect.triggerChance || 0.1)) {
            // Apply special effect
            if (effect.name === 'Life Steal' && effect.effectStrength) {
              // Heal attacker based on damage dealt
              const healAmount = Math.floor(finalDamage * effect.effectStrength);
              currentAttacker.currentHp = Math.min(currentAttacker.maxHp, currentAttacker.currentHp + healAmount);
              specialEffect = {
                name: effect.name,
                description: `${currentAttacker.name} healed for ${healAmount} HP!`
              };
            } else if (effect.name === 'Thunder Strike' && effect.effectStrength) {
              // Bonus damage
              const bonusDamage = Math.floor(finalDamage * effect.effectStrength);
              currentDefender.currentHp = Math.max(0, currentDefender.currentHp - bonusDamage);
              finalDamage += bonusDamage;
              specialEffect = {
                name: effect.name,
                description: `${currentAttacker.name}'s attack calls down lightning for ${bonusDamage} additional damage!`
              };
            }
          }
        });
      });
    }
    
    // Apply damage
    currentDefender.currentHp = Math.max(0, currentDefender.currentHp - finalDamage);
    
    // Generate step text
    let stepText = '';
    if (stepType === 'dodge') {
      stepText = `${currentDefender.name} dodged ${currentAttacker.name}'s attack!`;
    } else if (stepType === 'block') {
      stepText = `${currentDefender.name} blocked and reduced ${currentAttacker.name}'s attack for ${finalDamage} damage!`;
    } else if (stepType === 'critical') {
      stepText = `${currentAttacker.name} landed a CRITICAL hit on ${currentDefender.name} for ${finalDamage} damage!`;
    } else if (stepType === 'skill') {
      stepText = `${currentAttacker.name} used ${selectedSkill} for ${finalDamage} damage!`;
    } else {
      stepText = `${currentAttacker.name} attacked ${currentDefender.name} for ${finalDamage} damage!`;
    }
    
    // Record the step
    fightSteps.push({
      type: stepType,
      attacker: currentAttacker.id,
      defender: currentDefender.id,
      damage: finalDamage,
      skill: selectedSkill || undefined,
      text: stepText,
      remainingHp: {
        attackerHp: currentAttacker.currentHp,
        defenderHp: currentDefender.currentHp,
      },
      specialEffect: specialEffect
    });
    
    // Check if fight is over
    if (currentDefender.currentHp <= 0) {
      fightSteps.push({
        type: 'end',
        attacker: currentAttacker.id,
        defender: currentDefender.id,
        text: `${currentAttacker.name} defeated ${currentDefender.name}!`
      });
      break;
    }
    
    // Swap attacker and defender
    const temp = currentAttacker;
    currentAttacker = currentDefender;
    currentDefender = temp;
  }
  
  // Determine winner
  const winner = fighterA.currentHp <= 0 ? fighterB : fighterA;
  const loser = winner === fighterA ? fighterB : fighterA;
  
  // Award XP based on battle outcome
  // Winner gets more XP than loser
  const winnerXP = Math.floor(50 + (loser.level * 10));
  const loserXP = Math.floor(20 + (winner.level * 5));
  
  // Create progression step for winner
  let winnerLeveledUp = false;
  let winnerNewLevel = winner.level;
  let winnerUnlockedAbilities: any[] = [];
  
  // Calculate if level up would occur based on simple threshold
  // For this simple version, level up happens every 100 * current level XP
  const xpForNextLevel = winner.level * 100;
  if (winner.experience + winnerXP >= xpForNextLevel) {
    winnerLeveledUp = true;
    winnerNewLevel = winner.level + 1;
  }
  
  // Add XP gain steps to the fight log
  fightSteps.push({
    type: 'special',
    attacker: winner.id,
    defender: loser.id,
    text: `${winner.name} gained ${winnerXP} XP!`,
    progression: {
      xpGained: winnerXP,
      levelGained: winnerLeveledUp,
      newLevel: winnerNewLevel
    }
  });
  
  fightSteps.push({
    type: 'special',
    attacker: loser.id,
    defender: winner.id,
    text: `${loser.name} gained ${loserXP} XP for participating.`,
    progression: {
      xpGained: loserXP
    }
  });
  
  // If winner leveled up, add a special step
  if (winnerLeveledUp) {
    fightSteps.push({
      type: 'levelup',
      attacker: winner.id,
      defender: loser.id,
      text: `${winner.name} reached level ${winnerNewLevel}!`,
      progression: {
        leveledUp: true,
        newLevel: winnerNewLevel,
        unlockedAbilities: winnerUnlockedAbilities
      }
    });
  }
  
  // Neišsaugome kovos rezultato čia, nes tai jau daroma fight.ts API
  
  return {
    winner: winner.id,
    loser: loser.id,
    steps: fightSteps,
    progression: {
      winner: {
        xpGained: winnerXP,
        leveledUp: winnerLeveledUp,
        newLevel: winnerLeveledUp ? winnerNewLevel : undefined,
        unlockedAbilities: winnerUnlockedAbilities
      },
      loser: {
        xpGained: loserXP
      }
    }
  };
}

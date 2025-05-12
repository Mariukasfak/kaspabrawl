/**
 * Special abilities for character classes
 * This file defines the abilities and types for the character progression system
 */

/**
 * Ability type definitions for character classes
 */
export enum AbilityType {
  ACTIVE = 'active',    // Can be used once per battle
  PASSIVE = 'passive',  // Always in effect
  ULTIMATE = 'ultimate' // Special powerful ability 
}

/**
 * Special ability interface for character abilities
 */
export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  type: AbilityType;
  unlockLevel: number;   // Level at which this ability is unlocked
  cooldown?: number;     // For active abilities, number of turns before it can be used again
  manaCost?: number;     // For mage abilities, mana cost to use
  staminaCost?: number;  // For fighter abilities, stamina cost to use
  energyCost?: number;   // For ranger abilities, energy cost to use
  damageMultiplier?: number; // For damage dealing abilities
  isUnlocked: boolean;   // Whether the ability is currently unlocked
}

// Define common abilities for Mage class
export const mageAbilities: SpecialAbility[] = [
  {
    id: 'magic-missile',
    name: 'Magic Missile',
    description: 'Launch 3 arcane projectiles dealing intelligence-based damage',
    type: AbilityType.ACTIVE,
    unlockLevel: 1,
    cooldown: 1,
    manaCost: 10,
    damageMultiplier: 0.8,
    isUnlocked: false
  },
  {
    id: 'arcane-shield',
    name: 'Arcane Shield',
    description: 'Create a shield that absorbs damage based on your intelligence',
    type: AbilityType.ACTIVE,
    unlockLevel: 5,
    cooldown: 3,
    manaCost: 20,
    isUnlocked: false
  },
  {
    id: 'mana-surge',
    name: 'Mana Surge',
    description: 'Passive: Increases mana regeneration by 25%',
    type: AbilityType.PASSIVE,
    unlockLevel: 10,
    isUnlocked: false
  },
  {
    id: 'fireball',
    name: 'Fireball',
    description: 'Launch a ball of fire that deals AoE damage with a chance to burn',
    type: AbilityType.ACTIVE,
    unlockLevel: 15,
    cooldown: 3,
    manaCost: 30,
    damageMultiplier: 1.5,
    isUnlocked: false
  },
  {
    id: 'arcane-mastery',
    name: 'Arcane Mastery',
    description: 'Passive: Spell damage increased by 15%',
    type: AbilityType.PASSIVE,
    unlockLevel: 25,
    isUnlocked: false
  },
  {
    id: 'meteor-storm',
    name: 'Meteor Storm',
    description: 'Call down a storm of meteors dealing massive damage to all enemies',
    type: AbilityType.ULTIMATE,
    unlockLevel: 50,
    cooldown: 5,
    manaCost: 100,
    damageMultiplier: 3.0,
    isUnlocked: false
  },
];

// Define common abilities for Fighter class
export const fighterAbilities: SpecialAbility[] = [
  {
    id: 'power-slash',
    name: 'Power Slash',
    description: 'A powerful slash that deals strength-based damage',
    type: AbilityType.ACTIVE,
    unlockLevel: 1,
    cooldown: 1,
    staminaCost: 10,
    damageMultiplier: 1.2,
    isUnlocked: false
  },
  {
    id: 'iron-skin',
    name: 'Iron Skin',
    description: 'Harden your skin, reducing damage taken by 25% for 2 turns',
    type: AbilityType.ACTIVE,
    unlockLevel: 5,
    cooldown: 4,
    staminaCost: 20,
    isUnlocked: false
  },
  {
    id: 'battle-stance',
    name: 'Battle Stance',
    description: 'Passive: Increases strength by 10%',
    type: AbilityType.PASSIVE,
    unlockLevel: 10,
    isUnlocked: false
  },
  {
    id: 'stunning-blow',
    name: 'Stunning Blow',
    description: 'A powerful attack that has a chance to stun the target',
    type: AbilityType.ACTIVE,
    unlockLevel: 15,
    cooldown: 3,
    staminaCost: 25,
    damageMultiplier: 1.0,
    isUnlocked: false
  },
  {
    id: 'second-wind',
    name: 'Second Wind',
    description: 'Passive: Recover 5% of max HP at the start of each turn',
    type: AbilityType.PASSIVE,
    unlockLevel: 25,
    isUnlocked: false
  },
  {
    id: 'berserker-rage',
    name: 'Berserker Rage',
    description: 'Enter a state of rage, increasing damage by 50% but reducing defense',
    type: AbilityType.ULTIMATE,
    unlockLevel: 50,
    cooldown: 5,
    staminaCost: 50,
    isUnlocked: false
  },
];

// Define common abilities for Ranger class
export const rangerAbilities: SpecialAbility[] = [
  {
    id: 'precise-shot',
    name: 'Precise Shot',
    description: 'A precise shot that deals agility-based damage with increased crit chance',
    type: AbilityType.ACTIVE,
    unlockLevel: 1,
    cooldown: 1,
    energyCost: 10,
    damageMultiplier: 1.0,
    isUnlocked: false
  },
  {
    id: 'evasion',
    name: 'Evasion',
    description: 'Increase dodge chance by 30% for 2 turns',
    type: AbilityType.ACTIVE,
    unlockLevel: 5,
    cooldown: 3,
    energyCost: 15,
    isUnlocked: false
  },
  {
    id: 'hunters-focus',
    name: 'Hunter\'s Focus',
    description: 'Passive: Increases critical hit chance by 15%',
    type: AbilityType.PASSIVE,
    unlockLevel: 10,
    isUnlocked: false
  },
  {
    id: 'multishot',
    name: 'Multishot',
    description: 'Fire multiple arrows at once, hitting up to 3 targets',
    type: AbilityType.ACTIVE,
    unlockLevel: 15,
    cooldown: 3,
    energyCost: 25,
    damageMultiplier: 0.7,
    isUnlocked: false
  },
  {
    id: 'keen-eye',
    name: 'Keen Eye',
    description: 'Passive: Reduces the dodge chance of enemies by 10%',
    type: AbilityType.PASSIVE,
    unlockLevel: 25,
    isUnlocked: false
  },
  {
    id: 'arrow-storm',
    name: 'Arrow Storm',
    description: 'Rain arrows on all enemies, dealing massive damage based on agility',
    type: AbilityType.ULTIMATE,
    unlockLevel: 50,
    cooldown: 5,
    energyCost: 50,
    damageMultiplier: 2.5,
    isUnlocked: false
  },
];

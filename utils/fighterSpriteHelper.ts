/**
 * Helper utilities for fighter sprites based on class and level
 * Implements the level-based sprite system:
 * - Different sprite images based on level tiers (1, 5, 10, 15, 95, 100)
 * - Support for 3 fighter classes (fighter, ranged, mage)
 */

import { FighterClass } from '../types/fighter';

/**
 * Level tiers for fighter sprites
 * Each tier represents a visual upgrade to the fighter's appearance
 */
export enum LevelTier {
  NOVICE = 1,     // Level 1-4: Novice appearance
  APPRENTICE = 5, // Level 5-9: Apprentice appearance
  ADEPT = 10,     // Level 10-14: Adept appearance
  EXPERT = 15,    // Level 15-94: Expert appearance
  MASTER = 95,    // Level 95-99: Master appearance
  LEGENDARY = 100 // Level 100: Legendary appearance
}

/**
 * Determine the level tier based on fighter level
 * @param level - The fighter's level
 * @returns The appropriate level tier for visual representation
 */
export function getLevelTier(level: number): number {
  if (level >= 100) {
    return LevelTier.LEGENDARY; // 100
  } else if (level >= 95) {
    return LevelTier.MASTER; // 95
  } else if (level >= 15) {
    return LevelTier.EXPERT; // 15
  } else if (level >= 10) {
    return LevelTier.ADEPT; // 10
  } else if (level >= 5) {
    return LevelTier.APPRENTICE; // 5
  } else {
    return LevelTier.NOVICE; // 1
  }
}

/**
 * Get the display name for a level tier
 * @param tier - The level tier
 * @returns The display name for the tier
 */
export function getLevelTierName(tier: number): string {
  switch (tier) {
    case LevelTier.LEGENDARY:
      return 'Legendary';
    case LevelTier.MASTER:
      return 'Master';
    case LevelTier.EXPERT:
      return 'Expert';
    case LevelTier.ADEPT:
      return 'Adept';
    case LevelTier.APPRENTICE:
      return 'Apprentice';
    case LevelTier.NOVICE:
    default:
      return 'Novice';
  }
}

/**
 * Get the sprite class name to use for a given fighter class
 * Maps the fighter class to the appropriate sprite class name
 * @param fighterClass - The fighter's class
 * @returns The sprite class name to use ('archer' for ranged, otherwise the class name)
 */
export function getSpriteClass(fighterClass: FighterClass): string {
  // Map ranged class to archer for sprites
  return fighterClass === 'ranged' ? 'archer' : fighterClass;
}

/**
 * Get the sprite image key for a fighter based on class and level
 * Used for Phaser sprite atlas keys
 * @param fighterClass - The fighter's class
 * @param level - The fighter's level
 * @returns The image key for the fighter sprite
 */
export function getFighterSpriteKey(fighterClass: FighterClass, level: number): string {
  // Map ranged class to archer for sprites
  const spriteClass = getSpriteClass(fighterClass);
  const levelTier = getLevelTier(level);
  
  // Generate sprite key in the format "fighter-{spriteClass}-{levelTier}"
  return `fighter-${spriteClass}-${levelTier}`;
}

/**
 * Get the path to a fighter sprite image
 * @param fighterClass - The fighter's class
 * @param level - The fighter's level 
 * @returns The file path to the fighter sprite
 */
export function getFighterSpritePath(fighterClass: FighterClass, level: number): string {
  const spriteClass = getSpriteClass(fighterClass);
  const levelTier = getLevelTier(level);
  
  // Generate path in the format "/assets/fighters/{fighterClass}/{spriteClass}{levelTier}.png"
  return `/assets/fighters/${fighterClass}/${spriteClass}${levelTier}.png`;
}

/**
 * Get the path to a fighter animation sprite sheet
 * @param fighterClass - The fighter's class
 * @param level - The fighter's level
 * @param animation - The animation name
 * @returns The file path to the fighter animation sprite sheet
 */
export function getFighterAnimationPath(fighterClass: FighterClass, level: number, animation: string): string {
  const spriteClass = getSpriteClass(fighterClass);
  const levelTier = getLevelTier(level);
  
  // Generate path in the format "/assets/fighters/{fighterClass}/animations/{spriteClass}{levelTier}_{animation}.png"
  return `/assets/fighters/${fighterClass}/animations/${spriteClass}${levelTier}_${animation}.png`;
}

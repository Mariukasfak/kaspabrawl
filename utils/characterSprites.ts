/**
 * Character Sprites Generator
 * Creates and manages character sprites for different classes and levels
 */

// Import FighterClass to ensure consistency with fighter types
import { FighterClass } from '../types/fighter';
import { getLevelTier, getSpriteClass } from './fighterSpriteHelper';

// Character classes should match FighterClass for consistency
export type CharacterSpriteClass = FighterClass;

/**
 * Generate sprite name based on character class and level
 * Follows the naming convention: className1.png, className5.png, etc.
 * @param characterClass - The class of the character
 * @param level - The current level of the character
 * @returns string - Filename for the sprite
 */
export function generateSpriteName(characterClass: CharacterSpriteClass, level: number): string {
  // Use the helper functions from fighterSpriteHelper for consistency
  const spriteClass = getSpriteClass(characterClass);
  const levelTier = getLevelTier(level);
  
  return `${spriteClass}${levelTier}.png`;
}

/**
 * Get the asset path for character sprites
 * @param characterClass - The character class
 * @param level - The character level
 * @returns string - Full path to the sprite
 */
export function getCharacterSpritePath(characterClass: CharacterSpriteClass, level: number): string {
  // Use the fighter sprite path helper function to ensure consistency
  const { getFighterSpritePath } = require('./fighterSpriteHelper');
  return getFighterSpritePath(characterClass, level);
}

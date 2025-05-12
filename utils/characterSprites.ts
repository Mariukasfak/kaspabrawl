/**
 * Character Sprites Generator
 * Creates and manages character sprites for different classes and levels
 */

// Character classes
export type CharacterSpriteClass = 'fighter' | 'mage' | 'ranger';

/**
 * Generate sprite name based on character class and level
 * Follows the naming convention: className1.png, className5.png, etc.
 * @param characterClass - The class of the character
 * @param level - The current level of the character
 * @returns string - Filename for the sprite
 */
export function generateSpriteName(characterClass: CharacterSpriteClass, level: number): string {
  // Determine which sprite milestone to use
  let spriteLevel: number;
  
  if (level >= 100) {
    spriteLevel = 100;
  } else {
    // Find the highest multiple of 5 that is less than or equal to the level
    // For level 1-4, use sprite 1
    // For levels 5-9, use sprite 5, etc.
    spriteLevel = level < 5 ? 1 : Math.floor(level / 5) * 5;
  }
  
  return `${characterClass}${spriteLevel}.png`;
}

/**
 * Get the asset path for character sprites
 * @param characterClass - The character class
 * @param level - The character level
 * @returns string - Full path to the sprite
 */
export function getCharacterSpritePath(characterClass: CharacterSpriteClass, level: number): string {
  return `/assets/fighters/${generateSpriteName(characterClass, level)}`;
}

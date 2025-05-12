/**
 * Character Progression Integration - Utility functions to bridge the
 * new character progression system with existing Fighter models
 */

import { Fighter, FighterClass } from '../types/fighter';
import { ICharacter, CharacterClass, createCharacter } from '../types/characterProgression';
import { Stats } from '../types/equipment';
import { SpecialAbility } from '../types/characterAbilities';
import { getCharacterSpritePath } from './characterSprites';

/**
 * Map from FighterClass to CharacterClass
 * Note: Only the classes specified in the requirements are supported for progression
 */
export function mapFighterClassToCharacterClass(fighterClass: FighterClass): CharacterClass | null {
  const classMap: Record<FighterClass, CharacterClass | null> = {
    'Warrior': 'Fighter',
    'Rogue': 'Ranger',    // Map Rogue to Ranger as a close approximation
    'Mage': 'Mage',
    'Ranger': 'Ranger',
    'Cleric': 'Mage'      // Map Cleric to Mage as a close approximation
  };
  
  return classMap[fighterClass];
}

/**
 * Apply character progression stats to a Fighter
 * @param fighter - The fighter to update
 * @param character - Character progression data
 * @returns Updated fighter with new stats
 */
export function applyCharacterStatsToFighter(fighter: Fighter, character: ICharacter): Fighter {
  // Create a copy of the fighter
  const updatedFighter: Fighter = { ...fighter };
  
  // Update level and experience
  updatedFighter.level = character.level;
  updatedFighter.experience = character.experience;
  
  // Update the stats that are tracked in the character progression
  const updatedStats: Stats = { ...updatedFighter.baseStats };
  updatedStats.strength = character.stats.strength;
  updatedStats.agility = character.stats.agility;
  updatedStats.intelligence = character.stats.intelligence;
  
  // Update derived stats based on main attributes
  updatedStats.vitality = Math.max(10, Math.floor(character.stats.strength * 0.5) + 10);
  updatedStats.critChance = Math.min(30, updatedStats.critChance + character.stats.agility * 0.3);
  updatedStats.defense = Math.max(5, Math.floor(character.stats.strength * 0.3) + 5);
  
  updatedFighter.baseStats = updatedStats;
  
  // Update HP based on character HP calculations
  updatedFighter.maxHp = character.maxHP;
  updatedFighter.currentHp = character.maxHP;
  
  return updatedFighter;
}

/**
 * Create a character progression model from an existing fighter
 * @param fighter - The fighter to convert
 * @returns A character progression model or null if fighter class is not supported
 */
export function createCharacterFromFighter(fighter: Fighter): ICharacter | null {
  if (!fighter) {
    return null;
  }
  
  // Get character class, defaulting to Fighter if not specified or not supported
  const characterClass = fighter.class ? mapFighterClassToCharacterClass(fighter.class as FighterClass) : 'Fighter';
  
  // Create base character
  const character = createCharacter(fighter.name || 'Fighter', characterClass || 'Fighter' as CharacterClass);
  
  // Set level and XP
  character.level = fighter.level || 1;
  character.experience = fighter.experience || 0;
  
  // Apply base stats from fighter
  if (fighter.baseStats) {
    character.stats.strength = fighter.baseStats.strength || character.stats.strength;
    character.stats.agility = fighter.baseStats.agility || character.stats.agility;
    character.stats.intelligence = fighter.baseStats.intelligence || character.stats.intelligence || 5;
  }
  
  // Set unallocated stat points from progression data
  if (fighter.progression?.unallocatedStatPoints !== undefined) {
    character.freePoints = fighter.progression.unallocatedStatPoints;
  }
  
  // Copy abilities from fighter progression if available
  if (fighter.progression?.characterAbilities && fighter.progression.characterAbilities.length > 0) {
    // For each ability in the fighter progression, find matching ability in character
    fighter.progression.characterAbilities.forEach((ability: SpecialAbility) => {
      const matchingAbility = character.abilities.find((a: SpecialAbility) => a.id === ability.id);
      if (matchingAbility) {
        matchingAbility.isUnlocked = true;
      }
    });
  }
  
  // Recalculate derived values
  character.maxHP = character.calculateMaxHP();
  character.experienceToNextLevel = character.calculateExperienceForNextLevel();
  
  return character;
}

/**
 * Get special abilities for a fighter based on character progression
 * @param fighter - The fighter to get abilities for
 * @returns Array of special abilities
 */
export function getFighterSpecialAbilities(fighter: Fighter): SpecialAbility[] {
  const character = createCharacterFromFighter(fighter);
  
  if (!character) {
    return [];
  }
  
  return character.abilities.filter(ability => ability.isUnlocked);
}

/**
 * Get sprite path for a fighter using the character progression system
 * @param fighter - The fighter to get sprite for
 * @returns Path to the sprite image
 */
export function getFighterSpritePath(fighter: Fighter): string {
  const characterClass = mapFighterClassToCharacterClass(fighter.class);
  
  if (!characterClass) {
    // Return default sprite if no mapping
    return '/assets/fighters/default1.png';
  }
  
  return getCharacterSpritePath(characterClass.toLowerCase() as any, fighter.level);
}

/**
 * Get sprite URL for a fighter using the character progression system
 * @param fighter - The fighter to get sprite for
 * @returns URL for the sprite or null if fighter class is not supported
 */
export function getFighterSpriteUrl(fighter: Fighter): string | null {
  const characterClass = mapFighterClassToCharacterClass(fighter.class);
  if (!characterClass) {
    return null;
  }
  
  // Determine which sprite milestone to use
  let spriteLevel: number;
  
  if (fighter.level >= 100) {
    spriteLevel = 100;
  } else {
    // Find the highest multiple of 5 that is less than or equal to the level
    // For level 1-4, use sprite 1
    spriteLevel = fighter.level < 5 ? 1 : Math.floor(fighter.level / 5) * 5;
  }
  
  return `${characterClass.toLowerCase()}${spriteLevel}.png`;
}

/**
 * Update Fighter progression data based on Character model and persist to database
 * @param fighter - The fighter to update
 * @param character - The character progression data to apply
 * @returns Updated fighter
 */
export async function updateFighterProgression(
  fighter: Fighter,
  character: ICharacter
): Promise<Fighter> {
  if (!fighter || !character) {
    return fighter;
  }
  
  // Create a copy of the fighter
  const updatedFighter: Fighter = { ...fighter };
  
  // Update level and experience
  updatedFighter.level = character.level;
  updatedFighter.experience = character.experience;
  
  // Update base stats
  const updatedStats = { ...updatedFighter.baseStats };
  updatedStats.strength = character.stats.strength;
  updatedStats.agility = character.stats.agility;
  updatedStats.intelligence = character.stats.intelligence;
  updatedFighter.baseStats = updatedStats;
  
  // Update progression data
  if (!updatedFighter.progression) {
    updatedFighter.progression = {
      unallocatedStatPoints: character.freePoints,
      characterAbilities: character.abilities.filter(ability => ability.isUnlocked)
    };
  } else {
    updatedFighter.progression.unallocatedStatPoints = character.freePoints;
    // Only update abilities if there are unlocked abilities
    const unlockedAbilities = character.abilities.filter(ability => ability.isUnlocked);
    if (unlockedAbilities.length > 0) {
      updatedFighter.progression.characterAbilities = unlockedAbilities;
    }
    updatedFighter.progression.lastLevelUpTime = new Date();
  }
  
  // Recalculate HP based on new stats
  updatedFighter.maxHp = character.maxHP;
  updatedFighter.currentHp = character.maxHP; // Reset HP to full on level up
  
  // Save changes to database if fighter ID is provided
  if (fighter.id) {
    try {
      // Import prisma client dynamically to avoid circular dependencies
      const { default: prisma } = await import('../lib/prisma');
      
      // Update fighter data in database
      await prisma.FighterData.upsert({
        where: { userId: fighter.id },
        update: {
          level: character.level,
          experience: character.experience,
          strength: character.stats.strength,
          agility: character.stats.agility,
          intelligence: character.stats.intelligence,
          unallocatedStatPoints: character.freePoints,
          lastLevelUpTime: new Date(),
          // Store character abilities as JSON string
          abilities: JSON.stringify(character.abilities.filter(ability => ability.isUnlocked))
        },
        create: {
          user: { connect: { id: fighter.id } },
          level: character.level,
          experience: character.experience,
          strength: character.stats.strength,
          agility: character.stats.agility,
          intelligence: character.stats.intelligence,
          unallocatedStatPoints: character.freePoints,
          class: fighter.class || 'Warrior',
          abilities: JSON.stringify(character.abilities.filter(ability => ability.isUnlocked)),
          lastLevelUpTime: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating fighter progression:', error);
    }
  }
  
  return updatedFighter;
}

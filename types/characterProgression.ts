/**
 * Character Progression System - Handles XP, leveling, and stat allocation for character classes
 * Integration points:
 * - Connects with fighter.ts to enhance the existing Fighter interface
 * - Provides sprite management for visual progression
 * - Supports the stat-based combat system defined in equipment.ts
 */

import { Stats } from './equipment';
import { SpecialAbility, AbilityType, mageAbilities, fighterAbilities, rangerAbilities } from './characterAbilities';

// Character classes supported by the progression system
export type CharacterClass = 'Mage' | 'Fighter' | 'Ranger';

// Base interface for character progression
export interface ICharacter {
  // Core properties
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  freePoints: number;
  baseHP: number; // Base health points
  maxHP: number; // Current maximum health points
  abilities: SpecialAbility[]; // Character abilities
  
  // Core stats - focusing on the three main attributes mentioned in requirements
  stats: Pick<Stats, 'strength' | 'agility' | 'intelligence'>;
  
  // Methods required by the specification
  gainXp(amount: number): boolean; // Returns true if leveled up
  levelUp(): void;
  allocateStat(stat: 'strength' | 'agility' | 'intelligence', points: number): boolean;
  getSpriteUrl(): string;
  
  // Helper methods
  calculateExperienceForNextLevel(): number;
  getAvailablePoints(): number;
  calculateMaxHP(): number; // Calculate max HP based on level and stats
  
  // Ability methods
  getAbilities(): SpecialAbility[];
  useAbility(abilityId: string): boolean; // Use an ability, return success
}

// Abstract base class implementing common functionality
abstract class BaseCharacter implements ICharacter {
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  freePoints: number;
  baseHP: number;
  maxHP: number;
  stats: Pick<Stats, 'strength' | 'agility' | 'intelligence'>;
  abilities: SpecialAbility[];
  
  constructor(name: string, characterClass: CharacterClass, baseHP: number) {
    this.name = name;
    this.class = characterClass;
    this.level = 1;
    this.experience = 0;
    this.freePoints = 0;
    this.baseHP = baseHP;
    this.abilities = [];
    
    // Initialize with base stats based on class type
    this.stats = {
      strength: 5,
      agility: 5,
      intelligence: 5
    };
    
    // Set initial XP threshold
    this.experienceToNextLevel = this.calculateExperienceForNextLevel();
    
    // Calculate initial max HP
    this.maxHP = this.calculateMaxHP();
  }
  
  /**
   * Add experience points and check for level up
   * @param amount - Amount of XP to add
   * @returns true if leveled up, false otherwise
   */
  gainXp(amount: number): boolean {
    this.experience += amount;
    let leveledUp = false;
    
    // Handle multiple level ups in a single XP gain
    while (this.experience >= this.experienceToNextLevel) {
      const excessXp = this.experience - this.experienceToNextLevel;
      this.experience = 0; // Reset XP for the new level
      this.levelUp();
      this.experience = excessXp; // Apply excess XP to the new level
      leveledUp = true;
    }
    
    return leveledUp;
  }
  
  /**
   * Level up the character - implement in subclasses to handle 
   * primary attribute increases
   */
  abstract levelUp(): void;
  
  /**
   * Allocate free stat points to a specific attribute
   * @param stat - The stat to increase
   * @param points - Number of points to allocate
   * @returns true if allocation was successful
   */
  allocateStat(stat: 'strength' | 'agility' | 'intelligence', points: number): boolean {
    if (points <= 0) {
      return false;
    }
    
    if (this.freePoints < points) {
      return false;
    }
    
    this.stats[stat] += points;
    this.freePoints -= points;
    
    // Recalculate max HP as stats have changed
    this.maxHP = this.calculateMaxHP();
    return true;
  }
  
  /**
   * Get the URL for the character sprite based on level
   */
  getSpriteUrl(): string {
    // Import helper functions to ensure consistency across the system
    const { getLevelTier, getSpriteClass } = require('../utils/fighterSpriteHelper');
    
    // Map character class to fighter class (lowercase)
    const fighterClass = this.class.toLowerCase() as 'fighter' | 'ranged' | 'mage';
    
    // Get the sprite class name (converts 'ranged' to 'archer')
    const spriteClass = getSpriteClass(fighterClass);
    
    // Get the level tier based on our standardized thresholds
    const levelTier = getLevelTier(this.level);
    
    // Return the filename in the format "spriteClass + levelTier + .png"
    return `${spriteClass}${levelTier}.png`;
  }
  
  /**
   * Calculate XP needed for next level
   * Using the formula: currentLevel × 100
   */
  calculateExperienceForNextLevel(): number {
    return this.level * 100;
  }
  
  /**
   * Get current number of available stat points
   */
  getAvailablePoints(): number {
    return this.freePoints;
  }
  
  /**
   * Calculate the maximum HP based on level, base HP and stats
   * Each class will have different scaling factors
   */
  abstract calculateMaxHP(): number;
  
  /**
   * Get the list of abilities
   */
  getAbilities(): SpecialAbility[] {
    return this.abilities;
  }
  
  /**
   * Use an ability by ID
   * @param abilityId - ID of the ability to use
   * @returns true if the ability was successfully used
   */
  useAbility(abilityId: string): boolean {
    const ability = this.abilities.find(a => a.id === abilityId && a.isUnlocked);
    if (!ability) {
      return false;
    }
    
    // Implement ability usage logic here
    // For example, check cooldown, costs, etc.
    return true;
  }
  
  /**
   * Protected method to handle the common level up logic
   */
  protected handleLevelUp(): void {
    // Update level
    this.level++;
    
    // Add free stat points (3 per level as required)
    this.freePoints += 3;
    
    // Calculate XP needed for next level
    this.experienceToNextLevel = this.calculateExperienceForNextLevel();
    
    // Update maxHP on level up
    this.maxHP = this.calculateMaxHP();
    
    // Unlock abilities based on level
    this.abilities.forEach(ability => {
      if (this.level >= ability.unlockLevel) {
        ability.isUnlocked = true;
      }
    });
  }
}

/**
 * Mage class implementation
 * Primary attribute: Intelligence
 * Low HP scaling, high intelligence
 */
export class Mage extends BaseCharacter {
  constructor(name: string) {
    super(name, 'Mage', 80); // Mages start with lower base HP
    
    // Mages start with higher intelligence
    this.stats.intelligence = 8;
    this.stats.strength = 3;
    this.stats.agility = 4;

    // Initialize abilities
    this.abilities = mageAbilities.map(ability => ({
      ...ability,
      isUnlocked: this.level >= ability.unlockLevel
    }));
  }
  
  /**
   * Level up the Mage
   * Increases intelligence by 1 automatically
   */
  levelUp(): void {
    // Common level up logic
    this.handleLevelUp();
    
    // Increase primary stat (intelligence) by 1
    this.stats.intelligence += 1;
  }
  
  /**
   * Calculate max HP for Mage
   * Mages have lower HP scaling
   */
  calculateMaxHP(): number {
    // Base + (level * 8) + (strength * 2)
    return this.baseHP + (this.level * 8) + (this.stats.strength * 2);
  }
}

/**
 * Fighter class implementation
 * Primary attribute: Strength
 * High HP scaling, high strength
 */
export class Fighter extends BaseCharacter {
  constructor(name: string) {
    super(name, 'Fighter', 120); // Fighters start with higher base HP
    
    // Fighters start with higher strength
    this.stats.strength = 8;
    this.stats.agility = 5;
    this.stats.intelligence = 2;

    // Initialize abilities
    this.abilities = fighterAbilities.map(ability => ({
      ...ability,
      isUnlocked: this.level >= ability.unlockLevel
    }));
  }
  
  /**
   * Level up the Fighter
   * Increases strength by 1 automatically
   */
  levelUp(): void {
    // Common level up logic
    this.handleLevelUp();
    
    // Increase primary stat (strength) by 1
    this.stats.strength += 1;
  }
  
  /**
   * Calculate max HP for Fighter
   * Fighters have highest HP scaling
   */
  calculateMaxHP(): number {
    // Base + (level * 15) + (strength * 5)
    return this.baseHP + (this.level * 15) + (this.stats.strength * 5);
  }
}

/**
 * Ranger class implementation
 * Primary attribute: Agility
 * Medium HP scaling, high agility
 */
export class Ranger extends BaseCharacter {
  constructor(name: string) {
    super(name, 'Ranger', 100); // Rangers have medium base HP
    
    // Rangers start with higher agility
    this.stats.agility = 8;
    this.stats.strength = 4;
    this.stats.intelligence = 3;

    // Initialize abilities
    this.abilities = rangerAbilities.map(ability => ({
      ...ability,
      isUnlocked: this.level >= ability.unlockLevel
    }));
  }
  
  /**
   * Level up the Ranger
   * Increases agility by 1 automatically
   */
  levelUp(): void {
    // Common level up logic
    this.handleLevelUp();
    
    // Increase primary stat (agility) by 1
    this.stats.agility += 1;
  }
  
  /**
   * Calculate max HP for Ranger
   * Rangers have medium HP scaling
   */
  calculateMaxHP(): number {
    // Base + (level * 10) + (strength * 3)
    return this.baseHP + (this.level * 10) + (this.stats.strength * 3);
  }
}

/**
 * Factory function to create a character of the specified class
 */
export function createCharacter(name: string, characterClass: CharacterClass): ICharacter {
  switch (characterClass) {
    case 'Mage':
      return new Mage(name);
    case 'Fighter':
      return new Fighter(name);
    case 'Ranger':
      return new Ranger(name);
    default:
      throw new Error(`Unsupported character class: ${characterClass}`);
  }
}

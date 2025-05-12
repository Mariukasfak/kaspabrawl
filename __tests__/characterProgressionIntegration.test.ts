/**
 * Test suite for character progression integration with fighter system
 */
import { Fighter, FighterClass } from '../types/fighter';
import { v4 as uuidv4 } from 'uuid';
import { 
  createCharacterFromFighter,
  applyCharacterStatsToFighter,
  getFighterSpecialAbilities,
  getFighterSpritePath,
  mapFighterClassToCharacterClass
} from '../utils/characterProgressionIntegration';

// Helper to create mock fighters
function createMockFighter(fighterClass: FighterClass, level: number = 1): Fighter {
  return {
    id: uuidv4(),
    address: `0x${Math.random().toString(16).slice(2, 10)}`,
    name: `Test ${fighterClass}`,
    level,
    experience: level * 50,
    class: fighterClass,
    baseStats: {
      strength: 5 + level,
      agility: 5 + level,
      intelligence: 5 + level,
      vitality: 10 + level,
      critChance: 5,
      defense: 5
    },
    currentHp: 100 + level * 10,
    maxHp: 100 + level * 10,
    energy: 100,
    maxEnergy: 100,
    equipment: {
      head: null,
      chest: null,
      legs: null,
      weapon: null
    },
    skills: [],
    statusEffects: [],
    wins: 0,
    losses: 0,
    draws: 0
  };
}

describe('Character Progression Integration', () => {
  
  describe('Fighter-Character Class Mapping', () => {
    it('should correctly map fighter classes to character classes', () => {
      expect(mapFighterClassToCharacterClass('Warrior')).toBe('Fighter');
      expect(mapFighterClassToCharacterClass('Mage')).toBe('Mage');
      expect(mapFighterClassToCharacterClass('Ranger')).toBe('Ranger');
      
      // These are mapped to approximations
      expect(mapFighterClassToCharacterClass('Rogue')).toBe('Ranger');
      expect(mapFighterClassToCharacterClass('Cleric')).toBe('Mage');
    });
  });
  
  describe('Creating Characters from Fighters', () => {
    it('should create a character from a fighter', () => {
      const fighter = createMockFighter('Warrior', 5);
      const character = createCharacterFromFighter(fighter);
      
      expect(character).not.toBeNull();
      if (character) {
        expect(character.name).toBe(fighter.name);
        expect(character.class).toBe('Fighter');
        expect(character.level).toBe(fighter.level);
      }
    });
    
    it('should correctly transfer stats from fighter to character', () => {
      const fighter = createMockFighter('Warrior', 10);
      fighter.baseStats.strength = 20;
      fighter.baseStats.agility = 15;
      fighter.baseStats.intelligence = 10;
      
      const character = createCharacterFromFighter(fighter);
      
      expect(character).not.toBeNull();
      if (character) {
        // Strength should be at least what was in the fighter
        expect(character.stats.strength).toBeGreaterThanOrEqual(fighter.baseStats.strength);
        expect(character.stats.agility).toBeGreaterThanOrEqual(fighter.baseStats.agility);
        expect(character.stats.intelligence).toBeGreaterThanOrEqual(fighter.baseStats.intelligence);
      }
    });
  });
  
  describe('Applying Character Stats to Fighter', () => {
    it('should update fighter stats from character', () => {
      const fighter = createMockFighter('Mage', 5);
      const character = createCharacterFromFighter(fighter);
      
      if (!character) {
        fail('Character should not be null');
        return;
      }
      
      // Modify character stats
      character.allocateStat('intelligence', 5);
      const updatedFighter = applyCharacterStatsToFighter(fighter, character);
      
      expect(updatedFighter.baseStats.intelligence).toBeGreaterThan(fighter.baseStats.intelligence);
      expect(updatedFighter.level).toBe(character.level);
      expect(updatedFighter.experience).toBe(character.experience);
      expect(updatedFighter.maxHp).toBe(character.maxHP);
    });
  });
  
  describe('Fighter Abilities from Character Progression', () => {
    it('should return abilities for a fighter based on level', () => {
      // Create a high level fighter to have unlocked abilities
      const fighter = createMockFighter('Warrior', 15);
      const abilities = getFighterSpecialAbilities(fighter);
      
      expect(abilities.length).toBeGreaterThan(0);
      expect(abilities[0].isUnlocked).toBe(true);
    });
    
    it('should return different abilities for different fighter classes', () => {
      const warrior = createMockFighter('Warrior', 10);
      const mage = createMockFighter('Mage', 10);
      
      const warriorAbilities = getFighterSpecialAbilities(warrior);
      const mageAbilities = getFighterSpecialAbilities(mage);
      
      expect(warriorAbilities.length).toBeGreaterThan(0);
      expect(mageAbilities.length).toBeGreaterThan(0);
      
      // Abilities should be different between classes
      const warriorNames = warriorAbilities.map(a => a.name);
      const mageNames = mageAbilities.map(a => a.name);
      
      expect(warriorNames.some(name => !mageNames.includes(name))).toBe(true);
    });
  });
  
  describe('Fighter Sprite Paths', () => {
    it('should generate sprite paths based on fighter level', () => {
      const fighter1 = createMockFighter('Warrior', 1);
      const fighter5 = createMockFighter('Warrior', 5);
      const fighter10 = createMockFighter('Warrior', 10);
      
      const path1 = getFighterSpritePath(fighter1);
      const path5 = getFighterSpritePath(fighter5);
      const path10 = getFighterSpritePath(fighter10);
      
      expect(path1).toContain('fighter1.png');
      expect(path5).toContain('fighter5.png');
      expect(path10).toContain('fighter10.png');
    });
    
    it('should generate different sprite paths for different classes', () => {
      const warrior = createMockFighter('Warrior', 5);
      const mage = createMockFighter('Mage', 5);
      const ranger = createMockFighter('Ranger', 5);
      
      const warriorPath = getFighterSpritePath(warrior);
      const magePath = getFighterSpritePath(mage);
      const rangerPath = getFighterSpritePath(ranger);
      
      expect(warriorPath).toContain('fighter5.png');
      expect(magePath).toContain('mage5.png');
      expect(rangerPath).toContain('ranger5.png');
      
      expect(warriorPath).not.toBe(magePath);
      expect(warriorPath).not.toBe(rangerPath);
      expect(magePath).not.toBe(rangerPath);
    });
  });
});

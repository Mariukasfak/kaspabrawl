/**
 * Test suite for the character progression system
 */
import { 
  createCharacter, 
  CharacterClass,
  ICharacter
} from '../types/characterProgression';

describe('Character Progression System', () => {
  
  // Test character creation
  describe('Character Creation', () => {
    it('should create a Mage character with correct initial values', () => {
      const mage = createCharacter('TestMage', 'Mage');
      
      expect(mage.name).toBe('TestMage');
      expect(mage.class).toBe('Mage');
      expect(mage.level).toBe(1);
      expect(mage.experience).toBe(0);
      expect(mage.freePoints).toBe(0);
      expect(mage.stats.intelligence).toBe(5);
      expect(mage.stats.strength).toBe(5);
      expect(mage.stats.agility).toBe(5);
      expect(mage.abilities.length).toBeGreaterThan(0);
    });
    
    it('should create a Fighter character with correct initial values', () => {
      const fighter = createCharacter('TestFighter', 'Fighter');
      
      expect(fighter.name).toBe('TestFighter');
      expect(fighter.class).toBe('Fighter');
      expect(fighter.level).toBe(1);
      expect(fighter.experience).toBe(0);
      expect(fighter.freePoints).toBe(0);
      expect(fighter.stats.strength).toBe(5);
      expect(fighter.stats.intelligence).toBe(5);
      expect(fighter.stats.agility).toBe(5);
      expect(fighter.abilities.length).toBeGreaterThan(0);
    });
    
    it('should create a Ranger character with correct initial values', () => {
      const ranger = createCharacter('TestRanger', 'Ranger');
      
      expect(ranger.name).toBe('TestRanger');
      expect(ranger.class).toBe('Ranger');
      expect(ranger.level).toBe(1);
      expect(ranger.experience).toBe(0);
      expect(ranger.freePoints).toBe(0);
      expect(ranger.stats.agility).toBe(5);
      expect(ranger.stats.intelligence).toBe(5);
      expect(ranger.stats.strength).toBe(5);
      expect(ranger.abilities.length).toBeGreaterThan(0);
    });
  });
  
  // Test XP and leveling system
  describe('Experience and Leveling', () => {
    let character: ICharacter;
    
    beforeEach(() => {
      character = createCharacter('TestChar', 'Fighter');
    });
    
    it('should gain XP correctly', () => {
      character.gainXp(50);
      expect(character.experience).toBe(50);
      
      character.gainXp(30);
      expect(character.experience).toBe(80);
    });
    
    it('should level up when reaching XP threshold', () => {
      // Level 1 needs 100 XP to level up
      const leveledUp = character.gainXp(100);
      
      expect(leveledUp).toBe(true);
      expect(character.level).toBe(2);
      expect(character.experience).toBe(0);
      expect(character.freePoints).toBe(3); // 3 free points per level
    });
    
    it('should handle multiple level ups from large XP gains', () => {
      // Give enough XP for 3 level ups (100 + 200 + 300 = 600)
      character.gainXp(600);
      
      expect(character.level).toBe(4);
      expect(character.freePoints).toBe(9); // 3 free points × 3 levels
    });
    
    it('should have increasing XP requirements per level', () => {
      const level1XP = character.experienceToNextLevel;
      
      character.gainXp(level1XP);
      const level2XP = character.experienceToNextLevel;
      
      expect(level2XP).toBeGreaterThan(level1XP);
    });
  });
  
  // Test stat allocation
  describe('Stat Allocation', () => {
    let character: ICharacter;
    
    beforeEach(() => {
      character = createCharacter('TestChar', 'Fighter');
      character.gainXp(100); // Level up to get some free points
    });
    
    it('should allocate stats correctly', () => {
      const initialStrength = character.stats.strength;
      const allocated = character.allocateStat('strength', 2);
      
      expect(allocated).toBe(true);
      expect(character.stats.strength).toBe(initialStrength + 2);
      expect(character.freePoints).toBe(1); // Started with 3, used 2
    });
    
    it('should not allocate more points than available', () => {
      const initialAgility = character.stats.agility;
      const allocated = character.allocateStat('agility', 5); // Only have 3 points
      
      expect(allocated).toBe(false);
      expect(character.stats.agility).toBe(initialAgility); // No change
      expect(character.freePoints).toBe(3); // No points used
    });
    
    it('should not allocate negative or zero points', () => {
      const initialIntel = character.stats.intelligence;
      
      const allocatedZero = character.allocateStat('intelligence', 0);
      expect(allocatedZero).toBe(false);
      expect(character.stats.intelligence).toBe(initialIntel);
      
      const allocatedNegative = character.allocateStat('intelligence', -2);
      expect(allocatedNegative).toBe(false);
      expect(character.stats.intelligence).toBe(initialIntel);
    });
  });
  
  // Test class-specific stat increases and HP scaling
  describe('Class-Specific Features', () => {
    it('should increase primary stat for Fighter (strength) on level up', () => {
      const fighter = createCharacter('TestFighter', 'Fighter');
      const initialStrength = fighter.stats.strength;
      
      fighter.gainXp(100); // Level up
      
      expect(fighter.stats.strength).toBe(initialStrength + 1);
    });
    
    it('should increase primary stat for Mage (intelligence) on level up', () => {
      const mage = createCharacter('TestMage', 'Mage');
      const initialIntel = mage.stats.intelligence;
      
      mage.gainXp(100); // Level up
      
      expect(mage.stats.intelligence).toBe(initialIntel + 1);
    });
    
    it('should increase primary stat for Ranger (agility) on level up', () => {
      const ranger = createCharacter('TestRanger', 'Ranger');
      const initialAgility = ranger.stats.agility;
      
      ranger.gainXp(100); // Level up
      
      expect(ranger.stats.agility).toBe(initialAgility + 1);
    });
    
    it('should scale HP differently for each class', () => {
      const fighter = createCharacter('TestFighter', 'Fighter');
      const mage = createCharacter('TestMage', 'Mage');
      const ranger = createCharacter('TestRanger', 'Ranger');
      
      // Level up all characters to level 10
      for (let i = 0; i < 9; i++) {
        fighter.gainXp(fighter.experienceToNextLevel);
        mage.gainXp(mage.experienceToNextLevel);
        ranger.gainXp(ranger.experienceToNextLevel);
      }
      
      // Fighter should have the highest HP
      expect(fighter.maxHP).toBeGreaterThan(ranger.maxHP);
      
      // Ranger should have medium HP
      expect(ranger.maxHP).toBeGreaterThan(mage.maxHP);
      
      // Mage should have the lowest HP
      expect(mage.maxHP).toBeLessThan(fighter.maxHP);
    });
  });
  
  // Test sprite URL generation
  describe('Character Sprites', () => {
    it('should generate correct sprite URLs based on level', () => {
      const character = createCharacter('TestChar', 'Fighter');
      
      // Level 1-4 should use sprite 1
      expect(character.getSpriteUrl()).toBe('fighter1.png');
      
      // Level 5-9 should use sprite 5
      character.gainXp(500); // Level up to level 6
      expect(character.getSpriteUrl()).toBe('fighter5.png');
      
      // Level 10-14 should use sprite 10
      character.gainXp(500); // Level up to level 11
      expect(character.getSpriteUrl()).toBe('fighter10.png');
    });
    
    it('should handle max level sprites', () => {
      const character = createCharacter('MaxLevelChar', 'Mage');
      
      // Set to level 99
      while (character.level < 99) {
        character.gainXp(character.experienceToNextLevel);
      }
      expect(character.getSpriteUrl()).toBe('mage95.png');
      
      // Level 100+ should use sprite 100
      character.gainXp(character.experienceToNextLevel);
      expect(character.level).toBe(100);
      expect(character.getSpriteUrl()).toBe('mage100.png');
    });
  });
  
  // Test ability unlocking
  describe('Character Abilities', () => {
    it('should unlock abilities at appropriate levels', () => {
      const mage = createCharacter('TestMage', 'Mage');
      
      // Find an ability that unlocks at level 5
      const level5Ability = mage.abilities.find(a => a.unlockLevel === 5);
      expect(level5Ability).toBeDefined();
      expect(level5Ability?.isUnlocked).toBe(false);
      
      // Level up to level 5
      while (mage.level < 5) {
        mage.gainXp(mage.experienceToNextLevel);
      }
      
      // Now the ability should be unlocked
      expect(level5Ability?.isUnlocked).toBe(true);
    });
    
    it('should provide each class with unique abilities', () => {
      const fighter = createCharacter('TestFighter', 'Fighter');
      const mage = createCharacter('TestMage', 'Mage');
      const ranger = createCharacter('TestRanger', 'Ranger');
      
      // Level all to 10 to unlock more abilities
      while (fighter.level < 10) {
        fighter.gainXp(fighter.experienceToNextLevel);
        mage.gainXp(mage.experienceToNextLevel);
        ranger.gainXp(ranger.experienceToNextLevel);
      }
      
      const fighterAbilities = fighter.abilities.filter(a => a.isUnlocked);
      const mageAbilities = mage.abilities.filter(a => a.isUnlocked);
      const rangerAbilities = ranger.abilities.filter(a => a.isUnlocked);
      
      // Each class should have different abilities
      const fighterNames = fighterAbilities.map(a => a.name);
      const mageNames = mageAbilities.map(a => a.name);
      const rangerNames = rangerAbilities.map(a => a.name);
      
      // No overlap in ability names between classes
      for (const name of fighterNames) {
        expect(mageNames).not.toContain(name);
        expect(rangerNames).not.toContain(name);
      }
      
      for (const name of mageNames) {
        expect(fighterNames).not.toContain(name);
        expect(rangerNames).not.toContain(name);
      }
    });
  });
});

/**
 * Character progression tests
 * 
 * This file demonstrates the usage of the character progression system
 */

import { 
  ICharacter, 
  CharacterClass, 
  Mage, 
  Fighter as FighterCharacter, 
  Ranger 
} from '../types/characterProgression';

// Create one character of each class
const mage = new Mage('Merlin');
const fighter = new FighterCharacter('Conan');
const ranger = new Ranger('Legolas');

console.log('--- Initial character stats ---');
console.log(`Mage: Level ${mage.level}, XP ${mage.experience}/${mage.experienceToNextLevel}`);
console.log(`Stats: STR ${mage.stats.strength}, AGI ${mage.stats.agility}, INT ${mage.stats.intelligence}`);
console.log(`Sprite: ${mage.getSpriteUrl()}`);

console.log(`\nFighter: Level ${fighter.level}, XP ${fighter.experience}/${fighter.experienceToNextLevel}`);
console.log(`Stats: STR ${fighter.stats.strength}, AGI ${fighter.stats.agility}, INT ${fighter.stats.intelligence}`);
console.log(`Sprite: ${fighter.getSpriteUrl()}`);

console.log(`\nRanger: Level ${ranger.level}, XP ${ranger.experience}/${ranger.experienceToNextLevel}`);
console.log(`Stats: STR ${ranger.stats.strength}, AGI ${ranger.stats.agility}, INT ${ranger.stats.intelligence}`);
console.log(`Sprite: ${ranger.getSpriteUrl()}`);

// Gain XP and level up characters
console.log('\n\n--- Gaining XP ---');

// Level up Mage to level 6
console.log('\nMage gains 500 XP');
let didLevelUp = false;
for (let i = 0; i < 5; i++) {
  const leveledUp = mage.gainXp(100);
  if (leveledUp && !didLevelUp) {
    didLevelUp = true;
  }
}
console.log(`Mage leveled up: ${didLevelUp}`);
console.log(`Mage: Level ${mage.level}, XP ${mage.experience}/${mage.experienceToNextLevel}`);
console.log(`Stats: STR ${mage.stats.strength}, AGI ${mage.stats.agility}, INT ${mage.stats.intelligence}`);
console.log(`Free points: ${mage.freePoints}`);
console.log(`Sprite: ${mage.getSpriteUrl()}`);

// Allocate some stat points
console.log('\n--- Allocating Stats ---');
mage.allocateStat('intelligence', 10);
console.log(`Allocated 10 points to intelligence. New stats: STR ${mage.stats.strength}, AGI ${mage.stats.agility}, INT ${mage.stats.intelligence}`);
console.log(`Free points remaining: ${mage.freePoints}`);

// Level up Fighter to level 10
console.log('\nFighter gains 1000 XP');
for (let i = 0; i < 9; i++) {
  fighter.gainXp(100);
}
console.log(`Fighter: Level ${fighter.level}, XP ${fighter.experience}/${fighter.experienceToNextLevel}`);
console.log(`Stats: STR ${fighter.stats.strength}, AGI ${fighter.stats.agility}, INT ${fighter.stats.intelligence}`);
console.log(`Free points: ${fighter.freePoints}`);
console.log(`Sprite: ${fighter.getSpriteUrl()}`);

// Level up Ranger to level 15
console.log('\nRanger gains 1500 XP');
for (let i = 0; i < 14; i++) {
  ranger.gainXp(100);
}
console.log(`Ranger: Level ${ranger.level}, XP ${ranger.experience}/${ranger.experienceToNextLevel}`);
console.log(`Stats: STR ${ranger.stats.strength}, AGI ${ranger.stats.agility}, INT ${ranger.stats.intelligence}`);
console.log(`Free points: ${ranger.freePoints}`);
console.log(`Sprite: ${ranger.getSpriteUrl()}`);

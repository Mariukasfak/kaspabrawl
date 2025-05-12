/**
 * Example usage of the character progression system and sprite management
 */
import { createCharacter, CharacterClass } from '../types/characterProgression';
import { getCharacterSpritePath } from '../utils/characterSprites';

/**
 * Display character information
 */
function displayCharacterInfo(character: any) {
  console.log(`${character.name} (${character.class}) - Level ${character.level}`);
  console.log(`  HP: ${character.maxHP}`);
  console.log(`  Strength: ${character.stats.strength}`);
  console.log(`  Agility: ${character.stats.agility}`);
  console.log(`  Intelligence: ${character.stats.intelligence}`);
  console.log(`  Available Points: ${character.freePoints}`);
  console.log(`  Sprite: ${character.getSpriteUrl()}`);
  
  // Display abilities
  console.log(`  Abilities:`);
  const unlockedAbilities = character.getAbilities().filter((ability: any) => ability.isUnlocked);
  if (unlockedAbilities.length === 0) {
    console.log("    No abilities unlocked yet");
  } else {
    unlockedAbilities.forEach((ability: any) => {
      console.log(`    - ${ability.name} (${ability.type}): ${ability.description}`);
    });
  }
  console.log('');
}

// Create characters
const mage = createCharacter('Archmage Zul', 'Mage');
const fighter = createCharacter('Warrior Rex', 'Fighter');
const ranger = createCharacter('Scout Elira', 'Ranger');

// Display initial stats
console.log('---- Initial Character Stats ----');
displayCharacterInfo(mage);
displayCharacterInfo(fighter);
displayCharacterInfo(ranger);

// Level up characters to see progression
console.log('\n---- After 5 Level Ups ----');
for (let i = 0; i < 5; i++) {
  mage.gainXp(mage.experienceToNextLevel);
  fighter.gainXp(fighter.experienceToNextLevel);
  ranger.gainXp(ranger.experienceToNextLevel);
}

// Allocate some stat points
mage.allocateStat('intelligence', 10);
fighter.allocateStat('strength', 10);
ranger.allocateStat('agility', 10);

displayCharacterInfo(mage);
displayCharacterInfo(fighter);
displayCharacterInfo(ranger);

// Level characters to see ability unlocking
console.log('\n---- Level 10 for Passive Abilities ----');
while (mage.level < 10) {
  mage.gainXp(mage.experienceToNextLevel);
  fighter.gainXp(fighter.experienceToNextLevel);
  ranger.gainXp(ranger.experienceToNextLevel);
}

displayCharacterInfo(mage);
displayCharacterInfo(fighter);
displayCharacterInfo(ranger);

// List all sprite levels available
console.log('\n---- Sprite Progression Timeline ----');
const classToDemo: CharacterClass = 'Fighter';
for (let level of [1, 5, 10, 15, 20, 25, 50, 75, 100]) {
  const spritePath = getCharacterSpritePath(classToDemo.toLowerCase() as any, level);
  console.log(`Level ${level}: ${spritePath}`);
}

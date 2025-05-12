// Example usage of the character progression system
import { createCharacter } from '../types/characterProgression';

// Create characters of each class
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

// Level characters to 10 to see sprite change
console.log('\n---- Level 10 Sprite Changes ----');
while (mage.level < 10) {
  mage.gainXp(mage.experienceToNextLevel);
  fighter.gainXp(fighter.experienceToNextLevel);
  ranger.gainXp(ranger.experienceToNextLevel);
}

console.log(`Mage sprite: ${mage.getSpriteUrl()}`);
console.log(`Fighter sprite: ${fighter.getSpriteUrl()}`);
console.log(`Ranger sprite: ${ranger.getSpriteUrl()}`);

// Helper function to display character info
function displayCharacterInfo(character: any) {
  console.log(`${character.name} (${character.class}) - Level ${character.level}`);
  console.log(`  HP: ${character.maxHP}`);
  console.log(`  Strength: ${character.stats.strength}`);
  console.log(`  Agility: ${character.stats.agility}`);
  console.log(`  Intelligence: ${character.stats.intelligence}`);
  console.log(`  Available Points: ${character.freePoints}`);
  console.log(`  Sprite: ${character.getSpriteUrl()}`);
}

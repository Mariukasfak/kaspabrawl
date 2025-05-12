# Character Progression System

This module provides a flexible XP and leveling system for character classes in KaspaBrawl.

## Features

- Support for Mage, Fighter, and Ranger character classes
- Levels from 1 to 100
- Automatic primary attribute increases on level up
- Customizable stat allocation with free points
- Visual progression with sprite changes every 5 levels
- Integration with the existing Fighter system

## Usage

### Creating a Character

```typescript
import { Mage, Fighter, Ranger } from '../types/characterProgression';

// Create a new Mage character
const myMage = new Mage('Gandalf');

// Create a new Fighter character
const myFighter = new Fighter('Aragorn');

// Create a new Ranger character
const myRanger = new Ranger('Legolas');
```

### Gaining XP and Leveling Up

```typescript
// Add 100 XP to the character
const didLevelUp = myMage.gainXp(100);

if (didLevelUp) {
  console.log(`${myMage.name} leveled up to level ${myMage.level}!`);
  console.log(`Main stat increased: INT ${myMage.stats.intelligence}`);
  console.log(`Free points available: ${myMage.freePoints}`);
}
```

### Allocating Stat Points

```typescript
// Allocate 3 points to intelligence
const success = myMage.allocateStat('intelligence', 3);

if (success) {
  console.log(`Intelligence increased to ${myMage.stats.intelligence}`);
  console.log(`Remaining points: ${myMage.freePoints}`);
} else {
  console.log('Not enough free points available');
}
```

### Getting Character Sprite

```typescript
// Get the current sprite URL
const spriteUrl = myMage.getSpriteUrl();
console.log(`Current sprite: ${spriteUrl}`);

// Example output: "mage5.png" (for levels 5-9)
```

## Integration with Existing Fighter System

Use the utilities in `utils/characterProgressionIntegration.ts` to integrate with the existing Fighter system:

```typescript
import { Fighter } from '../types/fighter';
import { createCharacterFromFighter, applyCharacterStatsToFighter } from '../utils/characterProgressionIntegration';

// Create a character progression object from an existing fighter
const characterProgression = createCharacterFromFighter(existingFighter);

if (characterProgression) {
  // Level up the character
  characterProgression.gainXp(100);
  
  // Apply the updated stats back to the fighter
  const updatedFighter = applyCharacterStatsToFighter(existingFighter, characterProgression);
}
```

## Sprite Naming Convention

Sprite filenames follow this convention:
- `className1.png` (used for levels 1-4)
- `className5.png` (used for levels 5-9)
- `className10.png` (used for levels 10-14)
- And so on, up to `className100.png`

Where `className` is the lowercase version of the character class (`mage`, `fighter`, or `ranger`).

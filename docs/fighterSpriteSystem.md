# Fighter Sprite System

## Overview

The fighter sprite system in Kaspa Brawl has been updated to use level-based sprites for each fighter class. This document explains how the sprite system works and how sprites are loaded into the game.

## Fighter Classes

The game has been simplified to use three distinct fighter classes:
- `fighter` - Melee combat specialist with high strength and defense
- `ranged` - Ranged combat specialist with high agility (uses archer sprites)
- `mage` - Magic user specialist with high intelligence

## Level-based Sprite Thresholds

Each fighter displays a different sprite based on their level:
- **Level 1-4**: Base sprite (e.g., fighter1.png)
- **Level 5-9**: Second tier sprite (e.g., fighter5.png)
- **Level 10-14**: Third tier sprite (e.g., fighter10.png)
- **Level 15-94**: Fourth tier sprite (e.g., fighter15.png)
- **Level 95-99**: Fifth tier sprite (e.g., fighter95.png)
- **Level 100+**: Max level sprite (e.g., fighter100.png)

## Sprite Directory Structure

Sprites are stored in the following directory structure:
```
/public/assets/fighters/
  ├── fighter/
  │   ├── fighter1.png
  │   ├── fighter5.png
  │   ├── fighter10.png
  │   ├── fighter15.png
  │   ├── fighter95.png
  │   └── fighter100.png
  ├── ranged/
  │   ├── archer1.png   <- Note: ranged class uses archer sprites
  │   ├── archer5.png
  │   ├── archer10.png
  │   ├── archer15.png
  │   ├── archer95.png
  │   └── archer100.png
  └── mage/
      ├── mage1.png
      ├── mage5.png
      ├── mage10.png
      ├── mage15.png
      ├── mage95.png
      └── mage100.png
```

## Creating Sprite Files

### Image Requirements
- **Format**: PNG with transparency
- **Recommended Size**: 128x128 pixels minimum (can be larger)
- **Style**: Character should be centered with transparent background
- **Detail Level**: Each tier should visually represent the character becoming more powerful

### Special Note for Ranged Class

For the `ranged` class, use archer-themed sprites but name them `archer{level}.png` rather than `ranged{level}.png`.

## Helper Functions

The system provides centralized helper functions to get sprite paths consistently across the application:

```typescript
import { getFighterSpriteKey, getFighterSpritePath, getLevelTier, getSpriteClass } from '../utils/fighterSpriteHelper';

// Get sprite key for Phaser game (returns key like 'fighter-fighter-5')
const spriteKey = getFighterSpriteKey(fighter.class, fighter.level);

// Get sprite path for UI components (returns path like '/assets/fighters/fighter/fighter5.png')
const spritePath = getFighterSpritePath(fighter.class, fighter.level);

// Get level tier based on level (1, 5, 10, 15, 95, 100)
const levelTier = getLevelTier(fighter.level);

// Get sprite class name ('archer' for ranged class, otherwise the class name)
const spriteClass = getSpriteClass(fighter.class);
```

These helper functions ensure consistency across the entire application when referencing fighter sprites.

## Setup Script

A setup script is provided to create the necessary directory structure and placeholder files:

```bash
node scripts/setupFighterSprites.js
```

This creates empty placeholder files that should be replaced with actual sprite images.

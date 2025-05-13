# Fighter Classes and Sprite System

## Classes

In Kaspa Brawl, there are three fighter classes:

1. **Fighter** - Melee combat specialist. High strength and defense.
2. **Ranged** - Specialized in distance attacks. High agility and critical chance. 
3. **Mage** - Magic user with powerful spells. High intelligence and special abilities.

## Sprite System

Fighter sprites are determined by class and level. The game uses different sprites at specific level thresholds:

- Level 1-4: Base sprite (e.g., fighter1.png)
- Level 5-9: Second tier sprite (e.g., fighter5.png)
- Level 10-14: Third tier sprite (e.g., fighter10.png)
- Level 15-94: Fourth tier sprite (e.g., fighter15.png)
- Level 95-99: Fifth tier sprite (e.g., fighter95.png)
- Level 100+: Max level sprite (e.g., fighter100.png)

### Special Case: Ranged Class

The ranged class uses archer sprites for their images, with the following naming convention:
- archer1.png (for level 1-4)
- archer5.png (for level 5-9)
- etc.

Note that while the folder structure uses the class name for organization (i.e., `/ranged/`), 
the actual filenames use "archer" for the ranged class sprites.

## File Structure

Sprite files are organized in the following directory structure:

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
  │   ├── archer1.png
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

## Usage

To get the sprite for a fighter:

```typescript
import { getFighterSpriteKey, getFighterSpritePath } from '../utils/fighterSpriteHelper';

// Get sprite key (for Phaser game)
const spriteKey = getFighterSpriteKey(fighter.class, fighter.level);

// Get full path to sprite image
const spritePath = getFighterSpritePath(fighter.class, fighter.level);
```

This will automatically handle the class and level thresholds, including the special case for ranged fighters using archer sprites.

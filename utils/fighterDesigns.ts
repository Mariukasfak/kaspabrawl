// Define fighter designs for different character types
export type FighterDesign = {
  name: string;
  description: string;
  emoji: string;
  baseStats: {
    strength: number;
    agility: number;
    vitality: number;
    defense: number;
  };
  specialMoves: Array<{
    name: string;
    description: string;
    damage: number;
    cooldown: number;
  }>;
};

export const fighterDesigns: FighterDesign[] = [
  {
    name: 'Berserker',
    description: 'A raging warrior with high strength but low defense',
    emoji: '👹',
    baseStats: {
      strength: 9,
      agility: 6,
      vitality: 7,
      defense: 4
    },
    specialMoves: [
      {
        name: 'Rage Attack',
        description: 'A powerful attack fueled by rage',
        damage: 25,
        cooldown: 3
      },
      {
        name: 'Whirlwind Strike',
        description: 'Spin attack that hits with massive force',
        damage: 20,
        cooldown: 2
      }
    ]
  },
  {
    name: 'Ninja',
    description: 'Fast and agile fighter with deadly precision',
    emoji: '🥷',
    baseStats: {
      strength: 6,
      agility: 10,
      vitality: 5,
      defense: 5
    },
    specialMoves: [
      {
        name: 'Shadow Strike',
        description: 'A quick attack from the shadows',
        damage: 15,
        cooldown: 1
      },
      {
        name: 'Poison Dart',
        description: 'Throws a poisoned dart that causes damage over time',
        damage: 10,
        cooldown: 2
      }
    ]
  },
  {
    name: 'Tank',
    description: 'Heavily armored fighter with high defense',
    emoji: '🛡️',
    baseStats: {
      strength: 7,
      agility: 3,
      vitality: 8,
      defense: 10
    },
    specialMoves: [
      {
        name: 'Shield Bash',
        description: 'Bashes opponent with shield, stunning them',
        damage: 10,
        cooldown: 2
      },
      {
        name: 'Fortify',
        description: 'Increases defense temporarily',
        damage: 0,
        cooldown: 3
      }
    ]
  },
  {
    name: 'Mage',
    description: 'Mystical fighter with powerful spells',
    emoji: '🧙',
    baseStats: {
      strength: 4,
      agility: 6,
      vitality: 6,
      defense: 5
    },
    specialMoves: [
      {
        name: 'Fireball',
        description: 'Launches a ball of fire at opponent',
        damage: 20,
        cooldown: 2
      },
      {
        name: 'Ice Shard',
        description: 'Freezes opponent temporarily',
        damage: 15,
        cooldown: 3
      }
    ]
  },
  {
    name: 'Rogue',
    description: 'Sneaky fighter with critical hit abilities',
    emoji: '🥷',
    baseStats: {
      strength: 7,
      agility: 8,
      vitality: 5,
      defense: 4
    },
    specialMoves: [
      {
        name: 'Backstab',
        description: 'Attack from behind for massive damage',
        damage: 25,
        cooldown: 3
      },
      {
        name: 'Smoke Bomb',
        description: 'Throws a smoke bomb to escape and recover',
        damage: 0,
        cooldown: 4
      }
    ]
  }
];

// Function to get a random fighter design
export const getRandomFighterDesign = (): FighterDesign => {
  const randomIndex = Math.floor(Math.random() * fighterDesigns.length);
  return fighterDesigns[randomIndex];
};

// Function to get a fighter design by wallet address (or guest ID)
export const getFighterDesignByAddress = (address: string): FighterDesign => {
  // Use the address to deterministically select a fighter design
  // This ensures the same wallet always gets the same fighter type
  const addressSum = address.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const designIndex = addressSum % fighterDesigns.length;
  return fighterDesigns[designIndex];
};

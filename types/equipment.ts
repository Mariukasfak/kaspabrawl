/**
 * Equipment and Item types for Kaspa Brawl
 */

// Base stats that can be affected by equipment
export interface Stats {
  strength: number;     // Affects damage
  agility: number;      // Affects speed and dodge chance
  vitality: number;     // Affects health points
  defense: number;      // Reduces damage taken
  critChance: number;   // Chance to land critical hits
  critDamage: number;   // Multiplier for critical hit damage
  blockRate: number;    // Chance to block attacks
  magicFind: number;    // Affects item drop quality
}

// Equipment slots available for fighters
export enum EquipmentSlot {
  WEAPON = 'weapon',
  HEAD = 'head',
  CHEST = 'chest',
  HANDS = 'hands',
  LEGS = 'legs',
  FEET = 'feet',
  RING_1 = 'ring1',
  RING_2 = 'ring2',
  AMULET = 'amulet',
  TRINKET = 'trinket',
}

// Item rarity affects stat bonuses and visual appearance
export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic',
}

// Types of weapons
export enum WeaponType {
  SWORD = 'sword',
  AXE = 'axe',
  MACE = 'mace',
  DAGGER = 'dagger',
  STAFF = 'staff',
  BOW = 'bow',
  WAND = 'wand',
}

// Types of armor
export enum ArmorType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  CLOTH = 'cloth',
}

// Special effects that equipment can provide
export interface SpecialEffect {
  name: string;
  description: string;
  triggerChance?: number;
  effectStrength?: number;
  effectType: 'passive' | 'onHit' | 'onTakeDamage' | 'onCritical' | 'onKill';
}

// Base item interface
export interface Item {
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  level: number;
  value: number;
  imageUrl?: string;
  isNFT: boolean;
  nftTokenId?: string;
}

// Equipment interface extends Item
export interface Equipment extends Item {
  slot: EquipmentSlot;
  statBonuses: Partial<Stats>;
  specialEffects?: SpecialEffect[];
  durability?: {
    current: number;
    max: number;
  };
  requiredLevel?: number;
}

// Weapon interface extends Equipment
export interface Weapon extends Equipment {
  slot: EquipmentSlot.WEAPON;
  weaponType: WeaponType;
  damage: {
    min: number;
    max: number;
  };
  attackSpeed: number; // Attacks per second
  range: number; // 1 = melee, >1 = ranged
}

// Armor interface extends Equipment
export interface Armor extends Equipment {
  slot: EquipmentSlot.HEAD | EquipmentSlot.CHEST | EquipmentSlot.HANDS | EquipmentSlot.LEGS | EquipmentSlot.FEET;
  armorType: ArmorType;
  armorValue: number;
}

// Accessory interface extends Equipment
export interface Accessory extends Equipment {
  slot: EquipmentSlot.RING_1 | EquipmentSlot.RING_2 | EquipmentSlot.AMULET | EquipmentSlot.TRINKET;
}

// Consumable items like potions, scrolls, etc.
export interface Consumable extends Item {
  effect: string;
  duration?: number; // In seconds, undefined = instant
  cooldown?: number; // In seconds
  charges?: number; // Number of uses, undefined = single use
}

// Complete fighter loadout
export interface EquipmentLoadout {
  [EquipmentSlot.WEAPON]?: Weapon;
  [EquipmentSlot.HEAD]?: Armor;
  [EquipmentSlot.CHEST]?: Armor;
  [EquipmentSlot.HANDS]?: Armor;
  [EquipmentSlot.LEGS]?: Armor;
  [EquipmentSlot.FEET]?: Armor;
  [EquipmentSlot.RING_1]?: Accessory;
  [EquipmentSlot.RING_2]?: Accessory;
  [EquipmentSlot.AMULET]?: Accessory;
  [EquipmentSlot.TRINKET]?: Accessory;
}

// Calculate total stats from base stats and equipment
export function calculateTotalStats(baseStats: Stats, loadout: EquipmentLoadout): Stats {
  // Start with base stats
  const totalStats: Stats = { ...baseStats };
  
  // Add bonuses from all equipped items
  Object.values(loadout).forEach(item => {
    if (!item) return;
    
    // Add stat bonuses
    Object.entries(item.statBonuses).forEach(([key, value]) => {
      const statKey = key as keyof Stats;
      if (typeof value === 'number') {
        totalStats[statKey] += value;
      }
    });
  });
  
  return totalStats;
}

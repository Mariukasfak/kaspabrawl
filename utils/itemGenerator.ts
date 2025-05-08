import { v4 as uuidv4 } from 'uuid';
import {
  Item,
  Equipment,
  Weapon,
  Armor,
  Accessory,
  ItemRarity,
  EquipmentSlot,
  WeaponType,
  ArmorType,
  SpecialEffect,
  Stats
} from '../types/equipment';

// Rarity weights for random generation
const RARITY_WEIGHTS = {
  [ItemRarity.COMMON]: 60,
  [ItemRarity.UNCOMMON]: 25,
  [ItemRarity.RARE]: 10,
  [ItemRarity.EPIC]: 4,
  [ItemRarity.LEGENDARY]: 1,
  [ItemRarity.MYTHIC]: 0.1,
};

// Base item value by rarity
const BASE_VALUE = {
  [ItemRarity.COMMON]: 10,
  [ItemRarity.UNCOMMON]: 30,
  [ItemRarity.RARE]: 100,
  [ItemRarity.EPIC]: 300,
  [ItemRarity.LEGENDARY]: 1000,
  [ItemRarity.MYTHIC]: 5000,
};

// Stat multipliers by rarity
const STAT_MULTIPLIERS = {
  [ItemRarity.COMMON]: 1,
  [ItemRarity.UNCOMMON]: 1.3,
  [ItemRarity.RARE]: 1.8,
  [ItemRarity.EPIC]: 2.5,
  [ItemRarity.LEGENDARY]: 3.5,
  [ItemRarity.MYTHIC]: 5,
};

// Weapon type base damage
const WEAPON_BASE_DAMAGE = {
  [WeaponType.SWORD]: { min: 8, max: 12 },
  [WeaponType.AXE]: { min: 10, max: 16 },
  [WeaponType.MACE]: { min: 9, max: 14 },
  [WeaponType.DAGGER]: { min: 5, max: 8 },
  [WeaponType.STAFF]: { min: 7, max: 11 },
  [WeaponType.BOW]: { min: 6, max: 13 },
  [WeaponType.WAND]: { min: 4, max: 10 },
};

// Weapon type attack speed
const WEAPON_ATTACK_SPEED = {
  [WeaponType.SWORD]: 1.2,
  [WeaponType.AXE]: 0.9,
  [WeaponType.MACE]: 1.0,
  [WeaponType.DAGGER]: 1.8,
  [WeaponType.STAFF]: 1.1,
  [WeaponType.BOW]: 1.3,
  [WeaponType.WAND]: 1.5,
};

// Armor type base values
const ARMOR_BASE_VALUE = {
  [ArmorType.LIGHT]: 5,
  [ArmorType.MEDIUM]: 8,
  [ArmorType.HEAVY]: 12,
  [ArmorType.CLOTH]: 3,
};

// Item name generators
const WEAPON_PREFIXES = [
  'Deadly', 'Savage', 'Brutal', 'Fierce', 'Mighty', 'Ancient', 'Cursed',
  'Blessed', 'Divine', 'Infernal', 'Glacial', 'Volcanic', 'Toxic', 'Arcane',
];

const WEAPON_NAMES = {
  [WeaponType.SWORD]: ['Blade', 'Saber', 'Longsword', 'Broadsword', 'Katana', 'Claymore'],
  [WeaponType.AXE]: ['Axe', 'Hatchet', 'Battleaxe', 'Tomahawk', 'Cleaver', 'Halberd'],
  [WeaponType.MACE]: ['Mace', 'Hammer', 'Warhammer', 'Flail', 'Maul', 'Morningstar'],
  [WeaponType.DAGGER]: ['Dagger', 'Knife', 'Shiv', 'Dirk', 'Kris', 'Stiletto'],
  [WeaponType.STAFF]: ['Staff', 'Rod', 'Quarterstaff', 'Scepter', 'Stave', 'Crook'],
  [WeaponType.BOW]: ['Bow', 'Longbow', 'Shortbow', 'Composite Bow', 'Recurve Bow', 'Crossbow'],
  [WeaponType.WAND]: ['Wand', 'Baton', 'Focus', 'Cane', 'Spellblade', 'Runewand'],
};

const ARMOR_PREFIXES = [
  'Sturdy', 'Reinforced', 'Durable', 'Protective', 'Impenetrable', 'Resilient',
  'Enchanted', 'Guardian', 'Warded', 'Resolute', 'Unyielding', 'Ethereal', 
];

const ARMOR_NAMES = {
  [EquipmentSlot.HEAD]: ['Helmet', 'Cap', 'Crown', 'Circlet', 'Hood', 'Headdress'],
  [EquipmentSlot.CHEST]: ['Chestplate', 'Armor', 'Breastplate', 'Tunic', 'Robe', 'Vest'],
  [EquipmentSlot.HANDS]: ['Gloves', 'Gauntlets', 'Handwraps', 'Bracers', 'Vambraces', 'Grips'],
  [EquipmentSlot.LEGS]: ['Greaves', 'Leggings', 'Pants', 'Legguards', 'Kilt', 'Cuisses'],
  [EquipmentSlot.FEET]: ['Boots', 'Sabatons', 'Treads', 'Sandals', 'Shoes', 'Footwraps'],
};

const ACCESSORY_PREFIXES = [
  'Gleaming', 'Radiant', 'Mystical', 'Enigmatic', 'Shimmering', 'Glowing',
  'Arcane', 'Enchanted', 'Mysterious', 'Twilight', 'Whispering', 'Empowered',
];

const ACCESSORY_NAMES = {
  [EquipmentSlot.RING_1]: ['Ring', 'Band', 'Loop', 'Signet', 'Circle', 'Seal'],
  [EquipmentSlot.RING_2]: ['Ring', 'Band', 'Loop', 'Signet', 'Circle', 'Seal'],
  [EquipmentSlot.AMULET]: ['Amulet', 'Pendant', 'Necklace', 'Talisman', 'Medallion', 'Locket'],
  [EquipmentSlot.TRINKET]: ['Trinket', 'Charm', 'Bauble', 'Token', 'Relic', 'Figurine'],
};

// Special effects that can be applied to equipment
const SPECIAL_EFFECTS: SpecialEffect[] = [
  {
    name: 'Lifesteal',
    description: 'Heals for a portion of damage dealt',
    triggerChance: 0.2,
    effectStrength: 0.1, // 10% lifesteal
    effectType: 'onHit',
  },
  {
    name: 'Fiery',
    description: 'Deals additional fire damage',
    triggerChance: 1, // Always
    effectStrength: 0.15, // 15% extra damage
    effectType: 'onHit',
  },
  {
    name: 'Vampiric',
    description: 'Has a chance to drain health from enemies',
    triggerChance: 0.1,
    effectStrength: 0.2, // 20% of damage as health
    effectType: 'onHit',
  },
  {
    name: 'Thorns',
    description: 'Returns damage to attackers',
    triggerChance: 0.5,
    effectStrength: 0.3, // 30% damage reflection
    effectType: 'onTakeDamage',
  },
  {
    name: 'Lucky',
    description: 'Increases chance of finding valuable items',
    effectType: 'passive',
  },
  {
    name: 'Berserker',
    description: 'Increases damage as health decreases',
    effectType: 'passive',
  },
  {
    name: 'Executioner',
    description: 'Deals massive damage to low health enemies',
    triggerChance: 1, // Always active on low health targets
    effectType: 'onHit',
  },
  {
    name: 'Frostbite',
    description: 'Slows enemy attacks on hit',
    triggerChance: 0.3,
    effectType: 'onHit',
  },
];

// Helper function to get random item from array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate random rarity based on weights
function generateRarity(): ItemRarity {
  const totalWeight = Object.values(RARITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    if (random < weight) {
      return rarity as ItemRarity;
    }
    random -= weight;
  }
  
  return ItemRarity.COMMON; // Fallback
}

// Generate random stats based on item level and rarity
function generateStats(level: number, rarity: ItemRarity, slot: EquipmentSlot): Partial<Stats> {
  const stats: Partial<Stats> = {};
  const multiplier = STAT_MULTIPLIERS[rarity] * (level / 10 + 0.5);
  
  // Determine which stats should be on this item type
  let possibleStats: (keyof Stats)[] = [];
  
  switch (slot) {
    case EquipmentSlot.WEAPON:
      possibleStats = ['strength', 'critChance', 'critDamage'];
      break;
    case EquipmentSlot.HEAD:
      possibleStats = ['vitality', 'defense', 'magicFind'];
      break;
    case EquipmentSlot.CHEST:
      possibleStats = ['vitality', 'defense', 'strength'];
      break;
    case EquipmentSlot.HANDS:
      possibleStats = ['strength', 'critChance', 'agility'];
      break;
    case EquipmentSlot.LEGS:
      possibleStats = ['defense', 'vitality', 'blockRate'];
      break;
    case EquipmentSlot.FEET:
      possibleStats = ['agility', 'defense', 'blockRate'];
      break;
    case EquipmentSlot.RING_1:
    case EquipmentSlot.RING_2:
      possibleStats = ['strength', 'agility', 'magicFind', 'critChance'];
      break;
    case EquipmentSlot.AMULET:
      possibleStats = ['vitality', 'magicFind', 'critDamage'];
      break;
    case EquipmentSlot.TRINKET:
      possibleStats = ['blockRate', 'critChance', 'magicFind'];
      break;
  }
  
  // Determine number of stats based on rarity
  let statCount = 1;
  if (rarity === ItemRarity.UNCOMMON) statCount = 2;
  if (rarity === ItemRarity.RARE) statCount = 3;
  if (rarity === ItemRarity.EPIC) statCount = 3;
  if (rarity === ItemRarity.LEGENDARY) statCount = 4;
  if (rarity === ItemRarity.MYTHIC) statCount = 5;
  
  // Ensure we don't try to add more stats than are available
  statCount = Math.min(statCount, possibleStats.length);
  
  // Shuffle and select stats
  const shuffled = [...possibleStats].sort(() => 0.5 - Math.random());
  const selectedStats = shuffled.slice(0, statCount);
  
  // Generate values for each stat
  selectedStats.forEach(stat => {
    switch (stat) {
      case 'strength':
      case 'agility':
      case 'vitality':
      case 'defense':
        stats[stat] = Math.round(multiplier * (level / 2 + 1));
        break;
      case 'critChance':
        stats[stat] = Math.min(50, Math.round(multiplier * 5)); // Cap at 50%
        break;
      case 'critDamage':
        stats[stat] = Math.round(multiplier * 10); // %
        break;
      case 'blockRate':
        stats[stat] = Math.min(30, Math.round(multiplier * 3)); // Cap at 30%
        break;
      case 'magicFind':
        stats[stat] = Math.round(multiplier * 7); // %
        break;
    }
  });
  
  return stats;
}

// Generate random special effects based on rarity
function generateSpecialEffects(rarity: ItemRarity): SpecialEffect[] {
  const effects: SpecialEffect[] = [];
  
  // Determine how many special effects based on rarity
  let effectCount = 0;
  if (rarity === ItemRarity.RARE) effectCount = 1;
  if (rarity === ItemRarity.EPIC) effectCount = 1;
  if (rarity === ItemRarity.LEGENDARY) effectCount = 2;
  if (rarity === ItemRarity.MYTHIC) effectCount = 3;
  
  // No effects for common/uncommon
  if (effectCount === 0) return effects;
  
  // Shuffle and select effects
  const shuffled = [...SPECIAL_EFFECTS].sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < effectCount; i++) {
    if (i < shuffled.length) {
      effects.push({...shuffled[i]}); // Clone to avoid modifying original
    }
  }
  
  return effects;
}

// Generate a random weapon
export function generateWeapon(level: number, specificType?: WeaponType): Weapon {
  const rarity = generateRarity();
  const weaponType = specificType || getRandomItem(Object.values(WeaponType));
  const baseDamage = WEAPON_BASE_DAMAGE[weaponType];
  const attackSpeed = WEAPON_ATTACK_SPEED[weaponType];
  const multiplier = STAT_MULTIPLIERS[rarity] * (level / 10 + 0.5);
  
  // Generate name
  const prefix = getRandomItem(WEAPON_PREFIXES);
  const name = getRandomItem(WEAPON_NAMES[weaponType]);
  const fullName = `${prefix} ${name}`;
  
  // Generate weapon stats
  const statBonuses = generateStats(level, rarity, EquipmentSlot.WEAPON);
  
  return {
    id: uuidv4(),
    name: fullName,
    description: `A level ${level} ${weaponType} of ${rarity.toLowerCase()} quality.`,
    rarity,
    level,
    value: Math.round(BASE_VALUE[rarity] * (level / 2 + 1)),
    isNFT: false,
    slot: EquipmentSlot.WEAPON,
    statBonuses,
    specialEffects: generateSpecialEffects(rarity),
    weaponType,
    damage: {
      min: Math.round(baseDamage.min * multiplier),
      max: Math.round(baseDamage.max * multiplier),
    },
    attackSpeed,
    range: weaponType === WeaponType.BOW || weaponType === WeaponType.WAND ? 5 : 1,
  };
}

// Generate random armor piece
export function generateArmor(level: number, slot: EquipmentSlot.HEAD | EquipmentSlot.CHEST | EquipmentSlot.HANDS | EquipmentSlot.LEGS | EquipmentSlot.FEET): Armor {
  const rarity = generateRarity();
  // Determine armor type - more agility-focused for hands/feet, more defense for chest
  let armorType: ArmorType;
  
  switch (slot) {
    case EquipmentSlot.HEAD:
      armorType = getRandomItem([ArmorType.LIGHT, ArmorType.MEDIUM, ArmorType.HEAVY, ArmorType.CLOTH]);
      break;
    case EquipmentSlot.CHEST:
      armorType = getRandomItem([ArmorType.MEDIUM, ArmorType.HEAVY, ArmorType.HEAVY, ArmorType.MEDIUM]);
      break;
    case EquipmentSlot.HANDS:
      armorType = getRandomItem([ArmorType.LIGHT, ArmorType.LIGHT, ArmorType.MEDIUM, ArmorType.CLOTH]);
      break;
    case EquipmentSlot.LEGS:
      armorType = getRandomItem([ArmorType.MEDIUM, ArmorType.HEAVY, ArmorType.MEDIUM, ArmorType.LIGHT]);
      break;
    case EquipmentSlot.FEET:
      armorType = getRandomItem([ArmorType.LIGHT, ArmorType.LIGHT, ArmorType.MEDIUM, ArmorType.CLOTH]);
      break;
  }
  
  const multiplier = STAT_MULTIPLIERS[rarity] * (level / 10 + 0.5);
  
  // Generate name
  const prefix = getRandomItem(ARMOR_PREFIXES);
  const name = getRandomItem(ARMOR_NAMES[slot]);
  const fullName = `${prefix} ${name}`;
  
  // Generate armor stats
  const statBonuses = generateStats(level, rarity, slot);
  
  return {
    id: uuidv4(),
    name: fullName,
    description: `Level ${level} ${armorType} armor of ${rarity.toLowerCase()} quality.`,
    rarity,
    level,
    value: Math.round(BASE_VALUE[rarity] * (level / 3 + 1)),
    isNFT: false,
    slot,
    statBonuses,
    specialEffects: generateSpecialEffects(rarity),
    armorType,
    armorValue: Math.round(ARMOR_BASE_VALUE[armorType] * multiplier),
    durability: {
      current: 100,
      max: 100,
    }
  };
}

// Generate random accessory
export function generateAccessory(level: number, slot: EquipmentSlot.RING_1 | EquipmentSlot.RING_2 | EquipmentSlot.AMULET | EquipmentSlot.TRINKET): Accessory {
  const rarity = generateRarity();
  const multiplier = STAT_MULTIPLIERS[rarity] * (level / 10 + 0.5);
  
  // Generate name
  const prefix = getRandomItem(ACCESSORY_PREFIXES);
  const name = getRandomItem(ACCESSORY_NAMES[slot]);
  const fullName = `${prefix} ${name}`;
  
  // Generate accessory stats
  const statBonuses = generateStats(level, rarity, slot);
  
  return {
    id: uuidv4(),
    name: fullName,
    description: `A level ${level} ${name.toLowerCase()} of ${rarity.toLowerCase()} quality.`,
    rarity,
    level,
    value: Math.round(BASE_VALUE[rarity] * (level / 2 + 1) * 1.2), // Accessories are a bit more valuable
    isNFT: false,
    slot,
    statBonuses,
    specialEffects: generateSpecialEffects(rarity),
  };
}

// Generate a complete set of equipment for a given level
export function generateEquipmentSet(level: number) {
  return {
    [EquipmentSlot.WEAPON]: generateWeapon(level),
    [EquipmentSlot.HEAD]: generateArmor(level, EquipmentSlot.HEAD),
    [EquipmentSlot.CHEST]: generateArmor(level, EquipmentSlot.CHEST),
    [EquipmentSlot.HANDS]: generateArmor(level, EquipmentSlot.HANDS),
    [EquipmentSlot.LEGS]: generateArmor(level, EquipmentSlot.LEGS),
    [EquipmentSlot.FEET]: generateArmor(level, EquipmentSlot.FEET),
    [EquipmentSlot.RING_1]: generateAccessory(level, EquipmentSlot.RING_1),
    [EquipmentSlot.RING_2]: generateAccessory(level, EquipmentSlot.RING_2),
    [EquipmentSlot.AMULET]: generateAccessory(level, EquipmentSlot.AMULET),
    [EquipmentSlot.TRINKET]: generateAccessory(level, EquipmentSlot.TRINKET),
  };
}

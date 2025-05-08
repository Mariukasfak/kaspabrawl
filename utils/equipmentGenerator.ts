import { v4 as uuidv4 } from 'uuid';
import { 
  Equipment, 
  Weapon, 
  Armor, 
  Accessory,
  WeaponType, 
  ArmorType, 
  EquipmentSlot, 
  ItemRarity,
  Stats,
  SpecialEffect
} from '../types/equipment';

/**
 * Names for different types of equipment
 */
const EQUIPMENT_NAMES = {
  [WeaponType.SWORD]: ['Longsword', 'Broadsword', 'Shortsword', 'Blade', 'Saber'],
  [WeaponType.AXE]: ['Battleaxe', 'Hatchet', 'Cleaver', 'War Axe', 'Tomahawk'],
  [WeaponType.MACE]: ['Warhammer', 'Flail', 'Mace', 'Morning Star', 'Maul'],
  [WeaponType.DAGGER]: ['Dagger', 'Dirk', 'Stiletto', 'Knife', 'Shiv'],
  [WeaponType.STAFF]: ['Staff', 'Rod', 'Scepter', 'Quarterstaff', 'Spellstaff'],
  [WeaponType.BOW]: ['Longbow', 'Shortbow', 'Recurve Bow', 'Compound Bow', 'Crossbow'],
  [WeaponType.WAND]: ['Wand', 'Baton', 'Focus', 'Channeling Rod', 'Runestaff'],
  
  [EquipmentSlot.HEAD]: ['Helmet', 'Cap', 'Crown', 'Mask', 'Hood', 'Circlet'],
  [EquipmentSlot.CHEST]: ['Chestplate', 'Armor', 'Cuirass', 'Robe', 'Vest', 'Breastplate'],
  [EquipmentSlot.HANDS]: ['Gloves', 'Gauntlets', 'Handwraps', 'Bracers', 'Mitts'],
  [EquipmentSlot.LEGS]: ['Greaves', 'Pants', 'Leggings', 'Cuisses', 'Breeches'],
  [EquipmentSlot.FEET]: ['Boots', 'Shoes', 'Sabatons', 'Sandals', 'Treads'],
  [EquipmentSlot.RING_1]: ['Ring', 'Band', 'Loop', 'Seal', 'Circle'],
  [EquipmentSlot.RING_2]: ['Ring', 'Band', 'Loop', 'Seal', 'Circle'],
  [EquipmentSlot.AMULET]: ['Amulet', 'Necklace', 'Pendant', 'Locket', 'Choker'],
  [EquipmentSlot.TRINKET]: ['Charm', 'Totem', 'Bauble', 'Idol', 'Talisman']
};

/**
 * Adjectives for different rarities
 */
const RARITY_ADJECTIVES = {
  [ItemRarity.COMMON]: ['Simple', 'Basic', 'Plain', 'Crude', 'Ordinary'],
  [ItemRarity.UNCOMMON]: ['Sturdy', 'Quality', 'Refined', 'Improved', 'Enhanced'],
  [ItemRarity.RARE]: ['Exceptional', 'Superior', 'Masterwork', 'Remarkable', 'Distinctive'],
  [ItemRarity.EPIC]: ['Magnificent', 'Formidable', 'Illustrious', 'Empowered', 'Heroic'],
  [ItemRarity.LEGENDARY]: ['Ancient', 'Mythical', 'Legendary', 'Fabled', 'Timeless'],
  [ItemRarity.MYTHIC]: ['Divine', 'Transcendent', 'Celestial', 'Godly', 'Omnipotent']
};

/**
 * Special effect prefixes for item names
 */
const SPECIAL_PREFIXES = {
  strength: ['Mighty', 'Powerful', 'Strong', 'Forceful', 'Brutal'],
  agility: ['Swift', 'Quick', 'Agile', 'Nimble', 'Dexterous'],
  vitality: ['Robust', 'Healthy', 'Vigorous', 'Vital', 'Enduring'],
  defense: ['Sturdy', 'Protective', 'Reinforced', 'Shielding', 'Guarding'],
  critChance: ['Precise', 'Sharp', 'Accurate', 'Focused', 'Deadly'],
  critDamage: ['Devastating', 'Lethal', 'Vicious', 'Brutal', 'Crushing'],
  blockRate: ['Warding', 'Blocking', 'Defensive', 'Guarded', 'Protected'],
  magicFind: ['Lucky', 'Fortunate', 'Prosperous', 'Favored', 'Blessed']
};

/**
 * Special effect catalog for equipment
 */
const SPECIAL_EFFECTS: SpecialEffect[] = [
  {
    name: 'Life Steal',
    description: 'Absorbs a portion of damage dealt as health',
    triggerChance: 1.0, // Always triggers
    effectStrength: 0.1, // 10% of damage
    effectType: 'onHit'
  },
  {
    name: 'Fire Damage',
    description: 'Deals additional fire damage on hit',
    triggerChance: 1.0,
    effectStrength: 0.2,
    effectType: 'onHit'
  },
  {
    name: 'Thunder Strike',
    description: 'Chance to strike enemies with lightning',
    triggerChance: 0.15,
    effectStrength: 0.5,
    effectType: 'onHit'
  },
  {
    name: 'Reflective',
    description: 'Returns a portion of damage back to attacker',
    triggerChance: 0.3,
    effectStrength: 0.3,
    effectType: 'onTakeDamage'
  },
  {
    name: 'Critical Surge',
    description: 'Critical hits deal additional damage',
    triggerChance: 1.0,
    effectStrength: 0.25,
    effectType: 'onCritical'
  },
  {
    name: 'Vampiric',
    description: 'Gain health when defeating an enemy',
    triggerChance: 1.0,
    effectStrength: 0.2, // 20% of max health
    effectType: 'onKill'
  },
  {
    name: 'Lucky Find',
    description: 'Increases chance of finding rare items',
    effectType: 'passive'
  },
  {
    name: 'Bloodlust',
    description: 'Gain increased damage after defeating an enemy',
    triggerChance: 1.0,
    effectStrength: 0.15, // 15% damage increase
    effectType: 'onKill'
  }
];

// Stat bonuses based on rarity and level
function getStatBoostMultiplier(rarity: ItemRarity): number {
  switch (rarity) {
    case ItemRarity.COMMON: return 1.0;
    case ItemRarity.UNCOMMON: return 1.5;
    case ItemRarity.RARE: return 2.5;
    case ItemRarity.EPIC: return 4.0;
    case ItemRarity.LEGENDARY: return 7.0;
    case ItemRarity.MYTHIC: return 12.0;
    default: return 1.0;
  }
}

// Chance to get special effects based on rarity
function getSpecialEffectChance(rarity: ItemRarity): number {
  switch (rarity) {
    case ItemRarity.COMMON: return 0.0; // No special effects
    case ItemRarity.UNCOMMON: return 0.2; // 20% chance for 1 effect
    case ItemRarity.RARE: return 0.5; // 50% chance for 1 effect
    case ItemRarity.EPIC: return 1.0; // 100% chance for 1 effect
    case ItemRarity.LEGENDARY: return 1.0; // 100% chance for 1-2 effects
    case ItemRarity.MYTHIC: return 1.0; // 100% chance for 2-3 effects
    default: return 0.0;
  }
}

// Number of special effects based on rarity
function getSpecialEffectCount(rarity: ItemRarity): number {
  switch (rarity) {
    case ItemRarity.COMMON: return 0;
    case ItemRarity.UNCOMMON: return Math.random() < 0.2 ? 1 : 0;
    case ItemRarity.RARE: return Math.random() < 0.5 ? 1 : 0;
    case ItemRarity.EPIC: return 1;
    case ItemRarity.LEGENDARY: return 1 + (Math.random() < 0.5 ? 1 : 0);
    case ItemRarity.MYTHIC: return 2 + (Math.random() < 0.5 ? 1 : 0);
    default: return 0;
  }
}

/**
 * Determine item rarity based on level and luck factor
 * @param level Level of the item
 * @param luck Luck factor (0-1, higher = better chance for rare items)
 * @returns The rarity of the item
 */
function determineRarity(level: number, luck: number = 0): ItemRarity {
  // Adjust chance based on level and luck
  const rng = Math.random() + (level / 100) + luck;
  
  if (rng > 0.995) return ItemRarity.MYTHIC;
  if (rng > 0.97) return ItemRarity.LEGENDARY;
  if (rng > 0.9) return ItemRarity.EPIC;
  if (rng > 0.75) return ItemRarity.RARE;
  if (rng > 0.5) return ItemRarity.UNCOMMON;
  return ItemRarity.COMMON;
}

/**
 * Generate a random name for equipment
 */
function generateEquipmentName(
  equipType: WeaponType | EquipmentSlot, 
  rarity: ItemRarity, 
  primaryStat?: keyof Stats
): string {
  // Get base name options by specifically handling each case
  let baseNames: string[];
  
  switch(equipType) {
    // Weapon types
    case WeaponType.SWORD:
      baseNames = ['Longsword', 'Broadsword', 'Shortsword', 'Blade', 'Saber'];
      break;
    case WeaponType.AXE:
      baseNames = ['Battleaxe', 'Hatchet', 'Cleaver', 'War Axe', 'Tomahawk'];
      break;
    case WeaponType.MACE:
      baseNames = ['Warhammer', 'Flail', 'Mace', 'Morning Star', 'Maul'];
      break;
    case WeaponType.DAGGER:
      baseNames = ['Dagger', 'Dirk', 'Stiletto', 'Knife', 'Shiv'];
      break;
    case WeaponType.STAFF:
      baseNames = ['Staff', 'Rod', 'Scepter', 'Quarterstaff', 'Spellstaff'];
      break;
    case WeaponType.BOW:
      baseNames = ['Longbow', 'Shortbow', 'Recurve Bow', 'Compound Bow', 'Crossbow'];
      break;
    case WeaponType.WAND:
      baseNames = ['Wand', 'Baton', 'Focus', 'Channeling Rod', 'Runestaff'];
      break;
    
    // Armor slots  
    case EquipmentSlot.HEAD:
      baseNames = ['Helmet', 'Cap', 'Crown', 'Mask', 'Hood', 'Circlet'];
      break;
    case EquipmentSlot.CHEST:
      baseNames = ['Chestplate', 'Armor', 'Cuirass', 'Robe', 'Vest', 'Breastplate'];
      break;
    case EquipmentSlot.HANDS:
      baseNames = ['Gloves', 'Gauntlets', 'Handwraps', 'Bracers', 'Mitts'];
      break;
    case EquipmentSlot.LEGS:
      baseNames = ['Greaves', 'Pants', 'Leggings', 'Cuisses', 'Breeches'];
      break;
    case EquipmentSlot.FEET:
      baseNames = ['Boots', 'Shoes', 'Sabatons', 'Sandals', 'Treads'];
      break;
    case EquipmentSlot.RING_1:
    case EquipmentSlot.RING_2:
      baseNames = ['Ring', 'Band', 'Loop', 'Seal', 'Circle'];
      break;
    case EquipmentSlot.AMULET:
      baseNames = ['Amulet', 'Necklace', 'Pendant', 'Locket', 'Choker'];
      break;
    case EquipmentSlot.TRINKET:
      baseNames = ['Charm', 'Totem', 'Bauble', 'Idol', 'Talisman'];
      break;
    default:
      baseNames = ['Item'];
  }
  
  const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];
  
  // Get rarity adjective
  const rarityAdjs = RARITY_ADJECTIVES[rarity] || [''];
  const rarityAdj = rarityAdjs[Math.floor(Math.random() * rarityAdjs.length)];
  
  // Get prefix based on primary stat if available
  let prefix = '';
  if (primaryStat && SPECIAL_PREFIXES[primaryStat]) {
    const prefixes = SPECIAL_PREFIXES[primaryStat];
    prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  }
  
  // Format name based on rarity
  if (rarity === ItemRarity.MYTHIC || rarity === ItemRarity.LEGENDARY) {
    // Legendary/Mythic items get special names
    const titles = [
      "of the Cosmos", "of Destruction", "of the Phoenix", 
      "of Dominance", "of the Void", "of Eternity",
      "of Power", "of the Gods", "of Destiny"
    ];
    const title = titles[Math.floor(Math.random() * titles.length)];
    return `${prefix} ${baseName} ${title}`.trim();
  }
  
  // Other rarities get adjective + name
  return `${rarityAdj} ${prefix} ${baseName}`.replace(/\s+/g, ' ').trim();
}

/**
 * Generate random stats for equipment based on level and rarity
 */
function generateStatBonuses(
  level: number, 
  rarity: ItemRarity, 
  slot: EquipmentSlot
): Partial<Stats> {
  const multiplier = getStatBoostMultiplier(rarity);
  const stats: Partial<Stats> = {};
  
  // Determine how many stats to generate
  let statCount = 1; // Common items get 1 stat
  
  if (rarity === ItemRarity.UNCOMMON) statCount = 2;
  if (rarity === ItemRarity.RARE) statCount = 3;
  if (rarity === ItemRarity.EPIC) statCount = 4;
  if (rarity === ItemRarity.LEGENDARY) statCount = 5;
  if (rarity === ItemRarity.MYTHIC) statCount = 6;
  
  // Pool of possible stats
  const statPool: Array<keyof Stats> = ['strength', 'agility', 'vitality', 'defense'];
  
  // Add secondary stats with lower probability
  if (Math.random() < 0.7) statPool.push('critChance');
  if (Math.random() < 0.6) statPool.push('critDamage');
  if (Math.random() < 0.5) statPool.push('blockRate');
  if (Math.random() < 0.4) statPool.push('magicFind');
  
  // Favor certain stats based on slot
  let primaryStat: keyof Stats | undefined;
  
  switch (slot) {
    case EquipmentSlot.WEAPON:
      primaryStat = 'strength';
      break;
    case EquipmentSlot.HEAD:
      primaryStat = Math.random() > 0.5 ? 'vitality' : 'defense';
      break;
    case EquipmentSlot.CHEST:
      primaryStat = 'defense';
      break;
    case EquipmentSlot.HANDS:
      primaryStat = Math.random() > 0.5 ? 'strength' : 'agility';
      break;
    case EquipmentSlot.LEGS:
      primaryStat = 'defense';
      break;
    case EquipmentSlot.FEET:
      primaryStat = 'agility';
      break;
    case EquipmentSlot.RING_1:
    case EquipmentSlot.RING_2:
      primaryStat = Math.random() > 0.5 ? 'critChance' : 'critDamage';
      break;
    case EquipmentSlot.AMULET:
      primaryStat = 'magicFind';
      break;
    case EquipmentSlot.TRINKET:
      // Trinkets can have any stat as primary
      primaryStat = statPool[Math.floor(Math.random() * statPool.length)];
      break;
  }
  
  // Always include primary stat
  if (primaryStat) {
    stats[primaryStat] = Math.floor((level * 0.8 + 2) * multiplier);
    statCount--;
    
    // Remove from pool to avoid duplicates
    const index = statPool.indexOf(primaryStat);
    if (index > -1) {
      statPool.splice(index, 1);
    }
  }
  
  // Add random stats from the pool
  for (let i = 0; i < statCount && statPool.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * statPool.length);
    const stat = statPool[randomIndex];
    
    // Calculate stat value based on type
    let value = Math.floor((level * 0.5 + 1) * multiplier);
    
    // Special handling for percentage-based stats
    if (stat === 'critChance') {
      value = Math.min(Math.floor((level * 0.1 + 1) * multiplier), 50); // Cap at 50%
    } else if (stat === 'critDamage') {
      value = Math.floor((level * 0.2 + 5) * multiplier);
    } else if (stat === 'blockRate') {
      value = Math.min(Math.floor((level * 0.1 + 1) * multiplier), 40); // Cap at 40%
    } else if (stat === 'magicFind') {
      value = Math.floor((level * 0.3 + 2) * multiplier);
    }
    
    stats[stat] = value;
    statPool.splice(randomIndex, 1);
  }
  
  return stats;
}

/**
 * Generate special effects for an item based on its rarity
 */
function generateSpecialEffects(rarity: ItemRarity): SpecialEffect[] {
  const effects: SpecialEffect[] = [];
  const effectCount = getSpecialEffectCount(rarity);
  
  if (effectCount === 0) return effects;
  
  // Clone the effects array to avoid modification
  const availableEffects = [...SPECIAL_EFFECTS];
  
  // Select random effects
  for (let i = 0; i < effectCount && availableEffects.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableEffects.length);
    const effect = availableEffects[randomIndex];
    effects.push({ ...effect }); // Add a copy of the effect
    availableEffects.splice(randomIndex, 1);
  }
  
  return effects;
}

/**
 * Generate a weapon based on level and luck
 */
export function generateWeapon(level: number, luck: number = 0): Weapon {
  const rarity = determineRarity(level, luck);
  const weaponType = Object.values(WeaponType)[Math.floor(Math.random() * Object.values(WeaponType).length)];
  const statBonuses = generateStatBonuses(level, rarity, EquipmentSlot.WEAPON);
  const specialEffects = generateSpecialEffects(rarity);
  
  // Choose primary stat (usually strength)
  const primaryStat: keyof Stats = 'strength';
  
  // Generate damage based on level, rarity, and weapon type
  const multiplier = getStatBoostMultiplier(rarity);
  const minDamage = Math.floor((level * 2 + 5) * multiplier * 0.8);
  const maxDamage = Math.floor((level * 3 + 10) * multiplier);
  
  // Attack speed varies by weapon type
  let attackSpeed = 1.0; // Default
  let range = 1; // Default to melee
  
  switch (weaponType) {
    case WeaponType.DAGGER:
      attackSpeed = 1.5;
      break;
    case WeaponType.SWORD:
      attackSpeed = 1.2;
      break;
    case WeaponType.BOW:
      attackSpeed = 0.8;
      range = 3;
      break;
    case WeaponType.AXE:
      attackSpeed = 0.9;
      break;
    case WeaponType.MACE:
      attackSpeed = 0.7;
      break;
    case WeaponType.STAFF:
      attackSpeed = 1.0;
      range = 2;
      break;
    case WeaponType.WAND:
      attackSpeed = 1.1;
      range = 2;
      break;
  }
  
  const name = generateEquipmentName(weaponType, rarity, primaryStat);
  
  return {
    id: uuidv4(),
    name,
    description: `A ${rarity} ${weaponType} that deals ${minDamage}-${maxDamage} damage.`,
    rarity,
    level,
    slot: EquipmentSlot.WEAPON,
    value: Math.floor(level * level * multiplier),
    isNFT: rarity >= ItemRarity.EPIC, // Epic+ are NFTs
    weaponType,
    damage: {
      min: minDamage,
      max: maxDamage
    },
    attackSpeed,
    range,
    statBonuses,
    specialEffects,
    durability: {
      current: 100,
      max: 100
    },
    requiredLevel: Math.max(1, level - 5)
  };
}

/**
 * Generate armor based on level, slot, and luck
 */
export function generateArmor(
  level: number, 
  slot: EquipmentSlot.HEAD | EquipmentSlot.CHEST | EquipmentSlot.HANDS | EquipmentSlot.LEGS | EquipmentSlot.FEET,
  luck: number = 0
): Armor {
  const rarity = determineRarity(level, luck);
  const statBonuses = generateStatBonuses(level, rarity, slot);
  const specialEffects = generateSpecialEffects(rarity);
  
  // Determine armor type (weighted random)
  const armorRoll = Math.random();
  let armorType: ArmorType;
  
  if (armorRoll < 0.3) {
    armorType = ArmorType.LIGHT;
  } else if (armorRoll < 0.6) {
    armorType = ArmorType.MEDIUM;
  } else if (armorRoll < 0.9) {
    armorType = ArmorType.HEAVY;
  } else {
    armorType = ArmorType.CLOTH;
  }
  
  // Generate armor value based on level, rarity, slot and type
  const multiplier = getStatBoostMultiplier(rarity);
  let baseArmorValue = level * 2 + 5;
  
  // Adjust by armor type
  switch (armorType) {
    case ArmorType.LIGHT:
      baseArmorValue *= 0.8;
      break;
    case ArmorType.MEDIUM:
      baseArmorValue *= 1.0;
      break;
    case ArmorType.HEAVY:
      baseArmorValue *= 1.5;
      break;
    case ArmorType.CLOTH:
      baseArmorValue *= 0.5;
      break;
  }
  
  // Adjust by slot
  switch (slot) {
    case EquipmentSlot.CHEST:
      baseArmorValue *= 1.5;
      break;
    case EquipmentSlot.HEAD:
      baseArmorValue *= 1.0;
      break;
    case EquipmentSlot.LEGS:
      baseArmorValue *= 1.2;
      break;
    case EquipmentSlot.HANDS:
      baseArmorValue *= 0.7;
      break;
    case EquipmentSlot.FEET:
      baseArmorValue *= 0.8;
      break;
  }
  
  const armorValue = Math.floor(baseArmorValue * multiplier);
  
  // Determine primary stat based on armor type
  let primaryStat: keyof Stats;
  
  switch (armorType) {
    case ArmorType.HEAVY:
      primaryStat = 'defense';
      break;
    case ArmorType.MEDIUM:
      primaryStat = 'vitality';
      break;
    case ArmorType.LIGHT:
      primaryStat = 'agility';
      break;
    case ArmorType.CLOTH:
      primaryStat = 'magicFind';
      break;
    default:
      primaryStat = 'defense';
  }
  
  const name = generateEquipmentName(slot, rarity, primaryStat);
  
  return {
    id: uuidv4(),
    name,
    description: `${rarity} ${armorType} armor with ${armorValue} armor value.`,
    rarity,
    level,
    slot,
    armorType,
    armorValue,
    value: Math.floor(level * level * multiplier),
    isNFT: rarity >= ItemRarity.EPIC, // Epic+ are NFTs
    statBonuses,
    specialEffects,
    durability: {
      current: 100,
      max: 100
    },
    requiredLevel: Math.max(1, level - 5)
  };
}

/**
 * Generate an accessory based on level, slot, and luck
 */
export function generateAccessory(
  level: number,
  slot: EquipmentSlot.RING_1 | EquipmentSlot.RING_2 | EquipmentSlot.AMULET | EquipmentSlot.TRINKET,
  luck: number = 0
): Accessory {
  const rarity = determineRarity(level, luck);
  const statBonuses = generateStatBonuses(level, rarity, slot);
  const specialEffects = generateSpecialEffects(rarity);
  
  // Determine primary stat based on accessory type
  let primaryStat: keyof Stats;
  
  switch (slot) {
    case EquipmentSlot.RING_1:
    case EquipmentSlot.RING_2:
      primaryStat = Math.random() > 0.5 ? 'critChance' : 'critDamage';
      break;
    case EquipmentSlot.AMULET:
      primaryStat = Math.random() > 0.5 ? 'magicFind' : 'vitality';
      break;
    case EquipmentSlot.TRINKET:
      primaryStat = ['strength', 'agility', 'vitality', 'defense'][Math.floor(Math.random() * 4)] as keyof Stats;
      break;
    default:
      primaryStat = 'magicFind';
  }
  
  const multiplier = getStatBoostMultiplier(rarity);
  const name = generateEquipmentName(slot, rarity, primaryStat);
  
  return {
    id: uuidv4(),
    name,
    description: `A ${rarity} ${slot} that enhances your abilities.`,
    rarity,
    level,
    slot,
    value: Math.floor(level * level * multiplier * 1.2),
    isNFT: rarity >= ItemRarity.EPIC, // Epic+ are NFTs
    statBonuses,
    specialEffects,
    requiredLevel: Math.max(1, level - 5)
  };
}

/**
 * Generate a random equipment piece appropriate for the given level
 */
export function generateRandomEquipment(level: number, luck: number = 0): Equipment {
  // Determine equipment slot
  const slots = Object.values(EquipmentSlot);
  const slot = slots[Math.floor(Math.random() * slots.length)];
  
  if (slot === EquipmentSlot.WEAPON) {
    return generateWeapon(level, luck);
  } else if ([
    EquipmentSlot.HEAD, 
    EquipmentSlot.CHEST, 
    EquipmentSlot.HANDS, 
    EquipmentSlot.LEGS, 
    EquipmentSlot.FEET
  ].includes(slot as any)) {
    return generateArmor(level, slot as any, luck);
  } else {
    return generateAccessory(level, slot as any, luck);
  }
}

/**
 * Generate a complete set of equipment appropriate for a character level
 */
export function generateEquipmentSet(level: number, luck: number = 0): Record<EquipmentSlot, Equipment | undefined> {
  return {
    [EquipmentSlot.WEAPON]: generateWeapon(level, luck),
    [EquipmentSlot.HEAD]: generateArmor(level, EquipmentSlot.HEAD, luck),
    [EquipmentSlot.CHEST]: generateArmor(level, EquipmentSlot.CHEST, luck),
    [EquipmentSlot.HANDS]: generateArmor(level, EquipmentSlot.HANDS, luck),
    [EquipmentSlot.LEGS]: generateArmor(level, EquipmentSlot.LEGS, luck),
    [EquipmentSlot.FEET]: generateArmor(level, EquipmentSlot.FEET, luck),
    [EquipmentSlot.RING_1]: generateAccessory(level, EquipmentSlot.RING_1, luck),
    [EquipmentSlot.RING_2]: generateAccessory(level, EquipmentSlot.RING_2, luck),
    [EquipmentSlot.AMULET]: generateAccessory(level, EquipmentSlot.AMULET, luck),
    [EquipmentSlot.TRINKET]: generateAccessory(level, EquipmentSlot.TRINKET, luck)
  };
}

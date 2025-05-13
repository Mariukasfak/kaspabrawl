import { v4 as uuidv4 } from 'uuid';
import { Fighter, FighterClass } from '../types/fighter';
import { Stats, EquipmentLoadout } from '../types/equipment';
import { generateEquipmentSet } from './equipmentGenerator';

/**
 * Generate base stats for a new fighter based on their Kaspa address
 * @param address Kaspa address
 * @returns Base stats
 */
export function generateBaseStats(address: string): Stats {
  // Use the address as a seed for randomness
  const seed = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Generate stats with values between 5-15
  const rng = (offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return 5 + Math.floor((x - Math.floor(x)) * 11);
  };
  
  return {
    strength: rng(1),
    agility: rng(2),
    intelligence: rng(3), // Add intelligence for mage abilities
    vitality: rng(4),
    defense: rng(5),
    critChance: rng(6) / 10,    // 0.5 - 1.5
    critDamage: 1.5 + rng(7) / 10, // 1.5 - 2.5
    blockRate: rng(8) / 10,     // 0.5 - 1.5
    magicFind: rng(9) / 5,      // 1 - 3
  };
}

/**
 * Calculate max HP based on level and vitality
 * @param level Fighter level
 * @param vitality Vitality stat
 * @returns Maximum HP value
 */
export function calculateMaxHp(level: number, vitality: number): number {
  return Math.floor(100 + (level * 10) + (vitality * 5));
}

/**
 * Calculate max energy based on level
 * @param level Fighter level
 * @returns Maximum energy value
 */
export function calculateMaxEnergy(level: number): number {
  return Math.floor(100 + (level * 5));
}

/**
 * Create a new fighter with starting equipment
 * @param id Fighter ID
 * @param address Kaspa address
 * @returns Complete fighter object
 */
export function createNewFighter(id: string, address: string): Fighter {
  // Generate base stats from address
  const baseStats = generateBaseStats(address);
  
  // Generate starter equipment
  const equipment: EquipmentLoadout = generateEquipmentSet(1, 0) as EquipmentLoadout;
  
  // Calculate max HP and energy
  const maxHp = calculateMaxHp(1, baseStats.vitality);
  const maxEnergy = calculateMaxEnergy(1);
  
  // Determine fighter class based on address
  const addressNum = parseInt(address.slice(-4), 16) || 0;
  const fighterClasses: FighterClass[] = ['fighter', 'ranged', 'mage'];
  const fighterClass = fighterClasses[addressNum % fighterClasses.length];
  
  // Return complete fighter object
  return {
    id,
    address,
    name: address.slice(0, 8), // Use shortened address as name
    level: 1,
    experience: 0,
    class: fighterClass,
    baseStats,
    equipment,
    currentHp: maxHp,
    maxHp,
    energy: maxEnergy,
    maxEnergy,
    skills: [], // Skills will be calculated based on stats + equipment
    statusEffects: [],
    wins: 0,
    losses: 0,
    draws: 0,
    progression: {
      unallocatedStatPoints: 0,
      characterAbilities: []
    }
  };
}

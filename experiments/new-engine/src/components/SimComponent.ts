import { Component } from '../core/ecs';

/**
 * Stats attributes for fighters
 */
export interface Attributes {
  strength: number;
  agility: number;
  defense: number;
  will: number;
  luck: number;
  [key: string]: number;
}

/**
 * SimComponent handles fighter attributes and stats
 * Core component used for combat simulation
 */
export class SimComponent implements Component {
  public readonly type = 'sim';
  
  // Basic attributes that affect combat
  public attributes: Attributes;
  
  // Base health points
  public baseHealth: number;
  
  // Base energy points for using special moves
  public baseEnergy: number;
  
  // Equipment modifiers (percentage bonuses from equipment)
  public equipmentModifiers: {
    strength: number;
    agility: number;
    defense: number;
    will: number;
    luck: number;
    health: number;
    energy: number;
    [key: string]: number;
  };

  constructor(data?: Partial<SimComponent>) {
    this.attributes = data?.attributes || {
      strength: 5,
      agility: 5,
      defense: 5,
      will: 5,
      luck: 5
    };
    
    this.baseHealth = data?.baseHealth || 100;
    this.baseEnergy = data?.baseEnergy || 50;
    
    this.equipmentModifiers = data?.equipmentModifiers || {
      strength: 0,
      agility: 0,
      defense: 0,
      will: 0,
      luck: 0,
      health: 0,
      energy: 0
    };
  }
  
  /**
   * Get the total value of an attribute including equipment modifiers
   */
  public getAttributeValue(attribute: keyof Attributes): number {
    const baseValue = this.attributes[attribute] || 0;
    const modifier = this.equipmentModifiers[attribute] || 0;
    
    return Math.floor(baseValue * (1 + modifier / 100));
  }
  
  /**
   * Get the maximum health including modifiers
   */
  public getMaxHealth(): number {
    // Base health + strength bonus + equipment modifier
    const strengthBonus = this.attributes.strength * 2;
    const equipmentBonus = this.baseHealth * (this.equipmentModifiers.health / 100);
    
    return Math.floor(this.baseHealth + strengthBonus + equipmentBonus);
  }
  
  /**
   * Get the maximum energy including modifiers
   */
  public getMaxEnergy(): number {
    // Base energy + will bonus + equipment modifier
    const willBonus = this.attributes.will * 2;
    const equipmentBonus = this.baseEnergy * (this.equipmentModifiers.energy / 100);
    
    return Math.floor(this.baseEnergy + willBonus + equipmentBonus);
  }
}

export default SimComponent;

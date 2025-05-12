import { Component } from '../core/ecs';

/**
 * MyBrute-inspired special abilities for fighters
 */
export type SpecialAbility = {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'active';
  cooldown: number; // Turns until usable again (0 for passive)
  currentCooldown: number;
  effects: SpecialAbilityEffect[];
  iconPath: string;
};

export type SpecialAbilityEffect = {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'stun' | 'leech' | 'counter' | 'shield';
  target: 'self' | 'opponent' | 'both';
  stat?: 'strength' | 'agility' | 'defense' | 'will' | 'luck';
  value: number;
  duration?: number; // In turns
  chance?: number; // 0-100 percent
  animation?: string;
};

/**
 * AbilitiesComponent manages MyBrute-style special moves and passive abilities
 */
export class AbilitiesComponent implements Component {
  public readonly type = 'abilities';
  
  // List of special abilities this entity possesses
  public abilities: SpecialAbility[] = [];
  
  // Level requirements for unlocking abilities
  public abilityUnlockLevels: Record<string, number> = {};
  
  constructor(data?: Partial<AbilitiesComponent>) {
    if (data?.abilities) {
      this.abilities = [...data.abilities];
    }
    
    if (data?.abilityUnlockLevels) {
      this.abilityUnlockLevels = { ...data.abilityUnlockLevels };
    }
  }
  
  /**
   * Adds a new special ability to the entity
   */
  public addAbility(ability: SpecialAbility): void {
    // Check if ability already exists
    if (this.abilities.some(a => a.id === ability.id)) {
      return;
    }
    
    this.abilities.push(ability);
  }
  
  /**
   * Removes an ability by ID
   */
  public removeAbility(abilityId: string): boolean {
    const initialLength = this.abilities.length;
    this.abilities = this.abilities.filter(a => a.id !== abilityId);
    return this.abilities.length !== initialLength;
  }
  
  /**
   * Gets an ability by ID
   */
  public getAbility(abilityId: string): SpecialAbility | undefined {
    return this.abilities.find(a => a.id === abilityId);
  }
  
  /**
   * Uses an active ability and puts it on cooldown
   */
  public useAbility(abilityId: string): SpecialAbility | null {
    const ability = this.getAbility(abilityId);
    
    if (!ability || ability.type !== 'active') {
      return null;
    }
    
    if (ability.currentCooldown > 0) {
      return null; // Ability still on cooldown
    }
    
    // Set the ability on cooldown
    ability.currentCooldown = ability.cooldown;
    
    return ability;
  }
  
  /**
   * Update cooldowns at the end of a turn
   */
  public updateCooldowns(): void {
    for (const ability of this.abilities) {
      if (ability.currentCooldown > 0) {
        ability.currentCooldown--;
      }
    }
  }
  
  /**
   * Serializes the component data for storage
   */
  public serialize(): object {
    return {
      abilities: this.abilities.map(ability => ({
        ...ability,
        effects: [...ability.effects]
      })),
      abilityUnlockLevels: { ...this.abilityUnlockLevels }
    };
  }
}

export default AbilitiesComponent;

import { Component } from '../core/ecs';

/**
 * IdentityComponent handles basic entity identification and metadata
 * Contains display name, level, and other non-combat identity information
 */
export class IdentityComponent implements Component {
  public readonly type = 'identity';
  
  // Display name of the entity
  public name: string;
  
  // Current level of the entity
  public level: number;
  
  // Experience points
  public xp: number;
  
  // XP required for next level
  public xpToNextLevel: number;
  
  // Optional avatar image URL
  public avatarUrl?: string;
  
  // Owner of this entity (player ID or wallet address)
  public owner?: string;
  
  // Creation date
  public created: Date;
  
  // Last modified date
  public lastModified: Date;
  
  constructor(data?: Partial<IdentityComponent>) {
    this.name = data?.name || 'Unnamed Fighter';
    this.level = data?.level || 1;
    this.xp = data?.xp || 0;
    this.xpToNextLevel = data?.xpToNextLevel || this.calculateXpForLevel(2);
    this.avatarUrl = data?.avatarUrl;
    this.owner = data?.owner;
    this.created = data?.created || new Date();
    this.lastModified = data?.lastModified || new Date();
  }
  
  /**
   * Calculate XP required for a specific level
   */
  public calculateXpForLevel(targetLevel: number): number {
    // Simple quadratic formula: 100 * level^2
    return 100 * targetLevel * targetLevel;
  }
  
  /**
   * Add XP to the entity and level up if enough XP accumulated
   * Returns true if level up occurred
   */
  public addXp(amount: number): boolean {
    this.xp += amount;
    this.lastModified = new Date();
    
    // Check if we have enough XP to level up
    if (this.xp >= this.xpToNextLevel) {
      this.level++;
      this.xpToNextLevel = this.calculateXpForLevel(this.level + 1);
      return true;
    }
    
    return false;
  }
  
  /**
   * Get the progress percentage toward the next level
   */
  public getLevelProgress(): number {
    const currentLevelXp = this.calculateXpForLevel(this.level);
    const nextLevelXp = this.xpToNextLevel;
    
    const xpInCurrentLevel = this.xp - currentLevelXp;
    const xpRequiredForNextLevel = nextLevelXp - currentLevelXp;
    
    return Math.min(100, Math.floor((xpInCurrentLevel / xpRequiredForNextLevel) * 100));
  }
}

export default IdentityComponent;

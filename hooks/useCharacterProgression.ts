import { useState, useEffect } from 'react';
import { Fighter } from '../types/fighter';
import { ICharacter } from '../types/characterProgression';
import { createCharacterFromFighter, applyCharacterStatsToFighter } from '../utils/characterProgressionIntegration';

/**
 * Hook to manage character progression for a fighter
 * Handles experience gain, leveling up, and stat allocation
 * 
 * @param initialFighter - The fighter to create progression for
 * @returns Object containing character, fighter, and management functions
 */
export default function useCharacterProgression(initialFighter: Fighter) {
  const [fighter, setFighter] = useState<Fighter>(initialFighter);
  const [character, setCharacter] = useState<ICharacter | null>(null);
  const [isLevelingUp, setIsLevelingUp] = useState<boolean>(false);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [justLeveled, setJustLeveled] = useState<boolean>(false);
  
  // Initialize character from fighter
  useEffect(() => {
    const char = createCharacterFromFighter(fighter);
    if (char) {
      setCharacter(char);
    }
  }, []);
  
  /**
   * Add experience points to the character
   * @param amount - Amount of XP to add
   * @returns True if leveled up, false otherwise
   */
  const gainExperience = (amount: number): boolean => {
    if (!character) return false;
    
    // Create a new character object to avoid mutation
    const updatedCharacter = { ...character };
    
    // Add XP and check if leveled up
    const didLevelUp = updatedCharacter.gainXp(amount);
    
    // Update character state
    setCharacter(updatedCharacter);
    
    // If leveled up, show animation and update fighter
    if (didLevelUp) {
      setJustLeveled(true);
      setShowAnimation(true);
      
      // Update fighter with new stats
      const updatedFighter = applyCharacterStatsToFighter(fighter, updatedCharacter);
      setFighter(updatedFighter);
    } else {
      // Just update XP in fighter
      const updatedFighter = { ...fighter, experience: updatedCharacter.experience };
      setFighter(updatedFighter);
    }
    
    return didLevelUp;
  };
  
  /**
   * Allocate stat points
   * @param stat - Which stat to allocate points to
   * @param points - Number of points to allocate
   * @returns True if successful
   */
  const allocateStat = (
    stat: 'strength' | 'agility' | 'intelligence', 
    points: number
  ): boolean => {
    if (!character) return false;
    
    // Create a new character object to avoid mutation
    const updatedCharacter = { ...character };
    
    // Allocate the points
    const success = updatedCharacter.allocateStat(stat, points);
    
    if (success) {
      // Update character state
      setCharacter(updatedCharacter);
      
      // Update fighter with new stats
      const updatedFighter = applyCharacterStatsToFighter(fighter, updatedCharacter);
      setFighter(updatedFighter);
    }
    
    return success;
  };
  
  /**
   * Save character changes after level up
   */
  const handleLevelUpComplete = (updatedCharacter: ICharacter) => {
    setCharacter(updatedCharacter);
    
    // Update fighter with new stats
    const updatedFighter = applyCharacterStatsToFighter(fighter, updatedCharacter);
    setFighter(updatedFighter);
    
    setIsLevelingUp(false);
    setJustLeveled(false);
  };
  
  /**
   * Close level up UI without saving changes
   */
  const cancelLevelUp = () => {
    setIsLevelingUp(false);
    setJustLeveled(false);
  };
  
  /**
   * Handler when animation completes
   */
  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setIsLevelingUp(true);
  };
  
  return {
    fighter,
    character,
    gainExperience,
    allocateStat,
    isLevelingUp,
    showAnimation,
    justLeveled,
    handleLevelUpComplete,
    cancelLevelUp,
    handleAnimationComplete
  };
}

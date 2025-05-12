import React, { useState } from 'react';
import { ICharacter } from '../../types/characterProgression';

interface LevelUpModalProps {
  character: ICharacter;
  onClose: () => void;
  onSave: (character: ICharacter) => void;
  isOpen: boolean;
}

/**
 * Modal component shown when a character levels up
 * Allows players to allocate stat points
 */
const LevelUpModal: React.FC<LevelUpModalProps> = ({
  character,
  onClose,
  onSave,
  isOpen
}) => {
  // Create a working copy of the character
  const [workingCharacter, setWorkingCharacter] = useState<ICharacter>({...character});
  
  // Keep track of allocated points
  const [strengthPoints, setStrengthPoints] = useState<number>(0);
  const [agilityPoints, setAgilityPoints] = useState<number>(0);
  const [intelligencePoints, setIntelligencePoints] = useState<number>(0);
  
  // Count total allocated points
  const totalAllocated = strengthPoints + agilityPoints + intelligencePoints;
  const remainingPoints = workingCharacter.freePoints - totalAllocated;
  
  // Handle increasing a stat
  const handleIncreaseStat = (stat: 'strength' | 'agility' | 'intelligence') => {
    if (remainingPoints <= 0) return;
    
    switch(stat) {
      case 'strength':
        setStrengthPoints(strengthPoints + 1);
        break;
      case 'agility':
        setAgilityPoints(agilityPoints + 1);
        break;
      case 'intelligence':
        setIntelligencePoints(intelligencePoints + 1);
        break;
    }
  };
  
  // Handle decreasing a stat
  const handleDecreaseStat = (stat: 'strength' | 'agility' | 'intelligence') => {
    switch(stat) {
      case 'strength':
        if (strengthPoints > 0) setStrengthPoints(strengthPoints - 1);
        break;
      case 'agility':
        if (agilityPoints > 0) setAgilityPoints(agilityPoints - 1);
        break;
      case 'intelligence':
        if (intelligencePoints > 0) setIntelligencePoints(intelligencePoints - 1);
        break;
    }
  };
  
  // Apply the stat changes and save
  const handleSave = () => {
    if (strengthPoints > 0) {
      character.allocateStat('strength', strengthPoints);
    }
    
    if (agilityPoints > 0) {
      character.allocateStat('agility', agilityPoints);
    }
    
    if (intelligencePoints > 0) {
      character.allocateStat('intelligence', intelligencePoints);
    }
    
    onSave(character);
    onClose();
  };
  
  // Get newly unlocked abilities at this level
  const newlyUnlockedAbilities = character.abilities.filter(
    ability => ability.unlockLevel === character.level
  );
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">Level Up!</h2>
          <span className="text-xl font-bold bg-yellow-500 text-yellow-900 w-10 h-10 flex items-center justify-center rounded-full">
            {character.level}
          </span>
        </div>
        
        {/* Character info summary */}
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <p className="text-white">
            <span className="font-semibold">{character.name}</span> ({character.class}) has reached level {character.level}!
          </p>
        </div>
        
        {/* New abilities unlocked */}
        {newlyUnlockedAbilities.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-2">New Abilities Unlocked!</h3>
            {newlyUnlockedAbilities.map(ability => (
              <div key={ability.id} className="bg-gray-700 p-3 rounded mb-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-white">{ability.name}</span>
                  <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                    {ability.type}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{ability.description}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Stat allocation */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">Allocate Stat Points</h3>
          <p className="text-sm text-gray-300 mb-3">
            You have <span className="font-bold text-yellow-400">{remainingPoints}</span> points to allocate.
          </p>
          
          {/* Strength */}
          <div className="flex items-center justify-between bg-gray-700 p-3 rounded mb-2">
            <span className="text-white">Strength</span>
            <div className="flex items-center">
              <span className="mx-3 text-white">
                {character.stats.strength} + {strengthPoints}
              </span>
              <div>
                <button 
                  onClick={() => handleDecreaseStat('strength')}
                  disabled={strengthPoints <= 0}
                  className={`px-2 py-1 mr-1 rounded ${strengthPoints <= 0 ? 'bg-gray-600 text-gray-500' : 'bg-red-800 text-white'}`}
                >
                  -
                </button>
                <button
                  onClick={() => handleIncreaseStat('strength')}
                  disabled={remainingPoints <= 0}
                  className={`px-2 py-1 rounded ${remainingPoints <= 0 ? 'bg-gray-600 text-gray-500' : 'bg-green-800 text-white'}`}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          {/* Agility */}
          <div className="flex items-center justify-between bg-gray-700 p-3 rounded mb-2">
            <span className="text-white">Agility</span>
            <div className="flex items-center">
              <span className="mx-3 text-white">
                {character.stats.agility} + {agilityPoints}
              </span>
              <div>
                <button 
                  onClick={() => handleDecreaseStat('agility')}
                  disabled={agilityPoints <= 0}
                  className={`px-2 py-1 mr-1 rounded ${agilityPoints <= 0 ? 'bg-gray-600 text-gray-500' : 'bg-red-800 text-white'}`}
                >
                  -
                </button>
                <button
                  onClick={() => handleIncreaseStat('agility')}
                  disabled={remainingPoints <= 0}
                  className={`px-2 py-1 rounded ${remainingPoints <= 0 ? 'bg-gray-600 text-gray-500' : 'bg-green-800 text-white'}`}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          {/* Intelligence */}
          <div className="flex items-center justify-between bg-gray-700 p-3 rounded mb-2">
            <span className="text-white">Intelligence</span>
            <div className="flex items-center">
              <span className="mx-3 text-white">
                {character.stats.intelligence} + {intelligencePoints}
              </span>
              <div>
                <button 
                  onClick={() => handleDecreaseStat('intelligence')}
                  disabled={intelligencePoints <= 0}
                  className={`px-2 py-1 mr-1 rounded ${intelligencePoints <= 0 ? 'bg-gray-600 text-gray-500' : 'bg-red-800 text-white'}`}
                >
                  -
                </button>
                <button
                  onClick={() => handleIncreaseStat('intelligence')}
                  disabled={remainingPoints <= 0}
                  className={`px-2 py-1 rounded ${remainingPoints <= 0 ? 'bg-gray-600 text-gray-500' : 'bg-green-800 text-white'}`}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;

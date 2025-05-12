import React from 'react';
import { getFighterDesignByAddress } from '../../utils/fighterDesigns';
import FighterCard from './FighterCard';
import SpecialMoveCard from './SpecialMoveCard';
import { Fighter } from '../../types/fighter';
import { getFighterSpritePath, getFighterSpecialAbilities } from '../../utils/characterProgressionIntegration';

interface FighterProfileProps {
  fighter: Fighter; // Changed from address to full fighter object
  isGuest: boolean;
  onFindOpponent: () => void;
  isLoading: boolean;
}

const FighterProfile: React.FC<FighterProfileProps> = ({ 
  fighter, 
  isGuest, 
  onFindOpponent, 
  isLoading 
}) => {
  const fighterDesign = getFighterDesignByAddress(fighter.address);
  const address = fighter.address; // For backward compatibility
  
  // Get progression abilities if available
  const progressionAbilities = fighter.progression?.characterAbilities || [];
  const unlockedAbilities = progressionAbilities.filter(ability => ability.isUnlocked);
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8">
      <h3 className="text-2xl font-bold mb-4 text-purple-400">Your Fighter</h3>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <FighterCard 
            address={address}
            isGuest={isGuest}
            design={fighterDesign}
            showStats={true}
          />
          
          {/* Fighter Level & Progression */}
          <div className="mt-4 p-3 bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Level</span>
              <span className="text-xl font-bold text-yellow-400">{fighter.level}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">XP</span>
              <span className="text-xs text-gray-300">{fighter.experience} / {fighter.level * 100}</span>
            </div>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500"
                style={{ 
                  width: `${Math.min(100, (fighter.experience / (fighter.level * 100)) * 100)}%` 
                }}
              />
            </div>
            
            {fighter.progression?.unallocatedStatPoints > 0 && (
              <div className="mt-3 bg-yellow-800 bg-opacity-20 p-2 rounded text-center">
                <span className="text-yellow-400 font-semibold">
                  {fighter.progression.unallocatedStatPoints} stat points available!
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full md:w-2/3">
          <div className="bg-gray-700 rounded-lg p-4 h-full">
            <div className="mb-4">
              <h4 className="font-bold mb-2 text-purple-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Special Moves
              </h4>
              
              <div className="space-y-3 mt-4">
                {fighterDesign.specialMoves.map((move, index) => (
                  <SpecialMoveCard
                    key={index}
                    name={move.name}
                    description={move.description}
                    damage={move.damage}
                    cooldown={move.cooldown}
                  />
                ))}
              </div>
            </div>
            
            {/* Character Abilities from Progression System */}
            {unlockedAbilities.length > 0 && (
              <div className="mt-6">
                <h4 className="font-bold mb-2 text-blue-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                  </svg>
                  Class Abilities
                </h4>
                
                <div className="space-y-3 mt-4">
                  {unlockedAbilities.map((ability) => (
                    <div key={ability.id} className="bg-gray-800 p-3 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-white">{ability.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          ability.type === 'active' ? 'bg-blue-600' : 
                          ability.type === 'passive' ? 'bg-green-600' : 'bg-purple-600'
                        }`}>
                          {ability.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{ability.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <button 
                className="kaspa-button w-full"
                onClick={onFindOpponent}
                disabled={isLoading}
              >
                Find Opponent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FighterProfile;

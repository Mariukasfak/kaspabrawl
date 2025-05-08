import React from 'react';
import { getFighterDesignByAddress } from '../../utils/fighterDesigns';
import FighterCard from './FighterCard';
import SpecialMoveCard from './SpecialMoveCard';

interface FighterProfileProps {
  address: string;
  isGuest: boolean;
  onFindOpponent: () => void;
  isLoading: boolean;
}

const FighterProfile: React.FC<FighterProfileProps> = ({ 
  address, 
  isGuest, 
  onFindOpponent, 
  isLoading 
}) => {
  const fighterDesign = getFighterDesignByAddress(address);
  
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
        </div>
        
        <div className="w-full md:w-2/3">
          <div className="bg-gray-700 rounded-lg p-4 h-full">
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

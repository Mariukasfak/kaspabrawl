import React from 'react';
import { FighterDesign } from '../../utils/fighterDesigns';

interface FighterCardProps {
  address: string;
  isGuest?: boolean;
  design?: FighterDesign;
  isWinner?: boolean;
  showStats?: boolean;
}

const FighterCard: React.FC<FighterCardProps> = ({ 
  address, 
  isGuest = false, 
  design, 
  isWinner = false,
  showStats = false
}) => {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full relative">
      {isWinner && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-lg">
          <span className="text-sm">👑</span>
        </div>
      )}
      
      <div className="aspect-square bg-gray-700 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-50"></div>
        {design ? (
          <div className="h-full w-full flex items-center justify-center">
            <img 
              src={`/assets/fighters/${design.name}/${design.name === 'ranged' ? 'archer' : design.name}1.png`}
              alt={design.name}
              className="max-h-full max-w-full object-contain z-10"
              onError={(e) => {
                // Fallback to emoji if image fails to load
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const emoji = document.createElement('span');
                  emoji.className = 'text-6xl z-10';
                  emoji.textContent = design.emoji;
                  parent.appendChild(emoji);
                }
              }}
            />
          </div>
        ) : (
          <span className="text-6xl z-10">👤</span>
        )}
        
        {/* Special effects for winner */}
        {isWinner && (
          <div className="absolute inset-0 bg-yellow-500 opacity-10 animate-pulse"></div>
        )}
      </div>
      
      <div className="text-center">
        <p className="font-bold flex items-center justify-center">
          {isGuest && (
            <span className="bg-yellow-800 px-1.5 py-0.5 rounded text-xs mr-1 text-white">GUEST</span>
          )}
          <span>{formatAddress(address)}</span>
        </p>
        
        {design && (
          <p className="text-sm text-purple-400 mt-1">
            {design.name === 'fighter' ? 'Fighter' : 
             design.name === 'ranged' ? 'Ranger' : 
             design.name === 'mage' ? 'Mage' : design.name}
          </p>
        )}
        
        {design && showStats && (
          <div className="mt-3 space-y-2">
            <div>
              <div className="flex justify-between text-xs">
                <span>STR</span>
                <span>{design.baseStats.strength}</span>
              </div>
              <div className="w-full bg-gray-600 h-1.5 rounded-full">
                <div 
                  className="bg-red-500 h-1.5 rounded-full" 
                  style={{ width: `${design.baseStats.strength * 10}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs">
                <span>AGI</span>
                <span>{design.baseStats.agility}</span>
              </div>
              <div className="w-full bg-gray-600 h-1.5 rounded-full">
                <div 
                  className="bg-green-500 h-1.5 rounded-full" 
                  style={{ width: `${design.baseStats.agility * 10}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs">
                <span>VIT</span>
                <span>{design.baseStats.vitality}</span>
              </div>
              <div className="w-full bg-gray-600 h-1.5 rounded-full">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full" 
                  style={{ width: `${design.baseStats.vitality * 10}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs">
                <span>DEF</span>
                <span>{design.baseStats.defense}</span>
              </div>
              <div className="w-full bg-gray-600 h-1.5 rounded-full">
                <div 
                  className="bg-yellow-500 h-1.5 rounded-full" 
                  style={{ width: `${design.baseStats.defense * 10}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FighterCard;

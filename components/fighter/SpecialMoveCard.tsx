import React from 'react';

interface SpecialMoveProps {
  name: string;
  description: string;
  damage: number;
  cooldown: number;
}

const SpecialMoveCard: React.FC<SpecialMoveProps> = ({ 
  name, 
  description, 
  damage, 
  cooldown 
}) => {
  return (
    <div className="bg-gray-700 rounded-lg p-3 border border-gray-600 hover:border-purple-500 transition-all">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-purple-400">{name}</h4>
        {damage > 0 ? (
          <span className="bg-red-900 text-white text-xs px-2 py-1 rounded">
            {damage} DMG
          </span>
        ) : (
          <span className="bg-blue-900 text-white text-xs px-2 py-1 rounded">
            BUFF
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-300 mt-1">{description}</p>
      
      <div className="flex items-center mt-2 text-xs text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{cooldown} turn cooldown</span>
      </div>
    </div>
  );
};

export default SpecialMoveCard;

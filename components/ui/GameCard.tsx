import React from 'react';
import Image from 'next/image';

type GameCardProps = {
  title: string;
  description: string;
  imagePath: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  onClick?: () => void;
};

const rarityStyles = {
  common: 'border-gray-400 bg-gray-100',
  uncommon: 'border-green-400 bg-green-50',
  rare: 'border-blue-400 bg-blue-50',
  epic: 'border-purple-400 bg-purple-50',
  legendary: 'border-yellow-400 bg-yellow-50 animate-pulse-fast',
};

/**
 * GameCard component for displaying fighters, equipment, and abilities
 */
export const GameCard = ({
  title,
  description,
  imagePath,
  rarity = 'common',
  onClick,
}: GameCardProps) => {
  return (
    <div 
      className={`rounded-lg overflow-hidden shadow-lg border-2 ${rarityStyles[rarity]} transition-all duration-300 hover:scale-105 cursor-pointer`}
      onClick={onClick}
    >
      <div className="relative h-48 w-full">
        <Image
          src={imagePath}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-700 text-sm">{description}</p>
      </div>
    </div>
  );
};

export default GameCard;

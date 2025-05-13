import React from 'react';
import { Fighter } from '../../types/fighter';
import { getFighterSpecialAbilities } from '../../utils/characterProgressionIntegration';
import { getFighterSpritePath } from '../../utils/fighterSpriteHelper';
import { SpecialAbility, AbilityType } from '../../types/characterAbilities';

interface FighterProgressionCardProps {
  fighter: Fighter;
  showAbilities?: boolean;
}

/**
 * Component to display fighter with character progression details
 * Shows level, stats, and abilities based on the character progression system
 */
const FighterProgressionCard: React.FC<FighterProgressionCardProps> = ({ 
  fighter, 
  showAbilities = true
}) => {
  const spritePath = getFighterSpritePath(fighter.class, fighter.level);
  const abilities = showAbilities ? getFighterSpecialAbilities(fighter) : [];
  
  // Get ability icon based on type
  const getAbilityIcon = (type: AbilityType) => {
    switch (type) {
      case 'active':
        return '⚔️';
      case 'passive':
        return '🛡️';
      case 'ultimate':
        return '💥';
      default:
        return '✨';
    }
  };
  
  // Get style for the ability type
  const getAbilityTypeStyle = (type: AbilityType) => {
    switch (type) {
      case 'active':
        return 'bg-blue-600';
      case 'passive':
        return 'bg-green-600';
      case 'ultimate':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <div className="p-4 bg-gray-900">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden mr-4 border-2 border-gray-600">
            <img 
              src={spritePath} 
              alt={`${fighter.name} - Level ${fighter.level}`} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{fighter.name}</h3>
            <div className="flex items-center gap-2">
              <span className="bg-yellow-600 text-yellow-100 px-2 py-0.5 rounded text-xs">
                {fighter.class === 'fighter' ? 'Fighter' : 
                 fighter.class === 'ranged' ? 'Ranger' : 
                 fighter.class === 'mage' ? 'Mage' : fighter.class}
              </span>
              <span className="bg-blue-600 text-blue-100 px-2 py-0.5 rounded text-xs">
                Level {fighter.level}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="p-4 border-t border-gray-700">
        <h4 className="text-sm uppercase text-gray-400 font-semibold mb-2">Stats</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="flex justify-between text-sm">
              <span className="text-gray-400">Strength:</span>
              <span className="text-white">{fighter.baseStats.strength}</span>
            </p>
            <p className="flex justify-between text-sm">
              <span className="text-gray-400">Agility:</span>
              <span className="text-white">{fighter.baseStats.agility}</span>
            </p>
            <p className="flex justify-between text-sm">
              <span className="text-gray-400">Intelligence:</span>
              <span className="text-white">{fighter.baseStats.intelligence}</span>
            </p>
          </div>
          <div>
            <p className="flex justify-between text-sm">
              <span className="text-gray-400">HP:</span>
              <span className="text-white">{fighter.maxHp}</span>
            </p>
            <p className="flex justify-between text-sm">
              <span className="text-gray-400">Defense:</span>
              <span className="text-white">{fighter.baseStats.defense}</span>
            </p>
            <p className="flex justify-between text-sm">
              <span className="text-gray-400">Crit:</span>
              <span className="text-white">{fighter.baseStats.critChance}%</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Abilities */}
      {showAbilities && abilities.length > 0 && (
        <div className="p-4 border-t border-gray-700">
          <h4 className="text-sm uppercase text-gray-400 font-semibold mb-2">Abilities</h4>
          <div className="space-y-2">
            {abilities.map((ability: SpecialAbility) => (
              <div key={ability.id} className="bg-gray-700 rounded p-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg" aria-hidden="true">
                    {getAbilityIcon(ability.type)}
                  </span>
                  <span className="font-semibold text-white">{ability.name}</span>
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${getAbilityTypeStyle(ability.type)} text-white`}>
                    {ability.type}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{ability.description}</p>
                {ability.cooldown && (
                  <p className="text-xs text-gray-400 mt-1">
                    Cooldown: {ability.cooldown} turns
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience Bar */}
      <div className="px-4 pb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>XP</span>
          <span>{fighter.experience} / {fighter.level * 100}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full" 
            style={{ width: `${Math.min(100, (fighter.experience / (fighter.level * 100)) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default FighterProgressionCard;

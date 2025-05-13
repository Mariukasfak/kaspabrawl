import React from 'react';
import { FighterClass } from '../../types/fighter';
import { getFighterSpritePath } from '../../utils/fighterSpriteHelper';

interface FighterSpriteShowcaseProps {
  // Optional props
}

/**
 * Component that showcases the different sprites for each fighter class and level
 */
const FighterSpriteShowcase: React.FC<FighterSpriteShowcaseProps> = () => {
  // All fighter classes
  const fighterClasses: FighterClass[] = ['fighter', 'ranged', 'mage'];
  
  // Level thresholds for sprite changes
  const levelThresholds = [1, 5, 10, 15, 95, 100];
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Fighter Sprite Showcase</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {fighterClasses.map(fighterClass => (
          <div key={fighterClass} className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4 text-center">
              {fighterClass === 'fighter' ? 'Fighter' : 
               fighterClass === 'ranged' ? 'Ranger (Archer)' : 'Mage'}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {levelThresholds.map(level => (
                <div key={`${fighterClass}-${level}`} className="bg-gray-700 rounded p-2">
                  <div className="aspect-square relative overflow-hidden flex items-center justify-center mb-2">
                    <img
                      src={getFighterSpritePath(fighterClass, level)}
                      alt={`${fighterClass} level ${level}`}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.opacity = '0.3';
                        e.currentTarget.parentElement?.classList.add('bg-red-900/30');
                      }}
                    />
                  </div>
                  <p className="text-xs text-center">Level {level}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-bold mb-2">Sprite File Naming</h3>
        <p className="mb-4">Fighter sprites follow these naming conventions:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><code className="bg-gray-700 px-1 rounded">fighter{'{level}'}.png</code> - For Fighter class</li>
          <li><code className="bg-gray-700 px-1 rounded">archer{'{level}'}.png</code> - For Ranged class</li>
          <li><code className="bg-gray-700 px-1 rounded">mage{'{level}'}.png</code> - For Mage class</li>
        </ul>
        <p className="mt-4 text-yellow-400">Note: Replace missing sprite files in <code className="bg-gray-700 px-1 rounded">/public/assets/fighters/</code> directory.</p>
      </div>
    </div>
  );
};

export default FighterSpriteShowcase;

import React, { useState, useEffect } from 'react';
import { ICharacter } from '../../types/characterProgression';

interface LevelUpAnimationProps {
  character: ICharacter;
  onComplete: () => void;
}

/**
 * Animation component shown when a character levels up
 * Displays fancy effects and animations before showing the level-up modal
 */
const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({
  character,
  onComplete
}) => {
  const [animationStep, setAnimationStep] = useState(0);
  
  // Effect to handle the animation sequence
  useEffect(() => {
    const steps = [
      { delay: 500 },  // Initial pause
      { delay: 1500 }, // Show glow
      { delay: 1000 }, // Show level number
      { delay: 1000 }, // Show stat increases
      { delay: 1500 }  // Final celebration
    ];
    
    // If we haven't completed all steps
    if (animationStep < steps.length) {
      const timer = setTimeout(() => {
        setAnimationStep(animationStep + 1);
      }, steps[animationStep].delay);
      
      return () => clearTimeout(timer);
    } else {
      // Animation complete
      onComplete();
    }
  }, [animationStep, onComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="relative w-full max-w-lg h-80 flex flex-col items-center justify-center">
        {/* Character Sprite */}
        <div className={`mb-8 relative ${animationStep >= 1 ? 'animate-pulse' : ''}`}>
          <div className={`w-32 h-32 rounded-full bg-gray-800 overflow-hidden relative ${
            animationStep >= 1 ? 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50' : ''
          }`}>
            <img 
              src={`/assets/fighters/${character.getSpriteUrl()}`} 
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Glow effect */}
          {animationStep >= 1 && (
            <div className="absolute inset-0 bg-gradient-radial from-yellow-400 to-transparent opacity-50 animate-pulse"></div>
          )}
          
          {/* Particles */}
          {animationStep >= 1 && Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        {/* Level Up Text */}
        <div className={`text-center transition-all duration-500 ${
          animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}>
          <h2 className="text-4xl font-bold text-yellow-400 tracking-wider mb-2">LEVEL UP!</h2>
          
          {/* Level number */}
          {animationStep >= 2 && (
            <div className="flex justify-center items-center mb-4">
              <div className="text-2xl font-bold text-white mr-3">
                {character.level - 1}
              </div>
              <div className="text-2xl font-bold text-white">→</div>
              <div className="ml-3 text-4xl font-bold text-yellow-400 animate-bounce">
                {character.level}
              </div>
            </div>
          )}
          
          {/* Stat increases */}
          {animationStep >= 3 && (
            <div className="flex justify-center gap-6 text-white">
              {character.class === 'Fighter' && (
                <div className="flex flex-col items-center">
                  <span className="text-sm">Strength</span>
                  <span className="text-xl text-red-400">+1</span>
                </div>
              )}
              
              {character.class === 'Mage' && (
                <div className="flex flex-col items-center">
                  <span className="text-sm">Intelligence</span>
                  <span className="text-xl text-blue-400">+1</span>
                </div>
              )}
              
              {character.class === 'Ranger' && (
                <div className="flex flex-col items-center">
                  <span className="text-sm">Agility</span>
                  <span className="text-xl text-green-400">+1</span>
                </div>
              )}
              
              <div className="flex flex-col items-center">
                <span className="text-sm">Stat Points</span>
                <span className="text-xl text-yellow-400">+3</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Final celebration */}
        {animationStep >= 4 && (
          <div className="mt-6 animate-fade-in">
            <h3 className="text-lg text-white text-center">
              {character.name} has grown stronger!
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelUpAnimation;

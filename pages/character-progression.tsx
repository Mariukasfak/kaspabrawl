import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import FighterProgressionCard from '../components/fighter/FighterProgressionCard';
import LevelUpModal from '../components/fighter/LevelUpModal';
import LevelUpAnimation from '../components/fighter/LevelUpAnimation';
import useCharacterProgression from '../hooks/useCharacterProgression';
import { createCharacter } from '../types/characterProgression';
import { Fighter, FighterClass } from '../types/fighter';
import { v4 as uuidv4 } from 'uuid';

// Helper to create a mock fighter for demo purposes
function createMockFighter(fighterClass: FighterClass, level: number = 1): Fighter {
  return {
    id: uuidv4(),
    address: `0x${Math.random().toString(16).slice(2, 10)}`,
    name: `Demo ${fighterClass}`,
    level,
    experience: level * 50,
    class: fighterClass,
    baseStats: {
      strength: 5 + level,
      agility: 5 + level,
      intelligence: 5 + level,
      vitality: 10 + level,
      critChance: 5,
      defense: 5
    },
    currentHp: 100 + level * 10,
    maxHp: 100 + level * 10,
    energy: 100,
    maxEnergy: 100,
    equipment: {
      head: null,
      chest: null,
      legs: null,
      weapon: null
    },
    skills: [],
    statusEffects: [],
    wins: 0,
    losses: 0,
    draws: 0
  };
}

/**
 * Character Progression Demo Page
 */
export default function CharacterProgressionDemo() {
  // Create mock fighters for demo
  const [fighterClass, setFighterClass] = useState<FighterClass>('Warrior');
  
  // Create initial fighter and progression
  const initialFighter = createMockFighter(fighterClass);
  const {
    fighter,
    character,
    gainExperience,
    isLevelingUp,
    showAnimation,
    handleLevelUpComplete,
    cancelLevelUp,
    handleAnimationComplete
  } = useCharacterProgression(initialFighter);
  
  // XP to add for demo
  const [xpAmount, setXpAmount] = useState<number>(50);
  
  // Handle XP gain from the UI
  const handleAddXp = () => {
    if (character) {
      gainExperience(xpAmount);
    }
  };
  
  // Handle changing the fighter class for demo
  const handleChangeClass = (newClass: FighterClass) => {
    setFighterClass(newClass);
    window.location.reload(); // Simple refresh to reset the demo
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Character Progression Demo</h1>
        
        {/* Class selection */}
        <div className="mb-8 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Select Character Class</h2>
          <div className="flex flex-wrap gap-3">
            {(['Warrior', 'Mage', 'Ranger'] as FighterClass[]).map((cls) => (
              <button
                key={cls}
                onClick={() => handleChangeClass(cls)}
                className={`px-4 py-2 rounded ${
                  fighterClass === cls 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
        
        {/* Character card and XP controls */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Character card */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Character</h2>
            <FighterProgressionCard fighter={fighter} />
          </div>
          
          {/* XP controls */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Add Experience</h2>
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  XP Amount
                </label>
                <input
                  type="number"
                  min="1"
                  value={xpAmount}
                  onChange={(e) => setXpAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                onClick={handleAddXp}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-medium"
              >
                Add Experience Points
              </button>
              
              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setXpAmount(50)}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded"
                >
                  +50 XP
                </button>
                <button
                  onClick={() => setXpAmount(100)}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded"
                >
                  +100 XP
                </button>
                <button
                  onClick={() => setXpAmount(200)}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded"
                >
                  +200 XP
                </button>
                <button
                  onClick={() => setXpAmount(500)}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded"
                >
                  +500 XP
                </button>
              </div>
            </div>
            
            {/* Character progression info */}
            {character && (
              <div className="mt-6 bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Progression Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level:</span>
                    <span className="font-medium">{character.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">XP:</span>
                    <span className="font-medium">
                      {character.experience}/{character.experienceToNextLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Free Points:</span>
                    <span className="font-medium">{character.freePoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Abilities:</span>
                    <span className="font-medium">
                      {character.abilities.filter(a => a.isUnlocked).length}/{character.abilities.length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Level-up animation */}
      {showAnimation && character && (
        <LevelUpAnimation
          character={character}
          onComplete={handleAnimationComplete}
        />
      )}
      
      {/* Level-up modal */}
      {isLevelingUp && character && (
        <LevelUpModal
          character={character}
          onClose={cancelLevelUp}
          onSave={handleLevelUpComplete}
          isOpen={isLevelingUp}
        />
      )}
    </Layout>
  );
}

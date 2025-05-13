/**
 * Character Creation Component
 * Allows users to create a new fighter by selecting class and entering a name
 */
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FighterClass } from '../../types/fighter';
import { getSpriteClass } from '../../utils/fighterSpriteHelper';
import { useKaspaWalletAuth } from '../blockchain/KaspaWalletAuth';
import { SaveSystem } from '../../utils/saveSystem';
import { v4 as uuidv4 } from 'uuid';

// Class card component for displaying fighter class options
const ClassCard: React.FC<{
  className: FighterClass;
  displayName: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}> = ({ className, displayName, description, selected, onSelect }) => {
  const spriteClass = getSpriteClass(className);
  const imagePath = `/assets/fighters/${className}/${spriteClass}1.png`;
  
  return (
    <div 
      className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all ${
        selected ? 'border-purple-500 bg-gray-700 shadow-md scale-105' : 'border-gray-600 hover:border-gray-500 bg-gray-800'
      }`} 
      onClick={onSelect}
    >
      <div className="w-24 h-24 flex items-center justify-center mb-2">
        <img src={imagePath} alt={displayName} className="object-contain max-h-full" />
      </div>
      <h3 className="text-xl font-bold mb-1 text-white">{displayName}</h3>
      <p className="text-center text-gray-300 text-sm">{description}</p>
    </div>
  );
};

/**
 * Character Creation Component
 */
export const CharacterCreation: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<FighterClass | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { isAuthenticated, walletAddress, registerFighter } = useKaspaWalletAuth();
  const router = useRouter();
  
  // Class options configuration
  const classOptions: {
    className: FighterClass;
    displayName: string;
    description: string;
    baseStats: any;
  }[] = [
    {
      className: 'fighter',
      displayName: 'Fighter',
      description: 'Strong melee warrior with high strength and defense.',
      baseStats: {
        strength: 10,
        agility: 6,
        intelligence: 4,
        vitality: 10,
        defense: 8,
        critChance: 5,
        critDamage: 150,
        blockRate: 10,
        magicFind: 0
      }
    },
    {
      className: 'ranged',
      displayName: 'Archer',
      description: 'Skilled ranged fighter with high agility and precision.',
      baseStats: {
        strength: 5,
        agility: 10,
        intelligence: 6,
        vitality: 7,
        defense: 4,
        critChance: 8,
        critDamage: 175,
        blockRate: 5,
        magicFind: 5
      }
    },
    {
      className: 'mage',
      displayName: 'Mage',
      description: 'Powerful spellcaster with high intelligence and magical abilities.',
      baseStats: {
        strength: 3,
        agility: 6,
        intelligence: 12,
        vitality: 6,
        defense: 3,
        critChance: 7,
        critDamage: 200,
        blockRate: 3,
        magicFind: 10
      }
    }
  ];
  
  // Handle class selection
  const handleClassSelect = (fighterClass: FighterClass) => {
    setSelectedClass(fighterClass);
  };
  
  // Create new character
  const createCharacter = async () => {
    if (!selectedClass || !characterName.trim()) {
      window.alert('Please select a class and enter a name');
      return;
    }
    
    setIsCreating(true);
    
    try {
      const selectedClassData = classOptions.find(c => c.className === selectedClass);
      if (!selectedClassData) {
        throw new Error('Invalid class selected');
      }
      
      // Create new fighter
      const fighter = {
        id: uuidv4(),
        address: walletAddress || `guest-${uuidv4().slice(0, 8)}`,
        name: characterName.trim(),
        class: selectedClass,
        level: 1,
        experience: 0,
        baseStats: { ...selectedClassData.baseStats },
        currentHp: 100,
        maxHp: 100,
        energy: 100,
        maxEnergy: 100,
        equipment: {
          head: undefined,
          chest: undefined,
          legs: undefined,
          weapon: undefined
        },
        skills: [],
        statusEffects: [],
        progression: {
          unallocatedStatPoints: 0,
          characterAbilities: []
        },
        wins: 0,
        losses: 0,
        draws: 0
      };
      
      let success = true;
      if (isAuthenticated && walletAddress) {
        // Register with wallet - this registers with blockchain
        success = await registerFighter(fighter);
        
        // Also save to our game database
        await SaveSystem.saveFighter(fighter, true, walletAddress);
      } else {
        // Save to local storage for guest players
        await SaveSystem.saveFighter(fighter, false);
      }
      
      if (success) {
        // Redirect to home page
        router.push('/');
      }
    } catch (error) {
      console.error('Error creating character:', error);
      // More specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('wallet')) {
          window.alert('Failed to register fighter with wallet. Please check your wallet connection and try again.');
        } else if (error.message.includes('storage')) {
          window.alert('Failed to save character data to storage. Please check your browser settings and try again.');
        } else {
          window.alert(`Failed to create character: ${error.message}`);
        }
      } else {
        window.alert('Failed to create character. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-purple-400">Create Your Fighter</h1>
      
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2 text-gray-200">Character Name</label>
        <input
          type="text"
          className="border border-gray-600 rounded-lg p-3 w-full bg-gray-800 text-white"
          placeholder="Enter a name for your fighter"
          value={characterName}
          onChange={(e) => setCharacterName(e.target.value)}
          maxLength={20}
        />
      </div>
      
      <h2 className="text-xl font-semibold mb-4 text-gray-200">Choose a Class</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {classOptions.map((option) => (
          <ClassCard
            key={option.className}
            className={option.className}
            displayName={option.displayName}
            description={option.description}
            selected={selectedClass === option.className}
            onSelect={() => handleClassSelect(option.className)}
          />
        ))}
      </div>
      
      {!isAuthenticated && (
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-yellow-400">Playing as Guest</h3>
          <p className="text-yellow-300 mb-2">
            Your character data will be stored in your browser. To save your progress permanently, 
            connect with a KaspaWallet.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
          >
            Connect Wallet
          </button>
        </div>
      )}
      
      <div className="flex justify-center mt-6">
        <button
          onClick={createCharacter}
          disabled={!selectedClass || !characterName.trim() || isCreating}
          className={`px-8 py-3 rounded-lg text-lg font-medium ${
            !selectedClass || !characterName.trim() || isCreating
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isCreating ? 'Creating...' : 'Create Character'}
        </button>
      </div>
    </div>
  );
};

export default CharacterCreation;

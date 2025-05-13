/**
 * Character Management Component
 * Provides functionality to manage fighter characters:
 * - Reset progress/stats
 * - Delete character
 * - View character details
 */
import React, { useState } from 'react';
import { Fighter } from '../../types/fighter';
import { SaveSystem, SaveErrorType } from '../../utils/saveSystem';
import { useKaspaWalletAuth } from '../blockchain/KaspaWalletAuth';

interface CharacterManagementProps {
  fighter: Fighter;
  onFighterUpdate: (updatedFighter: Fighter | null) => void;
  onError: (error: string) => void;
}

const CharacterManagement: React.FC<CharacterManagementProps> = ({ fighter, onFighterUpdate, onError }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState<'delete' | 'reset' | null>(null);
  const { isAuthenticated, walletAddress } = useKaspaWalletAuth();

  // Reset character stats/progress but keep the character
  const handleResetProgress = async () => {
    setShowConfirmation(null);
    setIsResetting(true);
    
    try {
      // Create a reset version of the fighter (level 1, base stats)
      const resetFighter: Fighter = {
        ...fighter,
        level: 1,
        experience: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        baseStats: {
          strength: fighter.class === 'fighter' ? 10 : fighter.class === 'ranged' ? 5 : 3,
          agility: fighter.class === 'ranged' ? 10 : fighter.class === 'fighter' ? 6 : 6,
          intelligence: fighter.class === 'mage' ? 12 : fighter.class === 'ranged' ? 6 : 4,
          vitality: fighter.class === 'fighter' ? 10 : fighter.class === 'ranged' ? 7 : 6,
          defense: fighter.class === 'fighter' ? 8 : fighter.class === 'ranged' ? 4 : 3,
          critChance: fighter.class === 'ranged' ? 8 : fighter.class === 'mage' ? 7 : 5,
          critDamage: fighter.class === 'mage' ? 200 : fighter.class === 'ranged' ? 175 : 150,
          blockRate: fighter.class === 'fighter' ? 10 : fighter.class === 'ranged' ? 5 : 3,
          magicFind: fighter.class === 'mage' ? 10 : fighter.class === 'ranged' ? 5 : 0
        },
        currentHp: 100,
        maxHp: 100,
        energy: 100,
        maxEnergy: 100,
        progression: {
          unallocatedStatPoints: 0,
          characterAbilities: [],
        },
        // Keep equipment for now
      };
      
      // Save the reset fighter
      await SaveSystem.saveFighter(resetFighter, isAuthenticated, walletAddress || undefined);
      
      // Update parent component
      onFighterUpdate(resetFighter);
    } catch (err) {
      if (err instanceof Error) {
        onError(`Failed to reset character: ${err.message}`);
      } else {
        onError('Failed to reset character due to an unknown error');
      }
    } finally {
      setIsResetting(false);
    }
  };

  // Delete the character completely
  const handleDeleteCharacter = async () => {
    setShowConfirmation(null);
    setIsDeleting(true);
    
    try {
      const success = await SaveSystem.deleteSavedFighter(isAuthenticated, walletAddress || undefined);
      
      if (success) {
        // Update parent component
        onFighterUpdate(null);
      } else {
        onError('Failed to delete character');
      }
    } catch (err) {
      if (err instanceof Error) {
        onError(`Failed to delete character: ${err.message}`);
      } else {
        onError('Failed to delete character due to an unknown error');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Render confirmation dialog
  const renderConfirmation = () => {
    if (!showConfirmation) return null;
    
    const isDelete = showConfirmation === 'delete';
    const title = isDelete ? 'Delete Character?' : 'Reset Character Progress?';
    const message = isDelete 
      ? 'This will permanently delete your character. This action cannot be undone.'
      : 'This will reset your character to level 1 with base stats. Your class and name will be preserved. This action cannot be undone.';
    const actionText = isDelete ? 'Delete' : 'Reset';
    const action = isDelete ? handleDeleteCharacter : handleResetProgress;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
          <h3 className="text-xl font-bold mb-2 text-red-400">{title}</h3>
          <p className="text-gray-300 mb-6">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => setShowConfirmation(null)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
            >
              Cancel
            </button>
            <button 
              onClick={action}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              {actionText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">Character Management</h3>
      
      <div className="flex flex-col space-y-4">
        <button
          onClick={() => setShowConfirmation('reset')}
          disabled={isResetting || isDeleting}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded flex items-center justify-center"
        >
          {isResetting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Resetting...
            </>
          ) : (
            'Reset Character Progress'
          )}
        </button>
        
        <button
          onClick={() => setShowConfirmation('delete')}
          disabled={isDeleting || isResetting}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded flex items-center justify-center"
        >
          {isDeleting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deleting...
            </>
          ) : (
            'Delete Character'
          )}
        </button>
      </div>
      
      {renderConfirmation()}
    </div>
  );
};

export default CharacterManagement;

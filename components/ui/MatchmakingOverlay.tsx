import React from 'react';
import Spinner from './Spinner';

interface MatchmakingOverlayProps {
  stage: 'finding' | 'fighting';
  opponentAddress?: string | null;
  onCancel: () => void;
}

const MatchmakingOverlay: React.FC<MatchmakingOverlayProps> = ({ 
  stage, 
  opponentAddress, 
  onCancel 
}) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full text-center">
        <div className="mb-6">
          <Spinner size="lg" className="mx-auto" />
        </div>
        
        {stage === 'finding' ? (
          <div>
            <h3 className="text-xl font-bold mb-3 text-purple-400">Finding Opponent</h3>
            <p className="text-gray-300 mb-6">
              Searching for a worthy challenger in the Kaspa network...
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold mb-3 text-purple-400">Opponent Found!</h3>
            <div className="bg-gray-700 rounded-lg p-3 mb-4">
              <div className="flex justify-center items-center">
                <div className="bg-gray-600 rounded-full p-2 mr-3">
                  <span className="text-2xl">👺</span>
                </div>
                <div className="text-left">
                  <p className="font-bold">{opponentAddress ? `${opponentAddress.slice(0, 6)}...${opponentAddress.slice(-4)}` : 'Unknown'}</p>
                  <p className="text-sm text-gray-400">Level 1 Fighter</p>
                </div>
              </div>
            </div>
            <p className="text-gray-300 mb-6">
              Preparing the arena for battle...
            </p>
          </div>
        )}
        
        <button
          onClick={onCancel}
          className="border border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-200 font-bold py-2 px-4 rounded transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default MatchmakingOverlay;

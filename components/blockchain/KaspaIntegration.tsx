import React, { useEffect, useState } from 'react';
import { useWalletAuth } from '../../hooks/useWalletAuth';

/**
 * KaspaIntegration component for displaying wallet info and KASPA blockchain features
 */
export const KaspaIntegration = () => {
  const { address, balance, isAuthenticated, connect, disconnect } = useWalletAuth();
  const [kaspaPrice, setKaspaPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock function to simulate fetching KASPA price
  useEffect(() => {
    const fetchKaspaPrice = async () => {
      setIsLoading(true);
      try {
        // In a real app, you'd fetch from an API
        // This is a placeholder for demonstration
        await new Promise(resolve => setTimeout(resolve, 1000));
        setKaspaPrice(0.0175); // Sample price in USD
      } catch (error) {
        console.error('Error fetching KASPA price:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchKaspaPrice();
    }
  }, [isAuthenticated]);

  return (
    <div className="bg-gradient-to-r from-game-primary to-kaspa-dark rounded-lg p-6 text-game-text-light shadow-xl">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <img src="/assets/icons/kaspa-coin.png" alt="KASPA" className="w-8 h-8 mr-2" />
        KASPA Brawl Integration
      </h2>
      
      {!isAuthenticated ? (
        <div className="text-center py-6">
          <p className="mb-4">Connect your KASPA wallet to access blockchain features</p>
          <button 
            onClick={connect}
            className="bg-kaspa hover:bg-kaspa-light text-white font-bold py-2 px-6 rounded-full transition-all"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-game-secondary bg-opacity-50 rounded-md p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Wallet Address:</span>
              <span className="font-mono text-xs truncate max-w-[200px]">{address}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm">Balance:</span>
              <span className="font-bold">{balance} KAS</span>
            </div>
            {kaspaPrice && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm">Value (USD):</span>
                <span>${(Number(balance) * kaspaPrice).toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="bg-game-secondary bg-opacity-50 rounded-md p-4">
            <h3 className="font-bold mb-2">KASPA Blockchain Features:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Fighter NFTs minted on KASPA blockchain</li>
              <li>Earn KAS tokens by winning battles</li>
              <li>Special equipment available via blockchain assets</li>
              <li>Tournament entries using smart contracts</li>
            </ul>
          </div>

          <button 
            onClick={disconnect}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-4 rounded-md transition-all text-sm"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default KaspaIntegration;

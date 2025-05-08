import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import useWalletAuth from '../hooks/useWalletAuth';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import MatchmakingOverlay from '../components/ui/MatchmakingOverlay';
import FighterCard from '../components/fighter/FighterCard';
import FighterProfile from '../components/fighter/FighterProfile';
import { FightLogListItem, MatchmakeResponse, FightResponse } from '../types/index';
import { getFighterDesignByAddress } from '../utils/fighterDesigns';

// Dynamically load the Phaser component to prevent SSR issues
const PhaserGame = dynamic(() => import('../components/battle/PhaserGame'), {
  ssr: false,
});

export default function Home() {
  const router = useRouter();
  const { address, token, isGuest, connectWallet, connectAsGuest } = useWalletAuth();
  const [gameState, setGameState] = useState<'lobby' | 'fighting' | 'matchmaking'>('lobby');
  const [recentBattles, setRecentBattles] = useState<FightLogListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingBattles, setIsLoadingBattles] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOpponent, setCurrentOpponent] = useState<string | null>(null);
  const [currentFightLog, setCurrentFightLog] = useState<FightResponse | null>(null);
  
  // Load recent battles
  const loadRecentBattles = async () => {
    try {
      setIsLoadingBattles(true);
      const response = await fetch('/api/fightLogs?limit=5');
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent battles');
      }
      
      const data: FightLogListItem[] = await response.json();
      setRecentBattles(data);
    } catch (err) {
      console.error('Error loading recent battles:', err);
      // We don't show an error alert for this as it's not critical
    } finally {
      setIsLoadingBattles(false);
    }
  };
  
  // Load recent battles on initial page load
  useEffect(() => {
    loadRecentBattles();
  }, []);
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4 text-purple-400">Welcome to Kaspa Brawl</h2>
          <p className="text-gray-300">
            A MyBrute-style fighting game powered by the Kaspa blockchain.
            {!address ? 'Connect your KasWare wallet or play as guest to start your journey!' : 
             isGuest ? 'You are playing in guest mode. Connect a KasWare wallet for the full experience!' : 
             'Your wallet is connected. Enjoy the full game experience!'}
          </p>
        </section>
        
        {address ? (
          <FighterProfile
            address={address}
            isGuest={isGuest}
            isLoading={isLoading}
            onFindOpponent={async () => {
              try {
                setGameState('matchmaking');
                setIsLoading(true);
                setError(null);
                
                // Step 1: Find an opponent
                const matchmakeResponse = await fetch('/api/matchmake', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    player: address
                  })
                });
                
                if (!matchmakeResponse.ok) {
                  throw new Error('Failed to find opponent');
                }
                
                const matchData: MatchmakeResponse = await matchmakeResponse.json();
                setCurrentOpponent(matchData.opponent);
                setGameState('fighting');
                
                // Step 2: Execute the fight
                const fightResponse = await fetch('/api/fight', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    playerA: address,
                    playerB: matchData.opponent
                  })
                });
                
                if (!fightResponse.ok) {
                  throw new Error('Failed to execute fight');
                }
                
                const fightData: FightResponse = await fightResponse.json();
                setCurrentFightLog(fightData);
                
                // Step 3: Move to the arena page
                router.push(`/arena?fightLogId=${fightData.fightLogId}`);
                
                // Load recent battles after a successful fight
                loadRecentBattles();
              } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                setGameState('lobby');
              } finally {
                setIsLoading(false);
              }
            }}
          />
        ) : (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 text-center">
            <h3 className="text-xl mb-4">Start your fighting journey</h3>
            <p className="text-gray-400 mb-4">
              Connect your KasWare wallet for the full experience, or try the game in guest mode.
              The choice is yours!
            </p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={connectWallet} 
                className="kaspa-button"
              >
                Connect Wallet
              </button>
              <button 
                onClick={connectAsGuest} 
                className="border border-purple-600 text-purple-400 hover:bg-purple-900 hover:text-white font-bold py-2 px-4 rounded transition-all duration-200"
              >
                Play as Guest
              </button>
            </div>
          </div>
        )}
        
        {gameState === 'fighting' && (
          <div className="mb-8">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold">Arena</h3>
              <button 
                className="text-sm text-gray-400 hover:text-white"
                onClick={() => setGameState('lobby')}
              >
                ← Back to Lobby
              </button>
            </div>
            <PhaserGame walletAddress={address} />
          </div>
        )}
        
        {error && (
          <Alert 
            message={error}
            type="error"
            onDismiss={() => setError(null)}
          />
        )}
        
        {/* Matchmaking Overlay */}
        {isLoading && (gameState === 'matchmaking' || gameState === 'fighting') && (
          <MatchmakingOverlay 
            stage={gameState === 'matchmaking' ? 'finding' : 'fighting'} 
            opponentAddress={currentOpponent}
            onCancel={() => {
              setIsLoading(false);
              setGameState('lobby');
            }}
          />
        )}
        
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Recent Battles</h3>
            <button 
              className="text-sm text-gray-400 hover:text-white flex items-center"
              onClick={loadRecentBattles}
              disabled={isLoadingBattles}
            >
              {isLoadingBattles ? (
                <>
                  <Spinner size="sm" className="mr-1" />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </>
              )}
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            {isLoadingBattles && recentBattles.length === 0 ? (
              <div className="text-center py-8">
                <Spinner className="mx-auto mb-2" />
                <p className="text-gray-400">Loading recent battles...</p>
              </div>
            ) : recentBattles.length > 0 ? (
              <div className="space-y-3">
                {recentBattles.map(battle => (
                  <Link
                    href={`/arena?fightLogId=${battle.id}`}
                    key={battle.id}
                    className="block bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="bg-gray-600 rounded-full p-1 mr-2">
                            <span className="text-xl">👹</span>
                          </div>
                          <span className="font-medium">
                            {battle.playerA.address.slice(0, 6)}...{battle.playerA.address.slice(-4)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 px-4 text-center">
                        <span className="text-sm text-purple-400 font-bold">VS</span>
                        {battle.winner && (
                          <div className="text-xs text-gray-400 mt-1">
                            {battle.winner === battle.playerA.id ? 'Victory' : battle.winner === battle.playerB.id ? 'Defeat' : 'Draw'}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-end">
                          <span className="font-medium">
                            {battle.playerB.address.slice(0, 6)}...{battle.playerB.address.slice(-4)}
                          </span>
                          <div className="bg-gray-600 rounded-full p-1 ml-2">
                            <span className="text-xl">👺</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 text-center">
                      {new Date(battle.createdAt).toLocaleString()}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">No recent battles found</p>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}

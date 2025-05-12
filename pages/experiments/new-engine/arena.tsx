import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useWalletAuth } from '../../hooks/useWalletAuth';
import Image from 'next/image';
import Link from 'next/link';

interface Fighter {
  id: string;
  name: string;
  level: number;
  wins: number;
  losses: number;
  specialMoves: string[];
  imagePath: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats: {
    strength: number;
    agility: number;
    defense: number;
    will: number;
    luck: number;
  };
}

const mockFighters: Fighter[] = [
  {
    id: 'fighter-1',
    name: 'Kaspa Warrior',
    level: 5,
    wins: 12,
    losses: 3,
    specialMoves: ['Lightning Strike', 'Block Crusher'],
    imagePath: '/assets/fighters/warrior.png',
    rarity: 'rare',
    stats: { strength: 8, agility: 6, defense: 7, will: 5, luck: 4 }
  },
  {
    id: 'fighter-2',
    name: 'Blockchain Mage',
    level: 4,
    wins: 8,
    losses: 2,
    specialMoves: ['Hash Blast', 'Crypto Shield'],
    imagePath: '/assets/fighters/mage.png',
    rarity: 'uncommon',
    stats: { strength: 4, agility: 7, defense: 5, will: 9, luck: 6 }
  },
  {
    id: 'fighter-3',
    name: 'DAG Assassin',
    level: 3,
    wins: 6,
    losses: 4,
    specialMoves: ['Silent Transaction', 'Double Spend'],
    imagePath: '/assets/fighters/rogue.png',
    rarity: 'common',
    stats: { strength: 6, agility: 9, defense: 4, will: 5, luck: 7 }
  }
];

const rarityColors = {
  common: 'border-gray-400 bg-gray-100 text-gray-800',
  uncommon: 'border-green-400 bg-green-50 text-green-800',
  rare: 'border-blue-400 bg-blue-50 text-blue-800',
  epic: 'border-purple-400 bg-purple-50 text-purple-800',
  legendary: 'border-yellow-400 bg-yellow-50 text-yellow-800 animate-pulse'
};

export default function NewEngineArenaPage() {
  const { address, isGuest } = useWalletAuth();
  const [selectedFighter, setSelectedFighter] = useState<Fighter | null>(null);
  const [opponents, setOpponents] = useState<Fighter[]>([]);
  const [battleState, setBattleState] = useState<'select' | 'preparing' | 'fighting' | 'results'>('select');
  const [battleResult, setBattleResult] = useState<{winner: string, log: any[]} | null>(null);
  const [battleOpponent, setBattleOpponent] = useState<Fighter | null>(null);

  // Load opponents
  useEffect(() => {
    // In a real app, fetch from API
    setOpponents(mockFighters.filter(f => f.id !== selectedFighter?.id));
  }, [selectedFighter]);

  // Handle fighter selection
  const selectFighter = (fighter: Fighter) => {
    setSelectedFighter(fighter);
    setBattleState('select');
    setBattleResult(null);
    setBattleOpponent(null);
  };

  // Start battle with opponent
  const startBattle = (opponent: Fighter) => {
    if (!selectedFighter) return;
    
    setBattleOpponent(opponent);
    setBattleState('preparing');
    
    // Simulate battle preparation
    setTimeout(() => {
      setBattleState('fighting');
      
      // Simulate battle duration
      setTimeout(() => {
        // Determine winner (simple simulation)
        const playerScore = Object.values(selectedFighter.stats).reduce((sum, val) => sum + val, 0);
        const opponentScore = Object.values(opponent.stats).reduce((sum, val) => sum + val, 0);
        
        const winChance = playerScore / (playerScore + opponentScore);
        const playerWins = Math.random() < winChance;
        
        setBattleResult({
          winner: playerWins ? selectedFighter.id : opponent.id,
          log: [
            { turn: 1, action: 'attack', actor: selectedFighter.id, target: opponent.id, damage: Math.floor(Math.random() * 10) + 5 },
            { turn: 1, action: 'attack', actor: opponent.id, target: selectedFighter.id, damage: Math.floor(Math.random() * 8) + 3 },
            { turn: 2, action: 'special', actor: selectedFighter.id, target: opponent.id, move: selectedFighter.specialMoves[0], damage: Math.floor(Math.random() * 15) + 10 },
            { turn: 2, action: 'attack', actor: opponent.id, target: selectedFighter.id, damage: Math.floor(Math.random() * 8) + 3 },
            { turn: 3, action: 'attack', actor: selectedFighter.id, target: opponent.id, damage: Math.floor(Math.random() * 10) + 5 },
            { turn: 3, action: 'special', actor: opponent.id, target: selectedFighter.id, move: opponent.specialMoves[0], damage: Math.floor(Math.random() * 12) + 8 }
          ]
        });
        
        setBattleState('results');
      }, 3000);
    }, 1500);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-kaspa-dark">Experimental New Engine Arena</h1>
          <Link href="/new-engine" className="text-kaspa hover:text-kaspa-light">
            ← Back to Overview
          </Link>
        </div>

        {/* Fighter Selection */}
        {battleState === 'select' && (
          <div className="grid grid-cols-1 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Select Your Fighter</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockFighters.map(fighter => (
                  <div 
                    key={fighter.id}
                    className={`border-2 rounded-lg overflow-hidden shadow-md transition-all cursor-pointer ${
                      selectedFighter?.id === fighter.id ? 'ring-4 ring-kaspa' : ''
                    } ${rarityColors[fighter.rarity]}`}
                    onClick={() => selectFighter(fighter)}
                  >
                    <div className="relative h-48">
                      <Image 
                        src={fighter.imagePath} 
                        alt={fighter.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold">{fighter.name}</h3>
                        <span className="text-sm">Lvl {fighter.level}</span>
                      </div>
                      
                      <div className="text-sm mb-3">
                        <span className="inline-block mr-3">
                          <span className="font-medium">Wins:</span> {fighter.wins}
                        </span>
                        <span className="inline-block">
                          <span className="font-medium">Losses:</span> {fighter.losses}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-1 mb-3">
                        {Object.entries(fighter.stats).map(([stat, value]) => (
                          <div key={stat} className="text-center">
                            <div className="text-xs uppercase text-gray-500">{stat.substring(0, 3)}</div>
                            <div className="font-bold">{value}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-xs">
                        <div className="font-medium mb-1">Special Moves:</div>
                        <ul className="list-disc list-inside">
                          {fighter.specialMoves.map(move => (
                            <li key={move}>{move}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedFighter && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Choose an Opponent</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {opponents.map(opponent => (
                    <div 
                      key={opponent.id}
                      className={`border-2 rounded-lg overflow-hidden shadow-md transition-all cursor-pointer hover:shadow-lg ${rarityColors[opponent.rarity]}`}
                      onClick={() => startBattle(opponent)}
                    >
                      <div className="relative h-40">
                        <Image 
                          src={opponent.imagePath} 
                          alt={opponent.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="text-lg font-bold">{opponent.name}</h3>
                          <span className="text-sm">Lvl {opponent.level}</span>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-1">
                          {Object.entries(opponent.stats).map(([stat, value]) => (
                            <div key={stat} className="text-center">
                              <div className="text-xs uppercase text-gray-500">{stat.substring(0, 3)}</div>
                              <div className="font-bold">{value}</div>
                            </div>
                          ))}
                        </div>
                        
                        <button className="w-full mt-2 bg-kaspa hover:bg-kaspa-light text-white font-bold py-1 px-4 rounded text-sm">
                          Fight!
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Battle Preparation Screen */}
        {battleState === 'preparing' && selectedFighter && battleOpponent && (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-6">Preparing for Battle</h2>
            
            <div className="flex justify-center items-center space-x-20 mb-8">
              <div className="text-center">
                <div className="relative w-40 h-40 mx-auto mb-4 rounded-lg overflow-hidden border-4 border-kaspa">
                  <Image 
                    src={selectedFighter.imagePath} 
                    alt={selectedFighter.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold">{selectedFighter.name}</h3>
                <p className="text-gray-600">Level {selectedFighter.level}</p>
              </div>
              
              <div className="text-4xl font-bold text-kaspa">VS</div>
              
              <div className="text-center">
                <div className="relative w-40 h-40 mx-auto mb-4 rounded-lg overflow-hidden border-4 border-red-500">
                  <Image 
                    src={battleOpponent.imagePath} 
                    alt={battleOpponent.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold">{battleOpponent.name}</h3>
                <p className="text-gray-600">Level {battleOpponent.level}</p>
              </div>
            </div>
            
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-kaspa border-t-transparent"></div>
            <p className="text-lg mt-4">Loading battle environment...</p>
          </div>
        )}

        {/* Battle Scene */}
        {battleState === 'fighting' && selectedFighter && battleOpponent && (
          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image
              src="/assets/backgrounds/arena-bg-1.jpg"
              alt="Battle Arena"
              fill
              className="object-cover"
            />
            
            <div className="absolute inset-0 flex items-center justify-between px-12">
              <div className="bg-black bg-opacity-50 rounded-lg p-4 text-white">
                <div className="relative w-32 h-32 mx-auto mb-2">
                  <Image 
                    src={selectedFighter.imagePath} 
                    alt={selectedFighter.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <p className="text-center mt-1">{selectedFighter.name}</p>
              </div>
              
              <div className="text-center bg-black bg-opacity-70 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold">
                VS
              </div>
              
              <div className="bg-black bg-opacity-50 rounded-lg p-4 text-white">
                <div className="relative w-32 h-32 mx-auto mb-2">
                  <Image 
                    src={battleOpponent.imagePath} 
                    alt={battleOpponent.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-center mt-1">{battleOpponent.name}</p>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-4 text-white">
              <p className="text-center text-lg animate-pulse">Battle in progress...</p>
            </div>
          </div>
        )}

        {/* Battle Results */}
        {battleState === 'results' && selectedFighter && battleOpponent && battleResult && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-6">
              Battle Results: {battleResult.winner === selectedFighter.id ? 'Victory!' : 'Defeat!'}
            </h2>
            
            <div className="flex justify-center items-center space-x-20 mb-8">
              <div className="text-center">
                <div className={`relative w-40 h-40 mx-auto mb-4 rounded-lg overflow-hidden border-4 ${
                  battleResult.winner === selectedFighter.id ? 'border-green-500' : 'border-gray-400'
                }`}>
                  <Image 
                    src={selectedFighter.imagePath} 
                    alt={selectedFighter.name}
                    fill
                    className="object-cover"
                  />
                  {battleResult.winner === selectedFighter.id && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold">{selectedFighter.name}</h3>
              </div>
              
              <div className="text-2xl font-bold text-kaspa">VS</div>
              
              <div className="text-center">
                <div className={`relative w-40 h-40 mx-auto mb-4 rounded-lg overflow-hidden border-4 ${
                  battleResult.winner === battleOpponent.id ? 'border-green-500' : 'border-gray-400'
                }`}>
                  <Image 
                    src={battleOpponent.imagePath} 
                    alt={battleOpponent.name}
                    fill
                    className="object-cover"
                  />
                  {battleResult.winner === battleOpponent.id && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold">{battleOpponent.name}</h3>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Battle Log</h3>
              <div className="bg-gray-100 rounded-lg p-4 max-h-60 overflow-y-auto">
                <table className="w-full table-auto">
                  <thead className="text-left">
                    <tr>
                      <th className="pb-2">Turn</th>
                      <th className="pb-2">Action</th>
                      <th className="pb-2">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {battleResult.log.map((entry, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="py-2">{entry.turn}</td>
                        <td className="py-2 capitalize">{entry.action}</td>
                        <td className="py-2">
                          {entry.actor === selectedFighter.id ? 'You' : battleOpponent.name} 
                          {entry.action === 'special' ? ` used ${entry.move}` : ' attacked'} 
                          and dealt {entry.damage} damage
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Rewards Section */}
            {battleResult.winner === selectedFighter.id && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Battle Rewards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-100 rounded-lg p-4 flex items-center">
                    <div className="bg-kaspa-light rounded-full p-2 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">KASPA Earned</p>
                      <p className="text-xl font-bold">+0.25 KAS</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg p-4 flex items-center">
                    <div className="bg-purple-500 rounded-full p-2 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Experience Gained</p>
                      <p className="text-xl font-bold">+50 XP</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setBattleState('select')}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
              >
                Return to Arena
              </button>
              {battleResult.winner === selectedFighter.id ? (
                <button 
                  onClick={() => startBattle(battleOpponent)}
                  className="bg-kaspa hover:bg-kaspa-light text-white font-bold py-2 px-6 rounded"
                >
                  Battle Again
                </button>
              ) : (
                <button 
                  onClick={() => startBattle(battleOpponent)}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded"
                >
                  Rematch
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

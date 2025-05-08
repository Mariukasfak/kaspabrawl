import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import Spinner from '../components/ui/Spinner';
import { FightLogResponse } from '../types/index';
import Alert from '../components/ui/Alert';
import FighterCard from '../components/fighter/FighterCard';
import SpecialMoveCard from '../components/fighter/SpecialMoveCard';
import { getFighterDesignByAddress } from '../utils/fighterDesigns';

// Dynamically load the Phaser component to prevent SSR issues
const PhaserGame = dynamic(() => import('../components/battle/PhaserGame'), {
  ssr: false,
});

export default function Arena() {
  const router = useRouter();
  const { fightLogId } = router.query;
  
  const [fightLog, setFightLog] = useState<FightLogResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFightLog() {
      if (!fightLogId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/fightLogs/${fightLogId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load fight data');
        }
        
        const data = await response.json();
        setFightLog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    loadFightLog();
  }, [fightLogId]);
  
  return (
    <Layout title="Kaspa Brawl - Arena">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-purple-400">Arena</h2>
          <Link 
            href="/" 
            className="text-gray-400 hover:text-white transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Lobby
          </Link>
        </div>
        
        {error && (
          <Alert 
            message={error} 
            type="error" 
            onDismiss={() => setError(null)} 
          />
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-400">Loading battle data...</p>
            </div>
          </div>
        ) : fightLog ? (
          <div>
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="bg-gray-700 p-2 rounded-lg relative">
                    <span className="text-2xl">👹</span>
                    {/* Winner badge */}
                    {fightLog.log.some(step => 
                      step.type === 'end' && step.attacker === fightLog.playerA.id
                    ) && (
                      <div className="absolute -top-2 -right-2 bg-yellow-500 w-6 h-6 rounded-full flex items-center justify-center">
                        <span className="text-xs">👑</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-bold">
                      {fightLog.playerA.address.startsWith('guest-') && (
                        <span className="bg-yellow-800 px-1.5 py-0.5 rounded text-xs mr-1 text-white">GUEST</span>
                      )}
                      {fightLog.playerA.address.slice(0, 8)}...
                    </p>
                    <p className="text-sm text-gray-400">Fighter</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-400">VS</div>
                </div>
                
                <div className="flex items-center">
                  <div className="mr-3 text-right">
                    <p className="font-bold">
                      {fightLog.playerB.address.startsWith('guest-') && (
                        <span className="bg-yellow-800 px-1.5 py-0.5 rounded text-xs mr-1 text-white">GUEST</span>
                      )}
                      {fightLog.playerB.address.slice(0, 8)}...
                    </p>
                    <p className="text-sm text-gray-400">Fighter</p>
                  </div>
                  <div className="bg-gray-700 p-2 rounded-lg relative">
                    <span className="text-2xl">👺</span>
                    {/* Winner badge */}
                    {fightLog.log.some(step => 
                      step.type === 'end' && step.attacker === fightLog.playerB.id
                    ) && (
                      <div className="absolute -top-2 -right-2 bg-yellow-500 w-6 h-6 rounded-full flex items-center justify-center">
                        <span className="text-xs">👑</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-400 text-center">
                Battle occurred {new Date(fightLog.createdAt).toLocaleString()}
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
              <div className="p-4 bg-gray-700 text-center text-sm">
                <p className="text-gray-300">Click inside the game area to advance through the battle steps</p>
              </div>
              <PhaserGame fightLog={fightLog.log} />
            </div>
            
            <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-xl font-bold mb-3 text-purple-400">Battle Log</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto p-2">
                {fightLog.log.map((step, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded text-sm ${
                      step.type === 'start' ? 'bg-blue-900 bg-opacity-30 border-l-4 border-blue-500' : 
                      step.type === 'end' ? 'bg-purple-900 bg-opacity-30 border-l-4 border-purple-500' : 
                      step.type === 'attack' && step.damage && step.damage > 20 ? 'bg-red-900 bg-opacity-30 border-l-4 border-red-500' :
                      'bg-gray-700'
                    }`}
                  >
                    {step.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-400">Fight not found or invalid fight ID.</p>
            <Link 
              href="/" 
              className="mt-4 inline-block text-purple-400 hover:text-purple-300"
            >
              Return to Lobby
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

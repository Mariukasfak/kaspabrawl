import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import KaspaIntegration from '../components/blockchain/KaspaIntegration';
import KaspaGameNarrative from '../components/blockchain/KaspaGameNarrative';
import Image from 'next/image';
import Link from 'next/link';
import { useWalletAuth } from '../hooks/useWalletAuth';

export default function NewEnginePage() {
  const { isAuthenticated, address } = useWalletAuth();
  const [demoReady, setDemoReady] = useState(false);

  useEffect(() => {
    // Simulate loading of the engine
    const timer = setTimeout(() => setDemoReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-kaspa-dark">KASPABRAWL New Engine Demo</h1>
          <p className="text-xl mt-4 max-w-3xl mx-auto text-gray-600">
            Experience the next generation of blockchain-powered MyBrute-style combat with our experimental new engine.
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-game-primary to-kaspa-dark rounded-xl shadow-2xl overflow-hidden mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white mb-4">Revolutionary Combat Experience</h2>
              <p className="text-lg text-gray-100 mb-6">
                Our new engine combines the fast-paced, turn-based strategy of the classic MyBrute game with 
                modern web technologies and the power of KASPA blockchain.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-kaspa flex items-center justify-center mr-3">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <span className="text-white text-lg">Enhanced physics-based animations</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-kaspa flex items-center justify-center mr-3">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <span className="text-white text-lg">Entity Component System architecture</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-kaspa flex items-center justify-center mr-3">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <span className="text-white text-lg">KASPA blockchain-powered NFT fighters</span>
                </div>
              </div>
              
              <div className="mt-8">
                {isAuthenticated ? (
                  <Link href="/experiments/new-engine/arena" className="bg-kaspa hover:bg-kaspa-light text-white font-bold py-3 px-8 rounded-full inline-block transition-all">
                    Launch Demo Arena
                  </Link>
                ) : (
                  <p className="text-kaspa-light italic">Connect your KASPA wallet to try the demo</p>
                )}
              </div>
            </div>
            <div className="relative h-96 md:h-auto">
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10">
                {!demoReady ? (
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                    <p className="text-white mt-4">Loading Engine Demo...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <button className="bg-kaspa hover:bg-kaspa-light text-white font-bold py-3 px-8 rounded-full inline-block transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Watch Demo
                    </button>
                  </div>
                )}
              </div>
              <Image 
                src="/assets/backgrounds/arena-bg-1.jpg" 
                alt="Fighting Arena" 
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-kaspa-light rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Action-Packed Battles</h3>
            <p className="text-gray-600">
              Experience fluid animations and impactful moves with our enhanced battle system. 
              See special attacks with particle effects and screen shake for true impact.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-kaspa-light rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">NFT Fighter Ownership</h3>
            <p className="text-gray-600">
              Your fighters are yours forever as NFTs on the KASPA blockchain. Trade, sell, or showcase your 
              champion fighters with verifiable ownership and fight history.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-kaspa-light rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Play-to-Earn Economy</h3>
            <p className="text-gray-600">
              Win battles to earn KAS tokens. Participate in tournaments with real crypto rewards 
              and grow your collection of rare fighters and equipment.
            </p>
          </div>
        </div>

        {/* Engine Showcase */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Engine Technical Showcase</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Entity Component System</h3>
              <p className="mb-4">
                Our new engine uses a modern Entity Component System (ECS) architecture that provides:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Better performance with data-oriented design</li>
                <li>More flexible entity composition</li>
                <li>Easier system implementation and maintenance</li>
                <li>Enhanced testability and debugging</li>
              </ul>
              
              <div className="mt-6 bg-gray-100 p-4 rounded-md">
                <pre className="text-sm overflow-x-auto">
                  <code>
{`// Example Entity Creation
const fighter = world.createEntity();
fighter.addComponent(new IdentityComponent({
  name: 'CryptoWarrior',
  level: 5
}));
fighter.addComponent(new BlockchainComponent({
  tokenId: 'kas-123456',
  rarity: 'rare'
}));`}
                  </code>
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">KASPA Blockchain Integration</h3>
              <p className="mb-4">
                Our engine directly interfaces with the KASPA blockchain to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Generate fighters with blockchain-derived attributes</li>
                <li>Securely mint and transfer NFT fighters</li>
                <li>Record battle results immutably on-chain</li>
                <li>Handle KAS token rewards and transactions</li>
              </ul>
              
              <div className="mt-6 bg-gray-100 p-4 rounded-md">
                <pre className="text-sm overflow-x-auto">
                  <code>
{`// Example Blockchain Interaction
const mintFighterNFT = async (fighter, ownerAddress) => {
  const metadata = generateFighterMetadata(fighter);
  const txHash = await kaspaClient.mintNFT({
    to: ownerAddress,
    metadata,
    royalties: 5 // 5% royalties
  });
  return { tokenId: txHash, ownerAddress };
};`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* KASPA Integration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="md:col-span-2">
            <KaspaGameNarrative />
          </div>
          <div>
            <KaspaIntegration />
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-4">Ready to Join the Arena?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Connect your wallet, mint your first fighter, and start your journey to become 
            the ultimate KASPABRAWL champion!
          </p>
          <div className="space-x-4">
            <Link href="/arena" className="bg-game-primary hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-full inline-block transition-all">
              Enter Classic Arena
            </Link>
            <Link href="/experiments/new-engine/arena" className="bg-kaspa hover:bg-kaspa-light text-white font-bold py-3 px-8 rounded-full inline-block transition-all">
              Try New Engine
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

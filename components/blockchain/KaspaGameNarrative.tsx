import React from 'react';

/**
 * KaspaGameNarrative component for telling the story of the game and its integration with KASPA
 */
export const KaspaGameNarrative = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-kaspa-dark">The KASPABRAWL Story</h1>
      
      <div className="space-y-8">
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-game-primary">The Rise of KASPA Warriors</h2>
          <p className="text-lg leading-relaxed">
            In the year 2050, the KASPA blockchain evolved beyond a mere digital currency into a vibrant ecosystem 
            powering virtual worlds. The most popular of these was the KASPABRAWL arena, where digital fighters 
            battled for glory, fame, and valuable KAS tokens.
          </p>
          <p className="text-lg leading-relaxed mt-4">
            Each fighter is unique - born from the cryptographic magic of the KASPA blockchain, their attributes 
            determined by hash values, transaction speeds, and network difficulty at the moment of their creation.
          </p>
        </section>
        
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-game-primary">MyBrute Legacy</h2>
          <p className="text-lg leading-relaxed">
            Inspired by the classic turn-based combat of the legendary MyBrute game from the early internet era, 
            KASPABRAWL brings back the addictive simplicity of automated dueling with modern blockchain technology.
          </p>
          <p className="text-lg leading-relaxed mt-4">
            Your fighters gain experience, discover weapons and special abilities, and grow stronger with each battle. 
            But unlike the games of old, these fighters are truly YOURS - secured on the lightning-fast KASPA blockchain.
          </p>
        </section>
        
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-game-primary">The KASPA Advantage</h2>
          <p className="text-lg leading-relaxed">
            Why KASPA? With its revolutionary BlockDAG architecture and near-instant transaction finality, KASPA provides 
            the perfect foundation for our game. Fighter NFTs can be minted, traded, and deployed in battles with minimal 
            fees and maximum speed.
          </p>
          <p className="text-lg leading-relaxed mt-4">
            Every tournament entry, battle outcome, and rare equipment discovery is recorded immutably on-chain. 
            Your victories are eternal, your champions legendary, all powered by the most advanced blockchain 
            technology available.
          </p>
        </section>
        
        <div className="bg-gradient-to-r from-kaspa to-kaspa-dark p-6 rounded-lg shadow-lg text-white">
          <h2 className="text-2xl font-bold mb-4">Join The Arena Today</h2>
          <p className="text-lg leading-relaxed">
            Connect your KASPA wallet, mint your first fighter, and step into the arena. Glory, treasure, 
            and the adoration of the crowd await. Will your fighter rise to become a KASPABRAWL legend?
          </p>
        </div>
      </div>
    </div>
  );
};

export default KaspaGameNarrative;

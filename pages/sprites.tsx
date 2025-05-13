import React from 'react';
import Layout from '../components/layout/Layout';
import FighterSpriteShowcase from '../components/fighter/FighterSpriteShowcase';

/**
 * Page that displays the fighter sprite showcase
 */
export default function SpritesPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Fighter Class & Sprite System</h1>
        
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">About the Classes</h2>
          <p className="mb-4">
            Kaspa Brawl features three distinct fighter classes, each with unique abilities and playstyles:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-xl font-bold mb-2 text-blue-400">Fighter</h3>
              <p>Melee combat specialist with high strength and defense. Excels at close-quarters combat and can withstand significant damage.</p>
            </div>
            
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-xl font-bold mb-2 text-green-400">Ranger (Ranged)</h3>
              <p>Distance fighter with high agility and critical chance. Specializes in bow attacks and can strike from afar with precision.</p>
            </div>
            
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-xl font-bold mb-2 text-purple-400">Mage</h3>
              <p>Magic user with powerful spells and high intelligence. Can deal massive damage but has lower health and defense.</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Level-Based Sprites</h2>
          <p className="mb-2">
            Each fighter's appearance evolves as they level up, with visual changes at key thresholds:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Levels 1-4: Novice appearance</li>
            <li>Levels 5-9: Improved appearance</li>
            <li>Levels 10-14: Advanced appearance</li>
            <li>Levels 15-94: Expert appearance</li>
            <li>Levels 95-99: Master appearance</li>
            <li>Level 100+: Legendary appearance</li>
          </ul>
        </div>
        
        <FighterSpriteShowcase />
      </div>
    </Layout>
  );
}

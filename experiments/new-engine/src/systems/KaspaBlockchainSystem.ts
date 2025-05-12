import { System, Entity, World } from '../core/ecs';
import { BlockchainComponent } from '../components/BlockchainComponent';
import { BattleStateComponent } from '../components/BattleStateComponent';
import { SimComponent } from '../components/SimComponent';
import { IdentityComponent } from '../components/IdentityComponent';

/**
 * KaspaBlockchainSystem handles interactions between battle system and KASPA blockchain
 */
export class KaspaBlockchainSystem implements System {
  // Track transactions in progress to avoid duplicate submissions
  private pendingTransactions = new Map<string, boolean>();
  
  // Mock API client for KASPA blockchain
  private kaspaClient = {
    /**
     * Mock method to send battle result to blockchain
     */
    async recordBattleResult(winnerId: string, loserId: string, battleData: any): Promise<string> {
      // This would interact with real KASPA blockchain in production
      console.log(`Recording battle result on blockchain: winner=${winnerId}, loser=${loserId}`);
      console.log('Battle data:', JSON.stringify(battleData, null, 2));
      
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return mock transaction hash
      return `kas_${Math.random().toString(36).substring(2, 15)}`;
    },
    
    /**
     * Mock method to award tokens to winner
     */
    async awardTokens(address: string, amount: number): Promise<string> {
      console.log(`Awarding ${amount} KAS tokens to ${address}`);
      
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock transaction hash
      return `kas_${Math.random().toString(36).substring(2, 15)}`;
    },
    
    /**
     * Mock method to update fighter NFT stats
     */
    async updateFighterNFT(tokenId: string, updates: any): Promise<string> {
      console.log(`Updating fighter NFT ${tokenId} with:`, updates);
      
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Return mock transaction hash
      return `kas_${Math.random().toString(36).substring(2, 15)}`;
    }
  };

  /**
   * Update method called each game tick
   */
  public async update(world: World): Promise<void> {
    // Find completed battles that need blockchain processing
    const entities = world.getEntitiesByComponents(['battleState', 'blockchain']);
    
    for (const entity of entities) {
      const battleState = entity.getComponent<BattleStateComponent>('battleState');
      const blockchain = entity.getComponent<BlockchainComponent>('blockchain');
      
      // Skip if no battle state or blockchain component, or if battle not complete
      if (!battleState || !blockchain || !battleState.battleComplete) {
        continue;
      }
      
      // Skip if we're already processing this battle
      if (this.pendingTransactions.has(entity.id)) {
        continue;
      }
      
      // Find the last entry in the battle log with battleEnd type
      const battleEndEvent = battleState.battleLog.find(log => log.type === 'battleEnd');
      if (!battleEndEvent) continue;
      
      // Begin processing this battle
      this.pendingTransactions.set(entity.id, true);
      
      try {
        await this.processBattleResult(world, entity, battleEndEvent);
      } catch (error) {
        console.error('Error processing battle result:', error);
      } finally {
        this.pendingTransactions.delete(entity.id);
        
        // Mark the battle state as processed to avoid re-processing
        battleState.blockchainProcessed = true;
      }
    }
  }
  
  /**
   * Process a completed battle and record results on blockchain
   */
  private async processBattleResult(
    world: World,
    entity: Entity,
    battleEndEvent: any
  ): Promise<void> {
    console.log(`Processing battle result for entity ${entity.id}`);
    
    const battleState = entity.getComponent<BattleStateComponent>('battleState');
    const blockchain = entity.getComponent<BlockchainComponent>('blockchain');
    const identity = entity.getComponent<IdentityComponent>('identity');
    const sim = entity.getComponent<SimComponent>('sim');
    
    if (!battleState || !blockchain || !identity || !sim || !battleEndEvent.winnerId) {
      console.error('Missing required components for blockchain processing');
      return;
    }
    
    const isWinner = battleEndEvent.winnerId === entity.id;
    const opponentId = battleState.opponentId;
    
    if (!opponentId) {
      console.error('No opponent ID found in battle state');
      return;
    }
    
    // Find the opponent entity
    const opponent = world.getEntity(opponentId);
    if (!opponent) {
      console.error(`Opponent entity ${opponentId} not found`);
      return;
    }
    
    // Get opponent components
    const opponentBlockchain = opponent.getComponent<BlockchainComponent>('blockchain');
    const opponentIdentity = opponent.getComponent<IdentityComponent>('identity');
    
    if (!opponentBlockchain || !opponentIdentity) {
      console.error('Opponent missing required components');
      return;
    }
    
    // Prepare battle data for blockchain
    const battleData = {
      timestamp: Date.now(),
      duration: battleState.currentTurn,
      winnerId: battleEndEvent.winnerId,
      loserId: battleEndEvent.loserId,
      fighter1: {
        id: entity.id,
        name: identity.name,
        tokenId: blockchain.tokenId,
        ownerAddress: blockchain.ownerAddress,
        initialStats: sim.attributes
      },
      fighter2: {
        id: opponent.id,
        name: opponentIdentity.name,
        tokenId: opponentBlockchain.tokenId,
        ownerAddress: opponentBlockchain.ownerAddress
      },
      battleLog: battleState.battleLog
    };
    
    // Record battle result on blockchain
    console.log('Recording battle result on blockchain...');
    const txHash = await this.kaspaClient.recordBattleResult(
      battleEndEvent.winnerId,
      battleEndEvent.loserId,
      battleData
    );
    
    // Store transaction hash in blockchain component
    blockchain.battleTxHashes = blockchain.battleTxHashes || [];
    blockchain.battleTxHashes.push(txHash);
    
    // If this entity won, award tokens and update stats
    if (isWinner && blockchain.ownerAddress) {
      // Award KAS tokens based on level difference, minimum 0.1 KAS
      const opponentSim = opponent.getComponent<SimComponent>('sim');
      const levelDiff = opponentSim && opponentSim.attributes.level > sim.attributes.level 
        ? (opponentSim.attributes.level - sim.attributes.level) * 0.05 
        : 0;
        
      const tokenReward = 0.1 + levelDiff;
      
      console.log(`Awarding ${tokenReward} KAS to winner ${blockchain.ownerAddress}`);
      const rewardTxHash = await this.kaspaClient.awardTokens(
        blockchain.ownerAddress,
        tokenReward
      );
      
      // Update fighter NFT with new stats if it has a token ID
      if (blockchain.tokenId) {
        // Calculate experience gained
        const baseXP = 50;
        const levelBonus = levelDiff > 0 ? levelDiff * 10 : 0;
        const experienceGained = baseXP + levelBonus;
        
        // Updates to apply to the NFT
        const nftUpdates = {
          experience: experienceGained,
          battleCount: (blockchain.battleCount || 0) + 1,
          winCount: (blockchain.winCount || 0) + 1,
          lastBattleTxHash: txHash
        };
        
        console.log(`Updating NFT ${blockchain.tokenId} with new stats`);
        const updateTxHash = await this.kaspaClient.updateFighterNFT(
          blockchain.tokenId,
          nftUpdates
        );
        
        // Update local blockchain component
        blockchain.battleCount = (blockchain.battleCount || 0) + 1;
        blockchain.winCount = (blockchain.winCount || 0) + 1;
        blockchain.experience = (blockchain.experience || 0) + experienceGained;
        
        // Check if fighter has leveled up (simple logic - every 100 XP)
        if (Math.floor(blockchain.experience / 100) > Math.floor((blockchain.experience - experienceGained) / 100)) {
          console.log(`Fighter ${identity.name} has leveled up!`);
          
          // Trigger level up event
          world.emit('fighterLevelUp', {
            entityId: entity.id,
            newLevel: Math.floor(blockchain.experience / 100) + 1,
            oldLevel: Math.floor((blockchain.experience - experienceGained) / 100) + 1
          });
        }
      }
    } else {
      // Update loss count for loser
      blockchain.battleCount = (blockchain.battleCount || 0) + 1;
      blockchain.lossCount = (blockchain.lossCount || 0) + 1;
      
      if (blockchain.tokenId) {
        // Update NFT with loss data
        await this.kaspaClient.updateFighterNFT(blockchain.tokenId, {
          battleCount: blockchain.battleCount,
          lossCount: blockchain.lossCount,
          lastBattleTxHash: txHash
        });
      }
    }
    
    // Emit blockchain transaction complete event
    world.emit('blockchainTransactionComplete', {
      entityId: entity.id,
      txHash,
      isWinner,
      battleData
    });
  }
}

export default KaspaBlockchainSystem;

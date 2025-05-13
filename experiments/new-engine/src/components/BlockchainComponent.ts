import { Component } from '../core/ecs';

/**
 * BlockchainComponent handles the integration with KASPA blockchain
 * Stores NFT metadata, ownership status, and blockchain interactions
 */
export class BlockchainComponent implements Component {
  public readonly type = 'blockchain';
  
  // NFT identifier on the KASPA blockchain
  public tokenId: string | null = null;
  
  // Owner's wallet address
  public ownerAddress: string | null = null;
  
  // Token URI pointing to metadata
  public tokenUri: string | null = null;
  
  // Transaction hash that created this entity
  public mintTxHash: string | null = null;
  
  // Transaction hashes for battles this entity has participated in
  public battleTxHashes: string[] = [];
  
  // Rarity determined by blockchain factors
  public rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' = 'common';
  
  // Special attributes derived from blockchain data
  public blockchainAttributes: {
    // Derived from transaction confirmation speed
    speedBoost: number;
    
    // Derived from block hash entropy
    luckModifier: number;
    
    // Special ability unlocked by blockchain condition
    specialAbility: string | null;
  };
  
  constructor(data?: Partial<BlockchainComponent>) {
    this.tokenId = data?.tokenId || null;
    this.ownerAddress = data?.ownerAddress || null;
    this.tokenUri = data?.tokenUri || null;
    this.mintTxHash = data?.mintTxHash || null;
    this.battleTxHashes = data?.battleTxHashes || [];
    this.rarity = data?.rarity || 'common';
    this.blockchainAttributes = data?.blockchainAttributes || {
      speedBoost: 0,
      luckModifier: 0,
      specialAbility: null
    };
  }
  
  /**
   * Updates the component with data from the blockchain
   */
  public updateFromBlockchain(data: any): void {
    if (data.tokenId) this.tokenId = data.tokenId;
    if (data.ownerAddress) this.ownerAddress = data.ownerAddress;
    if (data.tokenUri) this.tokenUri = data.tokenUri;
    if (data.rarity) this.rarity = data.rarity;
    if (data.battleTxHashes) this.battleTxHashes = data.battleTxHashes;
    
    if (data.blockchainAttributes) {
      this.blockchainAttributes = {
        ...this.blockchainAttributes,
        ...data.blockchainAttributes
      };
    }
  }
  
  /**
   * Serializes the component data for storage
   */
  public serialize(): object {
    return {
      tokenId: this.tokenId,
      ownerAddress: this.ownerAddress,
      tokenUri: this.tokenUri,
      mintTxHash: this.mintTxHash,
      battleTxHashes: this.battleTxHashes,
      rarity: this.rarity,
      blockchainAttributes: { ...this.blockchainAttributes }
    };
  }
}

export default BlockchainComponent;

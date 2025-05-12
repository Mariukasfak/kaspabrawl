import { System, Entity, World } from '../core/ecs';
import { SimComponent } from '../components/SimComponent';
import { BattleStateComponent } from '../components/BattleStateComponent';
import { AbilitiesComponent, SpecialAbility } from '../components/AbilitiesComponent';
import { IdentityComponent } from '../components/IdentityComponent';
import { BlockchainComponent } from '../components/BlockchainComponent';

/**
 * MyBruteBattleSystem handles turn-based combat mechanics inspired by the classic MyBrute game
 */
export class MyBruteBattleSystem implements System {
  /**
   * Update method called each game tick - handles battle progression and events
   */
  public update(world: World): void {
    // Find all entities with battle state components
    const battleEntities = world.getEntitiesByComponents(['battleState', 'sim', 'identity']);
    
    // Group battle entities in pairs
    const activeBattles = this.getActiveBattlePairs(battleEntities);
    
    // Process each active battle
    for (const battle of activeBattles) {
      this.processBattle(world, battle.attacker, battle.defender);
    }
  }

  /**
   * Get paired battle entities
   */
  private getActiveBattlePairs(entities: Entity[]): { attacker: Entity, defender: Entity }[] {
    const pairs: { attacker: Entity, defender: Entity }[] = [];
    const processed = new Set<string>();
    
    for (const entity of entities) {
      if (processed.has(entity.id)) continue;
      
      const battleState = entity.getComponent<BattleStateComponent>('battleState');
      if (!battleState || !battleState.inBattle || !battleState.opponentId) continue;
      
      // Find the opponent entity
      const opponent = entities.find(e => e.id === battleState.opponentId);
      if (!opponent) continue;
      
      processed.add(entity.id);
      processed.add(opponent.id);
      
      // Determine attacker and defender based on initiative/speed
      const entitySim = entity.getComponent<SimComponent>('sim');
      const opponentSim = opponent.getComponent<SimComponent>('sim');
      
      if (!entitySim || !opponentSim) continue;
      
      // Higher agility attacks first
      if (entitySim.attributes.agility >= opponentSim.attributes.agility) {
        pairs.push({ attacker: entity, defender: opponent });
      } else {
        pairs.push({ attacker: opponent, defender: entity });
      }
    }
    
    return pairs;
  }
  
  /**
   * Process a single battle turn
   */
  private processBattle(world: World, attacker: Entity, defender: Entity): void {
    // Get components
    const attackerState = attacker.getComponent<BattleStateComponent>('battleState');
    const defenderState = defender.getComponent<BattleStateComponent>('battleState');
    const attackerSim = attacker.getComponent<SimComponent>('sim');
    const defenderSim = defender.getComponent<SimComponent>('sim');
    const attackerId = attacker.getComponent<IdentityComponent>('identity');
    const defenderId = defender.getComponent<IdentityComponent>('identity');
    
    if (!attackerState || !defenderState || !attackerSim || !defenderSim || !attackerId || !defenderId) {
      return;
    }
    
    // Check if battle is complete
    if (attackerState.currentHealth <= 0 || defenderState.currentHealth <= 0 ||
        attackerState.currentTurn >= attackerState.maxTurns) {
      this.endBattle(world, attacker, defender);
      return;
    }
    
    // Process beginning of turn effects
    this.processStartOfTurnEffects(world, attacker, defender);
    
    // Check if attacker wants to use special ability
    const abilityUsed = this.tryUseSpecialAbility(world, attacker, defender);
    
    if (!abilityUsed) {
      // Regular attack if no ability was used
      this.processRegularAttack(world, attacker, defender);
    }
    
    // Process end of turn effects
    this.processEndOfTurnEffects(world, attacker, defender);
    
    // Increment turn counter
    attackerState.currentTurn++;
    
    // Swap attacker and defender for next turn
    this.swapAttackerDefender(attacker, defender);
  }
  
  /**
   * Handle regular attack mechanics
   */
  private processRegularAttack(world: World, attacker: Entity, defender: Entity): void {
    const attackerSim = attacker.getComponent<SimComponent>('sim');
    const defenderSim = defender.getComponent<SimComponent>('sim');
    const defenderState = defender.getComponent<BattleStateComponent>('battleState');
    const attackerBlockchain = attacker.getComponent<BlockchainComponent>('blockchain');
    
    if (!attackerSim || !defenderSim || !defenderState) return;
    
    // Calculate base damage
    let baseDamage = attackerSim.attributes.strength * 0.8;
    
    // Apply blockchain bonuses if available
    if (attackerBlockchain) {
      baseDamage *= (1 + attackerBlockchain.blockchainAttributes.speedBoost / 10);
    }
    
    // Calculate hit chance (agility vs agility)
    const hitChance = Math.min(0.95, 0.7 + (attackerSim.attributes.agility - defenderSim.attributes.agility) * 0.05);
    
    // Check if attack hits
    if (Math.random() <= hitChance) {
      // Attack hits
      
      // Critical hit chance based on luck
      const critChance = Math.min(0.5, attackerSim.attributes.luck * 0.02);
      const isCritical = Math.random() <= critChance;
      
      // Apply critical damage if applicable
      let damage = isCritical ? baseDamage * 2 : baseDamage;
      
      // Damage reduction from defense
      const damageReduction = defenderSim.attributes.defense * 0.05;
      damage = Math.max(1, damage * (1 - damageReduction));
      
      // Apply damage
      defenderState.currentHealth -= Math.round(damage);
      
      // Add to battle log
      attackerState.battleLog.push({
        turn: attackerState.currentTurn,
        type: isCritical ? 'criticalHit' : 'hit',
        attackerId: attacker.id,
        defenderId: defender.id,
        damage: Math.round(damage)
      });
    } else {
      // Attack missed
      attackerState.battleLog.push({
        turn: attackerState.currentTurn,
        type: 'miss',
        attackerId: attacker.id,
        defenderId: defender.id,
        damage: 0
      });
    }
  }
  
  /**
   * Try to use a special ability
   * @returns true if ability was used, false otherwise
   */
  private tryUseSpecialAbility(world: World, attacker: Entity, defender: Entity): boolean {
    const abilities = attacker.getComponent<AbilitiesComponent>('abilities');
    if (!abilities || abilities.abilities.length === 0) return false;
    
    // Filter active abilities that are not on cooldown
    const availableActiveAbilities = abilities.abilities.filter(
      ability => ability.type === 'active' && ability.currentCooldown === 0
    );
    
    if (availableActiveAbilities.length === 0) return false;
    
    // 50% chance to use a special ability if available
    if (Math.random() > 0.5) return false;
    
    // Randomly select an ability to use
    const selectedAbility = availableActiveAbilities[
      Math.floor(Math.random() * availableActiveAbilities.length)
    ];
    
    // Use the ability and put it on cooldown
    const usedAbility = abilities.useAbility(selectedAbility.id);
    if (!usedAbility) return false;
    
    // Process ability effects
    this.applyAbilityEffects(world, attacker, defender, usedAbility);
    
    // Log ability use
    const attackerState = attacker.getComponent<BattleStateComponent>('battleState');
    if (attackerState) {
      attackerState.battleLog.push({
        turn: attackerState.currentTurn,
        type: 'abilityUse',
        attackerId: attacker.id,
        defenderId: defender.id,
        abilityId: usedAbility.id,
        abilityName: usedAbility.name
      });
    }
    
    return true;
  }
  
  /**
   * Apply effects of a special ability
   */
  private applyAbilityEffects(world: World, attacker: Entity, defender: Entity, ability: SpecialAbility): void {
    const attackerSim = attacker.getComponent<SimComponent>('sim');
    const defenderSim = defender.getComponent<SimComponent>('sim');
    const attackerState = attacker.getComponent<BattleStateComponent>('battleState');
    const defenderState = defender.getComponent<BattleStateComponent>('battleState');
    
    if (!attackerSim || !defenderSim || !attackerState || !defenderState) return;
    
    // Apply each effect of the ability
    for (const effect of ability.effects) {
      // Only apply if random chance succeeds
      if (effect.chance && Math.random() > effect.chance / 100) continue;
      
      switch (effect.type) {
        case 'damage':
          // Direct damage
          if (effect.target === 'opponent' || effect.target === 'both') {
            const damage = Math.round(effect.value);
            defenderState.currentHealth -= damage;
            
            attackerState.battleLog.push({
              turn: attackerState.currentTurn,
              type: 'abilityDamage',
              attackerId: attacker.id,
              defenderId: defender.id,
              abilityId: ability.id,
              damage
            });
          }
          break;
          
        case 'heal':
          // Healing
          if (effect.target === 'self' || effect.target === 'both') {
            const healAmount = Math.round(effect.value);
            attackerState.currentHealth = Math.min(
              attackerState.maxHealth,
              attackerState.currentHealth + healAmount
            );
            
            attackerState.battleLog.push({
              turn: attackerState.currentTurn,
              type: 'abilityHeal',
              attackerId: attacker.id,
              defenderId: defender.id,
              abilityId: ability.id,
              healAmount
            });
          }
          break;
          
        case 'buff':
          // Temporary stat boost
          if (effect.stat && (effect.target === 'self' || effect.target === 'both')) {
            // Add buff to state
            attackerState.activeEffects.push({
              type: 'buff',
              stat: effect.stat,
              value: effect.value,
              duration: effect.duration || 1,
              source: ability.id
            });
            
            attackerState.battleLog.push({
              turn: attackerState.currentTurn,
              type: 'abilityBuff',
              attackerId: attacker.id,
              defenderId: attacker.id, // Self buff
              abilityId: ability.id,
              stat: effect.stat,
              value: effect.value
            });
          }
          break;
          
        case 'debuff':
          // Temporary stat reduction
          if (effect.stat && (effect.target === 'opponent' || effect.target === 'both')) {
            // Add debuff to state
            defenderState.activeEffects.push({
              type: 'debuff',
              stat: effect.stat,
              value: effect.value,
              duration: effect.duration || 1,
              source: ability.id
            });
            
            attackerState.battleLog.push({
              turn: attackerState.currentTurn,
              type: 'abilityDebuff',
              attackerId: attacker.id,
              defenderId: defender.id,
              abilityId: ability.id,
              stat: effect.stat,
              value: effect.value
            });
          }
          break;
          
        case 'stun':
          // Stun opponent (skip next turn)
          if (effect.target === 'opponent') {
            defenderState.activeEffects.push({
              type: 'stun',
              value: 0,
              duration: effect.duration || 1,
              source: ability.id
            });
            
            attackerState.battleLog.push({
              turn: attackerState.currentTurn,
              type: 'abilityStun',
              attackerId: attacker.id,
              defenderId: defender.id,
              abilityId: ability.id,
              duration: effect.duration || 1
            });
          }
          break;
      }
    }
  }
  
  /**
   * Process start of turn effects
   */
  private processStartOfTurnEffects(world: World, attacker: Entity, defender: Entity): void {
    const attackerState = attacker.getComponent<BattleStateComponent>('battleState');
    if (!attackerState) return;
    
    // Check for stun effect
    const stunEffect = attackerState.activeEffects.find(effect => effect.type === 'stun');
    if (stunEffect) {
      // Skip this turn due to stun
      attackerState.battleLog.push({
        turn: attackerState.currentTurn,
        type: 'stunned',
        attackerId: attacker.id,
        defenderId: defender.id
      });
      
      // Reduce stun duration
      stunEffect.duration--;
      if (stunEffect.duration <= 0) {
        // Remove effect after it expires
        attackerState.activeEffects = attackerState.activeEffects.filter(e => e !== stunEffect);
      }
      
      // Swap turn since attacker is stunned
      this.swapAttackerDefender(attacker, defender);
      return;
    }
    
    // Apply all other active effects
    this.applyActiveEffects(attacker);
  }
  
  /**
   * Process end of turn effects
   */
  private processEndOfTurnEffects(world: World, attacker: Entity, defender: Entity): void {
    const attackerState = attacker.getComponent<BattleStateComponent>('battleState');
    const abilities = attacker.getComponent<AbilitiesComponent>('abilities');
    
    if (!attackerState) return;
    
    // Reduce duration of all effects
    attackerState.activeEffects.forEach(effect => {
      if (effect.type !== 'stun') { // Stun is handled at start of turn
        effect.duration--;
      }
    });
    
    // Remove expired effects
    attackerState.activeEffects = attackerState.activeEffects.filter(effect => effect.duration > 0);
    
    // Update ability cooldowns
    if (abilities) {
      abilities.updateCooldowns();
    }
  }
  
  /**
   * Apply active status effects to entity stats
   */
  private applyActiveEffects(entity: Entity): void {
    const state = entity.getComponent<BattleStateComponent>('battleState');
    const sim = entity.getComponent<SimComponent>('sim');
    
    if (!state || !sim) return;
    
    // Store original stats if not already stored
    if (!state.originalAttributes) {
      state.originalAttributes = { ...sim.attributes };
    }
    
    // Reset to original stats first
    sim.attributes = { ...state.originalAttributes };
    
    // Apply all active effects
    for (const effect of state.activeEffects) {
      if ((effect.type === 'buff' || effect.type === 'debuff') && effect.stat) {
        const modifier = effect.type === 'buff' ? 1 : -1;
        
        // Modify the stat based on the effect
        if (sim.attributes[effect.stat] !== undefined) {
          sim.attributes[effect.stat] += modifier * effect.value;
          
          // Ensure stats don't go below 1
          sim.attributes[effect.stat] = Math.max(1, sim.attributes[effect.stat]);
        }
      }
    }
  }
  
  /**
   * Swap attacker and defender roles for next turn
   */
  private swapAttackerDefender(attacker: Entity, defender: Entity): void {
    const attackerState = attacker.getComponent<BattleStateComponent>('battleState');
    const defenderState = defender.getComponent<BattleStateComponent>('battleState');
    
    if (!attackerState || !defenderState) return;
    
    // Swap isAttacker flag
    attackerState.isAttacker = false;
    defenderState.isAttacker = true;
  }
  
  /**
   * End the battle and determine the winner
   */
  private endBattle(world: World, entity1: Entity, entity2: Entity): void {
    const state1 = entity1.getComponent<BattleStateComponent>('battleState');
    const state2 = entity2.getComponent<BattleStateComponent>('battleState');
    
    if (!state1 || !state2) return;
    
    // Determine winner based on remaining health
    let winnerId: string;
    let loserId: string;
    
    if (state1.currentHealth <= 0) {
      winnerId = entity2.id;
      loserId = entity1.id;
    } else if (state2.currentHealth <= 0) {
      winnerId = entity1.id;
      loserId = entity2.id;
    } else if (state1.currentHealth > state2.currentHealth) {
      winnerId = entity1.id;
      loserId = entity2.id;
    } else {
      winnerId = entity2.id;
      loserId = entity1.id;
    }
    
    // Add final battle log entry
    state1.battleLog.push({
      turn: state1.currentTurn,
      type: 'battleEnd',
      winnerId,
      loserId
    });
    
    // Copy battle log to both entities
    state2.battleLog = [...state1.battleLog];
    
    // Set battle complete flags
    state1.inBattle = false;
    state2.inBattle = false;
    state1.battleComplete = true;
    state2.battleComplete = true;
    
    // Restore original attributes
    const sim1 = entity1.getComponent<SimComponent>('sim');
    const sim2 = entity2.getComponent<SimComponent>('sim');
    
    if (sim1 && state1.originalAttributes) {
      sim1.attributes = { ...state1.originalAttributes };
      state1.originalAttributes = undefined;
    }
    
    if (sim2 && state2.originalAttributes) {
      sim2.attributes = { ...state2.originalAttributes };
      state2.originalAttributes = undefined;
    }
  }
}

export default MyBruteBattleSystem;

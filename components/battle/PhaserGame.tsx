import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { FightStep, Fighter } from '../../utils/simulateFight';
import BattleArena from './BattleArena';
import { EquipmentSlot, Equipment, EquipmentLoadout } from '../../types/equipment';

interface GameProps {
  walletAddress?: string | null;
  fightLog?: FightStep[];
  fighterA?: Fighter;
  fighterB?: Fighter;
}

// Configure Phaser game scene - Simple entry scene that loads into BattleArena
class MainScene extends Phaser.Scene {
  private fightSteps: FightStep[] = [];
  private fighterA?: Fighter;
  private fighterB?: Fighter;
  private fighterMaxHP: Record<string, number> = {};
  private fighterCurrentHP: Record<string, number> = {};
  private healthBar1?: Phaser.GameObjects.Rectangle;
  private healthBar2?: Phaser.GameObjects.Rectangle;
  private healthText1?: Phaser.GameObjects.Text;
  private healthText2?: Phaser.GameObjects.Text;
  private fighter1?: Phaser.GameObjects.Sprite;
  private fighter2?: Phaser.GameObjects.Sprite;
  private actionText?: Phaser.GameObjects.Text;
  private currentStepIndex: number = 0;
  private processingStep: boolean = false;

  // Equipment sprites storage
  private equipmentSprites: {
    fighter1: Phaser.GameObjects.Sprite[];
    fighter2: Phaser.GameObjects.Sprite[];
  } = { fighter1: [], fighter2: [] };
  
  /**
   * Synchronizes equipment position with fighter sprites during animations
   */
  /**
   * Synchronizes equipment position with fighter sprites during animations
   * @param fighter - The fighter sprite to sync equipment with
   * @param isFirstFighter - Whether this is fighter 1 (left) or fighter 2 (right)
   */
  syncEquipmentWithFighter(
    fighter: Phaser.GameObjects.Sprite | undefined, 
    isFirstFighter: boolean
  ): void {
    if (!fighter) return;
    
    const equipmentArray = isFirstFighter ? this.equipmentSprites.fighter1 : this.equipmentSprites.fighter2;
    if (equipmentArray.length === 0) return;
    
    // Calculate offsets based on fighter orientation
    const weaponOffsetX = isFirstFighter ? 30 : -30;
    const weaponOffsetY = -50;
    const shieldOffsetX = isFirstFighter ? -30 : 30;
    const shieldOffsetY = -40;
    
    // Update equipment positions
    equipmentArray.forEach((item, index) => {
      if (index === 0) { // Weapon
        item.setPosition(fighter.x + weaponOffsetX, fighter.y + weaponOffsetY);
        item.setFlipX(!isFirstFighter);
        item.setAngle(fighter.angle);
      } else if (index === 1) { // Shield
        item.setPosition(fighter.x + shieldOffsetX, fighter.y + shieldOffsetY);
        item.setFlipX(!isFirstFighter);
        // Match fighter rotation for shield
        item.setAngle(fighter.angle * 0.5); // Less rotation for shield
      }
    });
  }

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: { fightLog?: FightStep[], fighterA?: Fighter, fighterB?: Fighter }) {
    if (data.fightLog) {
      this.fightSteps = data.fightLog;
    }
    
    if (data.fighterA) {
      this.fighterA = data.fighterA;
    }
    
    if (data.fighterB) {
      this.fighterB = data.fighterB;
    }
  }

  preload() {
    // Load all required images for the game
    this.load.image('background', '/images/arena-bg.png');
    
    // Load individual fighter sprites based on fighter designs
    this.load.image('fighter-berserker', '/images/fighters/berserker.png');
    this.load.image('fighter-ninja', '/images/fighters/ninja.png');
    this.load.image('fighter-tank', '/images/fighters/tank.png');
    this.load.image('fighter-mage', '/images/fighters/mage.png');
    this.load.image('fighter-rogue', '/images/fighters/rogue.png');
    
    // Default fallbacks
    this.load.image('fighter1', '/images/fighter-1.png');
    this.load.image('fighter2', '/images/fighter-2.png');
    this.load.image('platform', '/images/platform.png');
    
    // Load equipment images
    this.load.image('weapon-sword', '/images/equipment/sword.png');
    this.load.image('weapon-axe', '/images/equipment/axe.png');
    this.load.image('weapon-staff', '/images/equipment/staff.png');
    this.load.image('shield', '/images/equipment/shield.png');
    
    // Optionally load particles if you use them
    this.load.image('particle1', '/images/particle1.png');
    this.load.image('particle2', '/images/particle2.png');
    this.load.image('particle3', '/images/particle3.png');
    
    // Fallback for background if not found
    this.load.on('loaderror', (file: { key: string }) => {
      if (file.key === 'background') {
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(0x1a1a2e);
        graphics.fillRect(0, 0, 800, 600);
        graphics.generateTexture('background', 800, 600);
      } else if (file.key.startsWith('fighter-')) {
        // Create fallback fighter sprites if not found
        console.warn(`Fighter sprite ${file.key} not found, using fallback`);
      }
    });
  }

  create() {
    // Initialize the scene
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Add background with particle effect
    try {
      const background = this.add.image(width / 2, height / 2, 'background')
        .setDisplaySize(width, height);

      // Create a texture key for particles
      const particleKey = 'particle';
      if (!this.textures.exists(particleKey)) {
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture(particleKey, 8, 8);
      }

      // Add particles with the custom texture
      try {
        const particles = this.add.particles(0, 0, particleKey, {
          x: width / 2,
          y: height - 100,
          scale: { start: 0.05, end: 0 },
          speed: { min: 50, max: 100 },
          angle: { min: -180, max: 0 },
          quantity: 1,
          frequency: 1000,
          lifespan: 2000,
          alpha: { start: 0.5, end: 0 },
          tint: 0x5c2b97,
          blendMode: 'ADD'
        });
      } catch (e) {
        console.warn('Failed to create particle effect:', e);
      }

    } catch (e) {
      console.warn('Failed to add background image, using fallback');
      this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
    }

    // Create action text
    this.actionText = this.add.text(
      width / 2,
      height - 100,
      'Ready to fight!',
      {
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: width * 0.8 }
      }
    ).setOrigin(0.5);

    // If we have fight log data, start the animation
    if (this.fightSteps.length > 0) {
      this.initializeFighters();
    } else {
      // Show welcome message if no fight data
      this.add.text(
        width / 2,
        height / 2,
        'Kaspa Brawl Game\nReady to Fight!',
        {
          color: '#ffffff',
          fontSize: '32px',
          align: 'center',
        }
      ).setOrigin(0.5);

      // Add a simple animation
      this.add.rectangle(
        width / 2,
        height / 2 + 100,
        200,
        10,
        0x4ecdc4
      ).setOrigin(0.5);
    }
  }

  initializeFighters() {
    if (this.fightSteps.length === 0) return;
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Get the first step to identify fighters
    const firstStep = this.fightSteps[0];
    
    // Track fighter IDs
    const fighter1Id = firstStep.attacker;
    const fighter2Id = firstStep.defender;
    
    // Determine fighter sprite based on fighter design if available
    const fighter1Design = this.fighterA?.design?.name?.toLowerCase() || '';
    const fighter2Design = this.fighterB?.design?.name?.toLowerCase() || '';
    
    const fighter1Sprite = fighter1Design && this.textures.exists(`fighter-${fighter1Design}`) 
      ? `fighter-${fighter1Design}` 
      : 'fighter1';
      
    const fighter2Sprite = fighter2Design && this.textures.exists(`fighter-${fighter2Design}`) 
      ? `fighter-${fighter2Design}` 
      : 'fighter2';
    
    // Create fighters with appropriate sprites - always face each other
    this.fighter1 = this.add.sprite(width * 0.25, height * 0.5, fighter1Sprite)
      .setDisplaySize(150, 150)
      .setFlipX(false); // Left fighter faces right
    this.fighter2 = this.add.sprite(width * 0.75, height * 0.5, fighter2Sprite)
      .setDisplaySize(150, 150)
      .setFlipX(true); // Right fighter faces left

    // Add equipment to fighters
    this.addEquipmentToFighter(this.fighter1, true, this.fighterA?.equipment);
    this.addEquipmentToFighter(this.fighter2, false, this.fighterB?.equipment);
    
    // Initialize health bars
    // Use fighter maxHp values if available, otherwise use defaults or log values
    this.fighterMaxHP[fighter1Id] = this.fighterA?.maxHp || 100;
    this.fighterMaxHP[fighter2Id] = this.fighterB?.maxHp || 100;
    
    // Find initial HP values from fighters or fight step
    if (firstStep.remainingHp) {
      this.fighterCurrentHP[fighter1Id] = Math.min(this.fighterMaxHP[fighter1Id], firstStep.remainingHp.attackerHp);
      this.fighterCurrentHP[fighter2Id] = Math.min(this.fighterMaxHP[fighter2Id], firstStep.remainingHp.defenderHp);
    } else {
      this.fighterCurrentHP[fighter1Id] = this.fighterA?.hp || this.fighterMaxHP[fighter1Id];
      this.fighterCurrentHP[fighter2Id] = this.fighterB?.hp || this.fighterMaxHP[fighter2Id];
    }
    
    // Create health bar backgrounds
    this.add.rectangle(width * 0.25, height * 0.3, 150, 15, 0x333333)
      .setOrigin(0.5);
    this.add.rectangle(width * 0.75, height * 0.3, 150, 15, 0x333333)
      .setOrigin(0.5);
    
    // Create health bars
    this.healthBar1 = this.add.rectangle(
      width * 0.25, 
      height * 0.3, 
      150 * (this.fighterCurrentHP[fighter1Id] / this.fighterMaxHP[fighter1Id]), 
      15, 
      0x00ff00
    ).setOrigin(0.5);
    
    this.healthBar2 = this.add.rectangle(
      width * 0.75, 
      height * 0.3, 
      150 * (this.fighterCurrentHP[fighter2Id] / this.fighterMaxHP[fighter2Id]), 
      15, 
      0x00ff00
    ).setOrigin(0.5);
    
    // Create health text
    this.healthText1 = this.add.text(
      width * 0.25, 
      height * 0.3 - 25, 
      `${this.fighterCurrentHP[fighter1Id]}/${this.fighterMaxHP[fighter1Id]}`, 
      { fontSize: '18px', color: '#ffffff' }
    ).setOrigin(0.5);
    
    this.healthText2 = this.add.text(
      width * 0.75, 
      height * 0.3 - 25, 
      `${this.fighterCurrentHP[fighter2Id]}/${this.fighterMaxHP[fighter2Id]}`, 
      { fontSize: '18px', color: '#ffffff' }
    ).setOrigin(0.5);
    
    // Update the text to indicate start of battle
    if (this.actionText) {
      this.actionText.setText('Battle begins!');
    }
    // Start auto battle
    this.time.delayedCall(1000, () => this.processNextStep());
  }
  
  processNextStep() {
    if (this.currentStepIndex >= this.fightSteps.length) {
      if (this.actionText) {
        this.actionText.setText('Battle complete!');
      }
      return;
    }
    const step = this.fightSteps[this.currentStepIndex];
    this.processingStep = true;
    // Update action text
    if (this.actionText) {
      this.actionText.setText(step.text);
    }
    // Animate the attack
    if (step.type === 'attack' || step.type === 'skill' || step.type === 'critical') {
      // Determine which fighter is attacking
      const isFirstFighterAttacking = step.attacker === this.fightSteps[0].attacker;
      const attackingFighter = isFirstFighterAttacking ? this.fighter1 : this.fighter2;
      const defendingFighter = isFirstFighterAttacking ? this.fighter2 : this.fighter1;
      
      if (attackingFighter && defendingFighter) {
        // Ensure fighters are always facing each other
        attackingFighter.setFlipX(!isFirstFighterAttacking);
        defendingFighter.setFlipX(isFirstFighterAttacking);
        
        // Prepare equipment overlay if available (for future use)
        let weaponSprite: Phaser.GameObjects.Sprite | null = null;
        
        // More dynamic attack animation based on attack type
        if (step.type === 'attack') {
          // Basic attack animation - lunge forward
          this.tweens.add({
            targets: attackingFighter,
            x: isFirstFighterAttacking ?
              attackingFighter.x + 70 :
              attackingFighter.x - 70,
            duration: 200,
            ease: 'Power1',
            yoyo: true,
            onComplete: () => this.showDamageEffect(step, attackingFighter, defendingFighter, isFirstFighterAttacking)
          });
        } 
        else if (step.type === 'critical') {
          // Critical hit animation - jump and stronger attack
          this.tweens.add({
            targets: attackingFighter,
            x: isFirstFighterAttacking ?
              attackingFighter.x + 90 :
              attackingFighter.x - 90,
            y: attackingFighter.y - 40, // Jump
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
              // Return to ground
              this.tweens.add({
                targets: attackingFighter,
                y: attackingFighter.y + 40,
                x: isFirstFighterAttacking ?
                  attackingFighter.x - 90 :
                  attackingFighter.x + 90,
                duration: 200,
                ease: 'Bounce',
                onComplete: () => this.showDamageEffect(step, attackingFighter, defendingFighter, isFirstFighterAttacking, true)
              });
            }
          });
        }
        else if (step.type === 'skill') {
          // Skill animation - spin or special move
          // Add a flash effect for skills
          const flashFx = this.add.graphics();
          flashFx.fillStyle(0x00ffff, 0.3);
          flashFx.fillCircle(attackingFighter.x, attackingFighter.y - 50, 50);
          
          // Spin animation for skill
          this.tweens.add({
            targets: attackingFighter,
            angle: isFirstFighterAttacking ? 360 : -360,
            duration: 500,
            onStart: () => {
              // Fade out the flash effect
              this.tweens.add({
                targets: flashFx,
                alpha: 0,
                duration: 300,
                onComplete: () => flashFx.destroy()
              });
            },
            onComplete: () => {
              attackingFighter.angle = 0; // Reset angle
              // Move forward after spin
              this.tweens.add({
                targets: attackingFighter,
                x: isFirstFighterAttacking ?
                  attackingFighter.x + 80 :
                  attackingFighter.x - 80,
                duration: 200,
                ease: 'Power1',
                yoyo: true,
                onComplete: () => this.showDamageEffect(step, attackingFighter, defendingFighter, isFirstFighterAttacking, false, true)
              });
            }
          });
        }
      }
    } else if (step.type === 'end') {
      // End of battle animation
      if (this.actionText) {
        this.actionText.setText(step.text);
        // Make the text more prominent
        this.tweens.add({
          targets: this.actionText,
          scale: 1.3,
          duration: 300,
          yoyo: true
        });
      }
      
      // Show victory/defeat animations
      const isFirstFighterWinner = step.text.includes(this.fightSteps[0].attacker);
      const winner = isFirstFighterWinner ? this.fighter1 : this.fighter2;
      const loser = isFirstFighterWinner ? this.fighter2 : this.fighter1;
      
      if (winner) {
        // Victory jump animation
        this.tweens.add({
          targets: winner,
          y: winner.y - 30,
          duration: 300,
          yoyo: true,
          repeat: 2,
          ease: 'Sine.easeOut'
        });
        
        // Victory particles
        const particles = this.add.particles(0, 0, 'particle3', {
          x: winner.x,
          y: winner.y - 100,
          speed: { min: 50, max: 100 },
          scale: { start: 0.1, end: 0 },
          quantity: 1,
          frequency: 50,
          lifespan: 1000,
          blendMode: 'ADD',
          emitting: true
        });
        
        // Stop particles after a while
        this.time.delayedCall(2000, () => {
          particles.destroy();
        });
      }
      
      if (loser) {
        // Defeat animation - fall down
        this.tweens.add({
          targets: loser,
          y: loser.y + 20,
          angle: isFirstFighterWinner ? -90 : 90,
          duration: 500,
          ease: 'Power1'
        });
      }
      
      this.currentStepIndex++;
      this.processingStep = false;
      this.time.delayedCall(2500, () => this.processNextStep());
    } else if (step.type === 'dodge') {
      // Special dodge animation
      const isFirstFighterAttacking = step.attacker === this.fightSteps[0].attacker;
      const attackingFighter = isFirstFighterAttacking ? this.fighter1 : this.fighter2;
      const defendingFighter = isFirstFighterAttacking ? this.fighter2 : this.fighter1;
      
      if (attackingFighter && defendingFighter) {
        // Attacker lunges
        this.tweens.add({
          targets: attackingFighter,
          x: isFirstFighterAttacking ?
            attackingFighter.x + 50 :
            attackingFighter.x - 50,
          duration: 200,
          yoyo: true
        });
        
        // Defender dodges by moving back and slightly down
        this.tweens.add({
          targets: defendingFighter,
          x: isFirstFighterAttacking ?
            defendingFighter.x + 30 :
            defendingFighter.x - 30,
          y: defendingFighter.y + 15,
          duration: 200,
          yoyo: true,
          onComplete: () => {
            // Add dodge text
            const dodgeText = this.add.text(
              defendingFighter.x,
              defendingFighter.y - 80,
              'DODGE!',
              { 
                fontSize: '20px', 
                color: '#00ffff',
                stroke: '#000000',
                strokeThickness: 2
              }
            ).setOrigin(0.5);
            
            this.tweens.add({
              targets: dodgeText,
              y: dodgeText.y - 30,
              alpha: 0,
              duration: 800,
              onComplete: () => dodgeText.destroy()
            });
            
            // Update health and move to next step
            this.updateHealthBars(step);
            this.time.delayedCall(1200, () => {
              this.currentStepIndex++;
              this.processingStep = false;
              this.processNextStep();
            });
          }
        });
      }
    } else if (step.type === 'block') {
      // Special block animation
      const isFirstFighterAttacking = step.attacker === this.fightSteps[0].attacker;
      const attackingFighter = isFirstFighterAttacking ? this.fighter1 : this.fighter2;
      const defendingFighter = isFirstFighterAttacking ? this.fighter2 : this.fighter1;
      
      if (attackingFighter && defendingFighter) {
        // Attacker lunges
        this.tweens.add({
          targets: attackingFighter,
          x: isFirstFighterAttacking ?
            attackingFighter.x + 50 :
            attackingFighter.x - 50,
          duration: 200,
          yoyo: true
        });
        
        // Defender blocks - just a slight movement back
        this.tweens.add({
          targets: defendingFighter,
          x: isFirstFighterAttacking ?
            defendingFighter.x + 10 :
            defendingFighter.x - 10,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            // Create shield effect
            const shieldGraphic = this.add.graphics();
            const shieldX = defendingFighter.x + (isFirstFighterAttacking ? -30 : 30);
            shieldGraphic.fillStyle(0x4488ff, 0.6);
            shieldGraphic.fillCircle(shieldX, defendingFighter.y - 50, 50);
            shieldGraphic.lineStyle(3, 0x8899ff, 1);
            shieldGraphic.strokeCircle(shieldX, defendingFighter.y - 50, 50);
            
            // Add block text
            const blockText = this.add.text(
              defendingFighter.x,
              defendingFighter.y - 100,
              'BLOCK!',
              { 
                fontSize: '20px', 
                color: '#ffff00',
                stroke: '#000000',
                strokeThickness: 2
              }
            ).setOrigin(0.5);
            
            // Fade out shield and text
            this.tweens.add({
              targets: [shieldGraphic, blockText],
              alpha: 0,
              duration: 800,
              onComplete: () => {
                shieldGraphic.destroy();
                blockText.destroy();
              }
            });
            
            // Show reduced damage
            if (step.damage && step.damage > 0) {
              const damageText = this.add.text(
                defendingFighter.x,
                defendingFighter.y - 60,
                `-${step.damage}`,
                { 
                  fontSize: '18px', 
                  color: '#ffff00',
                  stroke: '#000000',
                  strokeThickness: 2
                }
              ).setOrigin(0.5);
              
              this.tweens.add({
                targets: damageText,
                y: damageText.y - 30,
                alpha: 0,
                duration: 800,
                onComplete: () => damageText.destroy()
              });
            }
            
            // Update health and move to next step
            this.updateHealthBars(step);
            this.time.delayedCall(1200, () => {
              this.currentStepIndex++;
              this.processingStep = false;
              this.processNextStep();
            });
          }
        });
      }
    } else {
      // For other step types
      this.updateHealthBars(step);
      // Continue to next step after a delay
      this.time.delayedCall(1200, () => {
        this.currentStepIndex++;
        this.processingStep = false;
        this.processNextStep();
      });
    }
  }
  
  updateHealthBars(step: FightStep) {
    if (!step.remainingHp) return;
    
    const fighter1Id = this.fightSteps[0].attacker;
    const fighter2Id = this.fightSteps[0].defender;
    
    // Update current HP values with proper clamping between 0 and max
    this.fighterCurrentHP[fighter1Id] = Math.max(0, Math.min(this.fighterMaxHP[fighter1Id], step.remainingHp.attackerHp));
    this.fighterCurrentHP[fighter2Id] = Math.max(0, Math.min(this.fighterMaxHP[fighter2Id], step.remainingHp.defenderHp));
    
    // Update health bar widths
    if (this.healthBar1) {
      // Ensure healthBar width is never negative
      const healthRatio = Math.max(0, this.fighterCurrentHP[fighter1Id] / this.fighterMaxHP[fighter1Id]);
      this.healthBar1.width = 150 * healthRatio;
      
      // Change color based on HP percentage
      const hpPercentage = healthRatio;
      if (hpPercentage < 0.2) {
        this.healthBar1.fillColor = 0xff0000; // Red
      } else if (hpPercentage < 0.5) {
        this.healthBar1.fillColor = 0xffff00; // Yellow
      } else {
        this.healthBar1.fillColor = 0x00ff00; // Green
      }
    }
    
    if (this.healthBar2) {
      // Ensure healthBar width is never negative
      const healthRatio = Math.max(0, this.fighterCurrentHP[fighter2Id] / this.fighterMaxHP[fighter2Id]);
      this.healthBar2.width = 150 * healthRatio;
      
      // Change color based on HP percentage
      const hpPercentage = healthRatio;
      if (hpPercentage < 0.2) {
        this.healthBar2.fillColor = 0xff0000; // Red
      } else if (hpPercentage < 0.5) {
        this.healthBar2.fillColor = 0xffff00; // Yellow
      } else {
        this.healthBar2.fillColor = 0x00ff00; // Green
      }
    }
    
    // Update health text
    if (this.healthText1) {
      this.healthText1.setText(`${this.fighterCurrentHP[fighter1Id]}/${this.fighterMaxHP[fighter1Id]}`);
    }
    
    if (this.healthText2) {
      this.healthText2.setText(`${this.fighterCurrentHP[fighter2Id]}/${this.fighterMaxHP[fighter2Id]}`);
    }
  }

  showDamageEffect(
    step: FightStep, 
    attackingFighter: Phaser.GameObjects.Sprite, 
    defendingFighter: Phaser.GameObjects.Sprite, 
    isFirstFighterAttacking: boolean,
    isCritical = false,
    isSkill = false
  ) {
    // Show damage effect on defender if damage was dealt
    if (step.damage && step.damage > 0) {
      // Create damage number text that floats up
      const damageText = this.add.text(
        defendingFighter.x,
        defendingFighter.y - 80,
        `-${step.damage}`,
        { 
          fontSize: isCritical ? '28px' : '22px', 
          color: isCritical ? '#ff0000' : '#ffffff',
          fontStyle: isCritical ? 'bold' : 'normal',
          stroke: '#000000',
          strokeThickness: 3
        }
      ).setOrigin(0.5);
      
      // Animate the damage text floating up and fading out
      this.tweens.add({
        targets: damageText,
        y: damageText.y - 50,
        alpha: 0,
        duration: 1000,
        ease: 'Power1',
        onComplete: () => damageText.destroy()
      });
      
      // Shake and flash effect on defender
      this.tweens.add({
        targets: defendingFighter,
        alpha: 0.7,
        x: defendingFighter.x + (isCritical ? 15 : 10) * (Math.random() > 0.5 ? 1 : -1),
        y: defendingFighter.y - 10,
        duration: 100,
        yoyo: true,
        repeat: isCritical ? 3 : 1,
        onComplete: () => {
          // Reset position
          this.tweens.add({
            targets: defendingFighter,
            x: isFirstFighterAttacking ? 
              this.cameras.main.width * 0.75 : 
              this.cameras.main.width * 0.25,
            y: this.cameras.main.height * 0.5,
            alpha: 1,
            duration: 200
          });
        }
      });
      
      // Create particle effects based on attack type
      const particleX = defendingFighter.x;
      const particleY = defendingFighter.y - 70;
      
      const particles = this.add.particles(0, 0, 
        isCritical ? 'particle2' : isSkill ? 'particle3' : 'particle1', 
      {
        x: particleX,
        y: particleY,
        speed: { min: 50, max: isCritical ? 200 : 120 },
        scale: { start: isCritical ? 0.2 : 0.1, end: 0 },
        quantity: isCritical ? 20 : isSkill ? 15 : 10,
        lifespan: 800,
        gravityY: 200,
        blendMode: 'ADD'
      });
      
      // Stop emitting after a short time
      this.time.delayedCall(300, () => {
        particles.destroy();
      });
      
      // Update health bars
      this.updateHealthBars(step);
    }
    
    // Show special effect if any
    if (step.specialEffect) {
      const effectText = this.add.text(
        defendingFighter.x,
        defendingFighter.y - 50,
        step.specialEffect.name,
        { 
          fontSize: '20px', 
          color: '#ff00ff',
          stroke: '#000000',
          strokeThickness: 2 
        }
      ).setOrigin(0.5);
      
      this.tweens.add({
        targets: effectText,
        y: effectText.y - 30,
        alpha: 0,
        duration: 1000,
        onComplete: () => effectText.destroy()
      });
    }
    
    // Continue to next step after a delay
    this.time.delayedCall(1500, () => {
      this.currentStepIndex++;
      this.processingStep = false;
      this.processNextStep();
    });
  }

  /**
   * Adds equipment visuals to a fighter sprite
   * @param fighterSprite - The fighter sprite to add equipment to
   * @param isFirstFighter - Whether this is fighter 1 (left) or fighter 2 (right)
   * @param equipment - The equipment loadout
   */
  private addEquipmentToFighter(
    fighterSprite: Phaser.GameObjects.Sprite | undefined, 
    isFirstFighter: boolean,
    equipment: EquipmentLoadout | undefined
  ): void {
    if (!fighterSprite) return;
    
    // Clear existing equipment sprites for this fighter
    const equipmentArray = isFirstFighter ? this.equipmentSprites.fighter1 : this.equipmentSprites.fighter2;
    equipmentArray.forEach(sprite => sprite.destroy());
    equipmentArray.length = 0;
    
    if (!equipment) return;
    
    // Add weapon if equipped
    if (equipment[EquipmentSlot.WEAPON]) {
      let weaponKey = 'weapon-sword'; // Default weapon
      
      // Determine weapon type based on name
      const weaponName = String(equipment[EquipmentSlot.WEAPON]?.name || '').toLowerCase();
      if (weaponName.includes('axe')) {
        weaponKey = 'weapon-axe';
      } else if (weaponName.includes('staff')) {
        weaponKey = 'weapon-staff';
      }
      
      // Create weapon sprite
      if (this.textures.exists(weaponKey)) {
        const weaponSprite = this.add.sprite(
          fighterSprite.x + (isFirstFighter ? 30 : -30), 
          fighterSprite.y - 50,
          weaponKey
        ).setScale(0.7);
        
        // Flip weapon if needed
        if (!isFirstFighter) {
          weaponSprite.setFlipX(true);
        }
        
        // Store weapon sprite reference
        equipmentArray.push(weaponSprite);
      }
    }
    
    // Add shield if there's shield equipment (check in the weapon slot, we don't have a specific OFFHAND slot)
    // We'll check if the name contains "shield" to determine if it's a shield
    if (equipment[EquipmentSlot.WEAPON]) {
      const offhandName = String(equipment[EquipmentSlot.WEAPON]?.name || '').toLowerCase();
      if (offhandName.includes('shield') && this.textures.exists('shield')) {
        const shieldSprite = this.add.sprite(
          fighterSprite.x + (isFirstFighter ? -30 : 30), 
          fighterSprite.y - 40,
          'shield'
        ).setScale(0.6);
        
        // Flip shield if needed
        if (!isFirstFighter) {
          shieldSprite.setFlipX(true);
        }
        
        // Store shield sprite reference
        equipmentArray.push(shieldSprite);
      }
    }
    
    // Add visual effects based on equipment rarity
    let highestRarity = 'common';
    let rarityLevel = 0;
    
    // Check all equipment items for highest rarity
    Object.values(equipment).forEach((item: any) => {
      if (!item || !item.rarity) return;
      
      const rarityOrder: Record<string, number> = {
        'common': 0,
        'uncommon': 1,
        'rare': 2,
        'epic': 3,
        'legendary': 4
      };
      
      const itemRarity = String(item.rarity).toLowerCase();
      if (rarityOrder[itemRarity] > rarityOrder[highestRarity]) {
        highestRarity = itemRarity;
        rarityLevel = rarityOrder[itemRarity];
      }
    });
    
    // Add rarity glow for uncommon+ equipment
    if (rarityLevel > 0) {
      const rarityColors: Record<string, number> = {
        'uncommon': 0x00ff00,
        'rare': 0x0099ff,
        'epic': 0xaa00ff,
        'legendary': 0xffaa00
      };
      
      const rarityColor = rarityColors[highestRarity] || 0xffffff;
      
      // Create glow effect
      const glow = this.add.graphics();
      glow.fillStyle(rarityColor, 0.3);
      glow.fillCircle(fighterSprite.x, fighterSprite.y - 50, 70);
      
      // Add a slight pulsing effect
      this.tweens.add({
        targets: glow,
        alpha: 0.1,
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
    }
  }

  update(time: number) {
    // Sync equipment with fighter movement
    if (this.fighter1 && this.equipmentSprites.fighter1.length > 0) {
      this.syncEquipmentWithFighter(this.fighter1, true);
    }
    if (this.fighter2 && this.equipmentSprites.fighter2.length > 0) {
      this.syncEquipmentWithFighter(this.fighter2, false);
    }
  }
}

const PhaserGame: React.FC<GameProps> = ({ walletAddress, fightLog, fighterA, fighterB }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !gameRef.current && containerRef.current) {
      // Configure the Phaser game
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        backgroundColor: '#1a1a2e',
        scale: {
          mode: Phaser.Scale.FIT,
          width: 800,
          height: 600,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0, x: 0 }, // Removed gravity for fighting game
            debug: false,
          },
        },
        scene: [MainScene],
      };

      // Create the game instance
      gameRef.current = new Phaser.Game(config);
      
      // Wait for the scene to be created before restarting with fight data
      if (fightLog && gameRef.current) {
        // Wait for the scene to be created and active
        const tryRestart = () => {
          if (
            gameRef.current &&
            gameRef.current.scene &&
            gameRef.current.scene.isActive('MainScene')
          ) {
            const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
            scene.scene.restart({ 
              fightLog,
              fighterA,
              fighterB
            });
          } else {
            // Try again on next tick
            setTimeout(tryRestart, 50);
          }
        };
        tryRestart();
      }
    }

    // Cleanup function to destroy the game when component unmounts
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Update game when fightLog changes
  useEffect(() => {
    if (
      gameRef.current &&
      fightLog &&
      gameRef.current.scene &&
      gameRef.current.scene.isActive('MainScene')
    ) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      scene.scene.restart({ 
        fightLog,
        fighterA,
        fighterB
      });
    }
  }, [fightLog, fighterA, fighterB]);

  return <div ref={containerRef} className="game-container" />;
};

export default PhaserGame;

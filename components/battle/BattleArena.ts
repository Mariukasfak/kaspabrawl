import Phaser from 'phaser';
import { Fighter, FightStep } from '../../utils/simulateFight';

// Define constants for arena
const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 600;
const PLAYER_A_X = 250;
const PLAYER_B_X = 550;
const PLAYER_Y = 450;
const FLOOR_Y = 500;
const TEXT_Y = 150;
const BATTLE_DELAY = 1500; // Time between battle actions in ms
const INTRO_DELAY = 2000; // Time before battle starts

// Fighter animation states
enum FighterState {
  IDLE = 'idle',
  ATTACK = 'attack',
  HURT = 'hurt',
  DODGE = 'dodge',
  BLOCK = 'block',
  SKILL = 'skill',
  VICTORY = 'victory',
  DEFEAT = 'defeat'
}

export default class BattleArena extends Phaser.Scene {
  // Fighter sprites and UI elements
  private playerA?: Phaser.GameObjects.Sprite;
  private playerB?: Phaser.GameObjects.Sprite;
  private playerAHealth?: Phaser.GameObjects.Rectangle;
  private playerBHealth?: Phaser.GameObjects.Rectangle;
  private playerAHealthBg?: Phaser.GameObjects.Rectangle;
  private playerBHealthBg?: Phaser.GameObjects.Rectangle;
  private playerAName?: Phaser.GameObjects.Text;
  private playerBName?: Phaser.GameObjects.Text;
  private battleText?: Phaser.GameObjects.Text;
  private actionText?: Phaser.GameObjects.Text;
  private platform?: Phaser.GameObjects.Image;
  
  // Battle data
  private fightSteps: FightStep[] = [];
  private currentStep: number = 0;
  private nextStepTimestamp: number = 0;
  private stepDelay: number = BATTLE_DELAY;
  private battleActive: boolean = false;
  private battleEnded: boolean = false;
  
  // Fighter data
  private fighterA?: Fighter;
  private fighterB?: Fighter;
  private fighterAMaxHp: number = 100;
  private fighterBMaxHp: number = 100;
  private fighterACurrentHp: number = 100;
  private fighterBCurrentHp: number = 100;
  
  // Particle emitters
  private hitParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private criticalParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private skillParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
  
  constructor() {
    super({ key: 'BattleArena' });
  }
  
  init(data: { fighterA?: Fighter, fighterB?: Fighter, fightSteps?: FightStep[] }) {
    this.fighterA = data.fighterA;
    this.fighterB = data.fighterB;
    
    // Initialize battle data if provided
    if (data.fightSteps && data.fightSteps.length > 0) {
      this.fightSteps = data.fightSteps;
      this.battleActive = true;
      this.currentStep = 0;
      
      // Initialize HP values from the first step if available
      const firstStep = this.fightSteps[0];
      if (firstStep.remainingHp) {
        this.fighterAMaxHp = Math.max(100, firstStep.remainingHp.attackerHp);
        this.fighterBMaxHp = Math.max(100, firstStep.remainingHp.defenderHp);
        this.fighterACurrentHp = firstStep.remainingHp.attackerHp;
        this.fighterBCurrentHp = firstStep.remainingHp.defenderHp;
      }
    }
  }
  
  preload() {
    // Load arena assets
    this.load.image('arena-bg', '/images/arena-bg.png');
    this.load.image('platform', '/images/arena-elements/platform.png');
    
    // Load fighter sprites
    this.load.image('fighter-a', '/images/fighter-1.png');
    this.load.image('fighter-b', '/images/fighter-2.png');
    
    // Load effect sprites
    this.load.image('hit-particle', '/images/particle1.png');
    this.load.image('critical-particle', '/images/particle2.png');
    this.load.image('skill-particle', '/images/particle3.png');
    
    // Create fallback graphics for any missing assets
    this.load.on('loaderror', (fileObj: { key: string }) => {
      console.warn(`Failed to load: ${fileObj.key}`);
      this.createFallbackAsset(fileObj.key);
    });
  }
  
  create() {
    // Create arena background
    this.add.image(ARENA_WIDTH/2, ARENA_HEIGHT/2, 'arena-bg')
      .setDisplaySize(ARENA_WIDTH, ARENA_HEIGHT);
    
    // Add arena platform
    this.platform = this.add.image(ARENA_WIDTH/2, FLOOR_Y, 'platform')
      .setDisplaySize(600, 100);
    
    // Create particle emitters
    this.createParticleEffects();
    
    // Create fighters
    this.createFighters();
    
    // Add UI elements
    this.createUI();
    
    // Add restart button (hidden initially)
    const restartButton = this.add.text(ARENA_WIDTH/2, 550, 'FIGHT AGAIN', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#4b2995',
      padding: { x: 16, y: 8 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.returnToLobby())
    .setAlpha(0);
    
    // Fade in everything with a nice transition
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    
    // Start the battle sequence after a delay
    if (this.battleActive) {
      this.showBattleIntro();
    }
  }
  
  update(time: number) {
    // Process battle steps when active
    if (this.battleActive && !this.battleEnded && time > this.nextStepTimestamp && this.currentStep < this.fightSteps.length) {
      this.processNextStep();
    }
  }
  
  private createParticleEffects() {
    // Create hit particle effect
    this.createFallbackParticle('hit-particle', 0xff0000);
    this.hitParticles = this.add.particles(0, 0, 'hit-particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.2, end: 0 },
      lifespan: 800,
      blendMode: 'ADD',
      frequency: -1 // On demand
    });
    
    // Create critical hit effect
    this.createFallbackParticle('critical-particle', 0xffff00);
    this.criticalParticles = this.add.particles(0, 0, 'critical-particle', {
      speed: { min: 100, max: 200 },
      scale: { start: 0.4, end: 0 },
      lifespan: 1000,
      blendMode: 'ADD',
      frequency: -1
    });
    
    // Create skill effect
    this.createFallbackParticle('skill-particle', 0x00aaff);
    this.skillParticles = this.add.particles(0, 0, 'skill-particle', {
      speed: { min: 80, max: 180 },
      scale: { start: 0.3, end: 0 },
      lifespan: 1200,
      blendMode: 'ADD',
      frequency: -1
    });
  }
  
  private createFighters() {
    // Calculate fighter positions
    const fighterScale = 1.75;
    
    // Create fighter sprites
    this.playerA = this.add.sprite(PLAYER_A_X, PLAYER_Y, 'fighter-a')
      .setOrigin(0.5, 1)
      .setScale(fighterScale);
      
    this.playerB = this.add.sprite(PLAYER_B_X, PLAYER_Y, 'fighter-b')
      .setOrigin(0.5, 1)
      .setScale(fighterScale)
      .setFlipX(true);
      
    // Add glow effect to fighters
    const glowA = this.add.graphics();
    glowA.fillStyle(0x4444ff, 0.2);
    glowA.fillCircle(PLAYER_A_X, PLAYER_Y - 50, 60);
    
    const glowB = this.add.graphics();
    glowB.fillStyle(0xff4444, 0.2);
    glowB.fillCircle(PLAYER_B_X, PLAYER_Y - 50, 60);
  }
  
  private createUI() {
    // Create health bar backgrounds
    this.playerAHealthBg = this.add.rectangle(PLAYER_A_X, PLAYER_Y - 130, 120, 15, 0x222222)
      .setOrigin(0.5)
      .setStrokeStyle(1, 0x000000);
      
    this.playerBHealthBg = this.add.rectangle(PLAYER_B_X, PLAYER_Y - 130, 120, 15, 0x222222)
      .setOrigin(0.5)
      .setStrokeStyle(1, 0x000000);
    
    // Create health bars
    this.playerAHealth = this.add.rectangle(
      PLAYER_A_X - 60, 
      PLAYER_Y - 130, 
      120, 
      15, 
      0x00ff00
    ).setOrigin(0, 0.5);
    
    this.playerBHealth = this.add.rectangle(
      PLAYER_B_X - 60, 
      PLAYER_Y - 130, 
      120, 
      15, 
      0x00ff00
    ).setOrigin(0, 0.5);
    
    // Add names above health bars
    const nameA = this.fighterA?.name || this.fighterA?.address.slice(0, 8) || 'Fighter A';
    const nameB = this.fighterB?.name || this.fighterB?.address.slice(0, 8) || 'Fighter B';
    
    this.playerAName = this.add.text(PLAYER_A_X, PLAYER_Y - 150, nameA, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5).setShadow(1, 1, '#000000', 2);
    
    this.playerBName = this.add.text(PLAYER_B_X, PLAYER_Y - 150, nameB, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5).setShadow(1, 1, '#000000', 2);
    
    // Add battle text at top
    this.battleText = this.add.text(ARENA_WIDTH/2, 70, 'KASPA BRAWL', {
      fontSize: '32px',
      fontFamily: 'Impact, fantasy',
      color: '#f5d742'
    }).setOrigin(0.5, 0.5)
    .setShadow(2, 2, '#000000', 3);
    
    // Add action text for battle updates
    this.actionText = this.add.text(ARENA_WIDTH/2, TEXT_Y, '', {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 500 }
    }).setOrigin(0.5, 0.5)
    .setShadow(1, 1, '#000000', 2);
    
    // Update health bars with initial values
    this.updateHealthBars();
  }
  
  private showBattleIntro() {
    // VS text animation
    const vsText = this.add.text(ARENA_WIDTH/2, ARENA_HEIGHT/2, 'VS', {
      fontSize: '120px',
      fontFamily: 'Impact, fantasy',
      color: '#ff0000'
    }).setOrigin(0.5, 0.5).setAlpha(0);
    
    // Animate the fighters
    this.tweens.add({
      targets: [this.playerA, this.playerB],
      y: { from: PLAYER_Y + 50, to: PLAYER_Y },
      alpha: { from: 0, to: 1 },
      duration: 1000,
      ease: 'Back.easeOut'
    });
    
    // Animate VS text
    this.tweens.add({
      targets: vsText,
      scale: { from: 3, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 800,
      yoyo: true,
      hold: 400,
      onComplete: () => {
        vsText.destroy();
        this.startBattle();
      }
    });
  }
  
  private startBattle() {
    if (this.fightSteps.length === 0) return;
    
    // Show "FIGHT!" text
    const fightText = this.add.text(ARENA_WIDTH/2, ARENA_HEIGHT/2, 'FIGHT!', {
      fontSize: '80px',
      fontFamily: 'Impact, fantasy',
      color: '#ffff00'
    }).setOrigin(0.5, 0.5);
    
    this.tweens.add({
      targets: fightText,
      scale: { from: 0.5, to: 2 },
      alpha: { from: 1, to: 0 },
      duration: 1000,
      onComplete: () => {
        fightText.destroy();
        // Start battle sequence after this animation
        this.nextStepTimestamp = this.time.now + 500;
      }
    });
  }
  
  private processNextStep() {
    if (this.currentStep >= this.fightSteps.length) return;
    
    const step = this.fightSteps[this.currentStep];
    
    // Update action text
    if (this.actionText) {
      this.actionText.setText(step.text);
    }
    
    // Process different step types
    switch (step.type) {
      case 'attack':
        this.playAttackAnimation(step);
        break;
      case 'critical':
        this.playCriticalAnimation(step);
        break;
      case 'skill':
        this.playSkillAnimation(step);
        break;
      case 'dodge':
        this.playDodgeAnimation(step);
        break;
      case 'block':
        this.playBlockAnimation(step);
        break;
      case 'end':
        this.playEndAnimation(step);
        break;
      default:
        // For other step types, just update health and move on
        this.updateHealthFromStep(step);
        this.scheduleNextStep();
    }
  }
  
  private playAttackAnimation(step: FightStep) {
    // Determine attacker and defender
    const isAttackerA = step.attacker === this.fighterA?.id;
    const attacker = isAttackerA ? this.playerA : this.playerB;
    const defender = isAttackerA ? this.playerB : this.playerA;
    
    if (!attacker || !defender) return;
    
    // Attack animation
    const direction = isAttackerA ? 1 : -1;
    const originalX = attacker.x;
    
    this.tweens.add({
      targets: attacker,
      x: originalX + (70 * direction),
      duration: 200,
      ease: 'Power1',
      yoyo: true,
      onComplete: () => {
        // Show hit effect if damage was dealt
        if (step.damage && step.damage > 0) {
          // Flash the defender
          this.tweens.add({
            targets: defender,
            alpha: 0.6,
            duration: 100,
            yoyo: true,
            repeat: 1
          });
          
          // Emit particles at hit location
          if (this.hitParticles) {
            this.hitParticles.setPosition(defender.x - (20 * direction), defender.y - 80);
            this.hitParticles.explode(10);
          }
          
          // Show damage number
          this.showDamageNumber(defender.x, defender.y - 100, step.damage);
          
          // Update health bars
          this.updateHealthFromStep(step);
        }
        
        // Schedule next step
        this.scheduleNextStep();
      }
    });
  }
  
  private playCriticalAnimation(step: FightStep) {
    // Critical hits are more dramatic attacks
    const isAttackerA = step.attacker === this.fighterA?.id;
    const attacker = isAttackerA ? this.playerA : this.playerB;
    const defender = isAttackerA ? this.playerB : this.playerA;
    
    if (!attacker || !defender) return;
    
    const direction = isAttackerA ? 1 : -1;
    const originalX = attacker.x;
    
    // Make attacker move faster
    this.tweens.add({
      targets: attacker,
      x: originalX + (90 * direction),
      duration: 150,
      ease: 'Power2',
      yoyo: true,
      onComplete: () => {
        // Camera shake effect
        this.cameras.main.shake(200, 0.01);
        
        // Flash defender with a stronger effect
        this.tweens.add({
          targets: defender,
          alpha: 0.4,
          duration: 100,
          yoyo: true,
          repeat: 2
        });
        
        // Critical hit particles
        if (this.criticalParticles) {
          this.criticalParticles.setPosition(defender.x, defender.y - 80);
          this.criticalParticles.explode(20);
        }
        
        // Show critical damage number in red and bigger
        if (step.damage) {
          this.showDamageNumber(defender.x, defender.y - 120, step.damage, 0xff0000, 1.5);
        }
        
        // Update health bars
        this.updateHealthFromStep(step);
        
        // Add "CRITICAL" text that fades out
        const critText = this.add.text(defender.x, defender.y - 160, 'CRITICAL!', {
          fontSize: '24px',
          fontFamily: 'Impact, fantasy',
          color: '#ff0000'
        }).setOrigin(0.5, 0.5);
        
        this.tweens.add({
          targets: critText,
          y: critText.y - 40,
          alpha: 0,
          duration: 1000,
          onComplete: () => critText.destroy()
        });
        
        // Schedule next step
        this.scheduleNextStep();
      }
    });
  }
  
  private playSkillAnimation(step: FightStep) {
    // Special skill animation
    const isAttackerA = step.attacker === this.fighterA?.id;
    const attacker = isAttackerA ? this.playerA : this.playerB;
    const defender = isAttackerA ? this.playerB : this.playerA;
    
    if (!attacker || !defender) return;
    
    // Show skill name
    const skillName = step.skill || 'Special Attack';
    const skillText = this.add.text(attacker.x, attacker.y - 120, skillName, {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#00ffff'
    }).setOrigin(0.5, 0.5).setShadow(2, 2, '#000000', 3);
    
    // Skill effect animation
    this.tweens.add({
      targets: [attacker],
      scaleX: attacker.scaleX * 1.2,
      scaleY: attacker.scaleY * 1.2,
      duration: 300,
      yoyo: true,
      onComplete: () => {
        if (this.skillParticles) {
          this.skillParticles.setPosition(defender.x, defender.y - 80);
          this.skillParticles.explode(15);
        }
        
        // Flash defender
        this.tweens.add({
          targets: defender,
          alpha: 0.5,
          duration: 100,
          yoyo: true,
          repeat: 1
        });
        
        // Show damage
        if (step.damage) {
          this.showDamageNumber(defender.x, defender.y - 100, step.damage, 0x00ffff);
        }
        
        // Update health
        this.updateHealthFromStep(step);
        
        // Fade out skill text
        this.tweens.add({
          targets: skillText,
          y: skillText.y - 30,
          alpha: 0,
          duration: 1000,
          onComplete: () => {
            skillText.destroy();
            this.scheduleNextStep();
          }
        });
      }
    });
  }
  
  private playDodgeAnimation(step: FightStep) {
    const isDefenderA = step.defender === this.fighterA?.id;
    const defender = isDefenderA ? this.playerA : this.playerB;
    
    if (!defender) return;
    
    // Dodge animation - quick up and down with flip
    this.tweens.add({
      targets: defender,
      y: defender.y - 40,
      duration: 300,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: defender,
          y: PLAYER_Y,
          duration: 200,
          ease: 'Bounce.easeOut',
          onComplete: () => {
            // Show "Dodged!" text
            const dodgeText = this.add.text(defender.x, defender.y - 120, 'DODGED!', {
              fontSize: '20px',
              fontFamily: 'Arial, sans-serif',
              color: '#ffffff'
            }).setOrigin(0.5, 0.5);
            
            this.tweens.add({
              targets: dodgeText,
              y: dodgeText.y - 30,
              alpha: 0,
              duration: 800,
              onComplete: () => dodgeText.destroy()
            });
            
            // Update health status
            this.updateHealthFromStep(step);
            
            // Next step
            this.scheduleNextStep();
          }
        });
      }
    });
  }
  
  private playBlockAnimation(step: FightStep) {
    const isDefenderA = step.defender === this.fighterA?.id;
    const defender = isDefenderA ? this.playerA : this.playerB;
    
    if (!defender) return;
    
    // Create shield graphic
    const shieldColor = 0x3399ff;
    const shield = this.add.graphics();
    shield.fillStyle(shieldColor, 0.5);
    shield.fillCircle(defender.x, defender.y - 80, 60);
    shield.lineStyle(3, shieldColor, 1);
    shield.strokeCircle(defender.x, defender.y - 80, 60);
    
    // Shield effect
    this.tweens.add({
      targets: shield,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        shield.destroy();
        
        // Show "Blocked!" text
        const blockText = this.add.text(defender.x, defender.y - 120, 'BLOCKED!', {
          fontSize: '20px',
          fontFamily: 'Arial, sans-serif',
          color: '#3399ff'
        }).setOrigin(0.5, 0.5);
        
        this.tweens.add({
          targets: blockText,
          y: blockText.y - 30,
          alpha: 0,
          duration: 800,
          onComplete: () => blockText.destroy()
        });
        
        // If damage was reduced but not zero, show it
        if (step.damage && step.damage > 0) {
          this.showDamageNumber(defender.x, defender.y - 80, step.damage, 0x3399ff);
        }
        
        // Update health
        this.updateHealthFromStep(step);
        
        // Next step
        this.scheduleNextStep();
      }
    });
  }
  
  private playEndAnimation(step: FightStep) {
    // Battle has ended - determine winner and loser
    this.battleEnded = true;
    
    const isWinnerA = step.attacker === this.fighterA?.id;
    const winner = isWinnerA ? this.playerA : this.playerB;
    const loser = isWinnerA ? this.playerB : this.playerA;
    
    if (!winner || !loser) return;
    
    // Update the battle text
    if (this.battleText) {
      const winnerName = isWinnerA 
        ? (this.fighterA?.name || 'Fighter A')
        : (this.fighterB?.name || 'Fighter B');
      
      this.battleText.setText(`${winnerName} WINS!`);
    }
    
    // Victory animation
    this.tweens.add({
      targets: winner,
      y: winner.y - 30,
      duration: 400,
      yoyo: true,
      repeat: 1
    });
    
    // Loser falls
    this.tweens.add({
      targets: loser,
      angle: isWinnerA ? 90 : -90,
      y: PLAYER_Y + 20,
      alpha: 0.6,
      duration: 500
    });
    
    // Victory particles
    const particles = this.add.particles(0, 0, 'hit-particle', {
      x: winner.x,
      y: winner.y - 100,
      speed: { min: 50, max: 150 },
      scale: { start: 0.1, end: 0 },
      quantity: 1,
      lifespan: 2000,
      frequency: 100,
      tint: [0xffff00, 0x00ffff, 0xff00ff]
    });
    
    // Show "Fight Again" button
    this.time.delayedCall(2000, () => {
      const restartButton = this.add.text(ARENA_WIDTH/2, 550, 'FIGHT AGAIN', {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        backgroundColor: '#4b2995',
        padding: { x: 16, y: 8 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.returnToLobby())
      .setAlpha(0);
      
      this.tweens.add({
        targets: restartButton,
        alpha: 1,
        y: 520,
        duration: 500,
        ease: 'Back.easeOut'
      });
    });
  }
  
  private updateHealthFromStep(step: FightStep) {
    if (!step.remainingHp) return;
    
    // Update the current HP values
    this.fighterACurrentHp = step.remainingHp.attackerHp;
    this.fighterBCurrentHp = step.remainingHp.defenderHp;
    
    // Update health bars
    this.updateHealthBars();
  }
  
  private updateHealthBars() {
    // Update Player A health bar
    if (this.playerAHealth) {
      // Calculate percentage of health remaining
      const healthPercentA = Math.max(0, this.fighterACurrentHp / this.fighterAMaxHp);
      
      // Update width based on health percentage
      this.playerAHealth.width = 120 * healthPercentA;
      
      // Update color based on health level
      if (healthPercentA < 0.2) {
        this.playerAHealth.fillColor = 0xff0000; // Red
      } else if (healthPercentA < 0.5) {
        this.playerAHealth.fillColor = 0xffaa00; // Orange
      } else {
        this.playerAHealth.fillColor = 0x00ff00; // Green
      }
    }
    
    // Update Player B health bar
    if (this.playerBHealth) {
      // Calculate percentage of health remaining
      const healthPercentB = Math.max(0, this.fighterBCurrentHp / this.fighterBMaxHp);
      
      // Update width based on health percentage
      this.playerBHealth.width = 120 * healthPercentB;
      
      // Update color based on health level
      if (healthPercentB < 0.2) {
        this.playerBHealth.fillColor = 0xff0000; // Red
      } else if (healthPercentB < 0.5) {
        this.playerBHealth.fillColor = 0xffaa00; // Orange
      } else {
        this.playerBHealth.fillColor = 0x00ff00; // Green
      }
    }
  }
  
  private showDamageNumber(x: number, y: number, damage: number, color: number = 0xff0000, scale: number = 1) {
    // Create damage text that floats up and fades out
    const damageText = this.add.text(x, y, `-${damage}`, {
      fontSize: `${24 * scale}px`,
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: `#${color.toString(16).padStart(6, '0')}`
    }).setOrigin(0.5, 0.5);
    
    this.tweens.add({
      targets: damageText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => damageText.destroy()
    });
  }
  
  private scheduleNextStep() {
    // Move to next step
    this.currentStep++;
    // Set next step timestamp
    this.nextStepTimestamp = this.time.now + this.stepDelay;
  }
  
  private returnToLobby() {
    // Start transition
    this.cameras.main.fadeOut(500, 0, 0, 0);
    
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      // Change scene to lobby or reset battle
      this.scene.start('MainScene');
    });
  }
  
  private createFallbackAsset(key: string) {
    // Create fallback graphics for missing assets
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    if (key === 'arena-bg') {
      // Dark blue gradient background
      const gradient = graphics.createLinearGradient(0, 0, 0, ARENA_HEIGHT);
      gradient.addColorStop(0, '#0a0a2a');
      gradient.addColorStop(1, '#1a1a3e');
      graphics.fillStyle(gradient);
      graphics.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
    } 
    else if (key === 'platform') {
      // Simple platform graphic
      graphics.fillStyle(0x555555);
      graphics.fillRect(0, 0, 600, 40);
      graphics.lineStyle(2, 0x888888);
      graphics.strokeRect(0, 0, 600, 40);
    }
    else if (key === 'fighter-a' || key === 'fighter-b') {
      // Simple fighter
      const color = key === 'fighter-a' ? 0x4444ff : 0xff4444;
      graphics.fillStyle(color);
      graphics.fillRect(0, 0, 60, 120);
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(30, 30, 20);
    }
    else {
      // Generic particle or other asset
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(8, 8, 8);
    }
    
    // Generate texture from graphics
    const textureSize = key.includes('particle') ? 16 : (key === 'arena-bg' ? ARENA_WIDTH : 200);
    const textureSize2 = key.includes('particle') ? 16 : (key === 'arena-bg' ? ARENA_HEIGHT : 200);
    graphics.generateTexture(key, textureSize, textureSize2);
  }
  
  private createFallbackParticle(key: string, color: number) {
    if (!this.textures.exists(key)) {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(color);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(key, 16, 16);
    }
  }
}

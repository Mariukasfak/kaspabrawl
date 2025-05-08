import Phaser from 'phaser';
import { Fighter, FightStep } from '../../utils/simulateFight';

// Screen positions
const PLAYER_A_X = 200;
const PLAYER_B_X = 600;
const PLAYER_Y = 350;
const TEXT_Y = 150;

export default class FightScene extends Phaser.Scene {
  private playerA?: Phaser.GameObjects.Sprite;
  private playerB?: Phaser.GameObjects.Sprite;
  private playerAHealth?: Phaser.GameObjects.Rectangle;
  private playerBHealth?: Phaser.GameObjects.Rectangle;
  private playerAHealthBg?: Phaser.GameObjects.Rectangle;
  private playerBHealthBg?: Phaser.GameObjects.Rectangle;
  private fightText?: Phaser.GameObjects.Text;
  private fightSteps: FightStep[] = [];
  private currentStep: number = 0;
  private nextStepTimestamp: number = 0;
  private stepDelay: number = 2000; // Time between steps in ms
  private fightActive: boolean = false;
  private walletAddress?: string;
  private fighterA?: Fighter;
  private fighterB?: Fighter;

  constructor() {
    super({ key: 'FightScene' });
  }

  init(data: { walletAddress?: string, fighterA?: Fighter, fighterB?: Fighter, fightSteps?: FightStep[] }) {
    this.walletAddress = data.walletAddress;
    this.fighterA = data.fighterA;
    this.fighterB = data.fighterB;
    
    // If we have fight steps, we'll play them
    if (data.fightSteps && data.fightSteps.length > 0) {
      this.fightSteps = data.fightSteps;
      this.fightActive = true;
    }
  }

  preload() {
    // Load fighter sprites
    this.load.image('fighter1', '/images/fighter-1.png');
    this.load.image('fighter2', '/images/fighter-2.png');
  }

  create() {
    // Create background
    this.add.rectangle(0, 0, 800, 600, 0x1a1a2e).setOrigin(0, 0);
    
    // Add arena floor
    this.add.rectangle(400, 425, 600, 20, 0x4ecdc4).setOrigin(0.5);
    
    // Add fighters
    this.playerA = this.add.sprite(PLAYER_A_X, PLAYER_Y, 'fighter1').setOrigin(0.5, 1).setScale(1.5);
    this.playerB = this.add.sprite(PLAYER_B_X, PLAYER_Y, 'fighter2').setOrigin(0.5, 1).setScale(1.5);
    
    // Add player address labels
    const playerALabel = this.fighterA?.address.slice(0, 6) || 'Player A';
    const playerBLabel = this.fighterB?.address.slice(0, 6) || 'Player B';
    
    this.add.text(PLAYER_A_X, PLAYER_Y + 20, playerALabel, { 
      color: '#ffffff',
      fontSize: '16px' 
    }).setOrigin(0.5, 0);
    
    this.add.text(PLAYER_B_X, PLAYER_Y + 20, playerBLabel, { 
      color: '#ffffff',
      fontSize: '16px'  
    }).setOrigin(0.5, 0);
    
    // Add health bars
    this.playerAHealthBg = this.add.rectangle(PLAYER_A_X, PLAYER_Y - 100, 100, 10, 0x666666).setOrigin(0.5);
    this.playerBHealthBg = this.add.rectangle(PLAYER_B_X, PLAYER_Y - 100, 100, 10, 0x666666).setOrigin(0.5);
    this.playerAHealth = this.add.rectangle(PLAYER_A_X, PLAYER_Y - 100, 100, 10, 0x00ff00).setOrigin(0.5);
    this.playerBHealth = this.add.rectangle(PLAYER_B_X, PLAYER_Y - 100, 100, 10, 0x00ff00).setOrigin(0.5);
    
    // Add fight text
    this.fightText = this.add.text(400, TEXT_Y, 'Ready to fight!', {
      color: '#ffffff',
      fontSize: '20px',
      align: 'center'
    }).setOrigin(0.5);
    
    // Add transitions
    const fadesIn = {
      targets: [this.playerA, this.playerB, this.fightText],
      alpha: { from: 0, to: 1 },
      duration: 1000
    };
    this.tweens.add(fadesIn);
    
    // Add a button to restart fight when it ends
    const restartButton = this.add.text(400, 500, 'Find New Opponent', {
      color: '#4ecdc4',
      fontSize: '18px',
      backgroundColor: '#2a2a4c',
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    restartButton.on('pointerdown', () => {
      // Go back to lobby (we'll let parent component handle this)
      this.scene.start('LobbyScene');
    });
    
    // Hide initially
    restartButton.setAlpha(0);
    
    // Start fight if we have steps
    if (this.fightActive && this.fightSteps.length > 0) {
      this.nextStepTimestamp = this.time.now + 1000;
    } else {
      // If no fight data, show a message
      this.fightText?.setText('Waiting for opponents...');
    }
  }
  
  update(time: number) {
    if (this.fightActive && time > this.nextStepTimestamp && this.currentStep < this.fightSteps.length) {
      const step = this.fightSteps[this.currentStep];
      
      // Update text with step info
      if (this.fightText) {
        this.fightText.setText(step.text);
      }
      
      // Play animations based on step type
      if (step.type === 'attack' || step.type === 'skill') {
        this.playAttackAnimation(step);
      } else if (step.type === 'dodge') {
        this.playDodgeAnimation(step);
      } else if (step.type === 'block') {
        this.playBlockAnimation(step);
      } else if (step.type === 'end') {
        this.playEndAnimation(step);
      }
      
      // Update health bars if we have health info
      if (step.remainingHp) {
        const { attackerHp, defenderHp } = step.remainingHp;
        const isAttackerA = step.attacker === this.fighterA?.id;
        
        if (isAttackerA) {
          this.updateHealthBar(this.playerAHealth, attackerHp);
          this.updateHealthBar(this.playerBHealth, defenderHp);
        } else {
          this.updateHealthBar(this.playerBHealth, attackerHp);
          this.updateHealthBar(this.playerAHealth, defenderHp);
        }
      }
      
      // Schedule next step
      this.currentStep++;
      this.nextStepTimestamp = time + this.stepDelay;
    }
  }
  
  private playAttackAnimation(step: FightStep) {
    // Determine which sprite is attacker & defender
    const isAttackerA = step.attacker === this.fighterA?.id;
    const attacker = isAttackerA ? this.playerA : this.playerB;
    const defender = isAttackerA ? this.playerB : this.playerA;
    
    if (!attacker || !defender) return;
    
    // Simple attack animation
    const originalX = attacker.x;
    const targetX = isAttackerA ? originalX + 50 : originalX - 50;
    
    this.tweens.add({
      targets: attacker,
      x: targetX,
      duration: 200,
      yoyo: true,
      onComplete: () => {
        // Flash the defender red
        this.tweens.add({
          targets: defender,
          alpha: { from: 1, to: 0.5 },
          duration: 100,
          yoyo: true,
          repeat: 1
        });
      }
    });
  }
  
  private playDodgeAnimation(step: FightStep) {
    const isDefenderA = step.defender === this.fighterA?.id;
    const defender = isDefenderA ? this.playerA : this.playerB;
    
    if (!defender) return;
    
    // Dodge animation
    const originalY = defender.y;
    const targetY = originalY - 30;
    
    this.tweens.add({
      targets: defender,
      y: targetY,
      duration: 200,
      yoyo: true
    });
  }
  
  private playBlockAnimation(step: FightStep) {
    const isDefenderA = step.defender === this.fighterA?.id;
    const defender = isDefenderA ? this.playerA : this.playerB;
    
    if (!defender) return;
    
    // Block animation (flash blue)
    this.tweens.add({
      targets: defender,
      alpha: { from: 1, to: 0.7 },
      duration: 100,
      yoyo: true,
      repeat: 1
    });
  }
  
  private playEndAnimation(step: FightStep) {
    // Determine winner and loser
    const isWinnerA = step.attacker === this.fighterA?.id;
    const winner = isWinnerA ? this.playerA : this.playerB;
    const loser = isWinnerA ? this.playerB : this.playerA;
    
    if (!winner || !loser) return;
    
    // Victory animation
    this.tweens.add({
      targets: winner,
      y: winner.y - 30,
      duration: 300,
      repeat: 2,
      yoyo: true
    });
    
    // Defeat animation
    this.tweens.add({
      targets: loser,
      angle: 90,
      alpha: 0.5,
      duration: 500
    });
    
    // Show restart button
    this.add.text(400, 500, 'Find New Opponent', {
      color: '#4ecdc4',
      fontSize: '18px',
      backgroundColor: '#2a2a4c',
      padding: { x: 16, y: 8 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => {
      this.scene.start('LobbyScene');
    });
  }
  
  private updateHealthBar(healthBar?: Phaser.GameObjects.Rectangle, hp: number = 0) {
    if (!healthBar) return;
    
    // Calculate width (100px is max)
    const width = Math.max(0, Math.min(100, hp));
    
    // Update color based on health
    let color = 0x00ff00; // Green
    
    if (hp < 30) {
      color = 0xff0000; // Red
    } else if (hp < 60) {
      color = 0xffff00; // Yellow
    }
    
    healthBar.setFillStyle(color);
    healthBar.width = width;
  }
}

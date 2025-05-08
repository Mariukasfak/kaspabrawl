import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { FightStep } from '../../utils/simulateFight';

interface GameProps {
  walletAddress?: string | null;
  fightLog?: FightStep[];
}

// Configure Phaser game scene
class MainScene extends Phaser.Scene {
  private fightSteps: FightStep[] = [];
  private currentStepIndex: number = 0;
  private processingStep: boolean = false;
  private stepInterval: number = 2000; // 2 seconds between steps
  private lastStepTime: number = 0;
  
  // Game objects
  private fighter1: Phaser.GameObjects.Sprite | null = null;
  private fighter2: Phaser.GameObjects.Sprite | null = null;
  private healthBar1: Phaser.GameObjects.Rectangle | null = null;
  private healthBar2: Phaser.GameObjects.Rectangle | null = null;
  private healthText1: Phaser.GameObjects.Text | null = null;
  private healthText2: Phaser.GameObjects.Text | null = null;
  private actionText: Phaser.GameObjects.Text | null = null;
  private fighterMaxHP: Record<string, number> = {};
  private fighterCurrentHP: Record<string, number> = {};
  
  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: { fightLog?: FightStep[] }) {
    if (data.fightLog) {
      this.fightSteps = data.fightLog;
      this.currentStepIndex = 0;
      this.processingStep = false;
      this.lastStepTime = 0;
    }
  }

  preload() {
    // Load assets
    this.load.image('fighter1', '/images/fighter-1.png');
    this.load.image('fighter2', '/images/fighter-2.png');
    this.load.image('background', '/images/arena-bg.png');
    
    // Create placeholder if images don't exist
    this.load.on('filecomplete', (key: string) => {
      console.log(`Loaded: ${key}`);
    });
    
    this.load.on('loaderror', (file: { key: string }) => {
      console.warn(`Failed to load: ${file.key}`);
      // Create fallback texture for missing images
      if (file.key === 'fighter1' || file.key === 'fighter2' || file.key === 'background') {
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(file.key === 'background' ? 0x1a1a2e : 0x4ecdc4);
        graphics.fillRect(0, 0, file.key === 'background' ? 800 : 100, file.key === 'background' ? 600 : 200);
        graphics.generateTexture(file.key, file.key === 'background' ? 800 : 100, file.key === 'background' ? 600 : 200);
      }
    });
  }

  create() {
    // Initialize the scene
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Add background with particle effect
    try {
      const background = this.add.image(width/2, height/2, 'background')
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
      const particles = this.add.particles(0, 0, particleKey);
      
      const emitter = particles.createEmitter({
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
      console.warn('Failed to add background image, using fallback');
      this.add.rectangle(width/2, height/2, width, height, 0x1a1a2e);
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
    
    // Create fighters
    this.fighter1 = this.add.sprite(width * 0.25, height * 0.5, 'fighter1')
      .setDisplaySize(150, 150);
    this.fighter2 = this.add.sprite(width * 0.75, height * 0.5, 'fighter2')
      .setDisplaySize(150, 150)
      .setFlipX(true);
    
    // Initialize health bars
    // Find max HP from the fight steps
    this.fighterMaxHP[fighter1Id] = 100;
    this.fighterMaxHP[fighter2Id] = 100;
    
    // Find initial HP values if available
    if (firstStep.remainingHp) {
      this.fighterCurrentHP[fighter1Id] = firstStep.remainingHp.attackerHp;
      this.fighterCurrentHP[fighter2Id] = firstStep.remainingHp.defenderHp;
    } else {
      this.fighterCurrentHP[fighter1Id] = 100;
      this.fighterCurrentHP[fighter2Id] = 100;
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
      this.actionText.setText('Battle begins! Click to start.');
    }
    
    // Add click to advance
    this.input.once('pointerdown', () => {
      this.processNextStep();
    });
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
        // Simple attack animation
        this.tweens.add({
          targets: attackingFighter,
          x: isFirstFighterAttacking ? 
            attackingFighter.x + 50 : 
            attackingFighter.x - 50,
          duration: 200,
          yoyo: true,
          onComplete: () => {
            // Show damage effect on defender
            if (step.damage && step.damage > 0) {
              this.tweens.add({
                targets: defendingFighter,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 2
              });
              
              // Update health bar
              this.updateHealthBars(step);
            }
            
            // Show special effect if any
            if (step.specialEffect) {
              const effectText = this.add.text(
                defendingFighter.x,
                defendingFighter.y - 50,
                step.specialEffect.name,
                { fontSize: '20px', color: '#ff00ff' }
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
              
              // Add click to advance
              this.input.once('pointerdown', () => {
                this.processNextStep();
              });
            });
          }
        });
      }
    } else if (step.type === 'end') {
      if (this.actionText) {
        this.actionText.setText(step.text);
      }
      
      this.currentStepIndex++;
      this.processingStep = false;
    } else {
      // For other step types (dodge, block, etc.)
      this.updateHealthBars(step);
      
      // Continue to next step after a delay
      this.time.delayedCall(1500, () => {
        this.currentStepIndex++;
        this.processingStep = false;
        
        // Add click to advance
        this.input.once('pointerdown', () => {
          this.processNextStep();
        });
      });
    }
  }
  
  updateHealthBars(step: FightStep) {
    if (!step.remainingHp) return;
    
    const fighter1Id = this.fightSteps[0].attacker;
    const fighter2Id = this.fightSteps[0].defender;
    
    // Update current HP values
    this.fighterCurrentHP[fighter1Id] = step.remainingHp.attackerHp;
    this.fighterCurrentHP[fighter2Id] = step.remainingHp.defenderHp;
    
    // Update health bar widths
    if (this.healthBar1) {
      this.healthBar1.width = 150 * (this.fighterCurrentHP[fighter1Id] / this.fighterMaxHP[fighter1Id]);
      
      // Change color based on HP percentage
      const hpPercentage = this.fighterCurrentHP[fighter1Id] / this.fighterMaxHP[fighter1Id];
      if (hpPercentage < 0.2) {
        this.healthBar1.fillColor = 0xff0000; // Red
      } else if (hpPercentage < 0.5) {
        this.healthBar1.fillColor = 0xffff00; // Yellow
      }
    }
    
    if (this.healthBar2) {
      this.healthBar2.width = 150 * (this.fighterCurrentHP[fighter2Id] / this.fighterMaxHP[fighter2Id]);
      
      // Change color based on HP percentage
      const hpPercentage = this.fighterCurrentHP[fighter2Id] / this.fighterMaxHP[fighter2Id];
      if (hpPercentage < 0.2) {
        this.healthBar2.fillColor = 0xff0000; // Red
      } else if (hpPercentage < 0.5) {
        this.healthBar2.fillColor = 0xffff00; // Yellow
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

  update(time: number) {
    // Auto-advance for demo purposes if needed
    // If we want to automatically advance the steps without clicks
    /*
    if (this.fightSteps.length > 0 && !this.processingStep && 
        time - this.lastStepTime > this.stepInterval) {
      this.lastStepTime = time;
      this.processNextStep();
    }
    */
  }
}

const PhaserGame: React.FC<GameProps> = ({ walletAddress, fightLog }) => {
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
      
      // Pass fight log data to the scene if available
      if (fightLog && gameRef.current) {
        const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
        scene.scene.restart({ fightLog });
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
    if (gameRef.current && fightLog) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      scene.scene.restart({ fightLog });
    }
  }, [fightLog]);

  return <div ref={containerRef} className="game-container" />;
};

export default PhaserGame;

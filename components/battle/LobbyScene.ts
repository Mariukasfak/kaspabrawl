import Phaser from 'phaser';

export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LobbyScene' });
  }

  preload() {
    // Preload assets if needed
  }

  create() {
    // Create background
    this.add.rectangle(0, 0, 800, 600, 0x1a1a2e).setOrigin(0, 0);
    
    // Add title
    this.add.text(
      400,
      100,
      'Kaspa Brawl',
      {
        color: '#ffffff',
        fontSize: '48px',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    // Add subtitle
    this.add.text(
      400,
      160,
      'Choose your opponent',
      {
        color: '#4ecdc4',
        fontSize: '24px',
      }
    ).setOrigin(0.5);
    
    // Add opponent selection area
    const opponentArea = this.add.container(400, 300);
    
    // Create find random button
    const randomButton = this.add.text(0, 0, 'Find Random Opponent', {
      color: '#ffffff',
      backgroundColor: '#6a4ca3',
      fontSize: '20px',
      padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });
    
    randomButton.on('pointerover', () => {
      randomButton.setBackgroundColor('#815ac0');
    });
    
    randomButton.on('pointerout', () => {
      randomButton.setBackgroundColor('#6a4ca3');
    });
    
    randomButton.on('pointerdown', () => {
      // Generate mock fighters and fight steps
      const mockFighterA = {
        id: 'player1',
        address: 'kaspa1abc123',
        stats: {
          strength: 10,
          agility: 8,
          vitality: 9,
          defense: 7
        },
        hp: 100,
        skills: ['PowerStrike']
      };
      
      const mockFighterB = {
        id: 'player2',
        address: 'kaspa1xyz789',
        stats: {
          strength: 7,
          agility: 12,
          vitality: 6,
          defense: 9
        },
        hp: 100,
        skills: ['QuickAttack']
      };
      
      const mockFightSteps = [
        {
          type: 'attack' as const,
          attacker: 'player1',
          defender: 'player2',
          damage: 15,
          text: 'kaspa1abc attacks kaspa1xyz for 15 damage!',
          remainingHp: {
            attackerHp: 100,
            defenderHp: 85
          }
        },
        {
          type: 'skill' as const,
          attacker: 'player2',
          defender: 'player1',
          skill: 'QuickAttack' as const,
          damage: 10,
          text: 'kaspa1xyz used QuickAttack for 10 damage!',
          remainingHp: {
            attackerHp: 85,
            defenderHp: 90
          }
        },
        {
          type: 'dodge' as const,
          attacker: 'player1',
          defender: 'player2',
          text: 'kaspa1xyz dodged kaspa1abc\'s attack!',
          remainingHp: {
            attackerHp: 90,
            defenderHp: 85
          }
        },
        {
          type: 'attack' as const,
          attacker: 'player2',
          defender: 'player1',
          damage: 12,
          text: 'kaspa1xyz attacks kaspa1abc for 12 damage!',
          remainingHp: {
            attackerHp: 85,
            defenderHp: 78
          }
        },
        {
          type: 'skill' as const,
          attacker: 'player1',
          defender: 'player2',
          skill: 'PowerStrike' as const,
          damage: 20,
          text: 'kaspa1abc used PowerStrike for 20 damage!',
          remainingHp: {
            attackerHp: 78,
            defenderHp: 65
          }
        },
        {
          type: 'block' as const,
          attacker: 'player2',
          defender: 'player1',
          damage: 6,
          text: 'kaspa1abc blocked and reduced kaspa1xyz\'s attack for 6 damage!',
          remainingHp: {
            attackerHp: 65,
            defenderHp: 72
          }
        },
        {
          type: 'attack' as const,
          attacker: 'player1',
          defender: 'player2',
          damage: 18,
          text: 'kaspa1abc attacks kaspa1xyz for 18 damage!',
          remainingHp: {
            attackerHp: 72,
            defenderHp: 47
          }
        },
        {
          type: 'attack' as const,
          attacker: 'player2',
          defender: 'player1',
          damage: 14,
          text: 'kaspa1xyz attacks kaspa1abc for 14 damage!',
          remainingHp: {
            attackerHp: 47,
            defenderHp: 58
          }
        },
        {
          type: 'attack' as const,
          attacker: 'player1',
          defender: 'player2',
          damage: 22,
          text: 'kaspa1abc attacks kaspa1xyz for 22 damage!',
          remainingHp: {
            attackerHp: 58,
            defenderHp: 25
          }
        },
        {
          type: 'skill' as const,
          attacker: 'player2',
          defender: 'player1',
          skill: 'QuickAttack' as const,
          damage: 8,
          text: 'kaspa1xyz used QuickAttack for 8 damage!',
          remainingHp: {
            attackerHp: 25,
            defenderHp: 50
          }
        },
        {
          type: 'attack' as const,
          attacker: 'player1',
          defender: 'player2',
          damage: 25,
          text: 'kaspa1abc attacks kaspa1xyz for 25 damage!',
          remainingHp: {
            attackerHp: 50,
            defenderHp: 0
          }
        },
        {
          type: 'end' as const,
          attacker: 'player1',
          defender: 'player2',
          text: 'kaspa1abc defeated kaspa1xyz!'
        }
      ];
      
      // Start the fight scene with our mock data
      this.scene.start('FightScene', {
        fighterA: mockFighterA,
        fighterB: mockFighterB,
        fightSteps: mockFightSteps
      });
    });
    
    // Add button to container
    opponentArea.add(randomButton);
  }
}

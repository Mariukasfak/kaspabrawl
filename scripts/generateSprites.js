/**
 * Sprite Generator Script
 * 
 * This script generates placeholder sprite images for different character classes
 * at various level milestones. In a production environment, these would be 
 * replaced with actual character artwork.
 */
const fs = require('fs');
const { createCanvas } = require('canvas');
const path = require('path');

// Configuration
const classes = ['fighter', 'mage', 'ranger'];
const levels = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
const outputDir = path.join(__dirname, '../public/assets/fighters');

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Color schemes for different classes
const colorSchemes = {
  fighter: {
    primary: '#B71C1C', // Dark red
    secondary: '#E57373', // Light red
    accent: '#FFCDD2', // Very light red
    base: '#5D4037' // Brown
  },
  mage: {
    primary: '#1A237E', // Dark blue
    secondary: '#7986CB', // Light blue
    accent: '#C5CAE9', // Very light blue
    base: '#4527A0' // Purple
  },
  ranger: {
    primary: '#1B5E20', // Dark green
    secondary: '#81C784', // Light green
    accent: '#C8E6C9', // Very light green
    base: '#33691E' // Forest green
  }
};

// Generate placeholders
for (const characterClass of classes) {
  for (const level of levels) {
    const filename = `${characterClass}${level}.png`;
    const filepath = path.join(outputDir, filename);
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`Skipping ${filename} - already exists`);
      continue;
    }
    
    // Create canvas
    const canvas = createCanvas(128, 128);
    const ctx = canvas.getContext('2d');
    
    // Get color scheme for this class
    const colors = colorSchemes[characterClass];
    
    // Fill background with class primary color
    ctx.fillStyle = colors.primary;
    ctx.fillRect(0, 0, 128, 128);
    
    // Draw a simple character silhouette
    ctx.fillStyle = colors.secondary;
    
    // Head
    ctx.beginPath();
    ctx.arc(64, 40, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Body
    ctx.fillStyle = colors.base;
    ctx.fillRect(54, 60, 20, 40);
    
    // Arms
    const armWidth = 10 + Math.min(10, Math.floor(level / 10)); // Arms get slightly wider with level
    ctx.fillRect(44 - armWidth/2, 65, armWidth, 30);
    ctx.fillRect(84 - armWidth/2, 65, armWidth, 30);
    
    // Legs
    const legWidth = 10 + Math.min(5, Math.floor(level / 20)); // Legs get slightly wider with level
    ctx.fillRect(54 - legWidth/2, 100, legWidth, 28);
    ctx.fillRect(74 - legWidth/2, 100, legWidth, 28);
    
    // Add level-based flourishes
    if (level >= 5) {
      // Simple aura
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = Math.min(10, Math.floor(level / 10));
      ctx.beginPath();
      ctx.arc(64, 64, 50, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    if (level >= 25) {
      // Shoulder pads
      ctx.fillStyle = colors.accent;
      ctx.fillRect(34, 60, 10, 10);
      ctx.fillRect(84, 60, 10, 10);
    }
    
    if (level >= 50) {
      // Crown/helmet
      ctx.fillStyle = '#FFD700'; // Gold
      ctx.beginPath();
      ctx.moveTo(44, 25);
      ctx.lineTo(64, 15);
      ctx.lineTo(84, 25);
      ctx.closePath();
      ctx.fill();
    }
    
    if (level >= 75) {
      // Special weapon effect
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(95, 75, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
    
    // Add level text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Lvl ${level}`, 64, 20);
    
    // Add class name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(characterClass.toUpperCase(), 64, 120);
    
    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    console.log(`Generated ${filename}`);
  }
}

console.log('Sprite generation complete!');

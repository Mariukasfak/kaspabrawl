/**
 * Setup Fighter Sprites Script
 * Creates the directory structure and placeholder sprite files for fighter classes and levels
 */

const fs = require('fs');
const path = require('path');

// Define the sprite configurations
const fighterClasses = ['fighter', 'ranged', 'mage'];
const levelThresholds = [1, 5, 10, 15, 95, 100];

// Base directory for fighter sprites
const basePath = path.join(__dirname, '../public/assets/fighters');

// Create the base directory if it doesn't exist
if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true });
  console.log(`Created base directory: ${basePath}`);
}

// Create directories and placeholder files for each class
fighterClasses.forEach(fighterClass => {
  const classDir = path.join(basePath, fighterClass);
  
  // Create class directory if it doesn't exist
  if (!fs.existsSync(classDir)) {
    fs.mkdirSync(classDir, { recursive: true });
    console.log(`Created directory: ${classDir}`);
  }
  
  // Create placeholder image files for each level threshold
  levelThresholds.forEach(level => {
    // For ranged class, use archer image names
    const imageName = fighterClass === 'ranged' 
      ? `archer${level}.png` 
      : `${fighterClass}${level}.png`;
    
    const imagePath = path.join(classDir, imageName);
    
    // Only create the file if it doesn't exist
    if (!fs.existsSync(imagePath)) {
      // Create a simple placeholder image file
      try {
        // 1x1 transparent PNG (base64 encoded)
        const transparentPixelPNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
        fs.writeFileSync(imagePath, transparentPixelPNG);
        console.log(`Created placeholder image: ${imagePath}`);
      } catch (err) {
        console.error(`Error creating ${imagePath}:`, err);
      }
    }
  });
});

console.log('Fighter sprite directories and placeholders set up successfully!');

// Create toony character
const canvas = document.createElement('canvas');
canvas.width = 32;
canvas.height = 48;
const ctx = canvas.getContext('2d');

// Character colors
const skinColor = '#FFD39B';
const shirtColor = '#4682B4';
const pantsColor = '#8B4513';
const outlineColor = '#000000';
const hairColor = '#8B4513';

function createCharacterSprite() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw character outline
  ctx.fillStyle = outlineColor;
  ctx.fillRect(10, 8, 12, 12); // Head outline
  ctx.fillRect(8, 20, 16, 16); // Body outline
  ctx.fillRect(8, 36, 6, 12); // Left leg outline
  ctx.fillRect(18, 36, 6, 12); // Right leg outline
  ctx.fillRect(4, 22, 6, 10); // Left arm outline
  ctx.fillRect(22, 22, 6, 10); // Right arm outline
  
  // Draw character body parts
  ctx.fillStyle = skinColor;
  ctx.fillRect(11, 9, 10, 10); // Head
  ctx.fillRect(5, 23, 4, 8); // Left arm
  ctx.fillRect(23, 23, 4, 8); // Right arm
  
  ctx.fillStyle = shirtColor;
  ctx.fillRect(9, 21, 14, 14); // Shirt/body
  
  ctx.fillStyle = pantsColor;
  ctx.fillRect(9, 37, 4, 10); // Left leg
  ctx.fillRect(19, 37, 4, 10); // Right leg
  
  ctx.fillStyle = hairColor;
  ctx.fillRect(11, 7, 10, 4); // Hair
  
  // Draw face
  ctx.fillStyle = '#000000';
  ctx.fillRect(13, 12, 2, 2); // Left eye
  ctx.fillRect(17, 12, 2, 2); // Right eye
  ctx.fillRect(15, 15, 2, 1); // Mouth
  
  return canvas.toDataURL();
}

// Create environment assets
function createSkyBackground() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  
  // Sky gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#E0F7FF');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw clouds
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * 200;
    const size = 20 + Math.random() * 60;
    
    // Draw cloud puffs
    for (let j = 0; j < 5; j++) {
      const offsetX = (j - 2) * (size/3);
      const offsetY = (Math.random() - 0.5) * (size/4);
      const radius = size/2 - Math.abs(offsetX)/(size/20);
      ctx.beginPath();
      ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  return canvas.toDataURL();
}

function createPlatform() {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Platform base
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Platform top (grass)
  ctx.fillStyle = '#228B22';
  ctx.fillRect(0, 0, canvas.width, 8);
  
  // Add texture details
  ctx.fillStyle = '#A0522D';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * canvas.width;
    const y = 8 + Math.random() * (canvas.height - 8);
    const width = 2 + Math.random() * 6;
    const height = 1 + Math.random() * 3;
    ctx.fillRect(x, y, width, height);
  }
  
  // Add grass details
  ctx.fillStyle = '#32CD32';
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * canvas.width;
    const height = 2 + Math.random() * 6;
    ctx.fillRect(x, 0, 1, height);
  }
  
  return canvas.toDataURL();
}

// Create resource item
function createResource() {
  const canvas = document.createElement('canvas');
  canvas.width = 24;
  canvas.height = 24;
  const ctx = canvas.getContext('2d');
  
  // Draw berry/fruit
  ctx.fillStyle = '#FF6347'; // Tomato red
  ctx.beginPath();
  ctx.arc(12, 12, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Highlight
  ctx.fillStyle = '#FFFFFF';
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(9, 9, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;
  
  // Stem
  ctx.fillStyle = '#228B22';
  ctx.fillRect(11, 2, 2, 4);
  
  // Leaf
  ctx.beginPath();
  ctx.moveTo(13, 4);
  ctx.quadraticCurveTo(18, 2, 16, 7);
  ctx.closePath();
  ctx.fill();
  
  return canvas.toDataURL();
}

// Create enemy
function createEnemy() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Body
  ctx.fillStyle = '#708090'; // Slate gray
  ctx.beginPath();
  ctx.arc(16, 16, 12, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes
  ctx.fillStyle = '#FF0000'; // Red eyes
  ctx.beginPath();
  ctx.arc(12, 12, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(20, 12, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Mouth
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(16, 20, 6, 0, Math.PI, false);
  ctx.fill();
  
  // Teeth
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(13, 20, 2, 3);
  ctx.fillRect(17, 20, 2, 3);
  
  // Spikes
  ctx.fillStyle = '#A9A9A9';
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x1 = 16 + Math.cos(angle) * 12;
    const y1 = 16 + Math.sin(angle) * 12;
    const x2 = 16 + Math.cos(angle) * 18;
    const y2 = 16 + Math.sin(angle) * 18;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#A9A9A9';
    ctx.stroke();
  }
  
  return canvas.toDataURL();
}

// Create UI elements
function createHealthBar() {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 20;
  const ctx = canvas.getContext('2d');
  
  // Bar background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Bar fill
  ctx.fillStyle = '#00FF00';
  ctx.fillRect(2, 2, canvas.width - 4, canvas.height - 4);
  
  // Add texture
  ctx.fillStyle = '#FFFFFF';
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 10; i++) {
    ctx.fillRect(i * 20, 0, 10, canvas.height);
  }
  ctx.globalAlpha = 1.0;
  
  return canvas.toDataURL();
}

function createHungerBar() {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 20;
  const ctx = canvas.getContext('2d');
  
  // Bar background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Bar fill
  ctx.fillStyle = '#FFFF00';
  ctx.fillRect(2, 2, canvas.width - 4, canvas.height - 4);
  
  // Add texture
  ctx.fillStyle = '#FFFFFF';
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 10; i++) {
    ctx.fillRect(i * 20, 0, 10, canvas.height);
  }
  ctx.globalAlpha = 1.0;
  
  return canvas.toDataURL();
}

// Export all assets
const assets = {
  character: createCharacterSprite(),
  sky: createSkyBackground(),
  platform: createPlatform(),
  resource: createResource(),
  enemy: createEnemy(),
  healthBar: createHealthBar(),
  hungerBar: createHungerBar()
};

// Save assets to files
function saveAssets() {
  // This function would save the assets to files
  // In a browser environment, we would use download links
  // In Node.js, we would use fs.writeFile
  console.log('Assets created and ready to be saved');
  return assets;
}

// Call this function to generate and save all assets
saveAssets();

// Generate assets for Survivor.io style game
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// Helper function to create and save an image
function createAndSaveImage(width, height, drawFunction, filename) {
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  
  // Draw the image
  drawFunction(ctx);
  
  // In a browser environment, we would use:
  // const dataUrl = canvas.toDataURL('image/png');
  // But for Node.js, we'll use the canvas package to save directly
  
  // Return the canvas for potential further use
  return canvas;
}

// Player character (top-down view)
function createPlayerCharacter() {
  return createAndSaveImage(64, 64, (ctx) => {
    // Character body (circle)
    ctx.fillStyle = '#4287f5'; // Blue body
    ctx.beginPath();
    ctx.arc(32, 32, 16, 0, Math.PI * 2);
    ctx.fill();
    
    // Character face
    ctx.fillStyle = '#ffffff'; // White face
    ctx.beginPath();
    ctx.arc(32, 28, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(28, 26, 2, 0, Math.PI * 2);
    ctx.arc(36, 26, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Weapon (sword)
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(32, 32);
    ctx.lineTo(50, 50);
    ctx.stroke();
    
    // Sword handle
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(46, 46, 8, 3);
    
    // Add shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(32, 52, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }, 'player.png');
}

// Enemy (zombie)
function createEnemy() {
  return createAndSaveImage(64, 64, (ctx) => {
    // Enemy body
    ctx.fillStyle = '#8BC34A'; // Green zombie
    ctx.beginPath();
    ctx.arc(32, 32, 14, 0, Math.PI * 2);
    ctx.fill();
    
    // Enemy face
    ctx.fillStyle = '#C5E1A5'; // Lighter green face
    ctx.beginPath();
    ctx.arc(32, 28, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#FF0000'; // Red eyes
    ctx.beginPath();
    ctx.arc(28, 26, 2, 0, Math.PI * 2);
    ctx.arc(36, 26, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Mouth (jagged)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(26, 32);
    ctx.lineTo(29, 30);
    ctx.lineTo(32, 32);
    ctx.lineTo(35, 30);
    ctx.lineTo(38, 32);
    ctx.stroke();
    
    // Add shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(32, 50, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }, 'enemy.png');
}

// Boss enemy
function createBossEnemy() {
  return createAndSaveImage(96, 96, (ctx) => {
    // Boss body
    ctx.fillStyle = '#FF5722'; // Orange boss
    ctx.beginPath();
    ctx.arc(48, 48, 28, 0, Math.PI * 2);
    ctx.fill();
    
    // Boss face
    ctx.fillStyle = '#FFCCBC'; // Lighter orange face
    ctx.beginPath();
    ctx.arc(48, 42, 16, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#FF0000'; // Red eyes
    ctx.beginPath();
    ctx.arc(40, 38, 4, 0, Math.PI * 2);
    ctx.arc(56, 38, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Angry eyebrows
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(34, 32);
    ctx.lineTo(44, 36);
    ctx.moveTo(62, 32);
    ctx.lineTo(52, 36);
    ctx.stroke();
    
    // Mouth (jagged)
    ctx.beginPath();
    ctx.moveTo(38, 50);
    ctx.lineTo(42, 46);
    ctx.lineTo(48, 50);
    ctx.lineTo(54, 46);
    ctx.lineTo(58, 50);
    ctx.stroke();
    
    // Spikes on body
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x1 = 48 + Math.cos(angle) * 28;
      const y1 = 48 + Math.sin(angle) * 28;
      const x2 = 48 + Math.cos(angle) * 38;
      const y2 = 48 + Math.sin(angle) * 38;
      
      ctx.strokeStyle = '#7D3C0C';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    // Add shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(48, 82, 24, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }, 'boss.png');
}

// Skill icon - Forcefield
function createForcefieldSkill() {
  return createAndSaveImage(48, 48, (ctx) => {
    // Background
    ctx.fillStyle = '#2196F3'; // Blue background
    ctx.beginPath();
    ctx.arc(24, 24, 22, 0, Math.PI * 2);
    ctx.fill();
    
    // Forcefield effect
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(24, 24, 10 + i * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(18, 18, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = '#0D47A1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(24, 24, 22, 0, Math.PI * 2);
    ctx.stroke();
  }, 'forcefield-skill.png');
}

// Skill icon - Laser
function createLaserSkill() {
  return createAndSaveImage(48, 48, (ctx) => {
    // Background
    ctx.fillStyle = '#F44336'; // Red background
    ctx.beginPath();
    ctx.arc(24, 24, 22, 0, Math.PI * 2);
    ctx.fill();
    
    // Laser beam
    ctx.fillStyle = '#FFEB3B'; // Yellow beam
    ctx.beginPath();
    ctx.moveTo(12, 12);
    ctx.lineTo(36, 36);
    ctx.lineTo(32, 40);
    ctx.lineTo(8, 16);
    ctx.closePath();
    ctx.fill();
    
    // Laser source
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(10, 10, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Laser impact
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(38, 38, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFEB3B';
    ctx.beginPath();
    ctx.arc(38, 38, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = '#B71C1C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(24, 24, 22, 0, Math.PI * 2);
    ctx.stroke();
  }, 'laser-skill.png');
}

// Skill icon - Drone
function createDroneSkill() {
  return createAndSaveImage(48, 48, (ctx) => {
    // Background
    ctx.fillStyle = '#9C27B0'; // Purple background
    ctx.beginPath();
    ctx.arc(24, 24, 22, 0, Math.PI * 2);
    ctx.fill();
    
    // Drone body
    ctx.fillStyle = '#E1BEE7';
    ctx.beginPath();
    ctx.arc(24, 24, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Drone propellers
    ctx.fillStyle = '#7B1FA2';
    ctx.beginPath();
    ctx.ellipse(14, 14, 6, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(34, 14, 6, 2, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(14, 34, 6, 2, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(34, 34, 6, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Drone eye
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(24, 22, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = '#4A148C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(24, 24, 22, 0, Math.PI * 2);
    ctx.stroke();
  }, 'drone-skill.png');
}

// Experience orb
function createExperienceOrb() {
  return createAndSaveImage(32, 32, (ctx) => {
    // Glow effect
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 1)');
    gradient.addColorStop(0.7, 'rgba(255, 215, 0, 0.7)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();
    
    // Core
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(16, 16, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Sparkle
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(16, 4);
    ctx.lineTo(18, 10);
    ctx.lineTo(16, 8);
    ctx.lineTo(14, 10);
    ctx.closePath();
    ctx.fill();
  }, 'exp-orb.png');
}

// Health bar UI
function createHealthBar() {
  return createAndSaveImage(200, 24, (ctx) => {
    // Background
    ctx.fillStyle = '#333333';
    ctx.roundRect(0, 0, 200, 24, 4);
    ctx.fill();
    
    // Health fill
    ctx.fillStyle = '#4CAF50'; // Green
    ctx.roundRect(2, 2, 196, 20, 3);
    ctx.fill();
    
    // Segments
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(i * 20, 0, 20, 24);
      }
    }
    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.roundRect(0, 0, 200, 24, 4);
    ctx.stroke();
    
    // Health icon
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(10, 8);
    ctx.lineTo(14, 8);
    ctx.lineTo(14, 4);
    ctx.lineTo(18, 4);
    ctx.lineTo(18, 8);
    ctx.lineTo(22, 8);
    ctx.lineTo(22, 12);
    ctx.lineTo(18, 12);
    ctx.lineTo(18, 16);
    ctx.lineTo(14, 16);
    ctx.lineTo(14, 12);
    ctx.lineTo(10, 12);
    ctx.closePath();
    ctx.fill();
  }, 'health-bar.png');
}

// Skill selection UI
function createSkillSelectionUI() {
  return createAndSaveImage(300, 100, (ctx) => {
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.roundRect(0, 0, 300, 100, 8);
    ctx.fill();
    
    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT SKILL', 150, 20);
    
    // Skill slots
    for (let i = 0; i < 3; i++) {
      // Slot background
      ctx.fillStyle = '#333333';
      ctx.roundRect(20 + i * 95, 30, 80, 60, 6);
      ctx.fill();
      
      // Slot border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.roundRect(20 + i * 95, 30, 80, 60, 6);
      ctx.stroke();
      
      // Placeholder icon
      ctx.fillStyle = '#666666';
      ctx.beginPath();
      ctx.arc(20 + i * 95 + 40, 30 + 25, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 'skill-selection.png');
}

// Game background (top-down)
function createGameBackground() {
  return createAndSaveImage(800, 600, (ctx) => {
    // Base background
    ctx.fillStyle = '#78909C'; // Bluish gray
    ctx.fillRect(0, 0, 800, 600);
    
    // Grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= 800; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= 600; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }
    
    // Random debris/details
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 800;
      const y = Math.random() * 600;
      const size = 2 + Math.random() * 5;
      
      ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + Math.random() * 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 'background.png');
}

// Game logo
function createGameLogo() {
  return createAndSaveImage(400, 200, (ctx) => {
    // Background glow
    const gradient = ctx.createRadialGradient(200, 100, 50, 200, 100, 200);
    gradient.addColorStop(0, 'rgba(255, 87, 34, 0.8)'); // Orange
    gradient.addColorStop(1, 'rgba(255, 87, 34, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 200);
    
    // Main text shadow
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SURVIVAL', 203, 93);
    ctx.fillText('QUEST', 203, 153);
    
    // Main text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SURVIVAL', 200, 90);
    ctx.fillText('QUEST', 200, 150);
    
    // Subtitle
    ctx.fillStyle = '#FFD54F';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('ZOMBIE APOCALYPSE', 200, 180);
    
    // Decorative elements
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(50, 100);
    ctx.lineTo(100, 100);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(300, 100);
    ctx.lineTo(350, 100);
    ctx.stroke();
  }, 'logo.png');
}

// Create all assets
function createAllAssets() {
  createPlayerCharacter();
  createEnemy();
  createBossEnemy();
  createForcefieldSkill();
  createLaserSkill();
  createDroneSkill();
  createExperienceOrb();
  createHealthBar();
  createSkillSelectionUI();
  createGameBackground();
  createGameLogo();
  
  console.log('All assets created successfully!');
}

// Call this function to generate all assets
createAllAssets();

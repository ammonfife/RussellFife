// Main game file integrating all enhanced systems
import EnhancedEvolutionSystem from './enhanced-evolution-system.js';
import EnhancedVisualSystem from './enhanced-visual-system.js';
import WebOptimizer from './web-optimizer.js';

class SurvivorGame {
  constructor() {
    // Game configuration
    this.config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#000000',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: {
        preload: this.preload.bind(this),
        create: this.create.bind(this),
        update: this.update.bind(this)
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      render: {
        pixelArt: false,
        antialias: true
      }
    };
    
    // Initialize game
    this.game = new Phaser.Game(this.config);
    
    // Game state
    this.gameState = {
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      health: 100,
      maxHealth: 100,
      wave: 1,
      score: 0,
      gameTime: 0,
      isPaused: false,
      isGameOver: false,
      selectedCharacter: 'default',
      equippedWeapon: 'lightchaser',
      activeSkills: [],
      passiveSkills: [],
      evolvedSkills: []
    };
    
    // Update list for custom update functions
    this.updateList = new Set();
    
    // Input keys
    this.keys = null;
    
    // Debug mode
    this.debugMode = false;
  }
  
  // Preload game assets
  preload() {
    // Load images
    this.load.image('player', 'assets/images/player.png');
    this.load.image('enemy', 'assets/images/enemy.png');
    this.load.image('boss', 'assets/images/boss.png');
    this.load.image('exp-orb', 'assets/images/exp-orb.png');
    this.load.image('health-bar', 'assets/images/health-bar.png');
    this.load.image('forcefield-skill', 'assets/images/forcefield-skill.png');
    this.load.image('laser-skill', 'assets/images/laser-skill.png');
    this.load.image('drone-skill', 'assets/images/drone-skill.png');
    this.load.image('background', 'assets/images/background.png');
    this.load.image('logo', 'assets/images/logo.png');
    
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px Arial',
      fill: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);
    
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      font: '18px Arial',
      fill: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);
    
    // Update loading bar
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(parseInt(value * 100) + '%');
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }
  
  // Create game objects
  create() {
    // Initialize systems
    this.initSystems();
    
    // Create game world
    this.createGameWorld();
    
    // Create player
    this.createPlayer();
    
    // Create enemy groups
    this.createEnemyGroups();
    
    // Create UI
    this.createUI();
    
    // Setup input
    this.setupInput();
    
    // Setup collisions
    this.setupCollisions();
    
    // Setup camera
    this.setupCamera();
    
    // Start game
    this.startGame();
    
    // Apply web optimizations
    this.webOptimizer.applyAllOptimizations();
    
    // Show loading screen
    this.webOptimizer.showLoadingScreen(() => {
      // Start first wave after loading screen
      this.startWave(1);
    });
  }
  
  // Initialize game systems
  initSystems() {
    // Initialize evolution system
    this.evolutionSystem = new EnhancedEvolutionSystem(this);
    
    // Initialize visual system
    this.visualSystem = new EnhancedVisualSystem(this);
    
    // Initialize web optimizer
    this.webOptimizer = new WebOptimizer(this);
  }
  
  // Create game world
  createGameWorld() {
    // Create background
    this.background = this.add.tileSprite(0, 0, this.cameras.main.width * 2, this.cameras.main.height * 2, 'background');
    this.background.setOrigin(0);
    this.background.setDepth(-1);
    
    // Create world bounds
    this.physics.world.setBounds(0, 0, this.cameras.main.width * 2, this.cameras.main.height * 2);
  }
  
  // Create player
  createPlayer() {
    // Create player sprite
    this.player = this.physics.add.sprite(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'player'
    );
    this.player.setDepth(10);
    this.player.setCollideWorldBounds(true);
    
    // Set player properties
    this.player.health = this.gameState.health;
    this.player.maxHealth = this.gameState.maxHealth;
    this.player.speed = 200;
    this.player.isImmune = false;
    
    // Apply toony outline to player
    this.visualSystem.applyToonyOutline(this.player);
    
    // Create shadow for player
    this.visualSystem.createShadowEffect(this.player);
  }
  
  // Create enemy groups
  createEnemyGroups() {
    // Create enemies group
    this.enemies = this.physics.add.group();
    
    // Create experience orbs group
    this.expOrbs = this.physics.add.group();
    
    // Create skill effects group
    this.skillEffects = this.physics.add.group();
  }
  
  // Create UI
  createUI() {
    // UI is created in the visual system
  }
  
  // Setup input
  setupInput() {
    // Create virtual joystick for mobile
    this.joystick = this.plugins.get('rexVirtualJoystick').add(this, {
      x: 100,
      y: this.cameras.main.height - 100,
      radius: 60,
      base: this.add.circle(0, 0, 60, 0x888888, 0.5),
      thumb: this.add.circle(0, 0, 30, 0xcccccc, 0.8),
      dir: '8dir',
      forceMin: 16,
      enable: true
    });
    
    // Setup keyboard input
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      q: Phaser.Input.Keyboard.KeyCodes.Q
    });
    
    // Debug key
    this.input.keyboard.on('keydown-D', () => {
      this.debugMode = !this.debugMode;
      if (this.debugMode) {
        this.webOptimizer.showDebugUI();
        this.webOptimizer.showFpsCounter();
      } else {
        this.webOptimizer.hideDebugUI();
        this.webOptimizer.hideFpsCounter();
      }
    });
    
    // Quality settings key
    this.input.keyboard.on('keydown-Q', () => {
      this.webOptimizer.toggleQualitySettingsUI();
    });
  }
  
  // Setup collisions
  setupCollisions() {
    // Player collects experience orbs
    this.physics.add.overlap(this.player, this.expOrbs, this.collectExp, null, this);
    
    // Enemies damage player
    this.physics.add.overlap(this.player, this.enemies, this.enemyHitPlayer, null, this);
    
    // Skill effects damage enemies
    this.physics.add.overlap(this.skillEffects, this.enemies, this.skillHitEnemy, null, this);
  }
  
  // Setup camera
  setupCamera() {
    // Camera follows player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
  }
  
  // Start game
  startGame() {
    // Reset game state
    this.gameState.level = 1;
    this.gameState.experience = 0;
    this.gameState.experienceToNextLevel = 100;
    this.gameState.health = 100;
    this.gameState.maxHealth = 100;
    this.gameState.wave = 1;
    this.gameState.score = 0;
    this.gameState.gameTime = 0;
    this.gameState.isPaused = false;
    this.gameState.isGameOver = false;
    
    // Update UI
    this.visualSystem.updateHealthBar(this.gameState.health, this.gameState.maxHealth);
    this.visualSystem.updateExpBar(this.gameState.experience, this.gameState.experienceToNextLevel, this.gameState.level);
    this.visualSystem.updateWaveIndicator(this.gameState.wave);
    
    // Start game timer
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateGameTime,
      callbackScope: this,
      loop: true
    });
  }
  
  // Start a new wave
  startWave(waveNumber) {
    this.gameState.wave = waveNumber;
    this.visualSystem.updateWaveIndicator(waveNumber);
    
    // Check if boss wave
    const isBossWave = waveNumber % 5 === 0;
    
    if (isBossWave) {
      // Show boss warning
      this.visualSystem.showBossWarning();
      
      // Spawn boss after delay
      this.time.delayedCall(3000, () => {
        this.spawnBoss();
      });
    } else {
      // Spawn regular enemies
      const enemyCount = 5 + (waveNumber * 2);
      
      for (let i = 0; i < enemyCount; i++) {
        this.time.delayedCall(i * 500, () => {
          this.spawnEnemy();
        });
      }
    }
    
    // Schedule next wave
    const waveDelay = isBossWave ? 30000 : 20000;
    this.time.delayedCall(waveDelay, () => {
      if (!this.gameState.isGameOver) {
        this.startWave(waveNumber + 1);
      }
    });
  }
  
  // Spawn regular enemy
  spawnEnemy() {
    // Don't spawn if game is over
    if (this.gameState.isGameOver) return;
    
    // Calculate spawn position outside screen
    const spawnSide = Phaser.Math.Between(0, 3); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;
    
    const cameraX = this.cameras.main.scrollX;
    const cameraY = this.cameras.main.scrollY;
    const cameraWidth = this.cameras.main.width;
    const cameraHeight = this.cameras.main.height;
    
    switch (spawnSide) {
      case 0: // top
        x = cameraX + Phaser.Math.Between(0, cameraWidth);
        y = cameraY - 50;
        break;
      case 1: // right
        x = cameraX + cameraWidth + 50;
        y = cameraY + Phaser.Math.Between(0, cameraHeight);
        break;
      case 2: // bottom
        x = cameraX + Phaser.Math.Between(0, cameraWidth);
        y = cameraY + cameraHeight + 50;
        break;
      case 3: // left
        x = cameraX - 50;
        y = cameraY + Phaser.Math.Between(0, cameraHeight);
        break;
    }
    
    // Create enemy
    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setDepth(5);
    
    // Set enemy properties
    enemy.health = 20 + (this.gameState.wave * 5);
    enemy.maxHealth = enemy.health;
    enemy.damage = 10 + (this.gameState.wave * 2);
    enemy.speed = 50 + (this.gameState.wave * 2);
    enemy.scoreValue = 10;
    enemy.expValue = 5;
    
    // Apply toony outline to enemy
    this.visualSystem.applyToonyOutline(enemy);
    
    // Create health bar for enemy
    this.visualSystem.createEnemyHealthBar(enemy);
    
    // Create shadow for enemy
    this.visualSystem.createShadowEffect(enemy);
    
    return enemy;
  }
  
  // Spawn boss enemy
  spawnBoss() {
    // Don't spawn if game is over
    if (this.gameState.isGameOver) return;
    
    // Calculate spawn position outside screen
    const spawnSide = Phaser.Math.Between(0, 3); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;
    
    const cameraX = this.cameras.main.scrollX;
    const cameraY = this.cameras.main.scrollY;
    const cameraWidth = this.cameras.main.width;
    const cameraHeight = this.cameras.main.height;
    
    switch (spawnSide) {
      case 0: // top
        x = cameraX + Phaser.Math.Between(0, cameraWidth);
        y = cameraY - 100;
        break;
      case 1: // right
        x = cameraX + cameraWidth + 100;
        y = cameraY + Phaser.Math.Between(0, cameraHeight);
        break;
      case 2: // bottom
        x = cameraX + Phaser.Math.Between(0, cameraWidth);
        y = cameraY + cameraHeight + 100;
        break;
      case 3: // left
        x = cameraX - 100;
        y = cameraY + Phaser.Math.Between(0, cameraHeight);
        break;
    }
    
    // Create boss
    const boss = this.enemies.create(x, y, 'boss');
    boss.setDepth(5);
    boss.setScale(2);
    
    // Set boss properties
    boss.health = 200 + (this.gameState.wave * 20);
    boss.maxHealth = boss.health;
    boss.damage = 20 + (this.gameState.wave * 5);
    boss.speed = 30 + (this.gameState.wave * 1);
    boss.scoreValue = 100;
    boss.expValue = 50;
    boss.isBoss = true;
    
    // Apply toony outline to boss
    this.visualSystem.applyToonyOutline(boss);
    
    // Create health bar for boss
    this.visualSystem.createEnemyHealthBar(boss);
    
    // Create shadow for boss
    this.visualSystem.createShadowEffect(boss);
    
    // Create screen shake effect
    this.visualSystem.createScreenShake(10, 500);
    
    return boss;
  }
  
  // Collect experience orb
  collectExp(player, orb) {
    // Add experience
    this.gameState.experience += orb.expValue;
    
    // Show pickup effect
    this.visualSystem.showItemPickupEffect(orb.x, orb.y, `+${orb.expValue} EXP`, 0x00ffff);
    
    // Destroy orb
    orb.destroy();
    
    // Check for level up
    if (this.gameState.experience >= this.gameState.experienceToNextLevel) {
      this.levelUp();
    }
    
    // Update experience bar
    this.visualSystem.updateExpBar(
      this.gameState.experience,
      this.gameState.experienceToNextLevel,
      this.gameState.level
    );
  }
  
  // Level up
  levelUp() {
    // Increase level
    this.gameState.level++;
    
    // Reset experience
    this.gameState.experience -= this.gameState.experienceToNextLevel;
    
    // Increase experience required for next level
    this.gameState.experienceToNextLevel = Math.floor(this.gameState.experienceToNextLevel * 1.2);
    
    // Increase max health
    this.gameState.maxHealth += 10;
    this.gameState.health = this.gameState.maxHealth;
    this.player.maxHealth = this.gameState.maxHealth;
    this.player.health = this.gameState.health;
    
    // Update health bar
    this.visualSystem.updateHealthBar(this.gameState.health, this.gameState.maxHealth);
    
    // Show level up effect
    this.visualSystem.showLevelUpEffect(this.player.x, this.player.y, this.gameState.level);
    
    // Pause game and show skill selection
    this.showSkillSelection();
  }
  
  // Show skill selection
  showSkillSelection() {
    // Pause game
    this.physics.pause();
    this.gameState.isPaused = true;
    
    // Create skill selection UI
    this.createSkillSelectionUI();
  }
  
  // Create skill selection UI
  createSkillSelectionUI() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create container
    this.skillSelectionContainer = this.add.container(0, 0);
    this.skillSelectionContainer.setDepth(100);
    
    // Background overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    overlay.setOrigin(0);
    
    // Title
    const title = this.add.text(width / 2, 50, 'LEVEL UP!', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);
    
    // Subtitle
    const subtitle = this.add.text(width / 2, 100, 'Choose a skill:', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    subtitle.setOrigin(0.5);
    
    // Add elements to container
    this.skillSelectionContainer.add([overlay, title, subtitle]);
    
    // Get available skills
    const availableSkills = this.getAvailableSkills();
    
    // Create skill cards
    const cardWidth = 200;
    const cardHeight = 300;
    const padding = 20;
    const startX = (width - (availableSkills.length * (cardWidth + padding) - padding)) / 2;
    const startY = 150;
    
    availableSkills.forEach((skill, index) => {
      const x = startX + index * (cardWidth + padding);
      
      // Card background
      const card = this.add.rectangle(x, startY, cardWidth, cardHeight, 0x333333);
      card.setOrigin(0);
      card.setInteractive();
      
      // Skill name
      const nameText = this.add.text(x + cardWidth / 2, startY + 20, skill.name, {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      });
      nameText.setOrigin(0.5, 0);
      
      // Skill icon
      const icon = this.add.sprite(x + cardWidth / 2, startY + 100, skill.key);
      icon.setScale(1.5);
      
      // Skill description
      const descText = this.add.text(x + cardWidth / 2, startY + 180, skill.description, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: cardWidth - 20 }
      });
      descText.setOrigin(0.5, 0);
      
      // Hover effects
      card.on('pointerover', () => {
        card.setFillStyle(0x555555);
      });
      
      card.on('pointerout', () => {
        card.setFillStyle(0x333333);
      });
      
      // Click handler
      card.on('pointerdown', () => {
        this.selectSkill(skill);
        this.skillSelectionContainer.destroy();
        
        // Resume game
        this.physics.resume();
        this.gameState.isPaused = false;
        
        // Check for possible evolutions
        this.checkEvolutions();
      });
      
      // Add to container
      this.skillSelectionContainer.add([card, nameText, icon, descText]);
    });
  }
  
  // Get available skills for selection
  getAvailableSkills() {
    // Get all active and passive skills
    const allActiveSkills = this.evolutionSystem.getActiveSkills();
    const allPassiveSkills = this.evolutionSystem.getPassiveSkills();
    
    // Combine all skills
    const allSkills = [...allActiveSkills, ...allPassiveSkills];
    
    // Filter out skills player already has
    const availableSkills = allSkills.filter(skill => {
      return !this.gameState.activeSkills.some(s => s.name === skill.name) &&
             !this.gameState.passiveSkills.some(s => s.name === skill.name);
    });
    
    // Randomly select 3 skills
    const selectedSkills = [];
    while (selectedSkills.length < 3 && availableSkills.length > 0) {
      const index = Phaser.Math.Between(0, availableSkills.length - 1);
      selectedSkills.push(availableSkills[index]);
      availableSkills.splice(index, 1);
    }
    
    return selectedSkills;
  }
  
  // Select a skill
  selectSkill(skill) {
    // Add skill to appropriate list
    if (skill.type === 'active') {
      this.gameState.activeSkills.push({
        ...skill,
        level: 1,
        maxLevel: 5,
        cooldown: skill.baseStats.cooldown,
        cooldownTimer: 0
      });
    } else if (skill.type === 'passive') {
      this.gameState.passiveSkills.push({
        ...skill,
        level: 1,
        maxLevel: 5
      });
    }
    
    // Show skill activation effect
    this.visualSystem.showSkillActivationEffect(
      this.player.x,
      this.player.y,
      skill.name,
      skill.type === 'active' ? 0x00ffff : 0x00ff00
    );
  }
  
  // Check for possible evolutions
  checkEvolutions() {
    // Get all player skills
    const playerSkills = [
      ...this.gameState.activeSkills,
      ...this.gameState.passiveSkills
    ];
    
    // Check for possible evolutions
    const possibleEvolutions = this.evolutionSystem.checkEvolutionPossible(playerSkills);
    
    if (possibleEvolutions.length > 0) {
      // Show evolution selection UI
      this.evolutionSystem.showEvolutionSelectionUI(
        possibleEvolutions,
        playerSkills,
        (updatedSkills) => {
          // Update player skills
          const activeSkills = updatedSkills.filter(skill => skill.type === 'active');
          const passiveSkills = updatedSkills.filter(skill => skill.type === 'passive');
          const evolvedSkills = updatedSkills.filter(skill => skill.type === 'evolved');
          
          this.gameState.activeSkills = activeSkills;
          this.gameState.passiveSkills = passiveSkills;
          this.gameState.evolvedSkills = evolvedSkills;
        }
      );
    }
  }
  
  // Enemy hits player
  enemyHitPlayer(player, enemy) {
    // Skip if player is immune
    if (player.isImmune) return;
    
    // Reduce player health
    this.gameState.health -= enemy.damage;
    player.health = this.gameState.health;
    
    // Show damage text
    this.visualSystem.showDamageText(player.x, player.y, enemy.damage);
    
    // Update health bar
    this.visualSystem.updateHealthBar(this.gameState.health, this.gameState.maxHealth);
    
    // Flash player
    this.tweens.add({
      targets: player,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
    
    // Make player immune for a short time
    player.isImmune = true;
    this.time.delayedCall(1000, () => {
      player.isImmune = false;
    });
    
    // Check for game over
    if (this.gameState.health <= 0) {
      this.gameOver();
    }
  }
  
  // Skill hits enemy
  skillHitEnemy(skill, enemy) {
    // Reduce enemy health
    enemy.health -= skill.damage;
    
    // Show damage text
    this.visualSystem.createFloatingDamage(enemy, skill.damage);
    
    // Update enemy health bar
    if (enemy.updateHealthBar) {
      enemy.updateHealthBar();
    }
    
    // Flash enemy
    this.tweens.add({
      targets: enemy,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });
    
    // Check if enemy is defeated
    if (enemy.health <= 0) {
      this.defeatEnemy(enemy);
    }
  }
  
  // Defeat enemy
  defeatEnemy(enemy) {
    // Add score
    this.gameState.score += enemy.scoreValue;
    
    // Show death effect
    this.visualSystem.showDeathEffect(enemy.x, enemy.y, true);
    
    // Spawn experience orbs
    for (let i = 0; i < (enemy.isBoss ? 10 : 1); i++) {
      const orb = this.expOrbs.create(
        enemy.x + Phaser.Math.Between(-20, 20),
        enemy.y + Phaser.Math.Between(-20, 20),
        'exp-orb'
      );
      orb.setDepth(3);
      orb.expValue = enemy.isBoss ? 10 : enemy.expValue;
      
      // Apply toony outline to orb
      this.visualSystem.applyToonyOutline(orb, 2, 0x00ffff);
    }
    
    // Destroy enemy
    enemy.destroy();
    
    // Check if all enemies are defeated
    if (this.enemies.getChildren().length === 0) {
      // Start next wave
      this.startWave(this.gameState.wave + 1);
    }
  }
  
  // Game over
  gameOver() {
    // Set game over state
    this.gameState.isGameOver = true;
    
    // Stop game timer
    this.gameTimer.remove();
    
    // Show death effect
    this.visualSystem.showDeathEffect(this.player.x, this.player.y, false);
    
    // Create game over screen
    this.createGameOverScreen();
  }
  
  // Create game over screen
  createGameOverScreen() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create container
    this.gameOverContainer = this.add.container(0, 0);
    this.gameOverContainer.setDepth(100);
    
    // Background overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    overlay.setOrigin(0);
    
    // Game over text
    const gameOverText = this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontFamily: 'Arial',
      fontSize: '64px',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6
    });
    gameOverText.setOrigin(0.5);
    
    // Score text
    const scoreText = this.add.text(width / 2, height / 2, `Score: ${this.gameState.score}`, {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    scoreText.setOrigin(0.5);
    
    // Wave text
    const waveText = this.add.text(width / 2, height / 2 + 50, `Wave: ${this.gameState.wave}`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    waveText.setOrigin(0.5);
    
    // Time text
    const minutes = Math.floor(this.gameState.gameTime / 60);
    const seconds = this.gameState.gameTime % 60;
    const timeText = this.add.text(
      width / 2,
      height / 2 + 100,
      `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`,
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    timeText.setOrigin(0.5);
    
    // Restart button
    const restartButton = this.add.rectangle(width / 2, height / 2 + 200, 200, 50, 0x00aa00);
    restartButton.setOrigin(0.5);
    restartButton.setInteractive();
    
    const restartText = this.add.text(width / 2, height / 2 + 200, 'RESTART', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });
    restartText.setOrigin(0.5);
    
    // Button hover effects
    restartButton.on('pointerover', () => {
      restartButton.setFillStyle(0x00cc00);
    });
    
    restartButton.on('pointerout', () => {
      restartButton.setFillStyle(0x00aa00);
    });
    
    // Button click handler
    restartButton.on('pointerdown', () => {
      this.scene.restart();
    });
    
    // Add elements to container
    this.gameOverContainer.add([
      overlay,
      gameOverText,
      scoreText,
      waveText,
      timeText,
      restartButton,
      restartText
    ]);
  }
  
  // Update game time
  updateGameTime() {
    this.gameState.gameTime++;
    this.visualSystem.updateTimer(this.gameState.gameTime);
  }
  
  // Update method called every frame
  update() {
    // Skip if game is paused or over
    if (this.gameState.isPaused || this.gameState.isGameOver) return;
    
    // Update player movement
    this.updatePlayerMovement();
    
    // Update enemy movement
    this.updateEnemyMovement();
    
    // Update skills
    this.updateSkills();
    
    // Update custom update functions
    this.updateList.forEach(obj => {
      if (obj.update) {
        obj.update();
      }
    });
    
    // Update web optimizer
    this.webOptimizer.update();
  }
  
  // Update player movement
  updatePlayerMovement() {
    // Reset velocity
    this.player.setVelocity(0);
    
    // Get movement input
    let moveX = 0;
    let moveY = 0;
    
    // Joystick input
    if (this.joystick && this.joystick.force > 0) {
      moveX = this.joystick.forceX;
      moveY = this.joystick.forceY;
    }
    // Keyboard input
    else {
      if (this.keys.left.isDown) {
        moveX = -1;
      } else if (this.keys.right.isDown) {
        moveX = 1;
      }
      
      if (this.keys.up.isDown) {
        moveY = -1;
      } else if (this.keys.down.isDown) {
        moveY = 1;
      }
    }
    
    // Normalize movement vector
    if (moveX !== 0 || moveY !== 0) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      moveX /= length;
      moveY /= length;
      
      // Apply movement
      this.player.setVelocity(
        moveX * this.player.speed,
        moveY * this.player.speed
      );
      
      // Rotate player to face movement direction
      this.player.rotation = Math.atan2(moveY, moveX);
    }
  }
  
  // Update enemy movement
  updateEnemyMovement() {
    this.enemies.getChildren().forEach(enemy => {
      // Move towards player
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );
      
      enemy.rotation = angle;
      
      enemy.setVelocity(
        Math.cos(angle) * enemy.speed,
        Math.sin(angle) * enemy.speed
      );
      
      // Update health bar position
      if (enemy.updateHealthBar) {
        enemy.updateHealthBar();
      }
    });
  }
  
  // Update skills
  updateSkills() {
    // Update active skills
    this.gameState.activeSkills.forEach(skill => {
      // Update cooldown
      if (skill.cooldownTimer > 0) {
        skill.cooldownTimer -= this.game.loop.delta;
      }
      
      // Activate skill when cooldown is ready
      if (skill.cooldownTimer <= 0) {
        this.activateSkill(skill);
        skill.cooldownTimer = skill.cooldown;
      }
    });
    
    // Update evolved skills
    this.gameState.evolvedSkills.forEach(skill => {
      // Update cooldown
      if (skill.cooldownTimer > 0) {
        skill.cooldownTimer -= this.game.loop.delta;
      }
      
      // Activate skill when cooldown is ready
      if (skill.cooldownTimer <= 0) {
        this.evolutionSystem.activateEvolvedSkill(skill);
        skill.cooldownTimer = skill.cooldown;
      }
    });
  }
  
  // Activate skill
  activateSkill(skill) {
    switch (skill.name) {
      case 'Forcefield':
        this.activateForcefield(skill);
        break;
      case 'Laser':
        this.activateLaser(skill);
        break;
      case 'Drone':
        this.activateDrone(skill);
        break;
      // Add more skills here
      default:
        console.warn(`No activation method for skill: ${skill.name}`);
    }
  }
  
  // Activate forcefield skill
  activateForcefield(skill) {
    // Create forcefield effect
    const forcefield = this.skillEffects.create(this.player.x, this.player.y, 'forcefield-skill');
    forcefield.setScale(0.1);
    forcefield.setAlpha(0.7);
    forcefield.setDepth(9);
    forcefield.damage = skill.baseStats.damage * (1 + (skill.level - 1) * 0.2);
    
    // Make forcefield follow player
    forcefield.update = () => {
      forcefield.x = this.player.x;
      forcefield.y = this.player.y;
    };
    
    // Add to update list
    this.updateList.add(forcefield);
    
    // Expand forcefield
    this.tweens.add({
      targets: forcefield,
      scale: skill.baseStats.radius / 24,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        // Shrink and remove forcefield
        this.tweens.add({
          targets: forcefield,
          scale: 0.1,
          alpha: 0,
          duration: skill.baseStats.duration,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            this.updateList.delete(forcefield);
            forcefield.destroy();
          }
        });
      }
    });
    
    // Show skill activation effect
    this.visualSystem.showSkillActivationEffect(this.player.x, this.player.y, 'Forcefield', 0x00ffff);
  }
  
  // Activate laser skill
  activateLaser(skill) {
    // Get angle based on player rotation
    const angle = this.player.rotation;
    
    // Calculate laser endpoints
    const startX = this.player.x;
    const startY = this.player.y;
    const endX = startX + Math.cos(angle) * skill.baseStats.range;
    const endY = startY + Math.sin(angle) * skill.baseStats.range;
    
    // Create laser effect
    const laser = this.skillEffects.create(startX, startY, 'laser-skill');
    laser.setOrigin(0, 0.5);
    laser.setScale(skill.baseStats.range / 32, 1);
    laser.setRotation(angle);
    laser.setDepth(8);
    laser.damage = skill.baseStats.damage * (1 + (skill.level - 1) * 0.2);
    
    // Animate laser
    this.tweens.add({
      targets: laser,
      alpha: 0,
      duration: skill.baseStats.duration,
      onComplete: () => {
        laser.destroy();
      }
    });
    
    // Show skill activation effect
    this.visualSystem.showSkillActivationEffect(this.player.x, this.player.y, 'Laser', 0xff0000);
  }
  
  // Activate drone skill
  activateDrone(skill) {
    // Create drone
    const drone = this.skillEffects.create(this.player.x, this.player.y, 'drone-skill');
    drone.setDepth(8);
    drone.damage = skill.baseStats.damage * (1 + (skill.level - 1) * 0.2);
    drone.lifespan = skill.baseStats.duration;
    drone.speed = skill.baseStats.speed;
    drone.target = null;
    
    // Drone behavior
    drone.update = () => {
      // Reduce lifespan
      drone.lifespan -= this.game.loop.delta;
      
      // Destroy if lifespan is over
      if (drone.lifespan <= 0) {
        this.updateList.delete(drone);
        drone.destroy();
        return;
      }
      
      // Find nearest enemy if no target or target is destroyed
      if (!drone.target || !drone.target.active) {
        drone.target = this.findNearestEnemy(drone.x, drone.y);
      }
      
      // Move towards target
      if (drone.target) {
        const angle = Phaser.Math.Angle.Between(
          drone.x, drone.y,
          drone.target.x, drone.target.y
        );
        
        drone.rotation = angle;
        
        drone.x += Math.cos(angle) * drone.speed * this.game.loop.delta / 1000;
        drone.y += Math.sin(angle) * drone.speed * this.game.loop.delta / 1000;
        
        // Attack target if close enough
        const distance = Phaser.Math.Distance.Between(
          drone.x, drone.y,
          drone.target.x, drone.target.y
        );
        
        if (distance < 20) {
          // Damage enemy
          drone.target.health -= drone.damage;
          
          // Show damage text
          this.visualSystem.createFloatingDamage(drone.target, drone.damage);
          
          // Update enemy health bar
          if (drone.target.updateHealthBar) {
            drone.target.updateHealthBar();
          }
          
          // Check if enemy is defeated
          if (drone.target.health <= 0) {
            this.defeatEnemy(drone.target);
            drone.target = null;
          } else {
            // Find new target
            drone.target = null;
          }
        }
      } else {
        // Return to player if no target
        const angle = Phaser.Math.Angle.Between(
          drone.x, drone.y,
          this.player.x, this.player.y
        );
        
        drone.rotation = angle;
        
        drone.x += Math.cos(angle) * drone.speed * this.game.loop.delta / 1000;
        drone.y += Math.sin(angle) * drone.speed * this.game.loop.delta / 1000;
      }
    };
    
    // Add to update list
    this.updateList.add(drone);
    
    // Show skill activation effect
    this.visualSystem.showSkillActivationEffect(this.player.x, this.player.y, 'Drone', 0x00ff00);
  }
  
  // Find nearest enemy
  findNearestEnemy(x, y) {
    let nearestEnemy = null;
    let nearestDistance = Infinity;
    
    this.enemies.getChildren().forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    });
    
    return nearestEnemy;
  }
}

// Initialize game when DOM is loaded
window.onload = () => {
  // Add virtual joystick plugin
  const VirtualJoystickPlugin = window.rexvirtualjoystickplugin;
  
  if (VirtualJoystickPlugin) {
    Phaser.Plugins.DefaultScene.add('rexVirtualJoystick', VirtualJoystickPlugin);
  }
  
  // Create game
  const game = new SurvivorGame();
};

export default SurvivorGame;

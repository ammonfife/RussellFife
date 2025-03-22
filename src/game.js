// Main game file for Survivor.io style game
import 'phaser';

// Game scenes
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load all game assets
    this.load.image('player', 'assets/images/player.png');
    this.load.image('enemy', 'assets/images/enemy.png');
    this.load.image('boss', 'assets/images/boss.png');
    this.load.image('forcefield-skill', 'assets/images/forcefield-skill.png');
    this.load.image('laser-skill', 'assets/images/laser-skill.png');
    this.load.image('drone-skill', 'assets/images/drone-skill.png');
    this.load.image('exp-orb', 'assets/images/exp-orb.png');
    this.load.image('health-bar', 'assets/images/health-bar.png');
    this.load.image('background', 'assets/images/background.png');
    this.load.image('logo', 'assets/images/logo.png');
    
    // Display loading progress
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        fill: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);
    
    const percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: '0%',
      style: {
        font: '18px monospace',
        fill: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);
    
    this.load.on('progress', function (value) {
      percentText.setText(parseInt(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });
    
    this.load.on('complete', function () {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }

  create() {
    this.scene.start('TitleScene');
  }
}

class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    // Display game logo and title
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background
    this.add.image(width / 2, height / 2, 'background');
    
    // Logo
    this.add.image(width / 2, height / 3, 'logo');
    
    // Start game button
    const startButton = this.add.text(width / 2, height / 2 + 100, 'START GAME', {
      font: 'bold 32px Arial',
      fill: '#ffffff',
      backgroundColor: '#4CAF50',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    });
    startButton.setOrigin(0.5);
    startButton.setInteractive({ useHandCursor: true });
    
    // Button hover effect
    startButton.on('pointerover', () => {
      startButton.setStyle({ fill: '#ffffff', backgroundColor: '#388E3C' });
    });
    
    startButton.on('pointerout', () => {
      startButton.setStyle({ fill: '#ffffff', backgroundColor: '#4CAF50' });
    });
    
    // Start game on click
    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Game variables
    this.score = 0;
    this.level = 1;
    this.gameOver = false;
    this.waveNumber = 1;
    this.enemiesKilled = 0;
    this.playerHealth = 100;
    this.playerExperience = 0;
    this.experienceToNextLevel = 100;
    this.activeSkills = [];
    this.skillSlots = 3;
    this.availableSkills = [
      { key: 'forcefield-skill', name: 'Forcefield', level: 0, maxLevel: 5, damage: 10, cooldown: 5000, duration: 3000, radius: 100 },
      { key: 'laser-skill', name: 'Laser', level: 0, maxLevel: 5, damage: 20, cooldown: 3000, duration: 500, range: 300 },
      { key: 'drone-skill', name: 'Drone', level: 0, maxLevel: 5, damage: 5, cooldown: 1000, duration: 10000, speed: 150 }
    ];
    
    // Create game world
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background
    this.add.tileSprite(0, 0, width * 2, height * 2, 'background').setOrigin(0);
    
    // Player
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    
    // Create virtual joystick for movement
    this.joystick = this.plugins.get('rexVirtualJoystick').add(this, {
      x: 100,
      y: height - 100,
      radius: 60,
      base: this.add.circle(0, 0, 60, 0x888888, 0.5),
      thumb: this.add.circle(0, 0, 30, 0xcccccc, 0.8),
    });
    
    // Enemy group
    this.enemies = this.physics.add.group();
    
    // Experience orbs group
    this.expOrbs = this.physics.add.group();
    
    // Skills group
    this.skillEffects = this.physics.add.group();
    
    // UI elements
    this.createUI();
    
    // Collisions
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);
    this.physics.add.overlap(this.player, this.expOrbs, this.collectExp, null, this);
    this.physics.add.overlap(this.skillEffects, this.enemies, this.skillHitEnemy, null, this);
    
    // Start spawning enemies
    this.startWave();
    
    // Auto-attack timer
    this.time.addEvent({
      delay: 1000,
      callback: this.autoAttack,
      callbackScope: this,
      loop: true
    });
    
    // Skill selection on level up
    this.events.on('levelUp', this.showSkillSelection, this);
  }

  update() {
    if (this.gameOver) return;
    
    // Player movement with virtual joystick
    if (this.joystick.force > 0) {
      const speed = 200;
      this.player.setVelocity(
        this.joystick.forceX * speed,
        this.joystick.forceY * speed
      );
      
      // Rotate player to face movement direction
      this.player.rotation = this.joystick.rotation;
    } else {
      this.player.setVelocity(0);
    }
    
    // Update active skills
    this.activeSkills.forEach(skill => {
      if (skill.cooldownTimer > 0) {
        skill.cooldownTimer -= this.game.loop.delta;
      } else {
        this.activateSkill(skill);
        skill.cooldownTimer = skill.cooldown;
      }
    });
    
    // Update UI
    this.updateUI();
  }

  createUI() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Score text
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      font: '24px Arial',
      fill: '#ffffff'
    });
    this.scoreText.setDepth(20);
    
    // Level text
    this.levelText = this.add.text(width - 150, 20, 'Level: 1', {
      font: '24px Arial',
      fill: '#ffffff'
    });
    this.levelText.setDepth(20);
    
    // Wave text
    this.waveText = this.add.text(width / 2, 20, 'Wave: 1', {
      font: '24px Arial',
      fill: '#ffffff'
    });
    this.waveText.setOrigin(0.5, 0);
    this.waveText.setDepth(20);
    
    // Health bar
    this.healthBarBackground = this.add.rectangle(width / 2, height - 30, 300, 20, 0x000000);
    this.healthBarBackground.setOrigin(0.5);
    this.healthBarBackground.setDepth(20);
    
    this.healthBar = this.add.rectangle(width / 2 - 150, height - 30, 300, 20, 0x00ff00);
    this.healthBar.setOrigin(0, 0.5);
    this.healthBar.setDepth(20);
    
    // Experience bar
    this.expBarBackground = this.add.rectangle(width / 2, height - 60, 400, 10, 0x000000);
    this.expBarBackground.setOrigin(0.5);
    this.expBarBackground.setDepth(20);
    
    this.expBar = this.add.rectangle(width / 2 - 200, height - 60, 0, 10, 0xffff00);
    this.expBar.setOrigin(0, 0.5);
    this.expBar.setDepth(20);
    
    // Skill icons
    this.skillIcons = [];
    for (let i = 0; i < this.skillSlots; i++) {
      const icon = this.add.rectangle(width - 60 - i * 70, height - 60, 60, 60, 0x333333);
      icon.setDepth(20);
      this.skillIcons.push(icon);
    }
  }

  updateUI() {
    // Update score
    this.scoreText.setText(`Score: ${this.score}`);
    
    // Update level
    this.levelText.setText(`Level: ${this.level}`);
    
    // Update wave
    this.waveText.setText(`Wave: ${this.waveNumber}`);
    
    // Update health bar
    this.healthBar.width = (this.playerHealth / 100) * 300;
    
    // Update experience bar
    this.expBar.width = (this.playerExperience / this.experienceToNextLevel) * 400;
    
    // Update skill icons
    this.activeSkills.forEach((skill, index) => {
      if (index < this.skillIcons.length) {
        // Update cooldown indicator
        const cooldownPercent = skill.cooldownTimer / skill.cooldown;
        this.skillIcons[index].fillColor = cooldownPercent > 0 ? 0x666666 : 0x333333;
      }
    });
  }

  startWave() {
    // Clear previous enemies
    this.enemies.clear(true, true);
    
    // Spawn enemies based on wave number
    const enemyCount = 5 + (this.waveNumber * 3);
    
    for (let i = 0; i < enemyCount; i++) {
      this.spawnEnemy();
    }
    
    // Spawn boss every 5 waves
    if (this.waveNumber % 5 === 0) {
      this.spawnBoss();
    }
    
    // Increase wave number for next wave
    this.waveNumber++;
    
    // Schedule next wave
    this.time.delayedCall(30000, () => {
      if (!this.gameOver) {
        this.startWave();
      }
    });
  }

  spawnEnemy() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Spawn enemy outside the screen
    let x, y;
    const side = Phaser.Math.Between(0, 3);
    
    switch (side) {
      case 0: // Top
        x = Phaser.Math.Between(0, width);
        y = -50;
        break;
      case 1: // Right
        x = width + 50;
        y = Phaser.Math.Between(0, height);
        break;
      case 2: // Bottom
        x = Phaser.Math.Between(0, width);
        y = height + 50;
        break;
      case 3: // Left
        x = -50;
        y = Phaser.Math.Between(0, height);
        break;
    }
    
    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.health = 30 + (this.waveNumber * 5);
    enemy.speed = 50 + (this.waveNumber * 2);
    enemy.damage = 5 + this.waveNumber;
    enemy.expValue = 10;
    enemy.setDepth(5);
    
    // Move enemy towards player
    this.physics.moveToObject(enemy, this.player, enemy.speed);
  }

  spawnBoss() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Spawn boss at a random edge
    let x, y;
    const side = Phaser.Math.Between(0, 3);
    
    switch (side) {
      case 0: // Top
        x = Phaser.Math.Between(0, width);
        y = -100;
        break;
      case 1: // Right
        x = width + 100;
        y = Phaser.Math.Between(0, height);
        break;
      case 2: // Bottom
        x = Phaser.Math.Between(0, width);
        y = height + 100;
        break;
      case 3: // Left
        x = -100;
        y = Phaser.Math.Between(0, height);
        break;
    }
    
    const boss = this.enemies.create(x, y, 'boss');
    boss.health = 200 + (this.waveNumber * 20);
    boss.speed = 30 + (this.waveNumber * 1);
    boss.damage = 15 + (this.waveNumber * 2);
    boss.expValue = 50;
    boss.isBoss = true;
    boss.setScale(1.5);
    boss.setDepth(8);
    
    // Move boss towards player
    this.physics.moveToObject(boss, this.player, boss.speed);
  }

  autoAttack() {
    if (this.gameOver) return;
    
    // Find closest enemy
    let closestEnemy = null;
    let closestDistance = 200; // Attack range
    
    this.enemies.getChildren().forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );
      
      if (distance < closestDistance) {
        closestEnemy = enemy;
        closestDistance = distance;
      }
    });
    
    // Attack closest enemy
    if (closestEnemy) {
      // Create attack effect
      const attackLine = this.add.line(
        0, 0,
        this.player.x, this.player.y,
        closestEnemy.x, closestEnemy.y,
        0xffffff
      );
      attackLine.setLineWidth(2);
      attackLine.setOrigin(0);
      
      // Damage enemy
      closestEnemy.health -= 10 + (this.level * 2);
      
      // Flash enemy
      this.tweens.add({
        targets: closestEnemy,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // Check if enemy is defeated
          if (closestEnemy.health <= 0) {
            this.defeatEnemy(closestEnemy);
          }
        }
      });
      
      // Remove attack effect
      this.time.delayedCall(100, () => {
        attackLine.destroy();
      });
    }
  }

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
    }
  }

  activateForcefield(skill) {
    // Create forcefield effect
    const forcefield = this.skillEffects.create(this.player.x, this.player.y, 'forcefield-skill');
    forcefield.setScale(skill.radius / 24); // Scale to match radius
    forcefield.setAlpha(0.7);
    forcefield.setDepth(9);
    forcefield.damage = skill.damage * (1 + skill.level * 0.2);
    
    // Expand forcefield
    this.tweens.add({
      targets: forcefield,
      scale: forcefield.scale * 1.2,
      alpha: 0.3,
      duration: skill.duration,
      onComplete: () => {
        forcefield.destroy();
      }
    });
    
    // Damage and push enemies within radius
    this.enemies.getChildren().forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );
      
      if (distance < skill.radius) {
        // Damage enemy
        enemy.health -= forcefield.damage;
        
        // Push enemy away
        const angle = Phaser.Math.Angle.Between(
          this.player.x, this.player.y,
          enemy.x, enemy.y
        );
        
        const pushX = Math.cos(angle) * 200;
        const pushY = Math.sin(angle) * 200;
        
        enemy.setVelocity(pushX, pushY);
        
        // Check if enemy is defeated
        if (enemy.health <= 0) {
          this.defeatEnemy(enemy);
        }
      }
    });
  }

  activateLaser(skill) {
    // Find enemies in range
    const targets = [];
    
    this.enemies.getChildren().forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );
      
      if (distance < skill.range) {
        targets.push(enemy);
      }
    });
    
    // Sort targets by distance
    targets.sort((a, b) => {
      const distA = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        a.x, a.y
      );
      
      const distB = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        b.x, b.y
      );
      
      return distA - distB;
    });
    
    // Limit targets based on skill level
    const maxTargets = 1 + skill.level;
    const selectedTargets = targets.slice(0, maxTargets);
    
    // Fire laser at each target
    selectedTargets.forEach(target => {
      // Create laser effect
      const laser = this.add.line(
        0, 0,
        this.player.x, this.player.y,
        target.x, target.y,
        0xff0000
      );
      laser.setLineWidth(3);
      laser.setOrigin(0);
      
      // Create impact effect
      const impact = this.add.circle(target.x, target.y, 20, 0xff0000, 0.7);
      
      // Damage enemy
      target.health -= skill.damage * (1 + skill.level * 0.2);
      
      // Flash enemy
      this.tweens.add({
        targets: target,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // Check if enemy is defeated
          if (target.health <= 0) {
            this.defeatEnemy(target);
          }
        }
      });
      
      // Remove effects
      this.time.delayedCall(skill.duration, () => {
        laser.destroy();
        impact.destroy();
      });
    });
  }

  activateDrone(skill) {
    // Create drone
    const drone = this.skillEffects.create(this.player.x, this.player.y, 'drone-skill');
    drone.setDepth(9);
    drone.damage = skill.damage * (1 + skill.level * 0.2);
    drone.lifespan = skill.duration;
    drone.attackTimer = 0;
    drone.attackInterval = 500;
    
    // Add update function to drone
    drone.update = (time, delta) => {
      // Follow player with offset
      const offsetX = Math.cos(time * 0.003) * 50;
      const offsetY = Math.sin(time * 0.003) * 50;
      
      drone.x = Phaser.Math.Linear(drone.x, this.player.x + offsetX, 0.1);
      drone.y = Phaser.Math.Linear(drone.y, this.player.y + offsetY, 0.1);
      
      // Attack nearby enemies
      drone.attackTimer += delta;
      
      if (drone.attackTimer >= drone.attackInterval) {
        drone.attackTimer = 0;
        
        // Find closest enemy
        let closestEnemy = null;
        let closestDistance = 150; // Drone attack range
        
        this.enemies.getChildren().forEach(enemy => {
          const distance = Phaser.Math.Distance.Between(
            drone.x, drone.y,
            enemy.x, enemy.y
          );
          
          if (distance < closestDistance) {
            closestEnemy = enemy;
            closestDistance = distance;
          }
        });
        
        // Attack closest enemy
        if (closestEnemy) {
          // Create attack effect
          const attackLine = this.add.line(
            0, 0,
            drone.x, drone.y,
            closestEnemy.x, closestEnemy.y,
            0x9c27b0
          );
          attackLine.setLineWidth(2);
          attackLine.setOrigin(0);
          
          // Damage enemy
          closestEnemy.health -= drone.damage;
          
          // Flash enemy
          this.tweens.add({
            targets: closestEnemy,
            alpha: 0.5,
            duration: 50,
            yoyo: true,
            onComplete: () => {
              // Check if enemy is defeated
              if (closestEnemy.health <= 0) {
                this.defeatEnemy(closestEnemy);
              }
            }
          });
          
          // Remove attack effect
          this.time.delayedCall(100, () => {
            attackLine.destroy();
          });
        }
      }
      
      // Update lifespan
      drone.lifespan -= delta;
      
      if (drone.lifespan <= 0) {
        drone.destroy();
      }
    };
    
    // Add drone to update list
    this.updateList.add(drone);
  }

  playerHitEnemy(player, enemy) {
    if (this.gameOver) return;
    
    // Player takes damage
    this.playerHealth -= enemy.damage;
    
    // Flash player
    this.tweens.add({
      targets: player,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });
    
    // Push player away from enemy
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );
    
    const pushX = Math.cos(angle) * 150;
    const pushY = Math.sin(angle) * 150;
    
    player.setVelocity(pushX, pushY);
    
    // Check if player is defeated
    if (this.playerHealth <= 0) {
      this.gameOver = true;
      this.playerHealth = 0;
      this.showGameOver();
    }
  }

  skillHitEnemy(skill, enemy) {
    // Damage is handled in the specific skill activation methods
  }

  defeatEnemy(enemy) {
    // Increase score
    this.score += enemy.isBoss ? 100 : 10;
    
    // Increase enemies killed count
    this.enemiesKilled++;
    
    // Spawn experience orb
    const expOrb = this.expOrbs.create(enemy.x, enemy.y, 'exp-orb');
    expOrb.expValue = enemy.expValue;
    expOrb.setDepth(3);
    
    // Add movement towards player
    this.tweens.add({
      targets: expOrb,
      x: this.player.x,
      y: this.player.y,
      duration: 1000,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.collectExp(this.player, expOrb);
      }
    });
    
    // Remove enemy
    enemy.destroy();
  }

  collectExp(player, expOrb) {
    // Increase player experience
    this.playerExperience += expOrb.expValue;
    
    // Check for level up
    if (this.playerExperience >= this.experienceToNextLevel) {
      this.levelUp();
    }
    
    // Remove experience orb
    expOrb.destroy();
  }

  levelUp() {
    // Increase level
    this.level++;
    
    // Reset experience for next level
    this.playerExperience -= this.experienceToNextLevel;
    this.experienceToNextLevel = 100 + (this.level * 50);
    
    // Heal player
    this.playerHealth = Math.min(this.playerHealth + 20, 100);
    
    // Trigger level up event
    this.events.emit('levelUp');
  }

  showSkillSelection() {
    // Pause game
    this.scene.pause();
    
    // Create skill selection UI
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const selectionScene = this.scene.add('SkillSelectionScene', {
      active: true,
      visible: true
    });
    
    selectionScene.init({
      availableSkills: this.availableSkills,
      activeSkills: this.activeSkills,
      skillSlots: this.skillSlots,
      level: this.level,
      parentScene: this
    });
  }

  showGameOver() {
    // Create game over UI
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0);
    overlay.setDepth(30);
    
    // Game over text
    const gameOverText = this.add.text(width / 2, height / 3, 'GAME OVER', {
      font: 'bold 64px Arial',
      fill: '#ff0000'
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(31);
    
    // Score text
    const scoreText = this.add.text(width / 2, height / 2, `Score: ${this.score}`, {
      font: '32px Arial',
      fill: '#ffffff'
    });
    scoreText.setOrigin(0.5);
    scoreText.setDepth(31);
    
    // Level text
    const levelText = this.add.text(width / 2, height / 2 + 50, `Level: ${this.level}`, {
      font: '32px Arial',
      fill: '#ffffff'
    });
    levelText.setOrigin(0.5);
    levelText.setDepth(31);
    
    // Enemies killed text
    const enemiesText = this.add.text(width / 2, height / 2 + 100, `Enemies Killed: ${this.enemiesKilled}`, {
      font: '32px Arial',
      fill: '#ffffff'
    });
    enemiesText.setOrigin(0.5);
    enemiesText.setDepth(31);
    
    // Restart button
    const restartButton = this.add.text(width / 2, height / 2 + 200, 'RESTART', {
      font: 'bold 32px Arial',
      fill: '#ffffff',
      backgroundColor: '#4CAF50',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    });
    restartButton.setOrigin(0.5);
    restartButton.setInteractive({ useHandCursor: true });
    restartButton.setDepth(31);
    
    // Button hover effect
    restartButton.on('pointerover', () => {
      restartButton.setStyle({ fill: '#ffffff', backgroundColor: '#388E3C' });
    });
    
    restartButton.on('pointerout', () => {
      restartButton.setStyle({ fill: '#ffffff', backgroundColor: '#4CAF50' });
    });
    
    // Restart game on click
    restartButton.on('pointerdown', () => {
      this.scene.restart();
    });
  }
}

class SkillSelectionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SkillSelectionScene' });
  }

  init(data) {
    this.availableSkills = data.availableSkills;
    this.activeSkills = data.activeSkills;
    this.skillSlots = data.skillSlots;
    this.level = data.level;
    this.parentScene = data.parentScene;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0);
    
    // Title
    const title = this.add.text(width / 2, height / 4, 'LEVEL UP!', {
      font: 'bold 48px Arial',
      fill: '#ffffff'
    });
    title.setOrigin(0.5);
    
    // Subtitle
    const subtitle = this.add.text(width / 2, height / 4 + 60, 'Choose a skill:', {
      font: '24px Arial',
      fill: '#ffffff'
    });
    subtitle.setOrigin(0.5);
    
    // Get three random skills
    const skillChoices = this.getSkillChoices();
    
    // Create skill buttons
    const buttonWidth = 200;
    const buttonHeight = 250;
    const buttonSpacing = 30;
    const totalWidth = (buttonWidth * 3) + (buttonSpacing * 2);
    const startX = (width - totalWidth) / 2;
    
    skillChoices.forEach((skill, index) => {
      const x = startX + (buttonWidth / 2) + (index * (buttonWidth + buttonSpacing));
      const y = height / 2 + 50;
      
      // Button background
      const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x333333);
      button.setInteractive({ useHandCursor: true });
      
      // Skill icon
      const icon = this.add.image(x, y - 70, skill.key);
      icon.setScale(2);
      
      // Skill name
      const nameText = this.add.text(x, y + 20, skill.name, {
        font: 'bold 24px Arial',
        fill: '#ffffff'
      });
      nameText.setOrigin(0.5);
      
      // Skill level
      const levelText = this.add.text(x, y + 60, `Level: ${skill.level + 1}`, {
        font: '20px Arial',
        fill: '#ffffff'
      });
      levelText.setOrigin(0.5);
      
      // Skill description
      let description = '';
      switch (skill.name) {
        case 'Forcefield':
          description = `Damage: ${skill.damage * (1 + (skill.level + 1) * 0.2)}\nRadius: ${skill.radius}`;
          break;
        case 'Laser':
          description = `Damage: ${skill.damage * (1 + (skill.level + 1) * 0.2)}\nTargets: ${1 + (skill.level + 1)}`;
          break;
        case 'Drone':
          description = `Damage: ${skill.damage * (1 + (skill.level + 1) * 0.2)}\nDuration: ${skill.duration / 1000}s`;
          break;
      }
      
      const descText = this.add.text(x, y + 100, description, {
        font: '16px Arial',
        fill: '#ffffff',
        align: 'center'
      });
      descText.setOrigin(0.5);
      
      // Button hover effect
      button.on('pointerover', () => {
        button.fillColor = 0x555555;
      });
      
      button.on('pointerout', () => {
        button.fillColor = 0x333333;
      });
      
      // Select skill on click
      button.on('pointerdown', () => {
        this.selectSkill(skill);
      });
    });
  }

  getSkillChoices() {
    // Filter skills that can be upgraded or added
    const availableChoices = this.availableSkills.filter(skill => {
      // Check if skill is already active
      const activeSkill = this.activeSkills.find(active => active.name === skill.name);
      
      if (activeSkill) {
        // Can upgrade if not at max level
        return activeSkill.level < skill.maxLevel;
      } else {
        // Can add if there are free slots
        return this.activeSkills.length < this.skillSlots;
      }
    });
    
    // If no skills available, return empty array
    if (availableChoices.length === 0) {
      return [];
    }
    
    // Shuffle available choices
    const shuffled = [...availableChoices].sort(() => 0.5 - Math.random());
    
    // Return up to 3 choices
    return shuffled.slice(0, 3);
  }

  selectSkill(skill) {
    // Check if skill is already active
    const activeIndex = this.activeSkills.findIndex(active => active.name === skill.name);
    
    if (activeIndex >= 0) {
      // Upgrade existing skill
      this.activeSkills[activeIndex].level++;
    } else {
      // Add new skill
      const newSkill = { ...skill, level: 1, cooldownTimer: 0 };
      this.activeSkills.push(newSkill);
    }
    
    // Resume parent scene
    this.scene.resume('GameScene');
    this.scene.remove('SkillSelectionScene');
  }
}

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, TitleScene, GameScene, SkillSelectionScene],
  plugins: {
    global: [{
      key: 'rexVirtualJoystick',
      plugin: VirtualJoystickPlugin,
      start: true
    }]
  }
};

// Initialize game
const game = new Phaser.Game(config);

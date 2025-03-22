// Main game file integrating all survival mechanics
import 'phaser';
import EvolutionSystem from './evolution-system.js';
import WaveSystem from './wave-system.js';
import ExperienceSystem from './experience-system.js';

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
    this.gameOver = false;
    this.playerHealth = 100;
    this.playerMaxHealth = 100;
    this.playerAttackDamage = 10;
    this.playerSpeed = 200;
    this.activeSkills = [];
    this.skillSlots = 3;
    this.availableSkills = [
      { key: 'forcefield-skill', name: 'Forcefield', level: 0, maxLevel: 5, damage: 10, cooldown: 5000, duration: 3000, radius: 100 },
      { key: 'laser-skill', name: 'Laser', level: 0, maxLevel: 5, damage: 20, cooldown: 3000, duration: 500, range: 300 },
      { key: 'drone-skill', name: 'Drone', level: 0, maxLevel: 5, damage: 5, cooldown: 1000, duration: 10000, speed: 150 }
    ];
    
    // Create update list for custom update functions
    this.updateList = new Set();
    
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
    
    // Initialize systems
    this.evolutionSystem = new EvolutionSystem(this);
    this.waveSystem = new WaveSystem(this);
    this.experienceSystem = new ExperienceSystem(this);
    
    // Initialize experience system
    this.experienceSystem.initialize();
    
    // Collisions
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);
    this.physics.add.overlap(this.skillEffects, this.enemies, this.skillHitEnemy, null, this);
    
    // Start wave system
    this.waveSystem.start();
    
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

  update(time, delta) {
    if (this.gameOver) return;
    
    // Player movement with virtual joystick
    if (this.joystick.force > 0) {
      this.player.setVelocity(
        this.joystick.forceX * this.playerSpeed,
        this.joystick.forceY * this.playerSpeed
      );
      
      // Rotate player to face movement direction
      this.player.rotation = this.joystick.rotation;
    } else {
      this.player.setVelocity(0);
    }
    
    // Update active skills
    this.activeSkills.forEach(skill => {
      if (skill.cooldownTimer > 0) {
        skill.cooldownTimer -= delta;
      } else {
        if (skill.isEvolved) {
          this.evolutionSystem.activateEvolvedSkill(skill);
        } else {
          this.activateSkill(skill);
        }
        skill.cooldownTimer = skill.cooldown;
      }
    });
    
    // Update wave system
    this.waveSystem.update(delta);
    
    // Update experience system
    this.experienceSystem.update();
    
    // Update custom update functions
    this.updateList.forEach(obj => {
      if (obj.update) {
        obj.update(time, delta);
      }
    });
    
    // Update UI
    this.updateUI();
    
    // Check for possible evolutions
    this.checkEvolutions();
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
    
    // Update health bar
    this.healthBar.width = (this.playerHealth / this.playerMaxHealth) * 300;
    
    // Update skill icons
    this.activeSkills.forEach((skill, index) => {
      if (index < this.skillIcons.length) {
        // Update cooldown indicator
        const cooldownPercent = skill.cooldownTimer / skill.cooldown;
        this.skillIcons[index].fillColor = cooldownPercent > 0 ? 0x666666 : 0x333333;
      }
    });
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
      closestEnemy.health -= this.playerAttackDamage;
      
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
        this.updateList.delete(drone);
        drone.destroy();
      }
    };
    
    // Add drone to update list
    this.updateList.add(drone);
  }

  playerHitEnemy(player, enemy) {
    if (this.gameOver || player.isImmune) return;
    
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
    
    // Spawn experience orb
    this.experienceSystem.spawnExperienceOrb(enemy.x, enemy.y, enemy.expValue);
    
    // Remove enemy from update list if it has an update function
    this.updateList.delete(enemy);
    
    // Remove enemy
    enemy.destroy();
  }

  checkEvolutions() {
    // Check for possible evolutions
    const possibleEvolutions = this.evolutionSystem.checkEvolutionPossible(this.activeSkills);
    
    // If evolutions are available and not already shown
    if (possibleEvolutions.length > 0 && !this.evolutionNotified) {
      this.evolutionNotified = true;
      
      // Show evolution available message
      this.showMessage('Evolution Available!', 0x9c27b0);
      
      // Show evolution button
      this.showEvolutionButton(possibleEvolutions[0]);
    }
  }

  showEvolutionButton(evolution) {
    const width = this.cameras.main.width;
    
    // Create evolution button
    const evolutionButton = this.add.text(width - 150, 70, 'EVOLVE', {
      font: 'bold 20px Arial',
      fill: '#ffffff',
      backgroundColor: '#9c27b0',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    });
    evolutionButton.setDepth(20);
    evolutionButton.setInteractive({ useHandCursor: true });
    
    // Button hover effect
    evolutionButton.on('pointerover', () => {
      evolutionButton.setStyle({ fill: '#ffffff', backgroundColor: '#7b1fa2' });
    });
    
    evolutionButton.on('pointerout', () => {
      evolutionButton.setStyle({ fill: '#ffffff', backgroundColor: '#9c27b0' });
    });
    
    // Evolve skills on click
    evolutionButton.on('pointerdown', () => {
      // Evolve skills
      this.activeSkills = this.evolutionSystem.evolveSkills(evolution, this.activeSkills);
      
      // Show evolution effect
      this.showEvolutionEffect(evolution);
      
      // Remove button
      evolutionButton.destroy();
      
      // Reset notification flag
      this.evolutionNotified = false;
    });
  }

  showEvolutionEffect(evolution) {
    // Create evolution text
    const evolutionText = this.add.text(
      this.player.x,
      this.player.y - 50,
      'EVOLUTION!',
      {
        font: 'bold 32px Arial',
        fill: '#9c27b0',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    evolutionText.setOrigin(0.5);
    evolutionText.setDepth(20);
    
    // Show evolution name
    const nameText = this.add.text(
      this.player.x,
      this.player.y - 20,
      evolution.name,
      {
        font: 'bold 24px Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    nameText.setOrigin(0.5);
    nameText.setDepth(20);
    
    // Animate texts
    this.tweens.add({
      targets: [evolutionText, nameText],
      y: '-=50',
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        evolutionText.destroy();
        nameText.destroy();
      }
    });
    
    // Create evolution effect
    const effect = this.add.circle(
      this.player.x,
      this.player.y,
      100,
      0x9c27b0,
      0.5
    );
    effect.setDepth(5);
    
    // Animate effect
    this.tweens.add({
      targets: effect,
      alpha: 0,
      scale: 3,
      duration: 1000,
      onComplete: () => {
        effect.destroy();
      }
    });
    
    // Show message
    this.showMessage(`Evolved: ${evolution.name}!`, 0x9c27b0);
  }

  showSkillSelection() {
    // Pause game
    this.scene.pause();
    
    // Create skill selection UI
    const selectionScene = this.scene.add('SkillSelectionScene', {
      active: true,
      visible: true
    });
    
    selectionScene.init({
      availableSkills: this.availableSkills,
      activeSkills: this.activeSkills,
      skillSlots: this.skillSlots,
      level: this.experienceSystem.playerLevel,
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
    const levelText = this.add.text(width / 2, height / 2 + 50, `Level: ${this.experienceSystem.playerLevel}`, {
      font: '32px Arial',
      fill: '#ffffff'
    });
    levelText.setOrigin(0.5);
    levelText.setDepth(31);
    
    // Wave text
    const waveText = this.add.text(width / 2, height / 2 + 100, `Wave: ${this.waveSystem.waveNumber}`, {
      font: '32px Arial',
      fill: '#ffffff'
    });
    waveText.setOrigin(0.5);
    waveText.setDepth(31);
    
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

  showWaveMessage(text, color = 0xffffff) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create message text
    const messageText = this.add.text(
      width / 2,
      height / 3,
      text,
      {
        font: 'bold 48px Arial',
        fill: color ? `#${color.toString(16)}` : '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    messageText.setOrigin(0.5);
    messageText.setDepth(25);
    
    // Animate message
    this.tweens.add({
      targets: messageText,
      alpha: 0,
      y: height / 3 - 50,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        messageText.destroy();
      }
    });
  }

  showMessage(text, color = 0xffffff) {
    const width = this.cameras.main.width;
    
    // Create message text
    const messageText = this.add.text(
      width / 2,
      100,
      text,
      {
        font: 'bold 24px Arial',
        fill: color ? `#${color.toString(16)}` : '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    messageText.setOrigin(0.5);
    messageText.setDepth(25);
    
    // Animate message
    this.tweens.add({
      targets: messageText,
      alpha: 0,
      y: 70,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        messageText.destroy();
      }
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

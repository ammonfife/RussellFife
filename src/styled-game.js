// Main game file with integrated visual styling
import 'phaser';
import EvolutionSystem from './evolution-system.js';
import WaveSystem from './wave-system.js';
import ExperienceSystem from './experience-system.js';
import { VisualEffects, OutlinePipeline } from './visual-effects.js';
import AnimationSystem from './animation-system.js';

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
    // Register custom pipeline
    const renderer = this.game.renderer;
    if (renderer.pipelines) {
      renderer.pipelines.add('OutlinePipeline', new OutlinePipeline(this.game));
    }
    
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
    
    // Background with parallax effect
    const background = this.add.tileSprite(0, 0, width, height, 'background');
    background.setOrigin(0);
    
    // Add parallax effect
    this.tweens.add({
      targets: background,
      tilePositionX: 100,
      tilePositionY: 100,
      duration: 10000,
      ease: 'Sine.InOut',
      yoyo: true,
      repeat: -1
    });
    
    // Logo with animation
    const logo = this.add.image(width / 2, height / 3, 'logo');
    logo.setScale(0);
    
    // Animate logo
    this.tweens.add({
      targets: logo,
      scale: 1,
      duration: 1000,
      ease: 'Back.Out',
      onComplete: () => {
        // Add pulse animation
        this.tweens.add({
          targets: logo,
          scale: 1.05,
          duration: 1000,
          yoyo: true,
          repeat: -1
        });
      }
    });
    
    // Title text with glow effect
    const titleText = this.add.text(width / 2, height / 2, 'SURVIVAL GAME', {
      font: 'bold 48px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    });
    titleText.setOrigin(0.5);
    
    // Add glow effect
    this.tweens.add({
      targets: titleText,
      alpha: 0.8,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });
    
    // Start game button
    const startButton = this.add.text(width / 2, height / 2 + 100, 'START GAME', {
      font: 'bold 32px Arial',
      fill: '#ffffff',
      backgroundColor: '#4CAF50',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
      stroke: '#000000',
      strokeThickness: 4
    });
    startButton.setOrigin(0.5);
    startButton.setInteractive({ useHandCursor: true });
    
    // Button hover effect
    startButton.on('pointerover', () => {
      startButton.setStyle({ fill: '#ffffff', backgroundColor: '#388E3C' });
      startButton.setScale(1.1);
    });
    
    startButton.on('pointerout', () => {
      startButton.setStyle({ fill: '#ffffff', backgroundColor: '#4CAF50' });
      startButton.setScale(1);
    });
    
    // Start game on click
    startButton.on('pointerdown', () => {
      // Add click effect
      this.tweens.add({
        targets: startButton,
        scale: 0.9,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // Fade out scene
          this.cameras.main.fade(500, 0, 0, 0);
          this.time.delayedCall(500, () => {
            this.scene.start('GameScene');
          });
        }
      });
    });
    
    // Add particles
    const particles = this.add.particles(0, 0, 'exp-orb', {
      scale: { start: 0.2, end: 0.1 },
      alpha: { start: 0.5, end: 0 },
      speed: 20,
      lifespan: 2000,
      blendMode: 'ADD',
      frequency: 200,
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(0, 0, width, height) }
    });
    
    // Fade in scene
    this.cameras.main.fadeIn(1000);
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
    
    // Background with parallax effect
    this.background = this.add.tileSprite(0, 0, width * 2, height * 2, 'background');
    this.background.setOrigin(0);
    
    // Player
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    
    // Apply toony outline to player
    if (this.game.renderer.pipelines) {
      this.player.setPipeline('OutlinePipeline');
    }
    
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
    this.visualEffects = new VisualEffects(this);
    this.animationSystem = new AnimationSystem(this);
    
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
    
    // Start player idle animation
    this.animationSystem.play('player-idle');
    
    // Fade in scene
    this.cameras.main.fadeIn(500);
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
      
      // Update background for parallax effect
      this.background.tilePositionX += this.joystick.forceX * 0.5;
      this.background.tilePositionY += this.joystick.forceY * 0.5;
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
        
        // Play skill activation effect
        this.visualEffects.playSkillEffect(
          this.player.x, 
          this.player.y, 
          skill.name === 'Forcefield' ? 0x00ffff : 
          skill.name === 'Laser' ? 0xff0000 : 0x9c27b0
        );
      }
    });
    
    // Update wave system
    this.waveSystem.update(delta);
    
    // Update experience system
    this.experienceSystem.update();
    
    // Update visual effects
    this.visualEffects.update();
    
    // Update animation system
    this.animationSystem.update(time, delta);
    
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
    
    // Score text with shadow
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      font: 'bold 24px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scoreText.setDepth(20);
    
    // Level text with shadow
    this.levelText = this.add.text(width - 150, 20, 'Level: 1', {
      font: 'bold 24px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.levelText.setDepth(20);
    
    // Wave text with shadow
    this.waveText = this.add.text(width / 2, 20, 'Wave: 1', {
      font: 'bold 24px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.waveText.setOrigin(0.5, 0);
    this.waveText.setDepth(20);
    
    // Health bar with border
    this.healthBarBorder = this.add.rectangle(width / 2, height - 30, 304, 24, 0x000000);
    this.healthBarBorder.setOrigin(0.5);
    this.healthBarBorder.setDepth(19);
    
    this.healthBarBackground = this.add.rectangle(width / 2, height - 30, 300, 20, 0x333333);
    this.healthBarBackground.setOrigin(0.5);
    this.healthBarBackground.setDepth(20);
    
    this.healthBar = this.add.rectangle(width / 2 - 150, height - 30, 300, 20, 0x00ff00);
    this.healthBar.setOrigin(0, 0.5);
    this.healthBar.setDepth(20);
    
    // Experience bar with border
    this.expBarBorder = this.add.rectangle(width / 2, height - 60, 404, 14, 0x000000);
    this.expBarBorder.setOrigin(0.5);
    this.expBarBorder.setDepth(19);
    
    this.expBarBackground = this.add.rectangle(width / 2, height - 60, 400, 10, 0x333333);
    this.expBarBackground.setOrigin(0.5);
    this.expBarBackground.setDepth(20);
    
    this.expBar = this.add.rectangle(width / 2 - 200, height - 60, 0, 10, 0xffff00);
    this.expBar.setOrigin(0, 0.5);
    this.expBar.setDepth(20);
    
    // Skill icons with borders
    this.skillIcons = [];
    for (let i = 0; i < this.skillSlots; i++) {
      // Icon border
      const iconBorder = this.add.rectangle(width - 60 - i * 70, height - 60, 64, 64, 0x000000);
      iconBorder.setDepth(19);
      
      // Icon background
      const icon = this.add.rectangle(width - 60 - i * 70, height - 60, 60, 60, 0x333333);
      icon.setDepth(20);
      
      // Cooldown overlay
      const cooldown = this.add.rectangle(width - 60 - i * 70, height - 60, 60, 60, 0x666666);
      cooldown.setOrigin(0.5, 0);
      cooldown.height = 0;
      cooldown.setDepth(21);
      
      this.skillIcons.push({ background: icon, cooldown: cooldown });
    }
  }

  updateUI() {
    // Update score
    this.scoreText.setText(`Score: ${this.score}`);
    
    // Update health bar with smooth transition
    const targetWidth = (this.playerHealth / this.playerMaxHealth) * 300;
    this.healthBar.width = Phaser.Math.Linear(this.healthBar.width, targetWidth, 0.1);
    
    // Update health bar color based on health percentage
    const healthPercent = this.playerHealth / this.playerMaxHealth;
    if (healthPercent < 0.3) {
      this.healthBar.fillColor = 0xff0000; // Red when low health
    } else if (healthPercent < 0.6) {
      this.healthBar.fillColor = 0xffff00; // Yellow when medium health
    } else {
      this.healthBar.fillColor = 0x00ff00; // Green when high health
    }
    
    // Update skill icons
    this.activeSkills.forEach((skill, index) => {
      if (index < this.skillIcons.length) {
        // Update cooldown indicator
        const cooldownPercent = skill.cooldownTimer / skill.cooldown;
        this.skillIcons[index].cooldown.height = 60 * cooldownPercent;
        
        // Add skill icon if not already added
        if (!this.skillIcons[index].icon && skill.key) {
          const icon = this.add.image(
            this.skillIcons[index].background.x,
            this.skillIcons[index].background.y,
            skill.key
          );
          icon.setScale(0.8);
          icon.setDepth(22);
          this.skillIcons[index].icon = icon;
        }
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
      
      // Add glow effect
      const glowLine = this.add.line(
        0, 0,
        this.player.x, this.player.y,
        closestEnemy.x, closestEnemy.y,
        0xffffff
      );
      glowLine.setLineWidth(4);
      glowLine.setOrigin(0);
      glowLine.setAlpha(0.3);
      
      // Damage enemy
      closestEnemy.health -= this.playerAttackDamage;
      
      // Show damage number
      this.visualEffects.addDamageNumber(
        closestEnemy.x, 
        closestEnemy.y, 
        this.playerAttackDamage,
        false
      );
      
      // Play hit effect
      this.visualEffects.playHitEffect(closestEnemy.x, closestEnemy.y);
      
      // Play enemy hit animation
      this.animationSystem.play('enemy-hit', closestEnemy);
      
      // Check if enemy is defeated
      if (closestEnemy.health <= 0) {
        this.defeatEnemy(closestEnemy);
      }
      
      // Remove attack effect with animation
      this.tweens.add({
        targets: [attackLine, glowLine],
        alpha: 0,
        duration: 200,
        onComplete: () => {
          attackLine.destroy();
          glowLine.destroy();
        }
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
    
    // Apply toony outline
    if (this.game.renderer.pipelines) {
      forcefield.setPipeline('OutlinePipeline');
    }
    
    // Play forcefield animation
    this.animationSystem.play('forcefield-activate', forcefield);
    
    // Damage and push enemies within radius
    this.enemies.getChildren().forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );
      
      if (distance < skill.radius) {
        // Damage enemy
        enemy.health -= forcefield.damage;
        
        // Show damage number
        this.visualEffects.addDamageNumber(
          enemy.x, 
          enemy.y, 
          forcefield.damage,
          false
        );
        
        // Push enemy away
        const angle = Phaser.Math.Angle.Between(
          this.player.x, this.player.y,
          enemy.x, enemy.y
        );
        
        const pushX = Math.cos(angle) * 200;
        const pushY = Math.sin(angle) * 200;
        
        enemy.setVelocity(pushX, pushY);
        
        // Play hit effect
        this.visualEffects.playHitEffect(enemy.x, enemy.y, 0x00ffff);
        
        // Play enemy hit animation
        this.animationSystem.play('enemy-hit', enemy);
        
        // Check if enemy is defeated
        if (enemy.health <= 0) {
          this.defeatEnemy(enemy);
        }
      }
    });
    
    // Remove forcefield after duration
    this.time.delayedCall(skill.duration, () => {
      // Fade out animation
      this.tweens.add({
        targets: forcefield,
        alpha: 0,
        scale: forcefield.scale * 1.5,
        duration: 300,
        onComplete: () => {
          forcefield.destroy();
        }
      });
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
      
      // Add glow effect
      const glowLaser = this.add.line(
        0, 0,
        this.player.x, this.player.y,
        target.x, target.y,
        0xff9999
      );
      glowLaser.setLineWidth(6);
      glowLaser.setOrigin(0);
      glowLaser.setAlpha(0.3);
      
      // Play laser animation
      this.animationSystem.play('laser-activate', laser);
      
      // Create impact effect
      const impact = this.add.circle(target.x, target.y, 20, 0xff0000, 0.7);
      
      // Damage enemy
      const damage = skill.damage * (1 + skill.level * 0.2);
      target.health -= damage;
      
      // Show damage number
      this.visualEffects.addDamageNumber(
        target.x, 
        target.y, 
        damage,
        true
      );
      
      // Play hit effect
      this.visualEffects.playHitEffect(target.x, target.y, 0xff0000);
      
      // Play enemy hit animation
      this.animationSystem.play('enemy-hit', target);
      
      // Check if enemy is defeated
      if (target.health <= 0) {
        this.defeatEnemy(target);
      }
      
      // Remove effects
      this.time.delayedCall(skill.duration, () => {
        this.tweens.add({
          targets: [laser, glowLaser, impact],
          alpha: 0,
          duration: 200,
          onComplete: () => {
            laser.destroy();
            glowLaser.destroy();
            impact.destroy();
          }
        });
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
    
    // Apply toony outline
    if (this.game.renderer.pipelines) {
      drone.setPipeline('OutlinePipeline');
    }
    
    // Play drone animation
    this.animationSystem.play('drone-activate', drone);
    
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
          
          // Add glow effect
          const glowLine = this.add.line(
            0, 0,
            drone.x, drone.y,
            closestEnemy.x, closestEnemy.y,
            0x9c27b0
          );
          glowLine.setLineWidth(4);
          glowLine.setOrigin(0);
          glowLine.setAlpha(0.3);
          
          // Damage enemy
          closestEnemy.health -= drone.damage;
          
          // Show damage number
          this.visualEffects.addDamageNumber(
            closestEnemy.x, 
            closestEnemy.y, 
            drone.damage,
            false
          );
          
          // Play hit effect
          this.visualEffects.playHitEffect(closestEnemy.x, closestEnemy.y, 0x9c27b0);
          
          // Play enemy hit animation
          this.animationSystem.play('enemy-hit', closestEnemy);
          
          // Check if enemy is defeated
          if (closestEnemy.health <= 0) {
            this.defeatEnemy(closestEnemy);
          }
          
          // Remove attack effect
          this.tweens.add({
            targets: [attackLine, glowLine],
            alpha: 0,
            duration: 200,
            onComplete: () => {
              attackLine.destroy();
              glowLine.destroy();
            }
          });
        }
      }
      
      // Update lifespan
      drone.lifespan -= delta;
      
      if (drone.lifespan <= 0) {
        // Fade out animation
        this.tweens.add({
          targets: drone,
          alpha: 0,
          scale: 0.5,
          duration: 300,
          onComplete: () => {
            this.updateList.delete(drone);
            drone.destroy();
          }
        });
      }
    };
    
    // Add drone to update list
    this.updateList.add(drone);
  }

  playerHitEnemy(player, enemy) {
    if (this.gameOver || player.isImmune) return;
    
    // Player takes damage
    const previousHealth = this.playerHealth;
    this.playerHealth -= enemy.damage;
    
    // Play health change animation
    this.animationSystem.play('health-change', false);
    
    // Play player hit animation
    this.animationSystem.play('player-hit');
    
    // Show damage number
    this.visualEffects.addDamageNumber(
      player.x, 
      player.y, 
      enemy.damage,
      false
    );
    
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
    const scoreIncrease = enemy.isBoss ? 100 : 10;
    this.score += scoreIncrease;
    
    // Play score increase animation
    this.animationSystem.play('score-increase', scoreIncrease);
    
    // Play enemy death effect
    this.visualEffects.playEnemyDeathEffect(
      enemy.x, 
      enemy.y, 
      enemy.isBoss ? 0xff0000 : 0xff9900
    );
    
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
      padding: { left: 10, right: 10, top: 5, bottom: 5 },
      stroke: '#000000',
      strokeThickness: 2
    });
    evolutionButton.setDepth(20);
    evolutionButton.setInteractive({ useHandCursor: true });
    
    // Apply button hover animation
    this.animationSystem.apply('button-hover', evolutionButton);
    
    // Evolve skills on click
    evolutionButton.on('pointerdown', () => {
      // Evolve skills
      this.activeSkills = this.evolutionSystem.evolveSkills(evolution, this.activeSkills);
      
      // Show evolution effect
      this.visualEffects.playEvolutionEffect(this.player.x, this.player.y);
      
      // Remove button
      evolutionButton.destroy();
      
      // Reset notification flag
      this.evolutionNotified = false;
    });
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
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(31);
    
    // Add text animation
    this.tweens.add({
      targets: gameOverText,
      scale: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    // Score text
    const scoreText = this.add.text(width / 2, height / 2, `Score: ${this.score}`, {
      font: 'bold 32px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    scoreText.setOrigin(0.5);
    scoreText.setDepth(31);
    
    // Level text
    const levelText = this.add.text(width / 2, height / 2 + 50, `Level: ${this.experienceSystem.playerLevel}`, {
      font: 'bold 32px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    levelText.setOrigin(0.5);
    levelText.setDepth(31);
    
    // Wave text
    const waveText = this.add.text(width / 2, height / 2 + 100, `Wave: ${this.waveSystem.waveNumber}`, {
      font: 'bold 32px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    waveText.setOrigin(0.5);
    waveText.setDepth(31);
    
    // Restart button
    const restartButton = this.add.text(width / 2, height / 2 + 200, 'RESTART', {
      font: 'bold 32px Arial',
      fill: '#ffffff',
      backgroundColor: '#4CAF50',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
      stroke: '#000000',
      strokeThickness: 4
    });
    restartButton.setOrigin(0.5);
    restartButton.setInteractive({ useHandCursor: true });
    restartButton.setDepth(31);
    
    // Apply button hover animation
    this.animationSystem.apply('button-hover', restartButton);
    
    // Restart game on click
    restartButton.on('pointerdown', () => {
      // Add click effect
      this.tweens.add({
        targets: restartButton,
        scale: 0.9,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // Fade out scene
          this.cameras.main.fade(500, 0, 0, 0);
          this.time.delayedCall(500, () => {
            this.scene.restart();
          });
        }
      });
    });
    
    // Add particles
    const particles = this.add.particles(0, 0, 'exp-orb', {
      scale: { start: 0.2, end: 0.1 },
      alpha: { start: 0.5, end: 0 },
      speed: 20,
      lifespan: 2000,
      blendMode: 'ADD',
      frequency: 200,
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(0, 0, width, height) }
    });
    particles.setDepth(29);
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
        strokeThickness: 6
      }
    );
    messageText.setOrigin(0.5);
    messageText.setDepth(25);
    messageText.setScale(0);
    
    // Animate message
    this.tweens.add({
      targets: messageText,
      scale: 1,
      duration: 500,
      ease: 'Back.Out',
      onComplete: () => {
        this.tweens.add({
          targets: messageText,
          alpha: 0,
          y: height / 3 - 50,
          duration: 1500,
          ease: 'Power2',
          delay: 1000,
          onComplete: () => {
            messageText.destroy();
          }
        });
      }
    });
    
    // Play wave change animation
    this.animationSystem.play('wave-change');
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
        strokeThickness: 4
      }
    );
    messageText.setOrigin(0.5);
    messageText.setDepth(25);
    messageText.setScale(0);
    
    // Animate message
    this.tweens.add({
      targets: messageText,
      scale: 1,
      duration: 300,
      ease: 'Back.Out',
      onComplete: () => {
        this.tweens.add({
          targets: messageText,
          alpha: 0,
          y: 70,
          duration: 1500,
          ease: 'Power2',
          delay: 1000,
          onComplete: () => {
            messageText.destroy();
          }
        });
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
    
    // Background overlay with animation
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0);
    overlay.setOrigin(0);
    
    // Animate overlay
    this.tweens.add({
      targets: overlay,
      alpha: 0.7,
      duration: 300
    });
    
    // Title with animation
    const title = this.add.text(width / 2, height / 4, 'LEVEL UP!', {
      font: 'bold 48px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    });
    title.setOrigin(0.5);
    title.setScale(0);
    
    // Animate title
    this.tweens.add({
      targets: title,
      scale: 1,
      duration: 500,
      ease: 'Back.Out'
    });
    
    // Subtitle
    const subtitle = this.add.text(width / 2, height / 4 + 60, 'Choose a skill:', {
      font: 'bold 24px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    subtitle.setOrigin(0.5);
    subtitle.setAlpha(0);
    
    // Animate subtitle
    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 500,
      delay: 300
    });
    
    // Add particles
    const particles = this.add.particles(0, 0, 'exp-orb', {
      scale: { start: 0.2, end: 0.1 },
      alpha: { start: 0.5, end: 0 },
      speed: 20,
      lifespan: 2000,
      blendMode: 'ADD',
      frequency: 200,
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(0, 0, width, height) }
    });
    
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
      
      // Button background with border
      const buttonBorder = this.add.rectangle(x, y, buttonWidth + 4, buttonHeight + 4, 0xffffff);
      buttonBorder.setAlpha(0);
      
      const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x333333);
      button.setAlpha(0);
      button.setInteractive({ useHandCursor: true });
      
      // Animate button
      this.tweens.add({
        targets: [button, buttonBorder],
        alpha: 1,
        duration: 500,
        delay: 400 + (index * 100)
      });
      
      // Skill icon
      const icon = this.add.image(x, y - 70, skill.key);
      icon.setScale(0);
      
      // Animate icon
      this.tweens.add({
        targets: icon,
        scale: 2,
        duration: 500,
        delay: 600 + (index * 100),
        ease: 'Back.Out'
      });
      
      // Skill name
      const nameText = this.add.text(x, y + 20, skill.name, {
        font: 'bold 24px Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      });
      nameText.setOrigin(0.5);
      nameText.setAlpha(0);
      
      // Animate name
      this.tweens.add({
        targets: nameText,
        alpha: 1,
        duration: 500,
        delay: 700 + (index * 100)
      });
      
      // Skill level
      const levelText = this.add.text(x, y + 60, `Level: ${skill.level + 1}`, {
        font: 'bold 20px Arial',
        fill: '#ffff00',
        stroke: '#000000',
        strokeThickness: 3
      });
      levelText.setOrigin(0.5);
      levelText.setAlpha(0);
      
      // Animate level
      this.tweens.add({
        targets: levelText,
        alpha: 1,
        duration: 500,
        delay: 800 + (index * 100)
      });
      
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
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      });
      descText.setOrigin(0.5);
      descText.setAlpha(0);
      
      // Animate description
      this.tweens.add({
        targets: descText,
        alpha: 1,
        duration: 500,
        delay: 900 + (index * 100)
      });
      
      // Button hover effect
      button.on('pointerover', () => {
        button.fillColor = 0x555555;
        buttonBorder.fillColor = 0xffff00;
        
        // Scale up button
        this.tweens.add({
          targets: [button, buttonBorder, icon, nameText, levelText, descText],
          scale: '*=1.05',
          duration: 100
        });
      });
      
      button.on('pointerout', () => {
        button.fillColor = 0x333333;
        buttonBorder.fillColor = 0xffffff;
        
        // Scale down button
        this.tweens.add({
          targets: [button, buttonBorder, icon, nameText, levelText, descText],
          scale: '/=1.05',
          duration: 100
        });
      });
      
      // Select skill on click
      button.on('pointerdown', () => {
        // Add click effect
        this.tweens.add({
          targets: [button, buttonBorder, icon, nameText, levelText, descText],
          scale: '*=0.95',
          duration: 100,
          yoyo: true,
          onComplete: () => {
            this.selectSkill(skill);
          }
        });
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
    
    // Fade out scene
    this.cameras.main.fade(300, 0, 0, 0);
    
    // Resume parent scene
    this.time.delayedCall(300, () => {
      this.scene.resume('GameScene');
      this.scene.remove('SkillSelectionScene');
      
      // Play level up effect in parent scene
      if (this.parentScene.visualEffects) {
        this.parentScene.visualEffects.playLevelUpEffect(
          this.parentScene.player.x,
          this.parentScene.player.y
        );
      }
    });
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

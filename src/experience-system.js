// Experience and leveling system for Survivor.io style game
class ExperienceSystem {
  constructor(scene) {
    this.scene = scene;
    this.playerLevel = 1;
    this.playerExperience = 0;
    this.experienceToNextLevel = 100;
    this.levelUpBonuses = [
      { name: 'Health Boost', description: 'Increases max health by 20%', apply: () => this.applyHealthBoost() },
      { name: 'Attack Boost', description: 'Increases attack damage by 15%', apply: () => this.applyAttackBoost() },
      { name: 'Speed Boost', description: 'Increases movement speed by 10%', apply: () => this.applySpeedBoost() }
    ];
  }

  // Initialize the experience system
  initialize() {
    // Create experience orbs group if not exists
    if (!this.scene.expOrbs) {
      this.scene.expOrbs = this.scene.physics.add.group();
    }
    
    // Set up collision with player
    this.scene.physics.add.overlap(
      this.scene.player, 
      this.scene.expOrbs, 
      this.collectExperience, 
      null, 
      this
    );
  }

  // Update method to be called in scene's update
  update() {
    // Update experience bar if it exists
    if (this.scene.expBar) {
      const percent = this.playerExperience / this.experienceToNextLevel;
      this.scene.expBar.width = percent * 400;
    }
    
    // Update level text if it exists
    if (this.scene.levelText) {
      this.scene.levelText.setText(`Level: ${this.playerLevel}`);
    }
  }

  // Spawn experience orb at position
  spawnExperienceOrb(x, y, value) {
    const expOrb = this.scene.expOrbs.create(x, y, 'exp-orb');
    expOrb.expValue = value || 10;
    expOrb.setDepth(3);
    
    // Add magnetic effect when player is close
    expOrb.update = () => {
      const distance = Phaser.Math.Distance.Between(
        this.scene.player.x, this.scene.player.y,
        expOrb.x, expOrb.y
      );
      
      // If player is close, move orb toward player
      if (distance < 150) {
        const speed = Phaser.Math.Linear(50, 200, 1 - (distance / 150));
        this.scene.physics.moveToObject(expOrb, this.scene.player, speed);
      }
    };
    
    // Add to update list
    this.scene.updateList.add(expOrb);
    
    return expOrb;
  }

  // Collect experience orb
  collectExperience(player, expOrb) {
    // Add experience
    this.addExperience(expOrb.expValue);
    
    // Create collection effect
    const effect = this.scene.add.circle(expOrb.x, expOrb.y, 10, 0xffff00, 0.7);
    
    // Animate effect
    this.scene.tweens.add({
      targets: effect,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => {
        effect.destroy();
      }
    });
    
    // Remove orb
    this.scene.updateList.remove(expOrb);
    expOrb.destroy();
  }

  // Add experience to player
  addExperience(amount) {
    this.playerExperience += amount;
    
    // Check for level up
    if (this.playerExperience >= this.experienceToNextLevel) {
      this.levelUp();
    }
  }

  // Level up player
  levelUp() {
    // Increase level
    this.playerLevel++;
    
    // Reset experience for next level
    this.playerExperience -= this.experienceToNextLevel;
    this.experienceToNextLevel = 100 + (this.playerLevel * 50);
    
    // Show level up effect
    this.showLevelUpEffect();
    
    // Apply level up bonus
    this.applyLevelUpBonus();
    
    // Trigger level up event for skill selection
    this.scene.events.emit('levelUp');
  }

  // Show level up effect
  showLevelUpEffect() {
    // Create level up text
    const levelUpText = this.scene.add.text(
      this.scene.player.x,
      this.scene.player.y - 50,
      'LEVEL UP!',
      {
        font: 'bold 24px Arial',
        fill: '#ffff00',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    levelUpText.setOrigin(0.5);
    levelUpText.setDepth(20);
    
    // Animate level up text
    this.scene.tweens.add({
      targets: levelUpText,
      y: levelUpText.y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        levelUpText.destroy();
      }
    });
    
    // Create level up effect
    const effect = this.scene.add.circle(
      this.scene.player.x,
      this.scene.player.y,
      50,
      0xffff00,
      0.5
    );
    effect.setDepth(5);
    
    // Animate effect
    this.scene.tweens.add({
      targets: effect,
      alpha: 0,
      scale: 3,
      duration: 500,
      onComplete: () => {
        effect.destroy();
      }
    });
  }

  // Apply random level up bonus
  applyLevelUpBonus() {
    // Select random bonus
    const randomBonus = Phaser.Math.RND.pick(this.levelUpBonuses);
    
    // Apply bonus
    randomBonus.apply();
    
    // Show bonus message
    this.scene.showMessage(`Level Up Bonus: ${randomBonus.name}`, 0x00ff00);
  }

  // Apply health boost bonus
  applyHealthBoost() {
    // Increase max health
    this.scene.playerMaxHealth *= 1.2;
    
    // Heal player
    this.scene.playerHealth = Math.min(
      this.scene.playerHealth + 20,
      this.scene.playerMaxHealth
    );
  }

  // Apply attack boost bonus
  applyAttackBoost() {
    // Increase player attack damage
    this.scene.playerAttackDamage *= 1.15;
  }

  // Apply speed boost bonus
  applySpeedBoost() {
    // Increase player movement speed
    this.scene.playerSpeed *= 1.1;
  }
}

export default ExperienceSystem;

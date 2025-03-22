// Enhanced weapon system for Survivor.io style game
class WeaponSystem {
  constructor(scene) {
    this.scene = scene;
    this.weaponTypes = [
      {
        name: 'Lightchaser',
        key: 'lightchaser',
        damage: 15,
        attackSpeed: 1.2,
        range: 200,
        rarity: 'Epic',
        description: 'A light blade that automatically attacks nearby enemies',
        attackPattern: 'circular'
      },
      {
        name: 'Void Power',
        key: 'void-power',
        damage: 25,
        attackSpeed: 0.8,
        range: 150,
        rarity: 'Legendary',
        description: 'Creates damaging void zones that pull enemies in',
        attackPattern: 'area'
      },
      {
        name: 'Baseball Bat',
        key: 'baseball-bat',
        damage: 20,
        attackSpeed: 1.0,
        range: 100,
        rarity: 'Rare',
        description: 'Knocks back enemies with powerful swings',
        attackPattern: 'melee'
      },
      {
        name: 'Shotgun',
        key: 'shotgun',
        damage: 30,
        attackSpeed: 0.7,
        range: 180,
        rarity: 'Epic',
        description: 'Fires a spread of bullets in front of the player',
        attackPattern: 'spread'
      },
      {
        name: 'Revolver',
        key: 'revolver',
        damage: 18,
        attackSpeed: 1.5,
        range: 250,
        rarity: 'Common',
        description: 'Rapidly fires bullets at the nearest enemy',
        attackPattern: 'single'
      },
      {
        name: 'Starforged Havoc',
        key: 'starforged-havoc',
        damage: 40,
        attackSpeed: 1.0,
        range: 300,
        rarity: 'SS-Grade',
        description: 'Unleashes cosmic energy that damages all enemies on screen',
        attackPattern: 'fullscreen'
      }
    ];
    
    // Rarity colors for visual feedback
    this.rarityColors = {
      'Common': 0xffffff,
      'Rare': 0x00ff00,
      'Epic': 0x800080,
      'Legendary': 0xffa500,
      'SS-Grade': 0xff0000
    };
    
    // Character-specific weapon bonuses
    this.characterBonuses = {
      'Default': { weapon: 'Lightchaser', damageMult: 1.2, speedMult: 1.1 },
      'Tank': { weapon: 'Baseball Bat', damageMult: 1.5, speedMult: 0.9 },
      'Ranger': { weapon: 'Shotgun', damageMult: 1.3, speedMult: 1.0 },
      'Mage': { weapon: 'Void Power', damageMult: 1.4, speedMult: 1.0 },
      'Assassin': { weapon: 'Revolver', damageMult: 1.1, speedMult: 1.3 },
      'Cosmic': { weapon: 'Starforged Havoc', damageMult: 1.6, speedMult: 1.2 }
    };
  }
  
  // Initialize player weapon
  initializeWeapon(weaponName, characterType = 'Default') {
    const weaponType = this.weaponTypes.find(w => w.name === weaponName) || this.weaponTypes[0];
    const weapon = {
      ...weaponType,
      level: 1,
      maxLevel: 5,
      cooldown: 1000 / weaponType.attackSpeed,
      cooldownTimer: 0
    };
    
    // Apply character bonus if weapon matches character's preferred weapon
    const bonus = this.characterBonuses[characterType];
    if (bonus && bonus.weapon === weaponName) {
      weapon.damage *= bonus.damageMult;
      weapon.cooldown /= bonus.speedMult;
    }
    
    return weapon;
  }
  
  // Attack with weapon based on its pattern
  attackWithWeapon(weapon) {
    switch (weapon.attackPattern) {
      case 'circular':
        this.circularAttack(weapon);
        break;
      case 'area':
        this.areaAttack(weapon);
        break;
      case 'melee':
        this.meleeAttack(weapon);
        break;
      case 'spread':
        this.spreadAttack(weapon);
        break;
      case 'single':
        this.singleTargetAttack(weapon);
        break;
      case 'fullscreen':
        this.fullscreenAttack(weapon);
        break;
    }
  }
  
  // Circular attack pattern (Lightchaser)
  circularAttack(weapon) {
    const numProjectiles = 8;
    const angleStep = (Math.PI * 2) / numProjectiles;
    
    for (let i = 0; i < numProjectiles; i++) {
      const angle = i * angleStep;
      const velocityX = Math.cos(angle) * 200;
      const velocityY = Math.sin(angle) * 200;
      
      const projectile = this.scene.physics.add.sprite(
        this.scene.player.x,
        this.scene.player.y,
        'lightchaser-projectile'
      );
      projectile.setScale(0.5);
      projectile.setTint(this.rarityColors[weapon.rarity]);
      projectile.damage = weapon.damage * (1 + (weapon.level - 1) * 0.2);
      projectile.setVelocity(velocityX, velocityY);
      projectile.setDepth(5);
      
      // Add to projectiles group
      this.scene.projectiles.add(projectile);
      
      // Destroy after traveling
      this.scene.time.delayedCall(1000, () => {
        projectile.destroy();
      });
    }
    
    // Play attack sound
    // this.scene.sound.play('lightchaser-sound');
  }
  
  // Area attack pattern (Void Power)
  areaAttack(weapon) {
    // Create void zone at random location near player
    const angle = Math.random() * Math.PI * 2;
    const distance = Phaser.Math.Between(100, weapon.range);
    const x = this.scene.player.x + Math.cos(angle) * distance;
    const y = this.scene.player.y + Math.sin(angle) * distance;
    
    const voidZone = this.scene.physics.add.sprite(x, y, 'void-zone');
    voidZone.setScale(1 + (weapon.level - 1) * 0.2);
    voidZone.setTint(this.rarityColors[weapon.rarity]);
    voidZone.setAlpha(0.7);
    voidZone.damage = weapon.damage * (1 + (weapon.level - 1) * 0.2);
    voidZone.setDepth(3);
    
    // Add to projectiles group
    this.scene.projectiles.add(voidZone);
    
    // Pull nearby enemies toward void zone
    const pullEnemies = () => {
      this.scene.enemies.getChildren().forEach(enemy => {
        const distance = Phaser.Math.Distance.Between(
          voidZone.x, voidZone.y,
          enemy.x, enemy.y
        );
        
        if (distance < 150) {
          const angle = Phaser.Math.Angle.Between(
            enemy.x, enemy.y,
            voidZone.x, voidZone.y
          );
          
          const pullForce = 50 * (1 - distance / 150);
          enemy.x += Math.cos(angle) * pullForce;
          enemy.y += Math.sin(angle) * pullForce;
          
          // Damage enemy if very close
          if (distance < 50) {
            enemy.health -= voidZone.damage / 10; // Continuous damage
            
            // Visual feedback
            enemy.setTint(0x7700aa);
            this.scene.time.delayedCall(100, () => {
              enemy.clearTint();
            });
          }
        }
      });
    };
    
    // Set up interval for pulling enemies
    const pullInterval = this.scene.time.addEvent({
      delay: 100,
      callback: pullEnemies,
      callbackScope: this,
      repeat: 29 // 3 seconds total
    });
    
    // Destroy after duration
    this.scene.time.delayedCall(3000, () => {
      pullInterval.remove();
      voidZone.destroy();
    });
    
    // Play attack sound
    // this.scene.sound.play('void-sound');
  }
  
  // Melee attack pattern (Baseball Bat)
  meleeAttack(weapon) {
    // Get attack direction based on joystick or movement
    let angle = this.scene.player.rotation;
    if (this.scene.joystick && this.scene.joystick.force > 0) {
      angle = this.scene.joystick.rotation;
    }
    
    // Create swing effect
    const swingStart = angle - Math.PI / 4;
    const swingEnd = angle + Math.PI / 4;
    
    const swing = this.scene.add.arc(
      this.scene.player.x,
      this.scene.player.y,
      weapon.range,
      swingStart,
      swingEnd,
      false,
      this.rarityColors[weapon.rarity],
      0.5
    );
    swing.setDepth(6);
    
    // Damage and knockback enemies in swing arc
    this.scene.enemies.getChildren().forEach(enemy => {
      const enemyAngle = Phaser.Math.Angle.Between(
        this.scene.player.x, this.scene.player.y,
        enemy.x, enemy.y
      );
      
      const distance = Phaser.Math.Distance.Between(
        this.scene.player.x, this.scene.player.y,
        enemy.x, enemy.y
      );
      
      // Check if enemy is within swing arc
      const normalizedEnemyAngle = Phaser.Math.Angle.Normalize(enemyAngle);
      const normalizedSwingStart = Phaser.Math.Angle.Normalize(swingStart);
      const normalizedSwingEnd = Phaser.Math.Angle.Normalize(swingEnd);
      
      let inArc = false;
      if (normalizedSwingStart < normalizedSwingEnd) {
        inArc = normalizedEnemyAngle >= normalizedSwingStart && normalizedEnemyAngle <= normalizedSwingEnd;
      } else {
        inArc = normalizedEnemyAngle >= normalizedSwingStart || normalizedEnemyAngle <= normalizedSwingEnd;
      }
      
      if (inArc && distance <= weapon.range) {
        // Damage enemy
        enemy.health -= weapon.damage * (1 + (weapon.level - 1) * 0.2);
        
        // Knockback effect
        const knockbackForce = 200 * (1 + (weapon.level - 1) * 0.1);
        enemy.x += Math.cos(enemyAngle) * knockbackForce;
        enemy.y += Math.sin(enemyAngle) * knockbackForce;
        
        // Visual feedback
        enemy.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
          enemy.clearTint();
        });
      }
    });
    
    // Remove swing effect after short duration
    this.scene.time.delayedCall(200, () => {
      swing.destroy();
    });
    
    // Play attack sound
    // this.scene.sound.play('bat-sound');
  }
  
  // Spread attack pattern (Shotgun)
  spreadAttack(weapon) {
    // Get attack direction based on joystick or movement
    let angle = this.scene.player.rotation;
    if (this.scene.joystick && this.scene.joystick.force > 0) {
      angle = this.scene.joystick.rotation;
    }
    
    // Create multiple projectiles in a spread
    const numProjectiles = 5 + weapon.level;
    const spreadAngle = Math.PI / 6; // 30 degrees
    const angleStep = spreadAngle / (numProjectiles - 1);
    const startAngle = angle - spreadAngle / 2;
    
    for (let i = 0; i < numProjectiles; i++) {
      const projectileAngle = startAngle + i * angleStep;
      const velocityX = Math.cos(projectileAngle) * 300;
      const velocityY = Math.sin(projectileAngle) * 300;
      
      const projectile = this.scene.physics.add.sprite(
        this.scene.player.x,
        this.scene.player.y,
        'shotgun-projectile'
      );
      projectile.setScale(0.3);
      projectile.setTint(this.rarityColors[weapon.rarity]);
      projectile.damage = weapon.damage * (1 + (weapon.level - 1) * 0.2) / numProjectiles;
      projectile.setVelocity(velocityX, velocityY);
      projectile.setDepth(5);
      
      // Add to projectiles group
      this.scene.projectiles.add(projectile);
      
      // Destroy after traveling
      this.scene.time.delayedCall(500, () => {
        projectile.destroy();
      });
    }
    
    // Play attack sound
    // this.scene.sound.play('shotgun-sound');
  }
  
  // Single target attack pattern (Revolver)
  singleTargetAttack(weapon) {
    // Find nearest enemy
    let nearestEnemy = null;
    let nearestDistance = Infinity;
    
    this.scene.enemies.getChildren().forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.scene.player.x, this.scene.player.y,
        enemy.x, enemy.y
      );
      
      if (distance < nearestDistance && distance <= weapon.range) {
        nearestEnemy = enemy;
        nearestDistance = distance;
      }
    });
    
    if (nearestEnemy) {
      // Calculate angle to enemy
      const angle = Phaser.Math.Angle.Between(
        this.scene.player.x, this.scene.player.y,
        nearestEnemy.x, nearestEnemy.y
      );
      
      // Create projectile
      const projectile = this.scene.physics.add.sprite(
        this.scene.player.x,
        this.scene.player.y,
        'revolver-projectile'
      );
      projectile.setScale(0.3);
      projectile.setTint(this.rarityColors[weapon.rarity]);
      projectile.damage = weapon.damage * (1 + (weapon.level - 1) * 0.2);
      
      // Set velocity toward enemy
      const speed = 400;
      projectile.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
      projectile.setDepth(5);
      
      // Add to projectiles group
      this.scene.projectiles.add(projectile);
      
      // Destroy after traveling
      this.scene.time.delayedCall(1000, () => {
        projectile.destroy();
      });
      
      // Play attack sound
      // this.scene.sound.play('revolver-sound');
    }
  }
  
  // Fullscreen attack pattern (Starforged Havoc)
  fullscreenAttack(weapon) {
    // Create cosmic explosion effect
    const explosion = this.scene.add.circle(
      this.scene.player.x,
      this.scene.player.y,
      50,
      this.rarityColors[weapon.rarity],
      0.7
    );
    explosion.setDepth(20);
    
    // Expand explosion
    this.scene.tweens.add({
      targets: explosion,
      radius: 500,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        explosion.destroy();
      }
    });
    
    // Damage all enemies on screen
    this.scene.enemies.getChildren().forEach(enemy => {
      // Damage enemy
      enemy.health -= weapon.damage * (1 + (weapon.level - 1) * 0.2);
      
      // Visual feedback
      enemy.setTint(0xff0000);
      this.scene.time.delayedCall(200, () => {
        enemy.clearTint();
      });
      
      // Push enemy away from player
      const angle = Phaser.Math.Angle.Between(
        this.scene.player.x, this.scene.player.y,
        enemy.x, enemy.y
      );
      
      const pushForce = 100;
      enemy.x += Math.cos(angle) * pushForce;
      enemy.y += Math.sin(angle) * pushForce;
    });
    
    // Play attack sound
    // this.scene.sound.play('cosmic-sound');
  }
  
  // Update weapon cooldowns
  update(delta) {
    if (this.scene.playerWeapon.cooldownTimer > 0) {
      this.scene.playerWeapon.cooldownTimer -= delta;
    }
  }
  
  // Auto attack with current weapon
  autoAttack() {
    if (this.scene.playerWeapon.cooldownTimer <= 0 && !this.scene.gameOver) {
      this.attackWithWeapon(this.scene.playerWeapon);
      this.scene.playerWeapon.cooldownTimer = this.scene.playerWeapon.cooldown;
    }
  }
  
  // Level up weapon
  levelUpWeapon() {
    if (this.scene.playerWeapon.level < this.scene.playerWeapon.maxLevel) {
      this.scene.playerWeapon.level++;
      return true;
    }
    return false;
  }
  
  // Change weapon
  changeWeapon(weaponName, characterType = 'Default') {
    this.scene.playerWeapon = this.initializeWeapon(weaponName, characterType);
    return this.scene.playerWeapon;
  }
}

export default WeaponSystem;

// Wave system for Survivor.io style game
class WaveSystem {
  constructor(scene) {
    this.scene = scene;
    this.waveNumber = 1;
    this.enemiesPerWave = 10;
    this.bossWaveInterval = 5;
    this.waveDuration = 30000; // 30 seconds per wave
    this.waveTimer = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 2000; // 2 seconds between spawns
    this.isWaveActive = false;
    this.enemyTypes = [
      {
        key: 'enemy',
        health: 30,
        speed: 50,
        damage: 5,
        expValue: 10,
        scale: 1
      },
      {
        key: 'boss',
        health: 200,
        speed: 30,
        damage: 15,
        expValue: 50,
        scale: 1.5,
        isBoss: true
      }
    ];
  }

  // Start the wave system
  start() {
    this.isWaveActive = true;
    this.startWave();
    
    // Display wave start message
    this.scene.showWaveMessage(`Wave ${this.waveNumber} Started!`);
  }

  // Update method to be called in scene's update
  update(delta) {
    if (!this.isWaveActive || this.scene.gameOver) return;
    
    // Update wave timer
    this.waveTimer += delta;
    
    // Check if wave is complete
    if (this.waveTimer >= this.waveDuration) {
      this.completeWave();
    }
    
    // Update spawn timer
    this.spawnTimer += delta;
    
    // Spawn enemy if interval reached
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }
  }

  // Start a new wave
  startWave() {
    // Reset wave timer
    this.waveTimer = 0;
    
    // Calculate enemies for this wave
    this.enemiesPerWave = 10 + (this.waveNumber * 3);
    
    // Adjust spawn interval based on wave number
    this.spawnInterval = Math.max(500, 2000 - (this.waveNumber * 100));
    
    // Update enemy stats based on wave number
    this.updateEnemyStats();
    
    // Spawn initial enemies
    for (let i = 0; i < Math.min(5, this.enemiesPerWave); i++) {
      this.spawnEnemy();
    }
    
    // Spawn boss if boss wave
    if (this.waveNumber % this.bossWaveInterval === 0) {
      this.spawnBoss();
    }
    
    // Update wave text
    if (this.scene.waveText) {
      this.scene.waveText.setText(`Wave: ${this.waveNumber}`);
    }
  }

  // Complete current wave and start next
  completeWave() {
    // Increase wave number
    this.waveNumber++;
    
    // Show wave complete message
    this.scene.showWaveMessage(`Wave ${this.waveNumber - 1} Complete!`);
    
    // Start next wave
    this.startWave();
  }

  // Spawn a regular enemy
  spawnEnemy() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
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
    
    // Get enemy type (basic enemy)
    const enemyType = this.enemyTypes[0];
    
    // Create enemy
    const enemy = this.scene.enemies.create(x, y, enemyType.key);
    enemy.health = enemyType.health;
    enemy.speed = enemyType.speed;
    enemy.damage = enemyType.damage;
    enemy.expValue = enemyType.expValue;
    enemy.setDepth(5);
    
    // Move enemy towards player
    this.scene.physics.moveToObject(enemy, this.scene.player, enemy.speed);
    
    // Add update function to enemy
    enemy.update = () => {
      // Update movement to follow player
      if (!this.scene.gameOver) {
        this.scene.physics.moveToObject(enemy, this.scene.player, enemy.speed);
      } else {
        enemy.setVelocity(0);
      }
    };
    
    // Add enemy to update list
    this.scene.updateList.add(enemy);
  }

  // Spawn a boss enemy
  spawnBoss() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
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
    
    // Get enemy type (boss)
    const bossType = this.enemyTypes[1];
    
    // Create boss
    const boss = this.scene.enemies.create(x, y, bossType.key);
    boss.health = bossType.health;
    boss.speed = bossType.speed;
    boss.damage = bossType.damage;
    boss.expValue = bossType.expValue;
    boss.isBoss = true;
    boss.setScale(bossType.scale);
    boss.setDepth(8);
    
    // Show boss warning
    this.scene.showWaveMessage('BOSS INCOMING!', 0xff0000);
    
    // Move boss towards player
    this.scene.physics.moveToObject(boss, this.scene.player, boss.speed);
    
    // Add update function to boss
    boss.update = () => {
      // Update movement to follow player
      if (!this.scene.gameOver) {
        this.scene.physics.moveToObject(boss, this.scene.player, boss.speed);
        
        // Special boss attack every 5 seconds
        if (boss.attackTimer === undefined) {
          boss.attackTimer = 0;
        }
        
        boss.attackTimer += this.scene.game.loop.delta;
        
        if (boss.attackTimer >= 5000) {
          boss.attackTimer = 0;
          this.bossSummonMinions(boss);
        }
      } else {
        boss.setVelocity(0);
      }
    };
    
    // Add boss to update list
    this.scene.updateList.add(boss);
  }

  // Boss special attack - summon minions
  bossSummonMinions(boss) {
    // Create warning effect
    const warningCircle = this.scene.add.circle(boss.x, boss.y, 100, 0xff0000, 0.3);
    
    // Animate warning
    this.scene.tweens.add({
      targets: warningCircle,
      alpha: 0,
      scale: 2,
      duration: 1000,
      onComplete: () => {
        warningCircle.destroy();
        
        // Spawn 4 minions around boss
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          const x = boss.x + Math.cos(angle) * 50;
          const y = boss.y + Math.sin(angle) * 50;
          
          const minion = this.scene.enemies.create(x, y, 'enemy');
          minion.health = this.enemyTypes[0].health * 0.5;
          minion.speed = this.enemyTypes[0].speed * 1.2;
          minion.damage = this.enemyTypes[0].damage * 0.5;
          minion.expValue = this.enemyTypes[0].expValue * 0.5;
          minion.setScale(0.7);
          minion.setDepth(5);
          minion.setTint(0xff9999); // Reddish tint to show they're minions
          
          // Move minion towards player
          this.scene.physics.moveToObject(minion, this.scene.player, minion.speed);
          
          // Add update function to minion
          minion.update = () => {
            // Update movement to follow player
            if (!this.scene.gameOver) {
              this.scene.physics.moveToObject(minion, this.scene.player, minion.speed);
            } else {
              minion.setVelocity(0);
            }
          };
          
          // Add minion to update list
          this.scene.updateList.add(minion);
        }
      }
    });
  }

  // Update enemy stats based on wave number
  updateEnemyStats() {
    // Scale enemy stats with wave number
    this.enemyTypes.forEach(type => {
      type.health = type.health * (1 + this.waveNumber * 0.1);
      type.speed = type.speed * (1 + this.waveNumber * 0.05);
      type.damage = type.damage * (1 + this.waveNumber * 0.1);
      type.expValue = type.expValue * (1 + this.waveNumber * 0.05);
    });
  }
}

export default WaveSystem;

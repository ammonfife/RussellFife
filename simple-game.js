// Simple Survivor.io-style game with core functionality
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
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    // Load assets
    this.load.image('player', 'assets/images/player.png');
    this.load.image('enemy', 'assets/images/enemy.png');
    this.load.image('exp', 'assets/images/exp-orb.png');
    this.load.image('background', 'assets/images/background.png');
}

function create() {
    // Add background
    this.add.image(400, 300, 'background').setScale(2);
    
    // Add player
    this.player = this.physics.add.sprite(400, 300, 'player').setScale(0.5);
    this.player.setCollideWorldBounds(true);
    
    // Add enemies group
    this.enemies = this.physics.add.group();
    
    // Add experience orbs group
    this.expOrbs = this.physics.add.group();
    
    // Set up collisions
    this.physics.add.overlap(this.player, this.enemies, hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.expOrbs, collectExp, null, this);
    
    // Set up controls
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // Game state
    this.score = 0;
    this.health = 100;
    this.level = 1;
    
    // UI
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#fff' });
    this.healthText = this.add.text(16, 50, 'Health: 100', { fontSize: '24px', fill: '#fff' });
    this.levelText = this.add.text(16, 84, 'Level: 1', { fontSize: '24px', fill: '#fff' });
    
    // Spawn enemies every 2 seconds
    this.enemyTimer = this.time.addEvent({
        delay: 2000,
        callback: spawnEnemy,
        callbackScope: this,
        loop: true
    });
}

function update() {
    // Player movement
    this.player.setVelocity(0);
    
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);
    }
    
    if (this.cursors.up.isDown) {
        this.player.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(160);
    }
    
    // Auto-attack nearby enemies
    let closestEnemy = null;
    let closestDistance = 150; // Attack range
    
    this.enemies.getChildren().forEach(enemy => {
        const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            enemy.x, enemy.y
        );
        
        if (distance < closestDistance) {
            closestEnemy = enemy;
            closestDistance = distance;
        }
        
        // Move enemies toward player
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        const speed = 50 + (this.level * 5); // Enemies get faster with level
        
        enemy.setVelocityX(Math.cos(angle) * speed);
        enemy.setVelocityY(Math.sin(angle) * speed);
    });
    
    // Attack closest enemy
    if (closestEnemy) {
        if (!this.lastAttackTime || this.time.now - this.lastAttackTime > 1000) {
            this.lastAttackTime = this.time.now;
            
            // Damage enemy
            closestEnemy.health -= 20;
            
            // Visual feedback
            closestEnemy.setTint(0xff0000);
            this.time.delayedCall(100, () => {
                if (closestEnemy.active) {
                    closestEnemy.clearTint();
                }
            });
            
            // Check if enemy is defeated
            if (closestEnemy.health <= 0) {
                // Spawn experience orb
                const expOrb = this.expOrbs.create(closestEnemy.x, closestEnemy.y, 'exp').setScale(0.3);
                expOrb.value = 10;
                
                // Destroy enemy
                closestEnemy.destroy();
                
                // Update score
                this.score += 10;
                this.scoreText.setText('Score: ' + this.score);
            }
        }
    }
    
    // Move experience orbs toward player when close
    this.expOrbs.getChildren().forEach(orb => {
        const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            orb.x, orb.y
        );
        
        if (distance < 100) {
            const angle = Phaser.Math.Angle.Between(orb.x, orb.y, this.player.x, this.player.y);
            const speed = 100;
            
            orb.setVelocityX(Math.cos(angle) * speed);
            orb.setVelocityY(Math.sin(angle) * speed);
        }
    });
}

function spawnEnemy() {
    // Determine spawn position (outside screen)
    let x, y;
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? -50 : 850;
        y = Phaser.Math.Between(0, 600);
    } else {
        x = Phaser.Math.Between(0, 800);
        y = Math.random() < 0.5 ? -50 : 650;
    }
    
    // Create enemy
    const enemy = this.enemies.create(x, y, 'enemy').setScale(0.4);
    enemy.health = 40 + (this.level * 10); // Enemies get tougher with level
}

function hitEnemy(player, enemy) {
    // Player takes damage
    this.health -= 5;
    this.healthText.setText('Health: ' + this.health);
    
    // Visual feedback
    player.setTint(0xff0000);
    this.time.delayedCall(100, () => {
        player.clearTint();
    });
    
    // Check game over
    if (this.health <= 0) {
        this.physics.pause();
        player.setTint(0xff0000);
        
        const gameOver = this.add.text(400, 300, 'GAME OVER', {
            fontSize: '64px',
            fill: '#fff'
        }).setOrigin(0.5);
        
        // Restart button
        const restartButton = this.add.text(400, 400, 'Restart', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        
        restartButton.on('pointerdown', () => {
            this.scene.restart();
        });
    }
}

function collectExp(player, expOrb) {
    // Collect experience
    this.score += expOrb.value;
    this.scoreText.setText('Score: ' + this.score);
    
    // Check level up
    if (this.score >= this.level * 100) {
        this.level++;
        this.levelText.setText('Level: ' + this.level);
        
        // Visual feedback
        player.setTint(0x00ff00);
        this.time.delayedCall(300, () => {
            player.clearTint();
        });
    }
    
    // Destroy orb
    expOrb.destroy();
}

// Animation system for Survivor.io style game
class AnimationSystem {
  constructor(scene) {
    this.scene = scene;
    this.animations = {};
    this.createAnimations();
  }

  // Create all game animations
  createAnimations() {
    this.createPlayerAnimations();
    this.createEnemyAnimations();
    this.createSkillAnimations();
    this.createUIAnimations();
  }

  // Create player animations
  createPlayerAnimations() {
    // Player idle animation
    this.createPulseAnimation('player-idle', this.scene.player, {
      scale: { from: 1, to: 1.05 },
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    // Player hit animation
    this.animations['player-hit'] = {
      play: () => {
        this.scene.tweens.add({
          targets: this.scene.player,
          alpha: 0.5,
          scale: 0.9,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            this.scene.player.alpha = 1;
            this.scene.player.scale = 1;
          }
        });
      }
    };
    
    // Player movement animation
    this.animations['player-move'] = {
      play: () => {
        // Add slight rotation based on movement direction
        if (this.scene.joystick && this.scene.joystick.force > 0) {
          const angle = this.scene.joystick.rotation;
          this.scene.player.rotation = angle;
        }
      }
    };
  }

  // Create enemy animations
  createEnemyAnimations() {
    // Enemy movement animation - applied to all enemies
    this.animations['enemy-move'] = {
      apply: (enemy) => {
        // Add bobbing animation
        this.createPulseAnimation(`enemy-${enemy.id}-move`, enemy, {
          scale: { from: enemy.scaleX * 0.95, to: enemy.scaleX * 1.05 },
          duration: 800,
          yoyo: true,
          repeat: -1
        });
        
        // Add slight rotation based on movement
        enemy.update = (time, delta) => {
          // Original update function if exists
          if (enemy._originalUpdate) {
            enemy._originalUpdate(time, delta);
          }
          
          // Add wobble effect
          enemy.rotation = Math.sin(time * 0.01) * 0.1;
        };
        
        // Store original update function if exists
        if (enemy.update && !enemy._originalUpdate) {
          enemy._originalUpdate = enemy.update;
        }
      }
    };
    
    // Enemy hit animation
    this.animations['enemy-hit'] = {
      play: (enemy) => {
        this.scene.tweens.add({
          targets: enemy,
          alpha: 0.7,
          scale: enemy.scaleX * 0.9,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            enemy.alpha = 1;
          }
        });
      }
    };
    
    // Boss animation
    this.animations['boss-appear'] = {
      play: (boss) => {
        // Initial scale
        boss.setScale(0.5);
        boss.alpha = 0.7;
        
        // Grow and pulse
        this.scene.tweens.add({
          targets: boss,
          scale: boss.scaleX * 3,
          alpha: 1,
          duration: 1000,
          ease: 'Bounce.Out',
          onComplete: () => {
            // Add continuous pulse
            this.createPulseAnimation(`boss-${boss.id}-pulse`, boss, {
              scale: { from: boss.scaleX * 0.95, to: boss.scaleX * 1.05 },
              duration: 1200,
              yoyo: true,
              repeat: -1
            });
          }
        });
        
        // Add shockwave effect
        const shockwave = this.scene.add.circle(boss.x, boss.y, 10, 0xff0000, 0.7);
        shockwave.setDepth(7);
        
        this.scene.tweens.add({
          targets: shockwave,
          scale: 20,
          alpha: 0,
          duration: 1000,
          onComplete: () => {
            shockwave.destroy();
          }
        });
      }
    };
  }

  // Create skill animations
  createSkillAnimations() {
    // Forcefield animation
    this.animations['forcefield-activate'] = {
      play: (forcefield) => {
        // Initial scale
        forcefield.setScale(0.1);
        forcefield.alpha = 0.9;
        
        // Expand animation
        this.scene.tweens.add({
          targets: forcefield,
          scale: forcefield.scaleX * 10,
          alpha: 0.5,
          duration: 500,
          ease: 'Sine.Out',
          onComplete: () => {
            // Add pulse animation
            this.createPulseAnimation(`forcefield-${forcefield.id}-pulse`, forcefield, {
              alpha: { from: 0.5, to: 0.7 },
              scale: { from: forcefield.scaleX * 0.95, to: forcefield.scaleX * 1.05 },
              duration: 1000,
              yoyo: true,
              repeat: -1
            });
          }
        });
      }
    };
    
    // Laser animation
    this.animations['laser-activate'] = {
      play: (laser) => {
        // Initial width
        laser.setLineWidth(1);
        
        // Expand animation
        this.scene.tweens.add({
          targets: laser,
          lineWidth: 5,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            // Add flicker animation
            this.scene.tweens.add({
              targets: laser,
              alpha: { from: 1, to: 0.7 },
              duration: 50,
              yoyo: true,
              repeat: 3,
              onComplete: () => {
                this.scene.tweens.add({
                  targets: laser,
                  alpha: 0,
                  duration: 200
                });
              }
            });
          }
        });
      }
    };
    
    // Drone animation
    this.animations['drone-activate'] = {
      play: (drone) => {
        // Initial scale
        drone.setScale(0.5);
        drone.alpha = 0.7;
        
        // Appear animation
        this.scene.tweens.add({
          targets: drone,
          scale: 1,
          alpha: 1,
          duration: 300,
          ease: 'Back.Out',
          onComplete: () => {
            // Add hover animation
            this.createPulseAnimation(`drone-${drone.id}-hover`, drone, {
              y: { from: drone.y - 5, to: drone.y + 5 },
              duration: 1000,
              yoyo: true,
              repeat: -1
            });
          }
        });
      }
    };
  }

  // Create UI animations
  createUIAnimations() {
    // Score increase animation
    this.animations['score-increase'] = {
      play: (amount) => {
        const originalScale = this.scene.scoreText.scale;
        
        this.scene.tweens.add({
          targets: this.scene.scoreText,
          scale: originalScale * 1.2,
          duration: 100,
          yoyo: true
        });
        
        // Add floating score text
        if (this.scene.player && amount > 0) {
          const scorePopup = this.scene.add.text(
            this.scene.player.x,
            this.scene.player.y - 30,
            `+${amount}`,
            {
              font: 'bold 16px Arial',
              fill: '#ffff00'
            }
          );
          scorePopup.setOrigin(0.5);
          scorePopup.setDepth(20);
          
          this.scene.tweens.add({
            targets: scorePopup,
            y: scorePopup.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
              scorePopup.destroy();
            }
          });
        }
      }
    };
    
    // Health bar animation
    this.animations['health-change'] = {
      play: (isIncrease) => {
        const color = isIncrease ? 0x00ff00 : 0xff0000;
        const originalColor = this.scene.healthBar.fillColor;
        
        this.scene.tweens.add({
          targets: this.scene.healthBar,
          fillColor: color,
          duration: 200,
          yoyo: true,
          onComplete: () => {
            this.scene.healthBar.fillColor = originalColor;
          }
        });
      }
    };
    
    // Wave text animation
    this.animations['wave-change'] = {
      play: () => {
        const originalScale = this.scene.waveText.scale;
        
        this.scene.tweens.add({
          targets: this.scene.waveText,
          scale: originalScale * 1.5,
          duration: 300,
          ease: 'Back.Out',
          yoyo: true
        });
      }
    };
    
    // Button hover animation
    this.animations['button-hover'] = {
      apply: (button) => {
        button.on('pointerover', () => {
          this.scene.tweens.add({
            targets: button,
            scale: button.scale * 1.1,
            duration: 100
          });
        });
        
        button.on('pointerout', () => {
          this.scene.tweens.add({
            targets: button,
            scale: button.scale / 1.1,
            duration: 100
          });
        });
      }
    };
  }

  // Helper method to create pulse animation
  createPulseAnimation(key, target, config) {
    // Stop existing animation if it exists
    if (this.scene.tweens.getTweensOf(target).length > 0) {
      this.scene.tweens.killTweensOf(target);
    }
    
    // Create new animation
    const tween = this.scene.tweens.add({
      targets: target,
      ...config
    });
    
    // Store animation
    this.animations[key] = {
      tween: tween,
      play: () => {
        if (tween.isPaused()) {
          tween.resume();
        } else if (!tween.isPlaying()) {
          tween.restart();
        }
      },
      stop: () => {
        tween.pause();
      }
    };
    
    return this.animations[key];
  }

  // Play animation by key
  play(key, target) {
    if (this.animations[key]) {
      if (target) {
        this.animations[key].play(target);
      } else {
        this.animations[key].play();
      }
    }
  }

  // Apply animation to target
  apply(key, target) {
    if (this.animations[key] && this.animations[key].apply) {
      this.animations[key].apply(target);
    }
  }

  // Stop animation by key
  stop(key) {
    if (this.animations[key] && this.animations[key].stop) {
      this.animations[key].stop();
    }
  }

  // Update method to be called in scene's update
  update(time, delta) {
    // Update animations that need continuous updates
    if (this.scene.player && this.animations['player-move']) {
      this.animations['player-move'].play();
    }
  }

  // Clean up all animations
  destroy() {
    // Stop all tweens
    Object.keys(this.animations).forEach(key => {
      if (this.animations[key].tween) {
        this.animations[key].tween.stop();
      }
    });
    
    this.animations = {};
  }
}

export default AnimationSystem;

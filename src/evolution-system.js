// Evolution system for Survivor.io style game
class EvolutionSystem {
  constructor(scene) {
    this.scene = scene;
    this.availableEvolutions = [
      {
        name: 'Magnetic Rebounder',
        components: ['Forcefield', 'Drone'],
        description: 'Creates a powerful magnetic field that damages enemies and pulls resources toward the player',
        key: 'magnetic-rebounder',
        damage: 25,
        cooldown: 4000,
        duration: 5000,
        radius: 150
      },
      {
        name: 'Death Ray',
        components: ['Laser', 'Drone'],
        description: 'Fires a devastating beam that pierces through multiple enemies',
        key: 'death-ray',
        damage: 50,
        cooldown: 6000,
        duration: 1000,
        range: 400
      },
      {
        name: 'Quantum Shield',
        components: ['Forcefield', 'Laser'],
        description: 'Creates a protective barrier that reflects enemy attacks',
        key: 'quantum-shield',
        damage: 15,
        cooldown: 8000,
        duration: 6000,
        radius: 120
      }
    ];
  }

  // Check if evolution is possible based on active skills
  checkEvolutionPossible(activeSkills) {
    const possibleEvolutions = [];
    
    this.availableEvolutions.forEach(evolution => {
      // Check if player has all required components at level 3 or higher
      const hasAllComponents = evolution.components.every(componentName => {
        const skill = activeSkills.find(s => s.name === componentName);
        return skill && skill.level >= 3;
      });
      
      if (hasAllComponents) {
        possibleEvolutions.push(evolution);
      }
    });
    
    return possibleEvolutions;
  }

  // Evolve skills into a new evolved skill
  evolveSkills(evolution, activeSkills) {
    // Remove component skills
    const updatedSkills = activeSkills.filter(skill => 
      !evolution.components.includes(skill.name)
    );
    
    // Add evolved skill
    const evolvedSkill = {
      name: evolution.name,
      key: evolution.key,
      level: 1,
      maxLevel: 5,
      damage: evolution.damage,
      cooldown: evolution.cooldown,
      duration: evolution.duration,
      radius: evolution.radius || 0,
      range: evolution.range || 0,
      cooldownTimer: 0,
      isEvolved: true
    };
    
    updatedSkills.push(evolvedSkill);
    
    return updatedSkills;
  }

  // Activate evolved skill
  activateEvolvedSkill(skill) {
    switch (skill.name) {
      case 'Magnetic Rebounder':
        this.activateMagneticRebounder(skill);
        break;
      case 'Death Ray':
        this.activateDeathRay(skill);
        break;
      case 'Quantum Shield':
        this.activateQuantumShield(skill);
        break;
    }
  }

  // Magnetic Rebounder evolved skill
  activateMagneticRebounder(skill) {
    // Create magnetic field effect
    const field = this.scene.skillEffects.create(this.scene.player.x, this.scene.player.y, 'forcefield-skill');
    field.setScale(skill.radius / 24); // Scale to match radius
    field.setAlpha(0.7);
    field.setTint(0x4287f5); // Blue tint
    field.setDepth(9);
    field.damage = skill.damage * (1 + skill.level * 0.2);
    
    // Expand field
    this.scene.tweens.add({
      targets: field,
      scale: field.scale * 1.5,
      alpha: 0.3,
      duration: skill.duration,
      onComplete: () => {
        field.destroy();
      }
    });
    
    // Create magnetic particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * skill.radius;
      
      const x = this.scene.player.x + Math.cos(angle) * distance;
      const y = this.scene.player.y + Math.sin(angle) * distance;
      
      const particle = this.scene.add.circle(x, y, 3, 0x4287f5);
      particle.setAlpha(0.7);
      
      // Orbit particle around player
      this.scene.tweens.add({
        targets: particle,
        x: {
          value: () => {
            return this.scene.player.x + Math.cos(angle + (this.scene.time.now * 0.003)) * distance;
          }
        },
        y: {
          value: () => {
            return this.scene.player.y + Math.sin(angle + (this.scene.time.now * 0.003)) * distance;
          }
        },
        duration: skill.duration,
        ease: 'Linear',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
    
    // Pull all experience orbs toward player
    this.scene.expOrbs.getChildren().forEach(orb => {
      this.scene.tweens.add({
        targets: orb,
        x: this.scene.player.x,
        y: this.scene.player.y,
        duration: 500,
        ease: 'Quad.easeIn',
        onComplete: () => {
          this.scene.collectExp(this.scene.player, orb);
        }
      });
    });
    
    // Damage enemies within radius
    this.scene.enemies.getChildren().forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.scene.player.x, this.scene.player.y,
        enemy.x, enemy.y
      );
      
      if (distance < skill.radius) {
        // Damage enemy
        enemy.health -= field.damage;
        
        // Pull enemy toward player
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.scene.player.x, this.scene.player.y
        );
        
        const pullX = Math.cos(angle) * 100;
        const pullY = Math.sin(angle) * 100;
        
        enemy.setVelocity(pullX, pullY);
        
        // Flash enemy
        this.scene.tweens.add({
          targets: enemy,
          alpha: 0.5,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            // Check if enemy is defeated
            if (enemy.health <= 0) {
              this.scene.defeatEnemy(enemy);
            }
          }
        });
      }
    });
  }

  // Death Ray evolved skill
  activateDeathRay(skill) {
    // Get angle based on player rotation or joystick direction
    let angle = this.scene.player.rotation;
    if (this.scene.joystick && this.scene.joystick.force > 0) {
      angle = this.scene.joystick.rotation;
    }
    
    // Calculate ray endpoints
    const startX = this.scene.player.x;
    const startY = this.scene.player.y;
    const endX = startX + Math.cos(angle) * skill.range;
    const endY = startY + Math.sin(angle) * skill.range;
    
    // Create ray effect
    const ray = this.scene.add.line(
      0, 0,
      startX, startY,
      endX, endY,
      0xff0000
    );
    ray.setLineWidth(10);
    ray.setOrigin(0);
    ray.setDepth(15);
    
    // Add glow effect
    const rayGlow = this.scene.add.line(
      0, 0,
      startX, startY,
      endX, endY,
      0xff9999
    );
    rayGlow.setLineWidth(20);
    rayGlow.setOrigin(0);
    rayGlow.setAlpha(0.5);
    rayGlow.setDepth(14);
    
    // Create impact effect at end
    const impact = this.scene.add.circle(endX, endY, 30, 0xff0000, 0.7);
    impact.setDepth(15);
    
    // Animate ray
    this.scene.tweens.add({
      targets: [ray, rayGlow],
      alpha: 0,
      duration: skill.duration,
      onComplete: () => {
        ray.destroy();
        rayGlow.destroy();
        impact.destroy();
      }
    });
    
    // Find enemies in ray path
    this.scene.enemies.getChildren().forEach(enemy => {
      // Check if enemy is in ray path using line-circle intersection
      const distToLine = Phaser.Math.Distance.PointToLine(
        { x: enemy.x, y: enemy.y },
        { x: startX, y: startY },
        { x: endX, y: endY }
      );
      
      if (distToLine < enemy.width / 2) {
        // Damage enemy
        enemy.health -= skill.damage * (1 + skill.level * 0.2);
        
        // Create hit effect
        const hit = this.scene.add.circle(enemy.x, enemy.y, 20, 0xff0000, 0.7);
        hit.setDepth(15);
        
        // Animate hit effect
        this.scene.tweens.add({
          targets: hit,
          alpha: 0,
          scale: 2,
          duration: 300,
          onComplete: () => {
            hit.destroy();
          }
        });
        
        // Flash enemy
        this.scene.tweens.add({
          targets: enemy,
          alpha: 0.5,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            // Check if enemy is defeated
            if (enemy.health <= 0) {
              this.scene.defeatEnemy(enemy);
            }
          }
        });
      }
    });
  }

  // Quantum Shield evolved skill
  activateQuantumShield(skill) {
    // Create shield effect
    const shield = this.scene.skillEffects.create(this.scene.player.x, this.scene.player.y, 'forcefield-skill');
    shield.setScale(skill.radius / 24); // Scale to match radius
    shield.setAlpha(0.7);
    shield.setTint(0x9c27b0); // Purple tint
    shield.setDepth(9);
    shield.damage = skill.damage * (1 + skill.level * 0.2);
    shield.reflectDamage = skill.damage * 2 * (1 + skill.level * 0.2);
    
    // Make shield follow player
    shield.update = () => {
      shield.x = this.scene.player.x;
      shield.y = this.scene.player.y;
    };
    
    // Add shield to update list
    this.scene.updateList.add(shield);
    
    // Create shield particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      
      const particle = this.scene.add.circle(
        this.scene.player.x + Math.cos(angle) * skill.radius,
        this.scene.player.y + Math.sin(angle) * skill.radius,
        5, 0x9c27b0
      );
      particle.setAlpha(0.7);
      particle.setDepth(9);
      
      // Orbit particle around player
      particle.update = () => {
        const currentAngle = angle + (this.scene.time.now * 0.002);
        particle.x = this.scene.player.x + Math.cos(currentAngle) * skill.radius;
        particle.y = this.scene.player.y + Math.sin(currentAngle) * skill.radius;
      };
      
      // Add particle to update list
      this.scene.updateList.add(particle);
      
      // Remove particle after duration
      this.scene.time.delayedCall(skill.duration, () => {
        this.scene.updateList.remove(particle);
        particle.destroy();
      });
    }
    
    // Make player immune to damage
    this.scene.player.isImmune = true;
    
    // Create shield collision handler
    const shieldCollider = this.scene.physics.add.overlap(shield, this.scene.enemies, (shield, enemy) => {
      // Reflect damage back to enemy
      enemy.health -= shield.reflectDamage;
      
      // Create reflection effect
      const angle = Phaser.Math.Angle.Between(
        this.scene.player.x, this.scene.player.y,
        enemy.x, enemy.y
      );
      
      const reflectX = enemy.x + Math.cos(angle) * 50;
      const reflectY = enemy.y + Math.sin(angle) * 50;
      
      const reflection = this.scene.add.line(
        0, 0,
        enemy.x, enemy.y,
        reflectX, reflectY,
        0x9c27b0
      );
      reflection.setLineWidth(3);
      reflection.setOrigin(0);
      reflection.setDepth(15);
      
      // Animate reflection
      this.scene.tweens.add({
        targets: reflection,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          reflection.destroy();
        }
      });
      
      // Push enemy away
      enemy.setVelocity(
        Math.cos(angle) * 300,
        Math.sin(angle) * 300
      );
      
      // Flash enemy
      this.scene.tweens.add({
        targets: enemy,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // Check if enemy is defeated
          if (enemy.health <= 0) {
            this.scene.defeatEnemy(enemy);
          }
        }
      });
    });
    
    // Remove shield after duration
    this.scene.time.delayedCall(skill.duration, () => {
      this.scene.updateList.remove(shield);
      shield.destroy();
      this.scene.player.isImmune = false;
      shieldCollider.destroy();
    });
  }
}

export default EvolutionSystem;

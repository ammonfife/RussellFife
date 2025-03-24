// Enhanced evolution system for Survivor.io style game
class EnhancedEvolutionSystem {
  constructor(scene) {
    this.scene = scene;
    
    // Define active and passive skills
    this.activeSkills = [
      {
        name: 'Forcefield',
        key: 'forcefield-skill',
        type: 'active',
        description: 'Creates a protective barrier around the player',
        baseStats: {
          damage: 10,
          cooldown: 5000,
          duration: 3000,
          radius: 100
        }
      },
      {
        name: 'Laser',
        key: 'laser-skill',
        type: 'active',
        description: 'Fires a powerful laser beam',
        baseStats: {
          damage: 20,
          cooldown: 3000,
          duration: 500,
          range: 300
        }
      },
      {
        name: 'Drone',
        key: 'drone-skill',
        type: 'active',
        description: 'Deploys a drone that attacks nearby enemies',
        baseStats: {
          damage: 5,
          cooldown: 1000,
          duration: 10000,
          speed: 150
        }
      },
      {
        name: 'Boomerang',
        key: 'boomerang-skill',
        type: 'active',
        description: 'Throws a boomerang that returns to the player',
        baseStats: {
          damage: 15,
          cooldown: 2000,
          duration: 2000,
          range: 250
        }
      },
      {
        name: 'Brick',
        key: 'brick-skill',
        type: 'active',
        description: 'Drops heavy bricks on enemies',
        baseStats: {
          damage: 25,
          cooldown: 4000,
          duration: 1000,
          radius: 80
        }
      },
      {
        name: 'RPG',
        key: 'rpg-skill',
        type: 'active',
        description: 'Fires a rocket that explodes on impact',
        baseStats: {
          damage: 30,
          cooldown: 5000,
          duration: 500,
          radius: 120
        }
      },
      {
        name: 'Modular Mine',
        key: 'mine-skill',
        type: 'active',
        description: 'Places mines that explode when enemies are near',
        baseStats: {
          damage: 20,
          cooldown: 3000,
          duration: 8000,
          radius: 100
        }
      },
      {
        name: 'Drill Shot',
        key: 'drill-skill',
        type: 'active',
        description: 'Fires a drill that pierces through enemies',
        baseStats: {
          damage: 15,
          cooldown: 2500,
          duration: 1500,
          range: 280
        }
      },
      {
        name: 'Guardian',
        key: 'guardian-skill',
        type: 'active',
        description: 'Summons guardians that orbit the player',
        baseStats: {
          damage: 8,
          cooldown: 2000,
          duration: 6000,
          radius: 120
        }
      },
      {
        name: 'Soccer Ball',
        key: 'soccer-skill',
        type: 'active',
        description: 'Kicks a ball that bounces between enemies',
        baseStats: {
          damage: 12,
          cooldown: 2200,
          duration: 4000,
          speed: 200
        }
      }
    ];
    
    this.passiveSkills = [
      {
        name: 'Hi-Power Magnet',
        key: 'magnet-passive',
        type: 'passive',
        description: 'Increases pickup range for items',
        effect: {
          type: 'range',
          value: 1.5
        }
      },
      {
        name: 'Fitness Guide',
        key: 'fitness-passive',
        type: 'passive',
        description: 'Increases player health',
        effect: {
          type: 'health',
          value: 1.3
        }
      },
      {
        name: 'Energy Drink',
        key: 'energy-passive',
        type: 'passive',
        description: 'Increases player movement speed',
        effect: {
          type: 'speed',
          value: 1.2
        }
      },
      {
        name: 'HE Fuel',
        key: 'fuel-passive',
        type: 'passive',
        description: 'Increases explosion damage and radius',
        effect: {
          type: 'explosion',
          value: 1.4
        }
      },
      {
        name: 'Energy Cube',
        key: 'cube-passive',
        type: 'passive',
        description: 'Reduces skill cooldowns',
        effect: {
          type: 'cooldown',
          value: 0.8
        }
      },
      {
        name: 'Ammo Thruster',
        key: 'ammo-passive',
        type: 'passive',
        description: 'Increases projectile speed',
        effect: {
          type: 'projectile',
          value: 1.3
        }
      },
      {
        name: 'Type B Drone',
        key: 'drone-b-passive',
        type: 'passive',
        description: 'Enhances drone capabilities',
        effect: {
          type: 'drone',
          value: 1.5
        }
      },
      {
        name: 'Exo-Bracer',
        key: 'bracer-passive',
        type: 'passive',
        description: 'Increases attack damage',
        effect: {
          type: 'damage',
          value: 1.25
        }
      },
      {
        name: 'Sports Shoes',
        key: 'shoes-passive',
        type: 'passive',
        description: 'Increases dodge chance',
        effect: {
          type: 'dodge',
          value: 0.15
        }
      },
      {
        name: 'Lightning Emitter',
        key: 'lightning-passive',
        type: 'passive',
        description: 'Adds lightning damage to attacks',
        effect: {
          type: 'lightning',
          value: 10
        }
      },
      {
        name: 'Molotov',
        key: 'molotov-passive',
        type: 'passive',
        description: 'Adds fire damage over time',
        effect: {
          type: 'fire',
          value: 5
        }
      },
      {
        name: 'Oil Bond',
        key: 'oil-passive',
        type: 'passive',
        description: 'Increases fire damage and duration',
        effect: {
          type: 'fire_duration',
          value: 1.5
        }
      },
      {
        name: 'Ronin Oyoroi',
        key: 'ronin-passive',
        type: 'passive',
        description: 'Increases melee damage',
        effect: {
          type: 'melee',
          value: 1.4
        }
      },
      {
        name: 'Koga Ninja Scroll',
        key: 'ninja-passive',
        type: 'passive',
        description: 'Increases critical hit chance',
        effect: {
          type: 'critical',
          value: 0.2
        }
      },
      {
        name: 'Hi-Power Bullet',
        key: 'bullet-passive',
        type: 'passive',
        description: 'Increases bullet damage',
        effect: {
          type: 'bullet',
          value: 1.3
        }
      }
    ];
    
    // Define evolution combinations
    this.evolutionCombinations = [
      {
        name: 'Magnetic Rebounder',
        components: {
          active: 'Boomerang',
          passive: 'Hi-Power Magnet'
        },
        description: 'Launches two boomerangs that swiftly circle the player, hitting opponents and pulling resources',
        key: 'magnetic-rebounder',
        stats: {
          damage: 25,
          cooldown: 4000,
          duration: 5000,
          radius: 150
        }
      },
      {
        name: '1-Ton Iron',
        components: {
          active: 'Brick',
          passive: 'Fitness Guide'
        },
        description: 'Tosses eight dumbbells in a wide circle away from the player',
        key: '1-ton-iron',
        stats: {
          damage: 35,
          cooldown: 5000,
          duration: 3000,
          radius: 180
        }
      },
      {
        name: 'Pressure Forcefield',
        components: {
          active: 'Forcefield',
          passive: 'Energy Drink'
        },
        description: 'Surrounds the player with a forcefield that pushes back and damages enemies',
        key: 'pressure-forcefield',
        stats: {
          damage: 15,
          cooldown: 6000,
          duration: 4000,
          radius: 130
        }
      },
      {
        name: 'Caltrops',
        components: {
          active: 'Guardian',
          passive: 'HE Fuel'
        },
        description: 'Hurls a massive ball filled with spikes that ricochets across the screen',
        key: 'caltrops',
        stats: {
          damage: 20,
          cooldown: 7000,
          duration: 8000,
          radius: 200
        }
      },
      {
        name: 'Death Ray',
        components: {
          active: 'Laser',
          passive: 'Energy Cube'
        },
        description: 'Releases a barrage of lasers from the screen edges that spiral toward the player',
        key: 'death-ray',
        stats: {
          damage: 50,
          cooldown: 6000,
          duration: 1000,
          range: 400
        }
      },
      {
        name: 'Sharkmaw Gun',
        components: {
          active: 'RPG',
          passive: 'HE Fuel'
        },
        description: 'Launches a massive missile at adversaries, dealing massive damage',
        key: 'sharkmaw-gun',
        stats: {
          damage: 60,
          cooldown: 8000,
          duration: 2000,
          radius: 150
        }
      },
      {
        name: 'Thunderbolt Bomb',
        components: {
          active: 'Modular Mine',
          passive: 'Lightning Emitter'
        },
        description: 'Plants proximity mines that shoot out bolts of electricity',
        key: 'thunderbolt-bomb',
        stats: {
          damage: 30,
          cooldown: 5000,
          duration: 6000,
          radius: 140
        }
      },
      {
        name: 'Inferno Bomb',
        components: {
          active: 'Modular Mine',
          passive: 'Molotov'
        },
        description: 'Conjures proximity mines that explode and leave behind fire puddles',
        key: 'inferno-bomb',
        stats: {
          damage: 25,
          cooldown: 5500,
          duration: 7000,
          radius: 130
        }
      },
      {
        name: 'Whistling Arrow',
        components: {
          active: 'Drill Shot',
          passive: 'Ammo Thruster'
        },
        description: 'Summons a perpetual arrow that hurts adversaries and flies across the battlefield',
        key: 'whistling-arrow',
        stats: {
          damage: 20,
          cooldown: 3000,
          duration: 10000,
          speed: 300
        }
      },
      {
        name: 'Destroyer',
        components: {
          active: 'Drone',
          passive: 'Type B Drone'
        },
        description: 'Summons a persistent drone equipped with destructive homing missiles',
        key: 'destroyer',
        stats: {
          damage: 40,
          cooldown: 10000,
          duration: 15000,
          speed: 180
        }
      },
      {
        name: 'Defender',
        components: {
          active: 'Guardian',
          passive: 'Exo-Bracer'
        },
        description: 'Summons six enormous spinning tops that revolve around the player',
        key: 'defender',
        stats: {
          damage: 15,
          cooldown: 4000,
          duration: 8000,
          radius: 140
        }
      },
      {
        name: 'Quantum Ball',
        components: {
          active: 'Soccer Ball',
          passive: 'Sports Shoes'
        },
        description: 'Hurls soccer balls that move quickly and inflict significant damage',
        key: 'quantum-ball',
        stats: {
          damage: 25,
          cooldown: 3500,
          duration: 5000,
          speed: 250
        }
      },
      {
        name: 'Supercell',
        components: {
          active: 'Laser',
          passive: 'Lightning Emitter'
        },
        description: 'Unleashes devastating lightning bolts that hit random adversaries',
        key: 'supercell',
        stats: {
          damage: 45,
          cooldown: 7000,
          duration: 3000,
          radius: 300
        }
      },
      {
        name: 'Fuel Barrel',
        components: {
          active: 'RPG',
          passive: 'Oil Bond'
        },
        description: 'Launches fuel barrels that shatter and release massive blue flames',
        key: 'fuel-barrel',
        stats: {
          damage: 30,
          cooldown: 6000,
          duration: 8000,
          radius: 160
        }
      },
      {
        name: 'Quantum Shield',
        components: {
          active: 'Forcefield',
          passive: 'Energy Cube'
        },
        description: 'Creates a protective barrier that reflects enemy attacks',
        key: 'quantum-shield',
        stats: {
          damage: 15,
          cooldown: 8000,
          duration: 6000,
          radius: 120
        }
      }
    ];
  }
  
  // Get all available active skills
  getActiveSkills() {
    return this.activeSkills;
  }
  
  // Get all available passive skills
  getPassiveSkills() {
    return this.passiveSkills;
  }
  
  // Get all evolution combinations
  getEvolutionCombinations() {
    return this.evolutionCombinations;
  }
  
  // Check if evolution is possible based on player's active and passive skills
  checkEvolutionPossible(playerSkills) {
    const possibleEvolutions = [];
    
    // Extract skill names from player skills
    const activeSkillNames = playerSkills.filter(skill => skill.type === 'active').map(skill => skill.name);
    const passiveSkillNames = playerSkills.filter(skill => skill.type === 'passive').map(skill => skill.name);
    
    // Check each evolution combination
    this.evolutionCombinations.forEach(evolution => {
      if (
        activeSkillNames.includes(evolution.components.active) &&
        passiveSkillNames.includes(evolution.components.passive)
      ) {
        // Check if both skills are at level 3 or higher
        const activeSkill = playerSkills.find(skill => 
          skill.name === evolution.components.active && skill.level >= 3
        );
        
        const passiveSkill = playerSkills.find(skill => 
          skill.name === evolution.components.passive && skill.level >= 3
        );
        
        if (activeSkill && passiveSkill) {
          possibleEvolutions.push({
            evolution,
            activeSkill,
            passiveSkill
          });
        }
      }
    });
    
    return possibleEvolutions;
  }
  
  // Evolve skills into a new evolved skill
  evolveSkills(evolution, playerSkills) {
    // Find the component skills
    const activeSkill = playerSkills.find(skill => 
      skill.name === evolution.components.active
    );
    
    const passiveSkill = playerSkills.find(skill => 
      skill.name === evolution.components.passive
    );
    
    if (!activeSkill || !passiveSkill) {
      console.error('Cannot evolve: missing component skills');
      return playerSkills;
    }
    
    // Remove component skills from player skills
    const updatedSkills = playerSkills.filter(skill => 
      skill.name !== evolution.components.active && 
      skill.name !== evolution.components.passive
    );
    
    // Calculate evolved skill level based on component skills
    const evolvedLevel = Math.floor((activeSkill.level + passiveSkill.level) / 2);
    
    // Create evolved skill
    const evolvedSkill = {
      name: evolution.name,
      key: evolution.key,
      type: 'evolved',
      description: evolution.description,
      level: evolvedLevel,
      maxLevel: 5,
      damage: evolution.stats.damage * (1 + (evolvedLevel - 1) * 0.2),
      cooldown: evolution.stats.cooldown * (1 - (evolvedLevel - 1) * 0.05),
      duration: evolution.stats.duration * (1 + (evolvedLevel - 1) * 0.1),
      radius: evolution.stats.radius * (1 + (evolvedLevel - 1) * 0.1),
      range: evolution.stats.range * (1 + (evolvedLevel - 1) * 0.1),
      speed: evolution.stats.speed * (1 + (evolvedLevel - 1) * 0.1),
      cooldownTimer: 0,
      components: {
        active: activeSkill,
        passive: passiveSkill
      },
      isEvolved: true
    };
    
    // Add evolved skill to player skills
    updatedSkills.push(evolvedSkill);
    
    // Show evolution notification
    this.showEvolutionNotification(evolvedSkill);
    
    return updatedSkills;
  }
  
  // Show evolution notification
  showEvolutionNotification(evolvedSkill) {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Background overlay
    const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0);
    overlay.setDepth(100);
    
    // Evolution title
    const title = this.scene.add.text(width / 2, height / 3, 'EVOLUTION!', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    });
    title.setOrigin(0.5);
    title.setDepth(101);
    
    // Skill name
    const skillName = this.scene.add.text(width / 2, height / 2, evolvedSkill.name, {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4
    });
    skillName.setOrigin(0.5);
    skillName.setDepth(101);
    
    // Skill description
    const description = this.scene.add.text(width / 2, height / 2 + 50, evolvedSkill.description, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
      wordWrap: { width: width * 0.8 }
    });
    description.setOrigin(0.5, 0);
    description.setDepth(101);
    
    // Skill icon
    const icon = this.scene.add.sprite(width / 2, height / 3 + 80, evolvedSkill.key);
    icon.setScale(2);
    icon.setDepth(101);
    
    // Add glow effect to icon
    const glow = this.scene.add.sprite(width / 2, height / 3 + 80, evolvedSkill.key);
    glow.setScale(2.5);
    glow.setAlpha(0.5);
    glow.setTint(0xffff00);
    glow.setDepth(100);
    
    // Animate glow
    this.scene.tweens.add({
      targets: glow,
      scale: 3,
      alpha: 0.2,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    // Continue button
    const continueButton = this.scene.add.rectangle(width / 2, height * 0.8, 200, 60, 0x00aa00);
    continueButton.setDepth(101);
    continueButton.setInteractive();
    
    const continueText = this.scene.add.text(width / 2, height * 0.8, 'CONTINUE', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });
    continueText.setOrigin(0.5);
    continueText.setDepth(102);
    
    // Button hover effects
    continueButton.on('pointerover', () => {
      continueButton.setFillStyle(0x00cc00);
    });
    
    continueButton.on('pointerout', () => {
      continueButton.setFillStyle(0x00aa00);
    });
    
    // Button click handler
    continueButton.on('pointerdown', () => {
      // Remove all notification elements
      overlay.destroy();
      title.destroy();
      skillName.destroy();
      description.destroy();
      icon.destroy();
      glow.destroy();
      continueButton.destroy();
      continueText.destroy();
      
      // Resume game if paused
      if (this.scene.physics.world.isPaused) {
        this.scene.physics.resume();
      }
    });
    
    // Pause game during notification
    this.scene.physics.pause();
    
    // Play evolution sound
    // this.scene.sound.play('evolution-sound');
  }
  
  // Show evolution selection UI when multiple evolutions are possible
  showEvolutionSelectionUI(possibleEvolutions, playerSkills, callback) {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Background overlay
    const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    overlay.setOrigin(0);
    overlay.setDepth(100);
    
    // Title
    const title = this.scene.add.text(width / 2, 50, 'CHOOSE EVOLUTION', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);
    title.setDepth(101);
    
    // Evolution cards
    const cards = [];
    const cardWidth = 300;
    const cardHeight = 400;
    const padding = 20;
    const startX = (width - (possibleEvolutions.length * (cardWidth + padding) - padding)) / 2;
    const startY = 120;
    
    possibleEvolutions.forEach((evolutionData, index) => {
      const evolution = evolutionData.evolution;
      const x = startX + index * (cardWidth + padding);
      
      // Card background
      const card = this.scene.add.rectangle(x, startY, cardWidth, cardHeight, 0x333333);
      card.setOrigin(0);
      card.setDepth(101);
      card.setInteractive();
      
      // Evolution name
      const nameText = this.scene.add.text(x + cardWidth / 2, startY + 20, evolution.name, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 3
      });
      nameText.setOrigin(0.5, 0);
      nameText.setDepth(102);
      
      // Evolution icon
      const icon = this.scene.add.sprite(x + cardWidth / 2, startY + 100, evolution.key);
      icon.setScale(1.5);
      icon.setDepth(102);
      
      // Component skills
      const componentsText = this.scene.add.text(x + 20, startY + 170, 
        `Components:\n- ${evolution.components.active} (Lv.${evolutionData.activeSkill.level})\n- ${evolution.components.passive} (Lv.${evolutionData.passiveSkill.level})`, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff'
      });
      componentsText.setDepth(102);
      
      // Evolution stats
      const statsText = this.scene.add.text(x + 20, startY + 250, 
        `Damage: ${evolution.stats.damage}\nCooldown: ${(evolution.stats.cooldown / 1000).toFixed(1)}s\nDuration: ${(evolution.stats.duration / 1000).toFixed(1)}s`, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff'
      });
      statsText.setDepth(102);
      
      // Evolution description
      const descText = this.scene.add.text(x + cardWidth / 2, startY + 330, evolution.description, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: cardWidth - 40 }
      });
      descText.setOrigin(0.5, 0);
      descText.setDepth(102);
      
      // Hover effects
      card.on('pointerover', () => {
        card.setFillStyle(0x555555);
      });
      
      card.on('pointerout', () => {
        card.setFillStyle(0x333333);
      });
      
      // Click handler
      card.on('pointerdown', () => {
        // Evolve the selected skills
        const updatedSkills = this.evolveSkills(evolution, playerSkills);
        
        // Remove all UI elements
        cards.forEach(elements => {
          elements.forEach(element => {
            element.destroy();
          });
        });
        
        title.destroy();
        overlay.destroy();
        
        // Call callback with updated skills
        if (callback) {
          callback(updatedSkills);
        }
      });
      
      // Add all elements to array for later cleanup
      cards.push([card, nameText, icon, componentsText, statsText, descText]);
    });
    
    // Skip button
    const skipButton = this.scene.add.rectangle(width / 2, height - 50, 200, 50, 0xaa0000);
    skipButton.setDepth(101);
    skipButton.setInteractive();
    
    const skipText = this.scene.add.text(width / 2, height - 50, 'SKIP', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });
    skipText.setOrigin(0.5);
    skipText.setDepth(102);
    
    // Skip button hover effects
    skipButton.on('pointerover', () => {
      skipButton.setFillStyle(0xcc0000);
    });
    
    skipButton.on('pointerout', () => {
      skipButton.setFillStyle(0xaa0000);
    });
    
    // Skip button click handler
    skipButton.on('pointerdown', () => {
      // Remove all UI elements
      cards.forEach(elements => {
        elements.forEach(element => {
          element.destroy();
        });
      });
      
      title.destroy();
      overlay.destroy();
      skipButton.destroy();
      skipText.destroy();
      
      // Call callback with unchanged skills
      if (callback) {
        callback(playerSkills);
      }
    });
    
    // Pause game during selection
    this.scene.physics.pause();
  }
  
  // Activate evolved skill
  activateEvolvedSkill(evolvedSkill) {
    // Get the activation method based on skill name
    const methodName = `activate${evolvedSkill.name.replace(/\s+/g, '')}`;
    
    // Check if method exists
    if (typeof this[methodName] === 'function') {
      this[methodName](evolvedSkill);
    } else {
      console.warn(`No activation method found for ${evolvedSkill.name}`);
    }
  }
  
  // Activation methods for each evolved skill
  
  // Magnetic Rebounder
  activateMagneticRebounder(skill) {
    // Create magnetic field effect
    const field = this.scene.skillEffects.create(this.scene.player.x, this.scene.player.y, 'forcefield-skill');
    field.setScale(skill.radius / 24); // Scale to match radius
    field.setAlpha(0.7);
    field.setTint(0x4287f5); // Blue tint
    field.setDepth(9);
    field.damage = skill.damage;
    
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
  
  // Death Ray
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
        enemy.health -= skill.damage;
        
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
  
  // Quantum Shield
  activateQuantumShield(skill) {
    // Create shield effect
    const shield = this.scene.skillEffects.create(this.scene.player.x, this.scene.player.y, 'forcefield-skill');
    shield.setScale(skill.radius / 24); // Scale to match radius
    shield.setAlpha(0.7);
    shield.setTint(0x9c27b0); // Purple tint
    shield.setDepth(9);
    shield.damage = skill.damage;
    shield.reflectDamage = skill.damage * 2;
    
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
        this.scene.updateList.delete(particle);
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
      this.scene.updateList.delete(shield);
      shield.destroy();
      this.scene.player.isImmune = false;
      shieldCollider.destroy();
    });
  }
  
  // 1-Ton Iron
  activate1TonIron(skill) {
    const numDumbbells = 8;
    const angleStep = (Math.PI * 2) / numDumbbells;
    
    for (let i = 0; i < numDumbbells; i++) {
      const angle = i * angleStep;
      
      // Create dumbbell
      const dumbbell = this.scene.skillEffects.create(
        this.scene.player.x,
        this.scene.player.y,
        'brick-skill'
      );
      dumbbell.setScale(1.2);
      dumbbell.setDepth(8);
      dumbbell.damage = skill.damage;
      
      // Launch dumbbell outward
      const velocityX = Math.cos(angle) * 300;
      const velocityY = Math.sin(angle) * 300;
      dumbbell.setVelocity(velocityX, velocityY);
      
      // Add rotation
      dumbbell.setAngularVelocity(300);
      
      // Add to physics group
      this.scene.physics.add.overlap(dumbbell, this.scene.enemies, (dumbbell, enemy) => {
        // Damage enemy
        enemy.health -= dumbbell.damage;
        
        // Knockback effect
        const knockbackForce = 150;
        const knockbackAngle = Phaser.Math.Angle.Between(
          this.scene.player.x, this.scene.player.y,
          enemy.x, enemy.y
        );
        
        enemy.x += Math.cos(knockbackAngle) * knockbackForce;
        enemy.y += Math.sin(knockbackAngle) * knockbackForce;
        
        // Visual feedback
        enemy.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
          enemy.clearTint();
        });
        
        // Check if enemy is defeated
        if (enemy.health <= 0) {
          this.scene.defeatEnemy(enemy);
        }
      });
      
      // Destroy after duration
      this.scene.time.delayedCall(skill.duration, () => {
        dumbbell.destroy();
      });
    }
  }
  
  // Pressure Forcefield
  activatePressureForceField(skill) {
    // Create forcefield
    const forcefield = this.scene.skillEffects.create(
      this.scene.player.x,
      this.scene.player.y,
      'forcefield-skill'
    );
    forcefield.setScale(0.1);
    forcefield.setAlpha(0.8);
    forcefield.setTint(0x00ffff);
    forcefield.setDepth(9);
    forcefield.damage = skill.damage;
    
    // Make forcefield follow player
    forcefield.update = () => {
      forcefield.x = this.scene.player.x;
      forcefield.y = this.scene.player.y;
    };
    
    // Add to update list
    this.scene.updateList.add(forcefield);
    
    // Expand forcefield
    this.scene.tweens.add({
      targets: forcefield,
      scale: skill.radius / 24,
      duration: 500,
      ease: 'Cubic.easeOut'
    });
    
    // Create pulse effect
    const pulseInterval = this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        // Create pulse wave
        const pulse = this.scene.add.circle(
          this.scene.player.x,
          this.scene.player.y,
          skill.radius,
          0x00ffff,
          0.3
        );
        pulse.setDepth(8);
        
        // Expand and fade pulse
        this.scene.tweens.add({
          targets: pulse,
          scale: 1.5,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            pulse.destroy();
          }
        });
        
        // Push back and damage enemies
        this.scene.enemies.getChildren().forEach(enemy => {
          const distance = Phaser.Math.Distance.Between(
            this.scene.player.x, this.scene.player.y,
            enemy.x, enemy.y
          );
          
          if (distance < skill.radius * 1.2) {
            // Damage enemy
            enemy.health -= forcefield.damage;
            
            // Push enemy away
            const angle = Phaser.Math.Angle.Between(
              this.scene.player.x, this.scene.player.y,
              enemy.x, enemy.y
            );
            
            const pushForce = 200;
            enemy.x += Math.cos(angle) * pushForce;
            enemy.y += Math.sin(angle) * pushForce;
            
            // Visual feedback
            enemy.setTint(0x00ffff);
            this.scene.time.delayedCall(100, () => {
              enemy.clearTint();
            });
            
            // Check if enemy is defeated
            if (enemy.health <= 0) {
              this.scene.defeatEnemy(enemy);
            }
          }
        });
      },
      callbackScope: this,
      repeat: Math.floor(skill.duration / 1000) - 1
    });
    
    // Remove forcefield after duration
    this.scene.time.delayedCall(skill.duration, () => {
      this.scene.updateList.delete(forcefield);
      forcefield.destroy();
      pulseInterval.remove();
    });
  }
  
  // Add more activation methods for other evolved skills...
}

export default EnhancedEvolutionSystem;

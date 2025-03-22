// Enhanced item drop system for Survivor.io style game
class ItemDropSystem {
  constructor(scene) {
    this.scene = scene;
    
    // Item types
    this.itemTypes = {
      EXPERIENCE: 'experience',
      HEALTH: 'health',
      CHEST: 'chest',
      COIN: 'coin',
      WEAPON: 'weapon',
      SKILL: 'skill'
    };
    
    // Rarity levels
    this.rarityLevels = {
      COMMON: { name: 'Common', color: 0xffffff, chance: 0.6 },
      RARE: { name: 'Rare', color: 0x00ff00, chance: 0.3 },
      EPIC: { name: 'Epic', color: 0x800080, chance: 0.08 },
      LEGENDARY: { name: 'Legendary', color: 0xffa500, chance: 0.02 }
    };
    
    // Drop chances
    this.dropChances = {
      normalEnemy: {
        [this.itemTypes.EXPERIENCE]: 0.8,
        [this.itemTypes.HEALTH]: 0.05,
        [this.itemTypes.COIN]: 0.1,
        [this.itemTypes.CHEST]: 0.01
      },
      eliteEnemy: {
        [this.itemTypes.EXPERIENCE]: 1.0,
        [this.itemTypes.HEALTH]: 0.2,
        [this.itemTypes.COIN]: 0.3,
        [this.itemTypes.CHEST]: 0.1
      },
      bossEnemy: {
        [this.itemTypes.EXPERIENCE]: 1.0,
        [this.itemTypes.HEALTH]: 0.5,
        [this.itemTypes.COIN]: 0.7,
        [this.itemTypes.CHEST]: 1.0,
        [this.itemTypes.WEAPON]: 0.3,
        [this.itemTypes.SKILL]: 0.5
      }
    };
    
    // Chest contents
    this.chestContents = {
      normal: {
        minItems: 1,
        maxItems: 3,
        guaranteedTypes: []
      },
      elite: {
        minItems: 2,
        maxItems: 4,
        guaranteedTypes: [this.itemTypes.COIN]
      },
      boss: {
        minItems: 3,
        maxItems: 5,
        guaranteedTypes: [this.itemTypes.COIN, this.itemTypes.SKILL]
      }
    };
    
    // Magnet effect range
    this.magnetRange = 150;
    this.magnetActive = false;
    this.magnetTimer = 0;
  }
  
  // Process drops when an enemy is defeated
  processEnemyDrops(enemy, x, y) {
    const enemyType = enemy.isBoss ? 'bossEnemy' : (enemy.isElite ? 'eliteEnemy' : 'normalEnemy');
    const dropChances = this.dropChances[enemyType];
    
    // Process each possible drop type
    Object.entries(dropChances).forEach(([itemType, chance]) => {
      if (Math.random() < chance) {
        this.createDrop(itemType, x, y, enemy);
      }
    });
  }
  
  // Create a drop item
  createDrop(itemType, x, y, sourceEnemy = null) {
    // Add some randomness to position
    const randomOffset = 20;
    x += Phaser.Math.Between(-randomOffset, randomOffset);
    y += Phaser.Math.Between(-randomOffset, randomOffset);
    
    // Determine rarity
    const rarity = this.determineRarity();
    
    let drop;
    
    switch (itemType) {
      case this.itemTypes.EXPERIENCE:
        drop = this.createExperienceDrop(x, y, rarity);
        break;
      case this.itemTypes.HEALTH:
        drop = this.createHealthDrop(x, y, rarity);
        break;
      case this.itemTypes.CHEST:
        drop = this.createChestDrop(x, y, sourceEnemy);
        break;
      case this.itemTypes.COIN:
        drop = this.createCoinDrop(x, y, rarity);
        break;
      case this.itemTypes.WEAPON:
        drop = this.createWeaponDrop(x, y, rarity);
        break;
      case this.itemTypes.SKILL:
        drop = this.createSkillDrop(x, y, rarity);
        break;
    }
    
    if (drop) {
      // Add to drops group
      this.scene.drops.add(drop);
      
      // Add collection overlap
      this.scene.physics.add.overlap(this.scene.player, drop, this.collectDrop, null, this);
      
      // Add animation
      this.scene.tweens.add({
        targets: drop,
        y: drop.y - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
      
      return drop;
    }
    
    return null;
  }
  
  // Create experience orb drop
  createExperienceDrop(x, y, rarity) {
    const drop = this.scene.physics.add.sprite(x, y, 'exp-orb');
    drop.setScale(0.5 + (Object.values(this.rarityLevels).indexOf(rarity) * 0.1));
    drop.setTint(rarity.color);
    drop.itemType = this.itemTypes.EXPERIENCE;
    drop.rarity = rarity;
    drop.value = 10 * (Object.values(this.rarityLevels).indexOf(rarity) + 1);
    drop.setDepth(3);
    
    // Add update function for magnet effect
    drop.update = () => {
      if (this.magnetActive || this.scene.player.hasMagnet) {
        const distance = Phaser.Math.Distance.Between(
          this.scene.player.x, this.scene.player.y,
          drop.x, drop.y
        );
        
        if (distance < this.magnetRange) {
          // Move toward player
          const angle = Phaser.Math.Angle.Between(
            drop.x, drop.y,
            this.scene.player.x, this.scene.player.y
          );
          
          const speed = 5 * (1 - distance / this.magnetRange);
          drop.x += Math.cos(angle) * speed;
          drop.y += Math.sin(angle) * speed;
        }
      }
    };
    
    // Add to update list
    this.scene.updateList.add(drop);
    
    return drop;
  }
  
  // Create health drop
  createHealthDrop(x, y, rarity) {
    const drop = this.scene.physics.add.sprite(x, y, 'health-drop');
    drop.setScale(0.5 + (Object.values(this.rarityLevels).indexOf(rarity) * 0.1));
    drop.setTint(rarity.color);
    drop.itemType = this.itemTypes.HEALTH;
    drop.rarity = rarity;
    drop.value = 10 * (Object.values(this.rarityLevels).indexOf(rarity) + 1);
    drop.setDepth(3);
    
    return drop;
  }
  
  // Create chest drop
  createChestDrop(x, y, sourceEnemy) {
    const chestType = sourceEnemy && sourceEnemy.isBoss ? 'boss' : 
                     (sourceEnemy && sourceEnemy.isElite ? 'elite' : 'normal');
    
    const drop = this.scene.physics.add.sprite(x, y, 'chest');
    drop.setScale(0.7);
    drop.itemType = this.itemTypes.CHEST;
    drop.chestType = chestType;
    drop.contents = this.generateChestContents(chestType);
    drop.setDepth(3);
    
    // Add glow effect
    const glow = this.scene.add.sprite(x, y, 'chest-glow');
    glow.setScale(1.2);
    glow.setAlpha(0.5);
    glow.setDepth(2);
    
    // Pulse glow
    this.scene.tweens.add({
      targets: glow,
      alpha: 0.8,
      scale: 1.4,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    // Link glow to chest
    drop.glow = glow;
    
    // Custom update function to keep glow with chest
    drop.update = () => {
      if (drop.glow) {
        drop.glow.x = drop.x;
        drop.glow.y = drop.y;
      }
    };
    
    // Add to update list
    this.scene.updateList.add(drop);
    
    return drop;
  }
  
  // Create coin drop
  createCoinDrop(x, y, rarity) {
    const drop = this.scene.physics.add.sprite(x, y, 'coin');
    drop.setScale(0.4 + (Object.values(this.rarityLevels).indexOf(rarity) * 0.1));
    drop.setTint(rarity.color);
    drop.itemType = this.itemTypes.COIN;
    drop.rarity = rarity;
    drop.value = 5 * (Object.values(this.rarityLevels).indexOf(rarity) + 1);
    drop.setDepth(3);
    
    // Add rotation animation
    this.scene.tweens.add({
      targets: drop,
      angle: 360,
      duration: 2000,
      repeat: -1
    });
    
    return drop;
  }
  
  // Create weapon drop
  createWeaponDrop(x, y, rarity) {
    // Get a random weapon from the weapon system
    const weaponTypes = this.scene.weaponSystem.weaponTypes;
    const weaponIndex = Phaser.Math.Between(0, weaponTypes.length - 1);
    const weaponType = weaponTypes[weaponIndex];
    
    const drop = this.scene.physics.add.sprite(x, y, weaponType.key);
    drop.setScale(0.6);
    drop.setTint(rarity.color);
    drop.itemType = this.itemTypes.WEAPON;
    drop.rarity = rarity;
    drop.weaponName = weaponType.name;
    drop.setDepth(3);
    
    // Add floating effect
    this.scene.tweens.add({
      targets: drop,
      y: drop.y - 15,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });
    
    // Add glow effect based on rarity
    const glow = this.scene.add.sprite(x, y, 'weapon-glow');
    glow.setScale(1.0);
    glow.setAlpha(0.6);
    glow.setTint(rarity.color);
    glow.setDepth(2);
    
    // Pulse glow
    this.scene.tweens.add({
      targets: glow,
      alpha: 0.9,
      scale: 1.2,
      duration: 1200,
      yoyo: true,
      repeat: -1
    });
    
    // Link glow to weapon
    drop.glow = glow;
    
    // Custom update function to keep glow with weapon
    drop.update = () => {
      if (drop.glow) {
        drop.glow.x = drop.x;
        drop.glow.y = drop.y;
      }
    };
    
    // Add to update list
    this.scene.updateList.add(drop);
    
    return drop;
  }
  
  // Create skill drop
  createSkillDrop(x, y, rarity) {
    // Get a random skill
    const availableSkills = this.scene.availableSkills;
    const skillIndex = Phaser.Math.Between(0, availableSkills.length - 1);
    const skill = availableSkills[skillIndex];
    
    const drop = this.scene.physics.add.sprite(x, y, skill.key);
    drop.setScale(0.6);
    drop.setTint(rarity.color);
    drop.itemType = this.itemTypes.SKILL;
    drop.rarity = rarity;
    drop.skillName = skill.name;
    drop.setDepth(3);
    
    // Add floating and rotation effect
    this.scene.tweens.add({
      targets: drop,
      y: drop.y - 15,
      angle: 360,
      duration: 2000,
      yoyo: true,
      repeat: -1
    });
    
    return drop;
  }
  
  // Collect a drop
  collectDrop(player, drop) {
    // Process based on item type
    switch (drop.itemType) {
      case this.itemTypes.EXPERIENCE:
        this.collectExperience(drop);
        break;
      case this.itemTypes.HEALTH:
        this.collectHealth(drop);
        break;
      case this.itemTypes.CHEST:
        this.openChest(drop);
        break;
      case this.itemTypes.COIN:
        this.collectCoin(drop);
        break;
      case this.itemTypes.WEAPON:
        this.collectWeapon(drop);
        break;
      case this.itemTypes.SKILL:
        this.collectSkill(drop);
        break;
    }
    
    // Remove from update list if needed
    if (this.scene.updateList.has(drop)) {
      this.scene.updateList.delete(drop);
    }
    
    // Remove glow effect if exists
    if (drop.glow) {
      drop.glow.destroy();
    }
    
    // Destroy the drop
    drop.destroy();
  }
  
  // Collect experience orb
  collectExperience(drop) {
    // Apply character special ability if applicable
    let expValue = drop.value;
    if (this.scene.playerCharacter && this.scene.playerCharacter.specialAbility === 'Experience Boost') {
      expValue = this.scene.characterSystem.applySpecialAbility(
        this.scene.playerCharacter, 'experience', expValue
      );
    }
    
    // Add experience
    this.scene.experienceSystem.addExperience(expValue);
    
    // Create floating text
    this.createFloatingText(drop.x, drop.y, `+${expValue} XP`, 0x00ff00);
    
    // Play sound
    // this.scene.sound.play('exp-collect');
  }
  
  // Collect health drop
  collectHealth(drop) {
    // Calculate health to restore
    const healthToRestore = Math.min(
      drop.value,
      this.scene.playerMaxHealth - this.scene.playerHealth
    );
    
    // Restore health
    if (healthToRestore > 0) {
      this.scene.playerHealth += healthToRestore;
      this.scene.updateHealthBar();
      
      // Create floating text
      this.createFloatingText(drop.x, drop.y, `+${healthToRestore} HP`, 0xff0000);
      
      // Play sound
      // this.scene.sound.play('health-collect');
    }
  }
  
  // Open a chest
  openChest(drop) {
    // Play chest opening animation
    const openingAnimation = this.scene.add.sprite(drop.x, drop.y, 'chest-opening');
    openingAnimation.setScale(0.7);
    openingAnimation.setDepth(5);
    openingAnimation.on('animationcomplete', () => {
      openingAnimation.destroy();
      
      // Spawn chest contents
      this.spawnChestContents(drop);
    });
    openingAnimation.play('chest-open');
    
    // Play sound
    // this.scene.sound.play('chest-open');
  }
  
  // Spawn chest contents
  spawnChestContents(chest) {
    const contents = chest.contents;
    const numItems = contents.length;
    
    // Spawn items in a circle around the chest
    const radius = 30;
    const angleStep = (Math.PI * 2) / numItems;
    
    contents.forEach((itemType, index) => {
      const angle = index * angleStep;
      const x = chest.x + Math.cos(angle) * radius;
      const y = chest.y + Math.sin(angle) * radius;
      
      // Determine rarity - chest items have better chances for higher rarities
      const rarity = this.determineRarity(true);
      
      // Create the drop
      this.createDrop(itemType, x, y);
    });
  }
  
  // Collect coin
  collectCoin(drop) {
    // Add coins to player
    this.scene.coins = (this.scene.coins || 0) + drop.value;
    
    // Update coin display
    if (this.scene.coinText) {
      this.scene.coinText.setText(`Coins: ${this.scene.coins}`);
    }
    
    // Create floating text
    this.createFloatingText(drop.x, drop.y, `+${drop.value} Coins`, 0xffff00);
    
    // Play sound
    // this.scene.sound.play('coin-collect');
  }
  
  // Collect weapon
  collectWeapon(drop) {
    // Show weapon selection UI
    this.showWeaponSelectionUI(drop.weaponName, drop.rarity);
    
    // Play sound
    // this.scene.sound.play('weapon-collect');
  }
  
  // Collect skill
  collectSkill(drop) {
    // Add skill to player's active skills or upgrade existing
    const existingSkill = this.scene.activeSkills.find(s => s.name === drop.skillName);
    
    if (existingSkill && existingSkill.level < existingSkill.maxLevel) {
      // Upgrade existing skill
      existingSkill.level++;
      
      // Create floating text
      this.createFloatingText(drop.x, drop.y, `${drop.skillName} Upgraded!`, 0x00ffff);
    } else if (!existingSkill && this.scene.activeSkills.length < this.scene.skillSlots) {
      // Add new skill
      const newSkill = this.scene.availableSkills.find(s => s.name === drop.skillName);
      if (newSkill) {
        this.scene.activeSkills.push({
          ...newSkill,
          level: 1,
          cooldownTimer: 0
        });
        
        // Create floating text
        this.createFloatingText(drop.x, drop.y, `${drop.skillName} Acquired!`, 0x00ffff);
      }
    } else {
      // Show skill selection UI to replace an existing skill
      this.showSkillSelectionUI(drop.skillName, drop.rarity);
    }
    
    // Play sound
    // this.scene.sound.play('skill-collect');
  }
  
  // Show weapon selection UI
  showWeaponSelectionUI(newWeaponName, rarity) {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Pause game
    this.scene.physics.pause();
    
    // Background
    const bg = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    bg.setOrigin(0);
    bg.setDepth(100);
    
    // Title
    const title = this.scene.add.text(width / 2, 50, 'WEAPON FOUND!', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff'
    });
    title.setOrigin(0.5);
    title.setDepth(101);
    
    // New weapon info
    const newWeapon = this.scene.weaponSystem.weaponTypes.find(w => w.name === newWeaponName);
    
    const newWeaponCard = this.createWeaponCard(
      width / 4,
      height / 2,
      newWeapon,
      rarity,
      'NEW'
    );
    
    // Current weapon info
    const currentWeaponCard = this.createWeaponCard(
      width * 3 / 4,
      height / 2,
      this.scene.playerWeapon,
      { name: this.scene.playerWeapon.rarity, color: this.scene.weaponSystem.rarityColors[this.scene.playerWeapon.rarity] },
      'CURRENT'
    );
    
    // Buttons
    const takeButton = this.scene.add.rectangle(width / 4, height - 100, 200, 50, 0x00aa00);
    takeButton.setDepth(101);
    takeButton.setInteractive();
    
    const takeText = this.scene.add.text(width / 4, height - 100, 'TAKE NEW', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });
    takeText.setOrigin(0.5);
    takeText.setDepth(102);
    
    const keepButton = this.scene.add.rectangle(width * 3 / 4, height - 100, 200, 50, 0xaa0000);
    keepButton.setDepth(101);
    keepButton.setInteractive();
    
    const keepText = this.scene.add.text(width * 3 / 4, height - 100, 'KEEP CURRENT', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });
    keepText.setOrigin(0.5);
    keepText.setDepth(102);
    
    // Button handlers
    takeButton.on('pointerdown', () => {
      // Change weapon
      this.scene.weaponSystem.changeWeapon(newWeaponName, this.scene.playerCharacter.name);
      
      // Clean up UI
      this.cleanupSelectionUI([bg, title, ...newWeaponCard, ...currentWeaponCard, takeButton, takeText, keepButton, keepText]);
    });
    
    keepButton.on('pointerdown', () => {
      // Clean up UI
      this.cleanupSelectionUI([bg, title, ...newWeaponCard, ...currentWeaponCard, takeButton, takeText, keepButton, keepText]);
    });
  }
  
  // Show skill selection UI
  showSkillSelectionUI(newSkillName, rarity) {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Pause game
    this.scene.physics.pause();
    
    // Background
    const bg = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    bg.setOrigin(0);
    bg.setDepth(100);
    
    // Title
    const title = this.scene.add.text(width / 2, 50, 'SKILL FOUND!', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff'
    });
    title.setOrigin(0.5);
    title.setDepth(101);
    
    // New skill info
    const newSkill = this.scene.availableSkills.find(s => s.name === newSkillName);
    
    const newSkillCard = this.createSkillCard(
      width / 2,
      150,
      newSkill,
      rarity,
      'NEW SKILL'
    );
    
    // Current skills
    const skillCards = [];
    const uiElements = [bg, title, ...newSkillCard];
    
    this.scene.activeSkills.forEach((skill, index) => {
      const x = width / (this.scene.activeSkills.length + 1) * (index + 1);
      const y = height - 200;
      
      const card = this.createSkillCard(
        x,
        y,
        skill,
        { name: 'Current', color: 0xffffff },
        `SKILL ${index + 1}`
      );
      
      // Add replace button
      const replaceButton = this.scene.add.rectangle(x, y + 150, 150, 40, 0x00aa00);
      replaceButton.setDepth(101);
      replaceButton.setInteractive();
      
      const replaceText = this.scene.add.text(x, y + 150, 'REPLACE', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff'
      });
      replaceText.setOrigin(0.5);
      replaceText.setDepth(102);
      
      // Button handler
      replaceButton.on('pointerdown', () => {
        // Replace skill
        this.scene.activeSkills[index] = {
          ...newSkill,
          level: 1,
          cooldownTimer: 0
        };
        
        // Clean up UI
        this.cleanupSelectionUI(uiElements);
      });
      
      skillCards.push(...card, replaceButton, replaceText);
      uiElements.push(...card, replaceButton, replaceText);
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
    
    // Skip button handler
    skipButton.on('pointerdown', () => {
      // Clean up UI
      this.cleanupSelectionUI([...uiElements, skipButton, skipText]);
    });
    
    uiElements.push(skipButton, skipText);
  }
  
  // Create weapon card for selection UI
  createWeaponCard(x, y, weapon, rarity, label) {
    const elements = [];
    
    // Card background
    const card = this.scene.add.rectangle(x, y, 300, 400, 0x333333);
    card.setOrigin(0.5);
    card.setDepth(101);
    elements.push(card);
    
    // Label
    const labelText = this.scene.add.text(x, y - 180, label, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    });
    labelText.setOrigin(0.5);
    labelText.setDepth(102);
    elements.push(labelText);
    
    // Weapon name
    const nameText = this.scene.add.text(x, y - 150, weapon.name, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });
    nameText.setOrigin(0.5);
    nameText.setDepth(102);
    elements.push(nameText);
    
    // Rarity
    const rarityText = this.scene.add.text(x, y - 120, rarity.name, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    });
    rarityText.setOrigin(0.5);
    rarityText.setTint(rarity.color);
    rarityText.setDepth(102);
    elements.push(rarityText);
    
    // Weapon image
    const image = this.scene.add.sprite(x, y - 50, weapon.key);
    image.setDepth(102);
    image.setTint(rarity.color);
    elements.push(image);
    
    // Weapon stats
    const statsText = this.scene.add.text(x - 130, y + 30, 
      `Damage: ${weapon.damage}\nAttack Speed: ${weapon.attackSpeed.toFixed(1)}\nRange: ${weapon.range}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    });
    statsText.setDepth(102);
    elements.push(statsText);
    
    // Weapon description
    const descText = this.scene.add.text(x, y + 120, weapon.description, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: 280 }
    });
    descText.setOrigin(0.5, 0);
    descText.setDepth(102);
    elements.push(descText);
    
    return elements;
  }
  
  // Create skill card for selection UI
  createSkillCard(x, y, skill, rarity, label) {
    const elements = [];
    
    // Card background
    const card = this.scene.add.rectangle(x, y, 250, 200, 0x333333);
    card.setOrigin(0.5);
    card.setDepth(101);
    elements.push(card);
    
    // Label
    const labelText = this.scene.add.text(x, y - 80, label, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    });
    labelText.setOrigin(0.5);
    labelText.setDepth(102);
    elements.push(labelText);
    
    // Skill name
    const nameText = this.scene.add.text(x, y - 50, skill.name, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    });
    nameText.setOrigin(0.5);
    nameText.setDepth(102);
    elements.push(nameText);
    
    // Skill level
    const levelText = this.scene.add.text(x, y - 25, `Level: ${skill.level || 1}/${skill.maxLevel}`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    });
    levelText.setOrigin(0.5);
    levelText.setDepth(102);
    elements.push(levelText);
    
    // Skill image
    const image = this.scene.add.sprite(x - 80, y + 20, skill.key);
    image.setScale(0.8);
    image.setDepth(102);
    image.setTint(rarity.color);
    elements.push(image);
    
    // Skill stats
    const statsText = this.scene.add.text(x + 10, y + 10, 
      `Damage: ${skill.damage}\nCooldown: ${(skill.cooldown / 1000).toFixed(1)}s`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff'
    });
    statsText.setDepth(102);
    elements.push(statsText);
    
    return elements;
  }
  
  // Clean up selection UI
  cleanupSelectionUI(elements) {
    // Destroy all UI elements
    elements.forEach(element => {
      element.destroy();
    });
    
    // Resume game
    this.scene.physics.resume();
  }
  
  // Create floating text
  createFloatingText(x, y, text, color) {
    const floatingText = this.scene.add.text(x, y, text, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: `#${color.toString(16).padStart(6, '0')}`
    });
    floatingText.setOrigin(0.5);
    floatingText.setDepth(20);
    
    // Animate floating up and fading out
    this.scene.tweens.add({
      targets: floatingText,
      y: y - 50,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        floatingText.destroy();
      }
    });
  }
  
  // Generate chest contents
  generateChestContents(chestType) {
    const chestConfig = this.chestContents[chestType];
    const numItems = Phaser.Math.Between(chestConfig.minItems, chestConfig.maxItems);
    const contents = [...chestConfig.guaranteedTypes];
    
    // Add random items to reach the required number
    while (contents.length < numItems) {
      const itemTypes = Object.values(this.itemTypes).filter(type => 
        type !== this.itemTypes.CHEST && !contents.includes(type)
      );
      
      if (itemTypes.length > 0) {
        const randomIndex = Phaser.Math.Between(0, itemTypes.length - 1);
        contents.push(itemTypes[randomIndex]);
      } else {
        break;
      }
    }
    
    return contents;
  }
  
  // Determine item rarity
  determineRarity(isChestItem = false) {
    const rarityLevels = Object.values(this.rarityLevels);
    let random = Math.random();
    
    // Chest items have better chances for higher rarities
    if (isChestItem) {
      random = Math.pow(random, 1.5); // Skew probability toward higher rarities
    }
    
    // Find the highest rarity that meets the random threshold
    for (let i = rarityLevels.length - 1; i >= 0; i--) {
      if (random > 1 - rarityLevels[i].chance) {
        return rarityLevels[i];
      }
    }
    
    // Default to common
    return this.rarityLevels.COMMON;
  }
  
  // Activate magnet effect
  activateMagnet(duration = 5000) {
    this.magnetActive = true;
    this.magnetTimer = duration;
    
    // Create visual effect
    const magnetEffect = this.scene.add.circle(
      this.scene.player.x,
      this.scene.player.y,
      this.magnetRange,
      0x4287f5,
      0.2
    );
    magnetEffect.setDepth(1);
    
    // Make effect follow player
    magnetEffect.update = () => {
      magnetEffect.x = this.scene.player.x;
      magnetEffect.y = this.scene.player.y;
    };
    
    // Add to update list
    this.scene.updateList.add(magnetEffect);
    
    // Remove effect after duration
    this.scene.time.delayedCall(duration, () => {
      this.magnetActive = false;
      this.scene.updateList.delete(magnetEffect);
      magnetEffect.destroy();
    });
  }
  
  // Update method
  update(delta) {
    // Update magnet timer
    if (this.magnetActive && this.magnetTimer > 0) {
      this.magnetTimer -= delta;
      if (this.magnetTimer <= 0) {
        this.magnetActive = false;
      }
    }
  }
}

export default ItemDropSystem;

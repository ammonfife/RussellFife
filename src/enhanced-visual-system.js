// Enhanced visual effects for Survivor.io style game
class EnhancedVisualSystem {
  constructor(scene) {
    this.scene = scene;
    
    // Define visual settings
    this.settings = {
      outlineThickness: 3,
      outlineColor: 0x000000,
      damageTextSize: 16,
      damageTextColor: 0xff0000,
      healTextSize: 16,
      healTextColor: 0x00ff00,
      levelUpEffectColor: 0xffff00,
      criticalHitColor: 0xff00ff,
      uiBarHeight: 20,
      uiBarBackground: 0x333333,
      uiHealthColor: 0xff0000,
      uiExpColor: 0x00ffff,
      uiTimerColor: 0xffff00,
      uiWaveColor: 0xff00ff
    };
    
    // Initialize particle systems
    this.initParticleSystems();
    
    // Initialize UI elements
    this.initUI();
  }
  
  // Initialize particle systems for various effects
  initParticleSystems() {
    // Damage particles
    this.damageParticles = this.scene.add.particles('exp-orb');
    this.damageEmitter = this.damageParticles.createEmitter({
      speed: { min: 50, max: 100 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      on: false
    });
    
    // Heal particles
    this.healParticles = this.scene.add.particles('exp-orb');
    this.healEmitter = this.healParticles.createEmitter({
      speed: { min: 50, max: 100 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: 0x00ff00,
      lifespan: 500,
      on: false
    });
    
    // Level up particles
    this.levelUpParticles = this.scene.add.particles('exp-orb');
    this.levelUpEmitter = this.levelUpParticles.createEmitter({
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: this.settings.levelUpEffectColor,
      lifespan: 1000,
      on: false
    });
    
    // Death particles
    this.deathParticles = this.scene.add.particles('exp-orb');
    this.deathEmitter = this.deathParticles.createEmitter({
      speed: { min: 50, max: 150 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: 0xff0000,
      lifespan: 800,
      on: false
    });
    
    // Skill activation particles
    this.skillParticles = this.scene.add.particles('exp-orb');
    this.skillEmitter = this.skillParticles.createEmitter({
      speed: { min: 50, max: 100 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: 0x00ffff,
      lifespan: 500,
      on: false
    });
  }
  
  // Initialize UI elements
  initUI() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // UI container
    this.uiContainer = this.scene.add.container(0, 0);
    this.uiContainer.setDepth(20);
    
    // Health bar background
    this.healthBarBg = this.scene.add.rectangle(
      10, 10,
      200, this.settings.uiBarHeight,
      this.settings.uiBarBackground
    );
    this.healthBarBg.setOrigin(0, 0);
    
    // Health bar
    this.healthBar = this.scene.add.rectangle(
      10, 10,
      200, this.settings.uiBarHeight,
      this.settings.uiHealthColor
    );
    this.healthBar.setOrigin(0, 0);
    
    // Health icon
    this.healthIcon = this.scene.add.sprite(
      5, 10 + this.settings.uiBarHeight / 2,
      'health-bar'
    );
    this.healthIcon.setScale(0.8);
    this.healthIcon.setOrigin(0, 0.5);
    
    // Health text
    this.healthText = this.scene.add.text(
      215, 10 + this.settings.uiBarHeight / 2,
      '100/100',
      {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    this.healthText.setOrigin(0, 0.5);
    
    // Experience bar background
    this.expBarBg = this.scene.add.rectangle(
      10, 10 + this.settings.uiBarHeight + 5,
      200, this.settings.uiBarHeight,
      this.settings.uiBarBackground
    );
    this.expBarBg.setOrigin(0, 0);
    
    // Experience bar
    this.expBar = this.scene.add.rectangle(
      10, 10 + this.settings.uiBarHeight + 5,
      0, this.settings.uiBarHeight,
      this.settings.uiExpColor
    );
    this.expBar.setOrigin(0, 0);
    
    // Level text
    this.levelText = this.scene.add.text(
      215, 10 + this.settings.uiBarHeight + 5 + this.settings.uiBarHeight / 2,
      'Lv. 1',
      {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    this.levelText.setOrigin(0, 0.5);
    
    // Timer
    this.timerText = this.scene.add.text(
      width / 2, 10,
      '00:00',
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    this.timerText.setOrigin(0.5, 0);
    
    // Wave indicator
    this.waveContainer = this.scene.add.container(width - 10, 10);
    this.waveContainer.setOrigin(1, 0);
    
    this.waveBg = this.scene.add.rectangle(
      0, 0,
      100, 30,
      this.settings.uiBarBackground,
      0.8
    );
    this.waveBg.setOrigin(1, 0);
    
    this.waveText = this.scene.add.text(
      -10, 15,
      'WAVE 1',
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    this.waveText.setOrigin(1, 0.5);
    
    this.waveContainer.add([this.waveBg, this.waveText]);
    
    // Boss warning
    this.bossWarning = this.scene.add.text(
      width / 2, height / 3,
      'BOSS INCOMING!',
      {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 6
      }
    );
    this.bossWarning.setOrigin(0.5);
    this.bossWarning.setAlpha(0);
    
    // Add all UI elements to container
    this.uiContainer.add([
      this.healthBarBg,
      this.healthBar,
      this.healthIcon,
      this.healthText,
      this.expBarBg,
      this.expBar,
      this.levelText,
      this.timerText,
      this.waveContainer,
      this.bossWarning
    ]);
  }
  
  // Apply toony outline to sprite
  applyToonyOutline(sprite, thickness = this.settings.outlineThickness, color = this.settings.outlineColor) {
    // Create outline sprite
    const outline = this.scene.add.sprite(sprite.x, sprite.y, sprite.texture.key);
    outline.setScale(sprite.scaleX * 1.1, sprite.scaleY * 1.1);
    outline.setTint(color);
    outline.setDepth(sprite.depth - 1);
    outline.setAlpha(0.8);
    
    // Make outline follow sprite
    outline.update = () => {
      outline.x = sprite.x;
      outline.y = sprite.y;
      outline.rotation = sprite.rotation;
      outline.visible = sprite.visible;
    };
    
    // Add to update list
    this.scene.updateList.add(outline);
    
    // Store reference to outline in sprite
    sprite.outline = outline;
    
    return outline;
  }
  
  // Show damage text
  showDamageText(x, y, amount, isCritical = false) {
    const color = isCritical ? this.settings.criticalHitColor : this.settings.damageTextColor;
    const size = isCritical ? this.settings.damageTextSize * 1.5 : this.settings.damageTextSize;
    
    const text = this.scene.add.text(
      x, y,
      `-${amount}`,
      {
        fontFamily: 'Arial',
        fontSize: `${size}px`,
        color: `#${color.toString(16)}`,
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    text.setOrigin(0.5);
    text.setDepth(15);
    
    // Animate text
    this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      scale: isCritical ? 1.5 : 1,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        text.destroy();
      }
    });
    
    // Show damage particles
    this.damageEmitter.setTint(color);
    this.damageEmitter.explode(isCritical ? 15 : 8, x, y);
  }
  
  // Show heal text
  showHealText(x, y, amount) {
    const text = this.scene.add.text(
      x, y,
      `+${amount}`,
      {
        fontFamily: 'Arial',
        fontSize: `${this.settings.healTextSize}px`,
        color: `#${this.settings.healTextColor.toString(16)}`,
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    text.setOrigin(0.5);
    text.setDepth(15);
    
    // Animate text
    this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      scale: 1.2,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        text.destroy();
      }
    });
    
    // Show heal particles
    this.healEmitter.explode(10, x, y);
  }
  
  // Show level up effect
  showLevelUpEffect(x, y, level) {
    // Create level up text
    const text = this.scene.add.text(
      x, y,
      `LEVEL UP!\nLv. ${level}`,
      {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      }
    );
    text.setOrigin(0.5);
    text.setDepth(15);
    
    // Animate text
    this.scene.tweens.add({
      targets: text,
      scale: 1.5,
      alpha: 0,
      duration: 2000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        text.destroy();
      }
    });
    
    // Show level up particles
    this.levelUpEmitter.explode(30, x, y);
    
    // Create circular wave effect
    const circle = this.scene.add.circle(x, y, 10, this.settings.levelUpEffectColor, 0.7);
    circle.setDepth(14);
    
    // Animate circle
    this.scene.tweens.add({
      targets: circle,
      radius: 200,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        circle.destroy();
      }
    });
  }
  
  // Show death effect
  showDeathEffect(x, y, isEnemy = true) {
    // Show death particles
    this.deathEmitter.setTint(isEnemy ? 0xff0000 : 0xffffff);
    this.deathEmitter.explode(20, x, y);
    
    // Create explosion effect
    const explosion = this.scene.add.circle(x, y, 30, isEnemy ? 0xff0000 : 0xffffff, 0.7);
    explosion.setDepth(14);
    
    // Animate explosion
    this.scene.tweens.add({
      targets: explosion,
      radius: 100,
      alpha: 0,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        explosion.destroy();
      }
    });
  }
  
  // Show skill activation effect
  showSkillActivationEffect(x, y, skillName, color = 0x00ffff) {
    // Create skill activation text
    const text = this.scene.add.text(
      x, y - 30,
      skillName,
      {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: `#${color.toString(16)}`,
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    text.setOrigin(0.5);
    text.setDepth(15);
    
    // Animate text
    this.scene.tweens.add({
      targets: text,
      y: y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        text.destroy();
      }
    });
    
    // Show skill particles
    this.skillEmitter.setTint(color);
    this.skillEmitter.explode(15, x, y);
    
    // Create circular wave effect
    const circle = this.scene.add.circle(x, y, 10, color, 0.5);
    circle.setDepth(14);
    
    // Animate circle
    this.scene.tweens.add({
      targets: circle,
      radius: 50,
      alpha: 0,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        circle.destroy();
      }
    });
  }
  
  // Show item pickup effect
  showItemPickupEffect(x, y, itemName, color = 0xffffff) {
    // Create item pickup text
    const text = this.scene.add.text(
      x, y,
      itemName,
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: `#${color.toString(16)}`,
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    text.setOrigin(0.5);
    text.setDepth(15);
    
    // Animate text
    this.scene.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        text.destroy();
      }
    });
    
    // Create sparkle effect
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 20;
      
      const sparkle = this.scene.add.star(
        x + Math.cos(angle) * distance,
        y + Math.sin(angle) * distance,
        5, 5, 10,
        color
      );
      sparkle.setDepth(14);
      sparkle.setScale(0.5);
      
      // Animate sparkle
      this.scene.tweens.add({
        targets: sparkle,
        scale: 0,
        alpha: 0,
        duration: 500,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          sparkle.destroy();
        }
      });
    }
  }
  
  // Show boss warning
  showBossWarning() {
    // Flash boss warning text
    this.scene.tweens.add({
      targets: this.bossWarning,
      alpha: 1,
      duration: 500,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.bossWarning.setAlpha(0);
      }
    });
    
    // Create screen flash
    const flash = this.scene.add.rectangle(
      0, 0,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0xff0000,
      0.3
    );
    flash.setOrigin(0);
    flash.setDepth(19);
    
    // Animate flash
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        flash.destroy();
      }
    });
  }
  
  // Update health bar
  updateHealthBar(currentHealth, maxHealth) {
    const width = 200 * (currentHealth / maxHealth);
    this.healthBar.width = Math.max(0, width);
    this.healthText.setText(`${Math.ceil(currentHealth)}/${maxHealth}`);
    
    // Flash health bar when low
    if (currentHealth / maxHealth < 0.3 && currentHealth > 0) {
      if (!this.healthBarFlashing) {
        this.healthBarFlashing = true;
        
        this.healthBarFlashTween = this.scene.tweens.add({
          targets: this.healthBar,
          alpha: 0.5,
          duration: 300,
          yoyo: true,
          repeat: -1
        });
      }
    } else if (this.healthBarFlashing) {
      this.healthBarFlashing = false;
      this.healthBarFlashTween.stop();
      this.healthBar.setAlpha(1);
    }
  }
  
  // Update experience bar
  updateExpBar(currentExp, maxExp, level) {
    const width = 200 * (currentExp / maxExp);
    this.expBar.width = Math.max(0, width);
    this.levelText.setText(`Lv. ${level}`);
  }
  
  // Update timer
  updateTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    this.timerText.setText(
      `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    );
  }
  
  // Update wave indicator
  updateWaveIndicator(wave) {
    this.waveText.setText(`WAVE ${wave}`);
    
    // Pulse wave indicator
    this.scene.tweens.add({
      targets: this.waveContainer,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.waveContainer.setScale(1);
      }
    });
  }
  
  // Create floating damage numbers for enemy
  createEnemyHealthBar(enemy) {
    // Health bar background
    const healthBarBg = this.scene.add.rectangle(
      0, -20,
      30, 5,
      this.settings.uiBarBackground
    );
    healthBarBg.setOrigin(0.5, 0.5);
    
    // Health bar
    const healthBar = this.scene.add.rectangle(
      0, -20,
      30, 5,
      this.settings.uiHealthColor
    );
    healthBar.setOrigin(0.5, 0.5);
    
    // Add health bar to enemy
    enemy.healthBarBg = healthBarBg;
    enemy.healthBar = healthBar;
    
    // Update health bar function
    enemy.updateHealthBar = () => {
      const width = 30 * (enemy.health / enemy.maxHealth);
      enemy.healthBar.width = Math.max(0, width);
      
      // Position health bar above enemy
      enemy.healthBarBg.x = enemy.x;
      enemy.healthBarBg.y = enemy.y - 20;
      enemy.healthBar.x = enemy.x;
      enemy.healthBar.y = enemy.y - 20;
      
      // Hide health bar if full health
      const alpha = enemy.health < enemy.maxHealth ? 1 : 0;
      enemy.healthBarBg.setAlpha(alpha);
      enemy.healthBar.setAlpha(alpha);
    };
    
    // Set depth
    healthBarBg.setDepth(11);
    healthBar.setDepth(12);
    
    return { healthBarBg, healthBar };
  }
  
  // Create floating damage numbers for enemy
  createFloatingDamage(enemy, damage, isCritical = false) {
    this.showDamageText(enemy.x, enemy.y - 30, damage, isCritical);
  }
  
  // Apply toony style to all game elements
  applyToonyStyleToGame() {
    // Apply to player
    if (this.scene.player && !this.scene.player.outline) {
      this.applyToonyOutline(this.scene.player);
    }
    
    // Apply to enemies
    this.scene.enemies.getChildren().forEach(enemy => {
      if (!enemy.outline) {
        this.applyToonyOutline(enemy);
        this.createEnemyHealthBar(enemy);
      }
    });
    
    // Apply to skill effects
    this.scene.skillEffects.getChildren().forEach(effect => {
      if (!effect.outline) {
        this.applyToonyOutline(effect);
      }
    });
    
    // Apply to experience orbs
    this.scene.expOrbs.getChildren().forEach(orb => {
      if (!orb.outline) {
        this.applyToonyOutline(orb, 2, 0xffffff);
      }
    });
  }
  
  // Create a pulsing effect for items
  createPulsingEffect(item, color = 0xffffff) {
    // Create pulse circle
    const pulse = this.scene.add.circle(item.x, item.y, item.width / 2, color, 0.3);
    pulse.setDepth(item.depth - 1);
    
    // Make pulse follow item
    pulse.update = () => {
      pulse.x = item.x;
      pulse.y = item.y;
      pulse.visible = item.visible;
    };
    
    // Add to update list
    this.scene.updateList.add(pulse);
    
    // Create pulse animation
    this.scene.tweens.add({
      targets: pulse,
      scale: 1.5,
      alpha: 0,
      duration: 1000,
      repeat: -1
    });
    
    // Store reference to pulse in item
    item.pulse = pulse;
    
    return pulse;
  }
  
  // Create a rarity glow effect for items
  createRarityGlow(item, rarity) {
    let color;
    
    // Set color based on rarity
    switch (rarity) {
      case 'common':
        color = 0xffffff;
        break;
      case 'rare':
        color = 0x00ff00;
        break;
      case 'epic':
        color = 0x0000ff;
        break;
      case 'legendary':
        color = 0xff00ff;
        break;
      case 'ss-grade':
        color = 0xffff00;
        break;
      default:
        color = 0xffffff;
    }
    
    // Create glow sprite
    const glow = this.scene.add.sprite(item.x, item.y, item.texture.key);
    glow.setScale(item.scaleX * 1.2, item.scaleY * 1.2);
    glow.setTint(color);
    glow.setDepth(item.depth - 1);
    glow.setAlpha(0.5);
    
    // Make glow follow item
    glow.update = () => {
      glow.x = item.x;
      glow.y = item.y;
      glow.rotation = item.rotation;
      glow.visible = item.visible;
    };
    
    // Add to update list
    this.scene.updateList.add(glow);
    
    // Create glow animation
    this.scene.tweens.add({
      targets: glow,
      alpha: 0.2,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    // Store reference to glow in item
    item.glow = glow;
    
    return glow;
  }
  
  // Create a trail effect for moving objects
  createTrailEffect(object, color = 0xffffff, length = 10) {
    // Create trail container
    const trail = this.scene.add.container(0, 0);
    trail.setDepth(object.depth - 1);
    
    // Trail segments
    const segments = [];
    const positions = [];
    
    // Initialize positions array
    for (let i = 0; i < length; i++) {
      positions.push({ x: object.x, y: object.y });
    }
    
    // Create trail segments
    for (let i = 0; i < length; i++) {
      const segment = this.scene.add.circle(
        object.x, object.y,
        (object.width / 4) * (1 - i / length),
        color,
        (1 - i / length) * 0.5
      );
      
      segments.push(segment);
      trail.add(segment);
    }
    
    // Update trail function
    trail.update = () => {
      // Update positions
      positions.pop();
      positions.unshift({ x: object.x, y: object.y });
      
      // Update segments
      for (let i = 0; i < length; i++) {
        segments[i].x = positions[i].x;
        segments[i].y = positions[i].y;
      }
      
      // Hide trail if object is not visible
      trail.visible = object.visible;
    };
    
    // Add to update list
    this.scene.updateList.add(trail);
    
    // Store reference to trail in object
    object.trail = trail;
    
    return trail;
  }
  
  // Create a shadow effect for objects
  createShadowEffect(object) {
    // Create shadow sprite
    const shadow = this.scene.add.ellipse(
      object.x, object.y + object.height / 2,
      object.width * 0.8, object.height * 0.3,
      0x000000,
      0.3
    );
    shadow.setDepth(object.depth - 2);
    
    // Make shadow follow object
    shadow.update = () => {
      shadow.x = object.x;
      shadow.y = object.y + object.height / 2;
      shadow.visible = object.visible;
    };
    
    // Add to update list
    this.scene.updateList.add(shadow);
    
    // Store reference to shadow in object
    object.shadow = shadow;
    
    return shadow;
  }
  
  // Create a screen shake effect
  createScreenShake(intensity = 5, duration = 200) {
    const camera = this.scene.cameras.main;
    
    // Store original position
    const originalX = camera.scrollX;
    const originalY = camera.scrollY;
    
    // Shake function
    const shake = () => {
      camera.scrollX = originalX + (Math.random() * 2 - 1) * intensity;
      camera.scrollY = originalY + (Math.random() * 2 - 1) * intensity;
    };
    
    // Create shake interval
    const interval = setInterval(shake, 20);
    
    // Stop shaking after duration
    setTimeout(() => {
      clearInterval(interval);
      camera.scrollX = originalX;
      camera.scrollY = originalY;
    }, duration);
  }
  
  // Create a flash effect
  createFlashEffect(color = 0xffffff, duration = 100) {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Create flash rectangle
    const flash = this.scene.add.rectangle(
      width / 2, height / 2,
      width, height,
      color,
      0.3
    );
    flash.setDepth(100);
    
    // Animate flash
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: duration,
      onComplete: () => {
        flash.destroy();
      }
    });
    
    return flash;
  }
  
  // Create a vignette effect
  createVignetteEffect(intensity = 0.5) {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Create vignette
    const vignette = this.scene.add.graphics();
    vignette.setDepth(90);
    
    // Draw vignette
    vignette.fillStyle(0x000000, intensity);
    vignette.fillCircle(width / 2, height / 2, Math.max(width, height));
    vignette.fillStyle(0x000000, 0);
    vignette.fillCircle(width / 2, height / 2, Math.min(width, height) * 0.7);
    
    return vignette;
  }
  
  // Create a day/night cycle effect
  createDayNightCycle(duration = 60000) {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Create overlay
    const overlay = this.scene.add.rectangle(
      width / 2, height / 2,
      width, height,
      0x000000,
      0
    );
    overlay.setDepth(80);
    
    // Create cycle animation
    this.scene.tweens.add({
      targets: overlay,
      alpha: { from: 0, to: 0.7 },
      duration: duration / 2,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    return overlay;
  }
  
  // Create a parallax background effect
  createParallaxBackground(layers) {
    const container = this.scene.add.container(0, 0);
    container.setDepth(-10);
    
    // Create layers
    const backgroundLayers = layers.map((layer, index) => {
      const sprite = this.scene.add.tileSprite(
        0, 0,
        this.scene.cameras.main.width,
        this.scene.cameras.main.height,
        layer.key
      );
      sprite.setOrigin(0);
      sprite.setScrollFactor(0);
      sprite.depth = -10 - index;
      sprite.speed = layer.speed;
      
      container.add(sprite);
      
      return sprite;
    });
    
    // Update function
    container.update = () => {
      backgroundLayers.forEach(layer => {
        layer.tilePositionX += layer.speed * this.scene.player.body.velocity.x * 0.01;
        layer.tilePositionY += layer.speed * this.scene.player.body.velocity.y * 0.01;
      });
    };
    
    // Add to update list
    this.scene.updateList.add(container);
    
    return container;
  }
}

export default EnhancedVisualSystem;

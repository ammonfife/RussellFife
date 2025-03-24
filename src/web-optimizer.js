// Web optimization for Survivor.io style game
class WebOptimizer {
  constructor(scene) {
    this.scene = scene;
    
    // Define optimization settings
    this.settings = {
      maxParticles: 100,
      maxEnemies: 50,
      cullDistance: 800,
      lowFpsThreshold: 30,
      mediumFpsThreshold: 45,
      highFpsThreshold: 55,
      targetFps: 60,
      adaptiveQuality: true,
      loadingScreenDuration: 2000
    };
    
    // Initialize FPS counter
    this.fpsCounter = 0;
    this.fpsValues = [];
    this.currentQualityLevel = 'high';
    
    // Initialize loading screen
    this.initLoadingScreen();
  }
  
  // Initialize loading screen
  initLoadingScreen() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Create loading screen container
    this.loadingScreen = this.scene.add.container(0, 0);
    this.loadingScreen.setDepth(1000);
    
    // Background
    this.loadingBg = this.scene.add.rectangle(
      0, 0,
      width, height,
      0x000000
    );
    this.loadingBg.setOrigin(0);
    
    // Logo
    this.loadingLogo = this.scene.add.sprite(
      width / 2, height / 3,
      'logo'
    );
    this.loadingLogo.setScale(2);
    
    // Loading text
    this.loadingText = this.scene.add.text(
      width / 2, height / 2 + 50,
      'LOADING...',
      {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    this.loadingText.setOrigin(0.5);
    
    // Loading bar background
    this.loadingBarBg = this.scene.add.rectangle(
      width / 2 - 150, height / 2 + 100,
      300, 20,
      0x333333
    );
    this.loadingBarBg.setOrigin(0, 0.5);
    
    // Loading bar
    this.loadingBar = this.scene.add.rectangle(
      width / 2 - 150, height / 2 + 100,
      0, 20,
      0x00ff00
    );
    this.loadingBar.setOrigin(0, 0.5);
    
    // Add elements to container
    this.loadingScreen.add([
      this.loadingBg,
      this.loadingLogo,
      this.loadingText,
      this.loadingBarBg,
      this.loadingBar
    ]);
    
    // Hide loading screen initially
    this.loadingScreen.setVisible(false);
  }
  
  // Show loading screen
  showLoadingScreen(callback) {
    const width = this.scene.cameras.main.width;
    
    // Show loading screen
    this.loadingScreen.setVisible(true);
    
    // Reset loading bar
    this.loadingBar.width = 0;
    
    // Animate loading bar
    this.scene.tweens.add({
      targets: this.loadingBar,
      width: 300,
      duration: this.settings.loadingScreenDuration,
      ease: 'Cubic.easeInOut',
      onComplete: () => {
        // Hide loading screen
        this.loadingScreen.setVisible(false);
        
        // Call callback
        if (callback) {
          callback();
        }
      }
    });
    
    // Animate loading text
    this.loadingTextTween = this.scene.tweens.add({
      targets: this.loadingText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }
  
  // Update FPS counter
  updateFpsCounter() {
    // Calculate FPS
    const now = performance.now();
    if (!this.lastUpdate) {
      this.lastUpdate = now;
      return;
    }
    
    const delta = now - this.lastUpdate;
    this.lastUpdate = now;
    
    const fps = 1000 / delta;
    
    // Add to FPS values array
    this.fpsValues.push(fps);
    
    // Keep only last 10 values
    if (this.fpsValues.length > 10) {
      this.fpsValues.shift();
    }
    
    // Calculate average FPS
    const averageFps = this.fpsValues.reduce((sum, value) => sum + value, 0) / this.fpsValues.length;
    
    // Update quality level if adaptive quality is enabled
    if (this.settings.adaptiveQuality) {
      this.updateQualityLevel(averageFps);
    }
    
    // Update FPS counter text if it exists
    if (this.fpsText) {
      this.fpsText.setText(`FPS: ${Math.round(averageFps)}`);
    }
  }
  
  // Update quality level based on FPS
  updateQualityLevel(fps) {
    let newQualityLevel = this.currentQualityLevel;
    
    // Determine new quality level
    if (fps < this.settings.lowFpsThreshold) {
      newQualityLevel = 'low';
    } else if (fps < this.settings.mediumFpsThreshold) {
      newQualityLevel = 'medium';
    } else if (fps < this.settings.highFpsThreshold) {
      newQualityLevel = 'medium-high';
    } else {
      newQualityLevel = 'high';
    }
    
    // Apply new quality level if changed
    if (newQualityLevel !== this.currentQualityLevel) {
      this.currentQualityLevel = newQualityLevel;
      this.applyQualityLevel(newQualityLevel);
    }
  }
  
  // Apply quality level settings
  applyQualityLevel(level) {
    switch (level) {
      case 'low':
        this.settings.maxParticles = 20;
        this.settings.maxEnemies = 20;
        this.settings.cullDistance = 500;
        this.disableParticleEffects();
        this.disableShadows();
        this.disableOutlines();
        break;
      case 'medium':
        this.settings.maxParticles = 50;
        this.settings.maxEnemies = 30;
        this.settings.cullDistance = 600;
        this.enableParticleEffects(0.5);
        this.enableShadows();
        this.disableOutlines();
        break;
      case 'medium-high':
        this.settings.maxParticles = 75;
        this.settings.maxEnemies = 40;
        this.settings.cullDistance = 700;
        this.enableParticleEffects(0.75);
        this.enableShadows();
        this.enableOutlines();
        break;
      case 'high':
      default:
        this.settings.maxParticles = 100;
        this.settings.maxEnemies = 50;
        this.settings.cullDistance = 800;
        this.enableParticleEffects(1);
        this.enableShadows();
        this.enableOutlines();
        break;
    }
    
    // Apply enemy limit
    this.limitEnemies();
  }
  
  // Enable/disable particle effects
  enableParticleEffects(intensity = 1) {
    if (this.scene.visualSystem) {
      // Set particle emitter quantities
      this.scene.visualSystem.damageEmitter.setQuantity(Math.floor(8 * intensity));
      this.scene.visualSystem.healEmitter.setQuantity(Math.floor(10 * intensity));
      this.scene.visualSystem.levelUpEmitter.setQuantity(Math.floor(30 * intensity));
      this.scene.visualSystem.deathEmitter.setQuantity(Math.floor(20 * intensity));
      this.scene.visualSystem.skillEmitter.setQuantity(Math.floor(15 * intensity));
    }
  }
  
  disableParticleEffects() {
    if (this.scene.visualSystem) {
      // Set particle emitter quantities to minimum
      this.scene.visualSystem.damageEmitter.setQuantity(3);
      this.scene.visualSystem.healEmitter.setQuantity(3);
      this.scene.visualSystem.levelUpEmitter.setQuantity(5);
      this.scene.visualSystem.deathEmitter.setQuantity(5);
      this.scene.visualSystem.skillEmitter.setQuantity(3);
    }
  }
  
  // Enable/disable shadows
  enableShadows() {
    // Enable shadows for player
    if (this.scene.player && !this.scene.player.shadow) {
      this.scene.visualSystem.createShadowEffect(this.scene.player);
    } else if (this.scene.player && this.scene.player.shadow) {
      this.scene.player.shadow.setVisible(true);
    }
    
    // Enable shadows for enemies
    this.scene.enemies.getChildren().forEach(enemy => {
      if (!enemy.shadow) {
        this.scene.visualSystem.createShadowEffect(enemy);
      } else {
        enemy.shadow.setVisible(true);
      }
    });
  }
  
  disableShadows() {
    // Disable shadow for player
    if (this.scene.player && this.scene.player.shadow) {
      this.scene.player.shadow.setVisible(false);
    }
    
    // Disable shadows for enemies
    this.scene.enemies.getChildren().forEach(enemy => {
      if (enemy.shadow) {
        enemy.shadow.setVisible(false);
      }
    });
  }
  
  // Enable/disable outlines
  enableOutlines() {
    // Enable outline for player
    if (this.scene.player && this.scene.player.outline) {
      this.scene.player.outline.setVisible(true);
    }
    
    // Enable outlines for enemies
    this.scene.enemies.getChildren().forEach(enemy => {
      if (enemy.outline) {
        enemy.outline.setVisible(true);
      }
    });
    
    // Enable outlines for skill effects
    this.scene.skillEffects.getChildren().forEach(effect => {
      if (effect.outline) {
        effect.outline.setVisible(true);
      }
    });
  }
  
  disableOutlines() {
    // Disable outline for player
    if (this.scene.player && this.scene.player.outline) {
      this.scene.player.outline.setVisible(false);
    }
    
    // Disable outlines for enemies
    this.scene.enemies.getChildren().forEach(enemy => {
      if (enemy.outline) {
        enemy.outline.setVisible(false);
      }
    });
    
    // Disable outlines for skill effects
    this.scene.skillEffects.getChildren().forEach(effect => {
      if (effect.outline) {
        effect.outline.setVisible(false);
      }
    });
  }
  
  // Limit number of enemies
  limitEnemies() {
    const enemies = this.scene.enemies.getChildren();
    
    if (enemies.length > this.settings.maxEnemies) {
      // Sort enemies by distance to player
      const sortedEnemies = [...enemies].sort((a, b) => {
        const distA = Phaser.Math.Distance.Between(
          this.scene.player.x, this.scene.player.y,
          a.x, a.y
        );
        
        const distB = Phaser.Math.Distance.Between(
          this.scene.player.x, this.scene.player.y,
          b.x, b.y
        );
        
        return distA - distB;
      });
      
      // Keep only maxEnemies closest enemies
      for (let i = this.settings.maxEnemies; i < sortedEnemies.length; i++) {
        sortedEnemies[i].destroy();
      }
    }
  }
  
  // Cull distant objects
  cullDistantObjects() {
    // Cull distant enemies
    this.scene.enemies.getChildren().forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.scene.player.x, this.scene.player.y,
        enemy.x, enemy.y
      );
      
      if (distance > this.settings.cullDistance) {
        enemy.setVisible(false);
        
        // Also hide health bar and outline
        if (enemy.healthBarBg) enemy.healthBarBg.setVisible(false);
        if (enemy.healthBar) enemy.healthBar.setVisible(false);
        if (enemy.outline) enemy.outline.setVisible(false);
        if (enemy.shadow) enemy.shadow.setVisible(false);
      } else {
        enemy.setVisible(true);
        
        // Show health bar and outline
        if (enemy.healthBarBg) enemy.healthBarBg.setVisible(true);
        if (enemy.healthBar) enemy.healthBar.setVisible(true);
        if (enemy.outline && this.currentQualityLevel !== 'low' && this.currentQualityLevel !== 'medium') {
          enemy.outline.setVisible(true);
        }
        if (enemy.shadow && this.currentQualityLevel !== 'low') {
          enemy.shadow.setVisible(true);
        }
      }
    });
    
    // Cull distant experience orbs
    this.scene.expOrbs.getChildren().forEach(orb => {
      const distance = Phaser.Math.Distance.Between(
        this.scene.player.x, this.scene.player.y,
        orb.x, orb.y
      );
      
      if (distance > this.settings.cullDistance) {
        orb.setVisible(false);
        if (orb.outline) orb.outline.setVisible(false);
      } else {
        orb.setVisible(true);
        if (orb.outline && this.currentQualityLevel !== 'low' && this.currentQualityLevel !== 'medium') {
          orb.outline.setVisible(true);
        }
      }
    });
  }
  
  // Show FPS counter
  showFpsCounter() {
    if (!this.fpsText) {
      this.fpsText = this.scene.add.text(
        10, this.scene.cameras.main.height - 30,
        'FPS: 0',
        {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 2
        }
      );
      this.fpsText.setDepth(1000);
      this.fpsText.setScrollFactor(0);
    }
  }
  
  // Hide FPS counter
  hideFpsCounter() {
    if (this.fpsText) {
      this.fpsText.destroy();
      this.fpsText = null;
    }
  }
  
  // Toggle FPS counter
  toggleFpsCounter() {
    if (this.fpsText) {
      this.hideFpsCounter();
    } else {
      this.showFpsCounter();
    }
  }
  
  // Toggle adaptive quality
  toggleAdaptiveQuality() {
    this.settings.adaptiveQuality = !this.settings.adaptiveQuality;
    
    // Show notification
    const text = this.settings.adaptiveQuality ? 'Adaptive Quality: ON' : 'Adaptive Quality: OFF';
    
    const notification = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 4,
      text,
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    notification.setOrigin(0.5);
    notification.setDepth(1000);
    notification.setScrollFactor(0);
    
    // Fade out notification
    this.scene.tweens.add({
      targets: notification,
      alpha: 0,
      y: notification.y - 50,
      duration: 2000,
      onComplete: () => {
        notification.destroy();
      }
    });
  }
  
  // Set quality level manually
  setQualityLevel(level) {
    if (['low', 'medium', 'medium-high', 'high'].includes(level)) {
      this.currentQualityLevel = level;
      this.applyQualityLevel(level);
      
      // Show notification
      const notification = this.scene.add.text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 4,
        `Quality: ${level.toUpperCase()}`,
        {
          fontFamily: 'Arial',
          fontSize: '24px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 3
        }
      );
      notification.setOrigin(0.5);
      notification.setDepth(1000);
      notification.setScrollFactor(0);
      
      // Fade out notification
      this.scene.tweens.add({
        targets: notification,
        alpha: 0,
        y: notification.y - 50,
        duration: 2000,
        onComplete: () => {
          notification.destroy();
        }
      });
    }
  }
  
  // Create quality settings UI
  createQualitySettingsUI() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Create settings container
    this.settingsContainer = this.scene.add.container(0, 0);
    this.settingsContainer.setDepth(1000);
    this.settingsContainer.setScrollFactor(0);
    this.settingsContainer.setVisible(false);
    
    // Background
    this.settingsBg = this.scene.add.rectangle(
      width / 2, height / 2,
      300, 400,
      0x000000,
      0.8
    );
    this.settingsBg.setOrigin(0.5);
    
    // Title
    this.settingsTitle = this.scene.add.text(
      width / 2, height / 2 - 170,
      'QUALITY SETTINGS',
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    this.settingsTitle.setOrigin(0.5);
    
    // Quality buttons
    const qualityLevels = ['low', 'medium', 'medium-high', 'high'];
    const qualityButtons = [];
    
    qualityLevels.forEach((level, index) => {
      const button = this.scene.add.rectangle(
        width / 2, height / 2 - 100 + index * 60,
        200, 40,
        0x333333
      );
      button.setOrigin(0.5);
      button.setInteractive();
      
      const text = this.scene.add.text(
        width / 2, height / 2 - 100 + index * 60,
        level.toUpperCase(),
        {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#ffffff'
        }
      );
      text.setOrigin(0.5);
      
      // Highlight current quality level
      if (level === this.currentQualityLevel) {
        button.setFillStyle(0x00aa00);
      }
      
      // Button hover effects
      button.on('pointerover', () => {
        if (level !== this.currentQualityLevel) {
          button.setFillStyle(0x555555);
        }
      });
      
      button.on('pointerout', () => {
        if (level !== this.currentQualityLevel) {
          button.setFillStyle(0x333333);
        }
      });
      
      // Button click handler
      button.on('pointerdown', () => {
        // Set quality level
        this.setQualityLevel(level);
        
        // Update button colors
        qualityButtons.forEach((btn, i) => {
          if (qualityLevels[i] === level) {
            btn.button.setFillStyle(0x00aa00);
          } else {
            btn.button.setFillStyle(0x333333);
          }
        });
      });
      
      qualityButtons.push({ button, text });
      this.settingsContainer.add([button, text]);
    });
    
    // Adaptive quality toggle
    const adaptiveButton = this.scene.add.rectangle(
      width / 2, height / 2 + 100,
      200, 40,
      this.settings.adaptiveQuality ? 0x00aa00 : 0x333333
    );
    adaptiveButton.setOrigin(0.5);
    adaptiveButton.setInteractive();
    
    const adaptiveText = this.scene.add.text(
      width / 2, height / 2 + 100,
      'ADAPTIVE QUALITY',
      {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff'
      }
    );
    adaptiveText.setOrigin(0.5);
    
    // Button hover effects
    adaptiveButton.on('pointerover', () => {
      if (!this.settings.adaptiveQuality) {
        adaptiveButton.setFillStyle(0x555555);
      }
    });
    
    adaptiveButton.on('pointerout', () => {
      if (!this.settings.adaptiveQuality) {
        adaptiveButton.setFillStyle(0x333333);
      }
    });
    
    // Button click handler
    adaptiveButton.on('pointerdown', () => {
      this.toggleAdaptiveQuality();
      adaptiveButton.setFillStyle(this.settings.adaptiveQuality ? 0x00aa00 : 0x333333);
    });
    
    // Close button
    const closeButton = this.scene.add.rectangle(
      width / 2, height / 2 + 160,
      200, 40,
      0xaa0000
    );
    closeButton.setOrigin(0.5);
    closeButton.setInteractive();
    
    const closeText = this.scene.add.text(
      width / 2, height / 2 + 160,
      'CLOSE',
      {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff'
      }
    );
    closeText.setOrigin(0.5);
    
    // Button hover effects
    closeButton.on('pointerover', () => {
      closeButton.setFillStyle(0xcc0000);
    });
    
    closeButton.on('pointerout', () => {
      closeButton.setFillStyle(0xaa0000);
    });
    
    // Button click handler
    closeButton.on('pointerdown', () => {
      this.hideQualitySettingsUI();
    });
    
    // Add elements to container
    this.settingsContainer.add([
      this.settingsBg,
      this.settingsTitle,
      adaptiveButton,
      adaptiveText,
      closeButton,
      closeText
    ]);
  }
  
  // Show quality settings UI
  showQualitySettingsUI() {
    if (!this.settingsContainer) {
      this.createQualitySettingsUI();
    }
    
    this.settingsContainer.setVisible(true);
    
    // Pause game
    this.scene.physics.pause();
  }
  
  // Hide quality settings UI
  hideQualitySettingsUI() {
    if (this.settingsContainer) {
      this.settingsContainer.setVisible(false);
      
      // Resume game
      this.scene.physics.resume();
    }
  }
  
  // Toggle quality settings UI
  toggleQualitySettingsUI() {
    if (!this.settingsContainer) {
      this.createQualitySettingsUI();
      this.settingsContainer.setVisible(true);
      this.scene.physics.pause();
    } else if (this.settingsContainer.visible) {
      this.settingsContainer.setVisible(false);
      this.scene.physics.resume();
    } else {
      this.settingsContainer.setVisible(true);
      this.scene.physics.pause();
    }
  }
  
  // Create debug UI
  createDebugUI() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Create debug container
    this.debugContainer = this.scene.add.container(0, 0);
    this.debugContainer.setDepth(1000);
    this.debugContainer.setScrollFactor(0);
    this.debugContainer.setVisible(false);
    
    // Background
    this.debugBg = this.scene.add.rectangle(
      width - 150, height / 2,
      300, height,
      0x000000,
      0.7
    );
    this.debugBg.setOrigin(0.5);
    
    // Title
    this.debugTitle = this.scene.add.text(
      width - 150, 20,
      'DEBUG INFO',
      {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    this.debugTitle.setOrigin(0.5, 0);
    
    // FPS counter
    this.debugFpsText = this.scene.add.text(
      width - 290, 60,
      'FPS: 0',
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff'
      }
    );
    this.debugFpsText.setOrigin(0, 0);
    
    // Quality level
    this.debugQualityText = this.scene.add.text(
      width - 290, 90,
      `Quality: ${this.currentQualityLevel.toUpperCase()}`,
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff'
      }
    );
    this.debugQualityText.setOrigin(0, 0);
    
    // Adaptive quality
    this.debugAdaptiveText = this.scene.add.text(
      width - 290, 120,
      `Adaptive: ${this.settings.adaptiveQuality ? 'ON' : 'OFF'}`,
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff'
      }
    );
    this.debugAdaptiveText.setOrigin(0, 0);
    
    // Enemy count
    this.debugEnemyText = this.scene.add.text(
      width - 290, 150,
      `Enemies: 0/${this.settings.maxEnemies}`,
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff'
      }
    );
    this.debugEnemyText.setOrigin(0, 0);
    
    // Particle count
    this.debugParticleText = this.scene.add.text(
      width - 290, 180,
      `Particles: 0/${this.settings.maxParticles}`,
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff'
      }
    );
    this.debugParticleText.setOrigin(0, 0);
    
    // Player position
    this.debugPlayerPosText = this.scene.add.text(
      width - 290, 210,
      'Player: (0, 0)',
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff'
      }
    );
    this.debugPlayerPosText.setOrigin(0, 0);
    
    // Memory usage
    this.debugMemoryText = this.scene.add.text(
      width - 290, 240,
      'Memory: 0 MB',
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff'
      }
    );
    this.debugMemoryText.setOrigin(0, 0);
    
    // Add elements to container
    this.debugContainer.add([
      this.debugBg,
      this.debugTitle,
      this.debugFpsText,
      this.debugQualityText,
      this.debugAdaptiveText,
      this.debugEnemyText,
      this.debugParticleText,
      this.debugPlayerPosText,
      this.debugMemoryText
    ]);
  }
  
  // Update debug UI
  updateDebugUI() {
    if (this.debugContainer && this.debugContainer.visible) {
      // Update FPS
      const averageFps = this.fpsValues.reduce((sum, value) => sum + value, 0) / this.fpsValues.length;
      this.debugFpsText.setText(`FPS: ${Math.round(averageFps)}`);
      
      // Update quality level
      this.debugQualityText.setText(`Quality: ${this.currentQualityLevel.toUpperCase()}`);
      
      // Update adaptive quality
      this.debugAdaptiveText.setText(`Adaptive: ${this.settings.adaptiveQuality ? 'ON' : 'OFF'}`);
      
      // Update enemy count
      const enemyCount = this.scene.enemies ? this.scene.enemies.getChildren().length : 0;
      this.debugEnemyText.setText(`Enemies: ${enemyCount}/${this.settings.maxEnemies}`);
      
      // Update particle count
      const particleCount = this.scene.visualSystem ? 
        this.scene.visualSystem.damageParticles.getParticleCount() +
        this.scene.visualSystem.healParticles.getParticleCount() +
        this.scene.visualSystem.levelUpParticles.getParticleCount() +
        this.scene.visualSystem.deathParticles.getParticleCount() +
        this.scene.visualSystem.skillParticles.getParticleCount() : 0;
      this.debugParticleText.setText(`Particles: ${particleCount}/${this.settings.maxParticles}`);
      
      // Update player position
      if (this.scene.player) {
        this.debugPlayerPosText.setText(`Player: (${Math.round(this.scene.player.x)}, ${Math.round(this.scene.player.y)})`);
      }
      
      // Update memory usage
      if (window.performance && window.performance.memory) {
        const memoryUsage = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
        this.debugMemoryText.setText(`Memory: ${memoryUsage} MB`);
      }
    }
  }
  
  // Show debug UI
  showDebugUI() {
    if (!this.debugContainer) {
      this.createDebugUI();
    }
    
    this.debugContainer.setVisible(true);
  }
  
  // Hide debug UI
  hideDebugUI() {
    if (this.debugContainer) {
      this.debugContainer.setVisible(false);
    }
  }
  
  // Toggle debug UI
  toggleDebugUI() {
    if (!this.debugContainer) {
      this.createDebugUI();
      this.debugContainer.setVisible(true);
    } else {
      this.debugContainer.setVisible(!this.debugContainer.visible);
    }
  }
  
  // Optimize textures
  optimizeTextures() {
    // Set texture filter to NEAREST for pixel-perfect rendering
    this.scene.textures.list.forEach(texture => {
      texture.setFilter(Phaser.Textures.NEAREST);
    });
  }
  
  // Optimize physics
  optimizePhysics() {
    // Set physics world bounds to match camera bounds
    this.scene.physics.world.setBounds(
      0, 0,
      this.scene.cameras.main.width * 2,
      this.scene.cameras.main.height * 2
    );
    
    // Set physics world gravity to zero
    this.scene.physics.world.setGravity(0, 0);
    
    // Disable physics for off-screen objects
    this.scene.physics.world.on('worldbounds', (body) => {
      body.gameObject.setActive(false);
    });
  }
  
  // Optimize camera
  optimizeCamera() {
    // Set camera bounds
    this.scene.cameras.main.setBounds(
      0, 0,
      this.scene.physics.world.bounds.width,
      this.scene.physics.world.bounds.height
    );
    
    // Set camera dead zone
    this.scene.cameras.main.setDeadzone(
      this.scene.cameras.main.width / 4,
      this.scene.cameras.main.height / 4
    );
    
    // Set camera lerp
    this.scene.cameras.main.setLerp(0.1, 0.1);
  }
  
  // Optimize audio
  optimizeAudio() {
    // Limit number of sounds playing simultaneously
    this.scene.sound.setVolume(0.7);
    
    // Disable audio for mobile devices with low memory
    if (this.scene.sys.game.device.os.android || this.scene.sys.game.device.os.iOS) {
      const memory = window.performance && window.performance.memory ? 
        window.performance.memory.jsHeapSizeLimit : 0;
      
      if (memory < 200000000) { // Less than 200MB
        this.scene.sound.setMute(true);
      }
    }
  }
  
  // Apply all optimizations
  applyAllOptimizations() {
    this.optimizeTextures();
    this.optimizePhysics();
    this.optimizeCamera();
    this.optimizeAudio();
  }
  
  // Update method to be called in scene's update
  update() {
    // Update FPS counter
    this.updateFpsCounter();
    
    // Update debug UI
    this.updateDebugUI();
    
    // Limit enemies
    this.limitEnemies();
    
    // Cull distant objects
    this.cullDistantObjects();
  }
}

export default WebOptimizer;

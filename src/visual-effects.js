// Visual effects and animations for Survivor.io style game
class VisualEffects {
  constructor(scene) {
    this.scene = scene;
    this.particleEmitters = [];
    this.initializeParticles();
  }

  // Initialize particle systems
  initializeParticles() {
    // Create particle emitter for player trail
    this.playerTrail = this.scene.add.particles(0, 0, 'exp-orb', {
      scale: { start: 0.5, end: 0.1 },
      alpha: { start: 0.5, end: 0 },
      speed: 20,
      lifespan: 500,
      blendMode: 'ADD',
      frequency: 100
    });
    this.playerTrail.setDepth(8);
    this.particleEmitters.push(this.playerTrail);
    
    // Create particle emitter for enemy death
    this.enemyDeath = this.scene.add.particles(0, 0, 'exp-orb', {
      scale: { start: 0.8, end: 0.1 },
      alpha: { start: 0.8, end: 0 },
      speed: { min: 50, max: 100 },
      angle: { min: 0, max: 360 },
      lifespan: 800,
      blendMode: 'ADD',
      frequency: -1 // Explode mode
    });
    this.enemyDeath.setDepth(8);
    this.particleEmitters.push(this.enemyDeath);
    
    // Create particle emitter for skill effects
    this.skillEffect = this.scene.add.particles(0, 0, 'exp-orb', {
      scale: { start: 0.3, end: 0.1 },
      alpha: { start: 0.6, end: 0 },
      speed: { min: 30, max: 60 },
      angle: { min: 0, max: 360 },
      lifespan: 600,
      blendMode: 'ADD',
      frequency: -1 // Explode mode
    });
    this.skillEffect.setDepth(8);
    this.particleEmitters.push(this.skillEffect);
  }

  // Update method to be called in scene's update
  update() {
    // Update player trail to follow player
    if (this.scene.player && this.playerTrail) {
      this.playerTrail.setPosition(this.scene.player.x, this.scene.player.y);
    }
  }

  // Play enemy death effect
  playEnemyDeathEffect(x, y, color = 0xff0000) {
    // Set particle color
    this.enemyDeath.setTint(color);
    
    // Emit particles at position
    this.enemyDeath.explode(20, x, y);
    
    // Create flash effect
    const flash = this.scene.add.circle(x, y, 30, color, 0.7);
    flash.setDepth(7);
    
    // Animate flash
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => {
        flash.destroy();
      }
    });
  }

  // Play skill activation effect
  playSkillEffect(x, y, color = 0x00ffff) {
    // Set particle color
    this.skillEffect.setTint(color);
    
    // Emit particles at position
    this.skillEffect.explode(15, x, y);
    
    // Create ring effect
    const ring = this.scene.add.circle(x, y, 20, color, 0);
    ring.setStrokeStyle(3, color, 0.8);
    ring.setDepth(7);
    
    // Animate ring
    this.scene.tweens.add({
      targets: ring,
      scale: 3,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        ring.destroy();
      }
    });
  }

  // Play level up effect
  playLevelUpEffect(x, y) {
    // Create particles
    const particles = this.scene.add.particles(0, 0, 'exp-orb', {
      scale: { start: 0.5, end: 0.1 },
      alpha: { start: 0.8, end: 0 },
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      lifespan: 1000,
      blendMode: 'ADD',
      frequency: -1 // Explode mode
    });
    particles.setDepth(15);
    particles.setTint(0xffff00);
    
    // Emit particles
    particles.explode(30, x, y);
    
    // Create ring effect
    const ring = this.scene.add.circle(x, y, 30, 0xffff00, 0);
    ring.setStrokeStyle(4, 0xffff00, 0.9);
    ring.setDepth(15);
    
    // Animate ring
    this.scene.tweens.add({
      targets: ring,
      scale: 5,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        ring.destroy();
      }
    });
    
    // Create shine effect
    const shine = this.scene.add.star(x, y, 5, 10, 30, 0xffff00, 0.9);
    shine.setDepth(15);
    
    // Animate shine
    this.scene.tweens.add({
      targets: shine,
      scale: 3,
      angle: 90,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        shine.destroy();
        particles.destroy();
      }
    });
  }

  // Play evolution effect
  playEvolutionEffect(x, y, color = 0x9c27b0) {
    // Create particles
    const particles = this.scene.add.particles(0, 0, 'exp-orb', {
      scale: { start: 0.6, end: 0.1 },
      alpha: { start: 0.8, end: 0 },
      speed: { min: 80, max: 200 },
      angle: { min: 0, max: 360 },
      lifespan: 1500,
      blendMode: 'ADD',
      frequency: -1 // Explode mode
    });
    particles.setDepth(15);
    particles.setTint(color);
    
    // Emit particles
    particles.explode(50, x, y);
    
    // Create multiple rings
    for (let i = 0; i < 3; i++) {
      const ring = this.scene.add.circle(x, y, 30 + (i * 20), color, 0);
      ring.setStrokeStyle(4, color, 0.9);
      ring.setDepth(15);
      
      // Animate ring with delay
      this.scene.tweens.add({
        targets: ring,
        scale: 5,
        alpha: 0,
        delay: i * 200,
        duration: 1000,
        onComplete: () => {
          ring.destroy();
        }
      });
    }
    
    // Create shockwave effect
    const shockwave = this.scene.add.circle(x, y, 10, color, 0.7);
    shockwave.setDepth(15);
    
    // Animate shockwave
    this.scene.tweens.add({
      targets: shockwave,
      scale: 15,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        shockwave.destroy();
        particles.destroy();
      }
    });
  }

  // Play hit effect
  playHitEffect(x, y, color = 0xffffff) {
    // Create hit effect
    const hit = this.scene.add.star(x, y, 4, 5, 15, color, 0.8);
    hit.setDepth(9);
    
    // Animate hit
    this.scene.tweens.add({
      targets: hit,
      scale: 2,
      angle: 45,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        hit.destroy();
      }
    });
  }

  // Add toony outline to sprite
  addOutline(sprite, color = 0x000000, thickness = 2) {
    // Create outline effect using a pipeline
    if (this.scene.game.renderer.pipelines) {
      sprite.setPipeline('OutlinePipeline');
      sprite.pipeline.setOutlineColor(color);
      sprite.pipeline.setOutlineThickness(thickness);
    }
  }

  // Add floating text
  addFloatingText(x, y, text, style = {}, duration = 1000) {
    // Default style
    const defaultStyle = {
      font: 'bold 16px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    };
    
    // Create text
    const floatingText = this.scene.add.text(
      x, 
      y, 
      text, 
      { ...defaultStyle, ...style }
    );
    floatingText.setOrigin(0.5);
    floatingText.setDepth(20);
    
    // Animate text
    this.scene.tweens.add({
      targets: floatingText,
      y: y - 50,
      alpha: 0,
      duration: duration,
      onComplete: () => {
        floatingText.destroy();
      }
    });
    
    return floatingText;
  }

  // Add damage number
  addDamageNumber(x, y, amount, isCritical = false) {
    // Style based on critical hit
    const style = isCritical 
      ? { font: 'bold 24px Arial', fill: '#ff0000' }
      : { font: 'bold 16px Arial', fill: '#ffffff' };
    
    // Create text with random offset
    const offsetX = Phaser.Math.Between(-20, 20);
    const text = this.addFloatingText(
      x + offsetX, 
      y, 
      amount.toString(), 
      style
    );
    
    // Add extra animation for critical hits
    if (isCritical) {
      this.scene.tweens.add({
        targets: text,
        scale: 1.5,
        duration: 200,
        yoyo: true
      });
    }
  }

  // Clean up all effects
  destroy() {
    // Destroy all particle emitters
    this.particleEmitters.forEach(emitter => {
      emitter.destroy();
    });
    this.particleEmitters = [];
  }
}

// Custom outline pipeline for toony effect
class OutlinePipeline extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {
  constructor(game) {
    super({
      game: game,
      renderer: game.renderer,
      fragShader: `
        precision mediump float;
        uniform sampler2D uMainSampler;
        uniform vec2 uResolution;
        uniform vec3 outlineColor;
        uniform float outlineThickness;
        varying vec2 outTexCoord;
        void main() {
          vec4 texel = texture2D(uMainSampler, outTexCoord);
          vec2 onePixel = vec2(outlineThickness) / uResolution;
          
          vec4 up = texture2D(uMainSampler, outTexCoord + vec2(0, -onePixel.y));
          vec4 right = texture2D(uMainSampler, outTexCoord + vec2(onePixel.x, 0));
          vec4 down = texture2D(uMainSampler, outTexCoord + vec2(0, onePixel.y));
          vec4 left = texture2D(uMainSampler, outTexCoord + vec2(-onePixel.x, 0));
          
          float outline = (1.0 - up.a) * (1.0 - right.a) * (1.0 - down.a) * (1.0 - left.a);
          
          if (texel.a < 0.1 && outline > 0.0) {
            gl_FragColor = vec4(outlineColor, 1.0);
          } else {
            gl_FragColor = texel;
          }
        }
      `
    });
    
    this.outlineColor = { r: 0, g: 0, b: 0 };
    this.outlineThickness = 2;
  }

  onPreRender() {
    this.set1f('outlineThickness', this.outlineThickness);
    this.set3f('outlineColor', this.outlineColor.r, this.outlineColor.g, this.outlineColor.b);
    this.set2f('uResolution', this.renderer.width, this.renderer.height);
  }

  setOutlineColor(color) {
    const rgb = Phaser.Display.Color.IntegerToRGB(color);
    this.outlineColor.r = rgb.r / 255;
    this.outlineColor.g = rgb.g / 255;
    this.outlineColor.b = rgb.b / 255;
  }

  setOutlineThickness(thickness) {
    this.outlineThickness = thickness;
  }
}

export { VisualEffects, OutlinePipeline };

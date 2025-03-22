// Enhanced character system for Survivor.io style game
class CharacterSystem {
  constructor(scene) {
    this.scene = scene;
    this.characters = [
      {
        name: 'Default',
        key: 'player',
        health: 100,
        speed: 200,
        description: 'Balanced character with no weaknesses',
        specialAbility: 'None',
        startingWeapon: 'Lightchaser'
      },
      {
        name: 'Tank',
        key: 'tank',
        health: 150,
        speed: 170,
        description: 'High health but slower movement',
        specialAbility: 'Damage Reduction',
        startingWeapon: 'Baseball Bat'
      },
      {
        name: 'Ranger',
        key: 'ranger',
        health: 80,
        speed: 220,
        description: 'Fast movement with longer attack range',
        specialAbility: 'Extended Range',
        startingWeapon: 'Shotgun'
      },
      {
        name: 'Mage',
        key: 'mage',
        health: 70,
        speed: 190,
        description: 'Low health but powerful area attacks',
        specialAbility: 'Area Damage',
        startingWeapon: 'Void Power'
      },
      {
        name: 'Assassin',
        key: 'assassin',
        health: 60,
        speed: 250,
        description: 'Very fast with high critical hit chance',
        specialAbility: 'Critical Hits',
        startingWeapon: 'Revolver'
      },
      {
        name: 'Cosmic',
        key: 'cosmic',
        health: 90,
        speed: 210,
        description: 'Balanced character with cosmic powers',
        specialAbility: 'Experience Boost',
        startingWeapon: 'Starforged Havoc'
      }
    ];
    
    // Character progression levels
    this.characterLevels = {
      'Default': 1,
      'Tank': 1,
      'Ranger': 1,
      'Mage': 1,
      'Assassin': 1,
      'Cosmic': 1
    };
    
    // Character special ability effects
    this.specialAbilities = {
      'None': () => {},
      'Damage Reduction': (damage) => damage * 0.7,
      'Extended Range': (range) => range * 1.3,
      'Area Damage': (damage, isAreaAttack) => isAreaAttack ? damage * 1.4 : damage,
      'Critical Hits': (damage) => Math.random() < 0.3 ? damage * 2 : damage,
      'Experience Boost': (exp) => exp * 1.5
    };
  }
  
  // Initialize character
  initializeCharacter(characterName) {
    const character = this.characters.find(c => c.name === characterName) || this.characters[0];
    
    // Apply character level bonuses
    const level = this.characterLevels[character.name];
    const levelBonus = 1 + (level - 1) * 0.1; // 10% increase per level
    
    return {
      ...character,
      health: character.health * levelBonus,
      maxHealth: character.health * levelBonus,
      speed: character.speed * levelBonus
    };
  }
  
  // Apply special ability effect
  applySpecialAbility(character, type, value, extraParam = null) {
    const abilityFunction = this.specialAbilities[character.specialAbility];
    if (abilityFunction) {
      switch (type) {
        case 'damage':
          return abilityFunction(value, extraParam);
        case 'range':
          return abilityFunction(value);
        case 'experience':
          return abilityFunction(value);
        default:
          return value;
      }
    }
    return value;
  }
  
  // Level up character (permanent progression)
  levelUpCharacter(characterName) {
    if (this.characterLevels[characterName]) {
      this.characterLevels[characterName]++;
      return this.characterLevels[characterName];
    }
    return 1;
  }
  
  // Get character level
  getCharacterLevel(characterName) {
    return this.characterLevels[characterName] || 1;
  }
  
  // Create character selection UI
  createCharacterSelectionUI(callback) {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Background
    const bg = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    bg.setOrigin(0);
    bg.setDepth(100);
    
    // Title
    const title = this.scene.add.text(width / 2, 50, 'SELECT CHARACTER', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff'
    });
    title.setOrigin(0.5);
    title.setDepth(101);
    
    // Character cards
    const cardWidth = 200;
    const cardHeight = 300;
    const padding = 20;
    const startX = (width - (cardWidth * 3 + padding * 2)) / 2;
    const startY = 120;
    
    const characterCards = [];
    
    this.characters.forEach((character, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      
      const x = startX + col * (cardWidth + padding);
      const y = startY + row * (cardHeight + padding);
      
      // Card background
      const card = this.scene.add.rectangle(x, y, cardWidth, cardHeight, 0x333333);
      card.setOrigin(0);
      card.setDepth(101);
      card.setInteractive();
      
      // Character name
      const nameText = this.scene.add.text(x + cardWidth / 2, y + 20, character.name, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff'
      });
      nameText.setOrigin(0.5, 0);
      nameText.setDepth(102);
      
      // Character image
      const image = this.scene.add.sprite(x + cardWidth / 2, y + 100, character.key);
      image.setDepth(102);
      
      // Character stats
      const statsText = this.scene.add.text(x + 10, y + 160, 
        `Health: ${character.health}\nSpeed: ${character.speed}\nLevel: ${this.characterLevels[character.name]}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff'
      });
      statsText.setDepth(102);
      
      // Character description
      const descText = this.scene.add.text(x + 10, y + 220, character.description, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffffff',
        wordWrap: { width: cardWidth - 20 }
      });
      descText.setDepth(102);
      
      // Special ability
      const abilityText = this.scene.add.text(x + 10, y + 260, `Ability: ${character.specialAbility}`, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffff00'
      });
      abilityText.setDepth(102);
      
      // Click handler
      card.on('pointerdown', () => {
        // Call callback with selected character
        if (callback) {
          callback(character.name);
        }
        
        // Remove all UI elements
        characterCards.forEach(elements => {
          elements.forEach(element => {
            element.destroy();
          });
        });
        
        title.destroy();
        bg.destroy();
      });
      
      // Hover effects
      card.on('pointerover', () => {
        card.setFillStyle(0x555555);
      });
      
      card.on('pointerout', () => {
        card.setFillStyle(0x333333);
      });
      
      // Add all elements to array for later cleanup
      characterCards.push([card, nameText, image, statsText, descText, abilityText]);
    });
    
    return characterCards;
  }
}

export default CharacterSystem;

# Survivor.io Style Web Game

A simple web survival game with toony graphics inspired by Survivor.io. This game features top-down gameplay, wave-based enemy spawning, auto-attacking mechanics, and an evolution system.

## Features

- Top-down gameplay with virtual joystick controls
- Multiple character types with unique abilities
- Various weapons with different attack patterns
- Item drops including experience orbs, health, chests, and equipment
- Wave-based enemy spawning with boss encounters
- Skill evolution system
- Toony graphics style

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js (for development)

### Installation

1. Clone the repository
```
git clone https://github.com/russellfife/survivor-io-game.git
```

2. Navigate to the project directory
```
cd survivor-io-game
```

3. Install dependencies
```
npm install
```

4. Start the development server
```
npm start
```

5. Open your browser and navigate to `http://localhost:8000`

## Game Controls

- Move: Virtual joystick (mobile) or arrow keys (desktop)
- Skills: Automatically activate when cooldown is complete
- Collect items: Move over them

## Development

This game is built using:
- Phaser 3 game framework
- JavaScript ES6
- HTML5 Canvas

## Project Structure

- `assets/` - Game assets (images, audio)
- `src/` - Source code
  - `weapon-system.js` - Weapon mechanics
  - `character-system.js` - Character selection and abilities
  - `item-drop-system.js` - Item drops and collection
  - `evolution-system.js` - Skill evolution mechanics
  - `wave-system.js` - Enemy wave spawning
  - `experience-system.js` - Leveling system
  - `visual-effects.js` - Visual enhancements
  - `animation-system.js` - Animation handling
  - `styled-game.js` - Main game implementation
- `index.html` - Main HTML file

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Survivor.io mobile game
- Built with Phaser 3 game framework
